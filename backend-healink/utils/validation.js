/**
 * @file Validation Helper
 * @description Helper untuk validasi input
 */

const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');

/**
 * Middleware untuk menangani validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Validation error: ${JSON.stringify(errors.array())}`);
        return res.status(400).json({
            success: false,
            message: 'Validasi data gagal.',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg,
                value: err.value,
            })),
        });
    }
    next();
};

/**
 * Validasi untuk Login
 */
const validateLogin = [
    body('username').trim().notEmpty().withMessage('Username wajib diisi'),
    body('pw').notEmpty().withMessage('Password wajib diisi'),
    handleValidationErrors,
];

/**
 * Validasi untuk Register User
 */
const validateRegisterUser = [
    body('id_rs').isInt().withMessage('ID Rumah Sakit harus angka'),
    body('role').isIn(['super_admin', 'admin', 'dokter', 'staff']).withMessage('Role tidak valid'),
    body('username').trim().notEmpty().withMessage('Username wajib diisi').isLength({ min: 3 }).withMessage('Username minimal 3 karakter'),
    body('pw').notEmpty().withMessage('Password wajib diisi').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    handleValidationErrors,
];

/**
 * Validasi untuk Create Admin User
 */
const validateCreateAdminUser = [
    body('id_rs').isInt().withMessage('ID Rumah Sakit harus angka'),
    body('username').trim().notEmpty().withMessage('Username wajib diisi').isLength({ min: 3 }).withMessage('Username minimal 3 karakter'),
    body('pw').notEmpty().withMessage('Password wajib diisi').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    handleValidationErrors,
];

/**
 * Validasi untuk Update Admin User
 */
const validateUpdateAdminUser = [
    body('id_rs').optional().isInt().withMessage('ID Rumah Sakit harus angka'),
    body('username').optional().trim().notEmpty().withMessage('Username tidak boleh kosong').isLength({ min: 3 }).withMessage('Username minimal 3 karakter'),
    body('pw').optional().notEmpty().withMessage('Password tidak boleh kosong').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    handleValidationErrors,
];

/**
 * Validasi untuk Tambah/Update Pasien
 */
const validatePasien = [
    body('nik').trim().notEmpty().withMessage('NIK wajib diisi').isLength({ min: 16, max: 16 }).withMessage('NIK harus 16 karakter'),
    body('nama').trim().notEmpty().withMessage('Nama wajib diisi'),
    body('alamat').trim().notEmpty().withMessage('Alamat wajib diisi'),
    body('tgl_lahir').notEmpty().withMessage('Tanggal lahir wajib diisi').isISO8601().withMessage('Format tanggal tidak valid'),
    body('jenis_kelamin').isIn(['L', 'P']).withMessage('Jenis kelamin harus L atau P'),
    handleValidationErrors,
];

/**
 * Validasi untuk Tambah/Update Dokter
 */
const validateDokter = [
    body('nama').trim().notEmpty().withMessage('Nama wajib diisi'),
    body('alamat').trim().notEmpty().withMessage('Alamat wajib diisi'),
    body('nomor_telp').trim().notEmpty().withMessage('Nomor telepon wajib diisi'),
    body('id_rs').isInt().withMessage('ID Rumah Sakit harus angka'),
    handleValidationErrors,
];

/**
 * Validasi untuk Tambah/Update Rumah Sakit
 */
const validateRumahSakit = [
    body('nama_rs').trim().notEmpty().withMessage('Nama rumah sakit wajib diisi'),
    body('alamat').trim().notEmpty().withMessage('Alamat wajib diisi'),
    body('telepon').trim().notEmpty().withMessage('Telepon wajib diisi'),
    handleValidationErrors,
];

/**
 * Validasi untuk Tambah/Update Diagnosa
 */
const validateDiagnosa = [
    body('tanggal').notEmpty().withMessage('Tanggal wajib diisi').isISO8601().withMessage('Format tanggal tidak valid'),
    body('id_rs').isInt().withMessage('ID Rumah Sakit harus angka'),
    body('id_dokter').isInt().withMessage('ID Dokter harus angka'),
    body('nik_pasien').trim().notEmpty().withMessage('NIK Pasien wajib diisi'),
    body('nama_diagnosa').trim().notEmpty().withMessage('Nama diagnosa wajib diisi'),
    body('kriteria_ciri').trim().notEmpty().withMessage('Kriteria ciri wajib diisi'),
    body('obat').trim().notEmpty().withMessage('Obat wajib diisi'),
    handleValidationErrors,
];

module.exports = {
    handleValidationErrors,
    validateLogin,
    validateRegisterUser,
    validateCreateAdminUser,
    validateUpdateAdminUser,
    validatePasien,
    validateDokter,
    validateRumahSakit,
    validateDiagnosa,
};
