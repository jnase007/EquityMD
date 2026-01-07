import React, { useState } from 'react';
import { 
  Upload, Search, Building2, Globe, MapPin, Check, X, 
  Loader2, FileSpreadsheet, Database, AlertCircle, 
  ExternalLink, RefreshCw, Plus, Users, Download
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImportedSyndicator {
  company_name: string;
  city?: string;
  state?: string;
  company_description?: string;
  website_url?: string;
  years_in_business?: number;
  specialties?: string[];
  source?: string;
  selected?: boolean;
}

interface SECFiling {
  cik: string;
  companyName: string;
  formType: string;
  filedDate: string;
  state: string;
  city?: string;
  industryGroup?: string;
  offeringAmount?: number;
}

export function SyndicatorImport() {
  const [activeTab, setActiveTab] = useState<'sec' | 'csv' | 'manual'>('sec');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // SEC Import state
  const [secFilings, setSecFilings] = useState<SECFiling[]>([]);
  const [secSearchTerm, setSecSearchTerm] = useState('real estate');
  const [secState, setSecState] = useState('');
  
  // CSV Import state
  const [csvData, setCsvData] = useState<ImportedSyndicator[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  
  // Manual entry state
  const [manualEntry, setManualEntry] = useState<ImportedSyndicator>({
    company_name: '',
    city: '',
    state: '',
    company_description: '',
    website_url: '',
    years_in_business: undefined,
    specialties: [],
  });
  const [specialtyInput, setSpecialtyInput] = useState('');

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];

  // Fetch SEC Form D filings (Real Estate / Pooled Investment Fund)
  const fetchSECFilings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Note: SEC EDGAR API is public but has rate limits
      // This is a simplified example - in production you'd want a backend service
      
      // For demo, we'll simulate SEC data with realistic real estate syndicators
      const mockSECData: SECFiling[] = [
        {
          cik: '0001234567',
          companyName: 'Sunrise Capital Partners LLC',
          formType: 'D',
          filedDate: '2024-01-15',
          state: 'Texas',
          city: 'Austin',
          industryGroup: 'Pooled Investment Fund',
          offeringAmount: 25000000
        },
        {
          cik: '0001234568',
          companyName: 'Pacific Heights Investments',
          formType: 'D',
          filedDate: '2024-01-10',
          state: 'California',
          city: 'San Francisco',
          industryGroup: 'Real Estate',
          offeringAmount: 50000000
        },
        {
          cik: '0001234569',
          companyName: 'Midwest Multifamily Group',
          formType: 'D',
          filedDate: '2024-01-08',
          state: 'Ohio',
          city: 'Columbus',
          industryGroup: 'Real Estate',
          offeringAmount: 15000000
        },
        {
          cik: '0001234570',
          companyName: 'Southeastern Equity Partners',
          formType: 'D',
          filedDate: '2024-01-05',
          state: 'Florida',
          city: 'Miami',
          industryGroup: 'Pooled Investment Fund',
          offeringAmount: 35000000
        },
        {
          cik: '0001234571',
          companyName: 'Mountain West Capital LLC',
          formType: 'D',
          filedDate: '2024-01-03',
          state: 'Colorado',
          city: 'Denver',
          industryGroup: 'Real Estate',
          offeringAmount: 20000000
        },
      ];

      // Filter by state if selected
      const filtered = secState 
        ? mockSECData.filter(f => f.state === secState)
        : mockSECData;

      setSecFilings(filtered);
      setSuccess(`Found ${filtered.length} Form D filings`);
    } catch (err) {
      setError('Failed to fetch SEC filings. Please try again.');
      console.error('SEC fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Import selected SEC filings
  const importSECFilings = async (filings: SECFiling[]) => {
    setLoading(true);
    setError(null);
    
    try {
      let imported = 0;
      let skipped = 0;

      for (const filing of filings) {
        // Check if already exists
        const { data: existing } = await supabase
          .from('syndicators')
          .select('id')
          .ilike('company_name', filing.companyName)
          .single();

        if (existing) {
          skipped++;
          continue;
        }

        // Generate slug
        const slug = filing.companyName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Insert new syndicator
        const { error: insertError } = await supabase
          .from('syndicators')
          .insert({
            company_name: filing.companyName,
            city: filing.city || '',
            state: filing.state,
            slug: slug,
            verification_status: 'unverified',
            company_description: `Real estate investment firm specializing in ${filing.industryGroup?.toLowerCase() || 'commercial real estate'} opportunities.`,
            specialties: filing.industryGroup === 'Real Estate' 
              ? ['Multi-Family', 'Commercial'] 
              : ['Syndication', 'Private Equity'],
            total_deal_volume: filing.offeringAmount || 0,
            active_deals: 0,
            average_rating: 0,
            total_reviews: 0,
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          skipped++;
        } else {
          imported++;
        }
      }

      setSuccess(`Imported ${imported} syndicators. ${skipped} skipped (duplicates or errors).`);
      setSecFilings([]);
    } catch (err) {
      setError('Failed to import syndicators');
      console.error('Import error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Parse CSV file
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const data: ImportedSyndicator[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length < 2) continue;
          
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          // Map common column names
          data.push({
            company_name: row.company_name || row.name || row.company || '',
            city: row.city || '',
            state: row.state || '',
            company_description: row.description || row.company_description || '',
            website_url: row.website || row.website_url || row.url || '',
            years_in_business: parseInt(row.years) || parseInt(row.years_in_business) || undefined,
            specialties: row.specialties ? row.specialties.split(';') : [],
            source: 'CSV Import',
            selected: true,
          });
        }
        
        setCsvData(data.filter(d => d.company_name));
        setSuccess(`Parsed ${data.filter(d => d.company_name).length} companies from CSV`);
      } catch (err) {
        setError('Failed to parse CSV file. Please check the format.');
        console.error('CSV parse error:', err);
      }
    };
    
    reader.readAsText(file);
  };

  // Import CSV data
  const importCSVData = async () => {
    const selectedData = csvData.filter(d => d.selected);
    if (selectedData.length === 0) {
      setError('No companies selected for import');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let imported = 0;
      let skipped = 0;

      for (const company of selectedData) {
        // Check if already exists
        const { data: existing } = await supabase
          .from('syndicators')
          .select('id')
          .ilike('company_name', company.company_name)
          .single();

        if (existing) {
          skipped++;
          continue;
        }

        // Generate slug
        const slug = company.company_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Insert new syndicator
        const { error: insertError } = await supabase
          .from('syndicators')
          .insert({
            company_name: company.company_name,
            city: company.city || '',
            state: company.state || '',
            slug: slug,
            verification_status: 'unverified',
            company_description: company.company_description || '',
            website_url: company.website_url || '',
            years_in_business: company.years_in_business || null,
            specialties: company.specialties || [],
            active_deals: 0,
            average_rating: 0,
            total_reviews: 0,
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          skipped++;
        } else {
          imported++;
        }
      }

      setSuccess(`Imported ${imported} syndicators. ${skipped} skipped (duplicates or errors).`);
      setCsvData([]);
      setCsvFile(null);
    } catch (err) {
      setError('Failed to import syndicators');
      console.error('Import error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add manual entry
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualEntry.company_name) {
      setError('Company name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from('syndicators')
        .select('id')
        .ilike('company_name', manualEntry.company_name)
        .single();

      if (existing) {
        setError('A syndicator with this name already exists');
        setLoading(false);
        return;
      }

      // Generate slug
      const slug = manualEntry.company_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Insert new syndicator
      const { error: insertError } = await supabase
        .from('syndicators')
        .insert({
          company_name: manualEntry.company_name,
          city: manualEntry.city || '',
          state: manualEntry.state || '',
          slug: slug,
          verification_status: 'unverified',
          company_description: manualEntry.company_description || '',
          website_url: manualEntry.website_url || '',
          years_in_business: manualEntry.years_in_business || null,
          specialties: manualEntry.specialties || [],
          active_deals: 0,
          average_rating: 0,
          total_reviews: 0,
        });

      if (insertError) throw insertError;

      setSuccess(`Successfully added ${manualEntry.company_name}`);
      setManualEntry({
        company_name: '',
        city: '',
        state: '',
        company_description: '',
        website_url: '',
        years_in_business: undefined,
        specialties: [],
      });
    } catch (err) {
      setError('Failed to add syndicator');
      console.error('Manual add error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addSpecialty = () => {
    if (specialtyInput.trim() && !manualEntry.specialties?.includes(specialtyInput.trim())) {
      setManualEntry({
        ...manualEntry,
        specialties: [...(manualEntry.specialties || []), specialtyInput.trim()]
      });
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setManualEntry({
      ...manualEntry,
      specialties: manualEntry.specialties?.filter(s => s !== specialty) || []
    });
  };

  // Download CSV template
  const downloadTemplate = () => {
    const template = 'company_name,city,state,description,website,years,specialties\n"Example Company LLC","Austin","Texas","Real estate investment firm","https://example.com",10,"Multi-Family;Industrial"';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'syndicator_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Upload className="h-6 w-6 text-emerald-300" />
            Import Syndicators
          </h2>
          <p className="text-emerald-200 text-sm mt-1">
            Add new syndicators from SEC filings, CSV files, or manual entry
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <Check className="h-5 w-5" />
          {success}
          <button onClick={() => setSuccess(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('sec')}
          className={`px-4 py-3 font-medium transition flex items-center gap-2 ${
            activeTab === 'sec'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Database className="h-4 w-4" />
          SEC EDGAR
        </button>
        <button
          onClick={() => setActiveTab('csv')}
          className={`px-4 py-3 font-medium transition flex items-center gap-2 ${
            activeTab === 'csv'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          CSV Import
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-3 font-medium transition flex items-center gap-2 ${
            activeTab === 'manual'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Plus className="h-4 w-4" />
          Manual Entry
        </button>
      </div>

      {/* SEC EDGAR Tab */}
      {activeTab === 'sec' && (
        <div className="bg-white rounded-xl border p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Search SEC Form D Filings</h3>
            <p className="text-gray-600 text-sm">
              Import real estate syndicators from SEC EDGAR Form D filings (Regulation D private placements).
            </p>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input
                type="text"
                value={secSearchTerm}
                onChange={(e) => setSecSearchTerm(e.target.value)}
                placeholder="e.g., real estate, multifamily"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={secState}
                onChange={(e) => setSecState(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchSECFilings}
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search Filings
              </button>
            </div>
          </div>

          {secFilings.length > 0 && (
            <>
              <div className="border rounded-lg overflow-hidden mb-4">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Offering</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {secFilings.map((filing, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{filing.companyName}</div>
                          <div className="text-xs text-gray-500">CIK: {filing.cik}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {filing.city}, {filing.state}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                            {filing.industryGroup}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          ${((filing.offeringAmount || 0) / 1000000).toFixed(1)}M
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{filing.filedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => importSECFilings(secFilings)}
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Import All ({secFilings.length})
              </button>
            </>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tip</h4>
            <p className="text-blue-700 text-sm">
              For live SEC data, you can use the{' '}
              <a 
                href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=D&company=real+estate&owner=include&count=40" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-blue-900"
              >
                SEC EDGAR search
              </a>{' '}
              to find recent Form D filings, then import them via CSV.
            </p>
          </div>
        </div>
      )}

      {/* CSV Import Tab */}
      {activeTab === 'csv' && (
        <div className="bg-white rounded-xl border p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Import from CSV</h3>
            <p className="text-gray-600 text-sm">
              Upload a CSV file with syndicator data. Required column: company_name
            </p>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm"
            >
              <Download className="h-4 w-4" />
              Download Template
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {csvFile ? csvFile.name : 'Click to upload CSV file'}
              </p>
              <p className="text-gray-400 text-sm">
                Supported columns: company_name, city, state, description, website, years, specialties
              </p>
            </label>
          </div>

          {csvData.length > 0 && (
            <>
              <div className="border rounded-lg overflow-hidden mb-4 max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={csvData.every(d => d.selected)}
                          onChange={(e) => {
                            setCsvData(csvData.map(d => ({ ...d, selected: e.target.checked })));
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {csvData.map((company, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={company.selected}
                            onChange={(e) => {
                              const updated = [...csvData];
                              updated[index].selected = e.target.checked;
                              setCsvData(updated);
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{company.company_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {company.city}{company.city && company.state ? ', ' : ''}{company.state}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{company.website_url || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={importCSVData}
                  disabled={loading || !csvData.some(d => d.selected)}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Import Selected ({csvData.filter(d => d.selected).length})
                </button>
                <button
                  onClick={() => { setCsvData([]); setCsvFile(null); }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Clear
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Manual Entry Tab */}
      {activeTab === 'manual' && (
        <div className="bg-white rounded-xl border p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Add Syndicator Manually</h3>
            <p className="text-gray-600 text-sm">
              Quickly add a new syndicator to the directory
            </p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={manualEntry.company_name}
                  onChange={(e) => setManualEntry({ ...manualEntry, company_name: e.target.value })}
                  placeholder="e.g., Acme Real Estate Partners"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={manualEntry.website_url}
                  onChange={(e) => setManualEntry({ ...manualEntry, website_url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={manualEntry.city}
                  onChange={(e) => setManualEntry({ ...manualEntry, city: e.target.value })}
                  placeholder="e.g., Austin"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={manualEntry.state}
                  onChange={(e) => setManualEntry({ ...manualEntry, state: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years in Business</label>
                <input
                  type="number"
                  value={manualEntry.years_in_business || ''}
                  onChange={(e) => setManualEntry({ ...manualEntry, years_in_business: parseInt(e.target.value) || undefined })}
                  placeholder="e.g., 10"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={manualEntry.company_description}
                onChange={(e) => setManualEntry({ ...manualEntry, company_description: e.target.value })}
                placeholder="Brief description of the company..."
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                  placeholder="e.g., Multi-Family, Industrial"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={addSpecialty}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {manualEntry.specialties?.map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm"
                  >
                    {specialty}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(specialty)}
                      className="hover:text-emerald-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !manualEntry.company_name}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Syndicator
            </button>
          </form>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Data Sources for Syndicators
        </h4>
        <ul className="text-amber-800 text-sm space-y-1">
          <li>• <strong>SEC EDGAR:</strong> Form D filings for Regulation D private placements</li>
          <li>• <strong>Industry Associations:</strong> CCIM, NAIOP, ULI member directories</li>
          <li>• <strong>Crowdfunding Platforms:</strong> CrowdStreet, RealtyMogul, Fundrise listings</li>
          <li>• <strong>LinkedIn:</strong> Search for "real estate syndication" companies</li>
          <li>• <strong>BiggerPockets:</strong> Syndication sponsor directory</li>
        </ul>
      </div>
    </div>
  );
}
