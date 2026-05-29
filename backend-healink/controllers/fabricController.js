/**
 * @file Fabric Controller
 * @description Controller untuk mengecek status koneksi Hyperledger Fabric
 */

const fabricService = require('../services/fabricService');
const { responseSuccess } = require('../utils/response');
const constants = require('../config/constants');

/**
 * GET /api/fabric/health
 */
exports.getFabricHealth = async (req, res) => {
    const status = fabricService.getFabricStatus();

    if (!status.connected) {
        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            'Fabric belum terhubung. Pastikan wallet, network profile, channel, dan chaincode sudah benar.',
            {
                ...status,
                ping: 'contract not initialized',
            }
        );
    }

    try {
        const ping = await fabricService.queryChaincode('Ping');

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            'Fabric terhubung dan chaincode rekammedis siap.',
            {
                ...status,
                ping: ping || 'ok',
            }
        );
    } catch (error) {
        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            'Fabric terhubung, tetapi chaincode belum ter-deploy atau nama kontrak salah.',
            {
                ...status,
                ping: 'chaincode query failed',
                error: error.message,
            }
        );
    }
};

/**
 * GET /api/fabric/ledger/all
 * Semua rekam medis di ledger (chaincode rekammedis)
 */
exports.getAllLedgerRecords = async (req, res) => {
    const status = fabricService.getFabricStatus();

    if (!status.connected) {
        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            'Fabric belum terhubung.',
            { ...status, records: [] }
        );
    }

    try {
        const result = await fabricService.queryChaincode('GetAllPatientRecords');
        const data = result ? JSON.parse(result) : { total: 0, records: [] };

        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            'Data ledger berhasil diambil.',
            data
        );
    } catch (error) {
        return responseSuccess(
            res,
            constants.STATUS_CODES.OK,
            'Gagal membaca ledger. Deploy chaincode versi terbaru (GetAllPatientRecords).',
            { error: error.message }
        );
    }
};
