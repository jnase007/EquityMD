import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Calendar, User, ArrowRight, TrendingUp, Building2, DollarSign } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: "5 Key Metrics Every CRE Syndicator Should Track",
    excerpt: "Learn the essential performance indicators that successful syndicators monitor to maximize investor returns and build trust.",
    author: "EquityMD Team",
    date: "2025-01-25",
    category: "Syndication Tips",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800&h=400",
    slug: "key-metrics-cre-syndicators"
  },
  {
    id: 2,
    title: "How to Build Your Investor Network from Zero",
    excerpt: "Step-by-step guide to attracting and retaining accredited investors for your commercial real estate syndications.",
    author: "Sarah Chen",
    date: "2025-01-22",
    category: "Investor Relations",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800&h=400",
    slug: "build-investor-network-from-zero"
  },
  {
    id: 3,
    title: "Multifamily vs. Industrial: Which Asset Class is Right for You?",
    excerpt: "Compare the pros and cons of multifamily and industrial real estate investments to make informed syndication decisions.",
    author: "Michael Rodriguez",
    date: "2025-01-20",
    category: "Asset Classes",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800&h=400",
    slug: "multifamily-vs-industrial-comparison"
  },
  {
    id: 4,
    title: "SEC Compliance for Real Estate Syndications: A Complete Guide",
    excerpt: "Navigate the complex world of securities regulations with our comprehensive guide to staying compliant in your syndications.",
    author: "Jennifer Kim",
    date: "2025-01-18",
    category: "Legal & Compliance",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800&h=400",
    slug: "sec-compliance-syndications-guide"
  },
  {
    id: 5,
    title: "Market Analysis: Top 10 CRE Markets for 2025",
    excerpt: "Discover the most promising commercial real estate markets for syndication opportunities in 2025 based on economic indicators.",
    author: "David Thompson",
    date: "2025-01-15",
    category: "Market Analysis",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800&h=400",
    slug: "top-cre-markets-2025"
  },
  {
    id: 6,
    title: "Technology Tools Every Modern Syndicator Needs",
    excerpt: "Streamline your syndication process with these essential technology tools and platforms for deal management and investor relations.",
    author: "Lisa Patel",
    date: "2025-01-12",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800&h=400",
    slug: "technology-tools-modern-syndicator"
  }
];

const categories = [
  "All Posts",
  "Syndication Tips",
  "Investor Relations", 
  "Asset Classes",
  "Legal & Compliance",
  "Market Analysis",
  "Technology"
];

export function Blog() {
  const [selectedCategory, setSelectedCategory] = React.useState("All Posts");

  const filteredPosts = selectedCategory === "All Posts" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="CRE Syndication Tips & Insights | Equitymd.com Blog"
        description="Master CRE syndication with expert tips! Learn to list deals or invest with 10K elite investors on Equitymd.com's blog. Start your journey free—read now!"
        keywords="CRE syndication tips, real estate investment insights, commercial real estate blog, syndication strategies, investor education"
        canonical="https://equitymd.com/blog"
      />
      <Navbar />

      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl font-bold mb-6">
            CRE Syndication Insights
          </h1>
          <p className="text-xl text-blue-100">
            Expert tips, market analysis, and strategies to succeed in commercial real estate syndication
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {filteredPosts.length > 0 && (
          <div className="mb-16">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={filteredPosts[0].image}
                    alt={filteredPosts[0].title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      {filteredPosts[0].category}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">
                    {filteredPosts[0].title}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {filteredPosts[0].excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {filteredPosts[0].author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(filteredPosts[0].date).toLocaleDateString()}
                      </div>
                    </div>
                    <Link
                      to={`/blog/${filteredPosts[0].slug}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Read More
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.slice(1).map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                    {post.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-20 bg-blue-600 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            Stay Updated with CRE Insights
          </h3>
          <p className="text-blue-100 mb-6">
            Get the latest syndication tips, market analysis, and investment strategies delivered to your inbox.
          </p>
          <div className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg text-gray-900"
            />
            <button className="bg-blue-700 hover:bg-blue-800 px-6 py-2 rounded-lg font-medium transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 