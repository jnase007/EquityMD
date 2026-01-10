-- =====================================================
-- CREATE DEAL DOCUMENTS STORAGE BUCKET
-- Run this in Supabase SQL Editor
-- This creates a separate bucket for deal documents (PDF, Word, Excel, etc.)
-- =====================================================

-- 1. Create deal-documents bucket for document uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deal-documents',
  'deal-documents',
  true,  -- Public for easy access via URLs
  52428800, -- 50MB max file size
  ARRAY[
    -- PDF
    'application/pdf',
    -- Microsoft Word
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    -- Microsoft Excel
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    -- Microsoft PowerPoint
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    -- Plain text
    'text/plain',
    -- CSV
    'text/csv',
    -- Rich text
    'application/rtf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/rtf'
  ];

-- 2. Drop any existing storage policies for deal-documents
DROP POLICY IF EXISTS "deal-documents: public read access" ON storage.objects;
DROP POLICY IF EXISTS "deal-documents: authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "deal-documents: authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "deal-documents: authenticated delete" ON storage.objects;

-- 3. Create storage policies for deal-documents bucket

-- Anyone can VIEW/download documents (it's a public bucket)
CREATE POLICY "deal-documents: public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'deal-documents');

-- Authenticated users can UPLOAD documents
CREATE POLICY "deal-documents: authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'deal-documents');

-- Authenticated users can UPDATE their documents
CREATE POLICY "deal-documents: authenticated update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'deal-documents')
WITH CHECK (bucket_id = 'deal-documents');

-- Authenticated users can DELETE documents
CREATE POLICY "deal-documents: authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'deal-documents');

-- =====================================================
-- 4. Verify the setup
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ deal-documents storage bucket created successfully!';
  RAISE NOTICE 'Supported file types: PDF, Word, Excel, PowerPoint, TXT, CSV, RTF';
  RAISE NOTICE 'Max file size: 50MB';
END $$;
