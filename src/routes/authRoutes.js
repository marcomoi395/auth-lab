const express = require('express');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/authentication');
const rateLimiter = require('../middlewares/rateLimiter');
const { validate } = require('../middlewares/validate');
const sanitize = require('../middlewares/sanitize');
const {
    registerSchema,
    loginSchema,
    logoutSchema,
    refreshTokenSchema,
} = require('../schemas/auth.schema');

const router = express.Router();

/**
 * Authentication Routes
 *
 * Implements all authentication-related endpoints including:
 * - User registration
 * - Login
 * - Logout
 * - Password reset flow
 * - Token refresh
 * - Email verification
 */

// Register a new user
router.post(
    '/register',
    rateLimiter.strictLimiter,
    sanitize.auth.register,
    validate(registerSchema),
    AuthController.register,
);

// User login
router.post(
    '/login',
    rateLimiter.authLimiter,
    sanitize.auth.login,
    validate(loginSchema),
    AuthController.login,
);

// User logout
router.post(
    '/logout',
    authMiddleware.authenticateToken,
    validate(logoutSchema),
    AuthController.logout,
);

// Refresh access token
router.post(
    '/refresh-token',
    rateLimiter.standardLimiter,
    validate(refreshTokenSchema),
    AuthController.refreshToken,
);

module.exports = router;
