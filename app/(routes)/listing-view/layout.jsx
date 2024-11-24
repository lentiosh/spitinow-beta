'use client';

import React, { Suspense } from 'react';
import Navbar from '@/components/navbar/Navbar';

const Layout = ({ children }) => {

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