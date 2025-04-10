import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, Star, Menu, X, ChevronRight, MapPin, TrendingUp, SlidersHorizontal, Globe, LayoutGrid, List, Lock, User, Bell 
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { NotificationsDropdown } from './NotificationsDropdown';
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
      { label: "All Deals", path: "/browse" },
      { label: "Featured Opportunities", path: "/browse?featured=true" },
      { label: "New Listings", path: "/browse?sort=newest" }
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
    label: "Pricing",
    path: "/pricing"
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
    setShowAuthModal(true);
  };

  const handleGetStarted = () => {
    setAuthModalType('investor');
    setShowAuthModal(true);
  };

  const baseClasses = "relative flex justify-between items-center px-6 py-4";
  const bgClasses = isTransparent ? "" : "bg-white shadow-sm";

  return (
    <nav className={`${baseClasses} ${bgClasses}`}>
      <Link to="/" className="flex items-center">
        <img 
          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//logo-black.png`}
          alt="EquityMD"
          className={`h-10 ${isTransparent ? 'hidden' : 'block'}`}
        />
        <img 
          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//logo-white.png`}
          alt="EquityMD"
          className={`h-10 ${isTransparent ? 'block' : 'hidden'}`}
        />
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-6 items-center">
        <Link 
          to="/browse" 
          className={`hover:text-blue-600 ${
            isTransparent 
              ? 'text-white hover:text-blue-200' 
              : 'text-gray-700'
          }`}
        >
          Browse Deals
        </Link>
        <Link 
          to="/directory" 
          className={`hover:text-blue-600 ${
            isTransparent 
              ? 'text-white hover:text-blue-200' 
              : 'text-gray-700'
          }`}
        >
          Find Syndicators
        </Link>
        <Link 
          to="/pricing" 
          className={`hover:text-blue-600 ${
            isTransparent 
              ? 'text-white hover:text-blue-200' 
              : 'text-gray-700'
          }`}
        >
          Pricing
        </Link>
        
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
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </div>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  {profile?.user_type === 'syndicator' && (
                    <>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/deals/new"
                        className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Post New Deal
                      </Link>
                    </>
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
        className="md:hidden"
      >
        {isMenuOpen ? (
          <X className={`h-6 w-6 ${isTransparent ? 'text-white' : 'text-gray-900'}`} />
        ) : (
          <Menu className={`h-6 w-6 ${isTransparent ? 'text-white' : 'text-gray-900'}`} />
        )}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <Link to="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                <img 
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos//logo-black.png`}
                  alt="EquityMD"
                  className="h-10"
                />
              </Link>
              <button onClick={() => setIsMenuOpen(false)}>
                <X className="h-6 w-6 text-gray-900" />
              </button>
            </div>

            {user ? (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || 'User'}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <User className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900">{profile?.full_name || 'User'}</div>
                    <div className="text-sm text-gray-500">{profile?.email}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  {profile?.user_type === 'syndicator' && (
                    <>
                      <Link
                        to="/dashboard"
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/deals/new"
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Post New Deal
                      </Link>
                    </>
                  )}
                  {profile?.is_admin && (
                    <Link
                      to="/admin"
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-6">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setAuthModalType('investor');
                    setShowAuthModal(true);
                  }}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setAuthModalType('investor');
                    setShowAuthModal(true);
                  }}
                  className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg hover:bg-gray-200 transition text-center"
                >
                  Get Started
                </button>
              </div>
            )}

            <div className="space-y-4">
              {mobileMenuItems.map((item) => (
                <div key={item.label}>
                  {item.items ? (
                    <div>
                      <button
                        onClick={() => toggleMenuItem(item.label)}
                        className="flex items-center justify-between w-full py-2 text-gray-900"
                      >
                        <span className="font-medium">{item.label}</span>
                        <ChevronRight
                          className={`h-5 w-5 transform transition-transform ${
                            expandedMenuItems.includes(item.label) ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                      {expandedMenuItems.includes(item.label) && (
                        <div className="ml-4 mt-2 space-y-2">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.label}
                              to={subItem.path}
                              className="flex items-center py-2 text-gray-600 hover:text-gray-900"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <ChevronRight className="h-4 w-4 mr-2" />
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path!}
                      className="flex items-center justify-between py-2 text-gray-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="font-medium">{item.label}</span>
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {user && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} defaultType={authModalType} />
      )}
    </nav>
  );
}