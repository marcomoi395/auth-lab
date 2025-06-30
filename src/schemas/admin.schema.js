const { z } = require('zod');

/**
 * Admin validation schemas
 */

// Schema for updating a user
const updateUserSchema = z.object({
    params: z.object({
        id: z
            .string()
            .length(24, { message: 'Invalid user ID format' })
            .regex(/^[0-9a-fA-F]{24}$/, {
                message: 'Invalid user ID format',
            }),
    }),
    body: z.object({
        email: z.string().email('Valid email is required').optional(),
        username: z.string().min(1, 'Username cannot be empty').optional(),
        role: z.enum(['admin', 'user'], { message: 'Invalid role' }).optional(),
        status: z
            .enum(['active', 'inactive', 'suspended'], {
                message: 'Invalid status',
            })
            .optional(),
    }),
});

// Schema for deleting a user
const deleteUserSchema = z.object({
    params: z.object({
        id: z
            .string()
            .length(24, { message: 'Invalid user ID format' })
            .regex(/^[0-9a-fA-F]{24}$/, {
                message: 'Invalid user ID format',
            }),
    }),
});

// Schema for getting a user by ID
const getUserByIdSchema = z.object({
    params: z.object({
        id: z
            .string()
            .length(24, { message: 'Invalid user ID format' })
            .regex(/^[0-9a-fA-F]{24}$/, {
                message: 'Invalid user ID format',
            }),
    }),
});

// Schema for searching users
const searchUsersSchema = z.object({
    query: z.object({
        q: z.string().min(1, 'Search query is required').optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
    }),
});

// Schema for getting all users
const getAllUsersSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
        status: z.enum(['active', 'inactive', 'suspended']).optional(),
        role: z.enum(['admin', 'user']).optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
    }),
});

// Schema for creating a new user
const createUserSchema = z.object({
    body: z.object({
        email: z.string().email('Valid email is required'),
        username: z.string().min(1, 'Username cannot be empty'),
        password: z
            .string()
            .min(6, 'Password must be at least 6 characters long'),
        role: z.enum(['admin', 'user'], { message: 'Invalid role' }).optional(),
        status: z
            .enum(['active', 'inactive', 'suspended'], {
                message: 'Invalid status',
            })
            .optional(),
    }),
});

module.exports = {
    updateUserSchema,
    deleteUserSchema,
    getUserByIdSchema,
    searchUsersSchema,
    getAllUsersSchema,
    createUserSchema,
};
