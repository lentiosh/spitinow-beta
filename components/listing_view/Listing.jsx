'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Heart, 
  Bed, 
  Bath, 
  Home, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Share2,
  Plus,
  Minus,
  Grid,
  List,
  SlidersHorizontal
} from 'lucide-react';
import GoogleAddressSearch from '../google/GoogleAddressSearch';
import PropertiesFilter from './PropertiesFilter';

const PriceFormatter = new Intl.NumberFormat('el-GR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const ImageCarousel = React.memo(({ images, address }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handlePrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <Image
        src={images[currentIndex]?.url || '/placeholder.png'}
        alt={`Image ${currentIndex + 1} of ${address}`}
        fill
        className={`
          object-cover
          transition-transform duration-300
          group-hover:scale-105
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        onLoadingComplete={() => setIsLoading(false)}
      />
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors duration-200"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors duration-200"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
});

const ListingCard = React.memo(({ item, onClick, onLike, isLiked }) => {
  const formattedPrice = useMemo(() => PriceFormatter.format(item.price), [item.price]);
  
  const handleLikeClick = (e) => {
    e.stopPropagation();
    onLike(item.id);
  };

  const handleShareClick = async (e) => {
    e.stopPropagation();
    try {
      await navigator.share({
        title: item.address,
        text: item.description,
        url: `/listing-view/${item.id}`,
      });
    } catch (error) {
      console.log('Sharing failed', error);
    }
  };

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <ImageCarousel images={item.listingImages} address={item.address} />
      
      <div className="absolute top-3 right-3 flex gap-2">
        <button 
          onClick={handleShareClick}
          className="p-2 rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors duration-200"
          aria-label="Share listing"
        >
          <Share2 className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          onClick={handleLikeClick}
          className="p-2 rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors duration-200"
          aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart 
            className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 leading-tight">
            {item.address}
          </h3>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-4 mb-3">
          {item.bedrooms && (
            <div className="flex items-center text-gray-500">
              <Bed className="w-4 h-4 mr-1.5" />
              <span className="text-sm">{item.bedrooms} κρεβάτια</span>
            </div>
          )}
          {item.bathrooms && (
            <div className="flex items-center text-gray-500">
              <Bath className="w-4 h-4 mr-1.5" />
              <span className="text-sm">{item.bathrooms} μπάνια</span>
            </div>
          )}
          {item.propertyType && (
            <div className="flex items-center text-gray-500">
              <Home className="w-4 h-4 mr-1.5" />
              <span className="text-sm">{item.propertyType}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-lg font-semibold text-gray-900">
              {formattedPrice}
            </span>
            {item.type === 'Rent' && (
              <span className="text-sm font-normal text-gray-500">/μήνα</span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {item.squareMeters} τ.μ.
          </div>
        </div>
      </div>
    </div>
  );
});

const Listing = React.memo(({
  listing = [],
  loading = false,
  inputValue = '',
  setInputValue,
  handleSearchClick,
  setCoordinates,
  initialFilters = {},
  onFiltersApplied,
  propertyType,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [likedListings, setLikedListings] = useState(new Set());
  const [sortBy, setSortBy] = useState('default');
  const router = useRouter();
  const listingsRef = useRef(null);

  // Handle liked listings persistence
  useEffect(() => {
    const savedLikes = localStorage.getItem('likedListings');
    if (savedLikes) {
      setLikedListings(new Set(JSON.parse(savedLikes)));
    }
  }, []);

  const handleLike = useCallback((id) => {
    setLikedListings(prev => {
      const newLikes = new Set(prev);
      if (newLikes.has(id)) {
        newLikes.delete(id);
      } else {
        newLikes.add(id);
      }
      localStorage.setItem('likedListings', JSON.stringify([...newLikes]));
      return newLikes;
    });
  }, []);

  const sortedListings = useMemo(() => {
    let sorted = [...listing];
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'size-desc':
        return sorted.sort((a, b) => b.squareMeters - a.squareMeters);
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return sorted;
    }
  }, [listing, sortBy]);

  const handleListingClick = useCallback((id) => {
    router.push(`/listing-view/${id}`);
  }, [router]);

  const handleScroll = useCallback(() => {
    if (listingsRef.current) {
      const { scrollTop } = listingsRef.current;
      // Add shadow to header when scrolled
      document.getElementById('listing-header')?.classList.toggle('shadow-md', scrollTop > 0);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        id="listing-header"
        className="bg-white border-b sticky top-0 z-20 transition-shadow duration-200"
      >
        <div className="container mx-auto px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Καταχωρήσεις Ακινήτων
            </h1>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="
                  flex items-center gap-2
                  px-4 py-2
                  bg-white
                  border border-gray-200
                  rounded-full
                  text-sm font-medium
                  text-gray-700
                  hover:bg-gray-50
                  transition-colors
                  duration-200
                "
                aria-label="Open filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Φίλτρα
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <GoogleAddressSearch
                selectedAddress={(address) => {
                  if (address?.coordinates) {
                    setCoordinates(address.coordinates);
                    setInputValue(address.description);
                  }
                }}
                inputValue={inputValue}
                setInputValue={setInputValue}
                placeholder="Αναζήτηση τοποθεσίας..."
              />
            </div>
            <button
              onClick={handleSearchClick}
              className="
                px-6 py-3.5
                bg-primary
                text-white
                rounded-xl
                font-medium
                hover:bg-primary/90
                transition-colors
                duration-200
                shadow-sm
                flex-shrink-0
              "
            >
              Αναζήτηση
            </button>
          </div>
        </div>
      </div>

      {/* Results Count & Sort */}
      <div className="bg-white border-b sticky top-[97px] z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {sortedListings.length} ακίνητα βρέθηκαν
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border-0 bg-transparent font-medium text-gray-700 focus:ring-0 cursor-pointer"
            aria-label="Sort listings"
          >
            <option value="default">Προτεινόμενα</option>
            <option value="price-asc">Τιμή (Χαμηλή → Υψηλή)</option>
            <option value="price-desc">Τιμή (Υψηλή → Χαμηλή)</option>
            <option value="size-desc">Μέγεθος (Μεγαλύτερο)</option>
            <option value="newest">Νεότερα πρώτα</option>
          </select>
        </div>
      </div>

      {/* Listings Grid/List */}
      <div 
        ref={listingsRef}
        className="container mx-auto p-4 overflow-auto"
        onScroll={handleScroll}
      >
        {loading ? (
          <div className={`
            grid gap-6
            ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}
          `}>
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
              >
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`
            grid gap-6
            ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}
          `}>
            {sortedListings.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                onClick={() => handleListingClick(item.id)}
                onLike={handleLike}
                isLiked={likedListings.has(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {!loading && sortedListings.length === 0 && (
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Δεν βρέθηκαν ακίνητα
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης ή να αναζητήσετε σε διαφορετική περιοχή
            </p>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <PropertiesFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        location={inputValue}
        propertyType={propertyType}
        initialFilters={initialFilters}
        onFiltersApplied={onFiltersApplied}
      />

      {/* Floating Search Button for Mobile */}
      <div className="sm:hidden fixed bottom-6 right-6">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="
            w-14 h-14
            flex items-center justify-center
            bg-primary
            text-white
            rounded-full
            shadow-lg
            hover:bg-primary/90
            transition-colors
            duration-200
          "
          aria-label="Open filters"
        >
          <MapPin className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
});

// Add display names for better debugging
Listing.displayName = 'Listing';
ListingCard.displayName = 'ListingCard';

export default Listing;