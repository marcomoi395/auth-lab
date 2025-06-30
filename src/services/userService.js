const Role = require('../models/Role');
const User = require('../models/User');
const { ValidationError, ConflictError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Get user profile by user ID.
 * @param {string} userId
 * @returns {Promise<Object>}
 * @throws {ValidationError}
 */
async function getUserProfileById(userId) {
    const user = await User.findById(userId).select('_id username email role');
    if (!user) throw new ValidationError('User not found');
    logger.info(`Profile accessed: ${user.email}`);
    return user;
}

/**
 * Update user profile.
 * @param {Object} user
 * @param {Object} updateData
 * @returns {Promise<Object>}
 * @throws {ConflictError}
 */
async function updateUserProfile(user, updateData) {
    // Validate email
    if (updateData.email && updateData.email !== user.email) {
        const emailExists = await User.findOne({ email: updateData.email });
        if (emailExists) throw new ConflictError('Email already in use');
    }

    const userDataAfterUpdate = await User.findByIdAndUpdate(
        user._id,
        { $set: updateData },
        { new: true },
    ).select('_id username email role');

    logger.info(`Profile updated: ${user.email}`);

    return userDataAfterUpdate;
}

/**
 * Get all users with pagination (admin).
 * @param {Object} query
 * @returns {Promise<Object>}
 */
async function getAllUsersWithPagination(query) {
    const {
        page = 1,
        limit = 20,
        search,
        role,
        status,
        sortBy = 'createdAt',
        sortOrder = -1,
    } = query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search)
        filter.$or = [
            { email: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } },
        ];
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select('-password -resetToken -refreshToken -resetTokenExpiry -__v');
    return {
        users,
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
    };
}

/**
 * Get user by ID (admin).
 * @param {string} userId
 * @returns {Promise<Object>}
 * @throws {ValidationError}
 */
async function getUserByIdForAdmin(userId) {
    const user = await User.findById(userId).select(
        '-password -resetToken -refreshToken -resetTokenExpiry -__v',
    );
    if (!user) throw new ValidationError('User not found');
    logger.info(`Admin accessed user: ${user.email}`);
    return user;
}

/**
 * Update user by admin.
 * @param {string} userId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 * @throws {ValidationError}
 */
async function updateUserByAdmin(userId, updateData) {
    const user = await User.findById(userId);

    if (!user) throw new ValidationError('User not found');

    const userRole = await Role.findOne({ roleName: updateData.role });
    if (!userRole) throw new Error(`Role ${updateData.role} not found`);

    updateData.role = userRole._id;

    const userDataAfterUpdate = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true },
    ).select('_id username email role');

    logger.info(`Profile updated: ${user.email}`);

    return userDataAfterUpdate;
}

/**
 * Soft delete user by admin.
 * @param {string} userId
 * @returns {Promise<void>}
 * @throws {ValidationError|ConflictError}
 */
async function softDeleteUserByAdmin(userId) {
    const user = await User.findById(userId);

    if (!user) throw new ValidationError('User not found');

    const role = await Role.findById(user.role);

    if (role.roleName === 'admin')
        throw new ConflictError('Cannot delete admin');

    user.status = 'inactive';
    await user.save();

    logger.info(`User deleted: ${user.email}`);
}

/**
 * Search users.
 * @param {Object} searchParams
 * @returns {Promise<Object>}
 */
async function searchUsers(searchParams) {
    const {
        query,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = -1,
    } = searchParams;
    const filter = {};
    if (query) {
        filter.$or = [
            { email: { $regex: query, $options: 'i' } },
            { fullName: { $regex: query, $options: 'i' } },
        ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select('-password -resetToken -refreshToken -resetTokenExpiry -__v');

    return {
        users,
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
    };
}

module.exports = {
    getUserProfileById,
    updateUserProfile,
    getAllUsersWithPagination,
    getUserByIdForAdmin,
    updateUserByAdmin,
    softDeleteUserByAdmin,
    searchUsers,
};
