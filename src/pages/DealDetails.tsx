import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { MapPin, Building, Calendar, TrendingUp, DollarSign, Users, FileText, ChevronRight, AlertCircle, Globe, Briefcase, MessageCircle, Wallet, Play } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MessageModal } from '../components/MessageModal';
import { DealMediaGallery } from '../components/DealMediaGallery';
import { VideoEmbed } from '../components/VideoEmbed';
import { AuthModal } from '../components/AuthModal';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import type { Deal, DealFile } from '../types/database';

interface DealMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  description: string;
  order: number;
}

export function DealDetails() {
  const { slug } = useParams();
  const { user } = useAuthStore();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [files, setFiles] = useState<DealFile[]>([]);
  const [media, setMedia] = useState<DealMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [fundingProgress, setFundingProgress] = useState({
    raised: 0,
    target: 0,
    investors: 0
  });

  useEffect(() => {
    fetchDealDetails();
  }, [slug]);

  async function fetchDealDetails() {
    try {
      // Find deal by slug (title converted to slug)
      const title = slug?.split('-').join(' ');
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select(`
          *,
          syndicator:syndicator_id (
            company_name,
            company_logo_url,
            years_in_business,
            company_description,
            website_url,
            total_deal_volume
          )
        `)
        .ilike('title', title)
        .single();

      if (dealError || !dealData) {
        console.error('Error fetching deal:', dealError);
        return;
      }

      setDeal(dealData);

      // Fetch deal files
      const { data: fileData, error: fileError } = await supabase
        .from('deal_files')
        .select('*')
        .eq('deal_id', dealData.id)
        .eq('is_private', false);

      if (fileError) throw fileError;
      setFiles(fileData || []);

      // Fetch deal media
      const { data: mediaData, error: mediaError } = await supabase
        .from('deal_media')
        .select('*')
        .eq('deal_id', dealData.id)
        .order('order', { ascending: true });

      if (mediaError) throw mediaError;
      setMedia(mediaData || []);

      // Calculate funding progress (simulated data for now)
      const totalEquity = dealData.total_equity;
      const raisedAmount = Math.floor(Math.random() * totalEquity);
      setFundingProgress({
        raised: raisedAmount,
        target: totalEquity,
        investors: Math.floor(Math.random() * 50) + 10
      });

    } catch (error) {
      console.error('Error fetching deal details:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = (action: 'invest' | 'contact') => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (action === 'invest') {
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

  const progressPercentage = (fundingProgress.raised / fundingProgress.target) * 100;
  const syndicatorSlug = deal.syndicator?.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[400px]">
        <img
          src={deal.cover_image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'}
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
            {/* Media Gallery */}
            {media.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Property Gallery</h2>
                <DealMediaGallery media={media} />
              </div>
            )}

            {/* Add video section for Sutera Properties deals */}
            {deal.syndicator?.company_name === 'Sutera Properties' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Property Overview</h2>
                <VideoEmbed 
                  url="https://www.youtube.com/watch?v=GM7zriIRpbg"
                  title="Property Overview"
                  className="mb-4"
                />
                <p className="text-sm text-gray-500">
                  Take a virtual tour of this investment opportunity.
                </p>
              </div>
            )}

            {/* Syndicator Information */}
            <Link 
              to={`/syndicators/${syndicatorSlug}`}
              className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex items-center mb-6">
                {deal.syndicator?.company_logo_url ? (
                  <img
                    src={deal.syndicator.company_logo_url}
                    alt={deal.syndicator.company_name}
                    className="h-16 w-16 rounded-lg object-cover mr-4"
                  />
                ) : (
                  <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Building className="h-8 w-8 text-blue-600" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{deal.syndicator?.company_name}</h2>
                  <div className="flex items-center mt-2 space-x-4">
                    {deal.syndicator?.website_url && (
                      <div className="flex items-center text-blue-600">
                        <Globe className="h-4 w-4 mr-1" />
                        <span>Website</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>{deal.syndicator?.years_in_business} years in business</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{deal.syndicator?.company_description}</p>
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Total Deal Volume</div>
                    <div className="text-lg font-semibold">
                      ${deal.syndicator?.total_deal_volume?.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Active Deals</div>
                    <div className="text-lg font-semibold">
                      {Math.floor(Math.random() * 10) + 1} {/* Simulated data */}
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">Investment Overview</h2>
              <p className="text-gray-600 mb-6">{deal.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-gray-500 text-sm mb-1">Property Type</div>
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">{deal.property_type}</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm mb-1">Investment Term</div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">{deal.investment_term} years</span>
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
                      <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
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
                {files.map((file) => (
                  <a
                    key={file.id}
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <FileText className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium">{file.file_name}</div>
                      <div className="text-sm text-gray-500">{file.file_type}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding Progress */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Funding Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Raised</span>
                    <span className="font-medium">${fundingProgress.raised.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Target</span>
                    <span className="font-medium">${fundingProgress.target.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-4 border-t">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-500">Investors</span>
                  </div>
                  <span className="font-medium">{fundingProgress.investors}</span>
                </div>

                <div className="flex items-center justify-between py-4 border-t">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-500">Minimum Investment</span>
                  </div>
                  <span className="font-medium">${deal.minimum_investment.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <button 
                  onClick={() => handleAction('invest')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  Invest Now
                </button>

                <button 
                  onClick={() => handleAction('contact')}
                  className="w-full bg-white text-blue-600 border-2 border-blue-600 py-3 rounded-lg hover:bg-blue-50 transition flex items-center justify-center"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Syndicator
                </button>
              </div>
            </div>

            {/* Accredited Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                <div className="text-sm text-yellow-700">
                  This investment opportunity is only available to accredited investors.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMessageModal && deal && (
        <MessageModal
          dealId={deal.id}
          dealTitle={deal.title}
          syndicatorId={deal.syndicator_id}
          syndicatorName={deal.syndicator?.company_name || 'Syndicator'}
          onClose={() => setShowMessageModal(false)}
        />
      )}

      {showInvestModal && deal && (
        <MessageModal
          dealId={deal.id}
          dealTitle={deal.title}
          syndicatorId={deal.syndicator_id}
          syndicatorName={deal.syndicator?.company_name || 'Syndicator'}
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