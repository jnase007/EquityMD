import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Check, Save, X, AlertCircle, 
  Sparkles, Building, MapPin, DollarSign, FileText, Camera, 
  CheckCircle, Loader2, Plus, Trash2, Play, Video, Youtube, Eye
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { Navbar } from '../Navbar';
import { ImageGalleryUpload } from './ImageGalleryUpload';
import { LivePreview } from './LivePreview';
import { AIContentAssistant } from '../AIContentAssistant';
import { 
  PropertyFormData, UploadedImage, PROPERTY_TYPES, US_STATES, 
  WIZARD_STEPS, initialFormData, extractYouTubeId, extractVimeoId, getVideoThumbnail, getVideoEmbedUrl, isValidVideoUrl
} from './types';

export function PropertyListingWizard() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [userSyndicators, setUserSyndicators] = useState<any[]>([]);
  const [loadingSyndicators, setLoadingSyndicators] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftId, setDraftId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [disclaimerAcknowledged, setDisclaimerAcknowledged] = useState(false);
  
  // Inline business profile creation
  const [showBusinessCreation, setShowBusinessCreation] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [creatingBusiness, setCreatingBusiness] = useState(false);

  // Format number with commas for display
  const formatWithCommas = (value: string): string => {
    const num = value.replace(/[^\d]/g, '');
    return num ? parseInt(num, 10).toLocaleString('en-US') : '';
  };

  // Parse formatted value back to number string
  const parseFormattedValue = (value: string): string => {
    return value.replace(/[^\d]/g, '');
  };

  // Handle currency input change
  const handleCurrencyChange = (field: keyof PropertyFormData, value: string) => {
    const numericValue = parseFormattedValue(value);
    updateFormData({ [field]: numericValue });
  };

  // Load user's syndicators
  useEffect(() => {
    async function fetchUserSyndicators() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('syndicators')
          .select('id, company_name, verification_status')
          .eq('claimed_by', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setUserSyndicators(data || []);
        if (data && data.length > 0 && !formData.syndicatorId) {
          setFormData(prev => ({ ...prev, syndicatorId: data[0].id }));
        }
      } catch (error) {
        console.error('Error fetching syndicators:', error);
      } finally {
        setLoadingSyndicators(false);
      }
    }

    fetchUserSyndicators();
  }, [user]);

  // Auto-save draft
  const saveDraft = useCallback(async () => {
    if (!user || !formData.syndicatorId) return;
    
    setSaving(true);
    try {
      // For now, store in localStorage as a simple draft mechanism
      const draftKey = `deal_draft_${user.id}`;
      localStorage.setItem(draftKey, JSON.stringify({
        formData,
        draftId,
        savedAt: new Date().toISOString()
      }));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  }, [formData, draftId, user]);

  // Load draft on mount
  useEffect(() => {
    if (!user) return;
    
    const draftKey = `deal_draft_${user.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Only restore if draft is less than 24 hours old
        const savedAt = new Date(parsed.savedAt);
        const hoursSinceSave = (Date.now() - savedAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceSave < 24 && parsed.formData) {
          // Don't restore images as they're file objects
          const restoredData = { 
            ...parsed.formData, 
            images: [],
            coverImageIndex: 0 
          };
          setFormData(restoredData);
          setDraftId(parsed.draftId);
          setLastSaved(savedAt);
        }
      } catch (e) {
        console.error('Error restoring draft:', e);
      }
    }
  }, [user]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.title || formData.description) {
        saveDraft();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [formData, saveDraft]);

  const updateFormData = (updates: Partial<PropertyFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors
    const errorKeys = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      errorKeys.forEach(key => delete newErrors[key]);
      return newErrors;
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 0: // Basics
        if (!formData.title.trim()) newErrors.title = 'Property title is required';
        if (!formData.propertyType) newErrors.propertyType = 'Please select a property type';
        if (!formData.syndicatorId) newErrors.syndicatorId = 'Please select a syndicator';
        break;
      case 1: // Location
        if (!formData.address.city.trim()) newErrors.city = 'City is required';
        if (!formData.address.state) newErrors.state = 'State is required';
        break;
      case 2: // Investment
        if (!formData.minimumInvestment) newErrors.minimumInvestment = 'Minimum investment is required';
        if (!formData.totalEquity) newErrors.totalEquity = 'Total equity raise is required';
        break;
      case 3: // Details
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        break;
      case 4: // Media
        // Photos are optional but recommended
        break;
      case 5: // Review
        // Final validation
        if (!formData.title.trim()) newErrors.title = 'Property title is required';
        if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
        if (!formData.address.city.trim()) newErrors.city = 'City is required';
        if (!formData.minimumInvestment) newErrors.minimumInvestment = 'Minimum investment is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (step: number) => {
    // Allow going back to any step, but validate before going forward
    if (step < currentStep) {
      setCurrentStep(step);
    } else {
      let canProceed = true;
      for (let i = currentStep; i < step; i++) {
        if (!validateStep(i)) {
          canProceed = false;
          break;
        }
      }
      if (canProceed) {
        setCurrentStep(step);
      }
    }
  };

  const uploadImages = async (dealId: string): Promise<string | null> => {
    if (formData.images.length === 0) return null;
    
    let coverImageUrl: string | null = null;
    
    for (let i = 0; i < formData.images.length; i++) {
      const image = formData.images[i];
      if (!image.file) continue;
      
      try {
        const fileExt = image.file.name.split('.').pop() || 'jpg';
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `deals/${dealId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('deal-media')
          .upload(filePath, image.file);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('deal-media')
          .getPublicUrl(filePath);
        
        // Save to deal_media table
        await supabase.from('deal_media').insert({
          deal_id: dealId,
          type: 'image',
          url: publicUrl,
          title: image.title,
          order: i
        });
        
        // Set cover image
        if (i === formData.coverImageIndex) {
          coverImageUrl = publicUrl;
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    
    return coverImageUrl;
  };

  // Create business profile inline
  const handleCreateBusiness = async () => {
    if (!businessName.trim()) {
      toast.error('Please enter your company name');
      return;
    }
    
    setCreatingBusiness(true);
    try {
      // Generate a slug from the company name
      const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      // Create syndicator profile
      const { data: newSyndicator, error: syndicatorError } = await supabase
        .from('syndicators')
        .insert([{
          company_name: businessName.trim(),
          company_description: businessDescription.trim() || null,
          slug: `${slug}-${Date.now().toString(36)}`,
          claimed_by: user!.id,
          claimed_at: new Date().toISOString(),
          claimable: false,
          verification_status: 'unverified',
          years_in_business: 0,
          total_deal_volume: 0,
        }])
        .select()
        .single();
      
      if (syndicatorError) throw syndicatorError;
      
      // Update user profile to syndicator type and dashboard preference
      await supabase
        .from('profiles')
        .update({ 
          user_type: 'syndicator',
          dashboard_preference: 'syndicator'
        })
        .eq('id', user!.id);
      
      // Update local state - set syndicator ID in form data
      setUserSyndicators([newSyndicator]);
      setFormData(prev => ({ ...prev, syndicatorId: newSyndicator.id }));
      
      // Clear any previous syndicator error
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.syndicatorId;
        return newErrors;
      });
      
      setShowBusinessCreation(false);
      setBusinessName('');
      setBusinessDescription('');
      
      toast.success('Business profile created! Continue to list your deal.');
      
      // Small delay to ensure state updates, then auto-advance if on step 0 and has title
      setTimeout(() => {
        if (currentStep === 0 && formData.title.trim() && formData.propertyType) {
          setCurrentStep(1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
      
    } catch (error: any) {
      console.error('Error creating business:', error);
      toast.error(error.message || 'Failed to create business profile');
    } finally {
      setCreatingBusiness(false);
    }
  };

  const handlePublish = async (status: 'draft' | 'active' = 'draft') => {
    // Validation
    if (!validateStep(5)) {
      setErrors({ submit: 'Please fill in all required fields before publishing.' });
      return;
    }
    if (!user || !formData.syndicatorId) {
      setErrors({ submit: 'Please select a syndicator for this listing.' });
      return;
    }
    
    setPublishing(true);
    setErrors({});
    
    try {
      // Build location string
      const location = formData.address.city && formData.address.state 
        ? `${formData.address.city}, ${formData.address.state}`
        : formData.location;
      
      // Create the deal data object
      const dealData: any = {
        syndicator_id: formData.syndicatorId,
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
        preferred_return: formData.preferredReturn ? parseFloat(formData.preferredReturn) : null,
        equity_multiple: formData.equityMultiple ? parseFloat(formData.equityMultiple) : null,
        closing_date: formData.closingDate ? new Date(formData.closingDate).toISOString() : null,
        status,
        cover_image_url: null
      };
      
      // Add video URL if provided - be lenient with validation
      if (formData.videoUrl && isValidVideoUrl(formData.videoUrl)) {
        dealData.video_url = formData.videoUrl.trim();
        console.log('Saving video URL:', formData.videoUrl);
      }
      
      console.log('Creating deal with data:', dealData);
      
      // Insert deal into database
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert(dealData)
        .select('*')
        .single();
      
      if (dealError) {
        console.error('Deal insert error:', dealError);
        throw new Error(`Database error: ${dealError.message}`);
      }
      
      if (!deal || !deal.slug) {
        throw new Error('Deal was not created properly - missing data');
      }
      
      console.log('Deal created successfully:', deal.id, deal.slug);
      
      // Upload images (non-blocking)
      const imagesWithFiles = formData.images.filter(img => img.file);
      if (imagesWithFiles.length > 0) {
        try {
          const coverImageUrl = await uploadImages(deal.id);
          if (coverImageUrl) {
            await supabase
              .from('deals')
              .update({ cover_image_url: coverImageUrl })
              .eq('id', deal.id);
          }
        } catch (uploadError) {
          console.error('Image upload error (non-fatal):', uploadError);
        }
      }
      
      // Clear draft from localStorage
      localStorage.removeItem(`deal_draft_${user.id}`);
      
      // Send admin notification for new active deals
      if (status === 'active') {
        try {
          // Get syndicator info for notification
          const syndicator = userSyndicators.find(s => s.id === formData.syndicatorId);
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', user.id)
            .single();
          
          await supabase.functions.invoke('send-email', {
            body: {
              type: 'new_deal_listed',
              data: {
                syndicatorName: syndicator?.company_name || 'Unknown',
                syndicatorEmail: userProfile?.email || user.email,
                dealTitle: formData.title,
                dealSlug: deal.slug,
                propertyType: formData.propertyType,
                location: location,
                minimumInvestment: `$${parseInt(formData.minimumInvestment).toLocaleString()}`,
                targetIrr: formData.targetIrr,
                listedDate: new Date().toLocaleDateString()
              }
            }
          });
          console.log('Admin notification sent for new deal');

          // Send deal alert emails to investors who have deal notifications enabled
          try {
            // Get investors with email notifications enabled (limit to prevent overload)
            const { data: investors } = await supabase
              .from('profiles')
              .select('id, email, full_name, email_notifications')
              .eq('user_type', 'investor')
              .not('email', 'is', null)
              .limit(200);

            if (investors && investors.length > 0) {
              // Filter to investors who have deal_updates enabled (default is true)
              const investorsToNotify = investors.filter(inv => {
                const notifications = inv.email_notifications;
                return !notifications || notifications.deal_updates !== false;
              });

              console.log(`Sending deal alerts to ${investorsToNotify.length} investors`);

              // Send emails in batches to avoid overloading
              const batchSize = 10;
              for (let i = 0; i < Math.min(investorsToNotify.length, 50); i += batchSize) {
                const batch = investorsToNotify.slice(i, i + batchSize);
                await Promise.all(batch.map(investor => 
                  supabase.functions.invoke('send-email', {
                    body: {
                      to: investor.email,
                      type: 'deal_alert',
                      data: {
                        investorName: investor.full_name || 'Investor',
                        dealTitle: formData.title,
                        dealSlug: deal.slug,
                        propertyType: formData.propertyType,
                        location: location,
                        targetIrr: formData.targetIrr,
                        minimumInvestment: `$${parseInt(formData.minimumInvestment).toLocaleString()}`,
                        investmentTerm: formData.investmentTerm,
                        syndicatorName: syndicator?.company_name || 'EquityMD Partner',
                        matchReasons: ['New investment opportunity on EquityMD']
                      }
                    }
                  }).catch(err => console.error(`Failed to send alert to ${investor.email}:`, err))
                ));
              }
              console.log('Deal alert emails sent successfully');
            }
          } catch (alertError) {
            console.error('Failed to send deal alert emails:', alertError);
            // Don't block the flow
          }
        } catch (emailError) {
          console.error('Failed to send admin notification:', emailError);
          // Don't block the flow if email fails
        }
      }
      
      // Success!
      toast.success(status === 'active' ? 'Deal published successfully!' : 'Draft saved!');
      
      // Stop spinner before navigating
      setPublishing(false);
      
      // Navigate to the new deal
      navigate(`/deals/${deal.slug}`);
      
    } catch (error: any) {
      console.error('Error creating deal:', error);
      const errorMessage = error.message || 'Failed to create listing. Please try again.';
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      // Always stop the spinner
      setPublishing(false);
    }
  };

  const selectedSyndicator = userSyndicators.find(s => s.id === formData.syndicatorId);

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-500 hover:text-gray-700 mb-2 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </button>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="h-7 w-7 text-emerald-500" />
              Create New Listing
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-sm text-gray-400 hidden sm:block">
                {saving ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  `Saved ${lastSaved.toLocaleTimeString()}`
                )}
              </span>
            )}
            <button
              onClick={saveDraft}
              disabled={saving}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex items-center min-w-max">
            {WIZARD_STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => goToStep(index)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    index === currentStep
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : index < currentStep
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <span className="text-lg">{index < currentStep ? '✓' : step.icon}</span>
                  <div className="text-left hidden md:block">
                    <div className="text-sm font-semibold">{step.title}</div>
                    <div className={`text-xs ${index === currentStep ? 'text-emerald-100' : 'text-gray-400'}`}>
                      {step.description}
                    </div>
                  </div>
                </button>
                
                {index < WIZARD_STEPS.length - 1 && (
                  <div className={`w-8 lg:w-12 h-0.5 mx-1 ${
                    index < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form Area */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Step Content */}
              <div className="p-6 lg:p-8">
                {/* Step 0: Basics */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-emerald-100 rounded-xl">
                        <Building className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Property Basics</h2>
                        <p className="text-gray-500">Let's start with the essentials</p>
                      </div>
                    </div>
                    
                    {/* Syndicator Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Your Syndicator Profile
                      </label>
                      {loadingSyndicators ? (
                        <div className="animate-pulse h-12 bg-gray-100 rounded-xl" />
                      ) : userSyndicators.length === 0 ? (
                        <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl">
                          {!showBusinessCreation ? (
                            <>
                              <div className="text-center">
                                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                  <Building className="h-8 w-8 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Create Your Business Profile</h3>
                                <p className="text-gray-600 text-sm mb-6">
                                  To list a deal, you'll need to set up your syndicator profile first. This only takes a minute!
                                </p>
                                <button
                                  onClick={() => {
                                    setShowBusinessCreation(true);
                                    // Clear syndicator error when opening the form
                                    setErrors(prev => {
                                      const newErrors = { ...prev };
                                      delete newErrors.syndicatorId;
                                      return newErrors;
                                    });
                                  }}
                                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                                >
                                  Get Started
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-gray-900">Create Business Profile</h3>
                                <button
                                  onClick={() => setShowBusinessCreation(false)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Company Name *
                                </label>
                                <input
                                  type="text"
                                  value={businessName}
                                  onChange={(e) => setBusinessName(e.target.value)}
                                  placeholder="e.g., Horizon Real Estate Partners"
                                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-indigo-500"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Brief Description (optional)
                                </label>
                                <textarea
                                  value={businessDescription}
                                  onChange={(e) => setBusinessDescription(e.target.value)}
                                  placeholder="Tell investors about your company..."
                                  rows={3}
                                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-indigo-500 resize-none"
                                />
                              </div>
                              
                              <button
                                onClick={handleCreateBusiness}
                                disabled={creatingBusiness || !businessName.trim()}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                {creatingBusiness ? (
                                  <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Creating...
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-5 w-5" />
                                    Create & Continue
                                  </>
                                )}
                              </button>
                              
                              <p className="text-xs text-gray-500 text-center">
                                You can add more details like logo and contact info later in your dashboard.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {userSyndicators.map((syndicator) => (
                            <label
                              key={syndicator.id}
                              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                formData.syndicatorId === syndicator.id
                                  ? 'border-emerald-500 bg-emerald-50'
                                  : 'border-gray-200 hover:border-emerald-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="syndicator"
                                value={syndicator.id}
                                checked={formData.syndicatorId === syndicator.id}
                                onChange={(e) => updateFormData({ syndicatorId: e.target.value })}
                                className="sr-only"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{syndicator.company_name}</p>
                                {syndicator.verification_status === 'verified' && (
                                  <span className="text-xs text-emerald-600">✓ Verified</span>
                                )}
                              </div>
                              {formData.syndicatorId === syndicator.id && (
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                              )}
                            </label>
                          ))}
                        </div>
                      )}
                      {errors.syndicatorId && !showBusinessCreation && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.syndicatorId}
                        </p>
                      )}
                    </div>
                    
                    {/* Property Title */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Property Title
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
                    
                    {/* Property Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Property Type
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
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{type.description}</p>
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
                
                {/* Step 1: Location */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <MapPin className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Location</h2>
                        <p className="text-gray-500">Where is the property located?</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Street Address <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.address.street}
                          onChange={(e) => updateFormData({ 
                            address: { ...formData.address, street: e.target.value }
                          })}
                          placeholder="123 Main Street"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500 transition-colors"
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
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 focus:border-emerald-500 transition-colors ${
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
                          State <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.address.state}
                          onChange={(e) => updateFormData({ 
                            address: { ...formData.address, state: e.target.value }
                          })}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 focus:border-emerald-500 transition-colors ${
                            errors.state ? 'border-red-300' : 'border-gray-200'
                          }`}
                        >
                          <option value="">Select state...</option>
                          {US_STATES.map((state) => (
                            <option key={state.code} value={state.code}>
                              {state.name}
                            </option>
                          ))}
                        </select>
                        {errors.state && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.state}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          ZIP Code <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.address.zip}
                          onChange={(e) => updateFormData({ 
                            address: { ...formData.address, zip: e.target.value }
                          })}
                          placeholder="90210"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 2: Investment Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <DollarSign className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Investment Terms</h2>
                        <p className="text-gray-500">Define the financial details</p>
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
                            type="text"
                            inputMode="numeric"
                            value={formatWithCommas(formData.minimumInvestment)}
                            onChange={(e) => handleCurrencyChange('minimumInvestment', e.target.value)}
                            placeholder="50,000"
                            className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl focus:ring-0 focus:border-emerald-500 transition-colors ${
                              errors.minimumInvestment ? 'border-red-300' : 'border-gray-200'
                            }`}
                          />
                        </div>
                        {errors.minimumInvestment && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.minimumInvestment}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Total Equity Raise <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatWithCommas(formData.totalEquity)}
                            onChange={(e) => handleCurrencyChange('totalEquity', e.target.value)}
                            placeholder="5,000,000"
                            className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl focus:ring-0 focus:border-emerald-500 transition-colors ${
                              errors.totalEquity ? 'border-red-300' : 'border-gray-200'
                            }`}
                          />
                        </div>
                        {errors.totalEquity && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.totalEquity}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Target IRR <span className="text-gray-400 font-normal">(%)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.targetIrr}
                            onChange={(e) => updateFormData({ targetIrr: e.target.value })}
                            placeholder="18"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500 transition-colors"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Investment Term <span className="text-gray-400 font-normal">(years)</span>
                        </label>
                        <input
                          type="number"
                          value={formData.investmentTerm}
                          onChange={(e) => updateFormData({ investmentTerm: e.target.value })}
                          placeholder="5"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500 transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Preferred Return <span className="text-gray-400 font-normal">(%)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.preferredReturn}
                            onChange={(e) => updateFormData({ preferredReturn: e.target.value })}
                            placeholder="8"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500 transition-colors"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Equity Multiple <span className="text-gray-400 font-normal">(e.g., 2.0x)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={formData.equityMultiple}
                            onChange={(e) => updateFormData({ equityMultiple: e.target.value })}
                            placeholder="2.0"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500 transition-colors"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">x</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Closing Date */}
                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Investment Deadline <span className="text-gray-400 font-normal">(Optional - when will you stop accepting investors?)</span>
                      </label>
                      <input
                        type="date"
                        value={formData.closingDate}
                        onChange={(e) => updateFormData({ closingDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        A countdown timer will appear on your deal page if set
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Description */}
                {currentStep === 3 && (
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
                    
                    {/* Description */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Investment Description <span className="text-red-500">*</span>
                        </label>
                        <AIContentAssistant
                          onInsert={(content) => updateFormData({ description: content })}
                          contentType="property_description"
                          placeholder="Describe what you want: e.g., 'Write a compelling description for a 200-unit value-add apartment in Dallas with 15% projected IRR'"
                          context={`Property: ${formData.title || 'Untitled'}, Type: ${formData.propertyType}, Location: ${formData.city}, ${formData.state}, Units: ${formData.units || 'Not specified'}, Investment: $${formData.minInvestment?.toLocaleString() || 'TBD'} minimum`}
                          buttonLabel="Generate with AI"
                        />
                      </div>
                      <textarea
                        value={formData.description}
                        onChange={(e) => updateFormData({ description: e.target.value })}
                        rows={6}
                        placeholder="Describe the property, the investment thesis, and why investors should be excited about this opportunity..."
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 focus:border-emerald-500 transition-colors resize-none ${
                          errors.description ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                      <div className="flex justify-between mt-2">
                        {errors.description ? (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.description}
                          </p>
                        ) : (
                          <span />
                        )}
                        <p className="text-sm text-gray-400">
                          {formData.description.length} characters
                        </p>
                      </div>
                    </div>
                    
                    {/* Investment Highlights */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Investment Highlights
                      </label>
                      <p className="text-sm text-gray-500 mb-4">
                        Add key selling points that make this investment attractive
                      </p>
                      
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
                              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500 transition-colors"
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
                
                {/* Step 4: Media */}
                {currentStep === 4 && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-pink-100 rounded-xl">
                        <Camera className="h-6 w-6 text-pink-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Photos & Media</h2>
                        <p className="text-gray-500">Showcase your property with stunning visuals</p>
                      </div>
                    </div>
                    
                    {/* Property Photos Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Camera className="h-5 w-5 text-pink-500" />
                        Property Photos
                      </h3>
                      <ImageGalleryUpload
                        images={formData.images}
                        coverImageIndex={formData.coverImageIndex}
                        onImagesChange={(images) => updateFormData({ images })}
                        onCoverImageChange={(index) => updateFormData({ coverImageIndex: index })}
                      />
                    </div>
                    
                    {/* Video Section */}
                    <div className="border-t pt-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Video className="h-5 w-5 text-red-500" />
                        Property Video
                        <span className="text-sm font-normal text-gray-400">(optional)</span>
                      </h3>
                      
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          YouTube or Vimeo URL
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <Youtube className="h-5 w-5 text-red-500" />
                          </div>
                          <input
                            type="url"
                            value={formData.videoUrl}
                            onChange={(e) => updateFormData({ videoUrl: e.target.value })}
                            placeholder="YouTube or Vimeo URL..."
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-red-400 transition-colors"
                          />
                        </div>
                        
                        {/* Video Preview */}
                        {formData.videoUrl && getVideoEmbedUrl(formData.videoUrl) && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                              <Play className="h-4 w-4" />
                              Video Preview
                            </p>
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
                        
                        {!formData.videoUrl && (
                          <p className="mt-3 text-sm text-gray-500">
                            Adding a video walkthrough can increase investor engagement by 40%
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 5: Review */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-emerald-100 rounded-xl">
                        <CheckCircle className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Review & Publish</h2>
                        <p className="text-gray-500">Check everything before going live</p>
                      </div>
                    </div>
                    
                    {/* Summary Cards */}
                    <div className="space-y-4">
                      {/* Basics */}
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">Property Basics</h3>
                          <button onClick={() => goToStep(0)} className="text-sm text-emerald-600 hover:underline">
                            Edit
                          </button>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-gray-500">Title:</span> {formData.title || '—'}</p>
                          <p><span className="text-gray-500">Type:</span> {formData.propertyType || '—'}</p>
                          <p><span className="text-gray-500">Syndicator:</span> {selectedSyndicator?.company_name || '—'}</p>
                        </div>
                      </div>
                      
                      {/* Location */}
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">Location</h3>
                          <button onClick={() => goToStep(1)} className="text-sm text-emerald-600 hover:underline">
                            Edit
                          </button>
                        </div>
                        <p className="text-sm">
                          {formData.address.street && `${formData.address.street}, `}
                          {formData.address.city}{formData.address.state && `, ${formData.address.state}`}
                          {formData.address.zip && ` ${formData.address.zip}`}
                          {!formData.address.city && '—'}
                        </p>
                      </div>
                      
                      {/* Investment */}
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">Investment Terms</h3>
                          <button onClick={() => goToStep(2)} className="text-sm text-emerald-600 hover:underline">
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p><span className="text-gray-500">Minimum:</span> ${parseInt(formData.minimumInvestment).toLocaleString() || '—'}</p>
                          <p><span className="text-gray-500">Total Raise:</span> ${parseInt(formData.totalEquity).toLocaleString() || '—'}</p>
                          <p><span className="text-gray-500">Target IRR:</span> {formData.targetIrr ? `${formData.targetIrr}%` : '—'}</p>
                          <p><span className="text-gray-500">Term:</span> {formData.investmentTerm ? `${formData.investmentTerm} years` : '—'}</p>
                        </div>
                      </div>
                      
                      {/* Photos & Video */}
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">Photos & Video</h3>
                          <button onClick={() => goToStep(4)} className="text-sm text-emerald-600 hover:underline">
                            Edit
                          </button>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm">
                            {formData.images.length > 0 
                              ? `${formData.images.length} photo${formData.images.length !== 1 ? 's' : ''} uploaded`
                              : 'No photos uploaded'}
                          </p>
                          {formData.images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {formData.images.slice(0, 5).map((image, index) => (
                                <img
                                  key={image.id}
                                  src={image.preview || image.url}
                                  alt={`Photo ${index + 1}`}
                                  className={`w-16 h-16 object-cover rounded-lg flex-shrink-0 ${
                                    index === formData.coverImageIndex ? 'ring-2 ring-emerald-500' : ''
                                  }`}
                                />
                              ))}
                              {formData.images.length > 5 && (
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm flex-shrink-0">
                                  +{formData.images.length - 5}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Video Status */}
                          <div className="flex items-center gap-2 text-sm">
                            <Video className="h-4 w-4 text-gray-400" />
                            {formData.videoUrl ? (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                Video added
                              </span>
                            ) : (
                              <span className="text-gray-400">No video added</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Compliance Disclaimer */}
                    <div className="border-t pt-6 space-y-4">
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          Important Legal Disclaimer
                        </h4>
                        <div className="text-sm text-amber-800 space-y-2">
                          <p>
                            By publishing this listing on EquityMD, you acknowledge and agree that:
                          </p>
                          <ul className="list-disc pl-5 space-y-1 text-amber-700">
                            <li><strong>You are solely responsible</strong> for all content, information, and representations made in this listing.</li>
                            <li>EquityMD is a <strong>marketplace platform only</strong> and does not verify, endorse, or guarantee any deal information.</li>
                            <li>You are responsible for ensuring compliance with all applicable <strong>SEC regulations, state securities laws, and other legal requirements</strong>.</li>
                            <li>You will only offer securities to <strong>accredited investors</strong> as defined by SEC Rule 501.</li>
                            <li>EquityMD is <strong>not a broker-dealer, investment advisor, or funding portal</strong> and does not provide investment advice.</li>
                          </ul>
                        </div>
                      </div>
                      
                      <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-emerald-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={disclaimerAcknowledged}
                          onChange={(e) => setDisclaimerAcknowledged(e.target.checked)}
                          className="mt-1 h-5 w-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-medium text-gray-900">
                            I acknowledge and agree to the above terms
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            I confirm that I am solely responsible for all content in this listing and that I am in compliance with all applicable securities laws and regulations.
                          </p>
                        </div>
                      </label>
                      
                      {errors.submit && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                          <p className="text-red-700 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            {errors.submit}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handlePublish('draft')}
                          disabled={publishing}
                          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                          {publishing ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Save className="h-5 w-5" />
                          )}
                          Save as Draft
                        </button>
                        
                        <button
                          onClick={() => handlePublish('active')}
                          disabled={publishing || !disclaimerAcknowledged}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {publishing ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Sparkles className="h-5 w-5" />
                          )}
                          Publish Now
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-500 text-center">
                        You can always edit your listing after publishing. EquityMD reserves the right to remove any listing that violates our terms of service.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Navigation */}
              {currentStep < 5 && (
                <div className="px-6 lg:px-8 py-4 bg-gray-50 border-t flex justify-between">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                      currentStep === 0 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Previous
                  </button>
                  
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
                  >
                    Continue
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Preview Panel - Desktop */}
          <div className="hidden lg:block w-96 flex-shrink-0">
            <div className="sticky top-24">
              <LivePreview 
                formData={formData} 
                syndicatorName={selectedSyndicator?.company_name}
              />
            </div>
          </div>
        </div>
        
        {/* Mobile Preview Toggle */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-4 bg-slate-800 text-white rounded-full shadow-xl hover:bg-slate-700 transition-colors"
          >
            {showPreview ? <X className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Preview Modal */}
        {showPreview && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40 flex items-end justify-center p-4">
            <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-t-2xl">
              <LivePreview 
                formData={formData} 
                syndicatorName={selectedSyndicator?.company_name}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

