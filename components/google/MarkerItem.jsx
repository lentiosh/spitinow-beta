'use client'
import { MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useState } from 'react';
import Image from 'next/image';

const MarkerItem = ({ item }) => {
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  const handleMarkerClick = () => {
    setShowInfoWindow(true);
  };

  const handleCloseClick = () => {
    setShowInfoWindow(false);
  };

  const markerLabel = {
    text: `$${item.price}`,
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  const markerIcon = {
    path: 'M0,0 C-20,0 -20,-20 0,-40 C20,-20 20,0 0,0 z',
    fillColor: '#FF5A5F',
    fillOpacity: 1,
    strokeColor: '#FFFFFF',
    strokeWeight: 2,
    scale: 1,
    labelOrigin: new google.maps.Point(0, -20),
  };

  return (
    <>
      <MarkerF
        position={item.coordinates}
        onClick={handleMarkerClick}
        label={markerLabel}
        icon={markerIcon}
      />
      {showInfoWindow && (
        <InfoWindowF position={item.coordinates} onCloseClick={handleCloseClick}>
          <div
            style={{
              maxWidth: '200px',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '120px',
                overflow: 'hidden',
                borderRadius: '8px',
              }}
            >
              <Image
                src={item.listingImages[0]?.url}
                alt={item.name}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <p
              style={{
                margin: '5px 0',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              ${item.price}
            </p>
          </div>
        </InfoWindowF>
      )}
    </>
  );
};

export default MarkerItem;
