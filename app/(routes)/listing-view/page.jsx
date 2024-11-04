// ListingMapView.jsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import Listing from '@/components/listing_view/Listing';
import dynamic from 'next/dynamic';
import { Loader } from '@googlemaps/js-api-loader';
import * as turf from '@turf/turf';

const GoogleMapSection = dynamic(() => import('@/components/google/GoogleMapSection'), {
  ssr: false,
});

const ListingMapView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL parameters
  const typeParam = searchParams.get('type') || 'Rent';
  const searchTerm = searchParams.get('search') || '';
  const radiusParam = searchParams.get('radius') || '0';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const propertyTypes = searchParams.get('propertyTypes') || '';
  const minBedrooms = searchParams.get('minBedrooms') || '';
  const maxBedrooms = searchParams.get('maxBedrooms') || '';
  const addedToSite = searchParams.get('addedToSite') || 'Anytime';

  const [listing, setListing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState(searchTerm);
  const [showMap, setShowMap] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [propertyType, setPropertyType] = useState(typeParam);

  // State to keep track of the drawn polygon coordinates
  const [polygonCoords, setPolygonCoords] = useState(null);

  const fetchCoordinates = async (address) => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACE_API_KEY,
      libraries: ['places'],
    });

    try {
      const google = await loader.load();
      const geocoder = new google.maps.Geocoder();

      return new Promise((resolve) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            resolve({
              coordinates: {
                lat: location.lat(),
                lng: location.lng(),
              },
            });
          } else {
            console.error('Geocoding error:', status);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return null;
    }
  };

  // Function to calculate distance between two points in meters
  const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius of Earth in meters
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) *
        Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in meters
    return d;
  };

  const fetchListings = useCallback(
    async (searchTerm = '', location = null, polygonCoords = null) => {
      setLoading(true);
      try {
        let query = supabase
          .from('listing')
          .select(`*, listingImages(url, listing_id), coordinates`)
          .eq('type', typeParam)
          .order('created_at', { ascending: false });

        // Apply filters
        if (minPrice) query = query.gte('price', parseFloat(minPrice));
        if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
        if (minBedrooms) query = query.gte('bedrooms', parseInt(minBedrooms));
        if (maxBedrooms) query = query.lte('bedrooms', parseInt(maxBedrooms));

        if (propertyTypes) {
          const typesArray = propertyTypes.split(',');
          query = query.in('propertyType', typesArray);
        }

        if (addedToSite && addedToSite !== 'Anytime') {
          const daysMap = {
            Last24Hours: 1,
            Last3Days: 3,
            Last7Days: 7,
            Last14Days: 14,
          };
          const days = daysMap[addedToSite];
          const date = new Date();
          date.setDate(date.getDate() - days);
          query = query.gte('created_at', date.toISOString());
        }

        const { data, error } = await query;
        if (error) throw error;

        let listings = data || [];

        // Filter listings within the drawn polygon
        if (polygonCoords && polygonCoords.length > 0) {
          // Build a Turf.js polygon
          const turfPolygon = {
            type: 'Polygon',
            coordinates: [
              polygonCoords.map((coord) => [coord.lng, coord.lat]), // Turf expects [lng, lat]
            ],
          };

          // Close the polygon if it's not already closed
          if (
            polygonCoords[0].lat !== polygonCoords[polygonCoords.length - 1].lat ||
            polygonCoords[0].lng !== polygonCoords[polygonCoords.length - 1].lng
          ) {
            turfPolygon.coordinates[0].push([
              polygonCoords[0].lng,
              polygonCoords[0].lat,
            ]);
          }

          // Filter listings
          listings = listings.filter((listing) => {
            if (
              listing.coordinates &&
              listing.coordinates.lat &&
              listing.coordinates.lng
            ) {
              const point = {
                type: 'Point',
                coordinates: [listing.coordinates.lng, listing.coordinates.lat],
              };

              return turf.booleanPointInPolygon(point, turfPolygon);
            } else {
              return false;
            }
          });
        } else if (location) {
          // Existing radius filtering code
          const radiusInMeters = parseFloat(radiusParam) * 1000;
          const effectiveRadius = radiusInMeters || 1000; // Default to 1km if radius is 0

          listings = listings.filter((listing) => {
            if (listing.coordinates && listing.coordinates.lat && listing.coordinates.lng) {
              const lat1 = listing.coordinates.lat;
              const lng1 = listing.coordinates.lng;
              const lat2 = location.lat;
              const lng2 = location.lng;

              const distance = getDistanceFromLatLonInMeters(lat1, lng1, lat2, lng2);
              return distance <= effectiveRadius;
            } else {
              return false;
            }
          });
        }

        setListing(listings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    },
    [
      typeParam,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      propertyTypes,
      addedToSite,
      radiusParam,
    ]
  );

  useEffect(() => {
    setInputValue(searchTerm);
    if (searchTerm) {
      const init = async () => {
        const locationData = await fetchCoordinates(searchTerm);
        if (locationData) {
          setCoordinates(locationData.coordinates);
          await fetchListings(searchTerm, locationData.coordinates);
        } else {
          await fetchListings(searchTerm);
        }
      };
      init();
    } else {
      fetchListings();
    }
  }, [searchTerm, fetchListings]);

  const handleSearchClick = async () => {
    const term = inputValue.trim();
    if (!term) return;

    const newUrl = `/listing-view?search=${encodeURIComponent(term)}&type=${typeParam}`;
    router.push(newUrl);
    const locationData = await fetchCoordinates(term);
    if (locationData) {
      setCoordinates(locationData.coordinates);
      await fetchListings(term, locationData.coordinates);
    } else {
      await fetchListings(term);
    }
  };

  const handlePolygonComplete = (coords) => {
    setPolygonCoords(coords);
    fetchListings(searchTerm, null, coords);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen max-h-screen overflow-hidden bg-base-100">
      <div className="lg:hidden sticky top-0 z-20 bg-base-100 border-b p-2">
        <button className="btn btn-outline w-full" onClick={() => setShowMap(!showMap)}>
          {showMap ? 'Show Listings' : 'Show Map'}
        </button>
      </div>

      <div
        className={`${
          showMap ? 'hidden' : 'flex-1'
        } lg:block lg:w-[55%] bg-base-100 overflow-y-auto border-r`}
      >
        <Listing
          listing={listing}
          loading={loading}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSearchClick={handleSearchClick}
          setCoordinates={setCoordinates}
          propertyType={propertyType}
        />
      </div>

      <div
        className={`${
          showMap ? 'flex-1' : 'hidden'
        } lg:block lg:w-[45%] bg-base-200 transition-all duration-300 ease-in-out sticky top-16 h-[calc(100vh-64px)]`}
      >
        <div className="w-full h-full">
          {coordinates ? (
            <GoogleMapSection
              coordinates={coordinates}
              listings={listing}
              onPolygonComplete={handlePolygonComplete}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>Enter a location to view the map.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingMapView;
