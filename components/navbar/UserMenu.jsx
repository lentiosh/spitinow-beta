'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import { User, PlusCircle } from 'lucide-react';

const UserMenu = () => {
  const { isLoaded, isSignedIn } = useUser();
  const [mounted, setMounted] = useState(false);

  // Ensure the component only renders after it's mounted to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Define the size of the container
  const containerStyles = 'flex items-center space-x-2 w-[100px]';

  if (!mounted || !isLoaded) {
    // Render a placeholder during SSR and initial mount
    return (
      <div className={containerStyles}>
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={containerStyles}>
      {isSignedIn ? (
        <>
          <Link href="/add-new-listing">
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Προσθήκη αγγελίας"
            >
              <PlusCircle className="w-6 h-6 text-gray-700" />
            </button>
          </Link>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: {
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  overflow: 'hidden',
                },
              },
            }}
          />
        </>
      ) : (
        <>
          <Link href="/sign-up" className="hidden md:block">
            <button
              className="btn btn-outline text-[#FF385C] border-[#FF385C] hover:bg-[#FF385C] hover:text-white rounded-full"
              style={{ width: '80px', height: '40px' }}
            >
              Εγγραφή
            </button>
          </Link>
          <Link href="/sign-in">
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Σύνδεση"
            >
              <User className="w-6 h-6 text-gray-700" />
            </button>
          </Link>
        </>
      )}
    </div>
  );
};

export default UserMenu;
