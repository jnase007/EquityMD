import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, X, Plus, Building2, CheckCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Deal {
  id: string;
  title: string;
  slug: string;
  location: string;
  cover_image_url: string | null;
  property_type: string;
  minimum_investment: number;
  target_irr: number | null;
  investment_term: number | null;
  total_equity: number;
  preferred_return: number | null;
  equity_multiple: number | null;
  status: string;
  syndicator: {
    company_name: string;
    verification_status: string;
  };
}

interface DealComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  initialDeals?: string[]; // Deal IDs
}

const COMPARISON_METRICS = [
  { key: 'minimum_investment', label: 'Minimum Investment', format: 'currency' },
  { key: 'total_equity', label: 'Total Raise', format: 'currency' },
  { key: 'target_irr', label: 'Target IRR', format: 'percent' },
  { key: 'preferred_return', label: 'Preferred Return', format: 'percent' },
  { key: 'equity_multiple', label: 'Equity Multiple', format: 'multiple' },
  { key: 'investment_term', label: 'Investment Term', format: 'years' },
  { key: 'property_type', label: 'Property Type', format: 'text' },
  { key: 'location', label: 'Location', format: 'text' },
];

export function DealComparison({ isOpen, onClose, initialDeals = [] }: DealComparisonProps) {
  const [selectedDeals, setSelectedDeals] = useState<Deal[]>([]);
  const [availableDeals, setAvailableDeals] = useState<Deal[]>([]);
  const [showDealSelector, setShowDealSelector] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchDeals();
    }
  }, [isOpen]);

  async function fetchDeals() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          id, title, slug, location, cover_image_url, property_type,
          minimum_investment, target_irr, investment_term, total_equity,
          preferred_return, equity_multiple, status,
          syndicator:syndicators (
            company_name,
            verification_status
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setAvailableDeals(data || []);
      
      // Load initial deals if provided
      if (initialDeals.length > 0) {
        const initial = (data || []).filter(d => initialDeals.includes(d.id));
        setSelectedDeals(initial);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  }

  function addDeal(deal: Deal) {
    if (selectedDeals.length < 4 && !selectedDeals.find(d => d.id === deal.id)) {
      setSelectedDeals([...selectedDeals, deal]);
    }
    setShowDealSelector(false);
  }

  function removeDeal(dealId: string) {
    setSelectedDeals(selectedDeals.filter(d => d.id !== dealId));
  }

  const formatValue = (value: any, format: string) => {
    if (value === null || value === undefined) return '—';
    
    switch (format) {
      case 'currency':
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
        return `$${value.toLocaleString()}`;
      case 'percent':
        return `${value}%`;
      case 'multiple':
        return `${value}x`;
      case 'years':
        return `${value} years`;
      default:
        return value;
    }
  };

  const getBestValue = (key: string, format: string) => {
    if (selectedDeals.length < 2) return null;
    
    const values = selectedDeals.map(d => (d as any)[key]).filter(v => v !== null);
    if (values.length === 0) return null;

    // Higher is better for IRR, preferred return, equity multiple
    // Lower is better for minimum investment
    if (['target_irr', 'preferred_return', 'equity_multiple'].includes(key)) {
      return Math.max(...values);
    }
    if (['minimum_investment'].includes(key)) {
      return Math.min(...values);
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Scale className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Compare Deals</h2>
              <p className="text-sm text-gray-500">Side-by-side comparison of up to 4 deals</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-4 px-4 bg-gray-50 rounded-tl-xl w-48">
                      <span className="text-sm font-semibold text-gray-500">Metric</span>
                    </th>
                    
                    {selectedDeals.map((deal, idx) => (
                      <th key={deal.id} className={`py-4 px-4 bg-gray-50 min-w-[200px] ${idx === selectedDeals.length - 1 && selectedDeals.length < 4 ? '' : ''}`}>
                        <div className="relative">
                          <button
                            onClick={() => removeDeal(deal.id)}
                            className="absolute -top-1 -right-1 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          
                          <div className="w-16 h-12 rounded-lg bg-gray-200 overflow-hidden mx-auto mb-2">
                            {deal.cover_image_url ? (
                              <img src={deal.cover_image_url} alt={deal.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <Link 
                            to={`/deals/${deal.slug}`}
                            className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                          >
                            {deal.title}
                          </Link>
                          <p className="text-xs text-gray-500 mt-1">{deal.syndicator?.company_name}</p>
                        </div>
                      </th>
                    ))}
                    
                    {/* Add Deal Column */}
                    {selectedDeals.length < 4 && (
                      <th className={`py-4 px-4 bg-gray-50 min-w-[200px] ${selectedDeals.length === 3 ? 'rounded-tr-xl' : ''}`}>
                        <div className="relative">
                          <button
                            onClick={() => setShowDealSelector(!showDealSelector)}
                            className="w-16 h-12 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 flex items-center justify-center mx-auto mb-2 transition-colors"
                          >
                            <Plus className="h-6 w-6 text-gray-400" />
                          </button>
                          <p className="text-sm text-gray-500">Add Deal</p>
                          
                          {/* Deal Selector Dropdown */}
                          {showDealSelector && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-10 max-h-64 overflow-y-auto">
                              {availableDeals
                                .filter(d => !selectedDeals.find(s => s.id === d.id))
                                .map(deal => (
                                  <button
                                    key={deal.id}
                                    onClick={() => addDeal(deal)}
                                    className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
                                  >
                                    <div className="w-10 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                      {deal.cover_image_url ? (
                                        <img src={deal.cover_image_url} alt={deal.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <Building2 className="h-4 w-4 text-gray-300" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{deal.title}</p>
                                      <p className="text-xs text-gray-500 truncate">{deal.location}</p>
                                    </div>
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
                
                <tbody>
                  {COMPARISON_METRICS.map((metric, idx) => {
                    const bestValue = getBestValue(metric.key, metric.format);
                    
                    return (
                      <tr key={metric.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="py-4 px-4 font-medium text-gray-700">
                          {metric.label}
                        </td>
                        
                        {selectedDeals.map(deal => {
                          const value = (deal as any)[metric.key];
                          const isBest = bestValue !== null && value === bestValue;
                          
                          return (
                            <td key={deal.id} className="py-4 px-4 text-center">
                              <span className={`${isBest ? 'text-emerald-600 font-semibold' : 'text-gray-900'}`}>
                                {formatValue(value, metric.format)}
                                {isBest && <CheckCircle className="h-4 w-4 inline ml-1" />}
                              </span>
                            </td>
                          );
                        })}
                        
                        {selectedDeals.length < 4 && <td className="py-4 px-4" />}
                      </tr>
                    );
                  })}
                  
                  {/* Syndicator Verification Row */}
                  <tr className="bg-white">
                    <td className="py-4 px-4 font-medium text-gray-700">
                      Syndicator Status
                    </td>
                    {selectedDeals.map(deal => (
                      <td key={deal.id} className="py-4 px-4 text-center">
                        {deal.syndicator?.verification_status === 'verified' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600">
                            <CheckCircle className="h-4 w-4" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-gray-500">Unverified</span>
                        )}
                      </td>
                    ))}
                    {selectedDeals.length < 4 && <td className="py-4 px-4" />}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          
          {selectedDeals.length === 0 && !loading && (
            <div className="text-center py-12">
              <Scale className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No deals selected</h3>
              <p className="text-gray-500 mb-4">Add deals to compare them side by side</p>
              <button
                onClick={() => setShowDealSelector(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add First Deal
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {selectedDeals.length} of 4 deals selected
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

