const { z } = require('zod');

/**
 * Authentication validation schemas
 */

// Schema for user registration
const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Valid email is required'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        username: z.string().min(1, 'Username is required'),
    }),
});

// Schema for user login
const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Valid email is required'),
        password: z.string().min(1, 'Password is required'),
    }),
});

// Schema for logout
const logoutSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, 'Refresh token is required'),
    }),
});

// Schema for refresh token
const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, 'Refresh token is required'),
    }),
});

module.exports = {
    registerSchema,
    loginSchema,
    logoutSchema,
    refreshTokenSchema,
};
