const mongoose = require('mongoose');

const DOCUMENT_NAME = 'Role';
const COLLECTION_NAME = 'roles';

const roleSchema = new mongoose.Schema(
    {
        roleName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            enum: ['admin', 'user', 'guest'],
        },
        permissions: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    },
);

module.exports = mongoose.model(DOCUMENT_NAME, roleSchema);
