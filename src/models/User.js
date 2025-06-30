const mongoose = require('mongoose');

const DOCUMENT_NAME = 'User';
const COLLECTION_NAME = 'users';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 32,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/.+@.+\..+/, 'Invalid email format'],
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
            required: true,
        },
        status: {
            type: String,
            default: 'active',
            enum: ['active', 'inactive', 'suspended'],
        },
        refreshToken: {
            type: String,
            default: null,
        },
        resetToken: {
            type: String,
            default: null,
        },
        resetTokenExpiry: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    },
);

module.exports = mongoose.model(DOCUMENT_NAME, userSchema);
