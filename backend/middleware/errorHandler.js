const ApiError = require('../utils/ApiError');
const env = require('../config/env');

/**
 * Global error handler — MUST be the last middleware mounted.
 *
 * Translates all error types (ApiError, Mongoose, JWT, generic)
 * into the standard { success, message, errors } response shape.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // ── Mongoose: bad ObjectId ──
  if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  // ── Mongoose: duplicate key ──
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    error = new ApiError(409, `Duplicate value for field: ${field}`);
  }

  // ── Mongoose or Joi: validation error ──
  if (err.name === 'ValidationError') {
    let messages = [];
    if (err.errors) {
      // Mongoose validation error
      messages = Object.values(err.errors).map((val) => val.message);
    } else if (err.details) {
      // Joi validation error
      messages = err.details.map((detail) => detail.message);
    }
    error = new ApiError(400, 'Validation failed', messages);
  }

  // ── JWT: expired ──
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token has expired');
  }

  // ── JWT: malformed / invalid ──
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const errors = error.errors || [];

  // Log full stack in development
  if (env.NODE_ENV === 'development') {
    console.error('──── Error ────');
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = errorHandler;
