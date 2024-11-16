import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Home, Plus, Menu, Search } from "lucide-react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Desktop Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-pink-600 text-3xl font-bold">spitinow.com</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/listings" className="text-gray-700 hover:text-gray-900">
                Καταλύματα
              </Link>
              <Link href="/add-listing" className="text-gray-700 hover:text-gray-900">
                Γίνετε οικοδεσπότης
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8"
                  }
                }}
              />
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        {children}
      </main>

      {/* Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="flex justify-around items-center h-16">
          <Link href="/" className="flex flex-col items-center p-2">
            <Home className="w-6 h-6 text-gray-500" />
            <span className="text-xs text-gray-500">Αρχική</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center p-2">
            <Search className="w-6 h-6 text-gray-500" />
            <span className="text-xs text-gray-500">Αναζήτηση</span>
          </Link>
          <Link href="/add-listing" className="flex flex-col items-center p-2">
            <Plus className="w-6 h-6 text-gray-500" />
            <span className="text-xs text-gray-500">Προσθήκη</span>
          </Link>
          <button className="flex flex-col items-center p-2">
            <Menu className="w-6 h-6 text-gray-500" />
            <span className="text-xs text-gray-500">Μενού</span>
          </button>
        </div>
      </div>
    </div>
  );
}