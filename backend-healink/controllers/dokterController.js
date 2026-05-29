/**
 * @file Dokter Controller
 * @description Controller untuk CRUD Dokter
 */

const db = require('../config/database');
const { responseSuccess, responseError, createPagination } = require('../utils/response');
const constants = require('../config/constants');
const logger = require('../config/logger');

/**
 * POST /api/dokter
 * Tambah dokter baru
 */
exports.createDokter = async (req, res, next) => {
    try {
        const { nama, alamat, nomor_telp, spesialisasi } = req.body;

        // Insert dokter
        const result = await db.query(
            'INSERT INTO dokter (nama, alamat, nomor_telp, spesialisasi) VALUES (?, ?, ?, ?)',
            [nama, alamat, nomor_telp, spesialisasi]
        );

        logger.info(`Dokter created: ${nama}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.CREATED,
            constants.MESSAGES.CREATE_SUCCESS,
            { id_dokter: result.insertId, nama, alamat, nomor_telp, spesialisasi }
        );
    } catch (error) {
        logger.error(`Create dokter error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * GET /api/dokter
 * Get semua dokter dengan pagination dan search
 */
exports.getAllDokter = async (req, res, next) => {
    try {
        let { page = 1, limit = 10, search = '', id_rs = '' } = req.query;
        page = Math.max(1, parseInt(page));
        limit = Math.min(parseInt(limit), constants.PAGINATION.MAX_LIMIT);

        const offset = (page - 1) * limit;

        // Build where clause
        let whereClause = '';
        let params = [];
        if (search) {
            whereClause = 'WHERE nama LIKE ?';
            params.push(`%${search}%`);
        }
        if (id_rs) {
            whereClause += whereClause ? ' AND id_rs = ?' : 'WHERE id_rs = ?';
            params.push(id_rs);
        }

        // Get total count
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM dokter ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // Get data dengan pagination
        const dokter = await db.query(
            `SELECT * FROM dokter ${whereClause} ORDER BY id_dokter DESC LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        const pagination = createPagination(page, limit, total);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.GET_SUCCESS,
            dokter,
            pagination
        );
    } catch (error) {
        logger.error(`Get all dokter error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * GET /api/dokter/:id
 * Get dokter by ID
 */
exports.getDokterById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const dokter = await db.query(
            'SELECT * FROM dokter WHERE id_dokter = ?',
            [id]
        );

        if (dokter.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, constants.MESSAGES.NOT_FOUND);
        }

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.GET_SUCCESS,
            dokter[0]
        );
    } catch (error) {
        logger.error(`Get dokter error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * PUT /api/dokter/:id
 * Update dokter
 */
exports.updateDokter = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nama, alamat, nomor_telp, spesialisasi } = req.body;

        // Cek dokter ada atau tidak
        const checkDokter = await db.query('SELECT id_dokter FROM dokter WHERE id_dokter = ?', [id]);
        if (checkDokter.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, constants.MESSAGES.NOT_FOUND);
        }

        // Update dokter
        await db.query(
            'UPDATE dokter SET nama = ?, alamat = ?, nomor_telp = ?, spesialisasi = ? WHERE id_dokter = ?',
            [nama, alamat, nomor_telp, spesialisasi, id]
        );

        logger.info(`Dokter updated: ${id}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.UPDATE_SUCCESS,
            { id_dokter: id, nama, alamat, nomor_telp, spesialisasi }
        );
    } catch (error) {
        logger.error(`Update dokter error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * DELETE /api/dokter/:id
 * Delete dokter
 */
exports.deleteDokter = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Cek dokter ada atau tidak
        const checkDokter = await db.query('SELECT id_dokter FROM dokter WHERE id_dokter = ?', [id]);
        if (checkDokter.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, constants.MESSAGES.NOT_FOUND);
        }

        // Delete dokter
        await db.query('DELETE FROM dokter WHERE id_dokter = ?', [id]);

        logger.info(`Dokter deleted: ${id}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.DELETE_SUCCESS
        );
    } catch (error) {
        logger.error(`Delete dokter error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};
