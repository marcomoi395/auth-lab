const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Init middlewares
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Init database
require('./dbs/init.mongodb');

// Init routes
app.use('', require('./routes'));

app.use((error, req, res, _next) => {
    const statusCode = error.statusCode || 500;
    const errorResponse = {
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error',
    };

    // Include stack trace in development environment
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
    }

    return res.status(statusCode).json(errorResponse);
});

module.exports = app;
