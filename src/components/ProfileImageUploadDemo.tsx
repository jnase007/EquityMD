import React, { useState } from 'react';
import { ImageUpload } from './ImageUpload';
import { User, Building2 } from 'lucide-react';

export function ProfileImageUploadDemo() {
  const [profileImage, setProfileImage] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Enhanced Profile Image Upload
        </h1>
        <p className="text-gray-600">
          Upload and edit your profile pictures with advanced cropping, rotation, and zoom controls
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Picture Demo */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Profile Picture</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Circular crop optimized for profile pictures with 1:1 aspect ratio
            </p>
            
            <ImageUpload
              currentImageUrl={profileImage}
              onImageUploaded={setProfileImage}
              bucket="avatars"
              folder="demo"
              showEditor={true}
              circularCrop={true}
              cropAspectRatio={1}
              maxWidth={400}
              maxHeight={400}
            />

            <div className="text-xs text-gray-500 space-y-1">
              <div>✓ Circular crop for profile photos</div>
              <div>✓ Square aspect ratio (1:1)</div>
              <div>✓ Optimized 400×400px output</div>
              <div>✓ Advanced editing tools</div>
            </div>
          </div>
        </div>

        {/* Company Logo Demo */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4">
            <Building2 className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold">Company Logo</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Square crop perfect for company logos with flexible sizing
            </p>
            
            <ImageUpload
              currentImageUrl={companyLogo}
              onImageUploaded={setCompanyLogo}
              bucket="logos"
              folder="demo"
              showEditor={true}
              circularCrop={false}
              cropAspectRatio={1}
              maxWidth={600}
              maxHeight={600}
            />

            <div className="text-xs text-gray-500 space-y-1">
              <div>✓ Square crop for logos</div>
              <div>✓ Flexible aspect ratio</div>
              <div>✓ High-res 600×600px output</div>
              <div>✓ Brand-friendly editing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Enhanced Features</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="space-y-2">
            <div className="font-medium">Editing Tools:</div>
            <ul className="space-y-1 ml-4">
              <li>• Precision cropping with visual guides</li>
              <li>• Zoom controls (50% to 300%)</li>
              <li>• 360° rotation with quick presets</li>
              <li>• Real-time preview</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-medium">Quality & Performance:</div>
            <ul className="space-y-1 ml-4">
              <li>• Automatic image optimization</li>
              <li>• High-quality JPEG output (90%)</li>
              <li>• Responsive modal design</li>
              <li>• Mobile-friendly interface</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Current Images Display */}
      {(profileImage || companyLogo) && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Images</h3>
          <div className="flex items-center space-x-6">
            {profileImage && (
              <div className="text-center">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-200"
                />
                <p className="text-xs text-gray-600 mt-2">Profile Picture</p>
              </div>
            )}
            {companyLogo && (
              <div className="text-center">
                <img
                  src={companyLogo}
                  alt="Logo"
                  className="w-20 h-20 rounded-lg object-cover border-2 border-green-200"
                />
                <p className="text-xs text-gray-600 mt-2">Company Logo</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 