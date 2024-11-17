'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, InfoWindow, useLoadScript } from '@react-google-maps/api';
import MarkerItem from './MarkerItem';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const libraries = ['places', 'drawing', 'geometry'];

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

      const drawingManagerInstance = new window.google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
      });

      drawingManagerInstance.setMap(mapInstance);

      window.google.maps.event.addListener(
        drawingManagerInstance,
        'overlaycomplete',
        function (event) {
          if (event.type === window.google.maps.drawing.OverlayType.POLYGON) {
            if (polygon) {
              polygon.setMap(null);
            }

            const newPolygon = event.overlay;
            setPolygon(newPolygon);

            const path = newPolygon.getPath().getArray();
            const coordinates = path.map((latLng) => ({
              lat: latLng.lat(),
              lng: latLng.lng(),
            }));

            if (onPolygonComplete) {
              onPolygonComplete(coordinates);
            }

            drawingManagerInstance.setDrawingMode(null);
            setIsDrawingMode(false);
          }
        }
      );

      setDrawingManager(drawingManagerInstance);
    },
    [onPolygonComplete, polygon]
  );

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleDrawButtonClick = () => {
    if (drawingManager) {
      if (isDrawingMode) {
        drawingManager.setDrawingMode(null);
        setIsDrawingMode(false);
      } else {
        if (polygon) {
          polygon.setMap(null);
          setPolygon(null);
        }
        drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
        setIsDrawingMode(true);
      }
    }
  };

  const handleRemoveArea = () => {
    if (polygon) {
      polygon.setMap(null);
      setPolygon(null);

      const center = map.getCenter();

      const radiusInMeters = 10000;
      const circlePath = createCircularPolygon(center, radiusInMeters, 64);

      const newPolygon = new window.google.maps.Polygon({
        paths: circlePath,
        map: map,
      });

      setPolygon(newPolygon);

      const coordinates = circlePath.map((latLng) => ({
        lat: latLng.lat(),
        lng: latLng.lng(),
      }));

      if (onPolygonComplete) {
        onPolygonComplete(coordinates);
      }
    }
  };

  const createCircularPolygon = (center, radius, numPoints) => {
    const circlePoints = [];
    for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * 360;
      const point = window.google.maps.geometry.spherical.computeOffset(
        center,
        radius,
        angle
      );
      circlePoints.push(point);
    }
    return circlePoints;
  };

  useEffect(() => {
    if (map && listings && listings.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      listings.forEach((listing) => {
        if (listing.coordinates) {
          bounds.extend(
            new window.google.maps.LatLng(
              listing.coordinates.lat,
              listing.coordinates.lng
            )
          );
        }
      });
      map.fitBounds(bounds);
    }
  }, [map, listings]);

  if (loadError) {
    return <div>Σφάλμα φόρτωσης χαρτών</div>;
  }

  if (!isLoaded) {
    return <div>Φόρτωση χαρτών...</div>;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
        <button
          onClick={handleDrawButtonClick}
          style={{
            backgroundColor: '#1f233a',
            color: '#f8f6f4',
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            cursor: 'pointer',
            marginRight: '8px',
          }}
        >
          {isDrawingMode ? 'Ακύρωση σχεδίασης' : 'Δημιουργήστε την περιοχή σας'}
        </button>
        {polygon && !isDrawingMode && (
          <button
            onClick={handleRemoveArea}
            style={{
              backgroundColor: '#ff5d5d',
              color: '#f8f6f4',
              padding: '5px 10px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            Αφαίρεση περιοχής
          </button>
        )}
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          gestureHandling: 'greedy',
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
            {/* You can add content here, e.g., listing details */}
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default GoogleMapSection;
