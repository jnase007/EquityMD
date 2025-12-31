import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../lib/store";
import { supabase } from "../lib/supabase";
import {
  Building2,
  Plus,
  Edit,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Loader2,
  MapPin,
  Users,
  ExternalLink,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";

interface Syndicator {
  id: string;
  company_name: string;
  company_description: string | null;
  company_logo_url: string | null;
  verification_status: "unverified" | "verified" | "premier";
  claimed_by: string | null;
  claimed_at: string | null;
  claimable: boolean;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

interface Deal {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  status: 'draft' | 'active' | 'closed';
  cover_image_url: string | null;
  minimum_investment: number | null;
  target_irr: number | null;
  investment_term: number | null;
  deal_interests?: { id: string }[];
  investment_requests?: { id: string; status: string; amount: number }[];
}

interface SyndicatorManagerProps {
  onCreateNew: () => void;
  onEditSyndicator: (syndicator: Syndicator) => void;
}

export function SyndicatorManager({
  onCreateNew,
  onEditSyndicator,
}: SyndicatorManagerProps) {
  const { user, profile } = useAuthStore();
  const [syndicators, setSyndicators] = useState<Syndicator[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSyndicatorName, setNewSyndicatorName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserSyndicators();
    }
  }, [user]);

  // Fetch deals when syndicators change
  useEffect(() => {
    if (syndicators.length > 0) {
      fetchDeals(syndicators[0].id);
    }
  }, [syndicators]);

  async function fetchUserSyndicators() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("syndicators")
        .select("*")
        .eq("claimed_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSyndicators(data || []);
    } catch (error) {
      console.error("Error fetching syndicators:", error);
      toast.error("Failed to load your syndicators");
    } finally {
      setLoading(false);
    }
  }

  async function fetchDeals(syndicatorId: string) {
    setLoadingDeals(true);
    try {
      const { data, error } = await supabase
        .from("deals")
        .select(`
          *,
          deal_interests (id),
          investment_requests (id, status, amount)
        `)
        .eq("syndicator_id", syndicatorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setLoadingDeals(false);
    }
  }

  async function createNewSyndicator() {
    if (!user || !newSyndicatorName.trim()) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("syndicators")
        .insert([
          {
            company_name: newSyndicatorName.trim(),
            claimed_by: user.id,
            claimed_at: new Date().toISOString(),
            claimable: false, // User-created syndicators are not claimable by others
            verification_status: "unverified",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSyndicators([data, ...syndicators]);
      setNewSyndicatorName("");
      setShowCreateForm(false);
      toast.success("Syndicator created successfully!");

      // Auto-edit the new syndicator
      onEditSyndicator(data);
    } catch (error) {
      console.error("Error creating syndicator:", error);
      toast.error("Failed to create syndicator");
    } finally {
      setCreating(false);
    }
  }

  async function deleteSyndicator(syndicatorId: string, companyName: string) {
    if (
      !window.confirm(
        `Are you sure you want to delete "${companyName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("syndicators")
        .delete()
        .eq("id", syndicatorId)
        .eq("claimed_by", user?.id); // Extra safety check

      if (error) throw error;

      setSyndicators(syndicators.filter((s) => s.id !== syndicatorId));
      toast.success("Syndicator deleted successfully");
    } catch (error) {
      console.error("Error deleting syndicator:", error);
      toast.error("Failed to delete syndicator");
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </span>
        );
      case "premier":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Premier
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Unverified
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // If user has a syndicator, show their business profile
  const primarySyndicator = syndicators[0];

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Your Business Profile
              </h2>
              <p className="text-purple-200 text-sm">Manage your syndicator identity</p>
            </div>
          </div>
          {primarySyndicator && (
            <button
              onClick={() => onEditSyndicator(primarySyndicator)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Create Business Profile Form */}
        {showCreateForm && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Set Up Your Business</h3>
                <p className="text-sm text-gray-500">Enter your company or LLC name to get started</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business / Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSyndicatorName}
                  onChange={(e) => setNewSyndicatorName(e.target.value)}
                  placeholder="e.g., Acme Real Estate Partners LLC"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-purple-500 transition-colors text-lg"
                  onKeyPress={(e) => e.key === "Enter" && createNewSyndicator()}
                  autoFocus
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={createNewSyndicator}
                  disabled={creating || !newSyndicatorName.trim()}
                  className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-5 w-5" />
                      Continue Setup
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewSyndicatorName("");
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white/70 rounded-xl border border-purple-100">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-purple-700">💡 Next:</span> You'll add your logo, description, and track record to complete your profile.
              </p>
            </div>
          </div>
        )}

        {/* No Business Profile Yet */}
        {syndicators.length === 0 && !showCreateForm ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-10 w-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Set Up Your Business Profile
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Create your company profile to start listing deals and connecting with accredited investors.
            </p>
            
            {/* Quick Setup Steps */}
            <div className="flex justify-center gap-6 mb-8">
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 font-bold">1</span>
                </div>
                <p className="text-xs text-gray-500">Company Info</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
                <p className="text-xs text-gray-500">Add Logo</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <p className="text-xs text-gray-500">List Deals</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition shadow-lg shadow-purple-500/25 font-semibold group"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Create Business Profile
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : primarySyndicator ? (
          /* Show Single Business Profile */
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden border-2 border-gray-200 flex-shrink-0">
                {primarySyndicator.company_logo_url ? (
                  <img
                    src={primarySyndicator.company_logo_url}
                    alt={primarySyndicator.company_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-gray-400" />
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {primarySyndicator.company_name}
                  </h3>
                  {getStatusBadge(primarySyndicator.verification_status)}
                </div>
                
                {primarySyndicator.company_description ? (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {primarySyndicator.company_description}
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm italic mb-3">
                    No description yet – 
                    <button 
                      onClick={() => onEditSyndicator(primarySyndicator)} 
                      className="text-purple-600 hover:underline ml-1"
                    >
                      add one to attract investors
                    </button>
                  </p>
                )}
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onEditSyndicator(primarySyndicator)}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    Edit Profile
                  </button>
                  <Link
                    to="/deals/new"
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition font-medium"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Create Deal
                  </Link>
                  {primarySyndicator.slug && (
                    <a
                      href={`/syndicator/${primarySyndicator.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      View Public Page
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {/* Missing Info Warning */}
            {(!primarySyndicator.company_logo_url || !primarySyndicator.company_description) && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm flex-1">
                  <p className="font-medium text-amber-800">Complete your profile to attract more investors</p>
                  <p className="text-amber-600 mt-0.5">
                    {!primarySyndicator.company_logo_url && "Add a logo"} 
                    {!primarySyndicator.company_logo_url && !primarySyndicator.company_description && " and "}
                    {!primarySyndicator.company_description && "add a description"}
                    {" to increase visibility."}
                  </p>
                </div>
                <button
                  onClick={() => onEditSyndicator(primarySyndicator)}
                  className="px-3 py-1.5 bg-amber-200 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-300 transition flex-shrink-0"
                >
                  Complete Now
                </button>
              </div>
            )}
            
            {/* Pro Tip - Only show if profile incomplete */}
            {(!primarySyndicator.company_logo_url || !primarySyndicator.company_description) && (
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                <p className="text-sm text-emerald-800">
                  <span className="font-semibold">💡 Pro tip:</span> Completing your profile increases your chances of getting verified and appearing in featured listings.
                </p>
              </div>
            )}

            {/* Your Deals Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Your Listings</h3>
                  <p className="text-sm text-gray-500">
                    {deals.length === 0 
                      ? "Create your first investment opportunity" 
                      : `${deals.length} deal${deals.length !== 1 ? 's' : ''} listed`
                    }
                  </p>
                </div>
                <Link
                  to="/deals/new"
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  New Deal
                </Link>
              </div>

              {loadingDeals ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />
                  ))}
                </div>
              ) : deals.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">No deals yet</h4>
                  <p className="text-sm text-gray-500 mb-4">List your first investment opportunity</p>
                  <Link
                    to="/deals/new"
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition"
                  >
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    Create Your First Deal
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deals.map((deal) => {
                    const interestCount = deal.deal_interests?.length || 0;
                    
                    return (
                      <div 
                        key={deal.id}
                        className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-emerald-300 transition-all"
                      >
                        {/* Cover Image */}
                        <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                          {deal.cover_image_url ? (
                            <img 
                              src={deal.cover_image_url} 
                              alt={deal.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="h-10 w-10 text-gray-300" />
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              deal.status === 'active' 
                                ? 'bg-emerald-500 text-white'
                                : deal.status === 'draft'
                                ? 'bg-gray-700 text-white'
                                : 'bg-amber-500 text-white'
                            }`}>
                              {deal.status === 'active' ? 'Live' : deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                            </span>
                          </div>
                          
                          {/* Quick Actions on Hover */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Link
                              to={`/deals/${deal.slug}/edit`}
                              className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100 transition flex items-center gap-1"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                            <Link
                              to={`/deals/${deal.slug}`}
                              className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition flex items-center gap-1"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              View
                            </Link>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 truncate mb-1 group-hover:text-emerald-600 transition-colors">
                            {deal.title}
                          </h4>
                          
                          {deal.location && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{deal.location}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              {deal.minimum_investment && (
                                <span className="flex items-center gap-1 text-gray-600">
                                  <DollarSign className="h-3 w-3" />
                                  ${(deal.minimum_investment / 1000).toFixed(0)}K min
                                </span>
                              )}
                              {deal.target_irr && (
                                <span className="text-emerald-600 font-medium">
                                  {deal.target_irr}% IRR
                                </span>
                              )}
                            </div>
                            
                            {interestCount > 0 && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <Users className="h-3 w-3" />
                                {interestCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Add New Deal Card */}
                  <Link
                    to="/deals/new"
                    className="group flex flex-col items-center justify-center min-h-[200px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Plus className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-emerald-700 transition-colors">
                      Add New Listing
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
