import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO, Breadcrumbs, FAQSection, ItemListSchema } from '../components/SEO';
import { supabase } from '../lib/supabase';
import { getSyndicatorLogo } from '../lib/syndicator-logos';
import { Star, Building2, MapPin, ChevronRight, Award } from 'lucide-react';

const RANKING_CATEGORIES: Record<string, { title: string; description: string; faqs: { question: string; answer: string }[] }> = {
  'best-multifamily-syndicators': {
    title: 'Best Multifamily Real Estate Syndicators 2026',
    description: 'Top multifamily syndicators ranked by track record, investor reviews, and deal volume.',
    faqs: [
      { question: 'What makes a good multifamily syndicator?', answer: 'Look for syndicators with experience in value-add or stabilized multifamily, strong operator relationships, and a track record of successful exits. Check their average IRR and equity multiples across past deals.' },
      { question: 'What is the typical minimum investment for multifamily syndications?', answer: 'Minimum investments typically range from $50,000 to $100,000 for most multifamily syndications, though some accept lower amounts.' },
      { question: 'How do I compare multifamily syndicators?', answer: 'Compare years in business, total deal volume, average returns (IRR, equity multiple), minimum investment, and investor reviews. Use EquityMD\'s comparison tool for side-by-side analysis.' },
    ],
  },
  'best-syndicators-for-beginners': {
    title: 'Best Real Estate Syndicators for Beginners 2026',
    description: 'Syndicators with the lowest minimum investments, ideal for first-time passive investors.',
    faqs: [
      { question: 'What is a good minimum investment for beginners?', answer: 'Many syndicators offer minimums of $25,000–$50,000, making it accessible for new investors to diversify across multiple deals.' },
      { question: 'Should beginners invest in syndications?', answer: 'Syndications can be suitable for accredited investors seeking passive income. Start with well-established syndicators and diversify across deals.' },
      { question: 'How do I choose my first syndicator?', answer: 'Look for syndicators with strong track records, transparent communication, and lower minimums. Read investor reviews and compare their past deal performance.' },
    ],
  },
  'highest-rated-syndicators': {
    title: 'Highest-Rated Real Estate Syndicators 2026',
    description: 'Top syndicators ranked by investor reviews and ratings on EquityMD.',
    faqs: [
      { question: 'How are syndicator ratings calculated?', answer: 'Ratings are based on verified investor reviews, considering communication, transparency, deal performance, and overall experience.' },
      { question: 'Should I only invest with highly-rated syndicators?', answer: 'High ratings indicate strong investor satisfaction, but also consider track record, deal structure, and alignment with your goals.' },
      { question: 'Where can I read syndicator reviews?', answer: 'EquityMD displays verified investor reviews on each syndicator profile. You can filter and sort by rating on our directory.' },
    ],
  },
  'most-experienced-syndicators': {
    title: 'Most Experienced Real Estate Syndicators 2026',
    description: 'Syndicators with the most years in business and proven track records.',
    faqs: [
      { question: 'Why does experience matter for syndicators?', answer: 'Experienced syndicators have navigated multiple market cycles, built operator relationships, and refined their investment processes.' },
      { question: 'How many years of experience should I look for?', answer: 'Many top syndicators have 10+ years in business. Consider both years and number of completed deals.' },
      { question: 'Are newer syndicators riskier?', answer: 'Newer syndicators may offer higher potential returns but with less proven track record. Diversify and do thorough due diligence.' },
    ],
  },
  'top-syndicators-texas': {
    title: 'Top Real Estate Syndicators in Texas 2026',
    description: 'Leading Texas-based syndicators and those with strong presence in Texas markets.',
    faqs: [
      { question: 'Why invest in Texas real estate?', answer: 'Texas offers strong job growth, no state income tax, and diverse markets including Dallas, Houston, Austin, and San Antonio.' },
      { question: 'What property types are popular in Texas?', answer: 'Multifamily, industrial, and single-family build-to-rent are among the most active sectors in Texas.' },
      { question: 'How do I find Texas syndicators?', answer: 'Use EquityMD\'s directory to filter by state. Many national syndicators also have significant Texas portfolios.' },
    ],
  },
  'top-syndicators-california': {
    title: 'Top Real Estate Syndicators in California 2026',
    description: 'Leading California-based syndicators and those active in California markets.',
    faqs: [
      { question: 'Why invest in California real estate?', answer: 'California offers strong demographics, diverse economies, and long-term appreciation potential despite higher entry costs.' },
      { question: 'What are the main California markets?', answer: 'Los Angeles, San Francisco Bay Area, San Diego, and Inland Empire are key markets for syndicators.' },
      { question: 'Are California syndications more expensive?', answer: 'Minimum investments may be higher due to property values, but returns can be competitive. Compare across syndicators.' },
    ],
  },
  'top-syndicators-florida': {
    title: 'Top Real Estate Syndicators in Florida 2026',
    description: 'Leading Florida-based syndicators and those with strong Florida presence.',
    faqs: [
      { question: 'Why invest in Florida real estate?', answer: 'Florida benefits from population growth, no state income tax, and strong multifamily demand.' },
      { question: 'What Florida markets do syndicators focus on?', answer: 'Miami, Tampa, Orlando, Jacksonville, and Fort Lauderdale are among the most active markets.' },
      { question: 'How do I compare Florida syndicators?', answer: 'Use EquityMD\'s directory to filter by state and compare track records, minimum investments, and specialties.' },
    ],
  },
};

