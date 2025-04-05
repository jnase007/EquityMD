import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Search, Filter, Building2, MapPin, DollarSign, TrendingUp, Clock, Plus, Edit, Archive, CheckCircle, XCircle } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  location: string;
  property_type: string;
  minimum_investment: number;
  target_irr: number;
  investment_term: number;
  status: string;
  cover_image_url: string;
  created_at: string;
  syndicator: {
    company_name: string;
  };
}

export function PropertyManagement() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          syndicator:syndicator_id (
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.syndicator?.company_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filter === 'all' ||
      deal.status === filter;

    return matchesSearch && matchesFilter;
  });

  const updateDealStatus = async (dealId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({ status })
        .eq('id', dealId);

      if (error) throw error;

      setDeals(deals.map(deal => 
        deal.id === dealId ? { ...deal, status } : deal
      ));
    } catch (error) {
      console.error('Error updating deal:', error);
    }
  };

  if (loading) {
    return <div>Loading properties...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Property Management</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Properties</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <Link
            to="/deals/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Property
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Syndicator</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDeals.map((deal) => (
              <tr key={deal.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        src={deal.cover_image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'}
                        alt={deal.title}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {deal.location}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{deal.syndicator?.company_name}</div>
                  <div className="text-sm text-gray-500">{deal.property_type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Min: ${deal.minimum_investment.toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Target: {deal.target_irr}% IRR
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Term: {deal.investment_term} years
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={deal.status}
                    onChange={(e) => updateDealStatus(deal.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      deal.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : deal.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    <Link 
                      to={`/deals/${deal.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => updateDealStatus(deal.id, 'archived')}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Archive className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}