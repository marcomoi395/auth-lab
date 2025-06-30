const mongoose = require('mongoose');

const DOCUMENT_NAME = 'TokenBlacklist';
const COLLECTION_NAME = 'tokenblacklist';

const tokenBlacklistSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            unique: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    },
);

// Index for faster queries
tokenBlacklistSchema.index({ token: 1 });
tokenBlacklistSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 7 * 24 * 60 * 60 },
);

module.exports = mongoose.model(DOCUMENT_NAME, tokenBlacklistSchema);
