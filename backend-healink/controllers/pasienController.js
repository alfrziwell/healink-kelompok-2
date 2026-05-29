/**
 * @file Pasien Controller
 * @description Controller untuk CRUD Pasien
 */

const db = require('../config/database');
const { responseSuccess, responseError, createPagination } = require('../utils/response');
const constants = require('../config/constants');
const logger = require('../config/logger');
const fabricService = require('../services/fabricService');

/**
 * POST /api/pasien
 * Tambah pasien baru dan register ke blockchain
 */
exports.createPasien = async (req, res, next) => {
    try {
        const { nik, nama, alamat, tgl_lahir, jenis_kelamin } = req.body;

        // Cek NIK sudah ada atau tidak
        const checkNik = await db.query('SELECT nik FROM pasien WHERE nik = ?', [nik]);
        if (checkNik.length > 0) {
            return responseError(res, constants.STATUS_CODES.CONFLICT, 'NIK sudah terdaftar.');
        }

        // Invoke ke blockchain untuk register pasien
        let txId = null;
        try {
            const invokeResult = await fabricService.invokeChaincode('CreatePatientRecord', [
                nik,
                nama,
                alamat,
                tgl_lahir,
                jenis_kelamin,
            ]);
            if (invokeResult) {
                txId = invokeResult.txId;
                logger.info(`Patient registered to blockchain, TxID: ${txId}`);
            }
        } catch (fabricError) {
            logger.error(`Blockchain registration error: ${fabricError.message}`);
        }

        const result = await db.query(
            'INSERT INTO pasien (nik, nama, alamat, tgl_lahir, jenis_kelamin) VALUES (?, ?, ?, ?, ?)',
            [nik, nama, alamat, tgl_lahir, jenis_kelamin]
        );

        logger.info(`Pasien created: ${nik}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.CREATED,
            constants.MESSAGES.CREATE_SUCCESS,
            { nik, nama, alamat, tgl_lahir, jenis_kelamin, tx_id_blockchain: txId }
        );
    } catch (error) {
        logger.error(`Create pasien error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * GET /api/pasien
 * Get semua pasien dengan pagination dan search
 */
exports.getAllPasien = async (req, res, next) => {
    try {
        let { page = 1, limit = 10, search = '' } = req.query;
        page = Math.max(1, parseInt(page));
        limit = Math.min(parseInt(limit), constants.PAGINATION.MAX_LIMIT);

        const offset = (page - 1) * limit;

        // Build where clause untuk search
        let whereClause = '';
        let params = [];
        if (search) {
            whereClause = 'WHERE nik LIKE ? OR nama LIKE ?';
            params = [`%${search}%`, `%${search}%`];
        }

        // Get total count
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM pasien ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // Get data dengan pagination
        const pasien = await db.query(
            `SELECT * FROM pasien ${whereClause} ORDER BY nik DESC LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        const pagination = createPagination(page, limit, total);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.GET_SUCCESS,
            pasien,
            pagination
        );
    } catch (error) {
        logger.error(`Get all pasien error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * GET /api/pasien/:nik
 * Get pasien by NIK
 */
exports.getPasienByNik = async (req, res, next) => {
    try {
        const { nik } = req.params;

        const pasien = await db.query('SELECT * FROM pasien WHERE nik = ?', [nik]);

        if (pasien.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, constants.MESSAGES.NOT_FOUND);
        }

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.GET_SUCCESS,
            pasien[0]
        );
    } catch (error) {
        logger.error(`Get pasien error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * PUT /api/pasien/:nik
 * Update pasien
 */
exports.updatePasien = async (req, res, next) => {
    try {
        const { nik } = req.params;
        const { nama, alamat, tgl_lahir, jenis_kelamin } = req.body;

        // Cek pasien ada atau tidak
        const checkPasien = await db.query('SELECT nik FROM pasien WHERE nik = ?', [nik]);
        if (checkPasien.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, constants.MESSAGES.NOT_FOUND);
        }

        // Update pasien
        await db.query(
            'UPDATE pasien SET nama = ?, alamat = ?, tgl_lahir = ?, jenis_kelamin = ? WHERE nik = ?',
            [nama, alamat, tgl_lahir, jenis_kelamin, nik]
        );

        logger.info(`Pasien updated: ${nik}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.UPDATE_SUCCESS,
            { nik, nama, alamat, tgl_lahir, jenis_kelamin }
        );
    } catch (error) {
        logger.error(`Update pasien error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * DELETE /api/pasien/:nik
 * Delete pasien
 */
exports.deletePasien = async (req, res, next) => {
    try {
        const { nik } = req.params;

        // Cek pasien ada atau tidak
        const checkPasien = await db.query('SELECT nik FROM pasien WHERE nik = ?', [nik]);
        if (checkPasien.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, constants.MESSAGES.NOT_FOUND);
        }

        // Delete pasien
        await db.query('DELETE FROM pasien WHERE nik = ?', [nik]);

        logger.info(`Pasien deleted: ${nik}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.DELETE_SUCCESS
        );
    } catch (error) {
        logger.error(`Delete pasien error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};
