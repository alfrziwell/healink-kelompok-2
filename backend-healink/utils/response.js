/**
 * @file Response Helper
 * @description Helper untuk membuat response API yang konsisten
 */

const constants = require('../config/constants');

/**
 * Membuat response success
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {any} data - Response data
 * @param {number} total - Total data (untuk pagination)
 * @param {number} page - Current page (untuk pagination)
 * @param {number} limit - Items per page (untuk pagination)
 */
const responseSuccess = (res, statusCode, message, data = null, pagination = null) => {
    const response = {
        success: true,
        message,
        data,
    };

    // Tambahkan pagination jika ada
    if (pagination) {
        response.pagination = pagination;
    }

    return res.status(statusCode).json(response);
};

/**
 * Membuat response error
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {array} errors - Validation errors (optional)
 */
const responseError = (res, statusCode, message, errors = null) => {
    const response = {
        success: false,
        message,
    };

    if (errors && errors.length > 0) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Helper untuk membuat pagination object
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 */
const createPagination = (page, limit, total) => {
    return {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
    };
};

module.exports = {
    responseSuccess,
    responseError,
    createPagination,
};
