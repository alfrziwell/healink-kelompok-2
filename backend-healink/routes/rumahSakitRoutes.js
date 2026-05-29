/**
 * @file Rumah Sakit Routes
 * @description Routes untuk rumah sakit endpoints
 */

const express = require('express');
const rumahSakitController = require('../controllers/rumahSakitController');
const { verifyToken } = require('../middleware/auth');
const { onlySuperAdmin } = require('../middleware/authorization');
const { validateRumahSakit } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route POST /api/rumah-sakit
 * @access Private - Super Admin only
 * @description Tambah rumah sakit baru
 */
router.post('/', verifyToken, onlySuperAdmin, validateRumahSakit, asyncHandler(rumahSakitController.createRumahSakit));

/**
 * @route GET /api/rumah-sakit
 * @access Private
 * @description Get semua rumah sakit dengan pagination dan search
 */
router.get('/', verifyToken, asyncHandler(rumahSakitController.getAllRumahSakit));

/**
 * @route GET /api/rumah-sakit/:id
 * @access Private
 * @description Get rumah sakit by ID
 */
router.get('/:id', verifyToken, asyncHandler(rumahSakitController.getRumahSakitById));

/**
 * @route PUT /api/rumah-sakit/:id
 * @access Private - Super Admin only
 * @description Update rumah sakit
 */
router.put('/:id', verifyToken, onlySuperAdmin, validateRumahSakit, asyncHandler(rumahSakitController.updateRumahSakit));

/**
 * @route DELETE /api/rumah-sakit/:id
 * @access Private - Super Admin only
 * @description Delete rumah sakit
 */
router.delete('/:id', verifyToken, onlySuperAdmin, asyncHandler(rumahSakitController.deleteRumahSakit));

module.exports = router;
