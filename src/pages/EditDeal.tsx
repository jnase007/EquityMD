import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Save, AlertCircle, Sparkles, Building, MapPin, 
  DollarSign, FileText, Camera, CheckCircle, Loader2, Plus, 
  Trash2, Video, Youtube, X, Eye, ArrowLeft
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { Navbar } from '../components/Navbar';
import toast from 'react-hot-toast';

const PROPERTY_TYPES = [
  { value: 'Multi-Family', label: 'Multi-Family', icon: '🏢', description: 'Apartment buildings, duplexes, condos' },
  { value: 'Office', label: 'Office', icon: '🏬', description: 'Commercial office spaces' },
  { value: 'Retail', label: 'Retail', icon: '🏪', description: 'Shopping centers, storefronts' },
  { value: 'Industrial', label: 'Industrial', icon: '🏭', description: 'Warehouses, manufacturing' },
  { value: 'Medical', label: 'Medical', icon: '🏥', description: 'Medical offices, healthcare facilities' },
  { value: 'Student Housing', label: 'Student Housing', icon: '🎓', description: 'Near universities and colleges' },
  { value: 'Hospitality', label: 'Hospitality', icon: '🏨', description: 'Hotels, resorts, vacation rentals' },
  { value: 'Mixed-Use', label: 'Mixed-Use', icon: '🏗️', description: 'Combination of residential & commercial' },
];

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
];

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

