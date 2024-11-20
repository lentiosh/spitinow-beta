'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { debounce } from 'lodash';

const libraries = ['places'];

const GoogleAddressSearch = ({
  selectedAddress,
  inputValue,
  setInputValue,
  placeholder = 'Search for locations...',
  className = '',
}) => {
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [sessionToken, setSessionToken] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef(null);
  const predictionsRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACE_API_KEY,
    libraries,
  });

  // Handle clicks outside of predictions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (predictionsRef.current && !predictionsRef.current.contains(event.target) &&
          !inputRef.current.contains(event.target)) {
        setPredictions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isLoaded && !autocompleteService && !placesService) {
      setAutocompleteService(new window.google.maps.places.AutocompleteService());
      setPlacesService(new window.google.maps.places.PlacesService(document.createElement('div')));
      setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
    }
  }, [isLoaded]);

  // Debounced prediction fetching
  const fetchPredictions = useCallback(
    debounce((value, autocompleteService, sessionToken) => {
      if (!value) {
        setIsLoading(false);
        setPredictions([]);
        return;
      }

      const request = {
        input: value,
        sessionToken: sessionToken,
        componentRestrictions: { country: 'gr' },
        types: ['geocode', 'establishment'],
      };

      autocompleteService.getPlacePredictions(request, (predictions, status) => {
        setIsLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPredictions(predictions);
        } else {
          setPredictions([]);
        }
      });
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setIsLoading(true);

    if (!value) {
      selectedAddress(null);
      setPredictions([]);
      setIsLoading(false);
      return;
    }

    if (autocompleteService) {
      fetchPredictions(value, autocompleteService, sessionToken);
    }
  };

  const handleSelectPrediction = useCallback((prediction) => {
    setInputValue(prediction.description);
    setPredictions([]);

    if (placesService) {
      placesService.getDetails(
        {
          placeId: prediction.place_id,
          sessionToken: sessionToken,
          fields: ['geometry', 'formatted_address', 'address_components'],
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const selectedPlace = {
              description: prediction.description,
              mainText: prediction.structured_formatting.main_text,
              secondaryText: prediction.structured_formatting.secondary_text,
              place_id: prediction.place_id,
              coordinates: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
            };
            selectedAddress(selectedPlace);
            setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
          }
        }
      );
    }
  }, [placesService, sessionToken, selectedAddress, setInputValue]);

  if (loadError) {
    return (
      <div className="text-red-500 p-4 rounded-lg bg-red-50">
        Error loading Google Maps
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div className={`relative ${isFocused ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            ${className}
            pl-10 pr-10 py-3.5
            w-full
            text-base
            border border-gray-200
            rounded-xl
            bg-white
            shadow-sm
            placeholder-gray-400
            focus:outline-none
            focus:border-primary
            transition-all
            duration-200
          `}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>
      
      {predictions.length > 0 && (
        <div 
          ref={predictionsRef}
          className="
            absolute z-50 w-full mt-2
            bg-white rounded-2xl
            shadow-xl border border-gray-100
            max-h-[400px] overflow-y-auto
            transition-all duration-200 ease-in-out
          "
        >
          {predictions.map((prediction) => (
            <div
              key={prediction.place_id}
              onClick={() => handleSelectPrediction(prediction)}
              className="
                px-4 py-3.5
                hover:bg-gray-50
                cursor-pointer
                transition-colors
                duration-150
                border-b border-gray-100
                last:border-none
              "
            >
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(GoogleAddressSearch);