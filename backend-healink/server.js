/**
 * ============================================
 * MEDICAL RECORDS BACKEND - MAIN SERVER FILE
 * Express.js + MySQL + Hyperledger Fabric
 * ============================================
 */

require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// ===========================
// CONFIG IMPORTS
// ===========================
const logger = require('./config/logger');
const db = require('./config/database');
const constants = require('./config/constants');

// ===========================
// MIDDLEWARE IMPORTS
// ===========================
const { securityHeaders, generalLimiter, loginLimiter, inputSanitizer, setupCORS } = require('./middleware/security');
const { verifyToken, refreshTokenMiddleware } = require('./middleware/auth');
const { errorHandler, notFoundHandler, asyncHandler } = require('./middleware/errorHandler');

// ===========================
// ROUTES IMPORTS
// ===========================
const authRoutes = require('./routes/authRoutes');
const fabricRoutes = require('./routes/fabricRoutes');
const userRoutes = require('./routes/userRoutes');
const pasienRoutes = require('./routes/pasienRoutes');
const dokterRoutes = require('./routes/dokterRoutes');
const rumahSakitRoutes = require('./routes/rumahSakitRoutes');
const diagnosaRoutes = require('./routes/diagnosaRoutes');

// ===========================
// SERVICES IMPORTS
// ===========================
const fabricService = require('./services/fabricService');

// ===========================
// EXPRESS APP SETUP
// ===========================
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ===========================
// LOGGING SETUP
// ===========================
// Create logs directory jika tidak ada
if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs');
}

// Morgan logger untuk HTTP requests
const morganFormat = NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
    stream: fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' }),
    skip: (req) => req.path === '/api/health', // Skip health check dari log
}));
app.use(morgan(morganFormat));

logger.info(`🚀 Server starting in ${NODE_ENV} mode...`);

// ===========================
// MIDDLEWARE SETUP
// ===========================
// Security headers
app.use(securityHeaders);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS setup
setupCORS(app);

// Input sanitization
app.use(inputSanitizer);

// Rate limiting
app.use(generalLimiter);

// Token refresh middleware
app.use(refreshTokenMiddleware);

