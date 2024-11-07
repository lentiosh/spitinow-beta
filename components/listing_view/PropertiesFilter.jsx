'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PropertiesFilter = ({
  isOpen,
  onClose,
  location,
  propertyType,
  initialFilters = {},
}) => {
  const router = useRouter();

  const [radius, setRadius] = useState(initialFilters.radius || '0');
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState(
    initialFilters.propertyTypes
      ? initialFilters.propertyTypes.split(',')
      : []
  );
  const [minBedrooms, setMinBedrooms] = useState(
    initialFilters.minBedrooms || ''
  );
  const [maxBedrooms, setMaxBedrooms] = useState(
    initialFilters.maxBedrooms || ''
  );
  const [addedToSite, setAddedToSite] = useState(
    initialFilters.addedToSite || 'Anytime'
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const propertyTypeOptions = [
    'Διαμέρισμα',
    'Σπίτι',
    'Μεζονέτα',
    'Γκαρσονιέρα',
    'Σοφίτα',
    'Βίλα',
    'Ρετιρέ',
  ];

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
      alert('Παρακαλώ εισαγάγετε τοποθεσία');
      return;
    }

    if ((minPrice && minPrice < 0) || (maxPrice && maxPrice < 0)) {
      alert('Η τιμή δεν μπορεί να είναι αρνητική');
      return;
    }

    if ((minBedrooms && minBedrooms < 0) || (maxBedrooms && maxBedrooms < 0)) {
      alert('Ο αριθμός των υπνοδωματίων δεν μπορεί να είναι αρνητικός');
      return;
    }

    const params = new URLSearchParams();
    params.set('search', location);
    params.set('type', propertyType);

    params.set('radius', radius);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (selectedPropertyTypes.length > 0)
      params.set('propertyTypes', selectedPropertyTypes.join(','));
    if (minBedrooms) params.set('minBedrooms', minBedrooms);
    if (maxBedrooms) params.set('maxBedrooms', maxBedrooms);
    if (addedToSite && addedToSite !== 'Anytime')
      params.set('addedToSite', addedToSite);

    router.push(`/listing-view?${params.toString()}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex items-center justify-center h-screen">
        <div
          className="bg-white w-full max-h-screen md:h-auto md:max-w-3xl md:rounded-xl md:mt-8 overflow-hidden transform transition-all duration-300 ease-in-out flex flex-col"
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          }}
        >
          <div className="relative p-2 border-b">
            <h2 className="text-2xl font-bold text-center">
              Ακίνητα προς{' '}
              <span className="bg-gradient-to-br from-green-400 to-teal-500 text-transparent bg-clip-text">
                {propertyType}
              </span>{' '}
              σε{' '}
              <span className="bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text font-extrabold">
                {location}
              </span>
            </h2>
            <button
              className="btn btn-ghost absolute top-2 right-2"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          <div className="flex-grow p-2 space-y-2 overflow-y-auto">
            {/* Ακτίνα αναζήτησης */}
            <div>
              <label className="block text-lg font-semibold mb-1 text-center">
                Ακτίνα αναζήτησης (km)
              </label>
              <select
                className="select select-bordered w-full"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
              >
                <option value="0">Μόνο αυτή η περιοχή</option>
                <option value="1">Εντός 1 km</option>
                <option value="5">Εντός 5 km</option>
                <option value="10">Εντός 10 km</option>
                <option value="20">Εντός 20 km</option>
              </select>
            </div>

            {/* Εύρος τιμής */}
            <div>
              <label className="block text-lg font-semibold mb-1 text-center">
                Εύρος τιμής (€)
              </label>
              <div className="flex gap-2 justify-center">
                <input
                  type="number"
                  min="0"
                  placeholder="Χωρίς ελάχιστο"
                  className="input input-bordered w-full"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="flex items-center">-</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Χωρίς μέγιστο"
                  className="input input-bordered w-full"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Τύποι ακινήτων */}
            <div>
              <label className="block text-lg font-semibold mb-1 text-center">
                Τύποι ακινήτων
              </label>
              <div className="flex flex-wrap gap-2 justify-center">
                {propertyTypeOptions.map((type) => (
                  <label
                    key={type}
                    className="cursor-pointer flex items-center gap-2"
                  >
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

            {/* Αριθμός υπνοδωματίων */}
            <div>
              <label className="block text-lg font-semibold mb-1 text-center">
                Αριθμός υπνοδωματίων
              </label>
              <div className="flex gap-2 justify-center">
                <input
                  type="number"
                  min="0"
                  placeholder="Χωρίς ελάχιστο"
                  className="input input-bordered w-full"
                  value={minBedrooms}
                  onChange={(e) => setMinBedrooms(e.target.value)}
                />
                <span className="flex items-center">-</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Χωρίς μέγιστο"
                  className="input input-bordered w-full"
                  value={maxBedrooms}
                  onChange={(e) => setMaxBedrooms(e.target.value)}
                />
              </div>
            </div>

            {/* Προστέθηκαν στον ιστότοπο */}
            <div>
              <label className="block text-lg font-semibold mb-1 text-center">
                Προστέθηκαν στον ιστότοπο
              </label>
              <select
                className="select select-bordered w-full"
                value={addedToSite}
                onChange={(e) => setAddedToSite(e.target.value)}
              >
                <option value="Anytime">Οποτεδήποτε</option>
                <option value="Last24Hours">Τελευταίες 24 ώρες</option>
                <option value="Last3Days">Τελευταίες 3 ημέρες</option>
                <option value="Last7Days">Τελευταίες 7 ημέρες</option>
                <option value="Last14Days">Τελευταίες 14 ημέρες</option>
              </select>
            </div>
          </div>

          <div className="flex-shrink-0 flex justify-end items-center p-2 border-t">
            <button className="btn btn-secondary mr-2" onClick={onClose}>
              Ακύρωση
            </button>
            <button className="btn btn-primary" onClick={handleSearch}>
              Αναζήτηση ακινήτων
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesFilter;
