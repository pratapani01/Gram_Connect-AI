require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const complaintRoutes = require('./routes/complaint.routes');
const locationRoutes = require('./routes/location.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');
const sarpanchRoutes = require('./routes/sarpanch.routes');

const { escalateComplaints } = require('./utils/escalation');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ────────────────────────────────────────────────────────────────────
// Normalise a URL: lowercase, strip trailing slash
const normalise = (url) => (url || '').toLowerCase().replace(/\/+$/, '');

const buildAllowedOrigins = () => {
  const origins = new Set([
    'http://localhost:5173',
    'http://localhost:3000',
  ]);

  // Accept one or more space/comma-separated URLs in FRONTEND_URL
  const raw = process.env.FRONTEND_URL || '';
  raw.split(/[\s,]+/).forEach(u => {
    const n = normalise(u);
    if (n) origins.add(n);
  });

  return [...origins];
};

const allowedOrigins = buildAllowedOrigins();
console.log('✅ CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server / curl (no origin header)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(normalise(origin))) return callback(null, true);
    console.warn('🚫 CORS blocked origin:', origin);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Explicit pre-flight handler (belt-and-suspenders)
app.options('*', cors());
// ─────────────────────────────────────────────────────────────────────────────

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Health check — visit /api/health to confirm server + DB status
app.get('/api/health', (req, res) => res.json({
  success: true,
  message: 'GramConnect AI API running',
  db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  timestamp: new Date(),
  allowedOrigins,
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sarpanch', sarpanchRoutes);

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use(errorHandler);

// Connect DB and start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

    // Cron: escalate complaints daily at midnight
    cron.schedule('0 0 * * *', () => {
      console.log('🔄 Running escalation cron...');
      escalateComplaints();
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
