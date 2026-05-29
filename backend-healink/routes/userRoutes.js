/**
 * @file User Routes
 * @description Routes untuk manajemen user admin
 */

const express = require('express');
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const { onlySuperAdmin } = require('../middleware/authorization');
const { validateCreateAdminUser, validateUpdateAdminUser } = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route GET /api/users/admins
 * @access Private - Super Admin only
 * @description Get semua admin
 */
router.get('/admins', verifyToken, onlySuperAdmin, asyncHandler(userController.getAllAdmins));

/**
 * @route GET /api/users/admins/:id
 * @access Private - Super Admin only
 * @description Get admin by id
 */
router.get('/admins/:id', verifyToken, onlySuperAdmin, asyncHandler(userController.getAdminById));

/**
 * @route POST /api/users/admins
 * @access Private - Super Admin only
 * @description Tambah admin baru
 */
router.post('/admins', verifyToken, onlySuperAdmin, validateCreateAdminUser, asyncHandler(userController.createAdmin));

/**
 * @route PUT /api/users/admins/:id
 * @access Private - Super Admin only
 * @description Update admin
 */
router.put('/admins/:id', verifyToken, onlySuperAdmin, validateUpdateAdminUser, asyncHandler(userController.updateAdmin));

/**
 * @route DELETE /api/users/admins/:id
 * @access Private - Super Admin only
 * @description Hapus admin
 */
router.delete('/admins/:id', verifyToken, onlySuperAdmin, asyncHandler(userController.deleteAdmin));

module.exports = router;