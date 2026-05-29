/**
 * @file Helper Functions
 * @description Utility functions yang sering digunakan
 */

/**
 * Format date ke format readable
 * @param {Date} date 
 * @returns {string} Formatted date
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Validate NIK format
 * @param {string} nik 
 * @returns {boolean}
 */
function validateNIK(nik) {
    return /^\d{16}$/.test(nik);
}

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone number
 * @param {string} phone 
 * @returns {boolean}
 */
function validatePhone(phone) {
    return /^(\+62|0)[0-9]{9,12}$/.test(phone.replace(/\D/g, ''));
}

/**
 * Generate random string
 * @param {number} length 
 * @returns {string}
 */
function generateRandomString(length = 16) {
    return require('crypto')
        .randomBytes(length)
        .toString('hex')
        .slice(0, length);
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms 
 * @returns {Promise}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse error message
 * @param {Error} error 
 * @returns {string}
 */
function parseError(error) {
    if (error.message) {
        return error.message;
    }
    return String(error);
}

/**
 * Check if value is empty
 * @param {any} value 
 * @returns {boolean}
 */
function isEmpty(value) {
    return value === null || value === undefined || value === '' || 
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && Object.keys(value).length === 0);
}

/**
 * Deep clone object
 * @param {object} obj 
 * @returns {object}
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

module.exports = {
    formatDate,
    validateNIK,
    validateEmail,
    validatePhone,
    generateRandomString,
    sleep,
    parseError,
    isEmpty,
    deepClone,
};
