'use client';

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import dynamic from 'next/dynamic';
import { Loader } from '@googlemaps/js-api-loader';
import * as turf from '@turf/turf';

const GoogleMapSection = dynamic(
  () => import('@/components/google/GoogleMapSection'),
  {
    ssr: false,
  }
);

const Listing = lazy(() => import('@/components/listing_view/Listing'));

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

  const [listing, setListing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState(searchTerm);
  const [showMap, setShowMap] = useState(showMapParam === 'true');
  const [coordinates, setCoordinates] = useState(null);
  const [propertyType, setPropertyType] = useState(typeParam);

  // State to keep track of the drawn polygon coordinates
  const [polygonCoords, setPolygonCoords] = useState(null);

  // Function to fetch coordinates based on address
  const fetchCoordinates = async (address) => {
    console.log('Fetching coordinates for address:', address);
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACE_API_KEY,
      libraries: ['places'],
    });

    try {
      const google = await loader.load();
      const geocoder = new google.maps.Geocoder();

      return new Promise((resolve) => {
        geocoder.geocode({ address }, (results, status) => {
          console.log('Geocoding status:', status);
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            console.log('Geocoding result:', location);
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

  // Function to fetch listings based on search parameters
  const fetchListings = async (currentSearchTerm, currentLocation, currentPolygonCoords) => {
    console.log('Fetching listings with params:', {
      searchTerm: currentSearchTerm,
      location: currentLocation,
      polygon: currentPolygonCoords,
    });
    setLoading(true);
    try {
      let query = supabase
        .from('listing')
        .select(`*, listingImages(url, listing_id), coordinates`)
        .eq('type', typeParam)
        .order('created_at', { ascending: false });

      // Apply filters
      if (minPrice) {
        console.log('Applying minPrice filter:', minPrice);
        query = query.gte('price', parseFloat(minPrice));
      }
      if (maxPrice) {
        console.log('Applying maxPrice filter:', maxPrice);
        query = query.lte('price', parseFloat(maxPrice));
      }
      if (minBedrooms) {
        console.log('Applying minBedrooms filter:', minBedrooms);
        query = query.gte('bedrooms', parseInt(minBedrooms));
      }
      if (maxBedrooms) {
        console.log('Applying maxBedrooms filter:', maxBedrooms);
        query = query.lte('bedrooms', parseInt(maxBedrooms));
      }

      if (propertyTypes) {
        const typesArray = propertyTypes.split(',');
        console.log('Applying propertyTypes filter:', typesArray);
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
        console.log('Applying addedToSite filter:', addedToSite, 'Date:', date);
        query = query.gte('created_at', date.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      let listings = data || [];

      // Filter listings within the drawn polygon
      if (currentPolygonCoords && currentPolygonCoords.length > 0) {
        console.log('Filtering listings within polygon:', currentPolygonCoords);
        // Build a Turf.js polygon
        const turfPolygon = {
          type: 'Polygon',
          coordinates: [
            currentPolygonCoords.map((coord) => [coord.lng, coord.lat]), // Turf expects [lng, lat]
          ],
        };

        // Close the polygon if it's not already closed
        if (
          currentPolygonCoords[0].lat !==
            currentPolygonCoords[currentPolygonCoords.length - 1].lat ||
          currentPolygonCoords[0].lng !==
            currentPolygonCoords[currentPolygonCoords.length - 1].lng
        ) {
          turfPolygon.coordinates[0].push([
            currentPolygonCoords[0].lng,
            currentPolygonCoords[0].lat,
          ]);
          console.log('Closed the polygon:', turfPolygon.coordinates[0]);
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
              coordinates: [
                listing.coordinates.lng,
                listing.coordinates.lat,
              ],
            };

            const isInside = turf.booleanPointInPolygon(point, turfPolygon);
            if (isInside) {
              console.log(
                `Listing ID ${listing.id} is inside the polygon:`,
                isInside
              );
            }
            return isInside;
          } else {
            console.warn(
              `Listing ID ${listing.id} does not have valid coordinates. Skipping.`
            );
            return false;
          }
        });

        console.log('Listings count after polygon filtering:', listings.length);
      } else if (currentLocation) {
        // Existing radius filtering code
        const radiusInMeters = parseFloat(radiusParam) * 1000;
        const effectiveRadius = radiusInMeters || 1000; // Default to 1km if radius is 0
        console.log('Applying radius filter:', effectiveRadius, 'meters');

        listings = listings.filter((listing) => {
          if (
            listing.coordinates &&
            listing.coordinates.lat &&
            listing.coordinates.lng
          ) {
            const lat1 = listing.coordinates.lat;
            const lng1 = listing.coordinates.lng;
            const lat2 = currentLocation.lat;
            const lng2 = currentLocation.lng;

            const distance = getDistanceFromLatLonInMeters(
              lat1,
              lng1,
              lat2,
              lng2
            );
            const isWithinRadius = distance <= effectiveRadius;
            if (isWithinRadius) {
              console.log(
                `Listing ID ${listing.id} is within radius:`,
                distance,
                'meters'
              );
            }
            return isWithinRadius;
          } else {
            console.warn(
              `Listing ID ${listing.id} does not have valid coordinates. Skipping.`
            );
            return false;
          }
        });

        console.log('Listings count after radius filtering:', listings.length);
      }

      setListing(listings);
      console.log('Final listings set:', listings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to initialize data fetching
  const initialize = async () => {
    console.log('Initializing data fetching...');
    setInputValue(searchTerm);
    setShowMap(showMapParam === 'true');
    console.log('showMap set to:', showMapParam === 'true');

    // Parse polygon coordinates from the URL
    if (polygonParam) {
      try {
        const decoded = decodeURIComponent(polygonParam);
        const parsedCoords = JSON.parse(decoded);
        setPolygonCoords(parsedCoords);
        console.log('Parsed polygon coordinates:', parsedCoords);
        await fetchListings(searchTerm, null, parsedCoords);
      } catch (error) {
        console.error('Error parsing polygon coordinates:', error);
        await fetchListings(searchTerm, null, null);
      }
    } else if (searchTerm) {
      const locationData = await fetchCoordinates(searchTerm);
      if (locationData) {
        setCoordinates(locationData.coordinates);
        console.log('Fetched coordinates:', locationData.coordinates);
        await fetchListings(searchTerm, locationData.coordinates, null);
      } else {
        console.warn('No location data found for search term:', searchTerm);
        await fetchListings(searchTerm, null, null);
      }
    } else {
      console.log('No search term provided. Fetching all listings.');
      await fetchListings('', null, null);
    }
  };

  // Initialize data fetching on component mount and when search params change
  useEffect(() => {
    initialize();
    console.log('Data fetching initialized.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pathname, // Trigger effect when pathname changes
    searchTerm,
    typeParam,
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    propertyTypes,
    addedToSite,
    radiusParam,
    polygonParam, // Ensure useEffect runs when polygonParam changes
  ]);

  // Listen to popstate events to handle back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      console.log('Popstate event detected');
      // Re-initialize the component when popstate is triggered
      setLoading(true);
      const reinitialize = async () => {
        setInputValue(searchTerm);
        setShowMap(showMapParam === 'true');
        console.log('showMap set to:', showMapParam === 'true');

        // Parse polygon coordinates from the URL
        if (polygonParam) {
          try {
            const decoded = decodeURIComponent(polygonParam);
            const parsedCoords = JSON.parse(decoded);
            setPolygonCoords(parsedCoords);
            console.log('Parsed polygon coordinates:', parsedCoords);
            await fetchListings(searchTerm, null, parsedCoords);
          } catch (error) {
            console.error('Error parsing polygon coordinates:', error);
            await fetchListings(searchTerm, null, null);
          }
        } else if (searchTerm) {
          const locationData = await fetchCoordinates(searchTerm);
          if (locationData) {
            setCoordinates(locationData.coordinates);
            console.log('Fetched coordinates:', locationData.coordinates);
            await fetchListings(searchTerm, locationData.coordinates, null);
          } else {
            console.warn('No location data found for search term:', searchTerm);
            await fetchListings(searchTerm, null, null);
          }
        } else {
          console.log('No search term provided. Fetching all listings.');
          await fetchListings('', null, null);
        }
      };

      reinitialize();
    };

    window.addEventListener('popstate', handlePopState);
    console.log('Added popstate event listener.');

    return () => {
      window.removeEventListener('popstate', handlePopState);
      console.log('Removed popstate event listener.');
    };
  }, [
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
    fetchListings,
    fetchCoordinates,
  ]);

  // Listen to pageshow event to handle BFCache reloads
  useEffect(() => {
    const handlePageShow = (event) => {
      console.log('pageshow event triggered:', event);
      if (event.persisted) {
        console.log('Page was loaded from BFCache. Reloading.');
        window.location.reload();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    console.log('Added pageshow event listener.');

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      console.log('Removed pageshow event listener.');
    };
  }, []);

  const handleSearchClick = async () => {
    const term = inputValue.trim();
    console.log('Handle search click with term:', term);
    if (!term) return;

    const params = new URLSearchParams({
      search: term,
      type: typeParam,
      radius: radiusParam,
      ...(minPrice && { minPrice: minPrice }),
      ...(maxPrice && { maxPrice: maxPrice }),
      ...(propertyTypes && { propertyTypes: propertyTypes }),
      ...(minBedrooms && { minBedrooms: minBedrooms }),
      ...(maxBedrooms && { maxBedrooms: maxBedrooms }),
      ...(addedToSite !== 'Anytime' && { addedToSite: addedToSite }),
      ...(polygonCoords &&
        polygonCoords.length > 0 && {
          polygon: encodeURIComponent(
            JSON.stringify(
              polygonCoords.map((coord) => ({
                lat: coord.lat,
                lng: coord.lng,
              }))
            )
          ),
        }),
      showMap: showMap, // Include showMap in URL
    });

    const newUrl = `/listing-view?${params.toString()}`;
    console.log('Navigating to URL:', newUrl);
    router.push(newUrl);
    // The component will re-render with new searchParams
  };

  const handlePolygonComplete = (coords) => {
    console.log('Polygon completed with coordinates:', coords);
    setPolygonCoords(coords);
    fetchListings(searchTerm, null, coords);

    // Serialize polygon coordinates as a JSON string and encode
    const polygonSerialized = encodeURIComponent(
      JSON.stringify(
        coords.map((coord) => ({
          lat: coord.lat,
          lng: coord.lng,
        }))
      )
    );

    // Update the URL with the polygon parameter
    const params = new URLSearchParams({
      search: searchTerm,
      type: typeParam,
      radius: radiusParam,
      ...(minPrice && { minPrice: minPrice }),
      ...(maxPrice && { maxPrice: maxPrice }),
      ...(propertyTypes && { propertyTypes: propertyTypes }),
      ...(minBedrooms && { minBedrooms: minBedrooms }),
      ...(maxBedrooms && { maxBedrooms: maxBedrooms }),
      ...(addedToSite !== 'Anytime' && { addedToSite: addedToSite }),
      ...(polygonSerialized && { polygon: polygonSerialized }),
      showMap: showMap, // Include showMap in URL
    });

    const newUrl = `/listing-view?${params.toString()}`;
    console.log('Navigating to URL with polygon:', newUrl);
    router.push(newUrl);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen max-h-screen overflow-hidden bg-base-100">
      {/* Toggle Button for Mobile View */}
      <div className="lg:hidden sticky top-0 z-20 bg-base-100 border-b p-2">
        <button
          className="btn btn-outline w-full"
          onClick={() => setShowMap(!showMap)}
        >
          {showMap ? 'Show Listings' : 'Show Map'}
        </button>
      </div>

      {/* Listings Section */}
      <div
        className={`${
          showMap ? 'hidden' : 'flex-1'
        } lg:block lg:w-[55%] bg-base-100 overflow-y-auto border-r`}
      >
        <Suspense fallback={<div>Loading Listings...</div>}>
          <Listing
            listing={listing}
            loading={loading}
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSearchClick={handleSearchClick}
            setCoordinates={setCoordinates}
            propertyType={propertyType}
          />
        </Suspense>
      </div>

      {/* Map Section */}
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
              initialPolygonCoords={polygonCoords} // Pass initial polygon coords to the map component
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