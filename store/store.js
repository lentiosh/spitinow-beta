// store/store.js
import {create} from 'zustand';

const useStore = create((set, get) => ({
  inputValue: '',
  setInputValue: (value) => set({ inputValue: value }),

  coordinates: null,
  setCoordinates: (coords) => set({ coordinates: coords }),

  propertyType: 'Rent',
  setPropertyType: (type) => set({ propertyType: type }),

  // **Filter State**
  filters: {
    radius: '0',
    minPrice: '',
    maxPrice: '',
    selectedPropertyTypes: [],
    minBedrooms: '',
    maxBedrooms: '',
    addedToSite: 'Anytime',
    sortBy: 'default', // Added sortBy for sorting listings
  },
  setFilters: (newFilters) => set({ filters: { ...get().filters, ...newFilters } }),
  resetFilters: () =>
    set({
      filters: {
        radius: '0',
        minPrice: '',
        maxPrice: '',
        selectedPropertyTypes: [],
        minBedrooms: '',
        maxBedrooms: '',
        addedToSite: 'Anytime',
        sortBy: 'default',
      },
    }),

  // **View Mode State**
  viewMode: 'grid', // 'grid' or 'list'
  setViewMode: (mode) => set({ viewMode: mode }),

  // **Liked Listings State**
  likedListings: new Set(),
  toggleLike: (id) =>
    set((state) => {
      const updatedLikes = new Set(state.likedListings);
      if (updatedLikes.has(id)) {
        updatedLikes.delete(id);
      } else {
        updatedLikes.add(id);
      }
      // Persist to localStorage
      localStorage.setItem('likedListings', JSON.stringify([...updatedLikes]));
      return { likedListings: updatedLikes };
    }),
  initializeLikes: () => {
    const savedLikes = localStorage.getItem('likedListings');
    if (savedLikes) {
      set({ likedListings: new Set(JSON.parse(savedLikes)) });
    }
  },

  // **Loading State**
  loading: false,
  setLoading: (value) => set({ loading: value }),

  // **Map and Polygon State**
  polygonCoords: [],
  setPolygonCoords: (coords) => set({ polygonCoords: coords }),

  // **Show Map State**
  showMap: false,
  toggleShowMap: () => set({ showMap: !get().showMap }),

  // **Filter Modal State**
  isFilterOpen: false,
  openFilter: () => set({ isFilterOpen: true }),
  closeFilter: () => set({ isFilterOpen: false }),

  // **Listings State**
  listing: [],
  setListing: (listings) => set({ listing: listings }),
}));

export default useStore;