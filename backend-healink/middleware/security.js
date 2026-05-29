/**
 * @file Security Middleware
 * @description Middleware untuk security headers, rate limiting, input sanitization
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

const sanitizeValue = (value) => {
    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }

    if (value && typeof value === 'object') {
        return Object.keys(value).reduce((acc, key) => {
            const safeKey = key.replace(/\$|\./g, '_');
            acc[safeKey] = sanitizeValue(value[key]);
            return acc;
        }, {});
    }

    return value;
};

const sanitizeRequest = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeValue(req.body);
    }

    if (req.params) {
        req.params = sanitizeValue(req.params);
    }

    if (req.headers) {
        req.headers = sanitizeValue(req.headers);
    }

    next();
};

/**
 * Security Headers menggunakan Helmet
 * Menambahkan berbagai HTTP headers untuk security
 */
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    hsts: {
        maxAge: 31536000, // 1 tahun
        includeSubDomains: true,
        preload: true,
    },
    frameguard: {
        action: 'deny',
    },
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
    },
});

/**
 * Rate Limiter untuk general API
 * Membatasi request per IP address
 */
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 menit
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Maksimal 100 request
    message: 'Terlalu banyak request dari alamat IP ini. Silakan coba lagi nanti.',
    standardHeaders: true, // Return rate limit info di `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skip: (req) => {
        // Skip rate limiting untuk health check
        return req.path === '/api/health';
    },
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Terlalu banyak request. Silakan coba lagi nanti.',
        });
    },
});

/**
 * Rate Limiter untuk Login
 * Lebih ketat untuk login endpoint
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 5, // Maksimal 5 attempt login
    message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Login rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
        });
    },
});

/**
 * Input Sanitization
 * Menghapus karakter berbahaya dari input tanpa menyentuh req.query
 */
const inputSanitizer = (req, res, next) => {
    sanitizeRequest(req, res, next);
};

/**
 * CORS Configuration
 * @param {object} app - Express app
 */
const setupCORS = (app) => {
    const corsOptions = {
        origin: process.env.NODE_ENV === 'production' 
            ? process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000'
            : '*',
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
        maxAge: 86400, // 24 hours
    };

    app.use(require('cors')(corsOptions));
    logger.info('CORS configured');
};

module.exports = {
    securityHeaders,
    generalLimiter,
    loginLimiter,
    inputSanitizer,
    setupCORS,
};
