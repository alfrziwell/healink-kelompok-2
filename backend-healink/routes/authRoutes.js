/**
 * @file Authentication Routes
 * @description Routes untuk authentication endpoints
 */

const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validateLogin, validateRegisterUser } = require('../utils/validation');
const { onlySuperAdmin } = require('../middleware/authorization');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @access Super Admin only
 * @description Register user baru
 */
router.post('/register', onlySuperAdmin, validateRegisterUser, asyncHandler(authController.register));

/**
 * @route POST /api/auth/login
 * @access Public
 * @description Login dan return JWT token
 */
router.post('/login', validateLogin, asyncHandler(authController.login));

/**
 * @route POST /api/auth/logout
 * @access Private
 * @description Logout user
 */
router.post('/logout', verifyToken, asyncHandler(authController.logout));

/**
 * @route GET /api/auth/profile
 * @access Private
 * @description Get current user profile
 */
router.get('/profile', verifyToken, asyncHandler(authController.getProfile));

module.exports = router;
