import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaBolt, FaPhone, FaMapMarkerAlt, FaClock, FaTiktok, FaArrowRight, FaStar, FaCalendar, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import CustomerLayout from '../../components/layout/CustomerLayout';
import api, { getImageUrl } from '../../utils/api';
import { format } from 'date-fns';

const STRIP_IMAGES = [
  '/images/gallery-1.jpeg',
  '/images/gallery-2.jpeg',
  '/images/gallery-3.jpeg',
  '/images/gallery-4.jpeg',
];

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [models, setModels] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = useCallback((e) => { e.stopPropagation(); setLightboxIndex((i) => (i - 1 + STRIP_IMAGES.length) % STRIP_IMAGES.length); }, []);
  const nextImage = useCallback((e) => { e.stopPropagation(); setLightboxIndex((i) => (i + 1) % STRIP_IMAGES.length); }, []);

  useEffect(() => {
    Promise.all([
      api.get('/events').catch(() => ({ data: [] })),
      api.get('/menu').catch(() => ({ data: [] })),
      api.get('/models').catch(() => ({ data: [] })),
      api.get('/gallery').catch(() => ({ data: [] })),
    ]).then(([ev, mn, mo, ga]) => {
      setEvents(ev.data.slice(0, 3));
      setMenuItems(mn.data.slice(0, 6));
      setModels(mo.data.slice(0, 3));
      setGallery(ga.data.slice(0, 6));
    });
  }, []);

  return (
    <CustomerLayout>
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="/hero-bg.jpg"
            alt="Flash Lounge"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-flash-yellow/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-flash-yellow/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-flash-yellow/10 border border-flash-yellow/30 text-flash-yellow px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-float">
            <FaBolt size={12} />
            <span>Open 24 Hours • Premium Experience</span>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold leading-tight mb-4">
            <span className="block text-4xl sm:text-6xl md:text-7xl text-white">Flash Lounge</span>
            <span className="block text-4xl sm:text-6xl md:text-7xl text-flash-yellow text-glow">N Suite</span>
          </h1>

          {/* Slogan */}
          <p className="text-flash-muted text-xl sm:text-2xl font-display italic mb-8 tracking-wide">
            "Flash Ways"
          </p>

          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Your premier 24-hour luxury lounge experience. Unmatched ambiance, premium drinks,
            live entertainment, and unforgettable nights — every single day.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/reserve" className="btn-primary text-base px-8 py-4">
              Book Your Table <FaArrowRight />
            </Link>
            <Link to="/menu" className="btn-secondary text-base px-8 py-4">
              View Our Menu
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
          <div className="w-5 h-9 border-2 border-gray-600 rounded-full flex justify-center pt-1.5">
            <div className="w-1.5 h-2 bg-flash-yellow rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-subtitle mb-3">Why Flash Lounge</p>
            <h2 className="section-title mb-4">Experience the Flash Way</h2>
            <div className="yellow-divider mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 24/7 Open — logo card */}
            <div className="flex flex-col items-center justify-center rounded-xl h-56 overflow-hidden" style={{ backgroundColor: '#1a1a24' }}>
              <img src="/images/open-24hrs.jpeg" alt="24/7 Open" className="w-20 h-20 object-contain mb-3" />
              <h3 className="text-white font-bold text-lg mb-1">24/7 Open</h3>
              <p className="text-gray-400 text-sm leading-relaxed text-center px-4">We never close. Day or night, the vibes are always right.</p>
            </div>

            {/* Photo cards */}
            {[
              { title: 'Premium Bar', desc: 'Finest spirits, cocktails, and non-alcoholic beverages.', bg: '/images/flamingo-night.jpeg' },
              { title: 'Live Entertainment', desc: 'DJs, live music, and special themed events every week.', bg: '/images/pool-stage.jpeg' },
              { title: 'VIP Experience', desc: 'Private suites and table reservations for the elite.', bg: '/images/pool-waterfall.jpeg' },
            ].map((f) => (
              <div
                key={f.title}
                className="relative overflow-hidden rounded-xl h-56 group"
                style={{ backgroundImage: `url(${f.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 group-hover:from-black/70 transition-all duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-center">
                  <h3 className="text-white font-bold text-lg mb-1 drop-shadow">{f.title}</h3>
                  <p className="text-gray-200 text-sm leading-relaxed drop-shadow">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BEACH HOUSE ─── */}
      <section className="py-20 px-4 bg-flash-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ minHeight: '400px' }}>
              <img
                src="/images/beach-house-logo.jpeg"
                alt="Flash Beach House"
                className="w-full h-full object-cover absolute inset-0"
                style={{ minHeight: '400px' }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-transparent" />
            </div>

            {/* Content */}
            <div>
              <p className="section-subtitle mb-3">Flash Beach House</p>
              <h2 className="section-title mb-4" style={{ color: '#F5C842' }}>Where the Party Never Stops</h2>
              <div className="yellow-divider mb-6" />
              <p className="text-gray-300 text-base leading-relaxed mb-4">
                Step into Flash Beach House — where sun, sand, and style collide. Our waterfront retreat delivers the same premium Flash experience you love, now under the open sky with a full poolside bar, live sets, and VIP cabanas that keep the energy going all day and all night.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                From sunrise cocktails to midnight fire shows, Flash Beach House is more than a venue — it's a destination. Dress code enforced. Vibe guaranteed.
              </p>
              <Link to="/reserve" className="btn-primary">
                Explore Beach House <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GALLERY STRIP ─── */}
      <section className="py-16 px-4 bg-flash-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="section-subtitle mb-3">The Atmosphere</p>
            <h2 className="section-title mb-4">A Glimpse Inside</h2>
            <div className="yellow-divider mx-auto" />
          </div>

          <div className="scroll-strip snap-x snap-mandatory">
            {STRIP_IMAGES.map((src, i) => (
              <button
                key={src}
                onClick={() => openLightbox(i)}
                className="snap-start flex-none w-72 rounded-xl overflow-hidden bg-flash-card border border-flash-border hover:border-flash-yellow/50 focus:outline-none group block"
              >
                <img
                  src={src}
                  alt={`Flash Lounge ${i + 1}`}
                  className="w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIGHTBOX ─── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            className="absolute top-5 right-5 text-white hover:text-flash-yellow transition-colors p-2"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <FaTimes size={24} />
          </button>

          {/* Prev */}
          <button
            className="absolute left-4 text-white hover:text-flash-yellow transition-colors p-3 bg-black/40 rounded-full"
            onClick={prevImage}
            aria-label="Previous"
          >
            <FaChevronLeft size={22} />
          </button>

          {/* Image */}
          <img
            src={STRIP_IMAGES[lightboxIndex]}
            alt={`Flash Lounge ${lightboxIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          <button
            className="absolute right-4 text-white hover:text-flash-yellow transition-colors p-3 bg-black/40 rounded-full"
            onClick={nextImage}
            aria-label="Next"
          >
            <FaChevronRight size={22} />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-6 flex gap-2">
            {STRIP_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === lightboxIndex ? 'bg-flash-yellow' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── MENU STRIP ─── */}
      {menuItems.length > 0 && (
        <section className="py-20 px-4 bg-flash-dark">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <p className="section-subtitle mb-2">Our Specialties</p>
                <h2 className="section-title">Featured Menu</h2>
              </div>
              <Link to="/menu" className="btn-secondary text-sm">
                Full Menu <FaArrowRight size={12} />
              </Link>
            </div>
            <div className="scroll-strip snap-x snap-mandatory">
              {menuItems.map((item) => (
                <Link key={item.id} to="/menu" className="snap-start flex-none w-56 rounded-xl overflow-hidden bg-flash-card border border-flash-border hover:border-flash-yellow/50 transition-all group block">
                  {item.photo_url ? (
                    <img src={getImageUrl(item.photo_url)} alt={item.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="h-40 bg-flash-border" />
                  )}
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm line-clamp-1">{item.name}</h3>
                    <p className="text-flash-yellow font-bold mt-1">₦{Number(item.price).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── EVENTS STRIP ─── */}
      {events.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <p className="section-subtitle mb-2">What's Coming</p>
                <h2 className="section-title">Upcoming Events</h2>
              </div>
              <Link to="/events" className="btn-secondary text-sm">
                All Events <FaArrowRight size={12} />
              </Link>
            </div>
            <div className="scroll-strip snap-x snap-mandatory">
              {events.map((event) => (
                <Link key={event.id} to="/events" className="snap-start flex-none w-64 rounded-xl overflow-hidden bg-flash-card border border-flash-border hover:border-flash-yellow/50 transition-all group block">
                  {event.photo_url ? (
                    <img src={getImageUrl(event.photo_url)} alt={event.title} className="w-full object-contain bg-flash-dark" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="h-44 bg-flash-border flex items-center justify-center">
                      <FaCalendar className="text-flash-yellow text-4xl opacity-30" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-white font-bold text-base mb-1 line-clamp-1">{event.title}</h3>
                    <div className="flex items-center gap-1 text-flash-yellow text-xs">
                      <FaCalendar size={9} />
                      <span>{format(new Date(event.event_date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── MODELS STRIP ─── */}
      {models.length > 0 && (
        <section className="py-20 px-4 bg-flash-dark">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <p className="section-subtitle mb-2">Live Competition</p>
                <h2 className="section-title">Model Voting</h2>
              </div>
              <Link to="/voting" className="btn-secondary text-sm">
                Vote Now <FaArrowRight size={12} />
              </Link>
            </div>
            <div className="scroll-strip snap-x snap-mandatory">
              {models.map((model) => (
                <Link key={model.id} to="/voting" className="snap-start flex-none w-52 rounded-xl overflow-hidden bg-flash-card border border-flash-border hover:border-flash-yellow/50 transition-all group block text-center">
                  <div className="pt-6 px-4 pb-5 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-flash-border group-hover:border-flash-yellow/50 transition-colors">
                      {model.photo_url
                        ? <img src={getImageUrl(model.photo_url)} alt={model.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        : <div className="w-full h-full bg-flash-border" />
                      }
                    </div>
                    <h3 className="text-white font-bold mb-1 line-clamp-1 w-full">{model.name}</h3>
                    <div className="flex items-center gap-1 text-flash-yellow text-xs mb-4">
                      <FaStar size={10} />
                      <span className="font-bold">{model.vote_count?.toLocaleString()}</span>
                      <span className="text-gray-500">votes</span>
                    </div>
                    <span className="bg-flash-yellow text-flash-black text-xs font-bold px-4 py-1.5 rounded-lg">Vote Now</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── GALLERY PREVIEW ─── */}
      {gallery.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
              <div>
                <p className="section-subtitle mb-2">Moments at Flash</p>
                <h2 className="section-title">Photo Gallery</h2>
              </div>
              <Link to="/gallery" className="btn-secondary text-sm">
                View All <FaArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map((photo, i) => (
                <div key={photo.id} className={`overflow-hidden rounded-xl ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                  <img
                    src={getImageUrl(photo.photo_url)}
                    alt={photo.caption || 'Flash Lounge'}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 aspect-square"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── RESERVATION CTA ─── */}
      <section className="py-20 px-4 bg-flash-yellow">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-flash-black mb-4">
            Ready for a Flash Night Out?
          </h2>
          <p className="text-flash-black/70 text-lg mb-8">
            Reserve your table now and enjoy the premium Flash Lounge N Suite experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/reserve" className="bg-flash-black text-flash-yellow font-bold px-8 py-4 rounded-lg hover:bg-gray-900 transition-colors inline-flex items-center gap-2 justify-center">
              Reserve a Table <FaArrowRight />
            </Link>
            <a href="tel:07059693068" className="border-2 border-flash-black text-flash-black font-bold px-8 py-4 rounded-lg hover:bg-flash-black/10 transition-colors inline-flex items-center gap-2 justify-center">
              <FaPhone /> Call Us Now
            </a>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
}