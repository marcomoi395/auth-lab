const express = require('express');
const { body } = require('express-validator');
const AdminController = require('../controllers/AdminController');
const authMiddleware = require('../middleware/authentication');
const roleMiddleware = require('../middleware/authorization');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * Admin Routes
 *
 * Implements administrative operations:
 * - User management
 * - System configuration
 * - Access control
 *
 * All routes require admin role authentication
 */

// Apply authentication and admin role middleware to all admin routes
router.use(authMiddleware.authenticateToken);
router.use(roleMiddleware.requireRole('admin'));

// Get all users (with pagination, filtering, search)
router.get('/users', rateLimiter.standardLimiter, AdminController.getAllUsers);

// Search users
router.get(
    '/users/search',
    rateLimiter.standardLimiter,
    AdminController.searchUsers,
);

// Get specific user by ID
router.get(
    '/users/:id',
    rateLimiter.standardLimiter,
    AdminController.getUserById,
);

// Update user details
router.patch(
    '/users/:id',
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
            .withMessage('Full name cannot be empty'),
        body('role')
            .optional()
            .isIn(['admin', 'user'])
            .withMessage('Invalid role'),
        body('status')
            .optional()
            .isIn(['active', 'inactive', 'suspended'])
            .withMessage('Invalid status'),
    ],
    AdminController.updateUser,
);

// Delete user (soft delete)
router.delete(
    '/users/:id',
    rateLimiter.standardLimiter,
    AdminController.deleteUser,
);

module.exports = router;
