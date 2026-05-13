import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendar, FaClock, FaArrowRight, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';
import CustomerLayout from '../../components/layout/CustomerLayout';
import api, { getImageUrl } from '../../utils/api';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/events').then((res) => setEvents(res.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <CustomerLayout>
      <div className="pt-24 pb-20 min-h-screen px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-subtitle mb-3">Coming Up</p>
            <h1 className="section-title mb-4">Upcoming Events</h1>
            <div className="yellow-divider mx-auto mb-4" />
            <p className="text-gray-400 max-w-xl mx-auto">Stay plugged in. Flash Lounge hosts the best parties, themed nights, and exclusive experiences.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-52 bg-flash-border rounded-lg mb-4" />
                  <div className="h-4 bg-flash-border rounded w-1/3 mb-3" />
                  <div className="h-5 bg-flash-border rounded w-3/4 mb-2" />
                  <div className="h-3 bg-flash-border rounded w-full" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-gray-400 text-lg">No upcoming events right now. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelected(event)}
                  className="card p-0 overflow-hidden hover:border-flash-yellow/30 transition-all cursor-pointer group"
                >
                  {event.photo_url ? (
                    <img
                      src={getImageUrl(event.photo_url)}
                      alt={event.title}
                      className="w-full object-contain bg-flash-dark"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="h-52 bg-flash-border flex items-center justify-center">
                      <FaCalendar className="text-flash-yellow text-5xl opacity-30" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 bg-flash-yellow/10 text-flash-yellow text-xs px-2.5 py-1 rounded-full">
                        <FaCalendar size={10} /> {format(new Date(event.event_date), 'MMMM d, yyyy')}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-flash-yellow/10 text-flash-yellow text-xs px-2.5 py-1 rounded-full">
                        <FaClock size={10} /> {event.event_time.slice(0, 5)}
                      </span>
                    </div>
                    <h2 className="text-white font-bold text-xl mb-2">{event.title}</h2>
                    {event.description && <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{event.description}</p>}
                    <p className="text-flash-yellow text-xs mt-3 font-medium group-hover:underline">Tap to view details →</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-flash-card border border-flash-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-flash-black/70 text-white rounded-full flex items-center justify-center hover:bg-flash-yellow hover:text-flash-black transition-colors"
            >
              <FaTimes size={14} />
            </button>

            {/* Full flyer */}
            {selected.photo_url && (
              <img
                src={getImageUrl(selected.photo_url)}
                alt={selected.title}
                className="w-full object-contain bg-flash-dark rounded-t-2xl"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}

            {/* Details */}
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1 bg-flash-yellow/10 text-flash-yellow text-xs px-3 py-1.5 rounded-full font-medium">
                  <FaCalendar size={10} /> {format(new Date(selected.event_date), 'MMMM d, yyyy')}
                </span>
                <span className="inline-flex items-center gap-1 bg-flash-yellow/10 text-flash-yellow text-xs px-3 py-1.5 rounded-full font-medium">
                  <FaClock size={10} /> {selected.event_time.slice(0, 5)}
                </span>
              </div>

              <h2 className="text-white font-display font-bold text-2xl mb-3">{selected.title}</h2>

              {selected.description && (
                <p className="text-gray-300 text-sm leading-relaxed mb-6">{selected.description}</p>
              )}

              <Link
                to="/reserve"
                onClick={() => setSelected(null)}
                className="btn-primary w-full justify-center"
              >
                Book a Table <FaArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
