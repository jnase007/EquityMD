import React from 'react';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageBanner({ title, subtitle, children, className = '' }: PageBannerProps) {
  return (
    <div className={`relative bg-blue-600 ${className}`}>
      {/* Urban Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-10 mix-blend-overlay"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1451976426598-a7593bd6d0b2?auto=format&fit=crop&q=80&w=2000")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(100%) contrast(120%)'
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/50 to-blue-700/50" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 py-20">
        <h1 className="text-4xl font-bold mb-6 text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-blue-100">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}