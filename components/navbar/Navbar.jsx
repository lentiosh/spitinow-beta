'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import UserMenu from './UserMenu';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Κοινότητα', path: '/community' },
    { name: 'Μεσίτες', path: '/agencies' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white shadow z-50">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between h-14">
          {/* Left Side: Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              className="btn btn-ghost btn-circle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Center: Logo */}
          <div className="flex-1 flex items-center justify-center lg:justify-start">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                {/* Logo with rounded background */}
                <div className="w-8 h-8 bg-[#FF385C] rounded-full flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 text-white"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V9.5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 21V12H15V21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {/* Logo Text */}
                <span className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-orange-500">
                  spitinow.com
                </span>
              </div>
            </Link>
          </div>

          {/* Right Side: User Menu and Nav Links */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex space-x-4">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer ${
                      pathname === link.path
                        ? 'text-[#FF385C] bg-[#FF385C]/10'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
            {/* UserMenu */}
            <UserMenu />
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white shadow-md">
            <div className="px-4 pt-4 pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <span
                    onClick={() => setMenuOpen(false)}
                    className={`block px-4 py-2 rounded-full text-base font-medium cursor-pointer ${
                      pathname === link.path
                        ? 'text-[#FF385C] bg-[#FF385C]/10'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      <div className="h-14" />
    </>
  );
};

export default Navbar;
