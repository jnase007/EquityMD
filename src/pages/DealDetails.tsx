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
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { MessageModal } from "../components/MessageModal";
import { DealMediaGallery } from "../components/DealMediaGallery";
import { VideoEmbed } from "../components/VideoEmbed";
import { AuthModal } from "../components/AuthModal";
import { FavoriteButton } from "../components/FavoriteButton";
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
  const [investmentRequests, setInvestmentRequests] = useState({
    count: 0,
    loading: true,
  });

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
    <div className="min-h-screen bg-gray-50">
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
      <div className="relative h-[400px]">
        <img
          src={
            deal.cover_image_url ||
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80"
          }
          alt={deal.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 text-white">
            <div className="flex items-center text-sm mb-4">
              <span>Deals</span>
              <ChevronRight className="h-4 w-4 mx-2" />
              <span>{deal.property_type}</span>
              <ChevronRight className="h-4 w-4 mx-2" />
              <span>{deal.title}</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{deal.title}</h1>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{deal.location}</span>
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

            {/* Video Section (keep at top, if present) */}
            {deal.syndicator?.company_name === "Sutera Properties" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Property Overview</h2>
                <VideoEmbed
                  url="https://www.youtube.com/watch?v=AZ7efSrtm44"
                  title="Property Overview"
                  className="mb-4"
                />
                <p className="text-sm text-gray-500">
                  Take a virtual tour of this investment opportunity.
                </p>
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">Investment Highlights</h2>
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

            {/* Documents */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">Documents</h2>
              <div className="space-y-4">
                {files.length > 0 ? (
                  files.map((file) => (
                    <a
                      key={file.id}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <FileText className="h-6 w-6 text-blue-600 mr-3" />
                        <div>
                          <div className="font-medium">{file.name}</div>
                        </div>
                      </div>
                      {file.is_private && user && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Private
                        </span>
                      )}
                    </a>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No documents available</p>
                    {!user ? (
                      <p className="text-sm text-gray-400">
                        <span
                          onClick={() => setShowAuthModal(true)}
                          className="text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                          Sign in
                        </span>{" "}
                        to view private documents
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">
                        Documents will appear here when uploaded by the
                        syndicator
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Returns Calculator directly after Documents */}
            <div className="max-w-2xl mx-auto px-4">
              <ReturnsCalculator />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-8 h-fit">
            {/* Countdown Timer */}
            <CountdownTimer
              endDate={(() => {
                // Different deadlines for different deals
                const now = new Date();
                switch (deal.slug) {
                  case "san-diego-multi-family-offering":
                    return new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000); // 45 days
                  case "newport-beach-residential-offering":
                    return new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000); // 21 days
                  case "greenville-apartment-complex":
                    return new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days
                  case "multifamily-adu-opportunity":
                    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
                  default:
                    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
                }
              })()}
              className="mb-6"
            />

            {/* Syndicator Information */}
            {deal.syndicator && (
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg shadow-sm p-6">
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

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-800">
                    <strong>Active Interest:</strong> This deal has received{" "}
                    {investmentRequests.loading
                      ? "..."
                      : investmentRequests.count}{" "}
                    investment requests from accredited investors.
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <button
                  onClick={() => handleAction("invest")}
                  disabled={!deal.syndicator?.claimed_by}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!deal.syndicator?.claimed_by ? "This syndicator profile hasn't been claimed yet" : ""}
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  Invest Now
                </button>

                <button
                  onClick={() => handleAction("contact")}
                  disabled={!deal.syndicator?.claimed_by}
                  className="w-full bg-white text-blue-600 border-2 border-blue-600 py-3 rounded-lg hover:bg-blue-50 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!deal.syndicator?.claimed_by ? "This syndicator profile hasn't been claimed yet" : ""}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Syndicator
                </button>

                <FavoriteButton dealId={deal.id} className="w-full py-3" />
              </div>
            </div>

            {/* Unclaimed Profile Warning */}
            {!deal.syndicator?.claimed_by && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
                  <div className="text-sm text-blue-700">
                    This syndicator profile hasn't been claimed yet. Messaging will be available once the syndicator claims their profile.
                  </div>
                </div>
              </div>
            )}

            {/* Accredited Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                <div className="text-sm text-yellow-700">
                  This investment opportunity is only available to accredited
                  investors.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMessageModal && deal && deal.syndicator?.claimed_by && (
        <MessageModal
          dealId={deal.id}
          dealTitle={deal.title}
          receiverId={deal.syndicator.claimed_by}
          syndicatorName={deal.syndicator?.company_name || "Syndicator"}
          onClose={() => setShowMessageModal(false)}
        />
      )}

      {showInvestModal && deal && deal.syndicator?.claimed_by && (
        <MessageModal
          dealId={deal.id}
          dealTitle={deal.title}
          receiverId={deal.syndicator.claimed_by}
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
