import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { 
  Building, Users, TrendingUp, Plus, Archive, FileText, CreditCard,
  Share2, Eye
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { DealDocumentManager } from '../components/DealDocumentManager';
import { CreditStatus } from '../components/syndicator/CreditStatus';
import { ReferralModal } from '../components/ReferralModal';
import { ReferralStatus } from '../components/ReferralStatus';
import { PurchaseCreditsModal } from '../components/PurchaseCreditsModal';
import { Tooltip } from '../components/Tooltip';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import type { Deal } from '../types/database';

export function Dashboard() {
  const { user, profile } = useAuthStore();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
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
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDeals();
      fetchStats();
      fetchCreditInfo();
    }
  }, [user]);

  // Handle profile loading state
  useEffect(() => {
    if (user) {
      // If user exists but no profile, wait a bit for profile to load
      if (!profile) {
        const timer = setTimeout(() => {
          setProfileLoading(false);
        }, 3000); // Wait 3 seconds max for profile to load
        return () => clearTimeout(timer);
      } else {
        setProfileLoading(false);
      }
    } else {
      setProfileLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    if (selectedDeal) {
      fetchDealFiles(selectedDeal);
    }
  }, [selectedDeal]);

  async function fetchDeals() {
    try {
      if (profile?.user_type === 'syndicator') {
        // Fetch deals owned by this syndicator
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
      } else {
        // Fetch deals this investor has shown interest in or favorited
        const { data, error } = await supabase
          .from('deal_interests')
          .select(`
            deals (
              *,
              deal_interests (
                id,
                status
              )
            )
          `)
          .eq('investor_id', user!.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Extract deals from the join result
        const interestedDeals = (data?.map(interest => interest.deals).filter(Boolean) as unknown) as Deal[] || [];
        setDeals(interestedDeals);
      }
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
      if (profile?.user_type === 'syndicator') {
        // Syndicator stats
        // Query 1: Count active deals for this syndicator
        const { count: activeDealsCount, error: activeDealsError } = await supabase
          .from('deals')
          .select('*', { count: 'exact', head: true })
          .eq('syndicator_id', user!.id)
          .eq('status', 'active');

        if (activeDealsError) throw activeDealsError;

        // Query 2: Count unique investors who have shown interest in this syndicator's deals
        const { data: totalInvestorsData, error: totalInvestorsError } = await supabase
          .from('deal_interests')
          .select(`
            investor_id,
            deals!inner(syndicator_id)
          `)
          .eq('deals.syndicator_id', user!.id);

        if (totalInvestorsError) throw totalInvestorsError;

        // Get unique investor count
        const uniqueInvestors = new Set(totalInvestorsData?.map(interest => interest.investor_id) || []);

        // Query 3: Sum total investment requests for this syndicator's deals
        const { data: totalRaisedData, error: totalRaisedError } = await supabase
          .from('investment_requests')
          .select(`
            amount,
            deals!inner(syndicator_id)
          `)
          .eq('deals.syndicator_id', user!.id)
          .in('status', ['approved', 'pending']); // Include approved and pending investments

        if (totalRaisedError) throw totalRaisedError;

        const totalRaised = totalRaisedData?.reduce((sum, request) => sum + request.amount, 0) || 0;

        setStats({
          activeDeals: activeDealsCount || 0,
          totalInvestors: uniqueInvestors.size,
          totalRaised: totalRaised
        });
      } else {
        // Investor stats
        // Query 1: Count deals this investor has shown interest in
        const { count: interestedDealsCount, error: interestedDealsError } = await supabase
          .from('deal_interests')
          .select('*', { count: 'exact', head: true })
          .eq('investor_id', user!.id);

        if (interestedDealsError) throw interestedDealsError;

        // Query 2: Count unique syndicators this investor has interacted with
        const { data: syndicatorData, error: syndicatorError } = await supabase
          .from('deal_interests')
          .select(`
            deals!inner(syndicator_id)
          `)
          .eq('investor_id', user!.id);

        if (syndicatorError) throw syndicatorError;

        // Get unique syndicator count
        const uniqueSyndicators = new Set(syndicatorData?.map(interest => (interest.deals as any)?.syndicator_id).filter(Boolean) || []);

        // Query 3: Sum total investment requests this investor has made
        const { data: investmentData, error: investmentError } = await supabase
          .from('investment_requests')
          .select('amount')
          .eq('user_id', user!.id)
          .in('status', ['approved', 'pending']);

        if (investmentError) throw investmentError;

        const totalInvested = investmentData?.reduce((sum, request) => sum + request.amount, 0) || 0;

        setStats({
          activeDeals: interestedDealsCount || 0,
          totalInvestors: uniqueSyndicators.size,
          totalRaised: totalInvested
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to zero values on error
      setStats({
        activeDeals: 0,
        totalInvestors: 0,
        totalRaised: 0
      });
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

  async function updateDealStatus(dealId: string, newStatus: 'draft' | 'active' | 'archived') {
    setUpdatingStatus(dealId);
    try {
      const { error } = await supabase
        .from('deals')
        .update({ status: newStatus })
        .eq('id', dealId)
        .eq('syndicator_id', user!.id); // Ensure user owns this deal

      if (error) throw error;

      // Get the old status before updating
      const oldStatus = deals.find(d => d.id === dealId)?.status;
      
      // Update local state
      setDeals(deals.map(deal => 
        deal.id === dealId ? { ...deal, status: newStatus } : deal
      ));

      // Refresh stats if status changed to/from active
      if (newStatus === 'active' || oldStatus === 'active') {
        await fetchStats();
      }
    } catch (error) {
      console.error('Error updating deal status:', error);
      alert('Failed to update deal status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Show loading state while profile is being created/fetched
  if (user && !profile && profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Setting up your dashboard...</h2>
                <p className="text-gray-600">This will only take a moment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user exists but no profile after loading timeout, show error
  if (user && !profile && !profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Setup Error</h2>
              <p className="text-gray-600 mb-4">There was an issue setting up your dashboard. Please try refreshing the page.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
                <p className="text-sm text-gray-500">
                  {profile?.user_type === 'syndicator' ? 'Active Deals' : 'Interested Deals'}
                </p>
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
                <p className="text-sm text-gray-500">
                  {profile?.user_type === 'syndicator' ? 'Total Investors' : 'Syndicators'}
                </p>
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
                <p className="text-sm text-gray-500">
                  {profile?.user_type === 'syndicator' ? 'Total Raised' : 'Total Invested'}
                </p>
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
            <h2 className="text-lg font-semibold text-gray-800">
              {profile?.user_type === 'syndicator' ? 'Your Deals' : 'Interested Deals'}
            </h2>
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
                        {profile?.user_type === 'syndicator' ? (
                          <select
                            value={deal.status}
                            onChange={(e) => updateDealStatus(deal.id, e.target.value as 'draft' | 'active' | 'archived')}
                            disabled={updatingStatus === deal.id}
                            className={`px-3 py-1 rounded-full text-sm border-0 focus:ring-2 focus:ring-blue-500 ${
                              deal.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : deal.status === 'draft'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            } ${updatingStatus === deal.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                          </select>
                        ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            deal.status === 'active' ? 'bg-green-100 text-green-800' :
                            deal.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(deal as any).deal_interests?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${deal.total_equity.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <Tooltip content="View deal details">
                            <Link 
                              to={`/deals/${dealSlug}`} 
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
                          </Tooltip>
                          
                          <Tooltip content={selectedDeal === deal.id ? "Hide documents" : "Manage documents"}>
                            <button
                              onClick={() => setSelectedDeal(selectedDeal === deal.id ? null : deal.id)}
                              className={`${selectedDeal === deal.id ? 'text-blue-600' : 'text-gray-600'} hover:text-blue-900`}
                            >
                              <FileText className="h-5 w-5" />
                            </button>
                          </Tooltip>
                          
                          {profile?.user_type === 'syndicator' && (
                            <Tooltip content="Archive deal">
                              <button 
                                onClick={() => updateDealStatus(deal.id, 'archived')}
                                disabled={updatingStatus === deal.id}
                                className={`text-gray-600 hover:text-red-600 ${
                                  updatingStatus === deal.id ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                <Archive className="h-5 w-5" />
                              </button>
                            </Tooltip>
                          )}
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