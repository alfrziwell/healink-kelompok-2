/**
 * @file Diagnosa Routes
 * @description Routes untuk diagnosa endpoints
 */

const express = require('express');
const diagnosaController = require('../controllers/diagnosaController');
const { verifyToken } = require('../middleware/auth');
const { onlyMedicalStaff } = require('../middleware/authorization');
const { validateDiagnosa } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route POST /api/diagnosa
 * @access Private - Medical Staff only (Super Admin, Admin, Dokter)
 * @description Tambah diagnosa baru dan invoke ke blockchain
 */
router.post('/', verifyToken, onlyMedicalStaff, validateDiagnosa, asyncHandler(diagnosaController.createDiagnosa));

/**
 * @route GET /api/diagnosa/blockchain/:txId
 * @access Private
 * @description Query diagnosa dari blockchain berdasarkan transaction ID
 * NOTE: Must be before /:id route to avoid conflict
 */
router.get('/blockchain/:txId', verifyToken, asyncHandler(diagnosaController.queryBlockchainTransaction));

/**
 * @route GET /api/diagnosa/patient/:nik/medical-history
 * @access Private
 * @description Query riwayat medis lengkap dari blockchain + database
 * NOTE: Must be before /:id route to avoid conflict
 */
router.get('/patient/:nik/medical-history', verifyToken, asyncHandler(diagnosaController.getPatientMedicalHistory));

/**
 * @route GET /api/diagnosa/hospital/:id_rs/summary
 * @access Private
 * @description Query summary diagnosa per rumah sakit
 * NOTE: Must be before /:id route to avoid conflict
 */
router.get('/hospital/:id_rs/summary', verifyToken, asyncHandler(diagnosaController.getHospitalDiagnosisSummary));

/**
 * @route GET /api/diagnosa
 * @access Private
 * @description Get semua diagnosa dengan JOIN data dan pagination
 */
router.get('/', verifyToken, asyncHandler(diagnosaController.getAllDiagnosa));

/**
 * @route GET /api/diagnosa/:id
 * @access Private
 * @description Get diagnosa by ID dengan JOIN data
 */
router.get('/:id', verifyToken, asyncHandler(diagnosaController.getDiagnosaById));

/**
 * @route PUT /api/diagnosa/:id
 * @access Private - Medical Staff only
 * @description Update diagnosa
 */
router.put('/:id', verifyToken, onlyMedicalStaff, validateDiagnosa, asyncHandler(diagnosaController.updateDiagnosa));

/**
 * @route DELETE /api/diagnosa/:id
 * @access Private - Medical Staff only
 * @description Delete diagnosa
 */
router.delete('/:id', verifyToken, onlyMedicalStaff, asyncHandler(diagnosaController.deleteDiagnosa));

module.exports = router;
