const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Standard rate limiter for general API endpoints.
 */
const standardLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Too many requests, please try again later.',
    },
    handler: (req, res, next, options) => {
        logger.warn(
            `Rate limit exceeded: ${req.ip} - ${req.method} ${req.originalUrl}`,
        );
        res.status(options.statusCode).json(options.message);
    },
});

/**
 * Stricter rate limiter for authentication endpoints.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Too many login attempts, please try again later.',
    },
    handler: (req, res, next, options) => {
        logger.warn(
            `Auth rate limit exceeded: ${req.ip} - ${req.method} ${req.originalUrl}`,
        );
        res.status(options.statusCode).json(options.message);
    },
});

/**
 * Very strict rate limiter for sensitive operations (register, forgot/reset password).
 */
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message:
            'Too many requests for sensitive operations, please try again later.',
    },
    handler: (req, res, next, options) => {
        logger.warn(
            `Strict rate limit exceeded: ${req.ip} - ${req.method} ${req.originalUrl}`,
        );
        res.status(options.statusCode).json(options.message);
    },
});

module.exports = {
    standardLimiter,
    authLimiter,
    strictLimiter,
};
