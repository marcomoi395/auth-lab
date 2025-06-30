const { z } = require('zod');

/**
 * User validation schemas
 */

// Schema for updating user profile
const updateProfileSchema = z.object({
    body: z.object({
        email: z.string().email('Valid email is required').optional(),
        username: z.string().min(1, 'Username cannot be empty').optional(),
    }),
});

module.exports = {
    updateProfileSchema,
};
