import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { ImageUpload } from '../components/ImageUpload';
import { EmailUpdateForm } from '../components/EmailUpdateForm';
import toast, { Toaster } from 'react-hot-toast';
import { 
  User, Camera, MapPin, Phone, Mail, Building2, 
  Target, DollarSign, Settings, Shield, ChevronRight,
  Check, AlertCircle, Sparkles, Trophy, Zap
} from 'lucide-react';

// Investment ranges
const INVESTMENT_RANGES = [
  { value: '25000-50000', label: '$25K - $50K', emoji: '💰' },
  { value: '50000-100000', label: '$50K - $100K', emoji: '💵' },
  { value: '100000-250000', label: '$100K - $250K', emoji: '🏦' },
  { value: '250000-500000', label: '$250K - $500K', emoji: '💎' },
  { value: '500000-1000000', label: '$500K - $1M', emoji: '🚀' },
  { value: '1000000+', label: '$1M+', emoji: '👑' },
];

// Property types
const PROPERTY_TYPES = [
  { value: 'multifamily', label: 'Multifamily', icon: '🏢' },
  { value: 'office', label: 'Office', icon: '🏛️' },
  { value: 'retail', label: 'Retail', icon: '🛍️' },
  { value: 'industrial', label: 'Industrial', icon: '🏭' },
  { value: 'mixed-use', label: 'Mixed-Use', icon: '🏙️' },
  { value: 'self-storage', label: 'Self-Storage', icon: '📦' },
  { value: 'hospitality', label: 'Hospitality', icon: '🏨' },
  { value: 'land', label: 'Land', icon: '🌍' },
];

// Preferred markets
const MARKETS = [
  { value: 'texas', label: 'Texas', icon: '🤠' },
  { value: 'florida', label: 'Florida', icon: '🌴' },
  { value: 'california', label: 'California', icon: '☀️' },
  { value: 'arizona', label: 'Arizona', icon: '🏜️' },
  { value: 'georgia', label: 'Georgia', icon: '🍑' },
  { value: 'tennessee', label: 'Tennessee', icon: '🎸' },
  { value: 'north-carolina', label: 'North Carolina', icon: '🌲' },
  { value: 'nationwide', label: 'Nationwide', icon: '🇺🇸' },
];

type Section = 'profile' | 'investment' | 'business' | 'settings';

