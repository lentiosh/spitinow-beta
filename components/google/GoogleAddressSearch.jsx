'use client';

import React, { useState, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';

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

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACE_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (isLoaded && !autocompleteService && !placesService) {
      setAutocompleteService(new window.google.maps.places.AutocompleteService());
      setPlacesService(new window.google.maps.places.PlacesService(document.createElement('div')));
      setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
    }
  }, [isLoaded]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (!value) {
      setPredictions([]);
      selectedAddress(null);
      return;
    }

    if (autocompleteService) {
      const request = {
        input: value,
        sessionToken: sessionToken,
        componentRestrictions: { country: 'gr' },
        types: ['geocode', 'establishment'],
      };

      autocompleteService.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPredictions(predictions);
        } else {
          setPredictions([]);
        }
      });
    }
  };

  const handleSelectPrediction = (prediction) => {
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

            // Generate new session token after selection
            setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
          }
        }
      );
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  return (
    <div className="w-full relative">
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        className={`${className} input input-bordered w-full`}
      />
      {predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto">
          {predictions.map((prediction) => (
            <div
              key={prediction.place_id}
              onClick={() => handleSelectPrediction(prediction)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none"
            >
              <div className="font-medium">{prediction.structured_formatting.main_text}</div>
              <div className="text-sm text-gray-500">{prediction.structured_formatting.secondary_text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoogleAddressSearch;
