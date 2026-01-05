import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, DollarSign, Building, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SimilarDeal {
  id: string;
  title: string;
  slug: string;
  location: string;
  property_type: string;
  target_irr: number;
  minimum_investment: number;
  cover_image_url: string | null;
  syndicator?: {
    company_name: string;
  };
}

interface SimilarDealsProps {
  currentDealId: string;
  propertyType: string;
  location: string;
}

export function SimilarDeals({ currentDealId, propertyType, location }: SimilarDealsProps) {
  const [deals, setDeals] = useState<SimilarDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimilarDeals();
  }, [currentDealId, propertyType, location]);

  async function fetchSimilarDeals() {
    try {
      // First try to find deals with same property type
      const { data: sameTypeDeals } = await supabase
        .from('deals')
        .select(`
          id, title, slug, location, property_type, target_irr, 
          minimum_investment, cover_image_url,
          syndicator:syndicator_id(company_name)
        `)
        .eq('status', 'active')
        .eq('property_type', propertyType)
        .neq('id', currentDealId)
        .limit(3);

      // Extract location parts (city, state) for matching
      const locationParts = location.split(',').map(p => p.trim());
      const state = locationParts[locationParts.length - 1];

      // If we don't have enough same-type deals, get deals from same location
      let combinedDeals = sameTypeDeals || [];
      
      if (combinedDeals.length < 3) {
        const { data: sameLocationDeals } = await supabase
          .from('deals')
          .select(`
            id, title, slug, location, property_type, target_irr, 
            minimum_investment, cover_image_url,
            syndicator:syndicator_id(company_name)
          `)
          .eq('status', 'active')
          .ilike('location', `%${state}%`)
          .neq('id', currentDealId)
          .neq('property_type', propertyType)
          .limit(3 - combinedDeals.length);

        if (sameLocationDeals) {
          combinedDeals = [...combinedDeals, ...sameLocationDeals];
        }
      }

      // If still not enough, get any active deals
      if (combinedDeals.length < 3) {
        const existingIds = combinedDeals.map(d => d.id);
        const { data: otherDeals } = await supabase
          .from('deals')
          .select(`
            id, title, slug, location, property_type, target_irr, 
            minimum_investment, cover_image_url,
            syndicator:syndicator_id(company_name)
          `)
          .eq('status', 'active')
          .neq('id', currentDealId)
          .not('id', 'in', `(${existingIds.join(',')})`)
          .limit(3 - combinedDeals.length);

        if (otherDeals) {
          combinedDeals = [...combinedDeals, ...otherDeals];
        }
      }

      setDeals(combinedDeals.slice(0, 3));
    } catch (error) {
      console.error('Error fetching similar deals:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Similar Deals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-xl mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return null; // Don't show section if no similar deals
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Building className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Similar Opportunities</h3>
          </div>
          <Link 
            to="/deals" 
            className="text-white/80 hover:text-white text-sm font-medium flex items-center gap-1 transition"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deals.map((deal) => (
            <Link
              key={deal.id}
              to={`/deals/${deal.slug}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              {/* Image */}
              <div className="relative h-32 overflow-hidden">
                <img
                  src={deal.cover_image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'}
                  alt={deal.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur text-xs font-medium rounded-full text-gray-700">
                    {deal.property_type}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition line-clamp-1">
                  {deal.title}
                </h4>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="line-clamp-1">{deal.location}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-emerald-600 font-medium">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {deal.target_irr}% IRR
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-3 w-3" />
                    {deal.minimum_investment >= 1000 
                      ? `${(deal.minimum_investment / 1000).toFixed(0)}K min`
                      : `${deal.minimum_investment} min`
                    }
                  </div>
                </div>

                {deal.syndicator?.company_name && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    by {deal.syndicator.company_name}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

