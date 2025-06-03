import React, { useState, useRef, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';

interface LocationAutocompleteProps {
  value: string[];
  onChange: (locations: string[]) => void;
  placeholder?: string;
  className?: string;
}

// US States for investment location preferences
const US_STATES = [
  'Alabama',
  'Alaska', 
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming'
];

export function LocationAutocomplete({ value, onChange, placeholder = "Start typing a state name...", className = "" }: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputValue.length >= 1) {
      const filtered = US_STATES.filter(state =>
        state.toLowerCase().includes(inputValue.toLowerCase()) &&
        !value.includes(state)
      ).slice(0, 10); // Show up to 10 states
      setFilteredLocations(filtered);
      setShowDropdown(filtered.length > 0);
      setHighlightedIndex(0);
    } else {
      setFilteredLocations([]);
      setShowDropdown(false);
    }
  }, [inputValue, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredLocations.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredLocations.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredLocations[highlightedIndex]) {
          addLocation(filteredLocations[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
    }
  };

  const addLocation = (location: string) => {
    if (!value.includes(location)) {
      onChange([...value, location]);
    }
    setInputValue('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const removeLocation = (locationToRemove: string) => {
    onChange(value.filter(location => location !== locationToRemove));
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Selected locations */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((location) => (
            <span
              key={location}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              <MapPin className="h-3 w-3 mr-1" />
              {location}
              <button
                type="button"
                onClick={() => removeLocation(location)}
                className="ml-2 hover:text-blue-600 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input field */}
      <div className="relative" ref={dropdownRef}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredLocations.map((location, index) => (
              <button
                key={location}
                type="button"
                onClick={() => addLocation(location)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center ${
                  index === highlightedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                }`}
              >
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                {location}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 