const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(
        ({ level, message, timestamp, stack }) =>
            `${timestamp} ${level}: ${message}${stack ? `\n${stack}` : ''}`,
    ),
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat,
            ),
        }),
        // File transport for errors
        new winston.transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
        }),
        // File transport for all logs
        new winston.transports.File({
            filename: path.join('logs', 'combined.log'),
        }),
    ],
});

// Export logger methods
module.exports = {
    info: (message) => logger.info(message),
    error: (message, error) => logger.error(message, { error }),
    warn: (message) => logger.warn(message),
    debug: (message) => logger.debug(message),
};
