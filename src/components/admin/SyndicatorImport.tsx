import React, { useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Papa from 'papaparse';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{name: string; error: string}>;
}

export function SyndicatorImport() {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<ImportResult>({ success: 0, failed: 0, errors: [] });
  const [error, setError] = useState<string | null>(null);

  const downloadTemplate = () => {
    const csvContent = [
      ['company_name', 'company_description', 'years_in_business', 'total_deal_volume', 'state', 'city', 'website_url', 'linkedin_url'],
      ['Summit Capital Partners', 'Leading real estate investment firm...', '15', '1200000000', 'Florida', 'Miami', 'https://summitcapital.com', 'https://linkedin.com/company/summit-capital'],
      ['Horizon Investment Group', 'Focused on industrial and logistics...', '10', '800000000', 'Texas', 'Dallas', 'https://horizoninvest.com', 'https://linkedin.com/company/horizon']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'syndicator_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setResults({ success: 0, failed: 0, errors: [] });

    try {
      const text = await file.text();
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          let success = 0;
          let failed = 0;
          const errors: Array<{name: string; error: string}> = [];

          for (const syndicator of results.data as any[]) {
            try {
              // Create auth user with random password
              const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
              const email = `info@${syndicator.company_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
              
              const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password: tempPassword,
                options: {
                  data: {
                    user_type: 'syndicator'
                  }
                }
              });

              if (authError) throw authError;

              // Create profile
              const { error: profileError } = await supabase
                .from('profiles')
                .insert([{
                  id: authData.user!.id,
                  email,
                  full_name: syndicator.company_name,
                  user_type: 'syndicator',
                  is_verified: true
                }]);

              if (profileError) throw profileError;

              // Create syndicator profile
              const { error: syndicatorError } = await supabase
                .from('syndicator_profiles')
                .insert([{
                  id: authData.user!.id,
                  company_name: syndicator.company_name,
                  company_description: syndicator.company_description,
                  years_in_business: parseInt(syndicator.years_in_business),
                  total_deal_volume: parseFloat(syndicator.total_deal_volume),
                  state: syndicator.state,
                  city: syndicator.city,
                  website_url: syndicator.website_url,
                  linkedin_url: syndicator.linkedin_url,
                  claimable: true
                }]);

              if (syndicatorError) throw syndicatorError;

              success++;
            } catch (error) {
              failed++;
              errors.push({
                name: syndicator.company_name,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          }

          setResults({ success, failed, errors });
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
        <h2 className="text-xl font-bold">Import Syndicators</h2>
        <button
          onClick={downloadTemplate}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <Download className="h-5 w-5 mr-2" />
          Download Template
        </button>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
        <input
          type="file"
          id="file-upload"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <Upload className="h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Click to upload CSV file
          </p>
          <p className="text-xs text-gray-400">
            Required: company_name, company_description, state, city
          </p>
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg mb-6">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {results.success > 0 && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg mb-6">
          <CheckCircle className="h-5 w-5" />
          <span>Successfully imported {results.success} syndicators</span>
        </div>
      )}

      {results.failed > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to import {results.failed} syndicators</span>
          </div>
          <div className="mt-2 space-y-1">
            {results.errors.map((error, index) => (
              <div key={index} className="text-sm text-yellow-700">
                {error.name}: {error.error}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}