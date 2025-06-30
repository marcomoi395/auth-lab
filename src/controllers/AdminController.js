const userService = require('../services/userService');
const { SuccessResponse } = require('../utils/responseHelper');

/**
 * Admin Controller
 *
 * Handles admin operations:
 * - Get all users
 * - Get user by ID
 * - Update user
 * - Delete user
 * - Search users
 */
class AdminController {
    /**
     * Get list of users (with pagination, filter, search).
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    async getAllUsers(req, res, next) {
        try {
            const result = await userService.getAllUsersWithPagination(
                req.query,
            );
            return new SuccessResponse({
                message: 'Fetched users successfully',
                data: result,
            }).send(res);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get user by ID.
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    async getUserById(req, res, next) {
        try {
            const user = await userService.getUserByIdForAdmin(req.params.id);
            return new SuccessResponse({
                message: 'Fetched user successfully',
                data: user,
            }).send(res);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Update user.
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    async updateUser(req, res, next) {
        try {
            const updatedUser = await userService.updateUserByAdmin(
                req.params.id,
                req.body,
            );
            return new SuccessResponse({
                message: 'User updated successfully',
                data: updatedUser,
            }).send(res);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Soft delete user.
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    async deleteUser(req, res, next) {
        try {
            await userService.softDeleteUserByAdmin(req.params.id);
            return new SuccessResponse({
                message: 'User deleted successfully',
            }).send(res);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Search users.
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    async searchUsers(req, res, next) {
        try {
            const result = await userService.searchUsers(req.query);
            return new SuccessResponse({
                message: 'Search completed',
                data: result,
            }).send(res);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AdminController();
