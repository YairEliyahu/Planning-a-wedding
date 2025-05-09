'use client';

import { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';

export interface Place {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
  type: string;
  class: string;
}

interface OSMPlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (place: Place) => void;
  placeholder?: string;
  className?: string;
  debounceTime?: number;
}

const OSMPlacesAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = 'הזן מיקום',
  className = '',
  debounceTime = 500
}: OSMPlacesAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // לטעון הצעות ממקומות מ-OpenStreetMap
  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'he', // שפה עברית
          }
        }
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  // דחיית בקשות חיפוש כדי למנוע יותר מדי בקשות
  const debouncedFetchSuggestions = useRef(
    debounce(fetchSuggestions, debounceTime)
  ).current;

  useEffect(() => {
    // ניקוי הדבאונס כשהקומפוננטה מתפרקת
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [debouncedFetchSuggestions]);

  useEffect(() => {
    // סגירת החלון כשלוחצים מחוץ לאלמנט
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    debouncedFetchSuggestions(inputValue);
    setShowSuggestions(true);
  };

  const handleSelectPlace = (place: Place) => {
    onChange(place.display_name);
    if (onSelect) {
      onSelect(place);
    }
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="flex flex-col">
        {/*<label className="text-sm font-medium text-gray-700 mb-1">מיקום</label>*/}
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => value && debouncedFetchSuggestions(value)}
          placeholder={placeholder}
          className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 ${className}`}
          autoComplete="off"
        />
      </div>

      {loading && (
        <div className="absolute right-3 top-9">
          <div className="w-5 h-5 border-2 border-t-transparent border-pink-500 rounded-full animate-spin"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto border border-gray-300 text-right">
          {suggestions.map((place) => (
            <li
              key={place.place_id}
              className="px-4 py-2 hover:bg-pink-50 cursor-pointer"
              onClick={() => handleSelectPlace(place)}
            >
              <div className="text-sm">{place.display_name}</div>
              <div className="text-xs text-gray-500">
                {place.type} - {place.class}
              </div>
            </li>
          ))}
        </ul>
      )}

      {showSuggestions && !loading && value && suggestions.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md py-3 px-4 border border-gray-300 text-right">
          <p className="text-gray-500">לא נמצאו תוצאות</p>
        </div>
      )}

    
    </div>
  );
};

export default OSMPlacesAutocomplete; 