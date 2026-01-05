import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import {
  FileText,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Plus,
  CheckCircle,
  Clock,
  Sparkles,
  TrendingUp,
  BarChart,
  Tag,
  Calendar,
  RefreshCw,
  Copy,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  view_count: number;
  reading_time: number;
  meta_keywords: string[];
  ai_generated: boolean;
}

interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  aiGenerated: number;
  categoryCounts: Record<string, number>;
}

export function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchBlogData();
  }, []);

  async function fetchBlogData() {
    setLoading(true);
    try {
      // Fetch all blog posts
      const { data: postsData, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(postsData || []);

      // Calculate stats
      const totalPosts = postsData?.length || 0;
      const publishedPosts = postsData?.filter(p => p.is_published).length || 0;
      const draftPosts = totalPosts - publishedPosts;
      const totalViews = postsData?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
      const aiGenerated = postsData?.filter(p => p.ai_generated).length || 0;

      // Category counts
      const categoryCounts: Record<string, number> = {};
      postsData?.forEach(post => {
        categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
      });

      setStats({
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews,
        aiGenerated,
        categoryCounts
      });

    } catch (error) {
      console.error('Error fetching blog data:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(postId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          is_published: !currentStatus,
          published_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, is_published: !currentStatus, published_at: !currentStatus ? new Date().toISOString() : null }
          : p
      ));

      toast.success(currentStatus ? 'Post unpublished' : 'Post published');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  }

  async function deletePost(postId: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(p => p.id !== postId));
      toast.success('Post deleted');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  }

  function copySlug(slug: string) {
    navigator.clipboard.writeText(`https://equitymd.com/blog/${slug}`);
    toast.success('URL copied to clipboard');
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filter === 'all' ||
      (filter === 'published' && post.is_published) ||
      (filter === 'draft' && !post.is_published);
    
    const matchesCategory = 
      categoryFilter === 'all' || post.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(posts.map(p => p.category))];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <FileText className="h-6 w-6 text-purple-300" />
              Blog Management
            </h2>
            <p className="text-purple-200 text-sm mt-1">
              Create, edit, and manage your blog content
            </p>
          </div>
          <button
            onClick={() => {
              toast('Run: npm run generate-blog:publish', { icon: '💡' });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition font-medium"
          >
            <Sparkles className="h-4 w-4" />
            Create AI Post
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats?.totalPosts || 0}</p>
              <p className="text-sm text-blue-100">Total Posts</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats?.publishedPosts || 0}</p>
              <p className="text-sm text-emerald-100">Published</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-violet-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats?.totalViews.toLocaleString() || 0}</p>
              <p className="text-sm text-violet-100">Total Views</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats?.aiGenerated || 0}</p>
              <p className="text-sm text-amber-100">AI Generated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      {stats && Object.keys(stats.categoryCounts).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Posts by Category</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.categoryCounts).map(([category, count]) => (
              <span
                key={category}
                className="px-3 py-1.5 bg-gray-100 rounded-full text-sm flex items-center gap-2"
              >
                <Tag className="h-3 w-3 text-gray-500" />
                {category}
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchBlogData}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => {
              toast('Run: npm run generate-blog:publish', { icon: '💡' });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition"
          >
            <Sparkles className="h-4 w-4" />
            Create AI Post
          </button>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Post</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Category</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Views</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPosts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="max-w-md">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{post.title}</p>
                      {post.ai_generated && (
                        <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0" title="AI Generated" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{post.excerpt}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                    {post.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {post.is_published ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                      <Globe className="h-3 w-3" /> Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                      <Clock className="h-3 w-3" /> Draft
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">{post.view_count || 0}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {format(new Date(post.created_at), 'MMM d, yyyy')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                      title="View"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => copySlug(post.slug)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Copy URL"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => togglePublish(post.id, post.is_published)}
                      className={`p-2 rounded transition ${
                        post.is_published 
                          ? 'text-amber-600 hover:bg-amber-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={post.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {post.is_published ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => deletePost(post.id, post.title)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No blog posts found</p>
            <p className="text-sm text-gray-400 mt-1">
              Run <code className="bg-gray-100 px-2 py-1 rounded">npm run generate-blog:publish</code> to generate posts
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

