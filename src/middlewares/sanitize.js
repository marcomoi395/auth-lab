const { body, query } = require('express-validator');
const sanitizeMiddleware = {
    auth: {
        register: [
            body('email').trim().escape(),
            body('username').trim().escape(),
            body('password').trim()
        ],
        login: [
            body('email').trim().escape(),
            body('password').trim()
        ]
    },
    user: {
        update: [
            body('username').trim().escape(),
            body('email').trim().escape()
        ],
        search: [
            query('q').trim().escape()
        ]
    },
    admin: {
        createUser: [
            body('email').trim().escape(),
            body('username').trim().escape(),
            body('password').trim()
        ],
        updateUser: [
            body('username').trim().escape(),
            body('email').trim().escape()
        ]
    }
};

module.exports = sanitizeMiddleware;
