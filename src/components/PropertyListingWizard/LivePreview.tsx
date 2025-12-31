import React, { useState } from 'react';
import { 
  MapPin, DollarSign, TrendingUp, Clock, Building, ChevronLeft, ChevronRight,
  Users, Star, CheckCircle, Share2, Heart, Eye, Play, Video
} from 'lucide-react';
import { PropertyFormData, PROPERTY_TYPES, getVideoEmbedUrl, getVideoThumbnail, extractYouTubeId } from './types';

interface LivePreviewProps {
  formData: PropertyFormData;
  syndicatorName?: string;
}

export function LivePreview({ formData, syndicatorName }: LivePreviewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const propertyType = PROPERTY_TYPES.find(p => p.value === formData.propertyType);
  const hasImages = formData.images.length > 0;
  const displayImage = hasImages 
    ? formData.images[formData.coverImageIndex]?.preview || formData.images[formData.coverImageIndex]?.url
    : null;

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '$0';
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % formData.images.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev - 1 + formData.images.length) % formData.images.length);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Preview Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-white">Live Preview</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
      </div>
      
      {/* Preview Content */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Hero Image */}
        <div className="relative aspect-[16/9] bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
          {hasImages ? (
            <>
              <img
                src={formData.images[currentImageIndex]?.preview || formData.images[currentImageIndex]?.url}
                alt="Property"
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {formData.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                    {currentImageIndex + 1} / {formData.images.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <Building className="h-16 w-16 mb-2 opacity-30" />
              <p className="text-sm">Add photos to see preview</p>
            </div>
          )}
          
          {/* Property Type Badge */}
          {propertyType && (
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium text-gray-800 shadow-lg flex items-center gap-1.5">
              <span>{propertyType.icon}</span>
              {propertyType.label}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button className="p-2 bg-white/95 backdrop-blur rounded-full shadow-lg hover:bg-white transition">
              <Share2 className="h-4 w-4 text-gray-600" />
            </button>
            <button className="p-2 bg-white/95 backdrop-blur rounded-full shadow-lg hover:bg-white transition">
              <Heart className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Title & Location */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {formData.title || 'Your Property Title'}
            </h2>
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              {formData.location || formData.address.city 
                ? `${formData.address.city}${formData.address.state ? `, ${formData.address.state}` : ''}` 
                : 'Property Location'}
            </div>
          </div>
          
          {/* Investment Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">Minimum</span>
              </div>
              <p className="text-lg font-bold text-emerald-800">
                {formatCurrency(formData.minimumInvestment)}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Target IRR</span>
              </div>
              <p className="text-lg font-bold text-blue-800">
                {formData.targetIrr ? `${formData.targetIrr}%` : '—'}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Hold Period</span>
              </div>
              <p className="text-lg font-bold text-purple-800">
                {formData.investmentTerm ? `${formData.investmentTerm} yrs` : '—'}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
              <div className="flex items-center gap-2 mb-1">
                <Building className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">Total Raise</span>
              </div>
              <p className="text-lg font-bold text-amber-800">
                {formatCurrency(formData.totalEquity)}
              </p>
            </div>
          </div>
          
          {/* Syndicator */}
          {syndicatorName && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {syndicatorName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{syndicatorName}</p>
                <p className="text-xs text-gray-500">Syndicator</p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-medium text-gray-700">New</span>
              </div>
            </div>
          )}
          
          {/* Description */}
          {formData.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">About This Investment</h3>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                {formData.description}
              </p>
            </div>
          )}
          
          {/* Property Video */}
          {formData.videoUrl && getVideoEmbedUrl(formData.videoUrl) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Video className="h-4 w-4 text-red-500" />
                Property Video
              </h3>
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                {extractYouTubeId(formData.videoUrl) && (
                  <img 
                    src={`https://img.youtube.com/vi/${extractYouTubeId(formData.videoUrl)}/hqdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play className="h-6 w-6 text-gray-800 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Investment Highlights */}
          {formData.investmentHighlights.filter(Boolean).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Investment Highlights</h3>
              <div className="space-y-2">
                {formData.investmentHighlights.filter(Boolean).map((highlight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* CTA Button */}
          <button className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
            Request Information
          </button>
          
          {/* Disclaimer */}
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            This is a preview. Investment opportunities are available to accredited investors only.
          </p>
        </div>
      </div>
    </div>
  );
}

