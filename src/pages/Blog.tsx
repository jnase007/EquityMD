import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { 
  Calendar, User, ArrowRight, Loader2, TrendingUp, 
  BookOpen, Clock, Sparkles, Search, Tag, ChevronRight,
  BarChart3, FileText, DollarSign, Building2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  image: string;
  slug: string;
  reading_time?: number;
}

const categoryIcons: Record<string, React.ElementType> = {
  'Education': BookOpen,
  'Market Analysis': BarChart3,
  'Due Diligence': FileText,
  'Tax Strategy': DollarSign,
  'Investment Strategy': TrendingUp,
  'Passive Income': Sparkles,
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'Education': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Market Analysis': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Due Diligence': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Tax Strategy': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Investment Strategy': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Passive Income': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
};

export function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("All Posts");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>(["All Posts"]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, title, excerpt, author, published_at, category, image_url, slug, reading_time')
          .eq('is_published', true)
          .order('published_at', { ascending: false });
        
        if (error) {
          console.warn('Could not fetch blog posts from database:', error.message);
          return;
        }
        
        if (data && data.length > 0) {
          const dbPosts: BlogPost[] = data.map(post => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            author: post.author,
            date: post.published_at || new Date().toISOString(),
            category: post.category,
            image: post.image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800&h=400',
            slug: post.slug,
            reading_time: post.reading_time || 5
          }));
          
          setBlogPosts(dbPosts);
          
          const allCategories = new Set(['All Posts']);
          dbPosts.forEach(post => allCategories.add(post.category));
          setCategories(Array.from(allCategories));
        }
      } catch (err) {
        console.warn('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBlogPosts();
  }, []);

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All Posts" || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryStyle = (category: string) => {
    return categoryColors[category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  };

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || Tag;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <SEO 
        title="CRE Syndication Tips & Insights | Equitymd.com Blog"
        description="Master CRE syndication with expert tips! Learn to list deals or invest with 7,400+ elite investors on Equitymd.com's blog. Start your journey free—read now!"
        keywords="CRE syndication tips, real estate investment insights, commercial real estate blog, syndication strategies, investor education"
        canonical="https://equitymd.com/blog"
      />
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              Expert Insights for Savvy Investors
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              CRE Syndication
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"> Insights</span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Expert tips, market analysis, and strategies to succeed in commercial real estate syndication. 
              Learn from industry professionals and build your wealth.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50L48 45.7C96 41.3 192 32.7 288 30.2C384 27.7 480 31.3 576 38.5C672 45.7 768 56.3 864 58.8C960 61.3 1056 55.7 1152 50C1248 44.3 1344 38.7 1392 35.8L1440 33V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" fill="rgb(248 250 252)"/>
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              const Icon = getCategoryIcon(category);
              const colors = getCategoryStyle(category);
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : `${colors.bg} ${colors.text} hover:shadow-md border ${colors.border}`
                  }`}
                >
                  {category !== 'All Posts' && <Icon className="h-4 w-4" />}
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
              <BookOpen className="absolute inset-0 m-auto h-6 w-6 text-blue-600" />
            </div>
            <p className="text-gray-500 mt-4">Loading articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? `No results for "${searchQuery}"` : 'Check back soon for new content!'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {filteredPosts.length > 0 && (
              <div className="mb-16">
                <Link 
                  to={`/blog/${filteredPosts[0].slug}`}
                  className="group block bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
                >
                  <div className="lg:flex">
                    <div className="lg:w-1/2 relative overflow-hidden">
                      <img
                        src={filteredPosts[0].image}
                        alt={filteredPosts[0].title}
                        className="w-full h-64 lg:h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent lg:hidden" />
                    </div>
                    <div className="lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          <Sparkles className="h-3.5 w-3.5" />
                          Featured
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getCategoryStyle(filteredPosts[0].category).bg} ${getCategoryStyle(filteredPosts[0].category).text}`}>
                          {React.createElement(getCategoryIcon(filteredPosts[0].category), { className: "h-3.5 w-3.5" })}
                          {filteredPosts[0].category}
                        </span>
                      </div>
                      
                      <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {filteredPosts[0].title}
                      </h2>
                      
                      <p className="text-gray-600 mb-6 text-lg leading-relaxed line-clamp-3">
                        {filteredPosts[0].excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            {filteredPosts[0].author}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {new Date(filteredPosts[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          {filteredPosts[0].reading_time && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              {filteredPosts[0].reading_time} min read
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                          Read Article
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Blog Posts Grid */}
            {filteredPosts.length > 1 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.slice(1).map((post) => {
                  const CategoryIcon = getCategoryIcon(post.category);
                  const colors = getCategoryStyle(post.category);
                  
                  return (
                    <article 
                      key={post.id} 
                      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                    >
                      <Link to={`/blog/${post.slug}`} className="block relative overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${colors.bg} ${colors.text}`}>
                            <CategoryIcon className="h-3 w-3" />
                            {post.category}
                          </span>
                          {post.reading_time && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              {post.reading_time} min
                            </span>
                          )}
                        </div>
                        
                        <Link to={`/blog/${post.slug}`}>
                          <h3 className="text-lg font-bold mb-3 text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                            {post.title}
                          </h3>
                        </Link>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm flex-1">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {post.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="text-xs">
                              <div className="font-medium text-gray-900">{post.author}</div>
                              <div className="text-gray-500">
                                {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          </div>
                          <Link
                            to={`/blog/${post.slug}`}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm group-hover:gap-2 transition-all"
                          >
                            Read
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Newsletter Signup */}
        <div className="mt-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="relative p-10 lg:p-14 text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Join 7,400+ Investors
            </div>
            
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">
              Stay Ahead with CRE Insights
            </h3>
            
            <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
              Get the latest syndication tips, market analysis, and investment strategies delivered to your inbox. No spam, just valuable content.
            </p>
            
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 rounded-xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30"
              />
              <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                Subscribe
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-blue-200 text-sm mt-4">
              Free forever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
