'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import GoogleAddressSearch from '../google/GoogleAddressSearch';
import PropertiesFilter from './PropertiesFilter';
import { useRouter } from 'next/navigation';

const Listing = React.memo(
  ({
    listing,
    loading,
    inputValue,
    setInputValue,
    handleSearchClick,
    setCoordinates,
    initialFilters,
    onFiltersApplied,
    propertyType,
  }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const router = useRouter();

    const openFilterModal = () => {
      setIsFilterOpen(true);
    };

    const closeFilterModal = () => {
      setIsFilterOpen(false);
    };

    const handleListingClick = (id) => {
      router.push(`/listing-view/${id}`);
    };

    return (
      <div className="min-h-screen bg-base-100">
        {/* Header */}
        <div className="bg-base-100 border-b sticky top-0 z-10">
          <div className="container mx-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Καταχωρήσεις Ακινήτων</h1>
              <div className="flex items-center gap-4">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={openFilterModal}
                >
                  Φίλτρα
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                <GoogleAddressSearch
                  selectedAddress={(address) => {
                    if (address && address.coordinates) {
                      setCoordinates(address.coordinates);
                      setInputValue(address.description);
                    }
                  }}
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  placeholder="Εισάγετε τοποθεσία..."
                  className="input input-bordered w-full pl-10"
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={handleSearchClick}
              >
                Αναζήτηση
              </button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="bg-base-100 border-b sticky top-[74px] z-10">
          <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <span className="text-sm">
              {listing.length} ακίνητα βρέθηκαν
            </span>
          </div>
        </div>

        {/* Listing */}
        <div className="container mx-auto p-4">
          {loading ? (
            // Loading
            <div className="grid gap-4 grid-cols-1">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="card bg-base-100 shadow-xl animate-pulse"
                >
                  <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                  <div className="card-body">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Listings
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {listing.map((item, index) => (
                <div
                  key={item.id}
                  className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => handleListingClick(item.id)}
                >
                  <div className="relative w-full h-48">
                    <Image
                      src={item.listingImages[0]?.url || '/placeholder.png'}
                      alt={`Εικόνα του ${item.address}`}
                      fill
                      className="object-cover rounded-t-lg"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      priority={index < 3}
                    />
                    <button className="absolute top-2 right-2 btn btn-ghost btn-sm btn-circle">
                      {/* Save icon */}
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {item.address}
                        </h3>
                        <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.bedrooms && (
                        <span className="badge badge-outline">
                          {item.bedrooms} κρεβάτια
                        </span>
                      )}
                      {item.bathrooms && (
                        <span className="badge badge-outline">
                          {item.bathrooms} μπάνια
                        </span>
                      )}
                      {item.propertyType && (
                        <span className="badge badge-outline">
                          {item.propertyType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-lg font-semibold">
                        €{item.price.toLocaleString()}
                        <span className="text-sm font-normal text-base-content/70">
                          {item.type === 'Rent' ? '/μήνα' : ''}
                        </span>
                      </div>
                      {/* Removed "View Details" button for cleaner design */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Properties Filter Modal */}
        <PropertiesFilter
          isOpen={isFilterOpen}
          onClose={closeFilterModal}
          location={inputValue}
          propertyType={propertyType}
          initialFilters={initialFilters}
          onFiltersApplied={onFiltersApplied}
        />
      </div>
    );
  }
);

export default Listing;