export function Rankings() {
  const { category } = useParams<{ category?: string }>();
  const [syndicators, setSyndicators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRankings() {
      try {
        let query = supabase
          .from('syndicators')
          .select()
          .in('verification_status', ['verified', 'premier']);

        switch (category) {
          case 'best-multifamily-syndicators':
            query = query.contains('specialties', ['Multifamily']);
            break;
          case 'best-syndicators-for-beginners':
            query = query.order('min_investment', { ascending: true, nullsFirst: false });
            break;
          case 'highest-rated-syndicators':
            query = query.order('average_rating', { ascending: false });
            break;
          case 'most-experienced-syndicators':
            query = query.order('years_in_business', { ascending: false, nullsFirst: false });
            break;
          case 'top-syndicators-texas':
            query = query.eq('state', 'Texas');
            break;
          case 'top-syndicators-california':
            query = query.eq('state', 'California');
            break;
          case 'top-syndicators-florida':
            query = query.eq('state', 'Florida');
            break;
          default:
            query = query.order('average_rating', { ascending: false });
        }

        const { data } = await query.limit(20);
        setSyndicators(data || []);
      } catch (e) {
        console.error(e);
        setSyndicators([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, [category]);

  const meta = category && RANKING_CATEGORIES[category]
    ? RANKING_CATEGORIES[category]
    : {
        title: 'Best Real Estate Syndicators 2026 — Top Rated & Reviewed | EquityMD',
        description: 'Compare the top real estate syndicators ranked by investor reviews, track record, and deal volume. Updated for 2026.',
        faqs: [
          { question: 'How are syndicators ranked?', answer: 'We rank syndicators by investor ratings, years in business, deal volume, and other factors. Use our directory to filter and sort.' },
          { question: 'What is a real estate syndicator?', answer: 'A syndicator (sponsor) finds, acquires, and manages real estate investments on behalf of passive investors.' },
        ],
      };

  const title = category && RANKING_CATEGORIES[category] ? RANKING_CATEGORIES[category].title : meta.title;
  const description = category && RANKING_CATEGORIES[category] ? RANKING_CATEGORIES[category].description : meta.description;
  const faqs = category && RANKING_CATEGORIES[category] ? RANKING_CATEGORIES[category].faqs : meta.faqs;

  const breadcrumbItems = [
    { name: 'Home', url: 'https://equitymd.com' },
    { name: 'Rankings', url: 'https://equitymd.com/rankings' },
  ];
  if (category) {
    breadcrumbItems.push({ name: title, url: `https://equitymd.com/rankings/${category}` });
  }

  const itemListItems = syndicators.slice(0, 20).map((s, i) => ({
    name: `${i + 1}. ${s.company_name}`,
    url: `https://equitymd.com/syndicators/${s.slug || s.company_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <SEO
        title={`Best ${category ? category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Real Estate'} Syndicators 2026 — Top Rated & Reviewed | EquityMD`}
        description={description}
        canonical={`https://equitymd.com/rankings${category ? `/${category}` : ''}`}
      />
      <ItemListSchema
        name={title}
        numberOfItems={syndicators.length}
        items={itemListItems}
      />
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-6 mb-4">
          {title}
        </h1>
        <p className="text-gray-600 mb-10">{description}</p>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4 mb-12">
            {syndicators.map((s, index) => (
              <Link
                key={s.id}
                to={`/syndicators/${s.slug || s.company_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-300 w-10">{index + 1}</span>
                  {getSyndicatorLogo(s.company_name, s.company_logo_url) ? (
                    <img
                      src={getSyndicatorLogo(s.company_name, s.company_logo_url)!}
                      alt={s.company_name}
                      className="w-14 h-14 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {s.company_name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg text-gray-900">{s.company_name}</h2>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                      {s.city && s.state && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {s.city}, {s.state}
                        </span>
                      )}
                      {s.average_rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-400" fill="currentColor" />
                          {s.average_rating?.toFixed(1)} ({s.total_reviews || 0} reviews)
                        </span>
                      )}
                      {s.years_in_business != null && (
                        <span>{s.years_in_business} years</span>
                      )}
                      {s.min_investment > 0 && (
                        <span>Min: ${s.min_investment?.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="py-12">
          <FAQSection title="Frequently Asked Questions" faqs={faqs} />
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/directory"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
          >
            Browse Full Directory <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