export function ProfileNew() {
  const { user, profile, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [saving, setSaving] = useState(false);
  const [investorProfile, setInvestorProfile] = useState<any>(null);
  const [syndicator, setSyndicator] = useState<any>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    location: '',
    bio: '',
    investmentRange: '',
    propertyTypes: [] as string[],
    markets: [] as string[],
    accreditedStatus: false,
    companyName: '',
    companyDescription: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.full_name || '',
        phoneNumber: profile.phone_number || '',
        location: profile.location || '',
        bio: profile.bio || '',
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (investorProfile) {
      const rangeValue = investorProfile.investment_range_min && investorProfile.investment_range_max
        ? `${investorProfile.investment_range_min}-${investorProfile.investment_range_max}`
        : investorProfile.investment_range_min >= 1000000 ? '1000000+' : '';
      
      setFormData(prev => ({
        ...prev,
        investmentRange: rangeValue,
        propertyTypes: investorProfile.preferred_property_types || [],
        markets: investorProfile.preferred_locations || [],
        accreditedStatus: investorProfile.accredited_status || false,
      }));
    }
  }, [investorProfile]);

  useEffect(() => {
    if (syndicator) {
      setFormData(prev => ({
        ...prev,
        companyName: syndicator.company_name || '',
        companyDescription: syndicator.company_description || '',
      }));
    }
  }, [syndicator]);

  async function fetchProfileData() {
    try {
      // Fetch investor profile
      const { data: investorData } = await supabase
        .from('investor_profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      
      if (investorData) {
        setInvestorProfile(investorData);
      }

      // Fetch syndicator if applicable
      if (profile?.user_type === 'syndicator') {
        const { data: syndicatorData } = await supabase
          .from('syndicators')
          .select('*')
          .eq('claimed_by', user!.id)
          .single();
        
        if (syndicatorData) {
          setSyndicator(syndicatorData);
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Update main profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          location: formData.location,
          bio: formData.bio,
        })
        .eq('id', user!.id);

      if (profileError) throw profileError;

      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          location: formData.location,
          bio: formData.bio,
        });
      }

      toast.success('Profile saved! ✨');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInvestment = async () => {
    setSaving(true);
    try {
      // Parse investment range
      const [min, max] = formData.investmentRange.split('-').map(v => 
        v.replace('+', '').replace('$', '').replace('K', '000').replace(',', '')
      );

      const { error } = await supabase
        .from('investor_profiles')
        .upsert({
          id: user!.id,
          investment_range_min: parseInt(min) || 25000,
          investment_range_max: max ? parseInt(max) : 10000000,
          preferred_property_types: formData.propertyTypes,
          preferred_locations: formData.markets,
          accredited_status: formData.accreditedStatus,
        });

      if (error) throw error;

      toast.success('Investment preferences saved! 🎯');
      fetchProfileData();
    } catch (error) {
      console.error('Error saving investment profile:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBusiness = async () => {
    if (!syndicator) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('syndicators')
        .update({
          company_name: formData.companyName,
          company_description: formData.companyDescription,
        })
        .eq('id', syndicator.id);

      if (error) throw error;

      toast.success('Business profile saved! 🏢');
      fetchProfileData();
    } catch (error) {
      console.error('Error saving business profile:', error);
      toast.error('Failed to save business profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (url: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user!.id);

      if (error) throw error;

      if (profile) {
        setProfile({ ...profile, avatar_url: url });
      }
      setShowImageUpload(false);
      toast.success('Profile photo updated! 📸');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update photo');
    }
  };

  const handleLogoUpload = async (url: string) => {
    if (!syndicator) return;
    try {
      const { error } = await supabase
        .from('syndicators')
        .update({ company_logo_url: url })
        .eq('id', syndicator.id);

      if (error) throw error;

      setSyndicator({ ...syndicator, company_logo_url: url });
      setShowLogoUpload(false);
      toast.success('Company logo updated! 🎨');
    } catch (error) {
      console.error('Error updating logo:', error);
      toast.error('Failed to update logo');
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  // Calculate profile completion
  const getProfileCompletion = () => {
    let completed = 0;
    let total = 5;
    if (formData.fullName) completed++;
    if (profile?.avatar_url) completed++;
    if (formData.phoneNumber) completed++;
    if (formData.investmentRange) completed++;
    if (formData.propertyTypes.length > 0) completed++;
    return Math.round((completed / total) * 100);
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const completion = getProfileCompletion();
  const isSyndicator = profile?.user_type === 'syndicator';

  const sections = [
    { id: 'profile' as Section, label: 'Basic Info', icon: User, completed: !!formData.fullName && !!profile?.avatar_url },
    { id: 'investment' as Section, label: 'Investment Profile', icon: Target, completed: !!formData.investmentRange },
    ...(isSyndicator && syndicator ? [{ id: 'business' as Section, label: 'Business', icon: Building2, completed: !!formData.companyName }] : []),
    { id: 'settings' as Section, label: 'Settings', icon: Settings, completed: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-blue-600" />
            Your Profile
          </h1>
          <p className="text-gray-600 mt-2">Customize your experience on EquityMD</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              {/* Profile Preview */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={formData.fullName}
                      className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-blue-100">
                      {formData.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <button
                    onClick={() => setShowImageUpload(true)}
                    className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h3 className="font-semibold text-gray-900 mt-3">{formData.fullName || 'Your Name'}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              {/* Progress Ring */}
              <div className="text-center mb-6 pb-6 border-b border-gray-100">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32" cy="32" r="28"
                      stroke="#e5e7eb" strokeWidth="4" fill="none"
                    />
                    <circle
                      cx="32" cy="32" r="28"
                      stroke={completion === 100 ? '#10b981' : '#3b82f6'}
                      strokeWidth="4" fill="none"
                      strokeDasharray={`${completion * 1.76} 176`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute text-sm font-bold text-gray-900">{completion}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Profile Complete</p>
                {completion === 100 && (
                  <div className="flex items-center justify-center gap-1 text-emerald-600 text-xs mt-1">
                    <Trophy className="h-3 w-3" />
                    <span>All done!</span>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <section.icon className={`h-5 w-5 ${activeSection === section.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="flex-1 text-left">{section.label}</span>
                    {section.completed ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Basic Info Section */}
            {activeSection === 'profile' && (
              <div className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                    <p className="text-sm text-gray-500">Your personal details</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, State"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us a bit about yourself..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Investment Profile Section */}
            {activeSection === 'investment' && (
              <div className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <Target className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Investment Profile</h2>
                    <p className="text-sm text-gray-500">Help us find the right deals for you</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Investment Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Investment Range</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {INVESTMENT_RANGES.map((range) => (
                        <button
                          key={range.value}
                          onClick={() => setFormData({ ...formData, investmentRange: range.value })}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            formData.investmentRange === range.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-2xl mb-1 block">{range.emoji}</span>
                          <span className={`text-sm font-medium ${
                            formData.investmentRange === range.value ? 'text-blue-700' : 'text-gray-700'
                          }`}>{range.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Property Types */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Property Types <span className="text-gray-400">(select all that interest you)</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {PROPERTY_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setFormData({ 
                            ...formData, 
                            propertyTypes: toggleArrayItem(formData.propertyTypes, type.value) 
                          })}
                          className={`p-3 rounded-xl border-2 transition-all text-center ${
                            formData.propertyTypes.includes(type.value)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-xl block mb-1">{type.icon}</span>
                          <span className={`text-xs font-medium ${
                            formData.propertyTypes.includes(type.value) ? 'text-blue-700' : 'text-gray-600'
                          }`}>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Markets */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preferred Markets <span className="text-gray-400">(select all that interest you)</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {MARKETS.map((market) => (
                        <button
                          key={market.value}
                          onClick={() => setFormData({ 
                            ...formData, 
                            markets: toggleArrayItem(formData.markets, market.value) 
                          })}
                          className={`p-3 rounded-xl border-2 transition-all text-center ${
                            formData.markets.includes(market.value)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-xl block mb-1">{market.icon}</span>
                          <span className={`text-xs font-medium ${
                            formData.markets.includes(market.value) ? 'text-blue-700' : 'text-gray-600'
                          }`}>{market.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accreditation */}
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.accreditedStatus}
                        onChange={(e) => setFormData({ ...formData, accreditedStatus: e.target.checked })}
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-medium text-gray-900">I am an accredited investor</span>
                        <p className="text-sm text-gray-600 mt-1">
                          I meet SEC requirements for accredited investor status (income over $200K or net worth over $1M).
                        </p>
                      </div>
                    </label>
                  </div>

                  <button
                    onClick={handleSaveInvestment}
                    disabled={saving}
                    className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Save Preferences
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Business Section (Syndicators only) */}
            {activeSection === 'business' && isSyndicator && syndicator && (
              <div className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Business Profile</h2>
                    <p className="text-sm text-gray-500">Your company information</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Company Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Company Logo</label>
                    <div className="flex items-center gap-4">
                      {syndicator.company_logo_url ? (
                        <img
                          src={syndicator.company_logo_url}
                          alt={syndicator.company_name}
                          className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={() => setShowLogoUpload(true)}
                        className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                      >
                        {syndicator.company_logo_url ? 'Change Logo' : 'Upload Logo'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Your company name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                    <textarea
                      value={formData.companyDescription}
                      onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                      placeholder="Tell investors about your company..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSaveBusiness}
                    disabled={saving}
                    className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Save Business Info
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-100 rounded-xl">
                      <Settings className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
                      <p className="text-sm text-gray-500">Manage your account</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Email */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email Address</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowEmailForm(!showEmailForm)}
                        className="text-blue-600 text-sm font-medium hover:text-blue-700"
                      >
                        {showEmailForm ? 'Cancel' : 'Change'}
                      </button>
                    </div>

                    {showEmailForm && (
                      <div className="p-4 border border-gray-200 rounded-xl">
                        <EmailUpdateForm
                          currentEmail={user.email!}
                          onSuccess={() => setShowEmailForm(false)}
                        />
                      </div>
                    )}

                    {/* Account Type */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Account Type</p>
                          <p className="text-sm text-gray-500 capitalize">{profile?.user_type || 'Investor'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-100">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <h3 className="font-medium text-red-700">Danger Zone</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Once you deactivate your account, all your data will be removed. This action cannot be undone.
                  </p>
                  <button className="text-red-600 text-sm font-medium hover:text-red-700">
                    Deactivate Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Update Profile Photo</h3>
            <ImageUpload
              onImageUploaded={handleAvatarUpload}
              currentImage={profile?.avatar_url}
              bucket="avatars"
              path={`${user.id}/avatar`}
            />
            <button
              onClick={() => setShowImageUpload(false)}
              className="mt-4 w-full py-2 text-gray-600 hover:text-gray-800 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Logo Upload Modal */}
      {showLogoUpload && syndicator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Update Company Logo</h3>
            <ImageUpload
              onImageUploaded={handleLogoUpload}
              currentImage={syndicator.company_logo_url}
              bucket="logos"
              path={`${syndicator.id}/logo`}
            />
            <button
              onClick={() => setShowLogoUpload(false)}
              className="mt-4 w-full py-2 text-gray-600 hover:text-gray-800 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ProfileNew;

