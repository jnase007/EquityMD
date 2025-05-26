import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  url: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ShareButton({ 
  title, 
  url, 
  description = '',
  size = 'md',
  className = '' 
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  async function handleShare() {
    const shareData = {
      title,
      text: description,
      url: `${window.location.origin}${url}`
    };

    // Check if Web Share API is supported
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(`${window.location.origin}${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        // Further fallback - create a temporary input element
        const textArea = document.createElement('textarea');
        textArea.value = `${window.location.origin}${url}`;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textArea);
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`
        ${buttonSizeClasses[size]}
        text-gray-400 hover:text-blue-500
        transition-all duration-200 ease-in-out
        flex items-center gap-2
        hover:scale-105 active:scale-95
        ${className}
      `}
      title="Share"
    >
      {copied ? (
        <Check className={`${sizeClasses[size]} text-green-500`} />
      ) : (
        <Share2 className={sizeClasses[size]} />
      )}
    </button>
  );
} 