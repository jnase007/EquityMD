import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Calendar, User, ArrowLeft, Tag, Loader2, Clock, ExternalLink, BookOpen, CheckCircle2, Quote } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FAQItem {
  question: string;
  answer: string;
}

interface SourceItem {
  name: string;
  url: string;
}

interface BlogPostData {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string;
  category: string;
  image_url: string;
  meta_description: string;
  meta_keywords: string[];
  faq_schema?: FAQItem[];
  sources?: SourceItem[];
  internal_links?: string[];
  reading_time?: number;
  key_takeaways?: string[];
  quotable_stats?: string[];
}

// Static posts for backwards compatibility
const staticPosts: Record<string, BlogPostData> = {
  'key-metrics-cre-syndicators': {
    id: '1',
    title: '5 Key Metrics Every CRE Syndicator Should Track',
    excerpt: 'Learn the essential performance indicators that successful syndicators monitor to maximize investor returns and build trust.',
    content: `## Introduction

Successful commercial real estate syndication requires more than just finding great deals—it demands meticulous tracking of key performance indicators (KPIs) that ensure your investments perform as expected and your investors remain confident in your management.

## 1. Cash-on-Cash Return (CoC)

Cash-on-cash return measures the annual pre-tax cash flow relative to the total cash invested. This metric gives investors a clear picture of how their capital is performing year over year.

**Formula:** Annual Cash Flow / Total Cash Invested × 100

A healthy CoC return for value-add multifamily typically ranges from 6-10% during the hold period.

## 2. Internal Rate of Return (IRR)

IRR considers the time value of money and provides a comprehensive view of the investment's total return, including cash flow and appreciation upon sale.

Target IRRs vary by investment strategy:
- Core deals: 8-12%
- Core-plus: 10-14%
- Value-add: 14-20%
- Opportunistic: 18%+

## 3. Equity Multiple

The equity multiple tells investors how much they'll receive back compared to their initial investment. An equity multiple of 2.0x means investors double their money.

**Formula:** Total Distributions / Total Equity Invested

## 4. Debt Service Coverage Ratio (DSCR)

DSCR measures your property's ability to cover debt payments from operating income. Lenders typically require a minimum DSCR of 1.20-1.25x.

**Formula:** Net Operating Income / Total Debt Service

## 5. Occupancy Rate

Track both physical occupancy (occupied units) and economic occupancy (actual rent collected vs. potential rent). The gap between these numbers reveals collection issues or excessive concessions.

## Conclusion

Regularly monitoring these five metrics will help you identify issues early, communicate effectively with investors, and make data-driven decisions that maximize returns for everyone involved.`,
    author: 'EquityMD Team',
    published_at: '2025-01-25',
    category: 'Syndication Tips',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200&h=600',
    meta_description: 'Learn the 5 essential metrics every CRE syndicator should track to maximize returns and build investor trust.',
    meta_keywords: ['syndication metrics', 'CRE investing', 'IRR', 'cash on cash return'],
    reading_time: 5,
    faq_schema: [
      { question: 'What is a good cash-on-cash return for multifamily?', answer: 'A healthy cash-on-cash return for value-add multifamily typically ranges from 6-10% during the hold period.' },
      { question: 'What IRR should I expect from a syndication?', answer: 'Target IRRs vary by strategy: Core 8-12%, Core-plus 10-14%, Value-add 14-20%, Opportunistic 18%+.' }
    ]
  }
};

// Generate JSON-LD Schema for Article
function generateArticleSchema(post: BlogPostData, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.meta_description || post.excerpt,
    "image": post.image_url,
    "author": {
      "@type": "Organization",
      "name": post.author,
      "url": "https://equitymd.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "EquityMD",
      "logo": {
        "@type": "ImageObject",
        "url": "https://equitymd.com/logo-black.png"
      }
    },
    "datePublished": post.published_at,
    "dateModified": post.published_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://equitymd.com/blog/${slug}`
    },
    "keywords": post.meta_keywords?.join(', ') || ''
  };
}

