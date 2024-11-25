'use client';
import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import dynamic from 'next/dynamic';
import { Loader } from '@googlemaps/js-api-loader';
import * as turf from '@turf/turf';
import useStore from '../../../store/store';
import { Map } from 'lucide-react';

const GoogleMapSection = dynamic(
  () => import('../../../components/google/GoogleMapSection'),
  {
    ssr: false,
  }
);

const Listing = lazy(() => import('../../../components/listing_view/Listing'));

const ListingMapView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Parse URL parameters from query
  const typeParam = searchParams.get('type') || 'Rent';
  const searchTerm = searchParams.get('search') || '';
  const radiusParam = searchParams.get('radius') || '0';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const propertyTypes = searchParams.get('propertyTypes') || '';
  const minBedrooms = searchParams.get('minBedrooms') || '';
  const maxBedrooms = searchParams.get('maxBedrooms') || '';
  const addedToSite = searchParams.get('addedToSite') || 'Anytime';
  const polygonParam = searchParams.get('polygon') || '';
  const showMapParam = searchParams.get('showMap') || 'false';

  const {
    listing,
    setListing,
    loading,
    setLoading,
    inputValue,
    setInputValue,
    showMap,
    toggleShowMap,
    coordinates,
    setCoordinates,
    propertyType,
    setPropertyType,
    polygonCoords,
    setPolygonCoords,
  } = useStore();

  // Function to fetch coordinates based on address
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
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return null;
    }
  };

  // Function to fetch listings based on search parameters
  const fetchListings = async (currentSearchTerm, currentLocation, currentPolygonCoords) => {
    setLoading(true);
    try {
      let query = supabase
        .from('listing')
        .select(`*, listingImages(url, listing_id), coordinates`)
        .eq('type', typeParam)
        .order('created_at', { ascending: false });

      // Apply filters
      if (minPrice) {
        query = query.gte('price', parseFloat(minPrice));
      }
      if (maxPrice) {
        query = query.lte('price', parseFloat(maxPrice));
      }
      if (minBedrooms) {
        query = query.gte('bedrooms', parseInt(minBedrooms));
      }
      if (maxBedrooms) {
        query = query.lte('bedrooms', parseInt(maxBedrooms));
      }
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
      if (currentPolygonCoords && currentPolygonCoords.length > 0) {
        const turfPolygon = {
          type: 'Polygon',
          coordinates: [
            currentPolygonCoords.map((coord) => [coord.lng, coord.lat]),
          ],
        };

        if (
          currentPolygonCoords[0].lat !== currentPolygonCoords[currentPolygonCoords.length - 1].lat ||
          currentPolygonCoords[0].lng !== currentPolygonCoords[currentPolygonCoords.length - 1].lng
        ) {
          turfPolygon.coordinates[0].push([
            currentPolygonCoords[0].lng,
            currentPolygonCoords[0].lat,
          ]);
        }

        listings = listings.filter((listing) => {
          if (listing.coordinates?.lat && listing.coordinates?.lng) {
            const point = {
              type: 'Point',
              coordinates: [listing.coordinates.lng, listing.coordinates.lat],
            };
            return turf.booleanPointInPolygon(point, turfPolygon);
          }
          return false;
        });
      } else if (currentLocation) {
        const radiusInMeters = parseFloat(radiusParam) * 1000;
        const effectiveRadius = radiusInMeters || 1000;

        listings = listings.filter((listing) => {
          if (listing.coordinates?.lat && listing.coordinates?.lng) {
            const from = [currentLocation.lng, currentLocation.lat];
            const to = [listing.coordinates.lng, listing.coordinates.lat];
            const distanceInMeters = turf.distance(from, to, { units: 'meters' });
            return distanceInMeters <= effectiveRadius;
          }
          return false;
        });
      }

      setListing(listings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const isValidPolygonData = (data) => {
    try {
      const parsedData = JSON.parse(data);
      return Array.isArray(parsedData) && parsedData.every(
        (coord) => typeof coord.lat === 'number' && typeof coord.lng === 'number'
      );
    } catch {
      return false;
    }
  };

  const initialize = async () => {
    setInputValue(searchTerm);
    setPropertyType(typeParam);
    toggleShowMap(showMapParam === 'true');

    if (polygonParam) {
      try {
        const decoded = decodeURIComponent(polygonParam);
        if (isValidPolygonData(decoded)) {
          const parsedCoords = JSON.parse(decoded);
          setPolygonCoords(parsedCoords);
          await fetchListings(searchTerm, null, parsedCoords);
        } else {
          throw new Error('Invalid polygon data format');
        }
      } catch (error) {
        console.error('Error parsing polygon coordinates:', error);
        await fetchListings(searchTerm, null, null);
      }
    } else if (searchTerm) {
      const locationData = await fetchCoordinates(searchTerm);
      if (locationData) {
        setCoordinates(locationData.coordinates);
        await fetchListings(searchTerm, locationData.coordinates, null);
      } else {
        await fetchListings(searchTerm, null, null);
      }
    } else {
      await fetchListings('', null, null);
    }
  };

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pathname,
    searchTerm,
    typeParam,
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    propertyTypes,
    addedToSite,
    radiusParam,
    polygonParam,
  ]);

  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        // Handle back-forward cache if needed
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const handleSearchClickInternal = async () => {
    const term = inputValue.trim();
    if (!term) return;

    const params = new URLSearchParams({
      search: term,
      type: typeParam,
      radius: radiusParam,
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(propertyTypes && { propertyTypes }),
      ...(minBedrooms && { minBedrooms }),
      ...(maxBedrooms && { maxBedrooms }),
      ...(addedToSite !== 'Anytime' && { addedToSite }),
      ...(polygonCoords?.length > 0 && {
        polygon: encodeURIComponent(JSON.stringify(
          polygonCoords.map(coord => ({
            lat: coord.lat,
            lng: coord.lng,
          }))
        )),
      }),
      showMap,
    });

    router.push(`/listing-view?${params.toString()}`);
  };

  const handlePolygonCompleteInternal = (coords) => {
    setPolygonCoords(coords);
    fetchListings(searchTerm, null, coords);

    const polygonSerialized = encodeURIComponent(
      JSON.stringify(coords.map(coord => ({
        lat: coord.lat,
        lng: coord.lng,
      })))
    );

    const params = new URLSearchParams({
      search: searchTerm,
      type: typeParam,
      radius: radiusParam,
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(propertyTypes && { propertyTypes }),
      ...(minBedrooms && { minBedrooms }),
      ...(maxBedrooms && { maxBedrooms }),
      ...(addedToSite !== 'Anytime' && { addedToSite }),
      ...(polygonSerialized && { polygon: polygonSerialized }),
      showMap,
    });

    router.push(`/listing-view?${params.toString()}`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-base-100">
      {/* Main Content Container */}
      <div className="flex flex-1 relative lg:flex-row">
        {/* Listings Section */}
        <div className={`
          w-full h-full transition-all duration-300 ease-in-out
          ${showMap ? 'hidden lg:block' : 'block'} 
          lg:w-[55%] bg-base-100 overflow-y-auto
        `}>
          <Suspense fallback={<div>Loading Listings...</div>}>
            <Listing
              listing={listing}
              loading={loading}
              handleSearchClick={handleSearchClickInternal}
            />
          </Suspense>
        </div>

        {/* Map Section */}
        <div className={`
          fixed inset-0 z-30 bg-base-200
          ${showMap ? 'translate-y-0' : 'translate-y-full'} 
          transition-transform duration-300 ease-in-out
          lg:static lg:block lg:w-[45%] lg:translate-y-0 lg:h-screen
        `}>
          <div className="w-full h-full">
            {coordinates ? (
              <GoogleMapSection
                coordinates={coordinates}
                listings={listing}
                onPolygonComplete={handlePolygonCompleteInternal}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>Enter a location to view the map.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Map Toggle Button - Mobile Only */}
      <button
        onClick={() => toggleShowMap()}
        className={`
          fixed bottom-6 left-1/2 -translate-x-1/2 z-40
          flex items-center gap-2 px-4 py-3 rounded-full
          bg-black text-white shadow-lg
          transition-transform duration-300
          hover:scale-105
          lg:hidden
        `}
      >
        <span className="font-medium">
          {showMap ? 'Show list' : 'Show map'}
        </span>
        <Map className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ListingMapView;