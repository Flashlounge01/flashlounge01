require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// Trust proxy for Railway
app.set('trust proxy', 1);

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
const allowedOrigins = [
  'https://flashlounge.org',
  'https://www.flashlounge.org',
  'https://flashlounge.up.railway.app',
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: 'Too many login attempts, please try again after 15 minutes.' } });
const voteLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: { error: 'Too many vote attempts.' } });
const reservationLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { error: 'Too many reservation requests from this IP, please try again later.' } });

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/models/:model_id/vote', voteLimiter);
app.use('/api/reservations', reservationLimiter);

// Webhook needs raw body - register BEFORE express.json()
app.use('/api/models/webhook', express.raw({ type: 'application/json' }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/menu', require('./src/routes/menu'));
app.use('/api/events', require('./src/routes/events'));
app.use('/api/gallery', require('./src/routes/gallery'));
app.use('/api/models', require('./src/routes/models'));
app.use('/api/reservations', require('./src/routes/reservations'));
app.use('/api/dashboard', require('./src/routes/dashboard'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'Flash Lounge N Suite API' }));

// Serve frontend static files in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all: serve React app for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message === 'Not allowed by CORS') return res.status(403).json({ error: 'CORS policy violation' });
  // Never expose stack traces or internal messages to clients in production
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error';
  res.status(500).json({ error: message });
});

const initDb = require('./src/db/init');

const PORT = process.env.PORT || 5000;
initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Flash Lounge API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database, shutting down:', err);
    process.exit(1);
  });

module.exports = app;
