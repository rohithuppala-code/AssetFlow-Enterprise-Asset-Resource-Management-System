const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new Employee account
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);

  res
    .status(201)
    .cookie('refreshToken', refreshToken, authService.getCookieOptions())
    .json(new ApiResponse(201, 'Registration successful', { user, accessToken }));
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res
    .status(200)
    .cookie('refreshToken', refreshToken, authService.getCookieOptions())
    .json(new ApiResponse(200, 'Login successful', { user, accessToken }));
});

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token cookie
 * @access  Public
 */
const refresh = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  const { accessToken, refreshToken } = await authService.refresh(incomingRefreshToken);

  res
    .status(200)
    .cookie('refreshToken', refreshToken, authService.getCookieOptions())
    .json(new ApiResponse(200, 'Token refreshed', { accessToken }));
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout — revoke refresh token
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);

  res
    .status(200)
    .clearCookie('refreshToken', { path: '/' })
    .json(new ApiResponse(200, 'Logged out successfully'));
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, 'User profile retrieved', { user: req.user }));
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
};
