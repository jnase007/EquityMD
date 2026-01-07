import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, Star, Menu, X, ChevronRight, ChevronDown, TrendingUp, 
  User, Bell, Search, Command, LayoutDashboard, FileText, 
  Sparkles, ArrowRight, BookOpen, Calculator, BarChart3, Shield,
  Users, DollarSign, Settings, LogOut, Plus, Heart, Briefcase,
  Zap, Award, HelpCircle
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { NotificationsDropdown } from './NotificationsDropdown';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  isTransparent?: boolean;
}

// Command Palette Component
function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const suggestions = [
    { icon: TrendingUp, label: 'Find Deals', path: '/find', category: 'Pages' },
    { icon: Building2, label: 'Find Syndicators', path: '/directory', category: 'Pages' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', category: 'Pages' },
    { icon: BookOpen, label: 'How It Works', path: '/how-it-works', category: 'Pages' },
    { icon: Calculator, label: 'Investment Calculator', path: '/resources/calculator', category: 'Tools' },
    { icon: BarChart3, label: 'Market Reports', path: '/resources/market-reports', category: 'Resources' },
    { icon: FileText, label: 'Due Diligence Guide', path: '/resources/due-diligence', category: 'Resources' },
    { icon: Users, label: 'Success Stories', path: '/success-stories', category: 'Pages' },
  ];

  const filteredSuggestions = suggestions.filter(s => 
    s.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search deals, syndicators, or navigate..."
            className="flex-1 text-lg outline-none placeholder:text-gray-400"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md font-mono">
            ESC
          </kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {filteredSuggestions.length > 0 ? (
            <div className="space-y-1">
              {filteredSuggestions.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                    setQuery('');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="w-10 h-10 bg-gray-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
                    <item.icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.category}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found</p>
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono">↵</kbd>
              to select
            </span>
          </div>
          <span className="text-blue-600 font-medium">EquityMD</span>
        </div>
      </div>
      <style>{`
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

// Mega Menu Component
function MegaMenu({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!isOpen) return null;
  
  return (
    <div 
      className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-100 z-40"
      onMouseLeave={onClose}
    >
      <div className="max-w-[1200px] mx-auto p-6">
        {children}
      </div>
    </div>
  );
}

export function Navbar({ isTransparent = false }: NavbarProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedMenuItems, setExpandedMenuItems] = useState<string[]>([]);
  const { user, profile, unreadCount, setNotifications, setUser, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [authModalType, setAuthModalType] = useState<'investor' | 'syndicator'>('investor');
  const [authModalView, setAuthModalView] = useState<'sign_in' | 'sign_up'>('sign_in');

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (user) {
      const notificationsSubscription = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchNotifications();
        })
        .subscribe();

      fetchNotifications();

      return () => {
        notificationsSubscription.unsubscribe();
      };
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchNotifications() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setIsMenuOpen(false);
      setIsDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenuItem = (label: string) => {
    setExpandedMenuItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const handleSignIn = () => {
    setAuthModalType('investor');
    setAuthModalView('sign_in');
    setShowAuthModal(true);
  };

  const handleGetStarted = () => {
    setAuthModalType('investor');
    setAuthModalView('sign_up');
    setShowAuthModal(true);
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  // Determine if current background should be used
  const useTransparentStyle = isTransparent && !isScrolled;

  return (
    <>
      <nav 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          useTransparentStyle 
            ? 'bg-transparent' 
            : isScrolled 
              ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-gray-100/50' 
              : 'bg-white shadow-sm'
        }`}
      >
        <div className={`max-w-[1200px] mx-auto flex justify-between items-center px-4 sm:px-6 transition-all duration-300 ${
          isScrolled ? 'py-2' : 'py-4'
        }`}>
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center group"
          >
            <div className="relative">
              <img 
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/logo-black.png`}
                alt="EquityMD"
                className={`transition-all duration-300 ${isScrolled ? 'h-8' : 'h-10'} ${useTransparentStyle ? 'hidden' : 'block'} group-hover:scale-105`}
              />
              <img 
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/logo-white.png`}
                alt="EquityMD"
                className={`transition-all duration-300 ${isScrolled ? 'h-8' : 'h-10'} ${useTransparentStyle ? 'block' : 'hidden'} group-hover:scale-105`}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Find Deals - Primary CTA */}
            <Link 
              to="/find" 
              className={`group relative flex items-center gap-2 font-semibold px-4 py-2 rounded-xl transition-all ${
                useTransparentStyle 
                  ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg shadow-blue-500/25'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Find Deals</span>
              <span className={`absolute -top-1 -right-1 flex h-2 w-2 ${useTransparentStyle ? '' : ''}`}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </Link>
            
            {/* Find Syndicators */}
            <Link 
              to="/directory"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                useTransparentStyle 
                  ? 'text-white/90 hover:text-white hover:bg-white/10' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Syndicators</span>
            </Link>

            {/* How It Works */}
            <Link 
              to="/how-it-works"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                useTransparentStyle 
                  ? 'text-white/90 hover:text-white hover:bg-white/10' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>How It Works</span>
            </Link>

            {/* Resources Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveMenu('resources')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  useTransparentStyle 
                    ? 'text-white/90 hover:text-white hover:bg-white/10' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>Resources</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${activeMenu === 'resources' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeMenu === 'resources' && (
                <div className="absolute top-full left-0 pt-2 w-72">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-2">
                    {[
                      { icon: Calculator, label: 'Investment Calculator', desc: 'Project your returns', path: '/resources/calculator' },
                      { icon: BarChart3, label: 'Market Reports', desc: 'Latest industry data', path: '/resources/market-reports' },
                      { icon: FileText, label: 'Due Diligence Guide', desc: 'Evaluate deals like a pro', path: '/resources/due-diligence' },
                      { icon: BookOpen, label: 'Educational Content', desc: 'Learn syndication basics', path: '/resources/education' },
                    ].map((item, i) => (
                      <Link
                        key={i}
                        to={item.path}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                        onClick={() => setActiveMenu(null)}
                      >
                        <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center transition-colors">
                          <item.icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setShowCommandPalette(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                useTransparentStyle 
                  ? 'border-white/30 text-white/80 hover:bg-white/10 hover:text-white' 
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Search className="h-4 w-4" />
              <span className="text-sm hidden xl:inline">Search...</span>
              <kbd className={`hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-mono ${
                useTransparentStyle ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                <Command className="h-3 w-3" />K
              </kbd>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {/* Quick Actions for Logged In Users */}
                {profile?.user_type === 'syndicator' && (
                  <Link
                    to="/deals/new"
                    className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden xl:inline">List Deal</span>
                  </Link>
                )}

                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    className={`relative p-2 rounded-xl transition-colors ${
                      useTransparentStyle 
                        ? 'text-white hover:bg-white/10' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <NotificationsDropdown
                    isOpen={isNotificationsOpen}
                    onClose={() => setIsNotificationsOpen(false)}
                  />
                </div>

                {/* User Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    className={`flex items-center gap-3 p-1.5 pr-4 rounded-full transition-all ${
                      useTransparentStyle 
                        ? 'hover:bg-white/10' 
                        : 'hover:bg-gray-100'
                    } ${isDropdownOpen ? (useTransparentStyle ? 'bg-white/10' : 'bg-gray-100') : ''}`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-white shadow-md">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || 'User'}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {firstName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className={`font-medium hidden xl:inline ${useTransparentStyle ? 'text-white' : 'text-gray-700'}`}>
                      {firstName}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${useTransparentStyle ? 'text-white' : 'text-gray-400'} ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            {profile?.avatar_url ? (
                              <img
                                src={profile.avatar_url}
                                alt={profile.full_name || 'User'}
                                className="w-12 h-12 rounded-xl object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-lg">
                                {firstName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 truncate">{profile?.full_name || 'User'}</div>
                            <div className="text-xs text-gray-500 truncate">{profile?.email}</div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                profile?.dashboard_preference === 'syndicator' || profile?.user_type === 'syndicator'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {profile?.dashboard_preference === 'syndicator' || profile?.user_type === 'syndicator' ? (
                                  <><Building2 className="h-3 w-3" /> Syndicator</>
                                ) : (
                                  <><TrendingUp className="h-3 w-3" /> Investor</>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="p-2">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors group"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="w-9 h-9 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                            <LayoutDashboard className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">Dashboard</div>
                            <div className="text-xs text-gray-500">View your portfolio</div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600" />
                        </Link>

                        <Link
                          to="/find"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors group"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="w-9 h-9 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">Find Deals</div>
                            <div className="text-xs text-gray-500">Browse opportunities</div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-green-600" />
                        </Link>

                        {(profile?.user_type === 'investor' || profile?.is_admin) && (
                          <Link
                            to="/favorites"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-pink-50 transition-colors group"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <div className="w-9 h-9 bg-pink-100 group-hover:bg-pink-200 rounded-lg flex items-center justify-center transition-colors">
                              <Heart className="h-4 w-4 text-pink-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">Favorites</div>
                              <div className="text-xs text-gray-500">Saved deals</div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-pink-600" />
                          </Link>
                        )}

                        {profile?.user_type === 'syndicator' && (
                          <Link
                            to="/deals/new"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 transition-colors group"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <div className="w-9 h-9 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors">
                              <Plus className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">Post New Deal</div>
                              <div className="text-xs text-gray-500">List an opportunity</div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-purple-600" />
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-gray-100 my-1" />

                      {/* Settings & Account */}
                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Settings className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">Profile Settings</span>
                        </Link>

                        {profile?.is_admin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <Shield className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">Admin Dashboard</span>
                          </Link>
                        )}

                        <Link
                          to="/how-it-works"
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">Help Center</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 my-1" />

                      {/* Sign Out */}
                      <div className="p-2">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSignIn}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    useTransparentStyle 
                      ? 'text-white hover:bg-white/10' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={handleGetStarted}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                    useTransparentStyle 
                      ? 'bg-white text-blue-600 hover:bg-gray-100 shadow-lg' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25'
                  }`}
                >
                  <Zap className="h-4 w-4" />
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2 rounded-xl transition-colors ${
              useTransparentStyle 
                ? 'text-white hover:bg-white/10' 
                : 'text-gray-900 hover:bg-gray-100'
            }`}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />
            
            <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
              {/* Mobile Header */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <Link to="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                    <img 
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/logo-white.png`}
                      alt="EquityMD"
                      className="h-8"
                    />
                  </Link>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
                
                {/* Mobile Search */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowCommandPalette(true);
                  }}
                  className="w-full mt-4 flex items-center gap-3 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-left"
                >
                  <Search className="h-5 w-5 text-white/80" />
                  <span className="text-white/80">Search deals, syndicators...</span>
                </button>
              </div>

              <div className="p-4">
                {user ? (
                  <div className="mb-6 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.full_name || 'User'}
                            className="w-14 h-14 rounded-2xl object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-xl">
                            {firstName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate">{profile?.full_name || 'User'}</div>
                        <div className="text-sm text-gray-500 truncate">{profile?.email}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/dashboard"
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-gray-700 rounded-xl font-medium text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-gray-900 mb-1">Join EquityMD</h3>
                      <p className="text-sm text-gray-600">7,400+ investors already discovering deals</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleGetStarted();
                        }}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <Zap className="h-4 w-4" />
                        Get Started Free
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleSignIn();
                        }}
                        className="w-full py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Actions */}
                <div className="space-y-3 mb-6">
                  <Link
                    to="/find"
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">Find Deals</div>
                      <div className="text-emerald-100 text-sm">Browse investment opportunities</div>
                    </div>
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link
                    to="/directory"
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">Find Syndicators</div>
                      <div className="text-purple-100 text-sm">Verified investment partners</div>
                    </div>
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Quick Links */}
                <div className="space-y-2">
                  {[
                    { icon: BookOpen, label: 'How It Works', path: '/how-it-works' },
                    { icon: Calculator, label: 'Investment Calculator', path: '/resources/calculator' },
                    { icon: BarChart3, label: 'Market Reports', path: '/resources/market-reports' },
                    { icon: Users, label: 'Success Stories', path: '/success-stories' },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      to={item.path}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5 text-gray-500" />
                      <span className="font-medium text-gray-900">{item.label}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                    </Link>
                  ))}
                </div>

                {/* User Actions */}
                {user && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </button>
                  </div>
                )}

                {/* Trust Footer */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure</span>
                    <span>•</span>
                    <span>✓ SEC Compliant</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 7,400+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
      
      {/* Command Palette */}
      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
      />
      
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} defaultType={authModalType} defaultView={authModalView} />
      )}
    </>
  );
}
