const ApiError = require('../utils/ApiError');

/**
 * 404 catch-all — mounted after all route definitions.
 * Creates an ApiError and forwards it to the global error handler.
 */
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = notFound;
