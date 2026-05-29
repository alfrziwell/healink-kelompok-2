/**
 * @file User Controller
 * @description Controller untuk CRUD user role admin
 */

const bcrypt = require('bcrypt');
const db = require('../config/database');
const { responseSuccess, responseError, createPagination } = require('../utils/response');
const constants = require('../config/constants');
const logger = require('../config/logger');

const ADMIN_ROLE = constants.ROLES.ADMIN;

/**
 * GET /api/users/admins
 * Get daftar user admin
 */
exports.getAllAdmins = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || constants.PAGINATION.DEFAULT_PAGE;
        const limit = parseInt(req.query.limit, 10) || constants.PAGINATION.DEFAULT_LIMIT;
        const search = (req.query.search || '').trim();
        const offset = (page - 1) * limit;

        const whereClauses = ['u.role = ?'];
        const values = [ADMIN_ROLE];

        if (search) {
            whereClauses.push('(u.username LIKE ? OR rs.nama_rs LIKE ?)');
            values.push(`%${search}%`, `%${search}%`);
        }

        const whereSql = whereClauses.join(' AND ');

        const countResult = await db.query(
            `SELECT COUNT(*) AS total FROM user u LEFT JOIN rumah_sakit rs ON u.id_rs = rs.id_rs WHERE ${whereSql}`,
            values
        );

        const total = countResult[0]?.total || 0;

        const admins = await db.query(
            `SELECT u.id_user, u.id_rs, u.role, u.username, rs.nama_rs
             FROM user u
             LEFT JOIN rumah_sakit rs ON u.id_rs = rs.id_rs
             WHERE ${whereSql}
             ORDER BY u.id_user DESC
             LIMIT ? OFFSET ?`,
            [...values, limit, offset]
        );

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.GET_SUCCESS,
            admins,
            createPagination(page, limit, total)
        );
    } catch (error) {
        logger.error(`Get all admins error: ${error.message}`);
        return responseError(
            res,
            constants.STATUS_CODES.INTERNAL_ERROR,
            constants.MESSAGES.INTERNAL_ERROR
        );
    }
};

/**
 * GET /api/users/admins/:id
 * Get admin by id
 */
exports.getAdminById = async (req, res) => {
    try {
        const admins = await db.query(
            `SELECT u.id_user, u.id_rs, u.role, u.username, rs.nama_rs
             FROM user u
             LEFT JOIN rumah_sakit rs ON u.id_rs = rs.id_rs
             WHERE u.id_user = ? AND u.role = ?`,
            [req.params.id, ADMIN_ROLE]
        );

        if (admins.length === 0) {
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
            admins[0]
        );
    } catch (error) {
        logger.error(`Get admin by id error: ${error.message}`);
        return responseError(
            res,
            constants.STATUS_CODES.INTERNAL_ERROR,
            constants.MESSAGES.INTERNAL_ERROR
        );
    }
};

/**
 * POST /api/users/admins
 * Create admin user
 */
exports.createAdmin = async (req, res) => {
    try {
        const { id_rs, username, pw } = req.body;

        const existingUser = await db.query(
            'SELECT id_user FROM user WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            return responseError(
                res,
                constants.STATUS_CODES.CONFLICT,
                'Username sudah terdaftar.'
            );
        }

        const hashedPassword = await bcrypt.hash(
            pw,
            parseInt(process.env.BCRYPT_ROUNDS, 10) || 10
        );

        const result = await db.query(
            'INSERT INTO user (id_rs, role, username, pw) VALUES (?, ?, ?, ?)',
            [id_rs, ADMIN_ROLE, username, hashedPassword]
        );

        logger.info(`Admin created successfully: ${username}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.CREATED,
            'Admin berhasil dibuat.',
            {
                id_user: result.insertId,
                id_rs,
                role: ADMIN_ROLE,
                username,
            }
        );
    } catch (error) {
        logger.error(`Create admin error: ${error.message}`);
        return responseError(
            res,
            constants.STATUS_CODES.INTERNAL_ERROR,
            constants.MESSAGES.INTERNAL_ERROR
        );
    }
};

/**
 * PUT /api/users/admins/:id
 * Update admin user
 */
exports.updateAdmin = async (req, res) => {
    try {
        const adminId = req.params.id;
        const { id_rs, username, pw } = req.body;

        const admins = await db.query(
            'SELECT id_user FROM user WHERE id_user = ? AND role = ?',
            [adminId, ADMIN_ROLE]
        );

        if (admins.length === 0) {
            return responseError(
                res,
                constants.STATUS_CODES.NOT_FOUND,
                constants.MESSAGES.NOT_FOUND
            );
        }

        const updates = [];
        const values = [];

        if (typeof id_rs !== 'undefined') {
            updates.push('id_rs = ?');
            values.push(id_rs);
        }

        if (username) {
            const usernameCheck = await db.query(
                'SELECT id_user FROM user WHERE username = ? AND id_user != ?',
                [username, adminId]
            );

            if (usernameCheck.length > 0) {
                return responseError(
                    res,
                    constants.STATUS_CODES.CONFLICT,
                    'Username sudah terdaftar.'
                );
            }

            updates.push('username = ?');
            values.push(username);
        }

        if (pw) {
            const hashedPassword = await bcrypt.hash(
                pw,
                parseInt(process.env.BCRYPT_ROUNDS, 10) || 10
            );
            updates.push('pw = ?');
            values.push(hashedPassword);
        }

        if (updates.length === 0) {
            return responseError(
                res,
                constants.STATUS_CODES.BAD_REQUEST,
                'Tidak ada data yang diubah.'
            );
        }

        values.push(adminId);

        await db.query(
            `UPDATE user SET ${updates.join(', ')} WHERE id_user = ? AND role = ?`,
            [...values, ADMIN_ROLE]
        );

        const updatedAdmin = await db.query(
            `SELECT u.id_user, u.id_rs, u.role, u.username, rs.nama_rs
             FROM user u
             LEFT JOIN rumah_sakit rs ON u.id_rs = rs.id_rs
             WHERE u.id_user = ? AND u.role = ?`,
            [adminId, ADMIN_ROLE]
        );

        logger.info(`Admin updated successfully: ${adminId}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            'Admin berhasil diperbarui.',
            updatedAdmin[0]
        );
    } catch (error) {
        logger.error(`Update admin error: ${error.message}`);
        return responseError(
            res,
            constants.STATUS_CODES.INTERNAL_ERROR,
            constants.MESSAGES.INTERNAL_ERROR
        );
    }
};

/**
 * DELETE /api/users/admins/:id
 * Delete admin user
 */
exports.deleteAdmin = async (req, res) => {
    try {
        const adminId = req.params.id;

        const admins = await db.query(
            'SELECT id_user FROM user WHERE id_user = ? AND role = ?',
            [adminId, ADMIN_ROLE]
        );

        if (admins.length === 0) {
            return responseError(
                res,
                constants.STATUS_CODES.NOT_FOUND,
                constants.MESSAGES.NOT_FOUND
            );
        }

        await db.query(
            'DELETE FROM user WHERE id_user = ? AND role = ?',
            [adminId, ADMIN_ROLE]
        );

        logger.info(`Admin deleted successfully: ${adminId}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            'Admin berhasil dihapus.'
        );
    } catch (error) {
        logger.error(`Delete admin error: ${error.message}`);
        return responseError(
            res,
            constants.STATUS_CODES.INTERNAL_ERROR,
            constants.MESSAGES.INTERNAL_ERROR
        );
    }
};