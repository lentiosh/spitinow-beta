'use client';

import React from 'react';
import { LoadScript } from '@react-google-maps/api';

const Provider = React.memo(({ children }) => {
  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACE_API_KEY}
      libraries={['places', 'drawing']}
    >
      {children}
    </LoadScript>
  );
});

export default Provider;
