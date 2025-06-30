const express = require('express');
const { body } = require('express-validator');
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/authentication');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * User Routes
 *
 * Implements authenticated user operations:
 * - Get user profile
 * - Update user profile
 * - Change password
 */

// Apply authentication middleware to all user routes
router.use(authMiddleware.authenticateToken);

// Get authenticated user's profile
router.get('/me', rateLimiter.standardLimiter, UserController.getProfile);

// Update authenticated user's profile
router.patch(
    '/me',
    rateLimiter.standardLimiter,
    [
        body('email')
            .optional()
            .isEmail()
            .normalizeEmail()
            .withMessage('Valid email is required'),
        body('username')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('User name cannot be empty'),
    ],
    UserController.updateProfile,
);

module.exports = router;
