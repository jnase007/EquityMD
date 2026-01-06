import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, Star, Menu, X, ChevronRight, MapPin, TrendingUp, SlidersHorizontal, Globe, LayoutGrid, List, Lock, User, Bell 
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { NotificationsDropdown } from './NotificationsDropdown';
import { AccountTypeBadge } from './AccountTypeBadge';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';

interface MobileMenuItem {
  label: string;
  items?: {
    label: string;
    path: string;
  }[];
  path?: string;
}

interface NavbarProps {
  isTransparent?: boolean;
}

const mobileMenuItems: MobileMenuItem[] = [
  {
    label: "Find Deals",
    items: [
      { label: "All Deals", path: "/find" },
      { label: "Featured Opportunities", path: "/find?featured=true" },
      { label: "New Listings", path: "/find?sort=newest" }
    ]
  },
  {
    label: "Learn",
    items: [
      { label: "How It Works", path: "/how-it-works" },
      { label: "Due Diligence Guide", path: "/resources/due-diligence" },
      { label: "Investment Calculator", path: "/resources/calculator" },
      { label: "Market Reports", path: "/resources/market-reports" },
      { label: "Educational Content", path: "/resources/education" },
    ]
  },
  {
    label: "Find Syndicators",
    path: "/directory"
  },
  {
    label: "Success Stories",
    path: "/success-stories"
  },

  {
    label: "Resources",
    items: [
      { label: "Market Reports", path: "/resources/market-reports" },
      { label: "Investment Calculator", path: "/resources/calculator" },
      { label: "Due Diligence Guide", path: "/resources/due-diligence" },
      { label: "Educational Content", path: "/resources/education" },
    ]
  },
  {
    label: "Legal",
    items: [
      { label: "Privacy Policy", path: "/legal/privacy" },
      { label: "Terms of Service", path: "/legal/terms" },
      { label: "Accreditation", path: "/legal/accreditation" },
      { label: "SEC Compliance", path: "/legal/compliance" },
    ]
  }
];

