import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import CustomerLayout from '../../components/layout/CustomerLayout';
import api, { getImageUrl } from '../../utils/api';

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState('All');
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/menu'), api.get('/menu/categories')])
      .then(([menuRes, catRes]) => {
        setItems(menuRes.data);
        setCategories(['All', ...catRes.data]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = active === 'All' ? items : items.filter((i) => i.category === active);

  return (
    <CustomerLayout>
      <div className="pt-24 pb-20 min-h-screen px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="section-subtitle mb-3">What We Serve</p>
            <h1 className="section-title mb-4">Our Menu</h1>
            <div className="yellow-divider mx-auto mb-4" />
            <p className="text-gray-400 max-w-xl mx-auto">Crafted with passion — drinks, bites, and specialties to elevate your night.</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                  active === cat ? 'bg-flash-yellow text-flash-black' : 'bg-flash-card border border-flash-border text-gray-300 hover:border-flash-yellow hover:text-flash-yellow'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-44 bg-flash-border rounded-lg mb-4" />
                  <div className="h-4 bg-flash-border rounded w-3/4 mb-2" />
                  <div className="h-3 bg-flash-border rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No items in this category yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((item) => (
                <div key={item.id} className="card p-0 overflow-hidden hover:border-flash-yellow/30 transition-all group">
                  {item.photo_url ? (
                    <div className="h-52 sm:h-44 overflow-hidden cursor-zoom-in" onClick={() => setLightbox({ src: getImageUrl(item.photo_url), name: item.name })}>
                      <img src={getImageUrl(item.photo_url)} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-44 bg-flash-border flex items-center justify-center text-5xl">🍹</div>
                  )}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-semibold text-lg">{item.name}</h3>
                      <span className="text-flash-yellow font-bold text-lg">₦{Number(item.price).toLocaleString()}</span>
                    </div>
                    <span className="inline-block bg-flash-yellow/10 text-flash-yellow text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">{item.category}</span>
                    {item.description && <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 right-5 text-white hover:text-flash-yellow transition-colors p-2"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <FaTimes size={24} />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.name}
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="mt-4 text-white font-semibold text-lg">{lightbox.name}</p>
        </div>
      )}
    </CustomerLayout>
  );
}
