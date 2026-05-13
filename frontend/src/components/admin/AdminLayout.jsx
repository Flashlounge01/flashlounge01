import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FaBolt, FaTachometerAlt, FaUtensils, FaCalendar,
  FaImages, FaStar, FaCalendarCheck, FaBars, FaTimes, FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', icon: FaTachometerAlt, label: 'Dashboard', end: true },
  { to: '/admin/menu', icon: FaUtensils, label: 'Menu' },
  { to: '/admin/events', icon: FaCalendar, label: 'Events' },
  { to: '/admin/gallery', icon: FaImages, label: 'Gallery' },
  { to: '/admin/models', icon: FaStar, label: 'Model Voting' },
  { to: '/admin/reservations', icon: FaCalendarCheck, label: 'Reservations' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-flash-black flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-flash-dark border-r border-flash-border z-50 transform transition-transform duration-300 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>

        {/* Logo */}
        <div className="p-5 border-b border-flash-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-flash-yellow rounded-lg flex items-center justify-center">
              <FaBolt className="text-flash-black" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">Flash Admin</div>
              <div className="text-flash-yellow text-xs leading-tight">Dashboard</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="p-3 border-t border-flash-border">
          <div className="px-4 py-2 text-xs text-gray-500 mb-1">{user?.email}</div>
          <button onClick={handleLogout} className="admin-sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <FaSignOutAlt size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-flash-dark border-b border-flash-border sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-300 hover:text-flash-yellow p-1">
            <FaBars size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-flash-yellow rounded flex items-center justify-center">
              <FaBolt className="text-flash-black text-xs" />
            </div>
            <span className="text-white font-bold text-sm">Flash Admin</span>
          </div>
          <div className="w-8" />
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
