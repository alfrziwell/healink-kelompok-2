/**
 * @file Diagnosa Controller
 * @description Controller untuk CRUD Diagnosa dengan integrasi blockchain
 */

const db = require('../config/database');
const { responseSuccess, responseError, createPagination } = require('../utils/response');
const constants = require('../config/constants');
const logger = require('../config/logger');
const fabricService = require('../services/fabricService');

/**
 * POST /api/diagnosa
 * Tambah diagnosa baru dan invoke ke blockchain
 */
exports.createDiagnosa = async (req, res, next) => {
    try {
        const { tanggal, id_rs, id_dokter, nik_pasien, nama_diagnosa, kriteria_ciri, obat } = req.body;

        // Validasi data referensi
        const checkRs = await db.query('SELECT id_rs FROM rumah_sakit WHERE id_rs = ?', [id_rs]);
        if (checkRs.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, 'Rumah sakit tidak ditemukan.');
        }

        const checkDokter = await db.query('SELECT id_dokter FROM dokter WHERE id_dokter = ?', [id_dokter]);
        if (checkDokter.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, 'Dokter tidak ditemukan.');
        }

        const checkPasien = await db.query(
            'SELECT nik, nama, alamat, tgl_lahir, jenis_kelamin FROM pasien WHERE nik = ?',
            [nik_pasien]
        );
        if (checkPasien.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, 'Pasien tidak ditemukan.');
        }

        let txId = null;
        try {
            await fabricService.ensurePatientOnChain(checkPasien[0]);

            const invokeResult = await fabricService.invokeChaincode('AddDiagnosis', [
                nik_pasien,
                tanggal,
                String(id_rs),
                String(id_dokter),
                nama_diagnosa,
                kriteria_ciri,
                obat,
            ]);
            if (invokeResult) {
                txId = invokeResult.txId;
                logger.info(`Diagnosa recorded on blockchain, TxID: ${txId}`);
            }
        } catch (fabricError) {
            logger.error(`Blockchain invoke error: ${fabricError.message}`);
        }

        // Insert diagnosa ke database MySQL
        const result = await db.query(
            'INSERT INTO diagnosa (tanggal, id_rs, id_dokter, nik_pasien, nama_diagnosa, kriteria_ciri, obat, tx_id_blockchain) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [tanggal, id_rs, id_dokter, nik_pasien, nama_diagnosa, kriteria_ciri, obat, txId]
        );

        logger.info(`Diagnosa created: ${result.insertId}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.CREATED,
            constants.MESSAGES.CREATE_SUCCESS,
            {
                id_diagnosa: result.insertId,
                tanggal,
                id_rs,
                id_dokter,
                nik_pasien,
                nama_diagnosa,
                kriteria_ciri,
                obat,
                tx_id_blockchain: txId,
            }
        );
    } catch (error) {
        logger.error(`Create diagnosa error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * GET /api/diagnosa
 * Get semua diagnosa dengan JOIN data pasien, dokter, rumah sakit
 * dengan pagination dan search
 */
exports.getAllDiagnosa = async (req, res, next) => {
    try {
        let { page = 1, limit = 10, search = '', id_rs = '' } = req.query;
        page = Math.max(1, parseInt(page));
        limit = Math.min(parseInt(limit), constants.PAGINATION.MAX_LIMIT);

        const offset = (page - 1) * limit;

        // Build where clause
        let whereClause = '';
        let params = [];
        if (search) {
            whereClause = 'WHERE p.nama LIKE ? OR d.nama LIKE ? OR dg.nama_diagnosa LIKE ?';
            params = [`%${search}%`, `%${search}%`, `%${search}%`];
        }
        if (id_rs) {
            whereClause += whereClause ? ' AND dg.id_rs = ?' : 'WHERE dg.id_rs = ?';
            params.push(id_rs);
        }

        // Get total count
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM diagnosa dg ${whereClause.includes('WHERE') || whereClause.includes('AND') ? whereClause.split('WHERE')[0] + 'WHERE' + whereClause.split('WHERE')[1] : ''}`,
            params
        );
        const total = countResult[0].total;

        // Get data dengan JOIN
        const diagnosa = await db.query(
            `SELECT 
                dg.id_diagnosa,
                dg.tanggal,
                dg.id_rs,
                rs.nama_rs,
                dg.id_dokter,
                dok.nama AS nama_dokter,
                dg.nik_pasien,
                p.nama AS nama_pasien,
                dg.nama_diagnosa,
                dg.kriteria_ciri,
                dg.obat,
                dg.tx_id_blockchain
            FROM diagnosa dg
            JOIN rumah_sakit rs ON dg.id_rs = rs.id_rs
            JOIN dokter dok ON dg.id_dokter = dok.id_dokter
            JOIN pasien p ON dg.nik_pasien = p.nik
            ${whereClause}
            ORDER BY dg.id_diagnosa DESC
            LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        const pagination = createPagination(page, limit, total);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.GET_SUCCESS,
            diagnosa,
            pagination
        );
    } catch (error) {
        logger.error(`Get all diagnosa error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * GET /api/diagnosa/:id
 * Get diagnosa by ID dengan JOIN data
 */
exports.getDiagnosaById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const diagnosa = await db.query(
            `SELECT 
                dg.id_diagnosa,
                dg.tanggal,
                dg.id_rs,
                rs.nama_rs,
                dg.id_dokter,
                dok.nama AS nama_dokter,
                dg.nik_pasien,
                p.nama AS nama_pasien,
                dg.nama_diagnosa,
                dg.kriteria_ciri,
                dg.obat,
                dg.tx_id_blockchain
            FROM diagnosa dg
            JOIN rumah_sakit rs ON dg.id_rs = rs.id_rs
            JOIN dokter dok ON dg.id_dokter = dok.id_dokter
            JOIN pasien p ON dg.nik_pasien = p.nik
            WHERE dg.id_diagnosa = ?`,
            [id]
        );

        if (diagnosa.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, constants.MESSAGES.NOT_FOUND);
        }

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.GET_SUCCESS,
            diagnosa[0]
        );
    } catch (error) {
        logger.error(`Get diagnosa error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * PUT /api/diagnosa/:id
 * Update diagnosa
 */
exports.updateDiagnosa = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { tanggal, id_rs, id_dokter, nik_pasien, nama_diagnosa, kriteria_ciri, obat } = req.body;

        // Cek diagnosa ada atau tidak
        const checkDiagnosa = await db.query('SELECT id_diagnosa FROM diagnosa WHERE id_diagnosa = ?', [id]);
        if (checkDiagnosa.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, constants.MESSAGES.NOT_FOUND);
        }

        // Update diagnosa
        await db.query(
            'UPDATE diagnosa SET tanggal = ?, id_rs = ?, id_dokter = ?, nik_pasien = ?, nama_diagnosa = ?, kriteria_ciri = ?, obat = ? WHERE id_diagnosa = ?',
            [tanggal, id_rs, id_dokter, nik_pasien, nama_diagnosa, kriteria_ciri, obat, id]
        );

        logger.info(`Diagnosa updated: ${id}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.UPDATE_SUCCESS,
            { id_diagnosa: id, tanggal, id_rs, id_dokter, nik_pasien, nama_diagnosa, kriteria_ciri, obat }
        );
    } catch (error) {
        logger.error(`Update diagnosa error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * DELETE /api/diagnosa/:id
 * Delete diagnosa
 */
exports.deleteDiagnosa = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Cek diagnosa ada atau tidak
        const checkDiagnosa = await db.query('SELECT id_diagnosa FROM diagnosa WHERE id_diagnosa = ?', [id]);
        if (checkDiagnosa.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, constants.MESSAGES.NOT_FOUND);
        }

        // Delete diagnosa
        await db.query('DELETE FROM diagnosa WHERE id_diagnosa = ?', [id]);

        logger.info(`Diagnosa deleted: ${id}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.DELETE_SUCCESS
        );
    } catch (error) {
        logger.error(`Delete diagnosa error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * GET /api/diagnosa/blockchain/:txId
 * Query diagnosa dari blockchain berdasarkan transaction ID
 */
exports.queryBlockchainTransaction = async (req, res, next) => {
    try {
        const { txId } = req.params;

        const rows = await db.query(
            'SELECT nik_pasien, nama_diagnosa FROM diagnosa WHERE tx_id_blockchain = ? LIMIT 1',
            [txId]
        );
        if (rows.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, 'Transaksi tidak ditemukan di database.');
        }

        const { nik_pasien: nik, nama_diagnosa } = rows[0];
        const historyJson = await fabricService.queryChaincode('GetPatientMedicalHistory', nik);

        if (!historyJson) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, 'Blockchain tidak tersedia.');
        }

        const history = JSON.parse(historyJson);
        const txRecord = history.find((entry) => entry.txId === txId);

        if (!txRecord) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, 'Transaksi tidak ditemukan di blockchain.');
        }

        logger.info(`Blockchain transaction queried: ${txId}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            constants.MESSAGES.FABRIC.QUERY_SUCCESS,
            { txId, nik, nama_diagnosa, ...txRecord }
        );
    } catch (error) {
        logger.error(`Query blockchain error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * GET /api/diagnosa/patient/:nik/medical-history
 * Query riwayat medis lengkap dari blockchain + database
 * Kombinasi data dari blockchain (traceability) dan database (query complex)
 */
exports.getPatientMedicalHistory = async (req, res, next) => {
    try {
        const { nik } = req.params;

        // Cek pasien ada atau tidak
        const checkPasien = await db.query('SELECT * FROM pasien WHERE nik = ?', [nik]);
        if (checkPasien.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, 'Pasien tidak ditemukan.');
        }

        const pasienData = checkPasien[0];

        // Query dari database - diagnosa pasien dengan detail dokter dan rumah sakit
        const dbHistory = await db.query(
            `SELECT 
                dg.id_diagnosa,
                dg.tanggal,
                dg.nama_diagnosa,
                dg.kriteria_ciri,
                dg.obat,
                dok.nama AS nama_dokter,
                rs.nama_rs,
                dg.tx_id_blockchain
            FROM diagnosa dg
            JOIN dokter dok ON dg.id_dokter = dok.id_dokter
            JOIN rumah_sakit rs ON dg.id_rs = rs.id_rs
            WHERE dg.nik_pasien = ?
            ORDER BY dg.tanggal DESC`,
            [nik]
        );

        // Query dari blockchain - riwayat lengkap dengan traceability
        let blockchainHistory = null;
        try {
            const blockchainResult = await fabricService.queryChaincode('GetPatientMedicalHistory', nik);
            if (blockchainResult) {
                blockchainHistory = JSON.parse(blockchainResult);
            }
        } catch (fabricError) {
            logger.warn(`Failed to query blockchain history: ${fabricError.message}`);
        }

        logger.info(`Medical history retrieved for patient: ${nik}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            'Riwayat medis pasien berhasil diambil',
            {
                pasien: pasienData,
                databaseRecords: dbHistory,
                blockchainRecords: blockchainHistory || 'Blockchain tidak tersedia',
                totalRecords: dbHistory.length
            }
        );
    } catch (error) {
        logger.error(`Get medical history error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};

/**
 * GET /api/diagnosa/hospital/:id_rs/summary
 * Query summary diagnosa per rumah sakit dengan aggregation
 * Complex query: COUNT, GROUP BY, TOP diagnosa
 */
exports.getHospitalDiagnosisSummary = async (req, res, next) => {
    try {
        const { id_rs } = req.params;

        // Cek rumah sakit ada atau tidak
        const checkRs = await db.query('SELECT * FROM rumah_sakit WHERE id_rs = ?', [id_rs]);
        if (checkRs.length === 0) {
            return responseError(res, constants.STATUS_CODES.NOT_FOUND, 'Rumah sakit tidak ditemukan.');
        }

        // Summary: Total diagnosa
        const totalDiagnosa = await db.query(
            'SELECT COUNT(*) as total FROM diagnosa WHERE id_rs = ?',
            [id_rs]
        );

        // Summary: Top 5 diagnosa
        const topDiagnosa = await db.query(
            `SELECT 
                nama_diagnosa,
                COUNT(*) as count
            FROM diagnosa
            WHERE id_rs = ?
            GROUP BY nama_diagnosa
            ORDER BY count DESC
            LIMIT 5`,
            [id_rs]
        );

        // Summary: Dokter terbanyak menangani
        const topDokter = await db.query(
            `SELECT 
                d.id_dokter,
                d.nama,
                d.spesialisasi,
                COUNT(dg.id_dokter) as count
            FROM dokter d
            JOIN diagnosa dg ON d.id_dokter = dg.id_dokter
            WHERE dg.id_rs = ?
            GROUP BY d.id_dokter
            ORDER BY count DESC
            LIMIT 5`,
            [id_rs]
        );

        // Summary: Tren per bulan
        const monthlyTrend = await db.query(
            `SELECT 
                DATE_FORMAT(tanggal, '%Y-%m') as bulan,
                COUNT(*) as count
            FROM diagnosa
            WHERE id_rs = ?
            GROUP BY DATE_FORMAT(tanggal, '%Y-%m')
            ORDER BY bulan DESC
            LIMIT 12`,
            [id_rs]
        );

        logger.info(`Hospital diagnosis summary retrieved: ${id_rs}`);

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            'Summary diagnosa rumah sakit berhasil diambil',
            {
                rumahSakit: checkRs[0],
                totalDiagnosa: totalDiagnosa[0].total,
                topDiagnosa: topDiagnosa,
                topDokter: topDokter,
                monthlyTrend: monthlyTrend
            }
        );
    } catch (error) {
        logger.error(`Get hospital summary error: ${error.message}`);
        return responseError(res, constants.STATUS_CODES.INTERNAL_ERROR, constants.MESSAGES.INTERNAL_ERROR);
    }
};
