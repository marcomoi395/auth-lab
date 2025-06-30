const { AuthenticationError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Middleware to require a specific user role.
 * @param {string|string[]} requiredRoles
 * @returns {Function}
 */
const requireRole = (requiredRoles) => (req, res, next) => {
    try {
        if (!req.authenticatedUser) {
            throw new AuthenticationError('Authentication required');
        }

        const roles = Array.isArray(requiredRoles)
            ? requiredRoles
            : [requiredRoles];

        if (!roles.includes(req.authenticatedUser.role)) {
            logger.warn(
                `Authorization failed: User ${req.authenticatedUser.email} with role ${req.authenticatedUser.role} attempted to access admin resource`,
            );
            throw new AuthenticationError('Insufficient permissions');
        }
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = {
    requireRole,
};
