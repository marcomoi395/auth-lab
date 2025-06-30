const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const { AuthenticationError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Generate access and refresh JWT token pair for user.
 * @param {Object} user
 * @returns {Promise<Object>}
 */
async function generateJwtTokenPair(user) {
    const payload = {
        userId: user._id,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.PRIVATE_KEY, {
        algorithm: 'RS256',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    const refreshToken = jwt.sign(payload, process.env.PRIVATE_KEY, {
        algorithm: 'RS256',
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    logger.info(`Generated token pair for user ${user.email}`);
    return { accessToken, refreshToken };
}

/**
 * Verify access token.
 * @param {string} accessToken
 * @returns {Promise<Object>}
 * @throws {AuthenticationError}
 */
async function verifyAccessToken(accessToken) {
    try {
        const payload = jwt.verify(accessToken, process.env.PUBLIC_KEY);

        // Check user active
        const user = await User.findById(payload.userId);
        if (!user || user.deleted)
            throw new AuthenticationError('User inactive');

        return payload;
    } catch {
        throw new AuthenticationError('Invalid or expired token');
    }
}

/**
 * Verify refresh token.
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 * @throws {AuthenticationError}
 */
async function verifyRefreshToken(refreshToken) {
    try {
        const payload = jwt.verify(refreshToken, process.env.PUBLIC_KEY);

        const user = await User.findById(payload.userId).select({
            password: 0,
        });

        if (!user) throw new AuthenticationError('User inactive');

        if (user.refreshToken !== refreshToken)
            throw new AuthenticationError('Refresh token mismatch');

        return { user, tokenDoc: { refreshToken } };
    } catch {
        throw new AuthenticationError('Invalid or expired refresh token');
    }
}

/**
 * Refresh access token using refresh token.
 * @param {Object} user
 * @returns {Promise<Object>}
 */
async function refreshAccessToken(user) {
    // Optionally rotate refresh token
    const tokenPair = await this.generateJwtTokenPair(user);

    // Add new refresh token to user
    user.refreshToken = tokenPair.refreshToken;
    await user.save();

    logger.info(`Refreshed token for user ${user.email}`);
    return tokenPair;
}

/**
 * Revoke (blacklist) a token.
 * @param {string} token
 * @returns {Promise<void>}
 */
async function revokeToken(token, user) {
    await TokenBlacklist.create({ token, user, createdAt: new Date() });
    logger.info('Token revoked');
}

/**
 * Revoke all tokens for a user.
 * @param {string} userId
 * @returns {Promise<void>}
 */
async function revokeAllUserTokens(userId) {
    await User.updateOne({ _id: userId }, { $unset: { refreshToken: 1 } });
    logger.info(`Revoked all tokens for user ${userId}`);
}

/**
 * Generate password reset token.
 * @param {Object} user
 * @returns {Promise<Object>}
 */
async function generatePasswordResetToken(user) {
    const plainToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
        .createHash('sha256')
        .update(plainToken)
        .digest('hex');
    const expiry = Date.now() + 3600 * 1000; // 1h
    logger.info(`Generated password reset token for ${user.email}`);
    return { plainToken, hashedToken, expiry };
}

/**
 * Verify password reset token.
 * @param {string} plainToken
 * @returns {Promise<Object>} user
 * @throws {ValidationError}
 */
async function verifyPasswordResetToken(plainToken) {
    const hashedToken = crypto
        .createHash('sha256')
        .update(plainToken)
        .digest('hex');
    const user = await User.findOne({
        resetToken: hashedToken,
        resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) throw new ValidationError('Invalid or expired reset token');
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    return user;
}

/**
 * Generate email verification token.
 * @param {Object} user
 * @returns {Promise<string>}
 */
async function generateEmailVerificationToken(user) {
    const payload = { userId: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.PRIVATE_KEY, {
        expiresIn: '1d',
    });
    logger.info(`Generated email verification token for ${user.email}`);
    return token;
}

/**
 * Verify email verification token.
 * @param {string} token
 * @returns {Promise<Object>} user
 * @throws {ValidationError}
 */
async function verifyEmailVerificationToken(token) {
    try {
        const payload = jwt.verify(token, process.env.PUBLIC_KEY);
        const user = await User.findById(payload.userId);
        if (!user) throw new ValidationError('Invalid verification token');
        return user;
    } catch {
        throw new ValidationError('Invalid or expired verification token');
    }
}

async function isTokenBlacklisted(refreshToken) {
    const tokenDoc = await TokenBlacklist.findOne({ token: refreshToken });
    return !!tokenDoc;
}
module.exports = {
    generateJwtTokenPair,
    verifyAccessToken,
    verifyRefreshToken,
    refreshAccessToken,
    revokeToken,
    revokeAllUserTokens,
    generatePasswordResetToken,
    verifyPasswordResetToken,
    generateEmailVerificationToken,
    verifyEmailVerificationToken,
    isTokenBlacklisted,
};
