import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

interface DealMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  description: string;
  order: number;
}

interface DealMediaUploadProps {
  dealId: string;
  existingMedia: DealMedia[];
  onMediaChange: (media: DealMedia[]) => void;
}

export function DealMediaUpload({ dealId, existingMedia, onMediaChange }: DealMediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<DealMedia[]>(existingMedia);

  const uploadMedia = async (files: FileList) => {
    try {
      setUploading(true);
      const newMedia: DealMedia[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileType = file.type.startsWith('image/') ? 'image' : 'video';

        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          alert('Please upload only images or videos.');
          continue;
        }

        // Validate file size (max 50MB for videos, 5MB for images)
        const maxSize = fileType === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
        if (file.size > maxSize) {
          alert(`Please upload ${fileType}s smaller than ${maxSize / (1024 * 1024)}MB.`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `deals/${dealId}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('deal-media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('deal-media')
          .getPublicUrl(filePath);

        // Create media record
        const mediaItem: DealMedia = {
          id: uuidv4(),
          type: fileType,
          url: publicUrl,
          title: file.name.split('.')[0],
          description: '',
          order: media.length + newMedia.length
        };

        newMedia.push(mediaItem);

        // Save to database
        const { error: dbError } = await supabase
          .from('deal_media')
          .insert([{
            deal_id: dealId,
            type: mediaItem.type,
            url: mediaItem.url,
            title: mediaItem.title,
            order: mediaItem.order
          }]);

        if (dbError) throw dbError;
      }

      const updatedMedia = [...media, ...newMedia];
      setMedia(updatedMedia);
      onMediaChange(updatedMedia);

    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Error uploading media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = async (index: number) => {
    try {
      const mediaItem = media[index];
      
      // Delete from Supabase Storage
      const urlParts = mediaItem.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `deals/${dealId}/${fileName}`;
      
      await supabase.storage
        .from('deal-media')
        .remove([filePath]);

      // Delete from database
      await supabase
        .from('deal_media')
        .delete()
        .match({ id: mediaItem.id });

      // Update state
      const updatedMedia = media.filter((_, i) => i !== index);
      setMedia(updatedMedia);
      onMediaChange(updatedMedia);

    } catch (error) {
      console.error('Error removing media:', error);
      alert('Error removing media. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <input
          type="file"
          id="media-upload"
          multiple
          accept="image/*,video/*"
          onChange={(e) => e.target.files && uploadMedia(e.target.files)}
          className="hidden"
        />
        <label
          htmlFor="media-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <Upload className="h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Click to upload images or videos
          </p>
          <p className="text-xs text-gray-400">
            Max size: 5MB for images, 50MB for videos
          </p>
        </label>
      </div>

      {/* Media Preview */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {media.map((item, index) => (
            <div key={item.id} className="relative group">
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Video className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <button
                  onClick={() => removeMedia(index)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <input
                type="text"
                value={item.title}
                onChange={(e) => {
                  const updatedMedia = [...media];
                  updatedMedia[index].title = e.target.value;
                  setMedia(updatedMedia);
                  onMediaChange(updatedMedia);
                }}
                className="mt-2 w-full px-2 py-1 text-sm border rounded"
                placeholder="Title"
              />
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="text-sm text-gray-500">
          Uploading media...
        </div>
      )}
    </div>
  );
}