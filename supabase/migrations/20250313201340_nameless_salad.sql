-- Create required buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('logos', 'logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('deal-media', 'deal-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies to recreate them
DO $$ 
BEGIN
  -- Drop avatar policies
  DROP POLICY IF EXISTS "Avatar files are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload avatar files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own avatar files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own avatar files" ON storage.objects;

  -- Drop logo policies
  DROP POLICY IF EXISTS "Logo files are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload logo files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own logo files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own logo files" ON storage.objects;

  -- Drop deal media policies
  DROP POLICY IF EXISTS "Deal media files are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload deal media" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own deal media" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own deal media" ON storage.objects;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Create policies for avatars bucket
CREATE POLICY "Avatar files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own avatar files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own avatar files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policies for logos bucket
CREATE POLICY "Logo files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

CREATE POLICY "Admins can manage logo files"
ON storage.objects FOR ALL
WITH CHECK (
  bucket_id = 'logos' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  )
);

-- Create policies for deal-media bucket
CREATE POLICY "Deal media files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'deal-media');

CREATE POLICY "Syndicators can manage deal media"
ON storage.objects FOR ALL
WITH CHECK (
  bucket_id = 'deal-media' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND user_type = 'syndicator'
  )
);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
