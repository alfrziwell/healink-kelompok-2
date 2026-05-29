/**
 * @file Database Setup
 * @description Script untuk membuat tabel-tabel di MySQL database
 * 
 * CARA MENGGUNAKAN:
 * 1. Pastikan MySQL sudah berjalan
 * 2. Buat database baru: CREATE DATABASE rekam_medis_db;
 * 3. Update .env dengan DB credentials
 * 4. Jalankan: node config/setupDatabase.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const logger = require('./logger');

const setupDatabase = async () => {
    let connection;
    try {
        // Koneksi ke MySQL tanpa database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });

        console.log('✅ Koneksi ke MySQL berhasil');
        logger.info('Connected to MySQL for database setup');

        // Buat database jika belum ada
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log(`✅ Database ${process.env.DB_NAME} created/verified`);
        logger.info(`Database ${process.env.DB_NAME} created or verified`);

        // Gunakan database yang baru dibuat
        await connection.query(`USE ${process.env.DB_NAME}`);

        // ===========================
        // CREATE TABLE: rumah_sakit
        // ===========================
        await connection.query(`
            CREATE TABLE IF NOT EXISTS rumah_sakit (
                id_rs INT AUTO_INCREMENT PRIMARY KEY,
                nama_rs VARCHAR(100) NOT NULL UNIQUE,
                alamat VARCHAR(255) NOT NULL,
                telepon VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_nama_rs (nama_rs)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Table rumah_sakit created');
        logger.info('Table rumah_sakit created');

        // ===========================
        // CREATE TABLE: dokter
        // ===========================
        await connection.query(`
            CREATE TABLE IF NOT EXISTS dokter (
                id_dokter INT AUTO_INCREMENT PRIMARY KEY,
                nama VARCHAR(100) NOT NULL,
                alamat VARCHAR(255) NOT NULL,
                nomor_telp VARCHAR(20) NOT NULL,
                id_rs INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (id_rs) REFERENCES rumah_sakit(id_rs) ON DELETE CASCADE,
                INDEX idx_nama (nama),
                INDEX idx_id_rs (id_rs)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Table dokter created');
        logger.info('Table dokter created');

        // ===========================
        // CREATE TABLE: pasien
        // ===========================
        await connection.query(`
            CREATE TABLE IF NOT EXISTS pasien (
                nik VARCHAR(16) PRIMARY KEY,
                nama VARCHAR(100) NOT NULL,
                alamat VARCHAR(255) NOT NULL,
                tgl_lahir DATE NOT NULL,
                jenis_kelamin CHAR(1) CHECK (jenis_kelamin IN ('L', 'P')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_nama (nama),
                INDEX idx_nik (nik)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Table pasien created');
        logger.info('Table pasien created');

        // ===========================
        // CREATE TABLE: diagnosa
        // ===========================
        await connection.query(`
            CREATE TABLE IF NOT EXISTS diagnosa (
                id_diagnosa INT AUTO_INCREMENT PRIMARY KEY,
                tanggal DATETIME NOT NULL,
                id_rs INT NOT NULL,
                id_dokter INT NOT NULL,
                nik_pasien VARCHAR(16) NOT NULL,
                nama_diagnosa VARCHAR(255) NOT NULL,
                kriteria_ciri TEXT NOT NULL,
                obat TEXT NOT NULL,
                tx_id_blockchain VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (id_rs) REFERENCES rumah_sakit(id_rs) ON DELETE CASCADE,
                FOREIGN KEY (id_dokter) REFERENCES dokter(id_dokter) ON DELETE CASCADE,
                FOREIGN KEY (nik_pasien) REFERENCES pasien(nik) ON DELETE CASCADE,
                INDEX idx_tanggal (tanggal),
                INDEX idx_id_rs (id_rs),
                INDEX idx_nik_pasien (nik_pasien),
                INDEX idx_tx_id (tx_id_blockchain)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Table diagnosa created');
        logger.info('Table diagnosa created');

        // ===========================
        // CREATE TABLE: user
        // ===========================
        await connection.query(`
            CREATE TABLE IF NOT EXISTS user (
                id_user INT AUTO_INCREMENT PRIMARY KEY,
                id_rs INT,
                role ENUM('super_admin', 'admin', 'dokter', 'staff', 'pasien') NOT NULL DEFAULT 'staff',
                username VARCHAR(50) NOT NULL UNIQUE,
                pw VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (id_rs) REFERENCES rumah_sakit(id_rs) ON DELETE SET NULL,
                INDEX idx_username (username),
                INDEX idx_role (role)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Table user created');
        logger.info('Table user created');

        // ===========================
        // INSERT SAMPLE DATA
        // ===========================
        // Check apakah sudah ada data
        const [rumahSakitCheck] = await connection.query('SELECT COUNT(*) as count FROM rumah_sakit');
        
        if (rumahSakitCheck[0].count === 0) {
            // Insert sample rumah sakit
            await connection.query(`
                INSERT INTO rumah_sakit (nama_rs, alamat, telepon) VALUES
                ('RS Pusat Medika', 'Jl. Sudirman No. 123, Jakarta', '021-5555-1234'),
                ('RS Kesehatan Bersama', 'Jl. Gatot Subroto No. 456, Bandung', '022-6666-5678')
            `);
            console.log('✅ Sample rumah_sakit data inserted');
            logger.info('Sample rumah_sakit data inserted');

            // Insert sample dokter
            await connection.query(`
                INSERT INTO dokter (nama, alamat, nomor_telp, id_rs) VALUES
                ('Dr. Budi Santoso', 'Jl. Ahmad Yani No. 10, Jakarta', '0812-1234-5678', 1),
                ('Dr. Siti Nurhaliza', 'Jl. Diponegoro No. 20, Bandung', '0812-9876-5432', 2)
            `);
            console.log('✅ Sample dokter data inserted');
            logger.info('Sample dokter data inserted');

            // Insert sample pasien
            await connection.query(`
                INSERT INTO pasien (nik, nama, alamat, tgl_lahir, jenis_kelamin) VALUES
                ('1234567890123456', 'Ani Wijaya', 'Jl. Merdeka No. 5, Jakarta', '1990-05-15', 'P'),
                ('9876543210987654', 'Rinto Harahap', 'Jl. Gajah Mada No. 12, Bandung', '1985-08-22', 'L')
            `);
            console.log('✅ Sample pasien data inserted');
            logger.info('Sample pasien data inserted');

            // Insert sample super admin user
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await connection.query(`
                INSERT INTO user (id_rs, role, username, pw) VALUES
                (1, 'super_admin', 'superadmin', ?)
            `, [hashedPassword]);
            console.log('✅ Sample user data inserted');
            logger.info('Sample user data inserted (username: superadmin, password: admin123)');
        }

        console.log('\n✅ Database setup completed successfully!');
        logger.info('Database setup completed successfully');
        console.log('📝 Sample credentials: username=superadmin, password=admin123\n');

    } catch (error) {
        console.error('❌ Error during database setup:', error.message);
        logger.error(`Database setup error: ${error.message}`);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
};

// Run setup
if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase };
