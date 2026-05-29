/**
 * @file Fabric Routes
 * @description Routes untuk cek koneksi Hyperledger Fabric
 */

const express = require('express');
const fabricController = require('../controllers/fabricController');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route GET /api/fabric/health
 * @access Private
 * @description Cek status koneksi Fabric dan chaincode
 */
router.get('/health', verifyToken, asyncHandler(fabricController.getFabricHealth));

/**
 * @route GET /api/fabric/ledger/all
 * @description Semua rekam medis di Hyperledger ledger
 */
router.get('/ledger/all', verifyToken, asyncHandler(fabricController.getAllLedgerRecords));

module.exports = router;