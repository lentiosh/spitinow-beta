'use client'
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { Bell, Menu, X, User } from 'lucide-react';

const HomeIcon = () => (
  <div className="relative">
    <svg
      viewBox="0 0 24 24"
      className="w-8 h-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V9.5Z"
        stroke="#00ccbc"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 21V12H15V21"
        stroke="#00ccbc"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="absolute top-0 right-[-10px] text-xs font-bold text-white bg-red-500 rounded-full px-1">
      BETA
    </span>
  </div>
);

const Navbar = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();

  const navLinks = [
    { name: 'Κοινότητα', path: '/community' },
    { name: 'Μεσίτες', path: '/companies' },
    { name: 'Καταχώρηση', path: '/add-new-listing' },
  ];

  return (
    <div className="navbar mx-auto px-6 lg:px12 left-0 right-0 bg-base-100 sticky top-0 z-40 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <label 
            tabIndex={0} 
            className="btn btn-ghost lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </label>
          {menuOpen && (
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    onClick={() => setMenuOpen(false)}
                    className={pathname === link.path ? 'text-[#1ad1a5]' : ''}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link href="/" className="btn btn-ghost">
          <div className="flex items-center space-x-2">
            <HomeIcon />
            <span className="text-xl font-bold bg-gradient-to-r from-[#00ccbc] to-[#1ad1a5] bg-clip-text text-transparent">
              spitinow.com
            </span>
          </div>
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                href={link.path}
                className={`px-4 py-2 text-base font-semibold rounded-lg 
                  ${pathname === link.path ? 'text-[#1ad1a5] bg-[#1ad1a5]/10' : 'hover:bg-gray-200'}`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar-end">
        {isSignedIn ? (
          <div className="flex items-center space-x-2">
            <button className="btn btn-ghost btn-circle">
              <Bell className="w-5 h-5" />
            </button>
            <div className="ml-2">
              <UserButton />
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link href="/sign-in" className="hidden md:block">
              <button className="btn btn-ghost text-[#1ad1a5]">
                Σύνδεση
              </button>
            </Link>
            <Link href="/sign-up" className="hidden md:block">
              <button className="btn bg-[#1ad1a5] text-white hover:bg-[#1ad1a5] border-none">
                Εγγραφή
              </button>
            </Link>
            <Link href="/sign-in" className="md:hidden">
              <button className="btn btn-ghost btn-circle">
                <User className="w-5 h-5" />
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;