import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { 
  Building, Users, TrendingUp, Plus, Edit, Archive, FileText, CreditCard,
  Share2, Star
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { DealDocumentManager } from '../components/DealDocumentManager';
import { CreditStatus } from '../components/syndicator/CreditStatus';
import { ReferralModal } from '../components/ReferralModal';
import { ReferralStatus } from '../components/ReferralStatus';
import { PurchaseCreditsModal } from '../components/PurchaseCreditsModal';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import type { Deal } from '../types/database';

export function Dashboard() {
  const { user, profile } = useAuthStore();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeDeals: 0,
    totalInvestors: 0,
    totalRaised: 0
  });
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [dealFiles, setDealFiles] = useState<any[]>([]);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [creditInfo, setCreditInfo] = useState({
    balance: 0,
    price: 2.50
  });

  useEffect(() => {
    if (user) {
      fetchDeals();
      fetchStats();
      fetchCreditInfo();
    }
  }, [user]);

  useEffect(() => {
    if (selectedDeal) {
      fetchDealFiles(selectedDeal);
    }
  }, [selectedDeal]);

  async function fetchDeals() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          deal_interests (
            id,
            status
          )
        `)
        .eq('syndicator_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDealFiles(dealId: string) {
    try {
      const { data, error } = await supabase
        .from('deal_files')
        .select('*')
        .eq('deal_id', dealId);

      if (error) throw error;
      setDealFiles(data || []);
    } catch (error) {
      console.error('Error fetching deal files:', error);
    }
  }

  async function fetchStats() {
    try {
      // This would be replaced with actual aggregation queries
      setStats({
        activeDeals: Math.floor(Math.random() * 5) + 1,
        totalInvestors: Math.floor(Math.random() * 50) + 10,
        totalRaised: Math.floor(Math.random() * 10000000) + 1000000
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  async function fetchCreditInfo() {
    try {
      // Get credit balance
      const { data: credits } = await supabase
        .from('credits')
        .select('balance')
        .eq('syndicator_id', user!.id)
        .single();

      // Get subscription tier for credit price
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select(`
          tier:subscription_tiers(
            extra_credit_price
          )
        `)
        .eq('syndicator_id', user!.id)
        .eq('status', 'active')
        .single();

      setCreditInfo({
        balance: credits?.balance || 0,
        price: subscription?.tier?.extra_credit_price || 2.50
      });
    } catch (error) {
      console.error('Error fetching credit info:', error);
    }
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            {profile?.user_type === 'syndicator' ? 'Syndicator Dashboard' : 'Investor Dashboard'}
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowReferralModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Refer Friends
            </button>
            {profile?.user_type === 'syndicator' && (
              <>
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Buy Credits
                </button>
                <Link
                  to="/deals/new"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Deal
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Referral Status */}
        <div className="mb-8">
          <ReferralStatus />
        </div>

        {/* Credit Status for Syndicators */}
        {profile?.user_type === 'syndicator' && (
          <div className="mb-8">
            <CreditStatus />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Active Deals</p>
                <p className="text-2xl font-bold text-gray-800">{stats.activeDeals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Investors</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalInvestors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Raised</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${stats.totalRaised.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Deals Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Your Deals</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interested Investors
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Raise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deals.map((deal) => {
                  const dealSlug = deal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  return (
                    <tr key={deal.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/deals/${dealSlug}`} className="flex items-center group">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={deal.cover_image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'}
                              alt={deal.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                              {deal.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {deal.location}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          deal.status === 'active' ? 'bg-green-100 text-green-800' :
                          deal.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deal.deal_interests?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${deal.total_equity.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <Link 
                            to={`/deals/${dealSlug}`} 
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => setSelectedDeal(selectedDeal === deal.id ? null : deal.id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <FileText className="h-5 w-5" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Archive className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Manager */}
        {selectedDeal && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Deal Documents
            </h2>
            <DealDocumentManager
              dealId={selectedDeal}
              existingFiles={dealFiles}
              onFilesChange={setDealFiles}
            />
          </div>
        )}

        {showReferralModal && (
          <ReferralModal onClose={() => setShowReferralModal(false)} />
        )}

        {showPurchaseModal && (
          <PurchaseCreditsModal 
            onClose={() => setShowPurchaseModal(false)}
            creditPrice={creditInfo.price}
            currentBalance={creditInfo.balance}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}