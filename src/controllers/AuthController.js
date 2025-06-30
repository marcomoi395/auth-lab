const authService = require('../services/authService');
const { SuccessResponse } = require('../utils/responseHelper');

/**
 * Authentication Controller
 *
 * Handles all user authentication operations including:
 * - User registration with email verification
 * - User login with JWT token generation
 * - Password reset functionality
 * - Account activation/deactivation
 *
 * Security features:
 * - Rate limiting for brute force protection
 * - Input validation and sanitization
 * - Secure password hashing with bcrypt
 * - JWT tokens with configurable expiration
 *
 * Dependencies: bcrypt, jsonwebtoken, express-validator
 * Database: MongoDB with Mongoose ODM
 * Authentication: JWT-based stateless authentication
 */
class AuthController {
    /**
     * Register a new user.
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    async register(req, res, next) {
        try {
            const result =
                await authService.registerNewUserWithEmailVerification(
                    req.body,
                    req,
                );
            return new SuccessResponse({
                message: 'Registration successful. Please verify your email.',
                data: result,
            }).send(res);
        } catch (err) {
            next(err);
        }
    }

    /**
     * User login.
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    async login(req, res, next) {
        try {
            const result = await authService.loginUserWithEmailAndPassword(
                req.body,
                req,
            );
            return new SuccessResponse({
                message: 'Login successful',
                data: result,
            }).send(res);
        } catch (err) {
            next(err);
        }
    }

    /**
     * User logout.
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    async logout(req, res, next) {
        try {
            const { userId } = req.authenticatedUser;
            const { email } = req.authenticatedUser;
            const { refreshToken } = req.body;
            await authService.logoutUser(userId, email, refreshToken);
            return new SuccessResponse({
                message: 'Logout successful',
            }).send(res);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Refresh access token.
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await authService.refreshAccessToken(refreshToken);
            return new SuccessResponse({
                message: 'Token refreshed',
                data: result,
            }).send(res);
        } catch (err) {
            console.log('[1]::');
            next(err);
        }
    }
}

module.exports = new AuthController();
