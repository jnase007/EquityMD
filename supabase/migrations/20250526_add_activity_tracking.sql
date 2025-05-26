-- Activity tracking tables for admin dashboard

-- User activity logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'page_view', 'deal_view', 'profile_view', 'search', 'filter'
    activity_data JSONB, -- Additional data about the activity
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication logs table
CREATE TABLE IF NOT EXISTS communication_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    communication_type VARCHAR(50) NOT NULL, -- 'message', 'email', 'call_request', 'meeting_request'
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    syndicator_id UUID REFERENCES syndicator_profiles(id) ON DELETE SET NULL,
    subject TEXT,
    message_preview TEXT, -- First 200 chars of message
    status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'replied'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deal interaction logs table
CREATE TABLE IF NOT EXISTS deal_interaction_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- 'view', 'favorite', 'unfavorite', 'share', 'download', 'contact'
    interaction_data JSONB, -- Additional data about the interaction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User engagement summary table (materialized view for performance)
CREATE TABLE IF NOT EXISTS user_engagement_summary (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    total_logins INTEGER DEFAULT 0,
    last_login TIMESTAMP WITH TIME ZONE,
    total_communications_sent INTEGER DEFAULT 0,
    total_communications_received INTEGER DEFAULT 0,
    total_deal_views INTEGER DEFAULT 0,
    total_favorites INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0, -- Calculated score based on activities
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_communication_logs_sender_id ON communication_logs(sender_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_recipient_id ON communication_logs(recipient_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_created_at ON communication_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_deal_interaction_logs_user_id ON deal_interaction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_deal_interaction_logs_deal_id ON deal_interaction_logs(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_interaction_logs_created_at ON deal_interaction_logs(created_at);

-- RLS Policies
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engagement_summary ENABLE ROW LEVEL SECURITY;

-- Admin can see all activity logs
CREATE POLICY "Admins can view all activity logs" ON user_activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can view all communication logs" ON communication_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can view all deal interaction logs" ON deal_interaction_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can view all engagement summaries" ON user_engagement_summary
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Users can insert their own activity logs
CREATE POLICY "Users can insert their own activity logs" ON user_activity_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert communication logs" ON communication_logs
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can insert deal interaction logs" ON deal_interaction_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Function to update engagement summary
CREATE OR REPLACE FUNCTION update_user_engagement_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Update engagement summary based on the activity
    INSERT INTO user_engagement_summary (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Update specific metrics based on activity type
    IF TG_TABLE_NAME = 'user_activity_logs' THEN
        IF NEW.activity_type = 'login' THEN
            UPDATE user_engagement_summary 
            SET total_logins = total_logins + 1,
                last_login = NEW.created_at,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'communication_logs' THEN
        UPDATE user_engagement_summary 
        SET total_communications_sent = total_communications_sent + 1,
            updated_at = NOW()
        WHERE user_id = NEW.sender_id;
        
        UPDATE user_engagement_summary 
        SET total_communications_received = total_communications_received + 1,
            updated_at = NOW()
        WHERE user_id = NEW.recipient_id;
    ELSIF TG_TABLE_NAME = 'deal_interaction_logs' THEN
        IF NEW.interaction_type = 'view' THEN
            UPDATE user_engagement_summary 
            SET total_deal_views = total_deal_views + 1,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        ELSIF NEW.interaction_type = 'favorite' THEN
            UPDATE user_engagement_summary 
            SET total_favorites = total_favorites + 1,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        ELSIF NEW.interaction_type = 'share' THEN
            UPDATE user_engagement_summary 
            SET total_shares = total_shares + 1,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        END IF;
    END IF;

    -- Calculate engagement score
    UPDATE user_engagement_summary 
    SET engagement_score = (
        total_logins * 1 +
        total_communications_sent * 5 +
        total_communications_received * 3 +
        total_deal_views * 2 +
        total_favorites * 4 +
        total_shares * 3
    ),
    updated_at = NOW()
    WHERE user_id = COALESCE(NEW.user_id, NEW.sender_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update engagement summary
CREATE TRIGGER update_engagement_on_activity
    AFTER INSERT ON user_activity_logs
    FOR EACH ROW EXECUTE FUNCTION update_user_engagement_summary();

CREATE TRIGGER update_engagement_on_communication
    AFTER INSERT ON communication_logs
    FOR EACH ROW EXECUTE FUNCTION update_user_engagement_summary();

CREATE TRIGGER update_engagement_on_deal_interaction
    AFTER INSERT ON deal_interaction_logs
    FOR EACH ROW EXECUTE FUNCTION update_user_engagement_summary();

-- Function to get top active users
CREATE OR REPLACE FUNCTION get_top_active_users(
    user_type_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 10,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    email TEXT,
    user_type TEXT,
    avatar_url TEXT,
    total_logins INTEGER,
    last_login TIMESTAMP WITH TIME ZONE,
    total_communications INTEGER,
    total_deal_interactions INTEGER,
    engagement_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.email,
        p.user_type,
        p.avatar_url,
        COALESCE(ues.total_logins, 0),
        ues.last_login,
        COALESCE(ues.total_communications_sent + ues.total_communications_received, 0),
        COALESCE(ues.total_deal_views + ues.total_favorites + ues.total_shares, 0),
        COALESCE(ues.engagement_score, 0)
    FROM profiles p
    LEFT JOIN user_engagement_summary ues ON p.id = ues.user_id
    WHERE (user_type_filter IS NULL OR p.user_type = user_type_filter)
    AND (ues.last_login IS NULL OR ues.last_login >= NOW() - INTERVAL '%s days' % days_back)
    ORDER BY COALESCE(ues.engagement_score, 0) DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing
INSERT INTO user_activity_logs (user_id, activity_type, activity_data) 
SELECT 
    id, 
    'login', 
    '{"source": "web"}'::jsonb
FROM profiles 
WHERE user_type IN ('investor', 'syndicator')
LIMIT 5; 