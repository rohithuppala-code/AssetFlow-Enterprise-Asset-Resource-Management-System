/**
 * Wraps an async Express route handler so that rejected promises
 * are automatically forwarded to Express's error-handling middleware.
 *
 * Without this, every controller would need its own try/catch.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
