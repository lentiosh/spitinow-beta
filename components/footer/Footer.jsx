'use client';
import Link from 'next/link';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight
} from 'lucide-react';

const HomeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-8 h-8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 21H9C6.6 21 5.4 21 4.7 20.3C4 19.6 4 18.4 4 16V11.2C4 10.1 4 9.6 4.3 9.1C4.6 8.6 5 8.3 5.9 7.6L9.9 4.3C11.1 3.2 11.7 2.7 12.5 2.7C13.3 2.7 13.9 3.2 15.1 4.3L19.1 7.6C20 8.3 20.4 8.6 20.7 9.1C21 9.6 21 10.1 21 11.2V16C21 18.4 21 19.6 20.3 20.3C19.6 21 18.4 21 16 21H15Z"
      stroke="url(#gradient)"
      strokeWidth="2"
    />
    <path
      d="M9 17H15"
      stroke="url(#gradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient id="gradient" x1="4" y1="2.7" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1ad1a5"/>
        <stop offset="1" stopColor="#ff9903"/>
      </linearGradient>
    </defs>
  </svg>
);

const Footer = () => {
  const quickLinks = [
    { name: 'Αρχική', path: '/' },
    { name: 'Κοινότητα', path: '/community' },
    { name: 'Αγγελίες', path: '/listing-view' },
    { name: 'Μεσίτες', path: '/companies' },
  ];

  const propertyTypes = [
    'Διαμερίσματα',
    'Μονοκατοικίες',
    'Επαγγελματικοί χώροι',
    'Οικόπεδα',
    'Εξοχικά'
  ];

  const popularAreas = [
    'Αθήνα',
    'Θεσσαλονίκη',
    'Πάτρα',
    'Ηράκλειο',
    'Λάρισα'
  ];

  return (
    <footer className="bg-base-100">
      <div className="max-w-[1400px] mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6 py-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <HomeIcon />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#1ad1a5] to-[#ff9903] bg-clip-text text-transparent">
                spitinow.com
              </span>
            </Link>
            <p className="text-base-content/70">
              Η μεγαλύτερη πλατφόρμα αναζήτησης ακινήτων στην Ελλάδα. Βρείτε το επόμενο σπίτι σας εύκολα και γρήγορα.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="btn btn-circle btn-ghost btn-sm">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="btn btn-circle btn-ghost btn-sm">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="btn btn-circle btn-ghost btn-sm">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="btn btn-circle btn-ghost btn-sm">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Γρήγορη Πρόσβαση</h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    href={link.path}
                    className="flex items-center text-base-content/70 hover:text-primary transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="text-lg font-bold mb-6">Τύποι Ακινήτων</h3>
            <ul className="space-y-4">
              {propertyTypes.map((type) => (
                <li key={type}>
                  <Link 
                    href={`/listing-view?type=${type}`}
                    className="flex items-center text-base-content/70 hover:text-primary transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    {type}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">Επικοινωνία</h3>
            <div className="space-y-4">
              <div className="flex items-center text-base-content/70">
                <MapPin className="w-5 h-5 mr-3 text-primary" />
                <p>Λεωφ. Κηφισίας 123, Αθήνα</p>
              </div>
              <div className="flex items-center text-base-content/70">
                <Phone className="w-5 h-5 mr-3 text-primary" />
                <p>+30 210 1234567</p>
              </div>
              <div className="flex items-center text-base-content/70">
                <Mail className="w-5 h-5 mr-3 text-primary" />
                <p>info@spitinow.com</p>
              </div>
              <div className="pt-4">
                <Link href="/contact">
                  <button className="btn btn-primary">
                    Επικοινωνήστε μαζί μας
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-base-300">
          <div className="px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-base-content/70 text-sm text-center md:text-left">
              © {new Date().getFullYear()} spitinow.com. Με επιφύλαξη παντός δικαιώματος.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-base-content/70">
              <Link href="/privacy" className="hover:text-primary">Πολιτική Απορρήτου</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-primary">Όροι Χρήσης</Link>
              <span>•</span>
              <Link href="/cookies" className="hover:text-primary">Πολιτική Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;