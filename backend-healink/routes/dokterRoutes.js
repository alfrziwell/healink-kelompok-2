/**
 * @file Dokter Routes
 * @description Routes untuk dokter endpoints
 */

const express = require('express');
const dokterController = require('../controllers/dokterController');
const { verifyToken } = require('../middleware/auth');
const { onlyAdmin } = require('../middleware/authorization');
const { validateDokter } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route POST /api/dokter
 * @access Private - Admin only
 * @description Tambah dokter baru
 */
router.post('/', verifyToken, onlyAdmin, validateDokter, asyncHandler(dokterController.createDokter));

/**
 * @route GET /api/dokter
 * @access Private
 * @description Get semua dokter dengan pagination dan search
 */
router.get('/', verifyToken, asyncHandler(dokterController.getAllDokter));

/**
 * @route GET /api/dokter/:id
 * @access Private
 * @description Get dokter by ID
 */
router.get('/:id', verifyToken, asyncHandler(dokterController.getDokterById));

/**
 * @route PUT /api/dokter/:id
 * @access Private - Admin only
 * @description Update dokter
 */
router.put('/:id', verifyToken, onlyAdmin, validateDokter, asyncHandler(dokterController.updateDokter));

/**
 * @route DELETE /api/dokter/:id
 * @access Private - Admin only
 * @description Delete dokter
 */
router.delete('/:id', verifyToken, onlyAdmin, asyncHandler(dokterController.deleteDokter));

module.exports = router;
