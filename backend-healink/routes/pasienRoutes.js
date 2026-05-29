/**
 * @file Pasien Routes
 * @description Routes untuk pasien endpoints
 */

const express = require('express');
const pasienController = require('../controllers/pasienController');
const { verifyToken } = require('../middleware/auth');
const { onlyAdmin } = require('../middleware/authorization');
const { validatePasien } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route POST /api/pasien
 * @access Private - Admin only
 * @description Tambah pasien baru
 */
router.post('/', verifyToken, onlyAdmin, validatePasien, asyncHandler(pasienController.createPasien));

/**
 * @route GET /api/pasien
 * @access Private
 * @description Get semua pasien dengan pagination dan search
 */
router.get('/', verifyToken, asyncHandler(pasienController.getAllPasien));

/**
 * @route GET /api/pasien/:nik
 * @access Private
 * @description Get pasien by NIK
 */
router.get('/:nik', verifyToken, asyncHandler(pasienController.getPasienByNik));

/**
 * @route PUT /api/pasien/:nik
 * @access Private - Admin only
 * @description Update pasien
 */
router.put('/:nik', verifyToken, onlyAdmin, validatePasien, asyncHandler(pasienController.updatePasien));

/**
 * @route DELETE /api/pasien/:nik
 * @access Private - Admin only
 * @description Delete pasien
 */
router.delete('/:nik', verifyToken, onlyAdmin, asyncHandler(pasienController.deletePasien));

module.exports = router;
