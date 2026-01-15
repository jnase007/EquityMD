import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Calendar, User, ArrowLeft, Tag, Loader2, Clock, ExternalLink, BookOpen, CheckCircle2, Quote, TrendingUp, Shield, DollarSign, Share2, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

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

// Fallback posts with full content when database is empty
const fallbackPosts: Record<string, BlogPostData> = {
  'beginners-guide-real-estate-syndication-2026': {
    id: '1',
    title: "The Complete Beginner's Guide to Real Estate Syndication in 2026",
    excerpt: 'Learn everything you need to know about real estate syndication, from how it works to finding your first deal.',
    content: `## What is Real Estate Syndication?

Real estate syndication is a partnership between multiple investors who pool their capital to purchase properties larger than they could afford individually. Think of it as crowdfunding for commercial real estate—but with a structured legal framework and professional management.

### How Syndication Works

In a typical syndication deal:

1. **General Partners (GPs)** - Also called syndicators or sponsors, these are the experienced operators who find deals, manage properties, and execute the business plan
2. **Limited Partners (LPs)** - Passive investors who contribute capital and receive returns without day-to-day management responsibilities

### The Benefits of Syndication Investing

**Passive Income**: Unlike managing rental properties yourself, syndication allows you to earn returns without landlord headaches.

**Larger Deals**: Access institutional-quality assets like apartment complexes, office buildings, and retail centers.

**Diversification**: Spread your capital across multiple properties and markets.

**Tax Advantages**: Benefit from depreciation, 1031 exchanges, and other real estate tax benefits.

### Understanding the Numbers

When evaluating a syndication deal, focus on these key metrics:

- **Cash-on-Cash Return**: Annual cash flow divided by your initial investment
- **Internal Rate of Return (IRR)**: Total return accounting for the time value of money
- **Equity Multiple**: Total distributions divided by initial investment
- **Preferred Return**: The minimum return LPs receive before GPs get their share

### Getting Started

1. **Get Educated**: Read books, attend webinars, and learn the fundamentals
2. **Verify Accreditation**: Most syndications require accredited investor status
3. **Build Relationships**: Connect with syndicators and other investors
4. **Start Small**: Begin with a smaller investment to learn the process
5. **Due Diligence**: Always thoroughly vet sponsors and deals

### Common Mistakes to Avoid

- Investing based on projected returns alone
- Skipping background checks on sponsors
- Not reading the Private Placement Memorandum (PPM)
- Putting all capital into one deal
- Ignoring market fundamentals

Real estate syndication offers an incredible opportunity to build wealth through commercial real estate. By understanding the basics and approaching each investment with diligence, you can build a portfolio that generates passive income for years to come.`,
    author: 'Dr. Sarah Chen',
    published_at: new Date().toISOString(),
    category: 'Education',
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200&h=600',
    meta_description: 'Learn real estate syndication basics: how it works, key metrics like IRR and cash-on-cash returns, and steps to start investing passively.',
    meta_keywords: ['real estate syndication', 'passive investing', 'commercial real estate', 'syndication for beginners'],
    reading_time: 12,
    key_takeaways: [
      'Syndication allows passive investment in large commercial properties',
      'Key metrics include IRR, Cash-on-Cash, and Equity Multiple',
      'Always perform due diligence on sponsors before investing'
    ],
    quotable_stats: [
      'Average syndication deals target 15-20% IRR',
      'Typical hold periods are 3-7 years',
      'Most syndications require $50,000-$100,000 minimum investment'
    ],
    faq_schema: [
      { question: 'What is real estate syndication?', answer: 'Real estate syndication is a partnership where multiple investors pool capital to purchase larger commercial properties together.' },
      { question: 'Do I need to be an accredited investor?', answer: 'Most syndications require accredited investor status, though some 506(b) offerings allow sophisticated non-accredited investors.' },
      { question: 'What is a typical minimum investment?', answer: 'Most syndications have minimums between $50,000 and $100,000, though some start at $25,000.' }
    ]
  },
  'multifamily-market-outlook-2026': {
    id: '2',
    title: '2026 Multifamily Market Outlook: Where to Invest This Year',
    excerpt: 'Discover the top markets for multifamily investment in 2026. Our analysis covers rent growth, cap rates, and emerging opportunities.',
    content: `## The State of Multifamily in 2026

The multifamily sector continues to show resilience heading into 2026, though investors need to be more selective about markets and deal structures than in previous years.

### Top Markets for 2026

**Sun Belt Dominance Continues**

The Sun Belt region remains the primary destination for both population and capital flows:

- **Austin, TX** - Despite cooling from pandemic highs, still shows strong fundamentals
- **Phoenix, AZ** - Continued in-migration and job growth support demand
- **Nashville, TN** - Healthcare and entertainment sectors driving growth
- **Tampa, FL** - Affordable relative to other Florida markets
- **Charlotte, NC** - Banking hub with diverse economy

### Key Trends Shaping the Market

**1. Interest Rate Normalization**
After years of volatility, rates are stabilizing, giving investors more certainty for underwriting.

**2. Supply Pipeline Moderating**
New construction starts have slowed, which should help occupancy rates recover in previously oversupplied markets.

**3. Affordability Focus**
Workforce housing (Class B and C properties) continues to outperform luxury Class A developments.

**4. Technology Integration**
Properties with smart home features and enhanced amenities command premium rents.

### Investment Strategies for 2026

**Value-Add Remains King**
Properties with renovation upside continue to offer the best risk-adjusted returns.

**Focus on Fundamentals**
Job growth, population trends, and supply/demand balance matter more than ever.

**Conservative Underwriting**
Use realistic rent growth assumptions (2-3% vs. historical 5%+).

### Markets to Watch

Several emerging markets deserve attention for their growth potential:

- Huntsville, AL - Tech and defense sector expansion
- Boise, ID - Quality of life driving continued in-migration
- Salt Lake City, UT - Strong job market and population growth

The multifamily market in 2026 rewards disciplined investors who focus on fundamentals over speculation.`,
    author: 'Marcus Johnson, CFA',
    published_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    category: 'Market Analysis',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200&h=600',
    meta_description: 'Discover top multifamily markets for 2026 investment. Analysis of rent growth, cap rates, and emerging Sun Belt opportunities.',
    meta_keywords: ['multifamily investing', '2026 market outlook', 'Sun Belt real estate', 'apartment investing'],
    reading_time: 10,
    key_takeaways: [
      'Sun Belt markets continue to lead in population and job growth',
      'Value-add strategies offer best risk-adjusted returns',
      'Conservative underwriting is essential in the current environment'
    ],
    quotable_stats: [
      'Sun Belt markets saw 15% population growth since 2020',
      'Workforce housing outperformed Class A by 200 basis points',
      'New construction starts down 25% from 2023 peak'
    ]
  },
  'evaluate-syndication-deal-due-diligence': {
    id: '3',
    title: 'How to Evaluate a Real Estate Syndication Deal: Due Diligence Checklist',
    excerpt: 'Before investing in any syndication, thorough due diligence is essential. Use this comprehensive checklist.',
    content: `## The Due Diligence Process

Investing in real estate syndications requires careful evaluation of multiple factors. This checklist will help you make informed decisions.

### Sponsor Evaluation

**Track Record**
- How many deals has the sponsor completed?
- What were the actual returns vs. projected?
- Have they experienced market downturns? How did they perform?

**Team Composition**
- Who are the key team members?
- What is their relevant experience?
- Do they have local market expertise?

**Alignment of Interests**
- How much capital is the sponsor investing?
- What is the fee structure?
- When does the sponsor get paid?

### Property Analysis

**Location Fundamentals**
- Job growth in the area
- Population trends
- Crime statistics
- School ratings
- Proximity to employment centers

**Physical Condition**
- Age of major systems (roof, HVAC, plumbing)
- Recent capital expenditures
- Deferred maintenance
- Environmental concerns

**Financial Performance**
- Current occupancy rates
- Rent roll analysis
- Operating expenses
- Historical financial statements

### Deal Structure

**Legal Documents Review**
- Private Placement Memorandum (PPM)
- Operating Agreement
- Subscription Agreement

**Return Structure**
- Preferred return rate
- Profit split (waterfall structure)
- Fees (acquisition, asset management, disposition)

**Exit Strategy**
- Projected hold period
- Refinance vs. sale options
- Market conditions for exit

### Red Flags to Watch For

- Unrealistic return projections
- Lack of sponsor co-investment
- Poor communication history
- No track record verification
- Pressure to invest quickly

### Final Steps

1. Verify all claims independently
2. Speak with previous investors
3. Consult with your CPA and attorney
4. Never invest more than you can afford to lose
5. Trust your instincts

Thorough due diligence takes time but protects your capital and gives you confidence in your investment decisions.`,
    author: 'Jennifer Walsh, JD',
    published_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    category: 'Due Diligence',
    image_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200&h=600',
    meta_description: 'Complete due diligence checklist for real estate syndication investments. Learn to evaluate sponsors, properties, and deal structures.',
    meta_keywords: ['syndication due diligence', 'real estate investing checklist', 'sponsor evaluation', 'deal analysis'],
    reading_time: 15,
    key_takeaways: [
      'Always verify sponsor track record with actual investors',
      'Review all legal documents with qualified professionals',
      'Red flags include unrealistic projections and pressure tactics'
    ],
    quotable_stats: [
      '80% of syndication success depends on sponsor quality',
      'Top sponsors typically co-invest 5-10% of equity',
      'Average due diligence should take 2-4 weeks minimum'
    ],
    faq_schema: [
      { question: 'What documents should I review?', answer: 'Review the PPM (Private Placement Memorandum), Operating Agreement, and Subscription Agreement carefully with legal counsel.' },
      { question: 'How do I verify sponsor track record?', answer: 'Ask for references from previous investors, review completed deal summaries, and check for any legal or regulatory issues.' }
    ]
  },
  'tax-benefits-real-estate-syndication': {
    id: '4',
    title: 'Tax Benefits of Real Estate Syndication: What Investors Need to Know',
    excerpt: 'Real estate syndication offers powerful tax advantages. Learn about depreciation, cost segregation, and more.',
    content: `## Understanding Real Estate Tax Benefits

One of the most compelling reasons to invest in real estate syndications is the significant tax advantages they offer. This guide explains the key benefits.

### Depreciation: The Paper Loss

**How It Works**
The IRS allows property owners to deduct the cost of buildings over 27.5 years (residential) or 39 years (commercial). This "paper loss" can offset your passive income.

**Pass-Through Benefits**
As a limited partner, you receive your share of depreciation deductions on your K-1, which can reduce or eliminate the taxes on your distributions.

### Cost Segregation Studies

**Accelerating Depreciation**
Cost segregation identifies components that can be depreciated faster:
- 5-year property: Appliances, carpeting, certain fixtures
- 15-year property: Landscaping, parking lots, sidewalks

**Tax Impact**
A cost segregation study can move 20-40% of a building's value into shorter depreciation schedules, creating substantial first-year deductions.

### Bonus Depreciation

Current tax law allows 60% bonus depreciation on qualifying property improvements (decreasing 20% annually through 2026).

### 1031 Exchanges

While individual LPs can't directly 1031 exchange syndication interests, some sponsors structure deals to allow:
- Drop and swap arrangements
- Delaware Statutory Trusts (DSTs)
- Opportunity Zone investments

### Passive Loss Rules

**Understanding Limitations**
Passive losses can only offset passive income. However, real estate professionals may qualify for active treatment.

**Carryforward Benefits**
Unused passive losses carry forward to future years or can offset gains at sale.

### Capital Gains Treatment

Long-term capital gains on property sales (held over 1 year) receive preferential tax rates:
- 0%, 15%, or 20% depending on income level
- Plus potential 3.8% Net Investment Income Tax

### Working with Professionals

Always consult with:
- A CPA experienced in real estate investments
- A tax attorney for complex situations
- Your financial advisor for portfolio planning

The tax benefits of real estate syndication can significantly enhance your after-tax returns, making it a powerful wealth-building tool.`,
    author: 'Robert Kim, CPA',
    published_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    category: 'Tax Strategy',
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200&h=600',
    meta_description: 'Learn the tax benefits of real estate syndication: depreciation, cost segregation, 1031 exchanges, and strategies to maximize after-tax returns.',
    meta_keywords: ['real estate tax benefits', 'depreciation', 'cost segregation', '1031 exchange', 'passive income taxes'],
    reading_time: 11,
    key_takeaways: [
      'Depreciation creates "paper losses" that offset taxable income',
      'Cost segregation can accelerate deductions significantly',
      'Long-term capital gains receive preferential tax treatment'
    ],
    quotable_stats: [
      'Cost segregation can move 20-40% of value to faster depreciation',
      'Long-term capital gains taxed at 0-20% vs. ordinary income rates up to 37%',
      'Bonus depreciation at 60% in 2024, decreasing 20% annually'
    ],
    faq_schema: [
      { question: 'Can I use syndication losses against my W-2 income?', answer: 'Generally no. Passive losses can only offset passive income unless you qualify as a real estate professional.' },
      { question: 'What is a K-1?', answer: 'A K-1 is a tax form that reports your share of the partnership\'s income, deductions, and credits.' }
    ]
  },
  'multifamily-industrial-self-storage-comparison': {
    id: '5',
    title: 'Multifamily vs. Industrial vs. Self-Storage: Comparing CRE Asset Classes',
    excerpt: 'Which commercial real estate asset class is right for you? Compare across risk, returns, and market dynamics.',
    content: `## Choosing the Right Asset Class

Each commercial real estate sector offers distinct advantages and considerations. Understanding these differences helps you build a diversified portfolio.

### Multifamily Properties

**Pros**
- Essential housing provides recession resistance
- Steady cash flow from monthly rents
- Large, liquid market with ample data
- Multiple financing options available

**Cons**
- Lower yields compared to other asset classes
- Management intensive
- Rent control risks in some markets
- Higher per-unit renovation costs

**Typical Returns**
- Cash-on-Cash: 6-10%
- IRR: 13-18%

### Industrial Properties

**Pros**
- E-commerce tailwinds driving demand
- Long lease terms (5-10 years)
- Triple net leases reduce management burden
- Lower tenant turnover costs

**Cons**
- Tenant concentration risk
- Specialized buildings may limit tenant pool
- Location critical for logistics properties
- Higher upfront capital requirements

**Typical Returns**
- Cash-on-Cash: 5-8%
- IRR: 12-16%

### Self-Storage Facilities

**Pros**
- Recession resistant (people need storage in good and bad times)
- Low operating costs
- Month-to-month leases allow rent flexibility
- Minimal tenant improvements needed

**Cons**
- Highly fragmented market
- Location dependent
- Technology disruption potential
- Oversupply in some markets

**Typical Returns**
- Cash-on-Cash: 7-12%
- IRR: 14-20%

### Comparison Matrix

| Factor | Multifamily | Industrial | Self-Storage |
|--------|-------------|------------|--------------|
| Management Intensity | High | Low | Medium |
| Lease Length | 12 months | 5-10 years | Month-to-month |
| Recession Resistance | Strong | Moderate | Strong |
| Entry Capital | Medium | High | Low-Medium |
| Appreciation Potential | Moderate | High | High |

### Building Your Portfolio

**Diversification Strategy**
Consider allocating across multiple asset classes:
- 50% Multifamily (stability)
- 30% Industrial (growth)
- 20% Self-Storage (yield)

**Risk Tolerance Considerations**
- Conservative: Weight toward multifamily
- Growth-oriented: Emphasize industrial
- Yield-focused: Consider self-storage

Each asset class has a role in a well-constructed portfolio. The right mix depends on your goals, risk tolerance, and investment timeline.`,
    author: 'Amanda Torres',
    published_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    category: 'Investment Strategy',
    image_url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=1200&h=600',
    meta_description: 'Compare multifamily, industrial, and self-storage investments. Analyze returns, risks, and which CRE asset class fits your portfolio.',
    meta_keywords: ['commercial real estate comparison', 'multifamily investing', 'industrial real estate', 'self-storage investing'],
    reading_time: 9,
    key_takeaways: [
      'Each asset class offers distinct risk/return profiles',
      'Diversification across sectors reduces portfolio risk',
      'Match asset class selection to your investment goals'
    ],
    quotable_stats: [
      'Industrial vacancy at historic lows near 4%',
      'Self-storage demand grew 8% annually since 2020',
      'Multifamily remains the most liquid CRE sector'
    ]
  },
  'build-passive-income-real-estate-syndication': {
    id: '6',
    title: 'How to Build $10,000/Month in Passive Income Through Real Estate Syndication',
    excerpt: 'A step-by-step guide to building a $10,000 monthly passive income stream through strategic syndication investments.',
    content: `## The Path to $10,000/Month Passive Income

Building significant passive income through real estate syndication is achievable with a strategic approach and patience. Here's a realistic roadmap.

### Understanding the Math

To generate $10,000/month ($120,000/year) in distributions:

**At 8% Cash-on-Cash Return**
Required Investment: $1,500,000

**At 10% Cash-on-Cash Return**
Required Investment: $1,200,000

### The Accumulation Strategy

**Phase 1: Foundation (Years 1-3)**
- Invest $100,000-$200,000 across 2-4 deals
- Focus on learning and building relationships
- Reinvest all distributions
- Target: $10,000-$20,000 annual passive income

**Phase 2: Acceleration (Years 3-6)**
- Increase annual investments to $150,000-$250,000
- Diversify across asset classes and sponsors
- Consider refinance proceeds for reinvestment
- Target: $40,000-$60,000 annual passive income

**Phase 3: Optimization (Years 6-10)**
- Deploy capital from exits into new deals
- Focus on consistent cash-flowing properties
- Fine-tune sponsor and asset class allocation
- Target: $100,000+ annual passive income

### Portfolio Construction

**Diversification Principles**
- No more than 20% with any single sponsor
- Mix asset classes (multifamily, industrial, storage)
- Geographic diversification across markets
- Blend of cash flow and appreciation deals

**Sample $1.5M Portfolio**
| Investment | Amount | Est. Annual Cash Flow |
|------------|--------|----------------------|
| Multifamily Deal A | $250,000 | $20,000 |
| Multifamily Deal B | $250,000 | $22,500 |
| Industrial Fund | $300,000 | $21,000 |
| Self-Storage A | $200,000 | $18,000 |
| Self-Storage B | $200,000 | $20,000 |
| Value-Add MF | $300,000 | $18,500 |
| **TOTAL** | **$1,500,000** | **$120,000** |

### Maximizing Your Returns

**1. Reinvest Distributions Initially**
In the early years, reinvesting distributions accelerates wealth building through compounding.

**2. Focus on Tax Efficiency**
Depreciation benefits reduce your tax burden, effectively increasing your net returns.

**3. Build Sponsor Relationships**
Top sponsors often offer better terms to repeat investors.

**4. Stay Liquid**
Keep 10-15% of your portfolio in liquid assets for opportunities.

### Common Pitfalls to Avoid

- Chasing yield over quality
- Over-concentrating in one market or sponsor
- Not accounting for capital call reserves
- Ignoring the power of compounding
- Becoming impatient with the timeline

### The Long Game

Building $10,000/month in passive income typically takes 7-12 years of consistent investing. The key is:

1. Start as early as possible
2. Invest consistently
3. Reinvest returns in the early years
4. Gradually shift to cash flow as you approach your goal
5. Maintain discipline through market cycles

Real estate syndication is a proven path to financial freedom. With patience and smart execution, you can build the passive income stream you're working toward.`,
    author: 'EquityMD Team',
    published_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    category: 'Passive Income',
    image_url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1200&h=600',
    meta_description: 'Learn to build $10,000/month passive income through real estate syndication. Step-by-step guide with portfolio strategies and timelines.',
    meta_keywords: ['passive income real estate', 'syndication investing', 'financial freedom', 'real estate portfolio'],
    reading_time: 13,
    key_takeaways: [
      '$1.2-1.5M invested can generate $10K/month at typical yields',
      'Building this income typically takes 7-12 years',
      'Diversification and reinvestment are key to success'
    ],
    quotable_stats: [
      '8-10% cash-on-cash returns are typical for stabilized deals',
      'Reinvesting for first 5 years can double your timeline acceleration',
      'Top investors limit single-sponsor exposure to 20%'
    ],
    faq_schema: [
      { question: 'How much do I need to start?', answer: 'Most syndications have $50,000-$100,000 minimums, but you can start with smaller amounts through some platforms.' },
      { question: 'How long does it take to reach $10K/month?', answer: 'With consistent investing and reinvestment, most investors can reach this goal in 7-12 years.' }
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
  const [readingProgress, setReadingProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<{slug: string; title: string; category: string}[]>([]);
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dim' || theme === 'dark';

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
        console.log('Fetching blog post with slug:', slug);
        
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        console.log('Blog post query result:', { data, error });

        if (error || !data) {
          console.warn('Blog post not found in database, checking fallback:', slug);
          console.warn('Error details:', error);
          
          // Check fallback posts
          const fallbackPost = fallbackPosts[slug];
          if (fallbackPost) {
            setPost(fallbackPost);
            
            // Set related posts from fallback data
            const relatedFallback = Object.entries(fallbackPosts)
              .filter(([key, post]) => key !== slug && post.category === fallbackPost.category)
              .slice(0, 3)
              .map(([key, post]) => ({ slug: key, title: post.title, category: post.category }));
            
            if (relatedFallback.length === 0) {
              // If no same-category posts, get any other posts
              const otherPosts = Object.entries(fallbackPosts)
                .filter(([key]) => key !== slug)
                .slice(0, 3)
                .map(([key, post]) => ({ slug: key, title: post.title, category: post.category }));
              setRelatedPosts(otherPosts);
            } else {
              setRelatedPosts(relatedFallback);
            }
            setLoading(false);
            return;
          }
          
          setNotFound(true);
          return;
        }

        setPost(data);
        // Track view (fire and forget)
        supabase.rpc('increment_blog_view', { post_slug: slug })
        
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
        
        // Try fallback on error too
        const fallbackPost = fallbackPosts[slug];
        if (fallbackPost) {
          setPost(fallbackPost);
          const otherPosts = Object.entries(fallbackPosts)
            .filter(([key]) => key !== slug)
            .slice(0, 3)
            .map(([key, post]) => ({ slug: key, title: post.title, category: post.category }));
          setRelatedPosts(otherPosts);
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
        type="article"
        articlePublishedTime={post.date}
        articleModifiedTime={post.updated_at || post.date}
        articleAuthor={post.author}
        articleSection={post.category}
        image={post.image}
        breadcrumbs={[
          { name: 'Home', url: 'https://equitymd.com' },
          { name: 'Blog', url: 'https://equitymd.com/blog' },
          { name: post.title, url: `https://equitymd.com/blog/${slug}` }
        ]}
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
          src={post.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200&h=600'}
          alt={post.title}
          className="w-full h-full object-cover opacity-70"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200&h=600';
          }}
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
                  Real Estate Syndications
                </span>
              </h3>
              
              <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
                Get exclusive access to vetted real estate syndication opportunities. 
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
