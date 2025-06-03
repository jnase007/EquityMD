import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { 
  Building2, Star, Calendar, TrendingUp, DollarSign, Users, MapPin, ExternalLink,
  Globe, Briefcase, Mail, Phone, Award, CheckCircle,
  BarChart, Target, Clock, Percent, Shield, Building, ChevronRight,
  MessageCircle, User, Play, AlertCircle, Lock
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { DealCard } from '../components/Cards';
import { MessageModal } from '../components/MessageModal';
import { VideoEmbed } from '../components/VideoEmbed';
import { AuthModal } from '../components/AuthModal';
import { ClaimSyndicatorModal } from '../components/ClaimSyndicatorModal';
import { LoadingSpinner, PageLoader } from '../components/LoadingSpinner';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { Footer } from '../components/Footer';
import { getSyndicatorLogo, getSyndicatorLocation, getSyndicatorDescription } from '../lib/syndicator-logos';

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  reviewer: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface ProjectStats {
  totalDeals: number;
  activeDeals: number;
  averageReturn: number;
  totalInvestors: number;
}

const dummyPastProjects = [
  {
    id: 1,
    name: "The Grand Residences",
    location: "Austin, TX",
    type: "Multi-Family",
    units: 250,
    totalValue: "$45M",
    irr: "22%",
    exitYear: 2022,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    name: "Parkview Commons",
    location: "Denver, CO",
    type: "Mixed-Use",
    units: 180,
    totalValue: "$38M",
    irr: "19%",
    exitYear: 2023,
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    name: "The Metropolitan",
    location: "Nashville, TN",
    type: "Office",
    sqft: "125,000",
    totalValue: "$52M",
    irr: "21%",
    exitYear: 2023,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80"
  }
];

const dummyCompanyDescription = `
With over a decade of experience in real estate investment and development, we specialize in identifying and executing value-add opportunities in high-growth markets across the United States. Our team combines deep market knowledge with innovative investment strategies to deliver superior returns for our investors.

Our approach focuses on:
• Strategic market selection in high-growth regions
• Comprehensive due diligence and risk management
• Active asset management to maximize value
• Strong relationships with local market participants
• Transparent communication with investors

We have successfully completed over $500 million in real estate transactions, consistently delivering above-market returns to our investors while maintaining the highest standards of integrity and professionalism.
`;

export function SyndicatorProfile() {
  const { slug } = useParams();
  const { user, profile } = useAuthStore();
  const [syndicator, setSyndicator] = useState<any>(null);
  const [activeDeals, setActiveDeals] = useState<any[]>([]);
  const [pastDeals, setPastDeals] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userReview, setUserReview] = useState({ rating: 0, review_text: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    totalDeals: 0,
    activeDeals: 0,
    averageReturn: 0,
    totalInvestors: 0
  });

  useEffect(() => {
    if (slug) {
      fetchSyndicatorData();
    }
  }, [slug]);

  async function fetchSyndicatorData() {
    try {
      let { data: syndicatorData, error: slugError } = await supabase
        .from('syndicator_profiles')
        .select(`
          *,
          profiles!syndicator_profiles_id_fkey (
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('slug', slug)
        .maybeSingle();

      if (!syndicatorData) {
        const companyName = slug?.split('-').join(' ');
        if (!companyName) return;
        
        const { data: nameData, error: nameError } = await supabase
          .from('syndicator_profiles')
          .select(`
            *,
            profiles!syndicator_profiles_id_fkey (
              full_name,
              avatar_url,
              email
            )
          `)
          .ilike('company_name', companyName)
          .maybeSingle();

        if (nameError) {
          console.error('Error fetching syndicator by name:', nameError);
          return;
        }

        syndicatorData = nameData;
      }

      if (!syndicatorData) {
        // Check if this is Starboard Realty - create mock data if so
        if (slug === 'starboard-realty' || slug?.includes('starboard')) {
          syndicatorData = {
            id: 'starboard-realty-mock',
            company_name: 'Starboard Realty',
            company_description: 'Headquartered in Irvine, California, Starboard Realty Advisors, LLC, is a privately held, fully-integrated real estate firm, whose principals have more than 30 years of hands-on, cycle-tested experience in acquiring, developing, leasing, repositioning, managing, financing and disposing of retail, multifamily, office and industrial real estate. Starboard acquires multifamily, multi-tenant retail shopping centers, and NNN lease properties. Starboard\'s mission is to acquire well-located properties across the U.S., in which current rents have growth potential and which can be acquired at below replacement cost. Starboard acquires primarily stabilized properties with a 7- to 10-year hold period for its 1031 exchange clients and value added properties with a 1- to 5-year hold.',
            company_logo_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/logos//Starboard_reality.jpg',
            state: 'California',
            city: 'Irvine',
            years_in_business: 10,
            total_deal_volume: 608000000,
            website_url: 'https://starboard-realty.com/',
            slug: 'starboard-realty',
            profiles: null
          };
        } else {
        console.error('Syndicator not found');
        return;
        }
      }

      setSyndicator({
        ...syndicatorData,
        profile: syndicatorData.profiles,
        // Override total deal volume for specific syndicators
        total_deal_volume: syndicatorData.company_name === 'Back Bay Capital' ? 30000000 : 
                          syndicatorData.company_name === 'Starboard Realty' ? 608000000 : 
                          syndicatorData.total_deal_volume,
        // Override profile info for specific syndicators
        ...(syndicatorData.company_name === 'Back Bay Capital' && {
          profile: {
            full_name: 'Drew Fielder',
            avatar_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/avatars/investors/DrewFielder.png',
            email: 'andrew.fielder@backbayig.com'
          }
        }),
        ...(syndicatorData.company_name === 'Sutera Properties' && {
          profile: {
            full_name: 'Art Heckman',
            avatar_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/avatars/investors/art.png',
            email: 'art@suteraproperties.com'
          }
        }),
        ...(syndicatorData.company_name === 'Starboard Realty' && {
          profile: {
            full_name: 'Daniel De Leon',
            avatar_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/avatars/investors/dan.png',
            email: 'info@starboard-realty.com'
          },
          website_url: 'https://starboard-realty.com/'
        })
      });

      const { data: activeDealsData } = await supabase
        .from('deals')
        .select('*')
        .eq('syndicator_id', syndicatorData.id)
        .eq('status', 'active');

      // Filter out unwanted deals like Innovation Square and Marina Residences
      let finalActiveDeals = activeDealsData ? activeDealsData.filter(deal => 
        deal.title !== 'Innovation Square' && 
        !deal.title.includes('Innovation Square') &&
        deal.title !== 'The Marina Residences' &&
        !deal.title.includes('Marina Residences')
      ) : [];

      // If this is Back Bay Capital and no deals found in database, add mock deals
      if (syndicatorData.company_name === 'Back Bay Capital' && finalActiveDeals.length === 0) {
        const today = new Date().toISOString();
        finalActiveDeals = [
          {
            id: 'backbay-1',
            syndicator_id: syndicatorData.id,
            title: 'San Diego Multi-Family Offering',
            location: 'San Diego, CA',
            property_type: 'Multi-Family',
            status: 'active',
            target_irr: 15,
            minimum_investment: 500000,
            investment_term: 5,
            description: 'Back Bay Investment Group presents an opportunity to invest in a fund focused on multifamily development and value-add projects in Southern California. Leveraging the region\'s robust economy, diverse job market, and housing demand, the fund aims to capitalize on the region\'s housing shortage while delivering superior risk-adjusted returns.',
            address: { street: '', city: 'San Diego', state: 'CA', zip: '' },
            investment_highlights: ['Access to Institutional Grade Assets', 'Prime Residential Markets', 'Tax Deductions & Bonus Depreciation Benefits', 'Target 75% Cash on Cash', '15% Target Investor IRR', '1.75x Target Equity Multiple'],
            total_equity: 10000000,
            featured: true,
            cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_SanDeigo.jpg',
            created_at: today,
            updated_at: today,
            slug: 'san-diego-multi-family-offering'
          },
          {
            id: 'backbay-2',
            syndicator_id: syndicatorData.id,
            title: 'Newport Beach Residential Offering',
            location: 'Newport Beach, CA',
            property_type: 'Residential',
            status: 'active',
            target_irr: 20,
            minimum_investment: 250000,
            investment_term: 2,
            description: 'Back Bay Investment Group is offering an exclusive opportunity to invest in residential real estate in Newport Beach and surrounding coastal communities, targeting high-demand neighborhoods with limited inventory and strong growth potential.',
            address: { street: '', city: 'Newport Beach', state: 'CA', zip: '' },
            investment_highlights: ['Short Term Investment', 'Value-Add Strategy', 'Multiple Exit Options', 'Target 60% Cash on Cash', '20% Target Investor IRR', '1.6x Target Equity Multiple'],
            total_equity: 10000000,
            featured: true,
            cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_Newport.jpg',
            created_at: today,
            updated_at: today,
            slug: 'newport-beach-residential-offering'
          },
          {
            id: 'backbay-3',
            syndicator_id: syndicatorData.id,
            title: 'Orange County Pref Equity Offering',
            location: 'Newport Beach, CA',
            property_type: 'Preferred Equity',
            status: 'active',
            target_irr: 15,
            minimum_investment: 100000,
            investment_term: 2,
            description: 'Back Bay Investment Group is offering a preferred equity investment with a fixed 15% annual return, paid quarterly, and a targeted holding period of 1–3 years. Designed for investors seeking secure, predictable income, this offering provides priority in the capital stack above common equity.',
            address: { street: '', city: 'Newport Beach', state: 'CA', zip: '' },
            investment_highlights: ['Quarterly Payments', 'Fixed 15% Return', 'Priority in the Equity Stack', 'Target 45% Cash on Cash', '15% Target Investor IRR', '1.45x Target Equity Multiple'],
            total_equity: 10000000,
            featured: true,
            cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_OrangeCounty.jpg',
            created_at: today,
            updated_at: today,
            slug: 'orange-county-pref-equity-offering'
          }
        ];
      }

      // If this is Sutera Properties, always add the Greenville deal
      if (syndicatorData.company_name === 'Sutera Properties') {
        const today = new Date().toISOString();
        finalActiveDeals = [
          {
            id: 'sutera-1',
            syndicator_id: syndicatorData.id,
            title: 'Greenville Apartment Complex',
            location: 'Travelers Rest, SC',
            property_type: 'Multi-Family',
            status: 'active',
            target_irr: 17.19,
            minimum_investment: 50000,
            investment_term: 5,
            description: `Project Overview:
Sutera Properties presents Liva, a ground-up multifamily development in Travelers Rest, South Carolina, a rapidly growing suburb of Greenville. The project spans 10.5 acres and includes 120 multifamily units and 32 individually platted townhomes, totaling 152 units. The site is 100% shovel-ready with Land Disturbance Permits secured as of March 2025.

Investment Highlights:
• Updated Business Plan: The multifamily portion will be held as a rental property with a projected un-trended Yield on Cost of 7.19% (up from 6.8%), while townhomes will be sold to individual buyers, responding to strong local demand.
• Cost Efficiency: Reduced per-unit basis for the multifamily to $205k (from $250k), compared to recent market comps like The Standard at Pinestone, which received bids at $230k/unit in 2024.
• Prime Location: Located near the Swamp Rabbit Trail and half a mile from Travelers Rest's Main Street, with planned streetscape improvements enhancing connectivity.
• Market Dynamics: Travelers Rest is experiencing 3.43% annual population growth, with zero projected multifamily deliveries in the North Greenville submarket, positioning Liva to capitalize on strong demand.

Financial Snapshot:
• Total Project Cost: $38,226,500
• Equity Raise: $12,340,000
• Construction LTV: 65%
• Estimated Hold Period: 5 years

Amenities & Design:
Liva promotes an active lifestyle with resort-style amenities including a pool, clubhouse, fitness center, fire pit, dog park, bike barn, and a multi-use path connecting to the Main Street corridor. Units feature spacious, open floor plans tailored to the unique fabric of Travelers Rest.

Why Invest?
Backed by Sutera Properties' expertise, Liva offers a flexible exit strategy, strong risk-adjusted returns, and a prime position in a high-growth market. With construction set to begin upon capitalization, this is a timely opportunity to invest in the thriving Upstate South Carolina region.`,
            address: { street: '', city: 'Travelers Rest', state: 'SC', zip: '' },
            investment_highlights: [
              'Ground-up development',
              '152 total units (120 multifamily + 32 townhomes)',
              'Resort-style amenities',
              'Pool and clubhouse',
              'Fitness center',
              'Dog park and bike barn',
              'Prime location near Swamp Rabbit Trail',
              'Shovel-ready with permits secured'
            ],
            total_equity: 12340000,
            featured: true,
            cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Greenville.png',
            created_at: today,
            updated_at: today,
            slug: 'greenville-apartment-complex'
          }
        ];
      }

      // If this is Starboard Realty and no deals found in database, add mock deals
      if (syndicatorData.company_name === 'Starboard Realty' && finalActiveDeals.length === 0) {
        const today = new Date().toISOString();
        finalActiveDeals = [
          {
            id: 'starboard-2',
            syndicator_id: syndicatorData.id,
            title: 'Multifamily ADU Opportunity',
            location: 'Southern California',
            property_type: 'Multi-Family',
            status: 'active',
            target_irr: 30,
            minimum_investment: 50000,
            investment_term: 3,
            description: 'Starboard Realty Advisors is offering investors the opportunity to invest in the high-demand multifamily markets of Southern California. With a growing pipeline of opportunities, the Fund will be opportunistically deploying capital to acquire small multifamily buildings with the intent of maximizing revenue growth through renovations and the addition of units by leveraging California\'s recent Accessory Dwelling Unit (ADU) legislation.',
            address: { street: '', city: 'Southern California', state: 'CA', zip: '' },
            investment_highlights: ['30%+ Target Property IRR', '1.60X - 1.90X+ Equity Multiple', '2-3 Year Investment Horizon', 'ADU Legislation Leverage', 'Economies of Scale', 'Cost Segregation & Tax Benefits'],
            total_equity: 5000000,
            featured: true,
            cover_image_url: 'https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//adu.png',
            created_at: today,
            updated_at: today,
            slug: 'multifamily-adu-opportunity'
          }
        ];
      }

      setActiveDeals(finalActiveDeals);

      const { data: pastDealsData } = await supabase
        .from('deals')
        .select('*')
        .eq('syndicator_id', syndicatorData.id)
        .in('status', ['closed', 'archived']);

      setPastDeals(pastDealsData || []);

      const { data: reviewsData } = await supabase
        .from('syndicator_reviews')
        .select('*, reviewer:profiles!syndicator_reviews_reviewer_id_fkey(full_name, avatar_url)')
        .eq('syndicator_id', syndicatorData.id)
        .order('created_at', { ascending: false });

      setReviews(reviewsData || []);

      if (reviewsData?.length) {
        const avg = reviewsData.reduce((acc, review) => acc + review.rating, 0) / reviewsData.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }

      // Override ratings for specific syndicators
      if (syndicatorData.company_name === 'Sutera Properties' || 
          syndicatorData.company_name === 'Back Bay Capital' || 
          syndicatorData.company_name === 'Starboard Realty') {
        setAverageRating(5.0);
        // If no actual reviews exist, create some mock review data for display
        if (!reviewsData || reviewsData.length === 0) {
          const mockReviews = [
            {
              id: 'mock-review-1',
              rating: 5,
              review_text: 'Exceptional investment opportunities and outstanding communication throughout the entire process. Highly professional team.',
              created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
              reviewer: {
                full_name: 'Michael Johnson',
                avatar_url: null
              }
            },
            {
              id: 'mock-review-2',
              rating: 5,
              review_text: 'Great returns and transparent reporting. The team is knowledgeable and responsive to investor questions.',
              created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
              reviewer: {
                full_name: 'Sarah Williams',
                avatar_url: null
              }
            },
            {
              id: 'mock-review-3',
              rating: 5,
              review_text: 'Solid investment strategy and excellent execution. I highly recommend working with this team.',
              created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
              reviewer: {
                full_name: 'David Chen',
                avatar_url: null
              }
            }
          ];
          setReviews(mockReviews);
        }
      }

      setProjectStats({
        totalDeals: finalActiveDeals.length + (pastDealsData?.length || 0),
        activeDeals: finalActiveDeals.length,
        averageReturn: syndicatorData.company_name === 'Starboard Realty' ? 30 : Math.round(Math.random() * 10 + 15),
        totalInvestors: syndicatorData.company_name === 'Starboard Realty' ? 445 : Math.floor(Math.random() * 500 + 100)
      });

    } catch (error) {
      console.error('Error fetching syndicator data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleReviewClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (profile?.user_type !== 'investor') {
      alert('Only investors can leave reviews');
      return;
    }

    setShowReviewForm(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !syndicator) return;

    try {
      const { error } = await supabase
        .from('syndicator_reviews')
        .upsert({
          syndicator_id: syndicator.id,
          reviewer_id: user.id,
          rating: userReview.rating,
          review_text: userReview.review_text
        });

      if (error) throw error;

      // Reset form
      setUserReview({ rating: 0, review_text: '' });
      setShowReviewForm(false);
      
      // Show success message
      alert('Thank you for your review! It has been submitted successfully.');
      
      // Refresh data to show the new review
      fetchSyndicatorData();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading syndicator profile...</div>
      </div>
    );
  }

  if (!syndicator) {
    return <Navigate to="/404" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0">
              {getSyndicatorLogo(syndicator.company_name, syndicator.company_logo_url) ? (
                <img
                  src={getSyndicatorLogo(syndicator.company_name, syndicator.company_logo_url)!}
                  alt={syndicator.company_name}
                  className="w-32 h-32 object-contain rounded-lg border p-2"
                />
              ) : (
                <div className="w-32 h-32 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-blue-600" />
                </div>
              )}
            </div>

            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {syndicator.company_name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-1" />
                  <span>{getSyndicatorLocation(syndicator.company_name, syndicator.city, syndicator.state).city}, {getSyndicatorLocation(syndicator.company_name, syndicator.city, syndicator.state).state}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 mr-1 text-yellow-400" fill="currentColor" />
                  <span>{averageRating} ({reviews.length} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-1" />
                  <span>{syndicator.years_in_business} years in business</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-1" />
                  <span>Verified Syndicator</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    if (!user) {
                      setShowAuthModal(true);
                    } else {
                      setShowMessageModal(true);
                    }
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {!user ? (
                    <>
                      <Lock className="h-5 w-5 mr-2" />
                      Login to Contact
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Contact Syndicator
                    </>
                  )}
                </button>

                {syndicator.website_url && (
                  <a
                    href={syndicator.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition"
                  >
                    <Globe className="h-5 w-5 mr-2 text-gray-600" />
                    Visit Website
                    <ExternalLink className="h-4 w-4 ml-1 text-gray-400" />
                  </a>
                )}

                {syndicator.linkedin_url && (
                  <a
                    href={syndicator.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition"
                  >
                    <svg className="h-5 w-5 mr-2 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                    LinkedIn
                    <ExternalLink className="h-4 w-4 ml-1 text-gray-400" />
                  </a>
                )}

                {!syndicator.profile && (
                  <button
                    onClick={() => setShowClaimModal(true)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Claim Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">About {syndicator.company_name}</h2>
              <p className="text-gray-600 whitespace-pre-line mb-6">
                {getSyndicatorDescription(syndicator.company_name, syndicator.company_description)}
              </p>

              {syndicator.company_name === 'Sutera Properties' && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Company Overview</h3>
                  <VideoEmbed 
                    url="https://www.youtube.com/watch?v=GM7zriIRpbg"
                    title="Sutera Properties Overview"
                    className="mb-4"
                  />
                  <p className="text-sm text-gray-500">
                    Learn more about our approach to real estate investment and development.
                  </p>
                </div>
              )}



              {syndicator.company_name === 'Back Bay Capital' && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Company Overview</h3>
                  <VideoEmbed 
                    url="https://www.youtube.com/watch?v=WgGIIgNZy8U"
                    title="Back Bay Capital Overview"
                    className="mb-4"
                  />
                  <p className="text-sm text-gray-500">
                    Discover our investment philosophy and approach to real estate development.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Active Investment Opportunities</h2>
              <div className="grid gap-6">
                {activeDeals.map((deal: any) => (
                  <DealCard
                    key={deal.id}
                    id={deal.id}
                    slug={deal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                    image={deal.cover_image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80'}
                    title={deal.title}
                    location={deal.location}
                    metrics={{
                      target: `${deal.target_irr}% IRR`,
                      minimum: `$${deal.minimum_investment.toLocaleString()}`,
                      term: `${deal.investment_term} years`
                    }}
                    detailed
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Past Projects</h2>
              <div className="grid gap-6">
                {dummyPastProjects.map((project) => (
                  <div key={project.id} className="flex gap-6 border-b pb-6 last:border-0 last:pb-0">
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-48 h-32 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {project.location}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">IRR</div>
                          <div className="font-semibold text-green-600">{project.irr}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Total Value</div>
                          <div className="font-semibold">{project.totalValue}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Exit Year</div>
                          <div className="font-semibold">{project.exitYear}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Reviews</h2>
                  <div className="flex items-center mt-2">
                    <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                    <span className="ml-2 font-medium">{averageRating.toFixed(1)}</span>
                    <span className="ml-1 text-gray-500">({reviews.length} reviews)</span>
                  </div>
                </div>
                <button
                  onClick={handleReviewClick}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                >
                  <Star className="h-5 w-5 mr-2" />
                  Write a Review
                </button>
              </div>

              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-8 bg-gray-50 p-6 rounded-lg">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Write a Review for {syndicator.company_name}</h3>
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium text-blue-900 mb-2">Review Guidelines:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Share your experience working with this syndicator</li>
                        <li>• Comment on communication, transparency, and professionalism</li>
                        <li>• Mention deal performance if you've invested with them</li>
                        <li>• Be honest and constructive in your feedback</li>
                        <li>• Avoid personal attacks or unverified claims</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overall Rating *
                    </label>
                    <div className="flex gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserReview(prev => ({ ...prev, rating: star }))}
                          className="focus:outline-none hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= userReview.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill={star <= userReview.rating ? 'currentColor' : 'none'}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      {userReview.rating === 0 && "Click to rate"}
                      {userReview.rating === 1 && "Poor - Significant issues"}
                      {userReview.rating === 2 && "Fair - Below expectations"}
                      {userReview.rating === 3 && "Good - Meets expectations"}
                      {userReview.rating === 4 && "Very Good - Exceeds expectations"}
                      {userReview.rating === 5 && "Excellent - Outstanding experience"}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review *
                    </label>
                    <textarea
                      value={userReview.review_text}
                      onChange={(e) => setUserReview(prev => ({ ...prev, review_text: e.target.value }))}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Share your experience working with this syndicator. What went well? What could be improved? How was their communication and professionalism?"
                      required
                      minLength={50}
                      maxLength={1000}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>Minimum 50 characters</span>
                      <span>{userReview.review_text.length}/1000</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={userReview.rating === 0 || userReview.review_text.length < 50}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Submit Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {!user && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                  <p className="text-blue-800">
                    Please sign in as an investor to leave a review. Click the "Write a Review" button to get started.
                  </p>
                </div>
              )}

              {user && profile?.user_type !== 'investor' && (
                <div className="bg-yellow-50 p-4 rounded-lg mb-6 flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                  <p className="text-yellow-800">
                    Only investors can leave reviews. Please sign in with an investor account to review this syndicator.
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                    <div className="flex items-center mb-4">
                      {review.reviewer.avatar_url ? (
                        <img
                          src={review.reviewer.avatar_url}
                          alt={review.reviewer.full_name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="font-medium">{review.reviewer.full_name}</div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">{review.review_text}</p>
                  </div>
                ))}

                {reviews.length === 0 && (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-500 mb-4">
                      Be the first to share your experience with {syndicator?.company_name}.
                    </p>
                    {user && profile?.user_type === 'investor' && (
                      <button
                        onClick={handleReviewClick}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center"
                      >
                        <Star className="h-5 w-5 mr-2" />
                        Write the First Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">Track Record</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Total Deal Volume</div>
                  <div className="text-2xl font-bold">
                    ${syndicator.total_deal_volume?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Active Deals</div>
                  <div className="text-2xl font-bold">{projectStats.activeDeals}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Average Return</div>
                  <div className="text-2xl font-bold text-green-600">
                    {projectStats.averageReturn}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Investors</div>
                  <div className="text-2xl font-bold">{projectStats.totalInvestors}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">Leadership</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  {syndicator.profile?.avatar_url ? (
                    <img
                      src={syndicator.profile.avatar_url}
                      alt={syndicator.profile.full_name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                  <div className="ml-4">
                    <div className="font-medium">{syndicator.profile?.full_name}</div>
                    <div className="text-sm text-gray-500">
                      {syndicator.company_name === 'Sutera Properties' ? 'Owner + Founder' : 'Managing Partner'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMessageModal && (
        <MessageModal
          dealId=""
          dealTitle=""
          syndicatorId={syndicator.id}
          syndicatorName={syndicator.company_name}
          onClose={() => setShowMessageModal(false)}
        />
      )}

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          defaultType="investor"
        />
      )}

      {showClaimModal && (
        <ClaimSyndicatorModal
          syndicatorId={syndicator.id}
          syndicatorName={syndicator.company_name}
          onClose={() => setShowClaimModal(false)}
        />
      )}

      <Footer />
    </div>
  );
}