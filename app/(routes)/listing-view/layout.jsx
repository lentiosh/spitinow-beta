// components/Layout.js
'use client';

import React, { Suspense, lazy } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { usePageReloadOnBack } from '@/utils/navigationUtils'; // Adjusted import path

const Layout = ({ children }) => {
  usePageReloadOnBack(); // Initialize the hard reload on back navigation

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
};

export default Layout;