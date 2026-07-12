const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');

/**
 * JWT authentication middleware.
 *
 * 1. Extracts Bearer token from Authorization header
 * 2. Verifies signature and expiry
 * 3. Loads user from DB (ensures they still exist and are active)
 * 4. Attaches req.user
 */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded._id).select('-password -refreshToken');

    if (!user) {
      throw new ApiError(401, 'User belonging to this token no longer exists.');
    }

    if (user.status !== 'Active') {
      throw new ApiError(403, 'Your account has been deactivated. Contact admin.');
    }

    req.user = user;
    next();
  } catch (error) {
    // If the error is already an ApiError, pass it through
    if (error instanceof ApiError) {
      return next(error);
    }
    // JWT errors (expired, malformed) bubble to the global handler
    next(error);
  }
};

module.exports = auth;
