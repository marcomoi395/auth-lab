const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Role = require('../models/Role');
const tokenService = require('./tokenService');
const {
    AuthenticationError,
    ValidationError,
    ConflictError,
} = require('../utils/errors');
const logger = require('../utils/logger');
const { convertToObjectId } = require('../utils');

/**
 * Authenticate user login.
 * @param {Object} loginData
 * @param {string} loginData.email
 * @param {string} loginData.password
 * @param {Object} req
 * @returns {Promise<Object>} User data and tokens
 * @throws {ValidationError|AuthenticationError}
 */
async function loginUserWithEmailAndPassword(loginData, req) {
    // 1. Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError('Invalid login input', errors.array());
    }

    // 2. Find user by email
    const user = await User.findOne({ email: loginData.email });
    if (!user) throw new AuthenticationError('User not found');

    // 3. Compare password
    const isPasswordValid = await bcrypt.compare(
        loginData.password,
        user.password,
    );

    if (!isPasswordValid) throw new AuthenticationError('Invalid password');

    // 4. Generate token pair
    const tokenPair = await tokenService.generateJwtTokenPair(user);

    // 5. Save refresh token to DB
    user.refreshToken = tokenPair.refreshToken;
    await user.save();

    // 6. Log login event
    logger.info(`User ${user.email} logged in`);

    // 7. Return user data (without password) and tokens
    const { ...userData } = user.toObject();
    return {
        user: userData,
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
    };
}

/**
 * Logout user by revoking tokens.
 * @param {string} accessToken
 * @param {string} refreshToken
 * @returns {Promise<void>}
 * @throws {AuthenticationError}
 */
async function logoutUser(userId, email, refreshToken) {
    // 1. Validate and decode JWT
    // const payload = await tokenService.verifyAccessToken(accessToken);

    // 2. Remove refresh token from DB
    await User.updateOne({ _id: userId }, { $set: { refreshToken: null } });

    // 3. Blacklist refresh token
    await tokenService.revokeToken(refreshToken, convertToObjectId(userId));

    // 4. Log event
    logger.info(`User ${email} logged out`);
}

/**
 * Register a new user with email verification.
 * @param {Object} registrationData
 * @param {Object} req
 * @returns {Promise<Object>}
 * @throws {ValidationError|ConflictError}
 */
async function registerNewUserWithEmailVerification(registrationData, req) {
    // 1. Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError('Invalid registration input', errors.array());
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ email: registrationData.email });
    if (existingUser) throw new ConflictError('Email already registered');

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(
        registrationData.password,
        Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
    );

    const userRole = await Role.findOne({ roleName: 'user' });
    if (!userRole) throw new Error('Role "user" not found');

    // 4. Create user
    const user = new User({
        email: registrationData.email,
        password: hashedPassword,
        username: registrationData.username,
        role: userRole._id,
        isVerified: false,
    });
    await user.save();

    // 7. Log event
    logger.info(`User registered: ${user.email}`);

    return {
        userId: user._id,
        message: 'Registration successful. Please verify your email.',
    };
}

async function refreshAccessToken(refreshToken) {
    // 1. Check if refresh token is blacklisted
    const isBlacklisted = await tokenService.isTokenBlacklisted(refreshToken);

    if (isBlacklisted) {
        // Token has been compromised, revoke all user tokens
        const { user } = await tokenService.verifyRefreshToken(refreshToken);

        if (user && user._id) {
            await tokenService.revokeAllUserTokens(user._id);
        }

        throw new AuthenticationError(
            'Refresh token is blacklisted. All sessions have been revoked.',
        );
    }

    // 2. Verify refresh token
    const { user } = await tokenService.verifyRefreshToken(refreshToken);

    // 3. Generate new access token
    const tokenPair = await tokenService.refreshAccessToken(user);

    // 4. Blacklist refresh token
    await tokenService.revokeToken(refreshToken, convertToObjectId(user._id));

    // 5. Log event
    logger.info(`Refreshed token for user ${user.email}`);

    return tokenPair;
}

module.exports = {
    loginUserWithEmailAndPassword,
    logoutUser,
    registerNewUserWithEmailVerification,
    refreshAccessToken,
};
