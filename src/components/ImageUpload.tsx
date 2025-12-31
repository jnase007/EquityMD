import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, RotateCw, ZoomIn, ZoomOut, Check, Edit3, Crop as CropIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { supabase } from '../lib/supabase';

interface ImageUploadProps {
  currentImageUrl: string;
  onImageUploaded: (url: string) => void;
  bucket: string;
  folder: string;
  showEditor?: boolean;
  cropAspectRatio?: number; // e.g., 1 for square, 16/9 for widescreen
  maxWidth?: number;
  maxHeight?: number;
  circularCrop?: boolean;
  label?: string; // Label for the image type (e.g., "Profile Picture", "Company Logo")
}

export function ImageUpload({ 
  currentImageUrl, 
  onImageUploaded, 
  bucket, 
  folder,
  showEditor = true,
  cropAspectRatio = 1,
  maxWidth = 800,
  maxHeight = 800,
  circularCrop = true,
  label = "Profile Picture"
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 0,
    y: 0,
    width: 100,
    height: 100
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setError(null);
    setOriginalFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Reset crop settings
    setCrop({
      unit: '%',
      x: 10,
      y: 10,
      width: 80,
      height: 80
    });
    setScale(1);
    setRotation(0);
    
    if (showEditor) {
      setShowCropModal(true);
    } else {
      uploadImage(file);
    }
  };

  const getCroppedImg = useCallback((
    image: HTMLImageElement,
    crop: PixelCrop,
    scale = 1,
    rotation = 0
  ): Promise<Blob> => {
    const canvas = canvasRef.current;
    if (!canvas) {
      throw new Error('Canvas ref not available');
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Calculate the actual crop dimensions
    const pixelRatio = window.devicePixelRatio || 1;
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    // Set canvas dimensions
    const finalWidth = Math.min(cropWidth * scale, maxWidth);
    const finalHeight = Math.min(cropHeight * scale, maxHeight);
    
    canvas.width = finalWidth * pixelRatio;
    canvas.height = finalHeight * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    // Calculate the center point for rotation
    const centerX = finalWidth / 2;
    const centerY = finalHeight / 2;

    // Apply transformations
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    // Draw the cropped image
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      finalWidth,
      finalHeight
    );

    ctx.restore();

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        0.9
      );
    });
  }, [maxWidth, maxHeight]);

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      // Create unique file name
      const fileExt = 'jpg';
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Supabase storage error:', uploadError);
        // Provide more helpful error messages
        if (uploadError.message?.includes('bucket') || uploadError.message?.includes('not found')) {
          throw new Error(`Storage bucket "${bucket}" not found. Please contact support.`);
        } else if (uploadError.message?.includes('policy') || uploadError.message?.includes('permission')) {
          throw new Error('Permission denied. Please ensure you are logged in.');
        } else {
          throw uploadError;
        }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onImageUploaded(publicUrl);
      setShowCropModal(false);
      
      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleCropComplete = async () => {
    if (!imageRef.current || !completedCrop || !originalFile) {
      setError('Please select a crop area');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const croppedBlob = await getCroppedImg(
        imageRef.current,
        completedCrop,
        scale,
        rotation
      );

      const croppedFile = new File([croppedBlob], originalFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      await uploadImage(croppedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      setError(error instanceof Error ? error.message : 'Error processing image');
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageUploaded('');
  };

  const handleCancelCrop = () => {
    setShowCropModal(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    setOriginalFile(null);
  };

  return (
    <>
      <div className="space-y-4">
        {currentImageUrl ? (
          <div className="relative">
            <img
              src={currentImageUrl}
              alt={label}
              className={`w-32 h-32 object-cover border-2 border-gray-200 ${
                circularCrop ? 'rounded-full' : 'rounded-lg'
              }`}
            />
            <div className="absolute top-2 right-2 flex space-x-1">
              {showEditor && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg transition-colors"
                  title={`Edit ${label.toLowerCase()}`}
                >
                  <Edit3 className="h-3 w-3" />
                </button>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 shadow-lg transition-colors"
                title={`Upload new ${label.toLowerCase()}`}
              >
                <Upload className="h-3 w-3" />
              </button>
              <button
                onClick={handleRemoveImage}
                className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
                title={`Remove ${label.toLowerCase()}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`w-32 h-32 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group ${
              circularCrop ? 'rounded-full' : 'rounded-lg'
            }`}
          >
            <Upload className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <span className="mt-2 text-sm text-gray-500 group-hover:text-blue-600 transition-colors text-center px-2">
              Upload Image
            </span>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          disabled={uploading}
          className="hidden"
        />

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
            {error}
          </div>
        )}

        {uploading && (
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-md flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Processing and uploading image...
          </div>
        )}
      </div>

      {/* Image Editor Modal */}
      {showCropModal && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <CropIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Edit {label}</h3>
                </div>
                <button
                  onClick={handleCancelCrop}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Image Preview */}
                <div className="xl:col-span-3">
                  <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-100 min-h-[400px] flex items-center justify-center">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={cropAspectRatio}
                      circularCrop={circularCrop}
                      className="max-w-full max-h-[500px]"
                    >
                      <img
                        ref={imageRef}
                        src={previewUrl}
                        alt="Crop preview"
                        style={{
                          transform: `scale(${scale}) rotate(${rotation}deg)`,
                          maxWidth: '100%',
                          maxHeight: '500px'
                        }}
                      />
                    </ReactCrop>
                  </div>
                  
                  {/* Progress indicator */}
                  {uploading && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                        <div className="text-blue-700">
                          <div className="font-medium">Processing your image...</div>
                          <div className="text-sm text-blue-600">Please wait while we crop and optimize your image.</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="space-y-6">
                  {/* Zoom Control */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <ZoomIn className="h-4 w-4 mr-2" />
                      Zoom: {Math.round(scale * 100)}%
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between space-x-2">
                        <button
                          onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                          className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                        >
                          <ZoomOut className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setScale(1)}
                          className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => setScale(Math.min(3, scale + 0.1))}
                          className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                        >
                          <ZoomIn className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Rotation Control */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <RotateCw className="h-4 w-4 mr-2" />
                      Rotation: {rotation}°
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="1"
                        value={rotation}
                        onChange={(e) => setRotation(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between space-x-2">
                        <button
                          onClick={() => setRotation(rotation - 90)}
                          className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                        >
                          -90°
                        </button>
                        <button
                          onClick={() => setRotation(0)}
                          className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => setRotation(rotation + 90)}
                          className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                        >
                          +90°
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Output Info */}
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="font-medium text-gray-700 mb-2">Output Settings</div>
                    <div className="space-y-1 text-gray-600">
                      <div>Max size: {maxWidth} × {maxHeight}px</div>
                      <div>Format: JPEG (90% quality)</div>
                      <div>Shape: {circularCrop ? 'Circular' : 'Square'}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4 border-t">
                    <button
                      onClick={handleCropComplete}
                      disabled={uploading || !completedCrop}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Save {label}
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleCancelCrop}
                      disabled={uploading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for image processing */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </>
  );
}