import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, TrendingUp, DollarSign, Clock, MapPin, Building2, CheckCircle, Star, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface Deal {
  id: string;
  title: string;
  slug: string;
  location: string;
  property_type: string;
  target_irr: number;
  minimum_investment: number;
  investment_term: number;
  total_equity: number;
  cover_image_url: string;
  syndicators?: {
    company_name: string;
    verification_status: string;
  };
}

interface DealComparisonToolProps {
  isOpen: boolean;
  onClose: () => void;
  initialDealId?: string;
}

export function DealComparisonTool({ isOpen, onClose, initialDealId }: DealComparisonToolProps) {
  const { user } = useAuthStore();
  const [selectedDeals, setSelectedDeals] = useState<(Deal | null)[]>([null, null, null]);
  const [availableDeals, setAvailableDeals] = useState<Deal[]>([]);
  const [showDealPicker, setShowDealPicker] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchDeals();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialDealId && availableDeals.length > 0) {
      const deal = availableDeals.find(d => d.id === initialDealId);
      if (deal) {
        setSelectedDeals([deal, null, null]);
      }
    }
  }, [initialDealId, availableDeals]);

  async function fetchDeals() {
    try {
      const { data } = await supabase
        .from('deals')
        .select(`
          *,
          syndicators (
            company_name,
            verification_status
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      setAvailableDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  }

  const addDeal = (index: number, deal: Deal) => {
    const newDeals = [...selectedDeals];
    newDeals[index] = deal;
    setSelectedDeals(newDeals);
    setShowDealPicker(null);
  };

  const removeDeal = (index: number) => {
    const newDeals = [...selectedDeals];
    newDeals[index] = null;
    setSelectedDeals(newDeals);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const getComparisonColor = (value: number, allValues: number[], higherIsBetter: boolean) => {
    const validValues = allValues.filter(v => v !== undefined && v !== null);
    if (validValues.length < 2) return 'text-gray-900';
    
    const best = higherIsBetter ? Math.max(...validValues) : Math.min(...validValues);
    if (value === best) return 'text-green-600 font-bold';
    return 'text-gray-900';
  };

  if (!isOpen) return null;

  const activeDeals = selectedDeals.filter(d => d !== null) as Deal[];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Compare Deals</h2>
                <p className="text-white/80 text-sm">Compare up to 3 investment opportunities side by side</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Deal Slots */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {selectedDeals.map((deal, index) => (
              <div key={index} className="relative">
                {deal ? (
                  <div className="bg-white border-2 border-blue-200 rounded-xl p-4 h-full">
                    <button
                      onClick={() => removeDeal(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <img
                      src={deal.cover_image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'}
                      alt={deal.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{deal.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {deal.location}
                    </p>
                    {deal.syndicators?.verification_status === 'verified' && (
                      <div className="flex items-center gap-1 mt-2 text-blue-600 text-xs">
                        <CheckCircle className="h-3 w-3" />
                        Verified Syndicator
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDealPicker(index)}
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition"
                  >
                    <Plus className="h-8 w-8 text-gray-400" />
                    <span className="text-gray-500 font-medium">Add Deal</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          {activeDeals.length >= 2 && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Metric</th>
                      {activeDeals.map((deal, i) => (
                        <th key={i} className="text-left py-3 px-4 font-medium text-gray-900">
                          {deal.title.slice(0, 20)}...
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-gray-500">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Target IRR
                        </div>
                      </td>
                      {activeDeals.map((deal, i) => (
                        <td key={i} className={`py-3 px-4 ${getComparisonColor(deal.target_irr, activeDeals.map(d => d.target_irr), true)}`}>
                          {deal.target_irr}%
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-gray-500">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Minimum Investment
                        </div>
                      </td>
                      {activeDeals.map((deal, i) => (
                        <td key={i} className={`py-3 px-4 ${getComparisonColor(deal.minimum_investment, activeDeals.map(d => d.minimum_investment), false)}`}>
                          {formatCurrency(deal.minimum_investment)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Investment Term
                        </div>
                      </td>
                      {activeDeals.map((deal, i) => (
                        <td key={i} className="py-3 px-4">
                          {deal.investment_term} years
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-gray-500">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Property Type
                        </div>
                      </td>
                      {activeDeals.map((deal, i) => (
                        <td key={i} className="py-3 px-4">
                          {deal.property_type}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-gray-500">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location
                        </div>
                      </td>
                      {activeDeals.map((deal, i) => (
                        <td key={i} className="py-3 px-4">
                          {deal.location}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-gray-500">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Syndicator
                        </div>
                      </td>
                      {activeDeals.map((deal, i) => (
                        <td key={i} className="py-3 px-4">
                          {deal.syndicators?.company_name || 'N/A'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* View Deal Buttons */}
              <div className="flex gap-4 mt-6">
                {activeDeals.map((deal, i) => (
                  <Link
                    key={i}
                    to={`/deals/${deal.slug}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    View {deal.title.slice(0, 15)}...
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {activeDeals.length < 2 && (
            <div className="text-center py-8 text-gray-500">
              <p>Select at least 2 deals to compare</p>
            </div>
          )}
        </div>

        {/* Deal Picker Modal */}
        {showDealPicker !== null && (
          <div className="absolute inset-0 bg-white rounded-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Select a Deal</h3>
              <button onClick={() => setShowDealPicker(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableDeals
                .filter(d => !selectedDeals.some(s => s?.id === d.id))
                .map(deal => (
                  <button
                    key={deal.id}
                    onClick={() => addDeal(showDealPicker, deal)}
                    className="text-left bg-white border rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition"
                  >
                    <img
                      src={deal.cover_image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'}
                      alt={deal.title}
                      className="w-full h-24 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{deal.title}</h4>
                    <p className="text-sm text-gray-500">{deal.location}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="text-blue-600 font-medium">{deal.target_irr}% IRR</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{formatCurrency(deal.minimum_investment)} min</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook to manage comparison state across the app
export function useComparisonTool() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialDealId, setInitialDealId] = useState<string | undefined>();

  const openComparison = (dealId?: string) => {
    setInitialDealId(dealId);
    setIsOpen(true);
  };

  const closeComparison = () => {
    setIsOpen(false);
    setInitialDealId(undefined);
  };

  return { isOpen, initialDealId, openComparison, closeComparison };
}

