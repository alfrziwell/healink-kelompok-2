/**
 * @file Authentication Middleware
 * @description Middleware untuk memverifikasi JWT token
 */

const jwt = require('jsonwebtoken');
const { responseError } = require('../utils/response');
const constants = require('../config/constants');
const logger = require('../config/logger');

/**
 * Middleware untuk verifikasi JWT token
 * Digunakan untuk protected routes
 */
const verifyToken = (req, res, next) => {
    try {
        // Ambil token dari header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

        if (!token) {
            logger.warn('Token not found in request');
            return responseError(
                res,
                constants.STATUS_CODES.UNAUTHORIZED,
                constants.MESSAGES.TOKEN_REQUIRED
            );
        }

        // Verifikasi token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        logger.debug(`Token verified for user: ${verified.id_user}`);
        next();
    } catch (error) {
        logger.error(`Token verification failed: ${error.message}`);
        
        // Beda error untuk token expired vs token invalid
        if (error.name === 'TokenExpiredError') {
            return responseError(
                res,
                constants.STATUS_CODES.UNAUTHORIZED,
                'Token sudah kedaluwarsa.'
            );
        }

        return responseError(
            res,
            constants.STATUS_CODES.UNAUTHORIZED,
            constants.MESSAGES.TOKEN_INVALID
        );
    }
};

/**
 * Middleware untuk refresh token
 * Memberikan token baru ketika token lama sudah close to expiry
 */
const refreshTokenMiddleware = (req, res, next) => {
    const authHeader = req.headers['x-refresh-token'];
    
    if (authHeader) {
        try {
            const verified = jwt.verify(authHeader, process.env.JWT_REFRESH_SECRET);
            const newToken = jwt.sign(
                { id_user: verified.id_user, role: verified.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );
            res.setHeader('x-new-token', newToken);
            logger.debug(`Token refreshed for user: ${verified.id_user}`);
        } catch (error) {
            logger.warn(`Refresh token failed: ${error.message}`);
        }
    }
    next();
};

module.exports = {
    verifyToken,
    refreshTokenMiddleware,
};
