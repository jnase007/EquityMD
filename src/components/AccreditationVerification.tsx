import React, { useState, useEffect } from 'react';
import { 
  Shield, CheckCircle, Clock, AlertCircle, Upload, 
  FileText, X, Loader2, DollarSign, Briefcase, 
  Award, ChevronRight, Lock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

type AccreditationStatus = 'not_started' | 'pending' | 'verified' | 'expired' | 'rejected';
type AccreditationMethod = 'income' | 'net_worth' | 'professional' | 'entity';

interface AccreditationData {
  id: string;
  user_id: string;
  status: AccreditationStatus;
  method: AccreditationMethod | null;
  verification_date: string | null;
  expiration_date: string | null;
  documents: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const ACCREDITATION_METHODS = [
  {
    id: 'income',
    title: 'Income Test',
    description: 'Annual income exceeding $200K (or $300K with spouse) for the past 2 years',
    icon: DollarSign,
    requirements: ['Tax returns or W-2s for past 2 years', 'CPA or attorney letter (optional)'],
  },
  {
    id: 'net_worth',
    title: 'Net Worth Test',
    description: 'Net worth exceeding $1 million, excluding primary residence',
    icon: Briefcase,
    requirements: ['Bank statements', 'Investment account statements', 'Property valuations (if applicable)'],
  },
  {
    id: 'professional',
    title: 'Professional Certification',
    description: 'Hold Series 7, Series 65, or Series 82 license',
    icon: Award,
    requirements: ['Copy of active license', 'FINRA BrokerCheck verification'],
  },
  {
    id: 'entity',
    title: 'Entity Investor',
    description: 'Trust, LLC, or corporation with assets exceeding $5 million',
    icon: Shield,
    requirements: ['Entity formation documents', 'Financial statements', 'Authorized signatory documentation'],
  },
];

export function AccreditationVerification() {
  const { user, profile } = useAuthStore();
  const [accreditation, setAccreditation] = useState<AccreditationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVerificationFlow, setShowVerificationFlow] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selfCertify, setSelfCertify] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAccreditationStatus();
    }
  }, [user]);

  async function fetchAccreditationStatus() {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('investor_accreditation')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setAccreditation(data);
      }
    } catch (error) {
      // No accreditation record yet
    } finally {
      setLoading(false);
    }
  }

  async function submitVerification() {
    if (!user || !selectedMethod) return;

    setSubmitting(true);
    try {
      // Upload documents
      const documentUrls: string[] = [];
      for (const file of uploadedFiles) {
        const fileName = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('accreditation-docs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('accreditation-docs')
          .getPublicUrl(fileName);

        documentUrls.push(publicUrl);
      }

      // Create or update accreditation record
      const accreditationData = {
        user_id: user.id,
        status: selfCertify ? 'verified' : 'pending' as AccreditationStatus,
        method: selectedMethod as AccreditationMethod,
        documents: documentUrls,
        verification_date: selfCertify ? new Date().toISOString() : null,
        expiration_date: selfCertify 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
          : null,
        updated_at: new Date().toISOString(),
      };

      if (accreditation) {
        const { error } = await supabase
          .from('investor_accreditation')
          .update(accreditationData)
          .eq('id', accreditation.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('investor_accreditation')
          .insert(accreditationData);

        if (error) throw error;
      }

      toast.success(selfCertify 
        ? 'Accreditation verified! You can now invest in deals.'
        : 'Verification submitted! We\'ll review your documents within 24-48 hours.'
      );
      
      setShowVerificationFlow(false);
      fetchAccreditationStatus();
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      toast.error(error.message || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  }

  const getStatusBadge = () => {
    if (!accreditation) return null;

    switch (accreditation.status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
            Accredited Investor
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            <Clock className="h-4 w-4" />
            Verification Pending
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            <AlertCircle className="h-4 w-4" />
            Verification Expired
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <X className="h-4 w-4" />
            Verification Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  // Already verified
  if (accreditation?.status === 'verified') {
    const expirationDate = accreditation.expiration_date 
      ? new Date(accreditation.expiration_date)
      : null;
    const isExpiringSoon = expirationDate && 
      expirationDate.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000; // 30 days

    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">Accredited Investor</h3>
                {getStatusBadge()}
              </div>
              <p className="text-green-700 text-sm">
                You're verified to invest in private placement offerings.
              </p>
              {expirationDate && (
                <p className={`text-sm mt-2 ${isExpiringSoon ? 'text-orange-600' : 'text-gray-500'}`}>
                  {isExpiringSoon ? '⚠️ ' : ''}
                  Expires: {expirationDate.toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          
          {isExpiringSoon && (
            <button
              onClick={() => setShowVerificationFlow(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Renew Verification
            </button>
          )}
        </div>
      </div>
    );
  }

  // Pending verification
  if (accreditation?.status === 'pending') {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-yellow-100 rounded-xl">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">Verification In Progress</h3>
              {getStatusBadge()}
            </div>
            <p className="text-yellow-700 text-sm">
              We're reviewing your documents. This typically takes 24-48 hours.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Submitted: {new Date(accreditation.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not verified - show CTA
  if (!showVerificationFlow) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-white" />
            <div>
              <h3 className="text-lg font-semibold text-white">Accreditation Required</h3>
              <p className="text-blue-100 text-sm">Verify your status to invest in deals</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            SEC regulations require investors in private placements to be "accredited investors." 
            Complete a quick verification to unlock investment opportunities.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Income $200K+</p>
              <p className="text-xs text-gray-500">or $300K with spouse</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Briefcase className="h-5 w-5 text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Net Worth $1M+</p>
              <p className="text-xs text-gray-500">excluding primary residence</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowVerificationFlow(true)}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Get Verified
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // Verification flow
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-white" />
            <h3 className="text-lg font-semibold text-white">Verify Accreditation</h3>
          </div>
          <button
            onClick={() => setShowVerificationFlow(false)}
            className="text-white/80 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {!selectedMethod ? (
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">Select how you qualify as an accredited investor:</p>
            
            {ACCREDITATION_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <method.icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{method.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedMethod(null)}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
            >
              ← Back to methods
            </button>
            
            {(() => {
              const method = ACCREDITATION_METHODS.find(m => m.id === selectedMethod);
              if (!method) return null;
              
              return (
                <>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <method.icon className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{method.title}</h4>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Required Documents:</h5>
                    <ul className="space-y-2">
                      {method.requirements.map((req, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="h-4 w-4 text-gray-400" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload Documents (optional for self-certification)
                    </label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                      {uploadedFiles.length > 0 ? (
                        <div className="space-y-2">
                          {uploadedFiles.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-600">{file.name}</span>
                              <button
                                onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <label className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm">
                            + Add more files
                            <input
                              type="file"
                              multiple
                              onChange={(e) => {
                                if (e.target.files) {
                                  setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                                }
                              }}
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Click to upload documents</p>
                          <p className="text-sm text-gray-400">PDF, JPG, or PNG</p>
                          <input
                            type="file"
                            multiple
                            onChange={(e) => {
                              if (e.target.files) {
                                setUploadedFiles(Array.from(e.target.files));
                              }
                            }}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  
                  {/* Self-Certification Option */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selfCertify}
                        onChange={(e) => setSelfCertify(e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-amber-800">Self-Certification</p>
                        <p className="text-sm text-amber-700 mt-1">
                          I certify under penalty of perjury that I qualify as an accredited investor 
                          under SEC Rule 501 and understand that syndicators may require additional 
                          verification before accepting my investment.
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  <button
                    onClick={submitVerification}
                    disabled={(!selfCertify && uploadedFiles.length === 0) || submitting}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        {selfCertify ? 'Verify & Continue' : 'Submit for Review'}
                      </>
                    )}
                  </button>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

