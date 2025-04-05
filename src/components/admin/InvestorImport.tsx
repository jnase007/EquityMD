import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, Mail, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Papa from 'papaparse';

interface ImportedInvestor {
  email: string;
  full_name: string;
  specialty?: string;
  hospital?: string;
  city?: string;
  state?: string;
  accredited?: string;
  minimum_investment?: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{email: string; error: string}>;
  emails: string[];
}

export function InvestorImport() {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<ImportResult>({ 
    success: 0, 
    failed: 0, 
    errors: [],
    emails: [] 
  });
  const [error, setError] = useState<string | null>(null);

  const downloadTemplate = () => {
    const csvContent = [
      ['email', 'full_name', 'specialty', 'hospital', 'city', 'state', 'accredited', 'minimum_investment'],
      ['john.doe@example.com', 'John Doe', 'Cardiology', 'City Hospital', 'New York', 'NY', 'true', '100000'],
      ['jane.smith@example.com', 'Jane Smith', 'Oncology', 'Memorial Hospital', 'Los Angeles', 'CA', 'true', '250000']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'investor_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const validateInvestor = (investor: ImportedInvestor): string | null => {
    if (!investor.email?.includes('@')) {
      return 'Invalid email address';
    }
    if (!investor.full_name?.trim()) {
      return 'Full name is required';
    }
    return null;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setResults({ success: 0, failed: 0, errors: [], emails: [] });

    try {
      const text = await file.text();
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const investors = results.data as ImportedInvestor[];
          let success = 0;
          let failed = 0;
          const emails: string[] = [];
          const errors: Array<{email: string; error: string}> = [];

          for (const investor of investors) {
            try {
              const validationError = validateInvestor(investor);
              if (validationError) {
                throw new Error(validationError);
              }

              // Create auth user with random password
              const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
              const { data: authData, error: authError } = await supabase.auth.signUp({
                email: investor.email,
                password: tempPassword,
                options: {
                  data: {
                    full_name: investor.full_name,
                    user_type: 'investor'
                  }
                }
              });

              if (authError) throw authError;

              // Create profile
              const { error: profileError } = await supabase
                .from('profiles')
                .insert([{
                  id: authData.user!.id,
                  email: investor.email,
                  full_name: investor.full_name,
                  user_type: 'investor',
                  is_verified: true
                }]);

              if (profileError) throw profileError;

              // Create investor profile
              const { error: investorError } = await supabase
                .from('investor_profiles')
                .insert([{
                  id: authData.user!.id,
                  accredited_status: investor.accredited?.toLowerCase() === 'true',
                  minimum_investment: parseInt(investor.minimum_investment || '0'),
                  investment_preferences: {
                    specialty: investor.specialty,
                    hospital: investor.hospital,
                    location: `${investor.city}, ${investor.state}`
                  }
                }]);

              if (investorError) throw investorError;

              // Send invitation email
              await supabase.functions.invoke('send-email', {
                body: {
                  to: investor.email,
                  subject: 'Welcome to EquityMD',
                  content: `
Welcome to EquityMD!

Your account has been created. Please use the following temporary password to log in:

${tempPassword}

For security reasons, please change your password immediately after logging in.

Best regards,
The EquityMD Team
                  `,
                  type: 'invitation'
                }
              });

              success++;
              emails.push(investor.email);
            } catch (error) {
              failed++;
              errors.push({
                email: investor.email,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          }

          setResults({ success, failed, errors, emails });
        }
      });
    } catch (error) {
      console.error('Error processing CSV:', error);
      setError('Error processing CSV file. Please check the format and try again.');
    } finally {
      setUploading(false);
      if (event.target.value) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Import Investors</h2>
        <button
          onClick={downloadTemplate}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <Download className="h-5 w-5 mr-2" />
          Download Template
        </button>
      </div>

      <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            id="csv-upload"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="csv-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Click to upload CSV file
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Required: email, full_name
            </p>
            <p className="text-xs text-gray-400">
              Optional: specialty, hospital, city, state, accredited, minimum_investment
            </p>
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg mb-6">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {results.success > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span>Successfully imported {results.success} investors</span>
          </div>

          {results.failed > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-600 mb-2">
                <AlertCircle className="h-5 w-5" />
                <span>Failed to import {results.failed} investors</span>
              </div>
              <div className="mt-2 space-y-1">
                {results.errors.map((error, index) => (
                  <div key={index} className="text-sm text-yellow-700">
                    {error.email}: {error.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5 text-gray-600" />
              <span className="font-medium">Welcome emails sent to:</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              {results.emails.map(email => (
                <div key={email}>{email}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}