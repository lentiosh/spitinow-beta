'use client'
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronRight, Minus, Plus, MapPin, Calendar, Home } from 'lucide-react';

// Memoized checkbox component for better performance
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

// Memoized range input component
const RangeInput = memo(({ label, value, onChange, placeholder, type = "text" }) => (
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
}) => {
  const router = useRouter();
  
  // State management with performance optimizations
  const [filters, setFilters] = useState({
    radius: initialFilters.radius || '0',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    selectedPropertyTypes: initialFilters.propertyTypes ? initialFilters.propertyTypes.split(',') : [],
    minBedrooms: initialFilters.minBedrooms || '',
    maxBedrooms: initialFilters.maxBedrooms || '',
    addedToSite: initialFilters.addedToSite || 'Anytime'
  });

  // Memoized handlers
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handlePropertyTypeToggle = useCallback((type) => {
    setFilters(prev => ({
      ...prev,
      selectedPropertyTypes: prev.selectedPropertyTypes.includes(type)
        ? prev.selectedPropertyTypes.filter(t => t !== type)
        : [...prev.selectedPropertyTypes, type]
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      radius: '0',
      minPrice: '',
      maxPrice: '',
      selectedPropertyTypes: [],
      minBedrooms: '',
      maxBedrooms: '',
      addedToSite: 'Anytime'
    });
  }, []);

  const handleSearch = useCallback(() => {
    if (!location) {
      alert('Παρακαλώ εισαγάγετε τοποθεσία');
      return;
    }

    const params = new URLSearchParams({
      search: location,
      type: propertyType,
      radius: filters.radius,
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.selectedPropertyTypes.length && { propertyTypes: filters.selectedPropertyTypes.join(',') }),
      ...(filters.minBedrooms && { minBedrooms: filters.minBedrooms }),
      ...(filters.maxBedrooms && { maxBedrooms: filters.maxBedrooms }),
      ...(filters.addedToSite !== 'Anytime' && { addedToSite: filters.addedToSite })
    });

    router.push(`/listing-view?${params.toString()}`);
    onClose();
  }, [location, propertyType, filters, router, onClose]);

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
    'Διαμέρισμα',
    'Σπίτι',
    'Μεζονέτα',
    'Γκαρσονιέρα',
    'Σοφίτα',
    'Βίλα',
    'Ρετιρέ',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-x-0 bottom-0 w-full bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 px-4 py-6 border-b border-gray-100 bg-white rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-center">Φίλτρα</h2>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 space-y-8">
            {/* Location Radius */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#FF385C]" />
                <h3 className="text-lg font-semibold">Ακτίνα αναζήτησης</h3>
              </div>
              <select
                value={filters.radius}
                onChange={(e) => handleFilterChange('radius', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border appearance-none bg-white focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C] outline-none transition-colors"
              >
                <option value="0">Μόνο αυτή η περιοχή</option>
                <option value="1">Εντός 1 km</option>
                <option value="5">Εντός 5 km</option>
                <option value="10">Εντός 10 km</option>
                <option value="20">Εντός 20 km</option>
              </select>
            </section>

            {/* Price Range */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Εύρος τιμής</h3>
              <div className="flex gap-4 items-end">
                <RangeInput
                  label="Ελάχιστη τιμή"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="€"
                  type="number"
                />
                <div className="flex items-center pb-3">
                  <Minus className="w-4 h-4 text-gray-400" />
                </div>
                <RangeInput
                  label="Μέγιστη τιμή"
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
                <h3 className="text-lg font-semibold">Τύπος ακινήτου</h3>
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
              <h3 className="text-lg font-semibold">Υπνοδωμάτια</h3>
              <div className="flex gap-4 items-end">
                <RangeInput
                  label="Ελάχιστα"
                  value={filters.minBedrooms}
                  onChange={(e) => handleFilterChange('minBedrooms', e.target.value)}
                  placeholder="0"
                  type="number"
                />
                <div className="flex items-center pb-3">
                  <Minus className="w-4 h-4 text-gray-400" />
                </div>
                <RangeInput
                  label="Μέγιστα"
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
                <h3 className="text-lg font-semibold">Προστέθηκαν</h3>
              </div>
              <select
                value={filters.addedToSite}
                onChange={(e) => handleFilterChange('addedToSite', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border appearance-none bg-white focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C] outline-none transition-colors"
              >
                <option value="Anytime">Οποτεδήποτε</option>
                <option value="Last24Hours">Τελευταίες 24 ώρες</option>
                <option value="Last3Days">Τελευταίες 3 ημέρες</option>
                <option value="Last7Days">Τελευταίες 7 ημέρες</option>
                <option value="Last14Days">Τελευταίες 14 ημέρες</option>
              </select>
            </section>

            {/* Spacing for the fixed footer */}
            <div className="h-24" />
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-white">
          <div className="flex justify-between items-center">
            <button
              onClick={handleClearFilters}
              className="text-gray-800 font-medium underline"
            >
              Καθαρισμός όλων
            </button>
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-gradient-to-r from-[#FF385C] to-[#E31C5F] text-white font-semibold rounded-xl hover:from-[#E31C5F] hover:to-[#C13584] transition-all duration-200"
            >
              Εμφάνιση αποτελεσμάτων
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PropertiesFilter);