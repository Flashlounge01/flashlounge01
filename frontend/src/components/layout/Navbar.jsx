import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/events', label: 'Events' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/voting', label: 'Vote' },
  { to: '/reserve', label: 'Reserve' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-flash-black/90 backdrop-blur-md border-b border-flash-border/50' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img src="/logo.png" alt="Flash Lounge" className="h-20 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 link-hover ${
                  location.pathname === to
                    ? 'text-flash-yellow'
                    : 'text-gray-300 hover:text-flash-yellow'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Reserve CTA */}
          <Link to="/reserve" className="hidden md:block btn-primary text-sm py-2">
            Book a Table
          </Link>

          {/* Mobile menu toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden text-gray-300 hover:text-flash-yellow p-2">
            {open ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — animated with max-height transition */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-flash-dark border-t border-flash-border px-4 pt-3 pb-5 space-y-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`block px-4 py-3.5 rounded-lg font-medium transition-colors text-base ${
                location.pathname === to ? 'text-flash-yellow bg-flash-card' : 'text-gray-300 hover:text-flash-yellow hover:bg-flash-card'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link to="/reserve" className="btn-primary w-full justify-center mt-3">
            Book a Table
          </Link>
        </div>
      </div>
    </nav>
  );
}
