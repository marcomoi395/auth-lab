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

// Global error handling middleware
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res) => {
    const statusCode = error.statusCode || 5;
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
