'use client';

import React from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const Map = ({ coordinates }) => {
  const mapOptions = {
    disableDefaultUI: true,
    clickableIcons: false,
  };

  return (
    <div className="w-full h-full">
      <GoogleMap
        zoom={14}
        center={coordinates}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        options={mapOptions}
      >
        <Marker position={coordinates} />
      </GoogleMap>
    </div>
  );
};

export default React.memo(Map);