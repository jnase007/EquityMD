-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Create logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true);

-- Create deal-media bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('deal-media', 'deal-media', false);

-- Set up security policies for avatars bucket
CREATE POLICY "Avatar files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own avatar files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid() = owner
);

CREATE POLICY "Users can delete own avatar files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid() = owner
);

-- Set up security policies for logos bucket
CREATE POLICY "Logo files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

CREATE POLICY "Users can upload logo files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'logos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own logo files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'logos'
  AND auth.uid() = owner
);

CREATE POLICY "Users can delete own logo files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'logos'
  AND auth.uid() = owner
);

-- Set up security policies for deal-media bucket
CREATE POLICY "Authenticated users can view deal media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'deal-media'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can upload deal media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deal-media'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own deal media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'deal-media'
  AND auth.uid() = owner
);

CREATE POLICY "Users can delete own deal media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'deal-media'
  AND auth.uid() = owner
);
;
