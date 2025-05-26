import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';

interface InvestmentRangeSelectorProps {
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
}

const PREDEFINED_RANGES = [
  { label: '$25,000', value: 25000 },
  { label: '$50,000', value: 50000 },
  { label: '$100,000', value: 100000 },
  { label: '$250,000', value: 250000 },
  { label: '$500,000', value: 500000 },
  { label: '$1,000,000', value: 1000000 },
  { label: '$2,500,000', value: 2500000 },
  { label: '$5,000,000+', value: 5000000 },
];

// Format number with commas
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Parse formatted string back to number
const parseFormattedNumber = (str: string): number => {
  return parseInt(str.replace(/,/g, '')) || 0;
};

export function InvestmentRangeSelector({ value, onChange, className = '' }: InvestmentRangeSelectorProps) {
  const [mode, setMode] = useState<'predefined' | 'custom'>('predefined');
  const [customValue, setCustomValue] = useState('');
  const [selectedRange, setSelectedRange] = useState('');

  useEffect(() => {
    const numValue = typeof value === 'string' ? parseFormattedNumber(value) : value;
    
    // Check if current value matches a predefined range
    const matchingRange = PREDEFINED_RANGES.find(range => range.value === numValue);
    
    if (matchingRange) {
      setMode('predefined');
      setSelectedRange(matchingRange.value.toString());
    } else {
      setMode('custom');
      setCustomValue(numValue ? formatNumber(numValue) : '');
    }
  }, [value]);

  const handlePredefinedChange = (rangeValue: string) => {
    setSelectedRange(rangeValue);
    setMode('predefined');
    onChange(rangeValue);
  };

  const handleCustomChange = (inputValue: string) => {
    // Remove non-numeric characters except commas
    const cleanValue = inputValue.replace(/[^\d,]/g, '');
    
    // Parse and reformat to ensure proper comma placement
    const numericValue = parseFormattedNumber(cleanValue);
    const formattedValue = numericValue ? formatNumber(numericValue) : '';
    
    setCustomValue(formattedValue);
    setMode('custom');
    onChange(numericValue.toString());
  };

  const handleModeSwitch = (newMode: 'predefined' | 'custom') => {
    setMode(newMode);
    if (newMode === 'predefined' && selectedRange) {
      onChange(selectedRange);
    } else if (newMode === 'custom' && customValue) {
      const numValue = parseFormattedNumber(customValue);
      onChange(numValue.toString());
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <label className="block text-sm font-medium text-gray-700">
          Investment Range
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleModeSwitch('predefined')}
            className={`px-3 py-1 text-xs rounded-full transition ${
              mode === 'predefined'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            Quick Select
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('custom')}
            className={`px-3 py-1 text-xs rounded-full transition ${
              mode === 'custom'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            Custom Amount
          </button>
        </div>
      </div>

      {mode === 'predefined' ? (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PREDEFINED_RANGES.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() => handlePredefinedChange(range.value.toString())}
                className={`px-3 py-2 text-sm border rounded-lg transition ${
                  selectedRange === range.value.toString()
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Select your preferred investment range from common amounts
          </p>
        </div>
      ) : (
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={customValue}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="Enter custom amount"
              className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Enter your preferred minimum investment amount (numbers will be automatically formatted)
          </p>
        </div>
      )}

      {/* Display current selection */}
      {(selectedRange || customValue) && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Selected Range:</span>{' '}
            {mode === 'predefined' 
              ? PREDEFINED_RANGES.find(r => r.value.toString() === selectedRange)?.label 
              : `$${customValue}`
            }
          </p>
        </div>
      )}
    </div>
  );
} 