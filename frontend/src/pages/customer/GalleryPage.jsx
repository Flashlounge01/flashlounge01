import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import CustomerLayout from '../../components/layout/CustomerLayout';
import api, { getImageUrl } from '../../utils/api';

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/gallery'), api.get('/gallery/categories')])
      .then(([gRes, cRes]) => {
        setPhotos(gRes.data);
        setCategories(['All', ...cRes.data]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const filtered = active === 'All' ? photos : photos.filter((p) => p.category === active);

  return (
    <CustomerLayout>
      <div className="pt-24 pb-20 min-h-screen px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-subtitle mb-3">Moments & Memories</p>
            <h1 className="section-title mb-4">Photo Gallery</h1>
            <div className="yellow-divider mx-auto mb-4" />
            <p className="text-gray-400 max-w-xl mx-auto">A glimpse into the Flash Lounge experience. Every night is a story.</p>
          </div>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`px-5 py-2 rounded-full font-medium text-sm transition-all capitalize ${
                    active === cat ? 'bg-flash-yellow text-flash-black' : 'bg-flash-card border border-flash-border text-gray-300 hover:border-flash-yellow hover:text-flash-yellow'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-flash-card rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No photos in this category yet.</div>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {filtered.map((photo) => (
                <div
                  key={photo.id}
                  className="break-inside-avoid overflow-hidden rounded-xl cursor-pointer group relative"
                  onClick={() => setLightbox(photo)}
                >
                  <img
                    src={getImageUrl(photo.photo_url)}
                    alt={photo.caption || 'Flash Lounge'}
                    className="w-full block group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none'; }}
                  />
                  {photo.caption && (
                    <div className="absolute inset-0 bg-flash-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-white text-sm font-medium">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-flash-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-flash-yellow p-2 z-10" onClick={() => setLightbox(null)}>
            <FaTimes size={24} />
          </button>
          <img
            src={getImageUrl(lightbox.photo_url)}
            alt={lightbox.caption || 'Flash Lounge'}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => e.target.style.display = 'none'}
          />
          {lightbox.caption && (
            <div className="absolute bottom-6 left-0 right-0 text-center text-white text-sm">{lightbox.caption}</div>
          )}
        </div>
      )}
    </CustomerLayout>
  );
}
