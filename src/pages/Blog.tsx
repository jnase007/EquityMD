import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Calendar, User, ArrowRight, Loader2 } from 'lucide-react';
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
}

export function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("All Posts");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>(["All Posts"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, title, excerpt, author, published_at, category, image_url, slug')
          .eq('is_published', true)
          .order('published_at', { ascending: false });
        
        if (error) {
          console.warn('Could not fetch blog posts from database:', error.message);
          return;
        }
        
        if (data && data.length > 0) {
          // Transform database format to component format
          const dbPosts: BlogPost[] = data.map(post => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            author: post.author,
            date: post.published_at || new Date().toISOString(),
            category: post.category,
            image: post.image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800&h=400',
            slug: post.slug
          }));
          
          setBlogPosts(dbPosts);
          
          // Extract unique categories
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

  const filteredPosts = selectedCategory === "All Posts" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="CRE Syndication Tips & Insights | Equitymd.com Blog"
        description="Master CRE syndication with expert tips! Learn to list deals or invest with 7,400+ elite investors on Equitymd.com's blog. Start your journey free—read now!"
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

      <div className="max-w-[1200px] mx-auto px-4 py-16">
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

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No blog posts found.</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            <div className="mb-16">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="md:flex">
                  <Link to={`/blog/${filteredPosts[0].slug}`} className="md:w-1/2 block overflow-hidden">
                    <img
                      src={filteredPosts[0].image}
                      alt={filteredPosts[0].title}
                      className="w-full h-64 md:h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <div className="md:w-1/2 p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Featured
                      </span>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                        {filteredPosts[0].category}
                      </span>
                    </div>
                    <Link to={`/blog/${filteredPosts[0].slug}`}>
                      <h2 className="text-2xl font-bold mb-4 text-gray-900 hover:text-blue-600 transition-colors">
                        {filteredPosts[0].title}
                      </h2>
                    </Link>
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

            {/* Blog Posts Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.slice(1).map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition group">
                  <Link to={`/blog/${post.slug}`} className="block overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                        {post.category}
                      </span>
                    </div>
                    <Link to={`/blog/${post.slug}`}>
                      <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                    </Link>
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
          </>
        )}

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
