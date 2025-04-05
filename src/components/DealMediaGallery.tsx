import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DealMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  description: string;
  order: number;
}

interface DealMediaGalleryProps {
  media: DealMedia[];
}

export function DealMediaGallery({ media }: DealMediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  if (media.length === 0) {
    return null;
  }

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {media.map((item, index) => (
          <div
            key={item.id}
            onClick={() => {
              setCurrentIndex(index);
              setShowLightbox(true);
            }}
            className="cursor-pointer group relative"
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-48 object-cover rounded-lg transition duration-200 group-hover:brightness-90"
              />
            ) : (
              <video
                src={item.url}
                className="w-full h-48 object-cover rounded-lg transition duration-200 group-hover:brightness-90"
              />
            )}
            {item.title && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-200 rounded-b-lg">
                <p className="text-white text-sm truncate">{item.title}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowLightbox(false);
            }}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition"
          >
            <X className="h-8 w-8" />
          </button>

          <button
            onClick={handlePrevious}
            className="absolute left-4 text-white/80 hover:text-white transition"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 text-white/80 hover:text-white transition"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div 
            className="max-w-4xl max-h-[80vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {media[currentIndex].type === 'image' ? (
              <img
                src={media[currentIndex].url}
                alt={media[currentIndex].title}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            ) : (
              <video
                src={media[currentIndex].url}
                controls
                className="max-w-full max-h-[80vh] rounded-lg"
              />
            )}
            
            {(media[currentIndex].title || media[currentIndex].description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm text-white p-4 rounded-b-lg">
                {media[currentIndex].title && (
                  <h3 className="text-lg font-semibold">{media[currentIndex].title}</h3>
                )}
                {media[currentIndex].description && (
                  <p className="text-sm text-gray-200 mt-1">{media[currentIndex].description}</p>
                )}
              </div>
            )}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}