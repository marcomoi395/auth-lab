const userService = require('../services/userService');
const { SuccessResponse } = require('../utils/responseHelper');

/**
 * User Controller
 *
 * Handles user profile operations:
 * - Get profile
 * - Update profile
 * - Change password
 */
class UserController {
    /**
     * Get authenticated user's profile.
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    async getProfile(req, res, next) {
        try {
            const user = await userService.getUserProfileById(
                req.authenticatedUser._id,
            );
            return new SuccessResponse({
                message: 'Profile fetched successfully',
                data: user,
            }).send(res);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Update authenticated user's profile.
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    async updateProfile(req, res, next) {
        try {
            const updatedUser = await userService.updateUserProfile(
                req.authenticatedUser,
                req.body,
            );
            return new SuccessResponse({
                message: 'Profile updated successfully',
                data: updatedUser,
            }).send(res);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new UserController();
