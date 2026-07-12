const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');
const { ROLES } = require('../config/constants');
const env = require('../config/env');
const bcrypt = require('bcryptjs');

/**
 * Cookie options for the refresh token.
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
});

/**
 * Build token payload from a user document.
 */
const buildTokenPayload = (user) => ({
  _id: user._id,
  email: user.email,
  role: user.role,
});

/**
 * Register a new user.
 * Signup ALWAYS creates an Employee — no role selection.
 */
const register = async ({ name, email, password }) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  // Create user (role defaults to Employee)
  const user = await User.create({ name, email, password });

  // Generate tokens
  const accessToken = generateAccessToken(buildTokenPayload(user));
  const refreshToken = generateRefreshToken({ _id: user._id });

  // Store hashed refresh token
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  user.refreshToken = hashedRefreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

/**
 * Log in an existing user.
 */
const login = async ({ email, password }) => {
  // Find user WITH password (since it's select: false by default)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check account status
  if (user.status !== 'Active') {
    throw new ApiError(403, 'Your account has been deactivated. Contact admin.');
  }

  // Generate tokens
  const accessToken = generateAccessToken(buildTokenPayload(user));
  const refreshToken = generateRefreshToken({ _id: user._id });

  // Store hashed refresh token
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  user.refreshToken = hashedRefreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

/**
 * Refresh the access token using a valid refresh token.
 * Implements token rotation (old refresh token invalidated, new one issued).
 */
const refresh = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  // Verify JWT signature
  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  // Load user with stored refresh token
  const user = await User.findById(decoded._id).select('+refreshToken');
  if (!user) {
    throw new ApiError(401, 'User not found');
  }

  if (!user.refreshToken) {
    throw new ApiError(401, 'Refresh token has been revoked');
  }

  // Compare incoming token with stored hash
  const isValid = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
  if (!isValid) {
    // Potential token reuse attack — revoke all tokens
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(401, 'Refresh token is invalid. Please log in again.');
  }

  // Rotate tokens
  const accessToken = generateAccessToken(buildTokenPayload(user));
  const newRefreshToken = generateRefreshToken({ _id: user._id });

  const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
  user.refreshToken = hashedRefreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken: newRefreshToken };
};

/**
 * Logout — revoke the refresh token.
 */
const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getCookieOptions,
};
