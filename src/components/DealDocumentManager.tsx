import React, { useState, useEffect } from 'react';
import { FileText, Upload, X, AlertCircle, Eye, EyeOff, Globe, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DealFile {
  id: string;
  deal_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  is_private: boolean;
  created_at: string;
}

interface DealDocumentManagerProps {
  dealId: string;
  existingFiles: DealFile[];
  onFilesChange: (files: DealFile[]) => void;
}

export function DealDocumentManager({ dealId, existingFiles, onFilesChange }: DealDocumentManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<DealFile[]>(existingFiles);
  const [error, setError] = useState<string | null>(null);

  // Update local state when props change
  useEffect(() => {
    setFiles(existingFiles);
  }, [existingFiles]);

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size must be less than 50MB');
      }

      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${timestamp}.${fileExt}`;
      const filePath = `deals/${dealId}/documents/${fileName}`;

      console.log('Uploading document to path:', filePath);
      console.log('File type:', file.type, 'Size:', file.size);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('deal-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        console.error('Error details:', JSON.stringify(uploadError, null, 2));
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('deal-media')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      // Save to database and let it generate the ID
      const { data: insertedFile, error: dbError } = await supabase
        .from('deal_files')
        .insert([{
          deal_id: dealId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: publicUrl,
          is_private: true
        }])
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        console.error('Error details:', JSON.stringify(dbError, null, 2));
        // Try to clean up the uploaded file
        await supabase.storage.from('deal-media').remove([filePath]);
        throw new Error(`Database error: ${dbError.message}`);
      }

      console.log('Database record created:', insertedFile);

      // Use the database-generated file record
      const updatedFiles = [...files, insertedFile];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);

    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (fileId: string) => {
    try {
      setError(null);
      
      // Find the file to delete
      const file = files.find(f => f.id === fileId);
      if (!file) {
        setError('File not found');
        return;
      }

      // Extract file path from URL for storage deletion
      const urlParts = file.file_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `deals/${dealId}/documents/${fileName}`;
      
      // Delete from database first
      const { error: dbError } = await supabase
        .from('deal_files')
        .delete()
        .eq('id', fileId);

      if (dbError) {
        console.error('Database deletion error:', dbError);
        throw new Error(`Failed to delete file from database: ${dbError.message}`);
      }

      // Then delete from storage (don't fail if storage deletion fails)
      const { error: storageError } = await supabase.storage
        .from('deal-media')
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage deletion warning:', storageError);
        // Don't throw here - the database record is already deleted
      }

      // Update state
      const updatedFiles = files.filter(f => f.id !== fileId);
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);

    } catch (error) {
      console.error('Error removing file:', error);
      setError(error instanceof Error ? error.message : 'Error removing file');
    }
  };

  const toggleVisibility = async (fileId: string) => {
    try {
      setError(null);
      
      const file = files.find(f => f.id === fileId);
      if (!file) return;

      const newPrivacyStatus = !file.is_private;

      // Update in database
      const { error: updateError } = await supabase
        .from('deal_files')
        .update({ is_private: newPrivacyStatus })
        .match({ id: fileId });

      if (updateError) throw updateError;

      // Update local state
      const updatedFiles = files.map(f => 
        f.id === fileId 
          ? { ...f, is_private: newPrivacyStatus }
          : f
      );
      
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);

    } catch (error) {
      console.error('Error updating file visibility:', error);
      setError('Error updating file visibility');
    }
  };

  return (
    <div className="space-y-4">
      {/* Document Visibility Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Document Visibility Options</h3>
        <div className="space-y-1 text-sm text-blue-700">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-green-500" />
            <span><strong>Public:</strong> Visible to all website visitors</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-orange-500" />
            <span><strong>Private:</strong> Only visible to signed-in accredited investors</span>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <input
          type="file"
          id="file-upload"
          onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <Upload className="h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Click to upload documents
          </p>
          <p className="text-xs text-gray-400">
            PDF, Word, Excel, Text files (max 50MB)
          </p>
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg border divide-y">
          {files.map((file) => (
            <div key={file.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="font-medium">{file.file_name}</div>
                    <div className="text-sm text-gray-500">
                      {(file.file_size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Visibility Controls */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {file.is_private ? (
                      <>
                        <Lock className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-orange-600 font-medium">Private</span>
                        <span className="text-xs text-gray-500">Only visible to signed-in investors</span>
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Public</span>
                        <span className="text-xs text-gray-500">Visible to all visitors</span>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={() => toggleVisibility(file.id)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      file.is_private 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                  >
                    {file.is_private ? (
                      <>
                        <Eye className="h-4 w-4" />
                        Make Public
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Make Private
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="text-sm text-gray-500">
          Uploading document...
        </div>
      )}
    </div>
  );
}