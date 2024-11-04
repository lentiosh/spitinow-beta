// PropertiesFilter.jsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const PropertiesFilter = ({
  isOpen,
  onClose,
  location,
  propertyType,
  initialFilters = {},
}) => {
  const router = useRouter();

  const [radius, setRadius] = useState(initialFilters.radius || '0'); // In kilometers
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState(
    initialFilters.propertyTypes ? initialFilters.propertyTypes.split(',') : []
  );
  const [minBedrooms, setMinBedrooms] = useState(initialFilters.minBedrooms || '');
  const [maxBedrooms, setMaxBedrooms] = useState(initialFilters.maxBedrooms || '');
  const [addedToSite, setAddedToSite] = useState(initialFilters.addedToSite || 'Anytime');
  const [includeLetAgreed, setIncludeLetAgreed] = useState(initialFilters.includeLetAgreed === 'true');

  const propertyTypeOptions = ['House', 'Apartment', 'Studio', 'Villa', 'Land'];

  const handlePropertyTypeChange = (type) => {
    setSelectedPropertyTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleSearch = () => {
    if (!location) {
      alert('Please enter a location');
      return;
    }

    const params = new URLSearchParams();
    params.set('search', location);
    params.set('type', propertyType);

    params.set('radius', radius);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (selectedPropertyTypes.length > 0) params.set('propertyTypes', selectedPropertyTypes.join(','));
    if (minBedrooms) params.set('minBedrooms', minBedrooms);
    if (maxBedrooms) params.set('maxBedrooms', maxBedrooms);
    if (addedToSite && addedToSite !== 'Anytime') params.set('addedToSite', addedToSite);
    if (includeLetAgreed) params.set('includeLetAgreed', 'true');

    router.push(`/listing-view?${params.toString()}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">
              Properties to {propertyType} in {location}
            </h2>
            <button className="btn btn-ghost" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="p-4 space-y-6">
            {/* Search Radius */}
            <div>
              <label className="block text-sm font-medium mb-1">Search Radius (km)</label>
              <select
                className="select select-bordered w-full"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
              >
                <option value="0">This area only</option>
                <option value="1">Within 1 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="20">Within 20 km</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-1">Price Range (€)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="No min"
                  className="input input-bordered w-full"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="flex items-center">-</span>
                <input
                  type="number"
                  placeholder="No max"
                  className="input input-bordered w-full"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Property Types */}
            <div>
              <label className="block text-sm font-medium mb-1">Property Types</label>
              <div className="flex flex-wrap gap-2">
                {propertyTypeOptions.map((type) => (
                  <label key={type} className="cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={selectedPropertyTypes.includes(type)}
                      onChange={() => handlePropertyTypeChange(type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Number of Bedrooms */}
            <div>
              <label className="block text-sm font-medium mb-1">Number of Bedrooms</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="No min"
                  className="input input-bordered w-full"
                  value={minBedrooms}
                  onChange={(e) => setMinBedrooms(e.target.value)}
                />
                <span className="flex items-center">-</span>
                <input
                  type="number"
                  placeholder="No max"
                  className="input input-bordered w-full"
                  value={maxBedrooms}
                  onChange={(e) => setMaxBedrooms(e.target.value)}
                />
              </div>
            </div>

            {/* Added to Site */}
            <div>
              <label className="block text-sm font-medium mb-1">Added to Site</label>
              <select
                className="select select-bordered w-full"
                value={addedToSite}
                onChange={(e) => setAddedToSite(e.target.value)}
              >
                <option value="Anytime">Anytime</option>
                <option value="Last24Hours">Last 24 hours</option>
                <option value="Last3Days">Last 3 days</option>
                <option value="Last7Days">Last 7 days</option>
                <option value="Last14Days">Last 14 days</option>
              </select>
            </div>

            {/* Include Let Agreed Properties */}
            {propertyType === 'Rent' && (
              <div>
                <label className="cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={includeLetAgreed}
                    onChange={(e) => setIncludeLetAgreed(e.target.checked)}
                  />
                  <span>Include Let Agreed properties</span>
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-end items-center p-4 border-t">
            <button className="btn btn-secondary mr-2" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSearch}>
              Search Properties
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesFilter;
