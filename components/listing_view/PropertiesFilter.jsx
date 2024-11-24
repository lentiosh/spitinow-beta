// components/listing_view/PropertiesFilter.js
'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { X, Minus, MapPin, Calendar, Home } from 'lucide-react';
import useStore from '../../store/store';

const PropertyTypeCheckbox = memo(({ type, checked, onChange }) => (
  <label className="relative flex items-center justify-between w-full p-4 cursor-pointer border rounded-2xl group hover:border-[#FF385C] transition-colors">
    <span className="text-gray-700">{type}</span>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="peer hidden"
    />
    <div className="w-5 h-5 border-2 rounded-full flex items-center justify-center group-hover:border-[#FF385C] peer-checked:bg-[#FF385C] peer-checked:border-[#FF385C] transition-colors">
      {checked && <span className="text-white text-sm">✓</span>}
    </div>
  </label>
));

PropertyTypeCheckbox.displayName = 'PropertyTypeCheckbox';

const RangeInput = memo(({ label, value, onChange, placeholder, type = 'text' }) => (
  <div className="flex-1">
    <label className="text-sm text-gray-500 mb-1 block">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      min="0"
      className="w-full px-4 py-3 rounded-2xl border focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C] outline-none transition-colors"
    />
  </div>
));

RangeInput.displayName = 'RangeInput';

const PropertiesFilter = ({
  isOpen,
  onClose,
  location,
  propertyType,
  initialFilters = {},
  onFiltersApplied,
}) => {
  const { filters, setFilters, resetFilters } = useStore();

  const handleFilterChange = useCallback((key, value) => {
    setFilters({ [key]: value });
  }, [setFilters]);

  const handlePropertyTypeToggle = useCallback((type) => {
    const updatedTypes = filters.selectedPropertyTypes.includes(type)
      ? filters.selectedPropertyTypes.filter((t) => t !== type)
      : [...filters.selectedPropertyTypes, type];
    setFilters({ selectedPropertyTypes: updatedTypes });
  }, [filters.selectedPropertyTypes, setFilters]);

  const handleClearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const handleSearch = useCallback(() => {
    if (!location) {
      alert('Please enter a location');
      return;
    }

    const params = new URLSearchParams({
      search: location,
      type: propertyType,
      radius: filters.radius,
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.selectedPropertyTypes.length && {
        propertyTypes: filters.selectedPropertyTypes.join(','),
      }),
      ...(filters.minBedrooms && { minBedrooms: filters.minBedrooms }),
      ...(filters.maxBedrooms && { maxBedrooms: filters.maxBedrooms }),
      ...(filters.addedToSite !== 'Anytime' && { addedToSite: filters.addedToSite }),
    });

    // Update the URL and handle polygon if necessary
    useStore.getState().setPolygonCoords(null); // Reset polygon if search is performed via filters

    window.location.href = `/listing-view?${params.toString()}`;
    onClose();
  }, [location, propertyType, filters, onClose]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const propertyTypeOptions = [
    'Apartment',
    'House',
    'Maisonette',
    'Studio',
    'Loft',
    'Villa',
    'Penthouse',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-x-0 bottom-0 w-full bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-6 border-b border-gray-100 bg-white rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-center">Filters</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 space-y-8">
            {/* Location Radius */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#FF385C]" />
                <h3 className="text-lg font-semibold">Search Radius</h3>
              </div>
              <select
                value={filters.radius}
                onChange={(e) => handleFilterChange('radius', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border appearance-none bg-white focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C] outline-none transition-colors"
              >
                <option value="0">Only this area</option>
                <option value="1">Within 1 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="20">Within 20 km</option>
              </select>
            </section>

            {/* Price Range */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Price Range</h3>
              <div className="flex gap-4 items-end">
                <RangeInput
                  label="Minimum Price"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="€"
                  type="number"
                />
                <div className="flex items-center pb-3">
                  <Minus className="w-4 h-4 text-gray-400" />
                </div>
                <RangeInput
                  label="Maximum Price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="€"
                  type="number"
                />
              </div>
            </section>

            {/* Property Types */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-[#FF385C]" />
                <h3 className="text-lg font-semibold">Property Type</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {propertyTypeOptions.map((type) => (
                  <PropertyTypeCheckbox
                    key={type}
                    type={type}
                    checked={filters.selectedPropertyTypes.includes(type)}
                    onChange={() => handlePropertyTypeToggle(type)}
                  />
                ))}
              </div>
            </section>

            {/* Bedrooms */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Bedrooms</h3>
              <div className="flex gap-4 items-end">
                <RangeInput
                  label="Minimum"
                  value={filters.minBedrooms}
                  onChange={(e) => handleFilterChange('minBedrooms', e.target.value)}
                  placeholder="0"
                  type="number"
                />
                <div className="flex items-center pb-3">
                  <Minus className="w-4 h-4 text-gray-400" />
                </div>
                <RangeInput
                  label="Maximum"
                  value={filters.maxBedrooms}
                  onChange={(e) => handleFilterChange('maxBedrooms', e.target.value)}
                  placeholder="∞"
                  type="number"
                />
              </div>
            </section>

            {/* Added to Site */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#FF385C]" />
                <h3 className="text-lg font-semibold">Added To Site</h3>
              </div>
              <select
                value={filters.addedToSite}
                onChange={(e) => handleFilterChange('addedToSite', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border appearance-none bg-white focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C] outline-none transition-colors"
              >
                <option value="Anytime">Anytime</option>
                <option value="Last24Hours">Last 24 hours</option>
                <option value="Last3Days">Last 3 days</option>
                <option value="Last7Days">Last 7 days</option>
                <option value="Last14Days">Last 14 days</option>
              </select>
            </section>

            {/* Spacing for the fixed footer */}
            <div className="h-24" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-white">
          <div className="flex justify-between items-center">
            <button
              onClick={handleClearFilters}
              className="text-gray-800 font-medium underline"
            >
              Clear All
            </button>
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-gradient-to-r from-[#FF385C] to-[#E31C5F] text-white font-semibold rounded-xl hover:from-[#E31C5F] hover:to-[#C13584] transition-all duration-200"
            >
              Show Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PropertiesFilter);