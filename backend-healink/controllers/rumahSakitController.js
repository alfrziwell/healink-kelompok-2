/**
 * @file Rumah Sakit Controller
 * @description Controller untuk CRUD Rumah Sakit
 */

const db = require('../config/database');
const { responseSuccess, responseError, createPagination } = require('../utils/response');
const constants = require('../config/constants');
const logger = require('../config/logger');

/**
 * POST /api/rumah-sakit
 * Tambah rumah sakit baru
 */
exports.createRumahSakit = async (req, res, next) => {
    try {
        const { nama_rs, alamat, telepon } = req.body;

        // Insert rumah sakit
        const result = await db.query(
            'INSERT INTO rumah_sakit (nama_rs, alamat, telepon) VALUES (?, ?, ?)',
            [nama_rs, alamat, telepon]
        );

        logger.info(`Rumah Sakit created: ${nama_rs}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.CREATED,
            constants.MESSAGES.CREATE_SUCCESS,
            { id_rs: result.insertId, nama_rs, alamat, telepon }
        );
    } catch (error) {
        logger.error(`Create rumah sakit error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * GET /api/rumah-sakit
 * Get semua rumah sakit dengan pagination dan search
 */
exports.getAllRumahSakit = async (req, res, next) => {
    try {
        let { page = 1, limit = 10, search = '' } = req.query;
        page = Math.max(1, parseInt(page));
        limit = Math.min(parseInt(limit), constants.PAGINATION.MAX_LIMIT);

        const offset = (page - 1) * limit;

        // Build where clause
        let whereClause = '';
        let params = [];
        if (search) {
            whereClause = 'WHERE nama_rs LIKE ? OR alamat LIKE ?';
            params = [`%${search}%`, `%${search}%`];
        }

        // Get total count
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM rumah_sakit ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // Get data dengan pagination
        const rumahSakit = await db.query(
            `SELECT * FROM rumah_sakit ${whereClause} ORDER BY id_rs DESC LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        const pagination = createPagination(page, limit, total);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.GET_SUCCESS,
            rumahSakit,
            pagination
        );
    } catch (error) {
        logger.error(`Get all rumah sakit error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * GET /api/rumah-sakit/:id
 * Get rumah sakit by ID
 */
exports.getRumahSakitById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const rumahSakit = await db.query(
            'SELECT * FROM rumah_sakit WHERE id_rs = ?',
            [id]
        );

        if (rumahSakit.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, constants.MESSAGES.NOT_FOUND);
        }

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.GET_SUCCESS,
            rumahSakit[0]
        );
    } catch (error) {
        logger.error(`Get rumah sakit error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * PUT /api/rumah-sakit/:id
 * Update rumah sakit
 */
exports.updateRumahSakit = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nama_rs, alamat, telepon } = req.body;

        // Cek rumah sakit ada atau tidak
        const checkRs = await db.query('SELECT id_rs FROM rumah_sakit WHERE id_rs = ?', [id]);
        if (checkRs.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, constants.MESSAGES.NOT_FOUND);
        }

        // Update rumah sakit
        await db.query(
            'UPDATE rumah_sakit SET nama_rs = ?, alamat = ?, telepon = ? WHERE id_rs = ?',
            [nama_rs, alamat, telepon, id]
        );

        logger.info(`Rumah Sakit updated: ${id}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.UPDATE_SUCCESS,
            { id_rs: id, nama_rs, alamat, telepon }
        );
    } catch (error) {
        logger.error(`Update rumah sakit error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * DELETE /api/rumah-sakit/:id
 * Delete rumah sakit
 */
exports.deleteRumahSakit = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Cek rumah sakit ada atau tidak
        const checkRs = await db.query('SELECT id_rs FROM rumah_sakit WHERE id_rs = ?', [id]);
        if (checkRs.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, constants.MESSAGES.NOT_FOUND);
        }

        // Delete rumah sakit
        await db.query('DELETE FROM rumah_sakit WHERE id_rs = ?', [id]);

        logger.info(`Rumah Sakit deleted: ${id}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.DELETE_SUCCESS
        );
    } catch (error) {
        logger.error(`Delete rumah sakit error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};
