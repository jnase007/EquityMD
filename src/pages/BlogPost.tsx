import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Calendar, User, ArrowLeft, Tag, Loader2, Clock, ExternalLink, BookOpen, CheckCircle2, Quote, TrendingUp, Shield, DollarSign, Share2, Twitter, Linkedin, Copy, Check } from 'lucide-react';
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
  const [readingProgress, setReadingProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<{slug: string; title: string; category: string}[]>([]);

  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Reading progress bar
  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setReadingProgress(Math.min(progress, 100));
    };
    
    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (error || !data) {
          console.warn('Blog post not found:', slug, error?.message);
          setNotFound(true);
          return;
        }

        setPost(data);
        // Track view (fire and forget)
        supabase.rpc('increment_blog_view', { post_slug: slug }).catch(() => {});
        
        // Fetch related posts from same category
        const { data: related } = await supabase
          .from('blog_posts')
          .select('slug, title, category')
          .eq('is_published', true)
          .eq('category', data.category)
          .neq('slug', slug)
          .limit(3);
        
        if (related) setRelatedPosts(related);
      } catch (err) {
        console.warn('Error fetching blog post:', err);
        setNotFound(true);
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

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

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

          {/* Share This Article */}
          <div className="mt-10 pt-6 border-t">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <span className="text-sm font-medium text-gray-500">Share this article:</span>
              <div className="flex items-center gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://equitymd.com/blog/${slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-full transition"
                  title="Share on Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://equitymd.com/blog/${slug}`)}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-full transition"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://equitymd.com/blog/${slug}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-2 bg-gray-100 hover:bg-green-100 hover:text-green-600 rounded-full transition"
                  title="Copy link"
                >
                  {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced CTA - Investor Signup */}
          <div className="mt-12 relative overflow-hidden rounded-2xl">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
            
            <div className="relative px-8 py-12 md:px-12 md:py-16 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <TrendingUp className="h-4 w-4" />
                Join 2,500+ Passive Investors
              </div>

              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Start Building Wealth Through<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                  Apartment Syndications
                </span>
              </h3>
              
              <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
                Get exclusive access to vetted multifamily deals with projected 15-20% annual returns. 
                No landlord headaches. Truly passive income.
              </p>

              {/* Benefits */}
              <div className="flex flex-wrap justify-center gap-6 mb-10">
                <div className="flex items-center gap-2 text-blue-200">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span>SEC-Compliant Deals</span>
                </div>
                <div className="flex items-center gap-2 text-blue-200">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <span>$50K Minimum</span>
                </div>
                <div className="flex items-center gap-2 text-blue-200">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Accredited Investors Only</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-xl hover:bg-blue-50 transition font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Create Free Account
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </Link>
                <Link
                  to="/find"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-xl hover:bg-white/20 transition font-medium text-lg"
                >
                  Browse Current Deals
                </Link>
              </div>

              {/* Trust indicators */}
              <p className="text-blue-300/70 text-sm mt-8">
                Free to join • No obligation • View deals instantly
              </p>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-xl font-bold text-gray-900 mb-6">More in {post.category}</h3>
              <div className="grid gap-4">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    to={`/blog/${related.slug}`}
                    className="group flex items-center gap-4 p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition"
                  >
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full group-hover:scale-150 transition" />
                    <span className="text-gray-700 group-hover:text-blue-600 transition font-medium">
                      {related.title}
                    </span>
                    <ArrowLeft className="h-4 w-4 rotate-180 text-gray-400 group-hover:text-blue-600 ml-auto transition" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <Footer />
    </div>
  );
}
