import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Star, GripVertical, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { UploadedImage } from './types';

interface ImageGalleryUploadProps {
  images: UploadedImage[];
  coverImageIndex: number;
  onImagesChange: (images: UploadedImage[]) => void;
  onCoverImageChange: (index: number) => void;
  maxImages?: number;
}

export function ImageGalleryUpload({
  images,
  coverImageIndex,
  onImagesChange,
  onCoverImageChange,
  maxImages = 20
}: ImageGalleryUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragging false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFiles = useCallback((files: FileList) => {
    const newImages: UploadedImage[] = [];
    const remainingSlots = maxImages - images.length;
    
    Array.from(files).slice(0, remainingSlots).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      const id = uuidv4();
      const preview = URL.createObjectURL(file);
      
      newImages.push({
        id,
        file,
        url: '',
        preview,
        title: file.name.split('.')[0],
        order: images.length + newImages.length,
        isUploading: false,
        progress: 0
      });
    });

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }
  }, [images, maxImages, onImagesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    
    // Adjust cover image index if needed
    if (index === coverImageIndex) {
      onCoverImageChange(0);
    } else if (index < coverImageIndex) {
      onCoverImageChange(coverImageIndex - 1);
    }
    
    // Clean up preview URL
    if (images[index].preview) {
      URL.revokeObjectURL(images[index].preview);
    }
    
    onImagesChange(newImages);
  };

  const handleReorderDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleReorderDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleReorderDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newImages = [...images];
      const [draggedImage] = newImages.splice(draggedIndex, 1);
      newImages.splice(dragOverIndex, 0, draggedImage);
      
      // Adjust cover image index
      if (coverImageIndex === draggedIndex) {
        onCoverImageChange(dragOverIndex);
      } else if (draggedIndex < coverImageIndex && dragOverIndex >= coverImageIndex) {
        onCoverImageChange(coverImageIndex - 1);
      } else if (draggedIndex > coverImageIndex && dragOverIndex <= coverImageIndex) {
        onCoverImageChange(coverImageIndex + 1);
      }
      
      onImagesChange(newImages);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer
          ${isDragging 
            ? 'border-emerald-500 bg-emerald-50 scale-[1.02] shadow-lg' 
            : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
          }
          ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={images.length >= maxImages}
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${
            isDragging ? 'bg-emerald-100' : 'bg-gray-100'
          }`}>
            <Upload className={`h-10 w-10 transition-colors duration-300 ${
              isDragging ? 'text-emerald-600' : 'text-gray-400'
            }`} />
          </div>
          
          <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
            isDragging ? 'text-emerald-700' : 'text-gray-700'
          }`}>
            {isDragging ? 'Drop your images here!' : 'Drag & drop property photos'}
          </h3>
          
          <p className="text-sm text-gray-500 mb-4">
            or click to browse your files
          </p>
          
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              JPG, PNG, WebP
            </span>
            <span>•</span>
            <span>Max 10MB per image</span>
            <span>•</span>
            <span>{images.length}/{maxImages} photos</span>
          </div>
        </div>
        
        {isDragging && (
          <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl pointer-events-none" />
        )}
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">
              Uploaded Photos ({images.length})
            </h4>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-500" />
              Click the star to set cover photo
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleReorderDragStart(e, index)}
                onDragOver={(e) => handleReorderDragOver(e, index)}
                onDragEnd={handleReorderDragEnd}
                className={`relative group rounded-xl overflow-hidden bg-gray-100 aspect-[4/3] transition-all duration-200 ${
                  draggedIndex === index ? 'opacity-50 scale-95' : ''
                } ${
                  dragOverIndex === index ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
                } ${
                  index === coverImageIndex ? 'ring-2 ring-amber-400 ring-offset-2' : ''
                }`}
              >
                <img
                  src={image.preview || image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Cover Badge */}
                {index === coverImageIndex && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="h-3 w-3 fill-current" />
                    Cover
                  </div>
                )}
                
                {/* Uploading indicator */}
                {image.isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute top-2 right-2 flex gap-1">
                    {/* Set as cover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCoverImageChange(index);
                      }}
                      className={`p-1.5 rounded-full transition-colors ${
                        index === coverImageIndex 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-white/90 text-gray-600 hover:bg-amber-500 hover:text-white'
                      }`}
                      title="Set as cover photo"
                    >
                      <Star className={`h-4 w-4 ${index === coverImageIndex ? 'fill-current' : ''}`} />
                    </button>
                    
                    {/* Remove */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="p-1.5 bg-white/90 text-red-600 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                      title="Remove photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Drag handle */}
                  <div className="absolute bottom-2 left-2 p-1.5 bg-white/90 text-gray-600 rounded-full cursor-move">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  
                  {/* Order number */}
                  <div className="absolute bottom-2 right-2 bg-white/90 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
            <h5 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Pro Tips for Great Photos
            </h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Cover photo:</strong> Choose your most impressive exterior shot</li>
              <li>• <strong>Include variety:</strong> Exterior, lobby, units, amenities, neighborhood</li>
              <li>• <strong>Quality matters:</strong> Use high-resolution, well-lit photos</li>
              <li>• <strong>Drag to reorder:</strong> Put your best photos first</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Empty state suggestion */}
      {images.length === 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-semibold text-amber-800">Photos help your listing stand out</h5>
            <p className="text-sm text-amber-700 mt-1">
              Listings with high-quality photos receive 3x more investor interest. 
              We recommend uploading at least 5 photos showing different aspects of the property.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

