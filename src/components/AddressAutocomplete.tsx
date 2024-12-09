import { useRef, useState } from 'react';
import { MapPin, Loader2, X, Search, AlertCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, coordinates?: { lat: string; lon: string }) => void;
  required?: boolean;
}

interface Suggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function AddressAutocomplete({ value, onChange, required }: AddressAutocompleteProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchAddress = async (retryCount = 0): Promise<void> => {
    if (!value.trim() || value.length < 3) {
      setError('Please enter at least 3 characters');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuggestions([]);

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController
      abortControllerRef.current = new AbortController();

      const params = new URLSearchParams({
        format: 'json',
        q: value.trim(),
        countrycodes: 'fr,be,lu',
        limit: '5',
        addressdetails: '1',
        featuretype: 'building,highway,place'
      });

      const response = await fetch(`${NOMINATIM_API}?${params}`, {
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'fr-FR,fr;q=0.9',
          'User-Agent': 'ContentCoach/1.0'
        },
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        if (response.status === 429 && retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return searchAddress(retryCount + 1);
        }
        throw new Error(`Search failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      if (data.length === 0) {
        setError('No addresses found');
        return;
      }

      const validSuggestions = data
        .filter(s => s.address && (s.address.road || s.address.city))
        .map(s => ({
          place_id: s.place_id,
          display_name: s.display_name,
          lat: s.lat,
          lon: s.lon,
          address: s.address
        }));

      if (validSuggestions.length === 0) {
        setError('No valid addresses found');
        return;
      }

      setSuggestions(validSuggestions);
      setShowSuggestions(true);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore abort errors
      }
      console.error('Address search error:', err);
      setError('Failed to search address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (suggestion: Suggestion) => {
    const parts = [];
    const addr = suggestion.address;

    if (addr.house_number) parts.push(addr.house_number);
    if (addr.road) parts.push(addr.road);
    if (addr.city) parts.push(addr.city);
    if (addr.state) parts.push(addr.state);
    if (addr.postcode) parts.push(addr.postcode);
    if (addr.country) parts.push(addr.country);

    return parts.join(', ');
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    const formattedAddress = formatAddress(suggestion);
    onChange(formattedAddress, { lat: suggestion.lat, lon: suggestion.lon });
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
  };

  const handleSearch = () => {
    if (!value.trim()) {
      setError('Please enter an address to search');
      return;
    }
    searchAddress();
  };

  const clearInput = () => {
    onChange('', undefined);
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative">
      <div className="relative flex">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
          className={`pl-10 pr-20 mt-1 block w-full rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder={t('companyCoach.enterAddress')}
          required={required}
          disabled={isLoading}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {value && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={clearInput}
              className="p-1 text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={handleSearch}
            disabled={!value.trim() || isLoading}
            className="ml-1 mr-1 p-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('common.search')}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </motion.button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center text-sm text-red-600"
        >
          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto"
          >
            {suggestions.map((suggestion) => (
              <motion.button
                key={suggestion.place_id}
                type="button"
                whileHover={{ backgroundColor: '#F3F4F6' }}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                <div className="font-medium">{formatAddress(suggestion)}</div>
                <div className="text-xs text-gray-500 truncate">
                  {suggestion.display_name}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}