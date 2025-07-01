const express = require('express');
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middlewares/authentication');
const rateLimiter = require('../middlewares/rateLimiter');
const { validate } = require('../middlewares/validate');
const sanitize = require('../middlewares/sanitize');
const { updateProfileSchema } = require('../schemas/user.schema');

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
    sanitize.user.update,
    validate(updateProfileSchema),
    UserController.updateProfile,
);

// Search users
router.get(
    '/search',
    rateLimiter.standardLimiter,
    sanitize.user.search,
    UserController.searchUsers,
);

module.exports = router;
