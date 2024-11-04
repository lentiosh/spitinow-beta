'use client';

import React from 'react';
import { LoadScript } from '@react-google-maps/api';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';

const Provider = ({ children }) => {
  return (
    <div>
      <Navbar />
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACE_API_KEY}
        libraries={['places']}
      >
        {children}
      </LoadScript>
      <Footer />
    </div>
  );
};

export default Provider;
