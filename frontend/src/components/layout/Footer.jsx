import { Link } from 'react-router-dom';
import { FaBolt, FaPhone, FaMapMarkerAlt, FaClock, FaTiktok, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-flash-dark border-t border-flash-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-flash-yellow rounded-lg flex items-center justify-center">
                <FaBolt className="text-flash-black text-lg" />
              </div>
              <div>
                <div className="text-white font-display font-bold text-sm leading-tight">Flash Lounge</div>
                <div className="text-flash-yellow text-xs font-semibold tracking-widest">N SUITE</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Your premium 24-hour lounge destination. Experience luxury, entertainment, and exceptional service every hour of the day.
            </p>
            <div className="text-flash-yellow font-display font-bold italic text-lg">"Flash Ways"</div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
            <div className="space-y-3 text-gray-400 text-sm">
              <a href="tel:07059693068" className="flex items-center gap-3 hover:text-flash-yellow transition-colors">
                <FaPhone className="text-flash-yellow flex-shrink-0" />
                07059693068
              </a>
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-flash-yellow flex-shrink-0 mt-0.5" />
                <span>No 6 Rumuologu/Alakahia Link Road, Port Harcourt</span>
              </div>
              <a href="mailto:flashloungeandsuite@gmail.com" className="flex items-center gap-3 hover:text-flash-yellow transition-colors">
                <FaEnvelope className="text-flash-yellow flex-shrink-0" />
                flashloungeandsuite@gmail.com
              </a>
              <div className="flex items-center gap-3">
                <FaClock className="text-flash-yellow flex-shrink-0" />
                <span>Open 24 Hours • 7 Days a Week</span>
              </div>
              <a
                href="https://www.tiktok.com/@flashlounge_suite"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-flash-yellow transition-colors"
              >
                <FaTiktok className="text-flash-yellow flex-shrink-0" />
                @flashlounge_suite
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <div className="space-y-2">
              {[
                { to: '/menu', label: 'Our Menu' },
                { to: '/events', label: 'Upcoming Events' },
                { to: '/gallery', label: 'Photo Gallery' },
                { to: '/voting', label: 'Model Voting' },
                { to: '/reserve', label: 'Make Reservation' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="block text-gray-400 text-sm hover:text-flash-yellow transition-colors link-hover"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-flash-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-xs">
          <p>© {new Date().getFullYear()} Flash Lounge N Suite. All rights reserved.</p>
          <Link to="/admin/login" className="hover:text-flash-yellow transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