function extractVimeoId(url: string): string | null {
  const regExp = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

function getVideoEmbedUrl(url: string): string | null {
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}`;
  const vimeoId = extractVimeoId(url);
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;
  return null;
}

interface DealFormData {
  title: string;
  propertyType: string;
  location: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  minimumInvestment: string;
  targetIrr: string;
  investmentTerm: string;
  totalEquity: string;
  preferredReturn: string;
  equityMultiple: string;
  description: string;
  investmentHighlights: string[];
  videoUrl: string;
  status: string;
}

export function EditDeal() {
  const { slug } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deal, setDeal] = useState<any>(null);
  const [formData, setFormData] = useState<DealFormData>({
    title: '',
    propertyType: '',
    location: '',
    address: { street: '', city: '', state: '', zip: '' },
    minimumInvestment: '',
    targetIrr: '',
    investmentTerm: '',
    totalEquity: '',
    preferredReturn: '',
    equityMultiple: '',
    description: '',
    investmentHighlights: [''],
    videoUrl: '',
    status: 'draft',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState('basics');

  useEffect(() => {
    if (slug && user) {
      fetchDeal();
    }
  }, [slug, user]);

  async function fetchDeal() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          syndicator:syndicator_id (
            id,
            company_name,
            claimed_by
          )
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;

      // Check if user owns this deal through their syndicator
      if (data.syndicator?.claimed_by !== user?.id) {
        toast.error('You do not have permission to edit this deal');
        navigate('/dashboard');
        return;
      }

      setDeal(data);
      
      // Parse address from JSON or string
      let address = { street: '', city: '', state: '', zip: '' };
      if (data.address) {
        if (typeof data.address === 'string') {
          try {
            address = JSON.parse(data.address);
          } catch {
            // If address is a simple string, try to parse city/state
            const parts = data.address.split(',').map((s: string) => s.trim());
            if (parts.length >= 2) {
              address.city = parts[0];
              address.state = parts[1];
            }
          }
        } else {
          address = data.address;
        }
      } else if (data.location) {
        // Fallback to location field
        const parts = data.location.split(',').map((s: string) => s.trim());
        if (parts.length >= 2) {
          address.city = parts[0];
          address.state = parts[1];
        }
      }

      setFormData({
        title: data.title || '',
        propertyType: data.property_type || '',
        location: data.location || '',
        address,
        minimumInvestment: data.minimum_investment?.toString() || '',
        targetIrr: data.target_irr?.toString() || '',
        investmentTerm: data.investment_term?.toString() || '',
        totalEquity: data.total_equity?.toString() || '',
        preferredReturn: data.preferred_return?.toString() || '',
        equityMultiple: data.equity_multiple?.toString() || '',
        description: data.description || '',
        investmentHighlights: data.investment_highlights?.length > 0 
          ? data.investment_highlights 
          : [''],
        videoUrl: data.video_url || '',
        status: data.status || 'draft',
      });
    } catch (error) {
      console.error('Error fetching deal:', error);
      toast.error('Failed to load deal');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  const updateFormData = (updates: Partial<DealFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    const errorKeys = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      errorKeys.forEach(key => delete newErrors[key]);
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
    if (!formData.address.city.trim()) newErrors.city = 'City is required';
    if (!formData.minimumInvestment) newErrors.minimumInvestment = 'Minimum investment is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (newStatus?: string) => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }
    
    if (!deal) return;
    
    setSaving(true);
    
    try {
      const location = formData.address.city && formData.address.state 
        ? `${formData.address.city}, ${formData.address.state}`
        : formData.location;
      
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        property_type: formData.propertyType,
        location,
        address: formData.address,
        investment_highlights: formData.investmentHighlights.filter(Boolean),
        minimum_investment: parseFloat(formData.minimumInvestment) || 0,
        target_irr: formData.targetIrr ? parseFloat(formData.targetIrr) : null,
        investment_term: formData.investmentTerm ? parseInt(formData.investmentTerm) : null,
        total_equity: parseFloat(formData.totalEquity) || 0,
        updated_at: new Date().toISOString(),
      };
      
      if (newStatus) {
        updateData.status = newStatus;
      }
      
      if (formData.videoUrl && getVideoEmbedUrl(formData.videoUrl)) {
        updateData.video_url = formData.videoUrl;
      } else if (!formData.videoUrl) {
        updateData.video_url = null;
      }

      const { error } = await supabase
        .from('deals')
        .update(updateData)
        .eq('id', deal.id);

      if (error) throw error;

      toast.success(newStatus === 'active' ? 'Deal published successfully!' : 'Changes saved successfully!');
      
      // Navigate to the deal page
      navigate(`/deals/${deal.slug}`);
    } catch (error: any) {
      console.error('Error updating deal:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    navigate('/');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'basics', title: 'Basics', icon: Building },
    { id: 'location', title: 'Location', icon: MapPin },
    { id: 'investment', title: 'Investment', icon: DollarSign },
    { id: 'details', title: 'Details', icon: FileText },
    { id: 'media', title: 'Media', icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link
              to={`/deals/${slug}`}
              className="flex items-center text-gray-500 hover:text-gray-700 mb-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Deal
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="h-7 w-7 text-emerald-500" />
              Edit Deal
            </h1>
            <p className="text-gray-500 mt-1">{formData.title || 'Untitled Deal'}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to={`/deals/${slug}`}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </Link>
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="px-4 py-2 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Save Changes</span>
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            formData.status === 'active' 
              ? 'bg-emerald-100 text-emerald-700' 
              : formData.status === 'draft'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              formData.status === 'active' 
                ? 'bg-emerald-500' 
                : formData.status === 'draft'
                ? 'bg-amber-500'
                : 'bg-gray-500'
            }`} />
            {formData.status === 'active' ? 'Published' : formData.status === 'draft' ? 'Draft' : formData.status}
          </div>
        </div>

        {/* Section Navigation */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {section.title}
              </button>
            );
          })}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 lg:p-8">
            {/* Basics Section */}
            {activeSection === 'basics' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Building className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Property Basics</h2>
                    <p className="text-gray-500">Core property information</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateFormData({ title: e.target.value })}
                    placeholder="e.g., Sunset Gardens Apartments"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 focus:border-emerald-500 transition-colors ${
                      errors.title ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Property Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PROPERTY_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => updateFormData({ propertyType: type.value })}
                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                          formData.propertyType === type.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <span className="text-2xl mb-2 block">{type.icon}</span>
                        <p className="font-semibold text-gray-900 text-sm">{type.label}</p>
                      </button>
                    ))}
                  </div>
                  {errors.propertyType && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.propertyType}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Location Section */}
            {activeSection === 'location' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Location</h2>
                    <p className="text-gray-500">Property address details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => updateFormData({ 
                        address: { ...formData.address, street: e.target.value }
                      })}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => updateFormData({ 
                        address: { ...formData.address, city: e.target.value }
                      })}
                      placeholder="Los Angeles"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 focus:border-emerald-500 ${
                        errors.city ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.city}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State
                    </label>
                    <select
                      value={formData.address.state}
                      onChange={(e) => updateFormData({ 
                        address: { ...formData.address, state: e.target.value }
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500"
                    >
                      <option value="">Select state...</option>
                      {US_STATES.map((state) => (
                        <option key={state.code} value={state.code}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={formData.address.zip}
                      onChange={(e) => updateFormData({ 
                        address: { ...formData.address, zip: e.target.value }
                      })}
                      placeholder="90210"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Investment Section */}
            {activeSection === 'investment' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Investment Terms</h2>
                    <p className="text-gray-500">Financial details for investors</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Minimum Investment <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={formData.minimumInvestment}
                        onChange={(e) => updateFormData({ minimumInvestment: e.target.value })}
                        placeholder="50,000"
                        className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl focus:ring-0 focus:border-emerald-500 ${
                          errors.minimumInvestment ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Total Equity Raise
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={formData.totalEquity}
                        onChange={(e) => updateFormData({ totalEquity: e.target.value })}
                        placeholder="5,000,000"
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Target IRR (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.targetIrr}
                        onChange={(e) => updateFormData({ targetIrr: e.target.value })}
                        placeholder="18"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Investment Term (years)
                    </label>
                    <input
                      type="number"
                      value={formData.investmentTerm}
                      onChange={(e) => updateFormData({ investmentTerm: e.target.value })}
                      placeholder="5"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Details Section */}
            {activeSection === 'details' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <FileText className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Description & Highlights</h2>
                    <p className="text-gray-500">Tell investors about this opportunity</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Investment Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    rows={6}
                    placeholder="Describe the property, the investment thesis, and why investors should be excited..."
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 focus:border-emerald-500 resize-none ${
                      errors.description ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Investment Highlights
                  </label>
                  <div className="space-y-3">
                    {formData.investmentHighlights.map((highlight, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={highlight}
                          onChange={(e) => {
                            const newHighlights = [...formData.investmentHighlights];
                            newHighlights[index] = e.target.value;
                            updateFormData({ investmentHighlights: newHighlights });
                          }}
                          placeholder={`Highlight ${index + 1}`}
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500"
                        />
                        {formData.investmentHighlights.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newHighlights = formData.investmentHighlights.filter((_, i) => i !== index);
                              updateFormData({ investmentHighlights: newHighlights });
                            }}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => updateFormData({ 
                      investmentHighlights: [...formData.investmentHighlights, '']
                    })}
                    className="mt-3 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Add Another Highlight
                  </button>
                </div>
              </div>
            )}

            {/* Media Section */}
            {activeSection === 'media' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-pink-100 rounded-xl">
                    <Camera className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Media</h2>
                    <p className="text-gray-500">Videos and additional content</p>
                  </div>
                </div>

                {/* Video Section */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Video className="h-4 w-4 text-red-500" />
                    Property Video URL
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Youtube className="h-5 w-5 text-red-500" />
                    </div>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => updateFormData({ videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-red-400"
                    />
                  </div>
                  
                  {formData.videoUrl && getVideoEmbedUrl(formData.videoUrl) && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Video Preview</p>
                      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                        <iframe
                          src={getVideoEmbedUrl(formData.videoUrl) || ''}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="Property Video Preview"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => updateFormData({ videoUrl: '' })}
                        className="mt-2 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <X className="h-4 w-4" />
                        Remove video
                      </button>
                    </div>
                  )}
                  
                  {formData.videoUrl && !getVideoEmbedUrl(formData.videoUrl) && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-700">
                        <p className="font-medium">Invalid video URL</p>
                        <p>Please enter a valid YouTube or Vimeo link</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> To update property photos, please contact support or use the deal management page.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 lg:px-8 py-4 flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex items-center gap-2">
              {formData.status === 'draft' && (
                <button
                  onClick={() => handleSave('active')}
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Publish Deal
                </button>
              )}
              {formData.status === 'active' && (
                <button
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="px-4 py-2.5 bg-amber-100 text-amber-700 font-semibold rounded-xl hover:bg-amber-200 transition-colors"
                >
                  Unpublish
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <Link
                to={`/deals/${slug}`}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

