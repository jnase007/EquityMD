import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { importFromCashflowPortal } from '../../lib/importers/cashflowportal';
import { importFromAppFolio } from '../../lib/importers/appfolio';
import Papa from 'papaparse';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{title: string; error: string}>;
}

type ImportSource = 'custom' | 'cashflowportal' | 'appfolio';

export function PropertyImport() {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<ImportResult>({ success: 0, failed: 0, errors: [] });
  const [error, setError] = useState<string | null>(null);
  const [importSource, setImportSource] = useState<ImportSource>('custom');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setResults({ success: 0, failed: 0, errors: [] });

    try {
      const text = await file.text();
      let properties;

      switch (importSource) {
        case 'cashflowportal':
          properties = await importFromCashflowPortal(text);
          break;
        case 'appfolio':
          properties = await importFromAppFolio(text);
          break;
        default:
          properties = await new Promise((resolve) => {
            Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => resolve(results.data)
            });
          });
      }

      let success = 0;
      let failed = 0;
      const errors: Array<{title: string; error: string}> = [];

      for (const property of properties) {
        try {
          const { error: insertError } = await supabase
            .from('deals')
            .insert([{
              ...property,
              status: 'draft'
            }]);

          if (insertError) throw insertError;
          success++;
        } catch (error) {
          failed++;
          errors.push({
            title: property.title,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      setResults({ success, failed, errors });
    } catch (error) {
      console.error('Error processing file:', error);
      setError('Error processing file. Please check the format and try again.');
    } finally {
      setUploading(false);
      if (event.target.value) {
        event.target.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    let template: string[][];

    switch (importSource) {
      case 'cashflowportal':
        template = [
          ['propertyName', 'propertyType', 'location', 'minimumInvestment', 'targetIRR', 'holdPeriod', 'totalEquity', 'description', 'propertyUrl', 'propertyId'],
          ['The Metropolitan', 'multifamily', 'Austin, TX', '50000', '18', '5', '25000000', 'Luxury apartment complex...', 'https://example.com/property', 'CP123']
        ];
        break;
      case 'appfolio':
        template = [
          ['name', 'type', 'address', 'city', 'state', 'units', 'squareFeet', 'listPrice', 'capRate', 'yearBuilt', 'propertyId', 'url'],
          ['Park Place Apartments', 'apartment', '123 Main St', 'Austin', 'TX', '200', '180000', '25000000', '5.5', '2010', 'AP456', 'https://example.com/property']
        ];
        break;
      default:
        template = [
          ['title', 'property_type', 'location', 'minimum_investment', 'target_irr', 'investment_term', 'total_equity', 'description'],
          ['The Metropolitan', 'Multi-Family', 'Austin, TX', '50000', '18', '5', '25000000', 'Luxury apartment complex...']
        ];
    }

    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${importSource}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Import Properties</h2>
        <button
          onClick={downloadTemplate}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <Download className="h-5 w-5 mr-2" />
          Download Template
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Import Source
        </label>
        <select
          value={importSource}
          onChange={(e) => setImportSource(e.target.value as ImportSource)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="custom">Custom CSV</option>
          <option value="cashflowportal">CashflowPortal</option>
          <option value="appfolio">AppFolio</option>
        </select>
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
            Click to upload {importSource === 'custom' ? 'CSV file' : `${importSource} export`}
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
          <span>Successfully imported {results.success} properties</span>
        </div>
      )}

      {results.failed > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to import {results.failed} properties</span>
          </div>
          <div className="mt-2 space-y-1">
            {results.errors.map((error, index) => (
              <div key={index} className="text-sm text-yellow-700">
                {error.title}: {error.error}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}