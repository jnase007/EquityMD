import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, Menu, X, ChevronRight, 
  User, Bell, Search, Command, LayoutDashboard, 
  Settings, LogOut, Plus, Heart, ChevronDown
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { NotificationsDropdown } from './NotificationsDropdown';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  isTransparent?: boolean;
}

// Simple Command Palette
function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const pages = [
    { label: 'Find Deals', path: '/find' },
    { label: 'Find Syndicators', path: '/directory' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Success Stories', path: '/success-stories' },
    { label: 'Blog', path: '/blog' },
    { label: 'Profile', path: '/profile' },
  ];

  const filtered = pages.filter(p => 
    p.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
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
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 outline-none"
          />
          <kbd className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">ESC</kbd>
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {filtered.map((item, i) => (
            <button
              key={i}
              onClick={() => { navigate(item.path); onClose(); setQuery(''); }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              {item.label}
            </button>
          ))}
        </div>
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
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, profile, unreadCount, setNotifications, setUser, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [authModalView, setAuthModalView] = useState<'sign_in' | 'sign_up'>('sign_in');

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut for search
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
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, fetchNotifications)
        .subscribe();

      fetchNotifications();
      return () => { subscription.unsubscribe(); };
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchNotifications() {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications(data || []);
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    navigate('/');
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'User';
  const useTransparentStyle = isTransparent && !isScrolled;

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 overflow-visible ${
        useTransparentStyle 
          ? 'bg-transparent' 
          : isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm' 
            : 'bg-white shadow-sm'
      }`}>
        <div className={`max-w-6xl mx-auto flex justify-between items-center px-4 transition-all overflow-visible ${
          isScrolled ? 'py-3' : 'py-4'
        }`}>
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img 
              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/logo-black.png`}
              alt="EquityMD"
              className={`transition-all ${isScrolled ? 'h-7' : 'h-8'} ${useTransparentStyle ? 'hidden' : 'block'}`}
            />
            <img 
              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/logo-white.png`}
              alt="EquityMD"
              className={`transition-all ${isScrolled ? 'h-7' : 'h-8'} ${useTransparentStyle ? 'block' : 'hidden'}`}
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/find" 
              className={`font-medium transition ${
                useTransparentStyle ? 'text-white hover:text-white/80' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Find Deals
            </Link>
            <Link 
              to="/directory"
              className={`font-medium transition ${
                useTransparentStyle ? 'text-white hover:text-white/80' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Syndicators
            </Link>
            <Link 
              to="/how-it-works"
              className={`font-medium transition ${
                useTransparentStyle ? 'text-white hover:text-white/80' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              How It Works
            </Link>
            <Link 
              to="/blog"
              className={`font-medium transition ${
                useTransparentStyle ? 'text-white hover:text-white/80' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Blog
            </Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setShowCommandPalette(true)}
              className={`p-2 rounded-lg transition ${
                useTransparentStyle 
                  ? 'text-white/80 hover:bg-white/10' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Search (⌘K)"
            >
              <Search className="h-5 w-5" />
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className={`relative p-2 rounded-lg transition ${
                      useTransparentStyle 
                        ? 'text-white/80 hover:bg-white/10' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>
                  <NotificationsDropdown
                    isOpen={isNotificationsOpen}
                    onClose={() => setIsNotificationsOpen(false)}
                  />
                </div>

                {/* User Menu */}
                <div className="relative z-[9999]" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full transition ${
                      useTransparentStyle 
                        ? 'hover:bg-white/10' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        firstName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 transition ${useTransparentStyle ? 'text-white' : 'text-gray-400'}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border py-1 z-[9999]" style={{ position: 'fixed', top: '60px', right: '16px' }}>
                      <div className="px-4 py-3 border-b">
                        <p className="font-medium text-gray-900">{profile?.full_name || 'User'}</p>
                        <p className="text-sm text-gray-500 truncate">{profile?.email}</p>
                      </div>
                      
                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          <LayoutDashboard className="h-4 w-4 text-gray-400" />
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="h-4 w-4 text-gray-400" />
                          Settings
                        </Link>
                        {profile?.user_type === 'investor' && (
                          <Link
                            to="/favorites"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          >
                            <Heart className="h-4 w-4 text-gray-400" />
                            Favorites
                          </Link>
                        )}
                        {profile?.user_type === 'syndicator' && (
                          <Link
                            to="/deals/new"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4 text-gray-400" />
                            Post Deal
                          </Link>
                        )}
                        {profile?.is_admin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          >
                            <Building2 className="h-4 w-4 text-gray-400" />
                            Admin
                          </Link>
                        )}
                      </div>
                      
                      <div className="border-t py-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setAuthModalView('sign_in'); setShowAuthModal(true); }}
                  className={`font-medium transition ${
                    useTransparentStyle ? 'text-white hover:text-white/80' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthModalView('sign_up'); setShowAuthModal(true); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition ${
              useTransparentStyle ? 'text-white' : 'text-gray-700'
            }`}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl">
              <div className="flex justify-between items-center p-4 border-b">
                <span className="font-semibold text-gray-900">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-4 space-y-1">
                {user && (
                  <div className="pb-4 mb-4 border-b">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                        {firstName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{firstName}</p>
                        <p className="text-sm text-gray-500">{profile?.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-center py-2 bg-blue-600 text-white rounded-lg font-medium"
                    >
                      Dashboard
                    </Link>
                  </div>
                )}

                <Link to="/find" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <span className="font-medium">Find Deals</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
                <Link to="/directory" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <span className="font-medium">Syndicators</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
                <Link to="/how-it-works" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <span className="font-medium">How It Works</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
                <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <span className="font-medium">Blog</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
                
                {user ? (
                  <div className="pt-4 mt-4 border-t space-y-1">
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                      <span>Settings</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left p-3 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 mt-4 border-t space-y-2">
                    <button
                      onClick={() => { setIsMenuOpen(false); setAuthModalView('sign_up'); setShowAuthModal(true); }}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
                    >
                      Get Started
                    </button>
                    <button
                      onClick={() => { setIsMenuOpen(false); setAuthModalView('sign_in'); setShowAuthModal(true); }}
                      className="w-full py-3 border border-gray-200 rounded-lg font-medium"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      
      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />
      
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} defaultView={authModalView} />
      )}
    </>
  );
}
