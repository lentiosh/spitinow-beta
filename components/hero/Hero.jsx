// Hero.jsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GoogleAddressSearch from '../google/GoogleAddressSearch';
import { MapPin } from 'lucide-react';
import PropertiesFilter from '../listing_view/PropertiesFilter';

const Hero = () => {
  const router = useRouter();
  const [searchedAddress, setSearchedAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [propertyType, setPropertyType] = useState('Rent');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearchClick = () => {
    if (!inputValue) {
      alert('Please enter a location');
      return;
    }
    setIsFilterOpen(true);
  };

  const closeFilterModal = () => {
    setIsFilterOpen(false);
  };

  return (
    <div className="min-h-[70vh] relative overflow-hidden bg-base-100 md:min-h-[60vh]">
      {/* Background gradient - visible only on desktop */}
      <div className="hidden md:block absolute inset-0">
        <div className="absolute w-72 h-72 bg-primary/10 rounded-full blur-3xl -top-10 -left-10" />
        <div className="absolute w-72 h-72 bg-secondary/10 rounded-full blur-3xl -bottom-10 -right-10" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
          {/* Main Content */}
          <div className="text-center max-w-2xl space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-black via-gray-900 to-gray-400 bg-clip-text text-transparent">
              Ανακάλυψε το επόμενο σπίτι σου
            </h1>
            <p className="text-lg md:text-xl text-base-content/70">
              Με τη μεγαλύτερη επιλογή σπιτιών στην Ελλάδα
            </p>
          </div>

          <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              <label className="label cursor-pointer gap-2">
                <input
                  type="radio"
                  name="type"
                  value="Rent"
                  checked={propertyType === 'Rent'}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="radio radio-primary"
                />
                <span className="label-text text-base">Ενοικίαση</span>
              </label>
              <label className="label cursor-pointer gap-2">
                <input
                  type="radio"
                  name="type"
                  value="Sell"
                  checked={propertyType === 'Sell'}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="radio radio-primary"
                />
                <span className="label-text text-base">Πώληση</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                <GoogleAddressSearch
                  selectedAddress={(address) => {
                    setSearchedAddress(address);
                    setInputValue(address.description);
                  }}
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  placeholder="Εισάγετε περιοχή..."
                  className="input input-bordered w-full pl-10 focus:input-primary bg-white/90"
                />
              </div>
              <button
                onClick={handleSearchClick}
                className="btn btn-primary font-medium"
              >
                Αναζήτηση
              </button>
            </div>

            <div className="mt-4 text-center">
              <button className="btn btn-ghost btn-sm text-primary hover:text-primary-focus">
                Προβολή πρόσφατων αναζητήσεων
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Filter Modal */}
      <PropertiesFilter
        isOpen={isFilterOpen}
        onClose={closeFilterModal}
        location={inputValue}
        propertyType={propertyType}
      />
    </div>
  );
};

export default Hero;
