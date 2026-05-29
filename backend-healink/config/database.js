/**
 * @file Database Configuration
 * @description Konfigurasi koneksi MySQL menggunakan mysql2 pool
 */

const mysql = require('mysql2/promise');
const logger = require('./logger');

// Membuat pool connection untuk MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 30000,
});

// Test koneksi database
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Berhasil terhubung ke MySQL Database.');
        connection.release();
        logger.info('Database connection established successfully');
    } catch (error) {
        console.error('❌ Gagal koneksi ke database:', error.message);
        logger.error(`Database connection failed: ${error.message}`);
        setTimeout(testConnection, 5000); // Retry setelah 5 detik
    }
};

module.exports = {
    pool,
    testConnection,
    
    /**
     * Helper function untuk menjalankan query dengan async/await
     * @param {string} sql - SQL query
     * @param {array} values - Parameter values
     * @returns {Promise} Query result
     */
    query: async (sql, values = []) => {
        try {
            const [results] = await pool.execute(sql, values);
            return results;
        } catch (error) {
            logger.error(`Database query error: ${error.message}`, { sql, values });
            throw error;
        }
    },

    /**
     * Helper function untuk menjalankan query dengan koneksi tunggal
     * Berguna untuk transaction
     * @returns {Promise} Database connection
     */
    getConnection: async () => {
        return await pool.getConnection();
    },
};
