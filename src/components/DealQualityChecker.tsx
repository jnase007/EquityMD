import React, { useState, useEffect } from 'react';
import { 
  Sparkles, CheckCircle, AlertCircle, X, Loader2, 
  Image, FileText, Video, MapPin, DollarSign, TrendingUp,
  Building, Calendar, Users, Award, ChevronDown, ChevronUp,
  Lightbulb, Target, Brain
} from 'lucide-react';

interface DealData {
  title: string;
  property_type: string;
  location: string;
  address?: { street?: string; city?: string; state?: string; zip?: string };
  minimum_investment: string;
  target_irr: string;
  investment_term: string;
  total_equity: string;
  preferred_return: string;
  equity_multiple: string;
  description: string;
  investment_highlights: string[];
  videoUrl: string;
  status: string;
}

interface MediaData {
  existingMedia: Array<{ id: string; url: string }>;
  newImages: Array<{ id: string; preview: string }>;
}

interface FilesData {
  files: Array<{ category: string; file_name: string }>;
}

interface DealQualityCheckerProps {
  formData: DealData;
  media: MediaData;
  files: FilesData;
  onClose?: () => void;
}

interface CheckItem {
  id: string;
  label: string;
  passed: boolean;
  importance: 'required' | 'recommended' | 'bonus';
  category: 'basics' | 'financials' | 'media' | 'documents' | 'details';
  tip?: string;
}

// Grok API for AI suggestions
const XAI_API_KEY = import.meta.env.VITE_XAI_API_KEY;
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';

