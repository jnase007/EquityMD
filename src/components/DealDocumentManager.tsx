import React, { useState } from 'react';
import { FileText, Upload, X, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
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

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size must be less than 50MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `deals/${dealId}/documents/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('deal-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('deal-media')
        .getPublicUrl(filePath);

      // Create file record
      const newFile: DealFile = {
        id: uuidv4(),
        deal_id: dealId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: publicUrl,
        is_private: true,
        created_at: new Date().toISOString()
      };

      // Save to database
      const { error: dbError } = await supabase
        .from('deal_files')
        .insert([{
          deal_id: dealId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: publicUrl,
          is_private: true
        }]);

      if (dbError) throw dbError;

      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);

    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (fileId: string) => {
    try {
      setError(null);
      
      // Delete from Supabase Storage
      const file = files.find(f => f.id === fileId);
      if (!file) return;

      const urlParts = file.file_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `deals/${dealId}/documents/${fileName}`;
      
      await supabase.storage
        .from('deal-media')
        .remove([filePath]);

      // Delete from database
      await supabase
        .from('deal_files')
        .delete()
        .match({ id: fileId });

      // Update state
      const updatedFiles = files.filter(f => f.id !== fileId);
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);

    } catch (error) {
      console.error('Error removing file:', error);
      setError('Error removing file');
    }
  };

  return (
    <div className="space-y-4">
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
            <div key={file.id} className="p-4 flex items-center justify-between">
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