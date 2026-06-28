import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPlay, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import CustomerLayout from '../../components/layout/CustomerLayout';
import api, { getImageUrl } from '../../utils/api';

const SKELETON_HEIGHTS = ['h-52', 'h-64', 'h-48', 'h-72', 'h-56', 'h-44', 'h-60', 'h-52'];

function GalleryCard({ item, index, onOpen }) {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const isVideo = item.media_type === 'video';
  const delay = Math.min(index * 0.06, 0.48);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onClick={() => onOpen(item)}
      className="break-inside-avoid mb-3 rounded-2xl overflow-hidden cursor-pointer group relative"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {/* Media */}
      {isVideo ? (
        <video
          ref={videoRef}
          src={getImageUrl(item.photo_url)}
          className="w-full block group-hover:scale-105 transition-transform duration-500 ease-out"
          preload="metadata"
          muted
          playsInline
          onLoadedMetadata={() => {
            if (videoRef.current) videoRef.current.currentTime = 0.5;
            setLoaded(true);
          }}
        />
      ) : (
        <img
          src={getImageUrl(item.photo_url)}
          alt={item.caption || 'Flash Lounge'}
          className="w-full block group-hover:scale-105 transition-all duration-500 ease-out"
          style={{
            filter: loaded ? 'none' : 'blur(12px) brightness(0.7)',
            transition: 'filter 0.55s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
          }}
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            e.target.style.display = 'none';
            if (e.target.parentElement) e.target.parentElement.style.display = 'none';
          }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 pointer-events-none" />

      {/* Gold ring */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none ring-0 ring-inset ring-flash-yellow/55 group-hover:ring-[1.5px] transition-all duration-300" />

      {/* Video play button */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-black/55 backdrop-blur-sm border border-white/25 flex items-center justify-center group-hover:bg-flash-yellow group-hover:border-flash-yellow group-hover:scale-110 transition-all duration-300 shadow-lg">
            <FaPlay className="text-white text-sm ml-0.5 group-hover:text-flash-black transition-colors duration-300" />
          </div>
        </div>
      )}

      {/* Caption + category badge */}
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out pointer-events-none">
        {item.caption && (
          <p className="text-white text-sm font-medium mb-2 leading-snug line-clamp-2 drop-shadow-md">
            {item.caption}
          </p>
        )}
        <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-flash-yellow/15 text-flash-yellow border border-flash-yellow/30 capitalize backdrop-blur-sm">
          {item.category}
        </span>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  const [loading, setLoading] = useState(true);

  const filtered = active === 'All' ? photos : photos.filter((p) => p.category === active);
  const lightboxItem = lightbox !== null ? filtered[lightbox] : null;
  const isVideo = (item) => item.media_type === 'video';

  const openLightbox = (item) => {
    const idx = filtered.findIndex((p) => p.id === item.id);
    setLightbox(idx >= 0 ? idx : 0);
  };
  const closeLightbox = () => setLightbox(null);
  const prevItem = () => setLightbox((i) => (i > 0 ? i - 1 : filtered.length - 1));
  const nextItem = () => setLightbox((i) => (i < filtered.length - 1 ? i + 1 : 0));

  useEffect(() => {
    Promise.all([api.get('/gallery'), api.get('/gallery/categories')])
      .then(([gRes, cRes]) => {
        setPhotos(gRes.data);
        setCategories(['All', ...cRes.data]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setLightbox(null); }, [active]);

  useEffect(() => {
    const handle = (e) => {
      if (lightbox === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevItem();
      if (e.key === 'ArrowRight') nextItem();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  });

  return (
    <CustomerLayout>
      <div className="pt-24 pb-24 min-h-screen px-4">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="text-center mb-16 relative">
            <div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-64 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(245,197,24,0.07) 0%, transparent 68%)' }}
            />
            <p className="section-subtitle mb-4 tracking-[0.35em]">Moments &amp; Memories</p>
            <h1
              className="font-display text-5xl md:text-7xl font-bold text-white mb-6"
              style={{ textShadow: '0 0 50px rgba(245,197,24,0.2)' }}
            >
              Gallery
            </h1>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-flash-yellow" />
              <div className="w-1.5 h-1.5 rounded-full bg-flash-yellow" style={{ boxShadow: '0 0 8px #F5C518' }} />
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-flash-yellow" />
            </div>
            <p className="text-flash-muted max-w-md mx-auto text-base leading-relaxed">
              A glimpse into the Flash Lounge experience — every night is a story worth telling.
            </p>
          </div>

          {/* ── Category Filter ── */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center mb-12">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wide capitalize transition-all duration-300 ${
                    active === cat
                      ? 'bg-flash-yellow text-flash-black shadow-lg'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:border-flash-yellow/50 hover:text-flash-yellow hover:bg-flash-yellow/5'
                  }`}
                  style={active === cat ? { boxShadow: '0 4px 20px rgba(245,197,24,0.3)' } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* ── Grid ── */}
          {loading ? (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
              {SKELETON_HEIGHTS.map((h, i) => (
                <div key={i} className={`break-inside-avoid mb-3 rounded-2xl gallery-skeleton ${h}`} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-28">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.2)' }}
              >
                <span className="text-flash-yellow text-2xl">✦</span>
              </div>
              <p className="text-gray-500 text-sm">No media in this category yet.</p>
            </div>
          ) : (
            <div key={active} className="columns-2 sm:columns-3 lg:columns-4 gap-3">
              {filtered.map((item, i) => (
                <GalleryCard key={item.id} item={item} index={i} onOpen={openLightbox} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(4,4,4,0.97)', backdropFilter: 'blur(28px)' }}
          onClick={closeLightbox}
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-5 z-20">
            <span className="text-gray-500 text-sm font-mono tabular-nums">
              {lightbox + 1} <span className="text-gray-700">/</span> {filtered.length}
            </span>
            <button
              onClick={closeLightbox}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-flash-black hover:bg-flash-yellow transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <FaTimes size={13} />
            </button>
          </div>

          {/* Prev */}
          {filtered.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center text-gray-300 hover:text-flash-black hover:bg-flash-yellow transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              onClick={(e) => { e.stopPropagation(); prevItem(); }}
            >
              <FaChevronLeft size={14} />
            </button>
          )}

          {/* Next */}
          {filtered.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center text-gray-300 hover:text-flash-black hover:bg-flash-yellow transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              onClick={(e) => { e.stopPropagation(); nextItem(); }}
            >
              <FaChevronRight size={14} />
            </button>
          )}

          {/* Media */}
          <div
            className="relative z-10 px-16 flex items-center justify-center w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {isVideo(lightboxItem) ? (
              <video
                key={lightboxItem.id}
                src={getImageUrl(lightboxItem.photo_url)}
                className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl lightbox-media"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                key={lightboxItem.id}
                src={getImageUrl(lightboxItem.photo_url)}
                alt={lightboxItem.caption || 'Flash Lounge'}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl lightbox-media"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 px-6 py-6 text-center z-20 pointer-events-none">
            {lightboxItem.caption && (
              <p className="text-white/70 text-sm mb-2">{lightboxItem.caption}</p>
            )}
            <span className="inline-block text-xs px-3 py-1 rounded-full bg-flash-yellow/12 text-flash-yellow border border-flash-yellow/25 capitalize">
              {lightboxItem.category}
            </span>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