export function DealQualityChecker({ formData, media, files, onClose }: DealQualityCheckerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);

  // Calculate quality checks
  const checks: CheckItem[] = [
    // Basics
    {
      id: 'title',
      label: 'Deal title',
      passed: formData.title.length >= 10,
      importance: 'required',
      category: 'basics',
      tip: 'A descriptive title helps investors find your deal'
    },
    {
      id: 'property_type',
      label: 'Property type selected',
      passed: !!formData.property_type,
      importance: 'required',
      category: 'basics',
    },
    {
      id: 'location',
      label: 'Location specified',
      passed: !!formData.location || !!(formData.address?.city && formData.address?.state),
      importance: 'required',
      category: 'basics',
    },
    {
      id: 'description',
      label: 'Description (100+ characters)',
      passed: formData.description.length >= 100,
      importance: 'required',
      category: 'basics',
      tip: 'Detailed descriptions get 3x more investor interest'
    },
    
    // Financials
    {
      id: 'min_investment',
      label: 'Minimum investment',
      passed: !!formData.minimum_investment && parseFloat(formData.minimum_investment) > 0,
      importance: 'required',
      category: 'financials',
    },
    {
      id: 'target_irr',
      label: 'Target IRR',
      passed: !!formData.target_irr,
      importance: 'required',
      category: 'financials',
    },
    {
      id: 'investment_term',
      label: 'Investment term',
      passed: !!formData.investment_term,
      importance: 'required',
      category: 'financials',
    },
    {
      id: 'total_equity',
      label: 'Total equity raise',
      passed: !!formData.total_equity && parseFloat(formData.total_equity) > 0,
      importance: 'recommended',
      category: 'financials',
    },
    {
      id: 'preferred_return',
      label: 'Preferred return',
      passed: !!formData.preferred_return,
      importance: 'recommended',
      category: 'financials',
    },
    {
      id: 'equity_multiple',
      label: 'Equity multiple',
      passed: !!formData.equity_multiple,
      importance: 'recommended',
      category: 'financials',
    },
    
    // Media
    {
      id: 'has_images',
      label: 'At least 1 property image',
      passed: (media.existingMedia.length + media.newImages.length) >= 1,
      importance: 'required',
      category: 'media',
      tip: 'Deals with photos get 5x more views'
    },
    {
      id: 'multiple_images',
      label: '3+ property images',
      passed: (media.existingMedia.length + media.newImages.length) >= 3,
      importance: 'recommended',
      category: 'media',
      tip: 'More images build investor confidence'
    },
    {
      id: 'many_images',
      label: '5+ property images',
      passed: (media.existingMedia.length + media.newImages.length) >= 5,
      importance: 'bonus',
      category: 'media',
    },
    {
      id: 'video',
      label: 'Property video',
      passed: !!formData.videoUrl,
      importance: 'bonus',
      category: 'media',
      tip: 'Video walkthroughs dramatically increase engagement'
    },
    
    // Documents
    {
      id: 'has_documents',
      label: 'At least 1 document uploaded',
      passed: files.files.length >= 1,
      importance: 'recommended',
      category: 'documents',
    },
    {
      id: 'has_ppm',
      label: 'PPM uploaded',
      passed: files.files.some(f => f.category === 'PPM'),
      importance: 'recommended',
      category: 'documents',
      tip: 'Serious investors expect a PPM'
    },
    {
      id: 'has_financials',
      label: 'Financial projections',
      passed: files.files.some(f => f.category === 'Financial Projections'),
      importance: 'recommended',
      category: 'documents',
    },
    
    // Details
    {
      id: 'highlights',
      label: 'Investment highlights (2+)',
      passed: formData.investment_highlights.filter(h => h.trim()).length >= 2,
      importance: 'recommended',
      category: 'details',
      tip: 'Highlights help investors quickly understand the value'
    },
    {
      id: 'many_highlights',
      label: 'Investment highlights (4+)',
      passed: formData.investment_highlights.filter(h => h.trim()).length >= 4,
      importance: 'bonus',
      category: 'details',
    },
  ];

  // Calculate scores
  const requiredChecks = checks.filter(c => c.importance === 'required');
  const recommendedChecks = checks.filter(c => c.importance === 'recommended');
  const bonusChecks = checks.filter(c => c.importance === 'bonus');

  const requiredPassed = requiredChecks.filter(c => c.passed).length;
  const recommendedPassed = recommendedChecks.filter(c => c.passed).length;
  const bonusPassed = bonusChecks.filter(c => c.passed).length;

  // Weighted score: Required = 5 pts, Recommended = 3 pts, Bonus = 1 pt
  const maxScore = (requiredChecks.length * 5) + (recommendedChecks.length * 3) + (bonusChecks.length * 1);
  const currentScore = (requiredPassed * 5) + (recommendedPassed * 3) + (bonusPassed * 1);
  const percentage = Math.round((currentScore / maxScore) * 100);

  // Get status color and label
  const getStatus = () => {
    if (requiredPassed < requiredChecks.length) {
      return { color: 'red', label: 'Needs Work', emoji: '⚠️' };
    }
    if (percentage >= 90) {
      return { color: 'green', label: 'Excellent', emoji: '🌟' };
    }
    if (percentage >= 70) {
      return { color: 'emerald', label: 'Good', emoji: '✅' };
    }
    if (percentage >= 50) {
      return { color: 'amber', label: 'Fair', emoji: '👍' };
    }
    return { color: 'orange', label: 'Needs Improvement', emoji: '📝' };
  };

  const status = getStatus();

  // Get AI suggestions
  const getAISuggestions = async () => {
    setAiLoading(true);
    setShowAISuggestions(true);
    
    try {
      const failedChecks = checks.filter(c => !c.passed);
      const dealSummary = `
Deal Title: ${formData.title || 'Not set'}
Property Type: ${formData.property_type || 'Not set'}
Location: ${formData.location || 'Not set'}
Description Length: ${formData.description.length} characters
Images: ${media.existingMedia.length + media.newImages.length}
Documents: ${files.files.length} (${files.files.map(f => f.category).join(', ') || 'None'})
Investment Highlights: ${formData.investment_highlights.filter(h => h.trim()).length}
Has Video: ${formData.videoUrl ? 'Yes' : 'No'}

Missing/Incomplete Items:
${failedChecks.map(c => `- ${c.label} (${c.importance})`).join('\n')}
      `;

      const response = await fetch(XAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'grok-3-latest',
          messages: [
            { 
              role: 'system', 
              content: `You are a helpful assistant for real estate syndicators. Your job is to help them create better deal listings that will attract more investors. Be encouraging but specific about improvements. Keep suggestions actionable and concise.`
            },
            { 
              role: 'user', 
              content: `Based on this deal listing analysis, provide 3-5 specific, actionable suggestions to improve this listing. Focus on what's missing or weak. Be encouraging but specific.

${dealSummary}

Format each suggestion as a brief tip (1-2 sentences). Start each with an emoji.`
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) throw new Error('Failed to get suggestions');

      const data = await response.json();
      setAiSuggestions(data.choices?.[0]?.message?.content || 'Unable to generate suggestions');
    } catch (err) {
      console.error('AI suggestions error:', err);
      setAiSuggestions('Unable to generate suggestions. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Group checks by category
  const categoryLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    basics: { label: 'Basic Info', icon: <Building className="h-4 w-4" /> },
    financials: { label: 'Financial Details', icon: <DollarSign className="h-4 w-4" /> },
    media: { label: 'Photos & Video', icon: <Image className="h-4 w-4" /> },
    documents: { label: 'Documents', icon: <FileText className="h-4 w-4" /> },
    details: { label: 'Additional Details', icon: <Target className="h-4 w-4" /> },
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 overflow-hidden">
      {/* Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-purple-100/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                Deal Quality Score
                <span className={`text-sm px-2 py-0.5 rounded-full ${
                  status.color === 'green' ? 'bg-green-100 text-green-700' :
                  status.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                  status.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                  status.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {status.emoji} {status.label}
                </span>
              </h3>
              <p className="text-sm text-gray-500">
                {requiredPassed}/{requiredChecks.length} required • {recommendedPassed}/{recommendedChecks.length} recommended
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Score Circle */}
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke={percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(percentage / 100) * 150.8} 150.8`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700">{percentage}%</span>
              </div>
            </div>
            
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-purple-200 p-4 space-y-4">
          {/* Categories */}
          {Object.entries(categoryLabels).map(([category, { label, icon }]) => {
            const categoryChecks = checks.filter(c => c.category === category);
            const passed = categoryChecks.filter(c => c.passed).length;
            
            return (
              <div key={category} className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    {icon}
                    {label}
                  </div>
                  <span className={`text-sm ${passed === categoryChecks.length ? 'text-green-600' : 'text-gray-500'}`}>
                    {passed}/{categoryChecks.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {categoryChecks.map(check => (
                    <div key={check.id} className="flex items-center gap-2 text-sm">
                      {check.passed ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className={`h-4 w-4 flex-shrink-0 ${
                          check.importance === 'required' ? 'text-red-400' :
                          check.importance === 'recommended' ? 'text-amber-400' :
                          'text-gray-300'
                        }`} />
                      )}
                      <span className={check.passed ? 'text-gray-600' : 'text-gray-500'}>
                        {check.label}
                        {check.importance === 'required' && !check.passed && (
                          <span className="text-red-500 text-xs ml-1">*required</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* AI Suggestions */}
          <div className="border-t border-purple-200 pt-4">
            {!showAISuggestions ? (
              <button
                onClick={getAISuggestions}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                <Brain className="h-5 w-5" />
                Get AI Suggestions to Improve
              </button>
            ) : (
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-gray-900">AI Suggestions</span>
                </div>
                
                {aiLoading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing your listing...
                  </div>
                ) : (
                  <div className="text-sm text-gray-700 space-y-2">
                    {aiSuggestions?.split('\n').filter(line => line.trim()).map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                )}
                
                {!aiLoading && (
                  <button
                    onClick={getAISuggestions}
                    className="mt-3 text-sm text-purple-600 hover:text-purple-700"
                  >
                    ↻ Refresh suggestions
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
