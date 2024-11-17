'use client';
import React from 'react';

const Provider = React.memo(({ children }) => {
  return (
    <>
      {children}
    </>
  );
});

export default Provider;
