'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { MapPin, Share, Heart } from 'lucide-react';

const Map = dynamic(() => import('@/components/google/Map'), {
  ssr: false,
});
const Amenities = React.lazy(() => import('../Amenities'));

const ListingDetails = () => {
  const { slug } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const fetchListing = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listing')
        .select(`*, listingImages ( url ), coordinates`)
        .eq('id', slug)
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchListing();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Listing not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">{listing.title}</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm underline">{listing.address}</span>
            </div>
            <div className="text-sm text-gray-500">
              {listing.neighborhood && `· ${listing.neighborhood}`}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-sm hover:bg-gray-100 rounded-full px-4 py-2">
              <Share className="w-4 h-4 mr-2" />
              Share
            </button>
            <button className="flex items-center text-sm hover:bg-gray-100 rounded-full px-4 py-2">
              <Heart className="w-4 h-4 mr-2" />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {!showAllPhotos ? (
        <div className="relative">
          {listing.listingImages && listing.listingImages.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 aspect-[2/1] rounded-xl overflow-hidden">
              <div className="col-span-2 row-span-2 relative">
                <Image
                  src={listing.listingImages[0].url}
                  alt="Main listing image"
                  fill
                  className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
                  onClick={() => setShowAllPhotos(true)}
                />
              </div>
              <div className="relative">
                <Image
                  src={listing.listingImages[1]?.url || listing.listingImages[0].url}
                  alt="Listing image"
                  fill
                  className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
                  onClick={() => setShowAllPhotos(true)}
                />
              </div>
              <div className="relative">
                <Image
                  src={listing.listingImages[2]?.url || listing.listingImages[0].url}
                  alt="Listing image"
                  fill
                  className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
                  onClick={() => setShowAllPhotos(true)}
                />
              </div>
              <div className="relative">
                <Image
                  src={listing.listingImages[3]?.url || listing.listingImages[0].url}
                  alt="Listing image"
                  fill
                  className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
                  onClick={() => setShowAllPhotos(true)}
                />
              </div>
              <div className="relative">
                <Image
                  src={listing.listingImages[4]?.url || listing.listingImages[0].url}
                  alt="Listing image"
                  fill
                  className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
                  onClick={() => setShowAllPhotos(true)}
                />
              </div>
            </div>
          ) : (
            <div className="aspect-[2/1] bg-gray-100 rounded-xl flex items-center justify-center">
              <p>No images available</p>
            </div>
          )}
          <button
            className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:scale-105 transition-transform"
            onClick={() => setShowAllPhotos(true)}
          >
            Show all photos
          </button>
        </div>
      ) : (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <button
              className="mb-4 text-sm font-semibold hover:underline"
              onClick={() => setShowAllPhotos(false)}
            >
              ← Back to listing
            </button>
            <div className="grid grid-cols-2 gap-4">
              {listing.listingImages.map((image, index) => (
                <div key={index} className="relative aspect-[4/3]">
                  <Image
                    src={image.url}
                    alt={`Listing image ${index + 1}`}
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
        {/* Left Column */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between pb-6 border-b">
            <div>
              <h2 className="text-xl font-semibold">
                {listing.propertyType} hosted by Owner
              </h2>
              <p className="text-gray-600 mt-1">
                {listing.bedrooms} bedrooms · {listing.bathrooms} bathrooms ·{' '}
                {listing.area} sq.m
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-200"></div>
          </div>

          <div className="py-8 border-b">
            <p className="text-gray-800 whitespace-pre-line">{listing.description}</p>
          </div>

          <div className="py-8 border-b">
            <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
            <Suspense fallback={<div>Loading amenities...</div>}>
              <Amenities listing={listing} />
            </Suspense>
          </div>

          <div className="py-8">
            <h3 className="text-xl font-semibold mb-4">Location</h3>
            <div className="aspect-[16/9] rounded-xl overflow-hidden">
              {listing.coordinates && (
                <Suspense fallback={<div>Loading map...</div>}>
                  <Map coordinates={listing.coordinates} />
                </Suspense>
              )}
            </div>
            <p className="mt-4 text-gray-600">{listing.address}</p>
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-gray-200 p-6 shadow-xl">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-2xl font-semibold">
                  €{listing.price.toLocaleString()}
                </span>
                <span className="text-gray-600">
                  {listing.type === 'Rent' ? ' / month' : ''}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="col-span-2 border rounded-t-lg p-3">
                <label className="block text-xs font-semibold">CHECK-IN</label>
                <input type="date" className="w-full mt-1" />
              </div>
              {listing.type === 'Rent' && (
                <div className="col-span-2 border border-t-0 rounded-b-lg p-3">
                  <label className="block text-xs font-semibold">DURATION</label>
                  <select className="w-full mt-1 p-1">
                    <option>6 months</option>
                    <option>12 months</option>
                    <option>18 months</option>
                  </select>
                </div>
              )}
            </div>

            <button className="w-full bg-[#FF385C] text-white py-3 rounded-lg font-semibold hover:bg-[#FF385C]/90 transition-colors">
              {listing.type === 'Rent' ? 'Request to book' : 'Contact agent'}
            </button>

            {listing.type === 'Sell' && (
              <div className="mt-6">
                <h4 className="font-semibold">Estimated monthly cost</h4>
                <p className="text-gray-600 mt-2">
                  €{(listing.price * 0.005).toLocaleString()} / month
                </p>
                <button className="w-full mt-4 border border-gray-900 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  Calculate mortgage
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;