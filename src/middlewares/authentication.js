const Role = require('../models/Role');
const tokenService = require('../services/tokenService');
const { AuthenticationError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate JWT token from Authorization header.
 * Attaches authenticatedUser to req if valid.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError(
                'Authorization header missing or invalid',
            );
        }

        const token = authHeader.split(' ')[1];
        if (!token) throw new AuthenticationError('Access token is required');
        const payload = await tokenService.verifyAccessToken(token);

        const role = await Role.findById(payload.role);

        req.authenticatedUser = {
            _id: payload.userId,
            email: payload.email,
            role: role.roleName,
        };
        next();
    } catch (err) {
        logger.warn(`Authentication failed: ${err.message}`);
        next(err);
    }
};

module.exports = {
    authenticateToken,
};
