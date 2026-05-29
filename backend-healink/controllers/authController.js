/**
 * @file Authentication Controller
 * @description Controller untuk handling authentication (login, register)
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { responseSuccess, responseError } = require('../utils/response');
const constants = require('../config/constants');
const logger = require('../config/logger');

/**
 * POST /api/auth/register
 * Register user baru
 */
exports.register = async (req, res, next) => {
    try {
        const { id_rs, role, username, pw } = req.body;

        // Cek apakah username sudah terdaftar
        const checkUser = await db.query(
            'SELECT id_user FROM user WHERE username = ?',
            [username]
        );

        if (checkUser.length > 0) {
            logger.warn(`Username already exists: ${username}`);
            return responseError(
                res,
                constants.STATUS_CODES.CONFLICT,
                'Username sudah terdaftar.'
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(pw, parseInt(process.env.BCRYPT_ROUNDS) || 10);

        // Insert user ke database
        const result = await db.query(
            'INSERT INTO user (id_rs, role, username, pw) VALUES (?, ?, ?, ?)',
            [id_rs, role, username, hashedPassword]
        );

        logger.info(`User registered successfully: ${username}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.CREATED,
            constants.MESSAGES.REGISTER_SUCCESS,
            { id_user: result.insertId, username, role }
        );
    } catch (error) {
        logger.error(`Register error: ${error.message}`);
        return responseError(
            res,
            constants.STATUS_CODES.INTERNAL_ERROR,
            constants.MESSAGES.INTERNAL_ERROR
        );
    }
};

/**
 * POST /api/auth/login
 * Login user dan return JWT token
 */
exports.login = async (req, res, next) => {
    try {
        const { username, pw } = req.body;

        // Cari user berdasarkan username
        const users = await db.query(
            'SELECT id_user, username, pw, role, id_rs FROM user WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            logger.warn(`Login failed: username not found - ${username}`);
            return responseError(
                res,
                constants.STATUS_CODES.UNAUTHORIZED,
                constants.MESSAGES.INVALID_CREDENTIALS
            );
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(pw, user.pw);
        if (!isPasswordValid) {
            logger.warn(`Login failed: invalid password - ${username}`);
            return responseError(
                res,
                constants.STATUS_CODES.UNAUTHORIZED,
                constants.MESSAGES.INVALID_CREDENTIALS
            );
        }

        // Generate JWT token
        const token = jwt.sign(
            { id_user: user.id_user, role: user.role, id_rs: user.id_rs },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        // Generate refresh token
        const refreshToken = jwt.sign(
            { id_user: user.id_user, role: user.role },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE }
        );

        logger.info(`User logged in successfully: ${username}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.LOGIN_SUCCESS,
            {
                id_user: user.id_user,
                username: user.username,
                role: user.role,
                id_rs: user.id_rs,
                token,
                refreshToken,
                expiresIn: process.env.JWT_EXPIRE,
            }
        );
    } catch (error) {
        logger.error(`Login error: ${error.message}`);
        return responseError(
            res,
            constants.STATUS_CODES.INTERNAL_ERROR,
            constants.MESSAGES.INTERNAL_ERROR
        );
    }
};

/**
 * POST /api/auth/logout
 * Logout user
 */
exports.logout = async (req, res, next) => {
    try {
        logger.info(`User logged out: ${req.user.id_user}`);
        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.LOGOUT_SUCCESS
        );
    } catch (error) {
        logger.error(`Logout error: ${error.message}`);
        return responseError(
            res,
            constants.STATUS_CODES.INTERNAL_ERROR,
            constants.MESSAGES.INTERNAL_ERROR
        );
    }
};

/**
 * GET /api/auth/profile
 * Get current user profile
 */
exports.getProfile = async (req, res, next) => {
    try {
        const users = await db.query(
            'SELECT u.id_user, u.username, u.role, u.id_rs, rs.nama_rs FROM user u LEFT JOIN rumah_sakit rs ON u.id_rs = rs.id_rs WHERE u.id_user = ?',
            [req.user.id_user]
        );

        if (users.length === 0) {
            return responseError(
                res,
                constants.STATUS_CODES.NOT_FOUND,
                constants.MESSAGES.NOT_FOUND
            );
        }

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.GET_SUCCESS,
            users[0]
        );
    } catch (error) {
        logger.error(`Get profile error: ${error.message}`);
        return responseError(
            res,
            constants.STATUS_CODES.INTERNAL_ERROR,
            constants.MESSAGES.INTERNAL_ERROR
        );
    }
};
