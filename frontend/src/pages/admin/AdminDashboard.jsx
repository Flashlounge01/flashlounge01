import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarCheck, FaStar, FaClock, FaTrophy, FaArrowRight } from 'react-icons/fa6';
import { FaUsers } from 'react-icons/fa';
import api from '../../utils/api';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="stat-card">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="text-xl text-white" />
    </div>
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-white font-bold text-2xl">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then((res) => setStats(res.data)).finally(() => setLoading(false));
    const interval = setInterval(() => {
      api.get('/dashboard/stats').then((res) => setStats(res.data)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => <div key={i} className="card h-24" />)}
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-white font-bold text-2xl">Dashboard</h1>
        <p className="text-gray-400 text-sm">Welcome back, Flash Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FaCalendarCheck} label="Total Reservations" value={stats?.total_reservations ?? 0} color="bg-blue-600" sub={`${stats?.today_reservations ?? 0} today`} />
        <StatCard icon={FaClock} label="Pending Requests" value={stats?.pending_reservations ?? 0} color="bg-yellow-600" sub="Awaiting confirmation" />
        <StatCard icon={FaStar} label="Total Votes" value={(stats?.total_votes ?? 0).toLocaleString()} color="bg-purple-600" sub="All time" />
        <StatCard icon={FaUsers} label="Vote Revenue" value={`\u20A6${(stats?.total_revenue ?? 0).toLocaleString()}`} color="bg-green-600" sub="All time earnings" />
      </div>

      {/* Top Models */}
      {stats?.top_models?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <FaTrophy className="text-flash-yellow" /> Top Models by Votes
            </h2>
            <Link to="/admin/models" className="text-flash-yellow text-sm hover:underline flex items-center gap-1">
              Manage <FaArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.top_models.map((model, idx) => (
              <div key={model.id} className="flex items-center gap-3 p-3 rounded-lg bg-flash-dark">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-400 text-black' : 'bg-yellow-800 text-white'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{model.name}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{Number(model.vote_count).toLocaleString()} votes</span>
                    <span>₦{Number(model.total_revenue).toLocaleString()} earned</span>
                  </div>
                </div>
                <div className="w-24 bg-flash-border rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-flash-yellow h-full rounded-full"
                    style={{ width: `${Math.round((model.vote_count / (stats.top_models[0]?.vote_count || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { to: '/admin/reservations', label: 'View Reservations', color: 'border-blue-500/30 hover:border-blue-500' },
          { to: '/admin/menu', label: 'Add Menu Item', color: 'border-green-500/30 hover:border-green-500' },
          { to: '/admin/events', label: 'Create Event', color: 'border-purple-500/30 hover:border-purple-500' },
          { to: '/admin/gallery', label: 'Upload Photo', color: 'border-pink-500/30 hover:border-pink-500' },
          { to: '/admin/models', label: 'Manage Models', color: 'border-flash-yellow/30 hover:border-flash-yellow' },
        ].map(({ to, label, color }) => (
          <Link key={to} to={to} className={`card text-center text-sm text-gray-300 hover:text-white border transition-colors ${color} p-4`}>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
