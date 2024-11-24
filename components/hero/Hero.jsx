// components/Hero.js
'use client';

import React, { Suspense, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import SkeletonScreen from './SkeletonScreen';
import useStore from '../../store/store';

const GoogleAddressSearch = dynamic(() => import('../../components/google/GoogleAddressSearch'), {
  suspense: true,
  loading: () => <SkeletonScreen height="44px" className="rounded-full" />
});

const PropertiesFilter = dynamic(() => import('../..//components/listing_view/PropertiesFilter'), {
  suspense: true,
  loading: () => <SkeletonScreen height="400px" className="rounded-2xl" />
});

const Hero = () => {
  const router = useRouter();
  const {
    inputValue,
    setInputValue,
    propertyType,
    setPropertyType,
    openFilter, // Function to open filter modal
  } = useStore();

  const handleSearchClick = React.useCallback(() => {
    if (!inputValue) {
      alert('Please enter a location');
      return;
    }
    // Open the filter modal instead of navigating
    openFilter();
  }, [inputValue, openFilter]);

  return (
    <div className="relative min-h-screen ">
      {/* Hero Background */}
      <div className="absolute inset-0" />

      <div className="relative container mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-12">
          {/* Main Content */}
          <div className="text-center max-w-3xl space-y-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 tracking-tight">
              Ανακάλυψε το επόμενο
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF385C] to-[#E31C5F]">
                {' '}σπίτι σου
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Με τη μεγαλύτερη επιλογή σπιτιών στην Ελλάδα
            </p>
          </div>

          {/* Search Container */}
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-full p-5 shadow-lg hover:shadow-xl transition-shadow duration-200">
              {/* Property Type Selector */}
              <div className="flex justify-center gap-6 p-2 border-b border-gray-100">
                <label className="relative flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="type"
                    value="Rent"
                    checked={propertyType === 'Rent'}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="absolute opacity-0 w-full h-full cursor-pointer"
                  />
                  <span className={`px-4 py-2 rounded-full transition-colors ${
                    propertyType === 'Rent' 
                      ? 'bg-[#FF385C] text-white' 
                      : 'text-gray-600 group-hover:bg-gray-100'
                  }`}>
                    Ενοικίαση
                  </span>
                </label>
                <label className="relative flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="type"
                    value="Sell"
                    checked={propertyType === 'Sell'}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="absolute opacity-0 w-full h-full cursor-pointer"
                  />
                  <span className={`px-4 py-2 rounded-full transition-colors ${
                    propertyType === 'Sell' 
                      ? 'bg-[#FF385C] text-white' 
                      : 'text-gray-600 group-hover:bg-gray-100'
                  }`}>
                    Πώληση
                  </span>
                </label>
              </div>

              {/* Search Input */}
              <div className="flex items-center p-2">
                <div className="relative flex-grow">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Suspense fallback={<SkeletonScreen />}>
                    <GoogleAddressSearch
                      selectedAddress={(address) => {
                        setInputValue(address.description);
                        // Optionally set coordinates if needed
                      }}
                      inputValue={inputValue}
                      setInputValue={setInputValue}
                      placeholder="Εισάγετε περιοχή..."
                      className="w-full pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                    />
                  </Suspense>
                </div>
                <button
                  onClick={handleSearchClick}
                  className="ml-2 px-6 py-3 bg-gradient-to-r from-[#FF385C] to-[#E31C5F] text-white font-semibold rounded-full hover:from-[#E31C5F] hover:to-[#C13584] transition-all duration-200 flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Αναζήτηση</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Filter Modal */}
      <Suspense fallback={<SkeletonScreen height="400px" className="rounded-2xl" />}>
        <PropertiesFilter
          isOpen={useStore((state) => state.isFilterOpen)}
          onClose={() => useStore.getState().closeFilter()}
          location={inputValue}
          propertyType={propertyType}
          initialFilters={useStore((state) => state.filters)}
          onFiltersApplied={() => useStore.getState().closeFilter()}
        />
      </Suspense>
    </div>
  );
};

export default memo(Hero);