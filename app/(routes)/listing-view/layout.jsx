'use client';

import React from 'react';
import Provider from './Provider';
import Navbar from '@/components/navbar/Navbar';

const Layout = ({ children }) => {
  return (
    <Provider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    </Provider>
  );
};

export default Layout;
