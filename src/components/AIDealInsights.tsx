import React, { useState, useMemo } from 'react';
import { Sparkles, X, CheckCircle, AlertCircle, HelpCircle, Loader2, FileText, TrendingUp, Shield, Brain, MapPin, Building2, Users, Briefcase } from 'lucide-react';
import { MARKET_DATA, type MarketData } from '../data/marketData';

interface DealData {
  id: string;
  title: string;
  property_type: string;
  location: string;
  minimum_investment: number;
  target_irr: string;
  investment_term: string;
  total_equity: number;
  preferred_return: string;
  equity_multiple: string;
  description: string;
  investment_highlights: string[];
  status: string;
  syndicator?: {
    company_name: string;
    is_verified: boolean;
    total_deal_value?: number;
    years_experience?: number;
  };
  files?: Array<{ category: string; file_name: string }>;
}

interface AIDealInsightsProps {
  deal: DealData;
  className?: string;
}

// Grok API configuration
const XAI_API_KEY = import.meta.env.VITE_XAI_API_KEY;
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';

export function AIDealInsights({ deal, className = '' }: AIDealInsightsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Find matching market data for this deal's location
  const marketData = useMemo(() => {
    if (!deal.location) return null;
    
    const locationLower = deal.location.toLowerCase();
    
    // Try to match city name from location
    return MARKET_DATA.find(market => {
      const cityLower = market.city.toLowerCase();
      const stateLower = market.state.toLowerCase();
      const stateCodeLower = market.stateCode.toLowerCase();
      
      // Check if location contains the city name
      if (locationLower.includes(cityLower)) return true;
      
      // Check for state match if location is just a state
      if (locationLower === stateLower || locationLower === stateCodeLower) return true;
      
      return false;
    });
  }, [deal.location]);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build market context if available
      const marketContext = marketData ? `
MARKET DATA FOR ${marketData.city.toUpperCase()}, ${marketData.stateCode}:
- Market Tier: ${marketData.tier.charAt(0).toUpperCase() + marketData.tier.slice(1)} Market
- Population: ${marketData.population.toLocaleString()} (${marketData.populationGrowth > 0 ? '+' : ''}${marketData.populationGrowth}% YoY growth)
- Median Household Income: $${marketData.medianHouseholdIncome.toLocaleString()}
- Unemployment Rate: ${marketData.unemploymentRate}%
- Job Growth: ${marketData.jobGrowth > 0 ? '+' : ''}${marketData.jobGrowth}% YoY
- Top Industries: ${marketData.topIndustries.join(', ')}
- Median Rent (1BR): $${marketData.medianRent1BR.toLocaleString()}/mo
- Median Rent (2BR): $${marketData.medianRent2BR.toLocaleString()}/mo
- Rent Growth: ${marketData.rentGrowthYoY > 0 ? '+' : ''}${marketData.rentGrowthYoY}% YoY
- Vacancy Rate: ${marketData.vacancyRate}%
- Cap Rate Range: ${marketData.capRateRange.min}% - ${marketData.capRateRange.max}%
- Price Per Unit Range: $${marketData.pricePerUnit.min.toLocaleString()} - $${marketData.pricePerUnit.max.toLocaleString()}
- Investment Score: ${marketData.investmentScore}/100
- Market Highlights: ${marketData.highlights.join('; ')}
- Market Risks: ${marketData.risks.join('; ')}
` : '';

      // Build context about the deal
      const dealContext = `
DEAL INFORMATION:
- Title: ${deal.title}
- Property Type: ${deal.property_type}
- Location: ${deal.location}
- Minimum Investment: $${deal.minimum_investment?.toLocaleString() || 'Not specified'}
- Target IRR: ${deal.target_irr || 'Not specified'}
- Investment Term: ${deal.investment_term || 'Not specified'}
- Total Equity Raise: $${deal.total_equity?.toLocaleString() || 'Not specified'}
- Preferred Return: ${deal.preferred_return || 'Not specified'}
- Equity Multiple: ${deal.equity_multiple || 'Not specified'}
- Syndicator: ${deal.syndicator?.company_name || 'Unknown'}
- Syndicator Verified: ${deal.syndicator?.is_verified ? 'Yes' : 'No'}
- Documents Provided: ${deal.files?.map(f => f.category).join(', ') || 'None listed'}

DEAL DESCRIPTION:
${deal.description || 'No description provided'}

INVESTMENT HIGHLIGHTS:
${deal.investment_highlights?.join('\n') || 'None listed'}
${marketContext}
      `.trim();

      const systemPrompt = `You are an educational assistant helping investors understand real estate syndication deals. You provide NEUTRAL, FACTUAL analysis to help investors conduct their own due diligence.

IMPORTANT RULES:
1. NEVER say a deal is "good", "bad", "risky", or "safe"
2. NEVER recommend investing or not investing
3. NEVER predict returns or outcomes
4. ALWAYS present information neutrally
5. ALWAYS encourage the investor to do their own research
6. Focus on WHAT TO CONSIDER, not WHAT TO DO

Your role is to help investors understand what questions to ask and what information to look for.`;

      const userPrompt = `Based on the following deal information, provide an educational analysis to help the investor understand this opportunity. Structure your response with these sections:

1. **📋 Deal Overview** - A brief, neutral summary of what this deal is (2-3 sentences)

2. **📍 Market Context** - ${marketData ? 'Using the market data provided, explain key factors about this location that investors should understand (population trends, job market, rent trends, etc.). Be factual and neutral.' : 'Note that we don\'t have detailed market data for this specific location - encourage the investor to research local market conditions.'}

3. **✅ Information Provided** - List what information/documents the syndicator HAS included

4. **❓ Information to Request** - List what additional information an investor might want to request before making a decision

5. **🔍 Due Diligence Questions** - 5-7 specific questions the investor should consider asking or researching${marketData ? ', including questions specific to this market' : ''}

6. **📊 Key Metrics to Understand** - Explain what the stated metrics (IRR, equity multiple, preferred return) mean in simple terms${marketData ? ', and how they compare to typical cap rates in this market' : ''}

7. **💡 Educational Notes** - Any general educational information about this type of investment and market that would help the investor

Remember: Be helpful and educational, but NEVER tell them what to do. End with a reminder to consult professionals.

${dealContext}`;

      if (!XAI_API_KEY) {
        throw new Error('AI service not configured. Please contact support.');
      }

      const response = await fetch(XAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'grok-3-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Grok API error:', response.status, errorText);
        throw new Error(`AI service error (${response.status})`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from AI');
      }

      setInsights(content);
    } catch (err: any) {
      console.error('AI Insights error:', err);
      setError('Unable to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!insights && !loading) {
      generateInsights();
    }
  };

  return (
    <>
      {/* Ask AI Button */}
      <button
        onClick={handleOpen}
        className={`w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-purple-500/25 ${className}`}
      >
        <Brain className="h-5 w-5" />
        Ask AI About This Deal
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Deal Insights</h2>
                  <p className="text-purple-200 text-sm">Educational analysis powered by Grok AI</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Disclaimer Banner */}
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <strong>Disclaimer:</strong> This AI-generated analysis is for educational purposes only and does not constitute investment advice. 
                  EquityMD does not endorse or recommend any investment. Always conduct your own due diligence and consult with qualified professionals.
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Market Data Summary Card - Always visible if we have data */}
              {marketData && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">{marketData.city}, {marketData.stateCode} Market Snapshot</h3>
                    <span className={`ml-auto text-xs px-2 py-1 rounded-full font-medium ${
                      marketData.tier === 'primary' ? 'bg-green-100 text-green-700' :
                      marketData.tier === 'secondary' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {marketData.tier.charAt(0).toUpperCase() + marketData.tier.slice(1)} Market
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-white rounded-lg p-2 border border-blue-100">
                      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <Users className="h-3 w-3" />
                        Population
                      </div>
                      <p className="font-semibold text-gray-900">{(marketData.population / 1000000).toFixed(2)}M</p>
                      <p className={`text-xs ${marketData.populationGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {marketData.populationGrowth >= 0 ? '↑' : '↓'} {Math.abs(marketData.populationGrowth)}% YoY
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-2 border border-blue-100">
                      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <Briefcase className="h-3 w-3" />
                        Job Growth
                      </div>
                      <p className="font-semibold text-gray-900">{marketData.jobGrowth >= 0 ? '+' : ''}{marketData.jobGrowth}%</p>
                      <p className="text-xs text-gray-500">{marketData.unemploymentRate}% unemployment</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-2 border border-blue-100">
                      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <Building2 className="h-3 w-3" />
                        Rent Growth
                      </div>
                      <p className="font-semibold text-gray-900">{marketData.rentGrowthYoY >= 0 ? '+' : ''}{marketData.rentGrowthYoY}% YoY</p>
                      <p className="text-xs text-gray-500">${marketData.medianRent2BR.toLocaleString()}/mo 2BR</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-2 border border-blue-100">
                      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <TrendingUp className="h-3 w-3" />
                        Cap Rate
                      </div>
                      <p className="font-semibold text-gray-900">{marketData.capRateRange.min}% - {marketData.capRateRange.max}%</p>
                      <p className="text-xs text-gray-500">{marketData.vacancyRate}% vacancy</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-blue-100">
                    <p className="text-xs text-gray-500">
                      <strong>Top Industries:</strong> {marketData.topIndustries.slice(0, 3).join(', ')} • 
                      <strong className="ml-2">Investment Score:</strong> {marketData.investmentScore}/100
                    </p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping">
                      <Brain className="h-12 w-12 text-purple-300" />
                    </div>
                    <Brain className="h-12 w-12 text-purple-600 relative animate-pulse" />
                  </div>
                  <p className="mt-4 text-gray-600 font-medium">Analyzing deal details...</p>
                  <p className="text-sm text-gray-400">This may take a few seconds</p>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                  <p className="text-gray-600">{error}</p>
                  <button
                    onClick={generateInsights}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {insights && !loading && (
                <div className="prose prose-sm max-w-none">
                  {/* Parse and render the markdown-like content */}
                  {insights.split('\n').map((line, i) => {
                    // Headers with emojis
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <h3 key={i} className="text-lg font-bold text-gray-900 mt-6 mb-3 flex items-center gap-2">
                          {line.replace(/\*\*/g, '')}
                        </h3>
                      );
                    }
                    // Bold headers
                    if (line.match(/^\d+\.\s*\*\*/)) {
                      return (
                        <h3 key={i} className="text-lg font-bold text-gray-900 mt-6 mb-3">
                          {line.replace(/\*\*/g, '')}
                        </h3>
                      );
                    }
                    // List items
                    if (line.startsWith('- ') || line.startsWith('• ')) {
                      return (
                        <div key={i} className="flex items-start gap-2 ml-4 my-1">
                          <span className="text-purple-500 mt-1">•</span>
                          <span className="text-gray-700">{line.substring(2)}</span>
                        </div>
                      );
                    }
                    // Regular paragraphs
                    if (line.trim()) {
                      return <p key={i} className="text-gray-700 my-2">{line}</p>;
                    }
                    return null;
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  Powered by Grok AI • Analysis generated at your request
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