// ===========================
// HEALTH CHECK ENDPOINT
// ===========================
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// ===========================
// INFO ENDPOINT
// ===========================
app.get('/api/info', (req, res) => {
    res.status(200).json({
        success: true,
        name: 'Medical Records API',
        version: '1.0.0',
        description: 'Backend untuk Sistem Rekam Medis Berbasis Blockchain Hyperledger Fabric',
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// ===========================
// API ROUTES
// ===========================

// Authentication routes (public login, private register)
app.use('/api/auth', (req, res, next) => {
    if (req.path === '/login') {
        // Apply stricter rate limit untuk login
        loginLimiter(req, res, next);
    } else {
        next();
    }
});
app.use('/api/auth', authRoutes);

// Fabric routes (health check)
app.use('/api/fabric', fabricRoutes);

// User routes (super admin only)
app.use('/api/users', userRoutes);

// Pasien routes (protected)
app.use('/api/pasien', verifyToken, pasienRoutes);

// Dokter routes (protected)
app.use('/api/dokter', verifyToken, dokterRoutes);

// Rumah Sakit routes (protected)
app.use('/api/rumah-sakit', verifyToken, rumahSakitRoutes);

// Diagnosa routes (protected)
app.use('/api/diagnosa', verifyToken, diagnosaRoutes);

// ===========================
// 404 NOT FOUND HANDLER
// ===========================
app.use(notFoundHandler);

// ===========================
// ERROR HANDLING MIDDLEWARE
// ===========================
app.use(errorHandler);

// ===========================
// DATABASE CONNECTION TEST
// ===========================
db.testConnection();

// ===========================
// HYPERLEDGER FABRIC INITIALIZATION
// ===========================
// Initialize Fabric connection (optional, jika sudah di-setup)
fabricService.initializeFabric().catch((error) => {
    logger.warn('Hyperledger Fabric initialization skipped (non-critical)');
});

// ===========================
// SERVER STARTUP
// ===========================
const server = app.listen(PORT, () => {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║     MEDICAL RECORDS API - BLOCKCHAIN ENABLED         ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║  Server running on http://localhost:${PORT.toString().padEnd(30)}║`);
    console.log(`║  Environment: ${NODE_ENV.toUpperCase().padEnd(39)}║`);
    console.log(`║  Database: Connected${' '.repeat(31)}║`);
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log('║  Available Endpoints:                                ║');
    console.log('║  POST   /api/auth/register - Register user           ║');
    console.log('║  POST   /api/auth/login - Login                      ║');
    console.log('║  GET    /api/pasien - Get all patients               ║');
    console.log('║  POST   /api/pasien - Create patient                 ║');
    console.log('║  GET    /api/dokter - Get all doctors                ║');
    console.log('║  POST   /api/diagnosa - Create diagnosis             ║');
    console.log('║  GET    /api/health - Health check                   ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('\n');
    logger.info(`Server successfully started on port ${PORT}`);
});

// ===========================
// GRACEFUL SHUTDOWN
// ===========================
const gracefulShutdown = async (signal) => {
    console.log(`\n\n${signal} received. Starting graceful shutdown...`);
    logger.info(`Graceful shutdown initiated by ${signal}`);

    // Close HTTP server
    server.close(async () => {
        console.log('HTTP server closed');
        logger.info('HTTP server closed');

        // Close database connection
        try {
            // Connection pool akan ditutup otomatis
            console.log('Database connection pool closing...');
            logger.info('Database connections closed');
        } catch (error) {
            logger.error(`Error closing database: ${error.message}`);
        }

        // Close Fabric connection
        try {
            await fabricService.closeFabricConnection();
            console.log('Fabric connection closed');
        } catch (error) {
            logger.error(`Error closing Fabric connection: ${error.message}`);
        }

        console.log('Graceful shutdown completed');
        logger.info('Graceful shutdown completed');
        process.exit(0);
    });

    // Force shutdown setelah 10 detik
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        logger.error('Forceful shutdown due to timeout');
        process.exit(1);
    }, 10000);
};

// Graceful shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', { promise, reason });
    console.error('Unhandled Rejection:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    console.error('Uncaught Exception:', error);
    // Restart process pada uncaught exception
    process.exit(1);
});

module.exports = app;


// Endpoint GET Pasien (Untuk keperluan QR/Dashboard)
app.get('/api/pasien/:nik', (req, res) => {
    const nik = req.params.nik;
    const query = 'SELECT * FROM pasien WHERE nik = ?';
    db.query(query, [nik], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Pasien tidak ditemukan' });
        res.json(results[0]);
    });
});

// Legacy POST /api/diagnosa dihapus — gunakan diagnosaRoutes (blockchain invoke otomatis)
// Endpoint untuk Statistik Dashboard
app.get('/api/statistik', (req, res) => {
    // Pastikan nama tabel di bawah ini SAMA dengan yang ada di phpMyAdmin
    const query = `SELECT 
        (SELECT COUNT(*) FROM rumah_sakit) as total_rs,
        (SELECT COUNT(*) FROM pasien) as total_pasien`;
        
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error Statistik:", err);
            return res.status(500).json({error: err.message});
        }
        
        const data = results[0];
        data.total_node = 0; // Jika tabel node tidak ada, biarkan 0
        res.json(data);
    });
});

app.get('/api/daftar-rs', (req, res) => {
    // Pastikan nama kolom di SQL benar: nama_rs, alamat, telepon
    db.query('SELECT nama_rs, alamat, telepon FROM rumah_sakit', (err, results) => {
        if (err) {
            console.error("Error Database:", err);
            return res.status(500).json({ error: "Database error" });
        }
        // Pastikan hasil dikirim sebagai array
        res.json(results);
    });
});
// 1. Endpoint untuk REKAPAN (untuk dashboard yang ringkas)
app.get('/api/rekapan', (req, res) => {
    const query = `
        SELECT p.nama, d.nama_diagnosa, d.tanggal 
        FROM diagnosa d 
        JOIN pasien p ON d.nik_pasien = p.nik 
        ORDER BY d.tanggal DESC LIMIT 5`;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// PASTIKAN ENDPOINT INI ADA DI server.js
app.get('/api/data-diagnosa', (req, res) => {
    // Jalankan query ini langsung di phpMyAdmin untuk memastikan ada datanya!
    const query = 'SELECT * FROM diagnosa ORDER BY id_diagnosa DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error("Database Error:", err); // Lihat log di terminal!
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});
