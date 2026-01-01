import React, { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import {
  MapPin,
  Building,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  ChevronRight,
  AlertCircle,
  Globe,
  Briefcase,
  MessageCircle,
  Wallet,
  Play,
  Info,
  Edit,
  Settings,
  Eye,
  Share2,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { MessageModal } from "../components/MessageModal";
import { DealMediaGallery } from "../components/DealMediaGallery";
import { VideoEmbed } from "../components/VideoEmbed";
import { AuthModal } from "../components/AuthModal";
import { FavoriteButton } from "../components/FavoriteButton";
import { DocumentRoom } from "../components/DocumentRoom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../lib/store";
import { getSyndicatorLogo } from "../lib/syndicator-logos";
import { Tooltip } from "react-tooltip";
import type { Deal, DealFile } from "../types/database";
import { ReturnsCalculator } from "../components/ReturnsCalculator";
import { CountdownTimer } from "../components/CountdownTimer";

interface DealMedia {
  id: string;
  type: "image" | "video";
  url: string;
  title: string;
  description: string;
  order: number;
}

interface DealWithSyndicator extends Deal {
  syndicator?: {
    company_name: string;
    company_logo_url: string | null;
    years_in_business: number | null;
    company_description: string | null;
    website_url: string | null;
    total_deal_volume: number | null;
    city: string | null;
    state: string | null;
    average_rating: number | null;
    total_reviews: number | null;
    claimed_by: string | null;
  };
}

export function DealDetails() {
  const { slug } = useParams();
  const { user } = useAuthStore();
  const [deal, setDeal] = useState<DealWithSyndicator | null>(null);
  const [files, setFiles] = useState<DealFile[]>([]);
  const [media, setMedia] = useState<DealMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAccredited, setIsAccredited] = useState(false);
  const [investmentRequests, setInvestmentRequests] = useState({
    count: 0,
    loading: true,
  });

  // Check if user is accredited
  useEffect(() => {
    async function checkAccreditation() {
      if (!user) {
        setIsAccredited(false);
        return;
      }
      try {
        const { data } = await supabase
          .from('investor_profiles')
          .select('accredited_status')
          .eq('id', user.id)
          .maybeSingle();
        setIsAccredited(data?.accredited_status || false);
      } catch {
        setIsAccredited(false);
      }
    }
    checkAccreditation();
  }, [user]);

  useEffect(() => {
    fetchDealDetails();
  }, [slug]);

  async function fetchInvestmentRequestCount(dealId: string) {
    try {
      // Check if investment_requests table exists first
      const { count, error } = await supabase
        .from("investment_requests")
        .select("*", { count: "exact", head: true })
        .eq("deal_id", dealId);

      if (error) {
        // If table doesn't exist, just set count to 0
        console.log("Investment requests table not found yet:", error);
        setInvestmentRequests({
          count: 0,
          loading: false,
        });
        return;
      }

      setInvestmentRequests({
        count: count || 0,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching investment request count:", error);
      setInvestmentRequests({
        count: 0,
        loading: false,
      });
    }
  }

  // Track deal view
  async function trackDealView(dealId: string) {
    try {
      // Check if we've already viewed this deal in this session
      const viewedKey = `deal_viewed_${dealId}`;
      if (sessionStorage.getItem(viewedKey)) {
        return; // Already tracked this session
      }

      // Call the increment function
      await supabase.rpc('increment_deal_view', { deal_uuid: dealId });

      // Also record detailed view for analytics
      await supabase.from('deal_views').insert({
        deal_id: dealId,
        viewer_id: user?.id || null,
      });

      // Mark as viewed for this session
      sessionStorage.setItem(viewedKey, 'true');
    } catch (error) {
      // Don't block page load if view tracking fails
      console.error('Error tracking deal view:', error);
    }
  }

  async function fetchDealDetails() {
    try {
      // Find deal by slug directly
      if (!slug) {
        setLoading(false);
        return;
      }

      console.log("Fetching deal with slug:", slug);

      const { data: dealData, error: dealError } = await supabase
        .from("deals")
        .select(
          `
          *,
          syndicator:syndicator_id (
            company_name,
            company_logo_url,
            years_in_business,
            company_description,
            website_url,
            total_deal_volume,
            city,
            state,
            average_rating,
            total_reviews,
            claimed_by
          )
        `
        )
        .eq("slug", slug)
        .single();

      console.log("Fetched deal data:", dealData);

      if (dealError || !dealData) {
        console.error("Error fetching deal:", dealError);

        // No deal found in database
        return;
      }

      setDeal(dealData);

      // Track view (fire and forget - don't block the page load)
      trackDealView(dealData.id);

      // Fetch deal files - show both public and private files to authenticated users
      setFiles(dealData.documents || []);

      // Fetch deal media
      const { data: mediaData, error: mediaError } = await supabase
        .from("deal_media")
        .select("*")
        .eq("deal_id", dealData.id)
        .order("order", { ascending: true });

      if (mediaError) throw mediaError;
      setMedia(mediaData || []);

      // Fetch investment request count for this deal
      await fetchInvestmentRequestCount(dealData.id);
    } catch (error) {
      console.error("Error fetching deal details:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = (action: "invest" | "contact") => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (action === "invest") {
      setShowInvestModal(true);
    } else {
      setShowMessageModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading deal details...</div>
      </div>
    );
  }

  if (!deal) {
    return <Navigate to="/404" />;
  }

  // Remove progress percentage calculation as we're now tracking requests, not funding
  const syndicatorSlug = deal.syndicator?.company_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <head>
        <title>Invest in Top CRE Deals | EquityMD</title>
        <meta
          name="description"
          content="Explore CRE deals with active investment requests on EquityMD. Connect with verified syndicators and join accredited investors in commercial real estate opportunities."
        />
        <meta
          name="keywords"
          content="CRE investment, commercial real estate deals, accredited investors, investment requests, real estate syndication"
        />
      </head>
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[450px]">
        <img
          src={
            deal.cover_image_url ||
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80"
          }
          alt={deal.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 text-white">
            <nav className="flex items-center text-sm mb-6">
              <span className="text-white/70 hover:text-white cursor-pointer">Deals</span>
              <ChevronRight className="h-4 w-4 mx-2 text-white/50" />
              <span className="text-white/70 hover:text-white cursor-pointer">{deal.property_type}</span>
              <ChevronRight className="h-4 w-4 mx-2 text-white/50" />
              <span className="text-white">{deal.title}</span>
            </nav>
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl lg:text-5xl font-bold">{deal.title}</h1>
              {/* Edit Button - Only visible to deal owner */}
              {user && deal.syndicator?.claimed_by === user.id && (
                <Link
                  to={`/deals/${deal.slug}/edit`}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Edit className="h-4 w-4" />
                  Edit Deal
                </Link>
              )}
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{deal.location}</span>
            </div>
            {/* View count and share buttons */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Eye className="h-4 w-4" />
                <span>{deal.view_count || 0} views</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    const text = `Check out this investment opportunity: ${deal.title}`;
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                  }}
                  className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg transition-colors"
                  title="Share on LinkedIn"
                >
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    const text = `Check out this investment opportunity: ${deal.title}`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                  }}
                  className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg transition-colors"
                  title="Share on X"
                >
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    const subject = `Investment Opportunity: ${deal.title}`;
                    const body = `I thought you might be interested in this real estate investment opportunity:\n\n${deal.title}\n${deal.location}\n\n${url}`;
                    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  }}
                  className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg transition-colors"
                  title="Share via Email"
                >
                  <Share2 className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery Section (keep at top) */}
            {media.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Property Gallery</h2>
                <DealMediaGallery media={media} />
              </div>
            )}

            {/* Video Pitch Section - Shows if deal has video_url */}
            {deal.video_url && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <Play className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Video Pitch</h2>
                      <p className="text-slate-400 text-sm">Watch the syndicator present this opportunity</p>
                    </div>
                  </div>
                  <VideoEmbed
                    url={deal.video_url}
                    title={`${deal.title} Video Pitch`}
                    className="rounded-xl overflow-hidden"
                  />
                </div>
              </div>
            )}

            {/* Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">Investment Overview</h2>
              <p className="text-gray-600 mb-6">{deal.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-gray-500 text-sm mb-1">
                    Property Type
                  </div>
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">{deal.property_type}</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm mb-1">
                    Investment Term
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">
                      {deal.investment_term} years
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm mb-1">Target IRR</div>
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">{deal.target_irr}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Highlights */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Highlights</h2>
              <ul className="space-y-4">
                {deal.investment_highlights?.map((highlight, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-sm font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <span className="ml-3 text-gray-600">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Document Room */}
            <DocumentRoom 
              dealId={deal.id}
              dealTitle={deal.title}
              isOwner={user?.id === deal.syndicator?.claimed_by}
              syndicatorId={deal.syndicator_id}
            />

            {/* Returns Calculator directly after Documents */}
            <div className="max-w-2xl mx-auto px-4">
              <ReturnsCalculator />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-8 h-fit">
            {/* Countdown Timer - only show if closing_date is set */}
            {deal.closing_date && (
              <CountdownTimer
                endDate={new Date(deal.closing_date)}
                className="mb-6"
              />
            )}

            {/* Syndicator Information */}
            {deal.syndicator && (
              <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-100 rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-1 mb-4">
                  <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                    <span>⭐</span> FEATURED
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {deal.syndicator.company_logo_url ? (
                      <img
                        src={deal.syndicator.company_logo_url}
                        alt={deal.syndicator.company_name}
                        className="w-20 h-20 rounded-lg object-cover bg-white border border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-blue-100 flex items-center justify-center border border-gray-200">
                        <Briefcase className="h-10 w-10 text-blue-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {deal.syndicator.company_name}
                    </h3>
                    {(deal.syndicator.city || deal.syndicator.state) && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>
                          {deal.syndicator.city && deal.syndicator.state
                            ? `${deal.syndicator.city}, ${deal.syndicator.state}`
                            : deal.syndicator.city || deal.syndicator.state}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="text-yellow-500 mr-1">⭐</span>
                      <span className="font-semibold text-gray-900">
                        {deal.syndicator.average_rating?.toFixed(1) || "0"}
                      </span>
                      <span className="ml-1">
                        ({deal.syndicator.total_reviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {deal.syndicator.website_url && (
                  <a
                    href={deal.syndicator.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full bg-white text-blue-600 border border-blue-600 py-2 rounded-lg hover:bg-blue-50 transition flex items-center justify-center text-sm font-medium"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </a>
                )}
              </div>
            )}

            {/* Investment Interest */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <h3 className="text-xl font-bold">Investment Interest</h3>
                <Info
                  className="h-4 w-4 text-gray-400 ml-2 cursor-help"
                  data-tooltip-id="interest-tooltip"
                />
                <Tooltip
                  id="interest-tooltip"
                  content="Number of investors requesting to invest in this deal"
                  place="top"
                />
              </div>
              <div className="space-y-4">
              {investmentRequests.count > 0 && <div className="flex items-center justify-between py-4 border-b">
                   <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-gray-600">Investment Requests</span>
                  </div>
                  {investmentRequests.loading ? (
                    <Skeleton height={24} width={32} />
                  ) : (
                    <span className="font-bold text-2xl text-blue-600">
                      {investmentRequests.count}+
                    </span>
                  )}
                </div>}

                <div className="flex items-center justify-between py-4 border-b">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-500">Minimum Investment</span>
                  </div>
                  <span className="font-medium">
                    ${deal.minimum_investment.toLocaleString()}
                  </span>
                </div>

                {/* Only show active interest when there are 10+ requests */}
                {!investmentRequests.loading && investmentRequests.count >= 10 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-800">
                      <strong>Active Interest:</strong> This deal has received{" "}
                      {investmentRequests.count} investment requests from accredited investors.
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 mt-6">
                {/* Owner View - Can't invest in your own deal */}
                {user && deal.syndicator?.claimed_by === user.id ? (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <div className="text-purple-700 font-medium mb-2">This is your listing</div>
                    <Link
                      to={`/deals/${deal.slug}/edit`}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Deal
                    </Link>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleAction("invest")}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                    >
                      <Wallet className="h-5 w-5 mr-2" />
                      Invest Now
                    </button>

                    <button
                      onClick={() => handleAction("contact")}
                      className="w-full bg-white text-blue-600 border-2 border-blue-600 py-3 rounded-lg hover:bg-blue-50 transition flex items-center justify-center"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Contact Syndicator
                    </button>
                  </>
                )}

                <FavoriteButton dealId={deal.id} className="w-full py-3" />
              </div>
            </div>


            {/* Accredited Status */}
            {isAccredited ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-green-500 mr-2" />
                  <div className="text-sm text-green-700">
                    ✓ You're verified as an accredited investor and can invest in this opportunity.
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                  <div className="text-sm text-yellow-700">
                    This investment is for accredited investors.{' '}
                    {user ? (
                      <Link to="/profile" className="underline font-medium hover:text-yellow-800">
                        Update your profile
                      </Link>
                    ) : (
                      <button onClick={() => setShowAuthModal(true)} className="underline font-medium hover:text-yellow-800">
                        Sign in to verify
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Platform Disclaimer */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-500 space-y-2">
                <p>
                  <strong>Platform Disclaimer:</strong> EquityMD is a listing platform only. 
                  EquityMD does not verify, endorse, or guarantee any information in this listing.
                </p>
                <p>
                  The syndicator is solely responsible for all content and compliance with securities laws. 
                  EquityMD is not a broker-dealer, investment advisor, or funding portal, and does not facilitate 
                  any transactions or introductions. Always conduct your own due diligence before investing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMessageModal && deal && (
        <MessageModal
          dealId={deal.id}
          dealTitle={deal.title}
          dealSlug={deal.slug}
          receiverId={deal.syndicator?.claimed_by || deal.syndicator_id}
          syndicatorName={deal.syndicator?.company_name || "Syndicator"}
          onClose={() => setShowMessageModal(false)}
        />
      )}

      {showInvestModal && deal && (
        <MessageModal
          dealId={deal.id}
          dealTitle={deal.title}
          dealSlug={deal.slug}
          receiverId={deal.syndicator?.claimed_by || deal.syndicator_id}
          syndicatorName={deal.syndicator?.company_name || "Syndicator"}
          onClose={() => setShowInvestModal(false)}
          isInvestment
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          defaultType="investor"
        />
      )}

      <Footer />
    </div>
  );
}
