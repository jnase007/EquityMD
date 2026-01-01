import React, { useState } from 'react';
import { Share2, Twitter, Linkedin, Mail, Link2, Check, Facebook } from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  compact?: boolean;
}

export function ShareButtons({ url, title, description, compact = false }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description || '');

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    setShowMenu(false);
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          title="Share"
        >
          <Share2 className="h-5 w-5" />
        </button>

        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 min-w-[160px]">
              <button
                onClick={() => handleShare('twitter')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                Twitter
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                LinkedIn
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <Facebook className="h-4 w-4 text-[#1877F2]" />
                Facebook
              </button>
              <button
                onClick={() => handleShare('email')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <Mail className="h-4 w-4 text-gray-600" />
                Email
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={copyToClipboard}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 text-gray-600" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 mr-1">Share:</span>
      <button
        onClick={() => handleShare('twitter')}
        className="p-2 text-gray-400 hover:text-[#1DA1F2] hover:bg-blue-50 rounded-lg transition"
        title="Share on Twitter"
      >
        <Twitter className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleShare('linkedin')}
        className="p-2 text-gray-400 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleShare('facebook')}
        className="p-2 text-gray-400 hover:text-[#1877F2] hover:bg-blue-50 rounded-lg transition"
        title="Share on Facebook"
      >
        <Facebook className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleShare('email')}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
        title="Share via Email"
      >
        <Mail className="h-5 w-5" />
      </button>
      <button
        onClick={copyToClipboard}
        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
        title="Copy Link"
      >
        {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Link2 className="h-5 w-5" />}
      </button>
    </div>
  );
}

