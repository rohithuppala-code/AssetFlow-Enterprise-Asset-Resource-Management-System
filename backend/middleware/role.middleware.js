const ApiError = require('../utils/ApiError');

/**
 * Role-based authorization middleware factory.
 *
 * Usage in routes:
 *   router.post('/departments', auth, authorize('Admin'), controller.create);
 *   router.post('/assets', auth, authorize('Admin', 'AssetManager'), controller.create);
 *
 * @param  {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Role '${req.user.role}' is not authorized to perform this action`
        )
      );
    }

    next();
  };
};

module.exports = authorize;
