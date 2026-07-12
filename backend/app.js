const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

const env = require('./config/env');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Security headers ──
app.use(helmet());

// ── CORS ──
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// ── Body parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Cookie parsing (for refresh tokens) ──
app.use(cookieParser());

// ── NoSQL injection prevention ──
app.use(mongoSanitize());

// ── Request logging ──
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// ── Health check ──
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'AssetFlow API is running' });
});

// ── API routes ──
app.use('/api/v1', routes);

// ── 404 catch-all ──
app.use(notFound);

// ── Global error handler (MUST be last) ──
app.use(errorHandler);

module.exports = app;