// Generate FAQ Schema for rich snippets
function generateFAQSchema(faqs: FAQItem[]) {
  if (!faqs || faqs.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Generate BreadcrumbList Schema
function generateBreadcrumbSchema(post: BlogPostData, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://equitymd.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://equitymd.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://equitymd.com/blog/${slug}`
      }
    ]
  };
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        // First try to fetch from database
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (data) {
          setPost(data);
          // Track view (fire and forget)
          supabase.rpc('increment_blog_view', { post_slug: slug }).catch(() => {});
          setLoading(false);
          return;
        }

        // If not in database, check static posts
        if (staticPosts[slug]) {
          setPost(staticPosts[slug]);
          setLoading(false);
          return;
        }

        setNotFound(true);
      } catch (err) {
        console.warn('Error fetching blog post:', err);
        if (slug && staticPosts[slug]) {
          setPost(staticPosts[slug]);
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Convert markdown to HTML
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let orderedListItems: string[] = [];
    let inUnorderedList = false;
    let inOrderedList = false;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc list-outside ml-6 space-y-2 my-4 text-gray-700">
            {listItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
        listItems = [];
        inUnorderedList = false;
      }
      if (orderedListItems.length > 0) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal list-outside ml-6 space-y-2 my-4 text-gray-700">
            {orderedListItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        );
        orderedListItems = [];
        inOrderedList = false;
      }
    };

    const formatInlineText = (text: string) => {
      const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        // Handle links [text](url)
        const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          const isInternal = linkMatch[2].startsWith('/');
          if (isInternal) {
            return <Link key={i} to={linkMatch[2]} className="text-blue-600 hover:underline">{linkMatch[1]}</Link>;
          }
          return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{linkMatch[1]}</a>;
        }
        return part;
      });
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={index} className="text-2xl font-bold text-gray-900 mt-10 mb-4" id={trimmed.slice(3).toLowerCase().replace(/\s+/g, '-')}>
            {trimmed.slice(3)}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-xl font-semibold text-gray-900 mt-8 mb-3">
            {trimmed.slice(4)}
          </h3>
        );
      } else if (trimmed.startsWith('- ')) {
        inUnorderedList = true;
        listItems.push(trimmed.slice(2));
      } else if (/^\d+\.\s/.test(trimmed)) {
        inOrderedList = true;
        orderedListItems.push(trimmed.replace(/^\d+\.\s/, ''));
      } else if (trimmed.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={index} className="border-l-4 border-blue-500 pl-4 my-6 italic text-gray-700 bg-blue-50 py-3 rounded-r">
            {formatInlineText(trimmed.slice(2))}
          </blockquote>
        );
      } else if (trimmed) {
        flushList();
        elements.push(
          <p key={index} className="text-gray-700 leading-relaxed my-4">
            {formatInlineText(trimmed)}
          </p>
        );
      }
    });

    flushList();
    return elements;
  };

  // Schema markup
  const articleSchema = generateArticleSchema(post, slug || '');
  const faqSchema = post.faq_schema ? generateFAQSchema(post.faq_schema) : null;
  const breadcrumbSchema = generateBreadcrumbSchema(post, slug || '');

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title={`${post.title} | EquityMD Blog`}
        description={post.meta_description || post.excerpt}
        keywords={post.meta_keywords?.join(', ') || 'multifamily investing, real estate syndication'}
        canonical={`https://equitymd.com/blog/${slug}`}
      />
      
      {/* JSON-LD Schema Markup */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      
      <Navbar />

      {/* Hero Image */}
      <div className="relative h-[400px] bg-gray-900">
        <img
          src={post.image_url}
          alt={post.title}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-4 -mt-32 relative z-10 pb-20">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Back Link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Category & Reading Time */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              <Tag className="h-3 w-3" />
              {post.category}
            </span>
            {post.reading_time && (
              <span className="inline-flex items-center gap-1 text-gray-500 text-sm">
                <Clock className="h-3 w-3" />
                {post.reading_time} min read
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-gray-500 mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
          </div>

          {/* Excerpt */}
          <p className="text-xl text-gray-600 italic mb-8 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Key Takeaways - Critical for GEO (AI Search) */}
          {post.key_takeaways && post.key_takeaways.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg p-6 mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                Key Takeaways
              </h2>
              <ul className="space-y-3">
                {post.key_takeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </span>
                    <span className="text-gray-700">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quotable Stats - For AI Citation */}
          {post.quotable_stats && post.quotable_stats.length > 0 && (
            <div className="bg-gray-900 text-white rounded-lg p-6 mb-10">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Quote className="h-5 w-5 text-blue-400" />
                Quick Stats
              </h2>
              <div className="grid gap-4">
                {post.quotable_stats.slice(0, 3).map((stat, i) => (
                  <div key={i} className="flex items-start gap-3 border-l-2 border-blue-400 pl-4">
                    <p className="text-gray-200 text-sm">{stat}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            {renderContent(post.content)}
          </div>

          {/* FAQ Section */}
          {post.faq_schema && post.faq_schema.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {post.faq_schema.map((faq, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {post.sources && post.sources.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Sources & References</h4>
              <ul className="space-y-2">
                {post.sources.map((source, i) => (
                  <li key={i}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                    >
                      {source.name}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Keywords */}
          {post.meta_keywords && post.meta_keywords.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Related Topics</h4>
              <div className="flex flex-wrap gap-2">
                {post.meta_keywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">
              Ready to Start Investing in Multifamily?
            </h3>
            <p className="text-blue-100 mb-6">
              Browse exclusive apartment syndication opportunities on EquityMD.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/find"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition font-medium"
              >
                Browse Deals
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-400 transition font-medium"
              >
                Learn How It Works
              </Link>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
