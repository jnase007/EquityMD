import React, { useState, useEffect } from 'react';
import { MessageSquare, Info, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { validatePhoneNumber, formatPhoneNumber } from '../lib/clicksendService';

interface SMSOptInProps {
  userId: string;
  currentPhone?: string;
  currentOptIn?: boolean;
  onUpdate?: (optIn: boolean, phone: string) => void;
}

export function SMSOptIn({ userId, currentPhone = '', currentOptIn = false, onUpdate }: SMSOptInProps) {
  const [phoneNumber, setPhoneNumber] = useState(currentPhone);
  const [smsOptIn, setSmsOptIn] = useState(currentOptIn);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setPhoneNumber(currentPhone);
    setSmsOptIn(currentOptIn);
  }, [currentPhone, currentOptIn]);

  const formatPhoneInput = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as +1-XXX-XXX-XXXX
    if (digits.length >= 10) {
      const formatted = digits.slice(0, 10);
      return `+1-${formatted.slice(0, 3)}-${formatted.slice(3, 6)}-${formatted.slice(6, 10)}`;
    }
    
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setPhoneNumber(formatted);
    setError('');
  };

  const handleOptInChange = async (checked: boolean) => {
    if (checked && !phoneNumber) {
      setError('Please enter a phone number first');
      return;
    }

    if (checked && !validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid US phone number (+1-XXX-XXX-XXXX)');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get user's IP and user agent for compliance logging
      const userAgent = navigator.userAgent;
      
      // Call the database function to handle opt-in with logging
      const { error: dbError } = await supabase.rpc('handle_sms_opt_in', {
        p_user_id: userId,
        p_opt_in: checked,
        p_phone_number: phoneNumber,
        p_user_agent: userAgent
      });

      if (dbError) throw dbError;

      setSmsOptIn(checked);
      setSuccess(checked ? 'SMS alerts enabled successfully!' : 'SMS alerts disabled successfully!');
      
      // Call parent callback
      if (onUpdate) {
        onUpdate(checked, phoneNumber);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err: any) {
      console.error('SMS opt-in error:', err);
      setError(err.message || 'Failed to update SMS preferences');
    } finally {
      setLoading(false);
    }
  };

  const isPhoneValid = phoneNumber && validatePhoneNumber(phoneNumber);

  return (
    <div className="space-y-4">
      {/* Phone Number Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="+1-555-123-4567"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
            phoneNumber && !isPhoneValid ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {phoneNumber && !isPhoneValid && (
          <p className="mt-1 text-sm text-red-600">
            Please enter a valid US phone number format: +1-XXX-XXX-XXXX
          </p>
        )}
      </div>

      {/* SMS Opt-in Checkbox */}
      <div className="relative">
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              id="sms-opt-in"
              type="checkbox"
              checked={smsOptIn}
              onChange={(e) => handleOptInChange(e.target.checked)}
              disabled={loading || !isPhoneValid}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="sms-opt-in" className="text-sm font-medium text-gray-700 flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
              Yes, I want SMS alerts for new CRE deals (2–3 messages/week)
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <Info className="h-4 w-4" />
              </button>
            </label>
            
            {showTooltip && (
              <div className="absolute z-10 mt-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg max-w-xs">
                Get instant deal alerts via text! Be the first to know about new investment opportunities.
              </div>
            )}

            <p className="mt-1 text-xs text-gray-500">
              By checking, you agree to receive texts about deals. Reply STOP to opt out. 
              <a href="/terms" className="text-blue-600 hover:underline ml-1">
                Msg & data rates may apply.
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {loading && (
        <div className="flex items-center text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Updating SMS preferences...
        </div>
      )}

      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center text-sm text-green-600">
          <Check className="h-4 w-4 mr-2" />
          {success}
        </div>
      )}

      {/* SMS Info Box */}
      {smsOptIn && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900">SMS Alerts Enabled</h4>
              <p className="text-sm text-blue-800 mt-1">
                You'll receive 2-3 text messages per week about new commercial real estate investment opportunities.
              </p>
              <p className="text-xs text-blue-700 mt-2">
                <strong>Phone:</strong> {phoneNumber} • 
                <strong className="ml-2">Frequency:</strong> 2-3/week • 
                <strong className="ml-2">Reply STOP:</strong> to opt out anytime
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TCPA Compliance Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs text-gray-600">
          <strong>Privacy & Compliance:</strong> Your phone number is used solely for investment opportunity alerts. 
          We comply with TCPA regulations. You can opt out anytime by replying STOP or updating your preferences here.
        </p>
      </div>
    </div>
  );
} 