/**
 * @file Error Handling Middleware
 * @description Middleware global untuk menangani error
 */

const logger = require('../config/logger');
const constants = require('../config/constants');

/**
 * Middleware untuk menangani error yang tidak tertangani
 * Harus ditempatkan di paling akhir setelah semua route
 */
const errorHandler = (err, req, res, next) => {
    // Log error
    logger.error(`Unhandled error: ${err.message}`, {
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        user: req.user?.id_user,
    });

    // Default error response
    let statusCode = constants.STATUS_CODES.INTERNAL_ERROR;
    let message = constants.MESSAGES.INTERNAL_ERROR;

    // Tentukan status code dan message berdasarkan error type
    if (err.statusCode) {
        statusCode = err.statusCode;
        message = err.message || message;
    } else if (err.name === 'ValidationError') {
        statusCode = constants.STATUS_CODES.BAD_REQUEST;
        message = constants.MESSAGES.VALIDATION_ERROR;
    } else if (err.name === 'UnauthorizedError') {
        statusCode = constants.STATUS_CODES.UNAUTHORIZED;
        message = constants.MESSAGES.UNAUTHORIZED;
    } else if (err.name === 'CastError') {
        statusCode = constants.STATUS_CODES.BAD_REQUEST;
        message = 'Invalid ID format';
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        // Include error details hanya di development
        ...(process.env.NODE_ENV === 'development' && { error: err.message }),
    });
};

/**
 * Middleware untuk menangani 404 Not Found
 * Ditempatkan setelah semua route definition
 */
const notFoundHandler = (req, res) => {
    logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
    res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: `Route ${req.originalUrl} tidak ditemukan.`,
    });
};

/**
 * Async wrapper untuk menangani error di async route handlers
 * @param {function} fn - Express route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
};
