const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/authentication');
const rateLimiter = require('../middleware/rateLimiter');

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
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters'),
        body('username').trim().notEmpty().withMessage('Username is required'),
    ],
    AuthController.register,
);

// User login
router.post(
    '/login',
    rateLimiter.authLimiter,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    AuthController.login,
);

// User logout
router.post(
    '/logout',
    authMiddleware.authenticateToken,
    [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
    AuthController.logout,
);

// Refresh access token
router.post(
    '/refresh-token',
    rateLimiter.standardLimiter,
    [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
    AuthController.refreshToken,
);

module.exports = router;
