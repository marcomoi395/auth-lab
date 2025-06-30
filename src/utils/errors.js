/**
 * Base application error.
 * @class
 * @extends Error
 */
class AppError extends Error {
    /**
     * @param {string} message
     * @param {number} [statusCode=500]
     * @param {Array|undefined} [details]
     */
    constructor(message, statusCode, details) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        if (details) this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation error (HTTP 400).
 * @class
 * @extends AppError
 */
class ValidationError extends AppError {
    /**
     * @param {string} message
     * @param {Array|undefined} [details]
     */
    constructor(message, details) {
        super(message, 400, details);
    }
}

/**
 * Authentication error (HTTP 401).
 * @class
 * @extends AppError
 */
class AuthenticationError extends AppError {
    /**
     * @param {string} message
     * @param {Array|undefined} [details]
     */
    constructor(message, details) {
        super(message, 401, details);
    }
}

/**
 * Conflict error (HTTP 409).
 * @class
 * @extends AppError
 */
class ConflictError extends AppError {
    /**
     * @param {string} message
     * @param {Array|undefined} [details]
     */
    constructor(message, details) {
        super(message, 409, details);
    }
}

/**
 * Database error (HTTP 500).
 * @class
 * @extends AppError
 */
class DatabaseError extends AppError {
    /**
     * @param {string} message
     * @param {Array|undefined} [details]
     */
    constructor(message, details) {
        super(message, 500, details);
    }
}

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    ConflictError,
    DatabaseError,
};
