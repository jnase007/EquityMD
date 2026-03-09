import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO, Breadcrumbs, FAQSection, ItemListSchema } from '../components/SEO';
import { supabase } from '../lib/supabase';
import { getSyndicatorLogo } from '../lib/syndicator-logos';
import { Star, ChevronRight } from 'lucide-react';

interface Syndicator {
  id: string;
  company_name: string;
  company_logo_url: string | null;
  company_description: string | null;
  state: string;
  city: string;
  years_in_business: number | null;
  total_deal_volume: number | null;
  average_rating: number;
  total_reviews: number;
  active_deals: number;
  slug: string;
  specialties: string[];
  team_size: number;
  min_investment: number;
  target_markets: string[];
  bbb_rating?: string;
}

export function Compare() {
  const { slug1, slug2 } = useParams<{ slug1: string; slug2: string }>();
  const [syndicator1, setSyndicator1] = useState<Syndicator | null>(null);
  const [syndicator2, setSyndicator2] = useState<Syndicator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSyndicators() {
      if (!slug1 || !slug2) return;
      try {
        const { data: data1 } = await supabase
          .from('syndicators')
          .select()
          .eq('slug', slug1)
          .in('verification_status', ['verified', 'premier'])
          .single();
        const { data: data2 } = await supabase
          .from('syndicators')
          .select()
          .eq('slug', slug2)
          .in('verification_status', ['verified', 'premier'])
          .single();
        setSyndicator1(data1);
        setSyndicator2(data2);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchSyndicators();
  }, [slug1, slug2]);

  if (loading || !syndicator1 || !syndicator2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">Loading comparison...</div>
      </div>
    );
  }

  const name1 = syndicator1.company_name;
  const name2 = syndicator2.company_name;

  const comparisonRows = [
    { label: 'Years in Business', a: syndicator1.years_in_business ?? '—', b: syndicator2.years_in_business ?? '—', higher: 'max' },
    { label: 'Total Deal Volume', a: syndicator1.total_deal_volume ? `$${(syndicator1.total_deal_volume / 1e6).toFixed(0)}M` : '—', b: syndicator2.total_deal_volume ? `$${(syndicator2.total_deal_volume / 1e6).toFixed(0)}M` : '—', higher: 'max' },
    { label: 'Min Investment', a: syndicator1.min_investment ? `$${syndicator1.min_investment.toLocaleString()}` : '—', b: syndicator2.min_investment ? `$${syndicator2.min_investment.toLocaleString()}` : '—', higher: 'min' },
    { label: 'Average Rating', a: syndicator1.average_rating?.toFixed(1) ?? '—', b: syndicator2.average_rating?.toFixed(1) ?? '—', higher: 'max' },
    { label: 'Review Count', a: syndicator1.total_reviews ?? '—', b: syndicator2.total_reviews ?? '—', higher: 'max' },
    { label: 'Active Deals', a: syndicator1.active_deals ?? '—', b: syndicator2.active_deals ?? '—', higher: 'max' },
    { label: 'Team Size', a: syndicator1.team_size ?? '—', b: syndicator2.team_size ?? '—', higher: 'max' },
    { label: 'BBB Rating', a: syndicator1.bbb_rating ?? '—', b: syndicator2.bbb_rating ?? '—', higher: null },
  ];

  const faqs = [
    { question: `Which is better, ${name1} or ${name2}?`, answer: `Both ${name1} and ${name2} are verified real estate syndicators on EquityMD. The best choice depends on your investment goals, preferred property types, and minimum investment. Compare their track records, specialties, and target markets above.` },
    { question: `What is ${name1}'s minimum investment?`, answer: `${name1}'s minimum investment is ${syndicator1.min_investment ? `$${syndicator1.min_investment.toLocaleString()}` : 'not publicly disclosed'}.` },
    { question: `How many deals has ${name2} completed?`, answer: `${name2} has ${syndicator2.active_deals ?? 0} active deals and a track record spanning ${syndicator2.years_in_business ?? 'several'} years in business.` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <SEO
        title={`${name1} vs ${name2} Review & Comparison 2026 | EquityMD`}
        description={`Compare ${name1} and ${name2} side-by-side. Years in business, deal volume, minimum investment, ratings, and more.`}
        canonical={`https://equitymd.com/compare/${slug1}/${slug2}`}
      />
      <ItemListSchema
        name={`${name1} vs ${name2} Comparison`}
        numberOfItems={2}
        items={[
          { name: name1, url: `https://equitymd.com/syndicators/${slug1}` },
          { name: name2, url: `https://equitymd.com/syndicators/${slug2}` },
        ]}
      />
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { name: 'Home', url: 'https://equitymd.com' },
            { name: 'Directory', url: 'https://equitymd.com/directory' },
            { name: 'Compare', url: `https://equitymd.com/compare/${slug1}/${slug2}` },
            { name: `${name1} vs ${name2}`, url: `https://equitymd.com/compare/${slug1}/${slug2}` },
          ]}
        />

        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-6 mb-2">
          {name1} vs {name2} — Which Syndicator Is Right for You?
        </h1>
        <p className="text-gray-600 mb-10">
          Side-by-side comparison of two top real estate syndicators. Compare track records, minimum investments, and specialties.
        </p>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
          <div className="grid grid-cols-3 gap-0 border-b border-gray-200">
            <div className="p-4 bg-gray-50 font-semibold text-gray-700">Metric</div>
            <div className="p-4 bg-blue-50 font-semibold text-blue-900 text-center">
              <Link to={`/syndicators/${slug1}`} className="hover:underline">{name1}</Link>
            </div>
            <div className="p-4 bg-emerald-50 font-semibold text-emerald-900 text-center">
              <Link to={`/syndicators/${slug2}`} className="hover:underline">{name2}</Link>
            </div>
          </div>
          {comparisonRows.map((row, i) => (
            <div key={i} className="grid grid-cols-3 gap-0 border-b border-gray-100 last:border-0">
              <div className="p-4 text-gray-600">{row.label}</div>
              <div className="p-4 text-center">{String(row.a)}</div>
              <div className="p-4 text-center">{String(row.b)}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-lg mb-2">Specialties</h3>
            <p className="text-gray-600 text-sm">
              {(syndicator1.specialties || []).join(', ') || '—'}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-lg mb-2">Specialties</h3>
            <p className="text-gray-600 text-sm">
              {(syndicator2.specialties || []).join(', ') || '—'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-12">
          <Link
            to={`/syndicators/${slug1}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
          >
            View {name1} Profile <ChevronRight className="h-5 w-5" />
          </Link>
          <Link
            to={`/syndicators/${slug2}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700"
          >
            View {name2} Profile <ChevronRight className="h-5 w-5" />
          </Link>
          <Link
            to="/directory"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
          >
            Browse All Syndicators
          </Link>
        </div>

        <div className="py-12">
          <FAQSection title="Frequently Asked Questions" faqs={faqs} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
