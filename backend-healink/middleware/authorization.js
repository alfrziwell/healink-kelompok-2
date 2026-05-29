/**
 * @file Authorization Middleware
 * @description Middleware untuk pengecekan role/permission
 */

const { responseError } = require('../utils/response');
const constants = require('../config/constants');
const logger = require('../config/logger');

/**
 * Middleware untuk memverifikasi role user
 * @param {...string} allowedRoles - Role yang diizinkan akses
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // Pastikan user sudah ter-authenticate
        if (!req.user) {
            logger.warn('User not authenticated for authorization check');
            return responseError(
                res,
                constants.STATUS_CODES.UNAUTHORIZED,
                constants.MESSAGES.TOKEN_REQUIRED
            );
        }

        // Cek apakah role user ada dalam allowedRoles
        if (!allowedRoles.includes(req.user.role)) {
            logger.warn(`User ${req.user.id_user} with role ${req.user.role} attempted unauthorized access`);
            return responseError(
                res,
                constants.STATUS_CODES.FORBIDDEN,
                constants.MESSAGES.FORBIDDEN
            );
        }

        logger.debug(`User ${req.user.id_user} authorized with role ${req.user.role}`);
        next();
    };
};

/**
 * Middleware khusus untuk Super Admin
 */
const onlySuperAdmin = (req, res, next) => {
    authorize(constants.ROLES.SUPER_ADMIN)(req, res, next);
};

/**
 * Middleware khusus untuk Super Admin dan Admin
 */
const onlyAdmin = (req, res, next) => {
    authorize(constants.ROLES.SUPER_ADMIN, constants.ROLES.ADMIN)(req, res, next);
};

/**
 * Middleware khusus untuk Super Admin, Admin, dan Dokter
 */
const onlyMedicalStaff = (req, res, next) => {
    authorize(constants.ROLES.SUPER_ADMIN, constants.ROLES.ADMIN, constants.ROLES.DOKTER)(req, res, next);
};

module.exports = {
    authorize,
    onlySuperAdmin,
    onlyAdmin,
    onlyMedicalStaff,
};
