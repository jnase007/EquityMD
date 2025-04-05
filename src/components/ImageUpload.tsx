import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

interface ImageUploadProps {
  currentImageUrl: string;
  onImageUploaded: (url: string) => void;
  bucket: string;
  folder: string;
}

export function ImageUpload({ currentImageUrl, onImageUploaded, bucket, folder }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB');
      }

      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onImageUploaded(publicUrl);

    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageUploaded('');
  };

  return (
    <div className="space-y-4">
      {currentImageUrl ? (
        <div className="relative">
          <img
            src={currentImageUrl}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg"
          />
          <div className="absolute top-0 right-0 p-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 mr-1"
            >
              <Upload className="h-4 w-4" />
            </button>
            <button
              onClick={handleRemoveImage}
              className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <span className="mt-2 text-sm text-gray-500">Upload Image</span>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
        disabled={uploading}
        className="hidden"
      />

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      {uploading && (
        <div className="text-sm text-gray-500">
          Uploading image...
        </div>
      )}
    </div>
  );
}