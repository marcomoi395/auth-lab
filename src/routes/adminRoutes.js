const express = require('express');
const AdminController = require('../controllers/AdminController');
const authMiddleware = require('../middlewares/authentication');
const roleMiddleware = require('../middlewares/authorization');
const rateLimiter = require('../middlewares/rateLimiter');
const { validate } = require('../middlewares/validate');
const {
    updateUserSchema,
    deleteUserSchema,
    getUserByIdSchema,
    searchUsersSchema,
    getAllUsersSchema,
} = require('../schemas/admin.schema');

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
router.get(
    '/users',
    rateLimiter.standardLimiter,
    validate(getAllUsersSchema),
    AdminController.getAllUsers,
);

// Search users
router.get(
    '/users/search',
    rateLimiter.standardLimiter,
    validate(searchUsersSchema),
    AdminController.searchUsers,
);

// Get specific user by ID
router.get(
    '/users/:id',
    rateLimiter.standardLimiter,
    validate(getUserByIdSchema),
    AdminController.getUserById,
);

// Update user details
router.patch(
    '/users/:id',
    rateLimiter.standardLimiter,
    validate(updateUserSchema),
    AdminController.updateUser,
);

// Delete user (soft delete)
router.delete(
    '/users/:id',
    rateLimiter.standardLimiter,
    validate(deleteUserSchema),
    AdminController.deleteUser,
);

module.exports = router;
