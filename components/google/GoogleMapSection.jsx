// GoogleMapSection.jsx

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, InfoWindow, useLoadScript } from '@react-google-maps/api';
import MarkerItem from './MarkerItem';
import Image from 'next/image';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const libraries = ['places', 'drawing'];

function GoogleMapSection({ coordinates, listings, onPolygonComplete }) {
  const [map, setMap] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [polygon, setPolygon] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACE_API_KEY,
    libraries,
  });

  const onLoad = useCallback(
    (mapInstance) => {
      setMap(mapInstance);
      if (coordinates) {
        mapInstance.panTo(coordinates);
        if (mapInstance.getZoom() < 13) {
          mapInstance.setZoom(13);
        }
      }

      // Initialize DrawingManager
      const drawingManagerInstance = new window.google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false, // We will add our own control
      });

      drawingManagerInstance.setMap(mapInstance);

      window.google.maps.event.addListener(
        drawingManagerInstance,
        'overlaycomplete',
        function (event) {
          if (event.type === window.google.maps.drawing.OverlayType.POLYGON) {
            // Remove previous polygon
            if (polygon) {
              polygon.setMap(null);
            }

            const newPolygon = event.overlay;
            setPolygon(newPolygon);

            // Get polygon coordinates
            const path = newPolygon.getPath().getArray();
            const coordinates = path.map((latLng) => ({
              lat: latLng.lat(),
              lng: latLng.lng(),
            }));

            // Pass coordinates up to parent component
            if (onPolygonComplete) {
              onPolygonComplete(coordinates);
            }

            // Disable drawing mode
            drawingManagerInstance.setDrawingMode(null);
            setIsDrawingMode(false);
          }
        }
      );

      setDrawingManager(drawingManagerInstance);
    },
    [coordinates, onPolygonComplete, polygon]
  );

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleDrawButtonClick = () => {
    if (drawingManager) {
      if (isDrawingMode) {
        // Disable drawing mode
        drawingManager.setDrawingMode(null);
        setIsDrawingMode(false);
      } else {
        // Remove existing polygon
        if (polygon) {
          polygon.setMap(null);
          setPolygon(null);
        }
        // Enable drawing mode
        drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
        setIsDrawingMode(true);
      }
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading Maps...</div>;
  }

  return coordinates ? (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Add the custom search area button */}
      <button
        onClick={handleDrawButtonClick}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 10,
          backgroundColor: '#fff',
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        {isDrawingMode ? 'Cancel Drawing' : 'Create your custom search area'}
      </button>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={coordinates}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {listings &&
          listings.map((listing, index) => (
            <MarkerItem
              key={index}
              item={listing}
              onClick={() => setSelectedListing(listing)}
            />
          ))}

        {selectedListing && selectedListing.coordinates && (
          <InfoWindow
            position={{
              lat: selectedListing.coordinates.lat,
              lng: selectedListing.coordinates.lng,
            }}
            onCloseClick={() => setSelectedListing(null)}
          >
            <div style={{ maxWidth: '220px', padding: '0', margin: '0' }}>
              {/* InfoWindow content */}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">
      <p>Enter a location to view the map.</p>
    </div>
  );
}

export default React.memo(GoogleMapSection);
