import React, { useState } from 'react';
import { Sparkles, Wand2, RefreshCw, Copy, Check, X, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

type ContentType = 'property_description' | 'company_description' | 'bio' | 'deal_summary' | 'custom';
type Tone = 'professional' | 'friendly' | 'compelling';

interface AIContentAssistantProps {
  onInsert: (content: string) => void;
  contentType?: ContentType;
  placeholder?: string;
  context?: string;
  buttonLabel?: string;
  className?: string;
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  property_description: 'Property Description',
  company_description: 'Company Description',
  bio: 'Professional Bio',
  deal_summary: 'Deal Summary',
  custom: 'Custom Content',
};

const QUICK_PROMPTS: Record<ContentType, string[]> = {
  property_description: [
    'Write a compelling description highlighting the investment opportunity',
    'Focus on location benefits and rental demand',
    'Emphasize value-add potential and projected returns',
  ],
  company_description: [
    'Write a professional company overview',
    'Highlight our track record and expertise',
    'Focus on our investor-first approach',
  ],
  bio: [
    'Write a professional bio for a real estate investor',
    'Highlight my experience and accomplishments',
    'Make it concise and compelling',
  ],
  deal_summary: [
    'Summarize the investment thesis and key metrics',
    'Highlight the business plan and exit strategy',
    'Focus on risk-adjusted returns',
  ],
  custom: [
    'Help me write compelling content',
    'Make my text more professional',
    'Summarize and improve this content',
  ],
};

export function AIContentAssistant({
  onInsert,
  contentType = 'custom',
  placeholder = 'Describe what you want to generate...',
  context = '',
  buttonLabel = 'Generate with AI',
  className = '',
}: AIContentAssistantProps) {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<Tone>('professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToneMenu, setShowToneMenu] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what you want to generate');
      return;
    }

    if (!user) {
      toast.error('Please sign in to use AI content generation');
      return;
    }

    setIsLoading(true);
    setGeneratedContent('');

    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: prompt.trim(),
          context,
          contentType,
          tone,
          maxLength: 300,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.content) {
        setGeneratedContent(data.content);
      } else {
        throw new Error('No content generated');
      }
    } catch (error: any) {
      console.error('AI generation error:', error);
      toast.error(error.message || 'Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = () => {
    if (generatedContent) {
      onInsert(generatedContent);
      setIsOpen(false);
      setGeneratedContent('');
      setPrompt('');
      toast.success('Content inserted!');
    }
  };

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard!');
    }
  };

  const handleQuickPrompt = (quickPrompt: string) => {
    setPrompt(quickPrompt);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors ${className}`}
      >
        <Sparkles className="h-4 w-4" />
        {buttonLabel}
      </button>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Content Assistant</h3>
            <p className="text-xs text-gray-500">{CONTENT_TYPE_LABELS[contentType]}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setGeneratedContent('');
            setPrompt('');
          }}
          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Quick prompts */}
      {!generatedContent && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">Quick prompts:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS[contentType].map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(qp)}
                className="text-xs px-2.5 py-1 bg-white border border-gray-200 rounded-full hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompt input */}
      {!generatedContent && (
        <div className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
          />

          {/* Tone selector */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowToneMenu(!showToneMenu)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <span className="text-gray-500">Tone:</span>
                <span className="font-medium capitalize">{tone}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {showToneMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {(['professional', 'friendly', 'compelling'] as Tone[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTone(t);
                        setShowToneMenu(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 capitalize ${
                        tone === t ? 'text-purple-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Generated content */}
      {generatedContent && (
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{generatedContent}</p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setGeneratedContent('');
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>

              <button
                type="button"
                onClick={handleInsert}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all font-medium text-sm"
              >
                <Check className="h-4 w-4" />
                Use This
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context info */}
      {context && !generatedContent && (
        <div className="mt-3 pt-3 border-t border-purple-200">
          <p className="text-xs text-gray-500">
            <span className="font-medium">Context provided:</span> The AI will use your existing content to generate relevant text.
          </p>
        </div>
      )}
    </div>
  );
}

// Simplified inline button version
export function AIGenerateButton({
  onGenerate,
  isLoading = false,
  className = '',
}: {
  onGenerate: () => void;
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onGenerate}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors disabled:opacity-50 ${className}`}
    >
      {isLoading ? (
        <RefreshCw className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      {isLoading ? 'Generating...' : 'AI Generate'}
    </button>
  );
}

