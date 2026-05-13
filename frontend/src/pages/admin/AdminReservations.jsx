import { useState, useEffect } from 'react';
import { FaCalendar, FaTrash, FaUsers, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'];

const StatusBadge = ({ status }) => {
  const map = { pending: 'badge-pending', confirmed: 'badge-confirmed', completed: 'badge-completed', cancelled: 'badge-cancelled' };
  return <span className={map[status] || 'badge-pending'}>{status}</span>;
};

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetch = () => {
    const params = new URLSearchParams();
    if (filterDate) params.append('date', filterDate);
    if (filterStatus) params.append('status', filterStatus);
    api.get(`/reservations?${params}`).then((res) => setReservations(res.data)).finally(() => setLoading(false));
  };

  useEffect(fetch, [filterDate, filterStatus]);

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/reservations/${id}/status`, { status });
      toast.success(`Marked as ${status}`);
      fetch();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reservation?')) return;
    try { await api.delete(`/reservations/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  const counts = reservations.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-white font-bold text-2xl">Reservations</h1>
        <p className="text-gray-400 text-sm">{reservations.length} total</p>
      </div>

      {/* Status counts */}
      <div className="flex flex-wrap gap-3">
        {STATUS_OPTIONS.map((s) => (
          <button key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filterStatus === s ? 'bg-flash-yellow text-flash-black' : 'bg-flash-card border border-flash-border text-gray-300 hover:border-flash-yellow'}`}>
            {s} <span className="ml-1 opacity-60">{counts[s] || 0}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <FaCalendar className="text-flash-yellow" />
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="input-field w-auto py-2" />
        </div>
        {(filterDate || filterStatus) && (
          <button onClick={() => { setFilterDate(''); setFilterStatus(''); }} className="text-gray-400 text-sm hover:text-flash-yellow transition-colors">
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}</div>
      ) : reservations.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">No reservations found.</div>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => (
            <div key={r.id} className="card hover:border-flash-border/60 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-white font-semibold">{r.customer_name}</h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><FaCalendar className="text-flash-yellow" /> {format(new Date(r.reservation_date), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1"><FaClock className="text-flash-yellow" /> {r.reservation_time.slice(0, 5)}</span>
                    <span className="flex items-center gap-1"><FaUsers className="text-flash-yellow" /> {r.guests_count} guests</span>
                    <span className="flex items-center gap-1"><FaPhone className="text-flash-yellow" />
                      <a href={`tel:${r.customer_phone}`} className="hover:text-flash-yellow transition-colors">{r.customer_phone}</a>
                    </span>
                  </div>
                  {r.customer_email && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <FaEnvelope className="text-flash-yellow" />
                      <a href={`mailto:${r.customer_email}`} className="hover:text-flash-yellow transition-colors">{r.customer_email}</a>
                    </div>
                  )}
                  {r.special_requests && (
                    <p className="text-xs text-gray-500 mt-2 italic">"{r.special_requests}"</p>
                  )}
                  <p className="text-gray-600 text-xs mt-1">Submitted {format(new Date(r.created_at), 'MMM d, yyyy HH:mm')}</p>
                </div>

                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  <select
                    value={r.status}
                    onChange={(e) => handleStatus(r.id, e.target.value)}
                    className="bg-flash-dark border border-flash-border text-gray-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-flash-yellow cursor-pointer capitalize"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                  <button onClick={() => handleDelete(r.id)} className="p-2 border border-flash-border text-gray-400 hover:text-red-400 hover:border-red-400 rounded-lg transition-colors">
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
