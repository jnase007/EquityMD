import React, { useState, useEffect } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MessageModal } from '../components/MessageModal';
import { AccountTypeBadge } from '../components/AccountTypeBadge';
import { useAuthStore } from '../lib/store';
import { InvestorProfileForm } from '../components/InvestorProfileForm'; // This will now resolve to index.tsx
import { SyndicatorProfileForm } from '../components/SyndicatorProfileForm';
import { EmailUpdateForm } from '../components/EmailUpdateForm';
import { supabase } from '../lib/supabase';
import { calculateProfileCompletion } from '../lib/profileCompletion';
import { 
  MessageCircle, 
  Star, 
  Building2, 
  User, 
  Eye, 
  CheckCircle, 
  Phone, 
  MapPin, 
  Target,
  Award,
  Users,
  TrendingUp,
  ArrowRight,
  Settings,
  Bell,
  Shield,
  Download,
  Upload,
  Camera,
  X,
  ChevronDown,
  ChevronUp,
  Play,
  Sparkles
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import Modal from 'react-modal';
import { useDropzone } from 'react-dropzone';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Select from 'react-select';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast, { Toaster } from 'react-hot-toast';

// Set the app element for react-modal accessibility
Modal.setAppElement('#root');

interface Syndicator {
  id: string;
  company_name: string;
  company_description: string;
  location: string;
  company_logo_url?: string | null;
  verification_status?: 'unverified' | 'verified' | 'featured' | 'premium';
  slug?: string;
  profile?: {
    full_name: string;
    avatar_url: string;
  } | null;
}

// US States for dropdowns
const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

// Circular Progress Bar Component
const CircularProgressBar = ({ percentage, size = 120, strokeWidth = 8 }: { 
  percentage: number; 
  size?: number; 
  strokeWidth?: number; 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const isComplete = percentage === 100;

  // Scale text size based on circle size
  const textSize = size < 100 ? 'text-sm' : 'text-lg';
  const iconSize = size < 100 ? 'h-4 w-4' : 'h-6 w-6';
  const iconOffset = size < 100 ? '16px' : '24px';

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${isComplete ? 'animate-pulse' : ''}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className={`transform -rotate-90 ${isComplete ? 'filter drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]' : ''}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isComplete ? "#22c55e" : "#3b82f6"}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            animation: 'drawCircle 2s ease-out forwards'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${textSize} font-bold text-gray-900`}>
          {percentage}%
        </span>
      </div>
      {isComplete && (
        <div className="absolute inset-0 flex items-center justify-center">
          <CheckCircle className={`${iconSize} text-green-600 animate-bounce`} style={{ marginTop: iconOffset }} />
        </div>
      )}
    </div>
  );
};

// Onboarding Wizard Component
const OnboardingWizard = ({ isOpen, onClose, userType, missingFields }: {
  isOpen: boolean;
  onClose: () => void;
  userType: 'investor' | 'syndicator';
  missingFields: string[];
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = missingFields.slice(0, 3); // Show first 3 missing fields

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-md mx-auto bg-white rounded-xl shadow-2xl p-6 m-4"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Complete Your Profile
          </h2>
          <p className="text-gray-600">
            Let's get you set up! Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-center mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full mx-1 ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {steps[currentStep] && (
            <div className="text-left p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                Step {currentStep + 1}: Add your {steps[currentStep]}
              </h3>
              <p className="text-blue-700 text-sm">
                {userType === 'investor' 
                  ? `Adding your ${steps[currentStep]} helps syndicators understand your investment preferences.`
                  : `Adding your ${steps[currentStep]} helps investors learn more about your company.`
                }
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            Back
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Get Started!
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// Profile Preview Modal
const ProfilePreviewModal = ({ isOpen, onClose, profile, userType }: {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  userType: 'investor' | 'syndicator';
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl m-4 max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Profile Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {profile?.full_name || 'Your Name'}
              </h3>
              <AccountTypeBadge
                userType={userType}
                isVerified={profile?.is_verified}
                size="sm"
              />
            </div>
          </div>
        </div>

        <div className="text-center text-gray-600">
          <p className="text-sm">This is how other users will see your profile</p>
        </div>
      </div>
    </Modal>
  );
};

// Enhanced Profile Completion Card
const EnhancedProfileCompletionCard = ({ 
  completion, 
  userType, 
  onFieldFocus 
}: { 
  completion: any; 
  userType: 'investor' | 'syndicator';
  onFieldFocus: (field: string) => void;
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (!completion) return null;

  const percentage = completion.percentage;
  const isComplete = percentage === 100;
  const isSyndicator = userType === 'syndicator';

  // Minimized state when scrolled
  if (isScrolled) {
    return (
      <div className="sticky top-0 z-10 bg-white shadow-md border-b border-gray-200 transition-all duration-300">
        <div className={`flex items-center justify-between ${isMobile ? 'px-3 py-2' : 'px-6 py-3'}`}>
          <div className="flex items-center space-x-3">
            <div className={`relative ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}>
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={isComplete ? '#22c55e' : '#3b82f6'}
                  strokeWidth="3"
                  strokeDasharray={`${percentage}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`font-semibold ${isMobile ? 'text-xs' : 'text-xs'}`}>{percentage}%</span>
              </div>
            </div>
            <div>
              <span className={`font-medium text-gray-900 ${isMobile ? 'text-sm' : 'text-base'}`}>
                {completion.completedFields}/{completion.totalFields} completed
              </span>
              {!isMobile && (
                <p className="text-xs text-gray-500">Profile completion</p>
              )}
            </div>
          </div>
          
          {!isComplete && !isMobile && (
            <div className="flex gap-1">
              {completion.missingFields.slice(0, 2).map((field: string) => (
                <button
                  key={field}
                  onClick={() => onFieldFocus(field)}
                  className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-medium hover:bg-blue-200 transition"
                >
                  {field}
                </button>
              ))}
            </div>
          )}

          {isComplete && (
            <div className="flex items-center">
              <CheckCircle className={`text-green-600 mr-1 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              <span className={`font-medium text-green-800 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {isMobile ? 'Complete!' : 'Complete! 🎉'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full state when at top of page
  return (
    <div className="sticky top-0 z-10 bg-white p-6 shadow-md rounded-lg mb-6 animate-fade-in transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Profile Completion</h2>
          <p className="text-sm text-gray-600">
            Complete your {isSyndicator ? 'syndicator' : 'investor'} profile to attract {isSyndicator ? 'investors' : 'syndicators'}!
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {completion.completedFields} of {completion.totalFields} fields completed
          </p>
        </div>
        <div className="relative w-24 h-24" data-tip="Complete your profile to get a Verified badge!">
          <svg className="w-full h-full animate-pulse" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={isComplete ? '#22c55e' : '#3b82f6'}
              strokeWidth="2"
              strokeDasharray={`${percentage}, 100`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{percentage}%</span>
          </div>
        </div>
      </div>
      
      {/* Next Steps Buttons */}
      {!isComplete && (
        <div className="mt-4 flex flex-wrap gap-2">
          {completion.missingFields.slice(0, 3).map((field: string) => (
            <button
              key={field}
              onClick={() => onFieldFocus(field)}
              className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition hover:scale-105 transform"
            >
              Add {field}
            </button>
          ))}
          {completion.missingFields.length > 3 && (
            <span className="text-sm text-gray-500 px-3 py-2">
              +{completion.missingFields.length - 3} more fields
            </span>
          )}
        </div>
      )}

      {isComplete && (
        <div className="mt-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-base font-medium text-green-800">Profile Complete! You're ready to get verified! 🎉</span>
        </div>
      )}

      <Tooltip 
        id="progress-tooltip" 
        place="bottom"
        className="bg-gray-900 text-white text-xs rounded-lg px-2 py-1"
      />
    </div>
  );
};

// Add CSS for circular progress animation
const progressStyles = `
  @keyframes drawCircle {
    from {
      stroke-dashoffset: ${2 * Math.PI * 56};
    }
    to {
      stroke-dashoffset: var(--progress-offset);
    }
  }
`;

export function Profile() {
  const { user, profile } = useAuthStore();
  const location = useLocation();
  const [syndicators, setSyndicators] = useState<Syndicator[]>([]);
  const [loadingSyndicators, setLoadingSyndicators] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedSyndicator, setSelectedSyndicator] = useState<Syndicator | null>(null);
  const [message, setMessage] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showAccountTypeForm, setShowAccountTypeForm] = useState(false);
  const [changingAccountType, setChangingAccountType] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [additionalProfile, setAdditionalProfile] = useState<any>(null);
  const [profileCompletion, setProfileCompletion] = useState<any>(null);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateConfirmation, setDeactivateConfirmation] = useState('');

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show onboarding wizard for new users
  useEffect(() => {
    if (profile && profileCompletion && !profile.full_name) {
      setShowOnboardingWizard(true);
    }
  }, [profile, profileCompletion]);

  useEffect(() => {
    if (user && profile?.user_type === 'investor') {
      fetchSyndicators();
    }
    if (user && profile) {
      fetchAdditionalProfile();
    }
  }, [user, profile]);

  async function fetchAdditionalProfile() {
    if (!user || !profile) return;

    try {
      if (profile.user_type === 'investor') {
        const { data, error } = await supabase
          .from('investor_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setAdditionalProfile(data);
          const completion = calculateProfileCompletion(profile, data);
          setProfileCompletion(completion);
        }
      } else if (profile.user_type === 'syndicator') {
        const { data, error } = await supabase
          .from('syndicator_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setAdditionalProfile(data);
          const completion = calculateProfileCompletion(profile, data);
          setProfileCompletion(completion);
        }
      }
    } catch (error) {
      console.error('Error fetching additional profile:', error);
    }
  }

  // Handle profile loading state
  useEffect(() => {
    if (user) {
      if (!profile) {
        const timer = setTimeout(() => {
          setProfileLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        setProfileLoading(false);
      }
    } else {
      setProfileLoading(false);
    }
  }, [user, profile]);

  async function fetchSyndicators() {
    setLoadingSyndicators(true);
    try {
      const { data, error } = await supabase
        .from('syndicator_profiles')
        .select(`
          id,
          company_name,
          company_description,
          state,
          city,
          company_logo_url,
          verification_status,
          slug
        `)
        .in('verification_status', ['featured', 'premium'])
        .order('verification_status', { ascending: false })
        .limit(12);

      if (error) throw error;
      
      const transformedData: Syndicator[] = (data || [])
        .map(item => ({
          id: item.id,
          company_name: item.company_name,
          company_description: item.company_description,
          location: `${item.city}, ${item.state}`,
          company_logo_url: item.company_logo_url,
          verification_status: item.verification_status,
          slug: item.slug,
        }));
      setSyndicators(transformedData);
    } catch (error) {
      console.error('Error fetching syndicators:', error);
    } finally {
      setLoadingSyndicators(false);
    }
  }

  const handleMessageSyndicator = (syndicator: Syndicator) => {
    setSelectedSyndicator(syndicator);
    setShowMessageModal(true);
  };

  const handleFieldFocus = (field: string) => {
    // Map field names to section IDs and scroll targets
    const fieldMappings: { [key: string]: string } = {
      'Phone Number': 'profile-form-section',
      'Full Name': 'profile-form-section', 
      'Profile Picture': 'profile-form-section',
      'Investment Range': 'profile-form-section',
      'Property Types': 'profile-form-section',
      'Preferred Locations': 'profile-form-section',
      'Experience Level': 'profile-form-section',
      'Years Investing': 'profile-form-section',
      'Bio': 'profile-form-section',
      'Company Name': 'profile-form-section',
      'Company Description': 'profile-form-section',
      'Company Logo': 'profile-form-section',
      'Website URL': 'profile-form-section',
      'LinkedIn URL': 'profile-form-section',
      'Years in Business': 'profile-form-section',
      'Total Deal Volume': 'profile-form-section',
      'Location': 'profile-form-section'
    };

    const sectionId = fieldMappings[field];
    if (sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        // Scroll to the section with some offset to account for sticky header
        // Use smaller offset since header will minimize on scroll
        const yOffset = -80; // Account for minimized sticky header
        const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({ top: y, behavior: 'smooth' });
        
        // Add a visual highlight to the section
        section.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
        setTimeout(() => {
          section.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
        }, 3000);
        
        toast.success(`Scrolled to ${field} section`, {
          icon: '📍',
          duration: 2000,
        });
      }
    } else {
      toast.error(`Field "${field}" not found`);
    }
  };

  const handleAccountTypeChange = async (newType: 'investor' | 'syndicator') => {
    if (!user || !profile || newType === profile.user_type) return;
    
    setChangingAccountType(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ user_type: newType })
        .eq('id', user.id);

      if (profileError) throw profileError;

      if (newType === 'investor') {
        const { data: existingInvestor } = await supabase
          .from('investor_profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingInvestor) {
          const { error: investorError } = await supabase
            .from('investor_profiles')
            .insert([{
              id: user.id,
              accredited_status: false,
              investment_preferences: {},
              preferred_property_types: [],
              preferred_locations: []
            }]);
          
          if (investorError) throw investorError;
        }
      } else {
        const { data: existingSyndicator } = await supabase
          .from('syndicator_profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingSyndicator) {
          const { error: syndicatorError } = await supabase
            .from('syndicator_profiles')
            .insert([{
              id: user.id,
              company_name: profile.full_name || 'My Company',
              verification_documents: {}
            }]);
          
          if (syndicatorError) throw syndicatorError;
        }
      }

      toast.success(`Account type successfully changed to ${newType}`);
      setShowAccountTypeForm(false);
      window.location.reload();
    } catch (error) {
      console.error('Error changing account type:', error);
      toast.error('Error changing account type. Please try again.');
    } finally {
      setChangingAccountType(false);
    }
  };

  const handleAccountDeactivation = async () => {
    if (!user || deactivateConfirmation !== 'DEACTIVATE') {
      toast.error('Please type DEACTIVATE to confirm');
      return;
    }

    try {
      // Update profile to mark as deactivated
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          is_active: false,
          deactivated_at: new Date().toISOString(),
          full_name: `[DEACTIVATED] ${profile?.full_name || 'User'}`
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success('Account successfully deactivated');
      
      // Sign out the user
      await supabase.auth.signOut();
      
      // Redirect to home page
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error deactivating account:', error);
      toast.error('Error deactivating account. Please try again.');
    }
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Show loading state while profile is being created/fetched
  if (user && !profile && profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Setting up your profile...</h2>
                <p className="text-gray-600">This will only take a moment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user && !profile && !profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Setup Error</h2>
              <p className="text-gray-600 mb-4">There was an issue setting up your profile. Please try refreshing the page.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style dangerouslySetInnerHTML={{ __html: progressStyles }} />
      <Navbar />
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Welcome Banner for New Users */}
          {profile && !profile.full_name && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md p-6 animate-fade-in">
              <div className="flex items-center">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Welcome to EquityMD! 🎉</h2>
                  <p className="text-blue-100 mb-3">
                    You're just a few steps away from {profile.user_type === 'investor' 
                      ? 'discovering exclusive real estate investment opportunities'
                      : 'showcasing your deals to qualified investors'
                    }.
                  </p>
                  <button
                    onClick={() => setShowOnboardingWizard(true)}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
                  >
                    Get Started <ArrowRight className="inline h-4 w-4 ml-1" />
                  </button>
                </div>
                <div className="ml-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    {profile.user_type === 'investor' ? (
                      <User className="h-8 w-8 text-white" />
                    ) : (
                      <Building2 className="h-8 w-8 text-white" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Profile Completion Card */}
          {profile && profileCompletion && (
            <EnhancedProfileCompletionCard 
              completion={profileCompletion}
              userType={profile.user_type}
              onFieldFocus={handleFieldFocus}
            />
          )}

          {/* Profile Header */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-semibold">{profile?.full_name || user?.email}</h2>
            <AccountTypeBadge
              userType={profile?.user_type || 'investor'}
              isAdmin={profile?.is_admin}
              isVerified={profile?.is_verified}
              size="md"
            />
            {profile?.is_verified && (
              <span className="text-sm text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Verified
              </span>
            )}
            <div className="ml-auto flex items-center space-x-3">
              <button
                onClick={() => setShowProfilePreview(true)}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition hover:scale-105 transform"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Profile
              </button>
              {profile?.is_admin && user?.email === 'justin@brandastic.com' && (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition hover:scale-105 transform"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Trending Banner for Investors */}
          {profile?.user_type === 'investor' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">
                  Multifamily properties are trending! 📈 Complete your property preferences to see matching deals.
                </span>
              </div>
            </div>
          )}

          {/* Section Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">Account Settings</span>
            </div>
          </div>

          {/* Account Settings Card */}
          <div id="account-settings-section" className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Settings className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">Account Settings</h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAccountTypeForm(!showAccountTypeForm)}
                  className="text-blue-600 hover:text-blue-700 transition font-medium"
                >
                  {showAccountTypeForm ? 'Cancel' : 'Change Account Type'}
                </button>
                <button
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  className="text-blue-600 hover:text-blue-700 transition font-medium"
                >
                  {showEmailForm ? 'Cancel' : 'Update Email'}
                </button>
              </div>
            </div>

            {showAccountTypeForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Change Account Type</h3>
                <p className="text-gray-600 mb-4">
                  You can switch between investor and syndicator accounts. Your existing data will be preserved.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => handleAccountTypeChange('investor')}
                    disabled={changingAccountType || profile?.user_type === 'investor'}
                    className={`p-4 border rounded-lg text-center flex items-center justify-center transition hover:scale-105 transform ${
                      profile?.user_type === 'investor'
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <User className="h-6 w-6 mr-2" />
                    <div>
                      <div className="font-semibold">Investor</div>
                      <div className="text-sm">Find investment opportunities</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAccountTypeChange('syndicator')}
                    disabled={changingAccountType || profile?.user_type === 'syndicator'}
                    className={`p-4 border rounded-lg text-center flex items-center justify-center transition hover:scale-105 transform ${
                      profile?.user_type === 'syndicator'
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <Building2 className="h-6 w-6 mr-2" />
                    <div>
                      <div className="font-semibold">Syndicator</div>
                      <div className="text-sm">List deals for investors</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {showEmailForm && (
              <div className="mb-6">
                <EmailUpdateForm 
                  currentEmail={user.email!}
                  onSuccess={() => setShowEmailForm(false)}
                />
              </div>
            )}

            {/* Danger Zone - Hidden at bottom */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Danger Zone</h4>
                  <p className="text-xs text-gray-400 mt-1">Irreversible account actions</p>
                </div>
                <button
                  onClick={() => setShowDeactivateModal(true)}
                  className="text-xs text-gray-400 hover:text-red-500 transition underline"
                >
                  Deactivate account
                </button>
              </div>
            </div>
          </div>

          {/* Section Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">
                {profile?.user_type === 'investor' ? 'Investor Profile' : 'Syndicator Profile'}
              </span>
            </div>
          </div>

          {/* Profile Form */}
          <div id="profile-form-section" className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 transition-all duration-300">
            <div className="flex items-center mb-6">
              {profile?.user_type === 'investor' ? (
                <User className="h-6 w-6 text-green-600 mr-3" />
              ) : (
                <Building2 className="h-6 w-6 text-green-600 mr-3" />
              )}
              <h2 className="text-2xl font-semibold text-gray-900">
                {profile?.user_type === 'investor' ? 'Your Investment Profile' : 'Your Company Profile'}
              </h2>
            </div>
            
            {profile?.user_type === 'investor' ? (
              <InvestorProfileForm 
                setMessage={(msg: string) => {
                  if (msg.includes('successfully')) {
                    toast.success(msg);
                    fetchAdditionalProfile();
                  } else {
                    toast.error(msg);
                  }
                }}
              />
            ) : (
              <SyndicatorProfileForm 
                setMessage={(msg: string) => {
                  if (msg.includes('successfully')) {
                    toast.success(msg);
                    fetchAdditionalProfile();
                  } else {
                    toast.error(msg);
                  }
                }}
              />
            )}
          </div>

          {/* Connect with Syndicators (Investor Only) */}
          {profile?.user_type === 'investor' && (
            <>
              {/* Section Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 text-gray-500">Connect & Network</span>
                </div>
              </div>

              <div id="connect-syndicators-section" className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Users className="h-6 w-6 text-purple-600 mr-3" />
                      <h2 className="text-2xl font-semibold text-gray-900">Connect with Syndicators</h2>
                    </div>
                    <span className="text-sm text-gray-500">{syndicators.length} featured syndicators</span>
                  </div>
                
                {/* Testimonial Banner */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">
                      Over 500 syndicators joined this month! Connect with top-performing sponsors.
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loadingSyndicators ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <Skeleton height={40} className="mb-2" />
                      <Skeleton height={20} className="mb-2" />
                      <Skeleton height={60} className="mb-3" />
                      <Skeleton height={32} />
                    </div>
                  ))
                ) : syndicators.length === 0 ? (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    No featured or sponsored syndicators available at this time. Check back soon!
                  </div>
                ) : (
                  syndicators.map((syndicator) => (
                    <Link
                      key={syndicator.id}
                      to={`/syndicators/${syndicator.slug}`}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition hover:scale-105 transform flex flex-col h-full group relative"
                    >
                      <div className="flex items-center mb-3">
                        {syndicator.company_logo_url ? (
                          <img
                            src={syndicator.company_logo_url}
                            alt={syndicator.company_name}
                            className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200 bg-white"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center">
                            {syndicator.company_name}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${syndicator.verification_status === 'premium' ? 'bg-yellow-400 text-yellow-900' : 'bg-blue-100 text-blue-800'}`}>
                              {syndicator.verification_status === 'premium' ? 'Premier' : 'Featured'}
                            </span>
                          </h3>
                          <p className="text-sm text-gray-600">{syndicator.location}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-3 flex-1">
                        {syndicator.company_description}
                      </p>
                      <div className="mt-auto">
                        <div className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center group-hover:scale-105 transform font-semibold cursor-pointer">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Connect
                        </div>
                      </div>
                      <span className="absolute inset-0" aria-hidden="true"></span>
                    </Link>
                  ))
                )}
              </div>
                </div>
              </>
            )}
        </div>
      </div>

      {/* Mobile Sticky Save Button */}
      {isMobile && (
        <div className="fixed bottom-4 left-4 right-4 z-20">
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-lg hover:bg-blue-700 transition font-medium">
            Save Changes
          </button>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedSyndicator && (
        <MessageModal
          syndicatorId={selectedSyndicator.id}
          syndicatorName={selectedSyndicator.company_name}
          onClose={() => setShowMessageModal(false)}
        />
      )}

      {/* Onboarding Wizard */}
      <OnboardingWizard
        isOpen={showOnboardingWizard}
        onClose={() => setShowOnboardingWizard(false)}
        userType={profile?.user_type || 'investor'}
        missingFields={profileCompletion?.missingFields || []}
      />

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        isOpen={showProfilePreview}
        onClose={() => setShowProfilePreview(false)}
        profile={profile}
        userType={profile?.user_type || 'investor'}
      />

      {/* Account Deactivation Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onRequestClose={() => {
          setShowDeactivateModal(false);
          setDeactivateConfirmation('');
        }}
        className="max-w-lg mx-auto bg-white rounded-xl shadow-2xl p-8 m-6"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Deactivate Account</h3>
          <p className="text-sm text-gray-600 mb-6 text-left px-2">
            This action will deactivate your account. Your profile will be hidden from other users and you will be signed out.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 mx-2">
            <p className="text-sm text-red-800 text-left">
              <strong>Warning:</strong> This action cannot be easily undone. You will need to contact support to reactivate your account.
            </p>
          </div>

          <div className="mb-6 text-left px-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type "DEACTIVATE" to confirm:
            </label>
            <input
              type="text"
              value={deactivateConfirmation}
              onChange={(e) => setDeactivateConfirmation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-center font-mono"
              placeholder="DEACTIVATE"
            />
          </div>

          <div className="flex gap-4 px-2">
            <button
              onClick={() => {
                setShowDeactivateModal(false);
                setDeactivateConfirmation('');
              }}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAccountDeactivation}
              disabled={deactivateConfirmation !== 'DEACTIVATE'}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Deactivate
            </button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}