export function Navbar({ isTransparent = false }: NavbarProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [expandedMenuItems, setExpandedMenuItems] = useState<string[]>([]);
  const { user, profile, unreadCount, setNotifications, setUser, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [authModalType, setAuthModalType] = useState<'investor' | 'syndicator'>('investor');
  const [authModalView, setAuthModalView] = useState<'sign_in' | 'sign_up'>('sign_in');

  useEffect(() => {
    if (user) {
      // Subscribe to notifications
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

      // Initial fetch
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
      
      // Clear user state
      setUser(null);
      setProfile(null);
      
      // Close menus
      setIsMenuOpen(false);
      setIsDropdownOpen(false);
      
      // Navigate to home
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

  return (
    <nav className={isTransparent ? "" : "bg-white shadow-sm"}>
      <div className="max-w-[1200px] mx-auto flex justify-between items-center px-4 sm:px-6 py-4">
        <Link to="/" className="flex items-center hover:scale-105 transition-transform">
        <img 
          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/logo-black.png`}
          alt="EquityMD"
          className={`h-10 ${isTransparent ? 'hidden' : 'block'}`}
        />
        <img 
          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/logo-white.png`}
          alt="EquityMD"
          className={`h-10 ${isTransparent ? 'block' : 'hidden'}`}
        />
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        {/* Primary CTA */}
        <Link 
          to="/find" 
          className={`font-medium px-4 py-2 rounded-lg transition hover:scale-105 transform ${
            isTransparent 
              ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
          }`}
        >
          Find Deals
        </Link>
        
        {/* Secondary Navigation */}
        <div className="flex items-center space-x-6">
          <Link 
            to="/directory" 
            className={`font-medium transition hover:scale-105 ${
              isTransparent 
                ? 'text-white hover:text-blue-200' 
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            Find Syndicators
          </Link>
          <Link 
            to="/how-it-works" 
            className={`font-medium transition hover:scale-105 ${
              isTransparent 
                ? 'text-white hover:text-blue-200' 
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            How it Works
          </Link>
        </div>
        
        {user ? (
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                className="relative"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className={`h-6 w-6 ${
                  isTransparent 
                    ? 'text-white' 
                    : 'text-gray-600'
                }`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount}
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
                className="flex items-center space-x-3 focus:outline-none hover:scale-105 transition-transform"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {/* User Name */}
                {profile?.full_name && (
                  <span className={`text-sm font-medium hidden sm:inline ${isTransparent ? 'text-white' : 'text-gray-700'}`}>
                    {profile.full_name.split(' ')[0]}
                  </span>
                )}
                
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-white/20">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'User'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </div>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50 font-medium"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  {(profile?.user_type === 'investor' || profile?.is_admin) && (
                    <>
                      <Link
                        to="/find"
                        className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Find Deals
                      </Link>
                      <Link
                        to="/favorites"
                        className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        My Favorites
                      </Link>
                    </>
                  )}
                  {profile?.user_type === 'syndicator' && (
                    <Link
                      to="/deals/new"
                      className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Post New Deal
                    </Link>
                  )}
                  {profile?.is_admin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={handleSignIn}
              className={`${
                isTransparent 
                  ? 'text-white hover:text-blue-200' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden touch-manipulation min-h-touch min-w-touch flex items-center justify-center tap-highlight-none"
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMenuOpen ? (
          <X className={`h-6 w-6 ${isTransparent ? 'text-white' : 'text-gray-900'}`} />
        ) : (
          <Menu className={`h-6 w-6 ${isTransparent ? 'text-white' : 'text-gray-900'}`} />
        )}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 sticky top-0 z-10">
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
            </div>

            <div className="p-4">
              {user ? (
                /* Logged In User Card */
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
                        <User className="h-7 w-7 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 truncate">{profile?.full_name || 'User'}</div>
                      <div className="text-sm text-gray-500 truncate">{profile?.email}</div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/dashboard"
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-gray-700 rounded-xl font-medium text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </div>
                </div>
              ) : (
                /* Sign In/Up Buttons */
                <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Join 7,400+ investors discovering deals
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setAuthModalType('investor');
                        setAuthModalView('sign_up');
                        setShowAuthModal(true);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                    >
                      Get Started Free
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setAuthModalType('investor');
                        setAuthModalView('sign_in');
                        setShowAuthModal(true);
                      }}
                      className="w-full py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Actions */}
              <div className="mb-6">
                <Link
                  to="/find"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl mb-3 shadow-lg hover:shadow-xl transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold">Find Deals</div>
                    <div className="text-emerald-100 text-sm">Browse investment opportunities</div>
                  </div>
                  <ChevronRight className="h-5 w-5 ml-auto" />
                </Link>
                
                <Link
                  to="/directory"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold">Find Syndicators</div>
                    <div className="text-purple-100 text-sm">Verified investment partners</div>
                  </div>
                  <ChevronRight className="h-5 w-5 ml-auto" />
                </Link>
              </div>

              {/* Menu Sections */}
              <div className="space-y-2">
                {mobileMenuItems.map((item) => (
                  <div key={item.label}>
                    {item.items ? (
                      <div className="bg-gray-50 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleMenuItem(item.label)}
                          className="flex items-center justify-between w-full p-4 text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <span className="font-semibold">{item.label}</span>
                          <ChevronRight
                            className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${
                              expandedMenuItems.includes(item.label) ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                        {expandedMenuItems.includes(item.label) && (
                          <div className="px-4 pb-3 space-y-1 border-t border-gray-100">
                            {item.items.map((subItem) => (
                              <Link
                                key={subItem.label}
                                to={subItem.path}
                                className="flex items-center gap-2 py-2.5 px-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.path!}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl text-gray-900 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="font-semibold">{item.label}</span>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* User Actions */}
              {user && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {(profile?.user_type === 'investor' || profile?.is_admin) && (
                      <Link
                        to="/favorites"
                        className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Favorites</span>
                      </Link>
                    )}
                    {profile?.user_type === 'syndicator' && (
                      <Link
                        to="/deals/new"
                        className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-xl text-blue-700 hover:bg-blue-100 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">Post Deal</span>
                      </Link>
                    )}
                    {profile?.is_admin && (
                      <Link
                        to="/admin"
                        className="flex items-center justify-center gap-2 p-3 bg-purple-50 rounded-xl text-purple-700 hover:bg-purple-100 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Lock className="h-4 w-4" />
                        <span className="text-sm font-medium">Admin</span>
                      </Link>
                    )}
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}

              {/* Trust Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span>🔒 Secure</span>
                  <span>•</span>
                  <span>✓ SEC Compliant</span>
                  <span>•</span>
                  <span>🏢 7,400+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      </div>
      
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} defaultType={authModalType} defaultView={authModalView} />
      )}
    </nav>
  );
}