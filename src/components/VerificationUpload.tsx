import React, { useState, useRef } from 'react';
import { Shield, Upload, CheckCircle, AlertCircle, FileText, Loader2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VerificationUploadProps {
  syndicatorId: string;
  verificationStatus: string | null | undefined;
  onStatusChange?: (newStatus: string) => void;
}

export function VerificationUpload({ syndicatorId, verificationStatus, onStatusChange }: VerificationUploadProps) {
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [entityDocsFile, setEntityDocsFile] = useState<File | null>(null);
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const govIdRef = useRef<HTMLInputElement>(null);
  const entityDocsRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // If already pending, show under review status
  if (verificationStatus === 'pending') {
    return (
      <div className="bg-gray-800 border border-yellow-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-6 w-6 text-yellow-400" />
          <h3 className="text-xl font-semibold text-white">Verification Under Review</h3>
        </div>
        <p className="text-gray-300">
          Your verification documents have been submitted and are currently under review. 
          We'll review within <strong className="text-white">24-48 hours</strong> and notify you of the result.
        </p>
      </div>
    );
  }

  // If already verified/featured/premium/premier, don't show
  if (verificationStatus && ['verified', 'featured', 'premium', 'premier'].includes(verificationStatus)) {
    return null;
  }

  // Show submitted confirmation
  if (submitted) {
    return (
      <div className="bg-gray-800 border border-green-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="h-6 w-6 text-green-400" />
          <h3 className="text-xl font-semibold text-white">Documents Submitted!</h3>
        </div>
        <p className="text-gray-300">
          We'll review your verification documents within <strong className="text-white">24-48 hours</strong>. 
          You'll be notified once your account is verified.
        </p>
      </div>
    );
  }

  const validateFile = (file: File, label: string): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `${label} must be under 10MB`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!govIdFile) {
      setError('Government ID is required');
      return;
    }
    if (!entityDocsFile) {
      setError('Entity documents are required');
      return;
    }
    if (bio.trim().length < 100) {
      setError('Bio must be at least 100 characters');
      return;
    }

    const govIdError = validateFile(govIdFile, 'Government ID');
    if (govIdError) { setError(govIdError); return; }
    
    const entityError = validateFile(entityDocsFile, 'Entity documents');
    if (entityError) { setError(entityError); return; }

    setSubmitting(true);

    try {
      // Upload government ID
      const govIdExt = govIdFile.name.split('.').pop() || 'pdf';
      const { error: govUploadError } = await supabase.storage
        .from('verification-docs')
        .upload(`${syndicatorId}/gov-id.${govIdExt}`, govIdFile, { upsert: true });

      if (govUploadError) throw new Error(`Failed to upload Government ID: ${govUploadError.message}`);

      // Upload entity docs
      const entityExt = entityDocsFile.name.split('.').pop() || 'pdf';
      const { error: entityUploadError } = await supabase.storage
        .from('verification-docs')
        .upload(`${syndicatorId}/entity-docs.${entityExt}`, entityDocsFile, { upsert: true });

      if (entityUploadError) throw new Error(`Failed to upload Entity Documents: ${entityUploadError.message}`);

      // Update syndicator verification status to pending
      const { error: updateError } = await supabase
        .from('syndicators')
        .update({ 
          verification_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', syndicatorId);

      if (updateError) throw new Error(`Failed to update verification status: ${updateError.message}`);

      // Insert verification history record
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('syndicator_verification_history')
        .insert({
          syndicator_id: syndicatorId,
          previous_status: verificationStatus || 'unverified',
          new_status: 'pending',
          changed_by: user?.id,
          admin_notes: `Bio/Track Record: ${bio.substring(0, 500)}`
        });

      setSubmitted(true);
      onStatusChange?.('pending');
    } catch (err: any) {
      console.error('Verification submission error:', err);
      setError(err.message || 'Failed to submit verification documents');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="h-6 w-6 text-blue-400" />
        <h3 className="text-xl font-semibold text-white">Verify Your Account</h3>
      </div>
      <p className="text-gray-400 mb-6">
        Submit verification documents to list deals on EquityMD. Verification is required before you can create deal listings.
      </p>

      <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 mb-6">
        <p className="text-blue-300 text-sm">
          🇺🇸 EquityMD is currently available for US-based entities only.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 mb-4 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Government ID */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Government ID <span className="text-red-400">*</span>
          </label>
          <p className="text-gray-500 text-xs mb-2">US driver's license or passport (image or PDF, max 10MB)</p>
          <div 
            onClick={() => govIdRef.current?.click()}
            className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <input
              ref={govIdRef}
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setGovIdFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            {govIdFile ? (
              <div className="flex items-center justify-center gap-2 text-green-400">
                <FileText className="h-5 w-5" />
                <span className="text-sm">{govIdFile.name}</span>
              </div>
            ) : (
              <div className="text-gray-400">
                <Upload className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm">Click to upload</span>
              </div>
            )}
          </div>
        </div>

        {/* Entity Documents */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Entity Documents <span className="text-red-400">*</span>
          </label>
          <p className="text-gray-500 text-xs mb-2">Articles of Incorporation, LLC Operating Agreement, or Certificate of Formation (PDF, max 10MB)</p>
          <div 
            onClick={() => entityDocsRef.current?.click()}
            className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <input
              ref={entityDocsRef}
              type="file"
              accept=".pdf"
              onChange={(e) => setEntityDocsFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            {entityDocsFile ? (
              <div className="flex items-center justify-center gap-2 text-green-400">
                <FileText className="h-5 w-5" />
                <span className="text-sm">{entityDocsFile.name}</span>
              </div>
            ) : (
              <div className="text-gray-400">
                <Upload className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm">Click to upload</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio / Track Record */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bio / Track Record <span className="text-red-400">*</span>
          </label>
          <p className="text-gray-500 text-xs mb-2">Describe your CRE experience and completed deals (minimum 100 characters)</p>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Describe your commercial real estate experience, completed deals, and track record..."
          />
          <div className="text-right mt-1">
            <span className={`text-xs ${bio.trim().length >= 100 ? 'text-green-400' : 'text-gray-500'}`}>
              {bio.trim().length}/100 min characters
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              Submit for Verification
            </>
          )}
        </button>
      </form>
    </div>
  );
}
