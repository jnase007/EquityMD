-- Deal Q&A: Public questions and answers on deal pages
-- This allows investors to ask questions and syndicators to respond publicly

-- Questions table
CREATE TABLE IF NOT EXISTS deal_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers table
CREATE TABLE IF NOT EXISTS deal_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES deal_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_syndicator_answer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_deal_questions_deal_id ON deal_questions(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_questions_user_id ON deal_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_deal_answers_question_id ON deal_answers(question_id);

-- Enable RLS
ALTER TABLE deal_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_answers ENABLE ROW LEVEL SECURITY;

-- Anyone can read questions and answers (they're public)
CREATE POLICY "Anyone can view questions" ON deal_questions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view answers" ON deal_answers
  FOR SELECT USING (true);

-- Authenticated users can ask questions
CREATE POLICY "Authenticated users can ask questions" ON deal_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Authenticated users can answer questions
CREATE POLICY "Authenticated users can answer" ON deal_answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own questions (for upvotes or edits)
CREATE POLICY "Users can update questions" ON deal_questions
  FOR UPDATE USING (true); -- Allow upvotes from anyone

-- Question owners can delete their questions
CREATE POLICY "Users can delete own questions" ON deal_questions
  FOR DELETE USING (auth.uid() = user_id);

-- Answer owners can delete their answers
CREATE POLICY "Users can delete own answers" ON deal_answers
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_deal_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_deal_questions_updated_at
  BEFORE UPDATE ON deal_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_deal_questions_updated_at();

