/**
 * @file Super Admin Seeder
 * @description Seeder untuk membuat user super admin default
 */

require('dotenv').config();

const bcrypt = require('bcrypt');
const db = require('../config/database');
const logger = require('../config/logger');

const DEFAULT_SUPERADMIN_USERNAME = process.env.SUPERADMIN_USERNAME || 'superadmin';
const DEFAULT_SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'admin123';

const ensureUserRoleSchema = async () => {
    const columns = await db.query(
        "SHOW COLUMNS FROM user LIKE 'role'"
    );

    const roleType = columns[0]?.Type || '';
    const expectedType = "enum('super_admin','admin','dokter','staff','pasien')";

    if (roleType.replace(/\s+/g, '').toLowerCase() !== expectedType) {
        await db.query(
            "ALTER TABLE user MODIFY role ENUM('super_admin', 'admin', 'dokter', 'staff', 'pasien') NOT NULL DEFAULT 'staff'"
        );
        console.log('✅ Schema kolom role disesuaikan ke format canonical');
        logger.info('User role schema normalized to canonical enum values');
    }
};

const getDefaultRumahSakitId = async () => {
    const rumahSakit = await db.query(
        'SELECT id_rs FROM rumah_sakit ORDER BY id_rs ASC LIMIT 1'
    );

    if (rumahSakit.length > 0) {
        return rumahSakit[0].id_rs;
    }

    const result = await db.query(
        'INSERT INTO rumah_sakit (nama_rs, alamat, telepon) VALUES (?, ?, ?)',
        ['RS Default', 'Alamat default', '0000000000']
    );

    return result.insertId;
};

const seedSuperAdmin = async () => {
    try {
        await ensureUserRoleSchema();

        const defaultRumahSakitId = await getDefaultRumahSakitId();

        const existingUsers = await db.query(
            'SELECT id_user, username, role FROM user WHERE username = ? LIMIT 1',
            [DEFAULT_SUPERADMIN_USERNAME]
        );

        if (existingUsers.length > 0) {
            const existingUser = existingUsers[0];

            if (existingUser.role !== 'super_admin') {
                await db.query(
                    'UPDATE user SET role = ? WHERE id_user = ?',
                    ['super_admin', existingUser.id_user]
                );
                console.log(`✅ User ${DEFAULT_SUPERADMIN_USERNAME} role diperbarui menjadi super_admin`);
                logger.info(`Super admin role updated for user ${DEFAULT_SUPERADMIN_USERNAME}`);
            } else {
                console.log(`ℹ️ User ${DEFAULT_SUPERADMIN_USERNAME} sudah ada sebagai super_admin`);
                logger.info(`Super admin user already exists: ${DEFAULT_SUPERADMIN_USERNAME}`);
            }

            return;
        }

        const hashedPassword = await bcrypt.hash(
            DEFAULT_SUPERADMIN_PASSWORD,
            parseInt(process.env.BCRYPT_ROUNDS, 10) || 10
        );

        const result = await db.query(
            'INSERT INTO user (id_rs, role, username, pw) VALUES (?, ?, ?, ?)',
            [defaultRumahSakitId, 'super_admin', DEFAULT_SUPERADMIN_USERNAME, hashedPassword]
        );

        console.log('✅ Super admin berhasil dibuat');
        console.log(`📝 Username: ${DEFAULT_SUPERADMIN_USERNAME}`);
        console.log(`📝 Password: ${DEFAULT_SUPERADMIN_PASSWORD}`);
        console.log(`🆔 ID User: ${result.insertId}`);
        logger.info(`Super admin seeded successfully: ${DEFAULT_SUPERADMIN_USERNAME}`);
    } catch (error) {
        console.error('❌ Gagal membuat super admin:', error.message);
        logger.error(`Super admin seeder error: ${error.message}`);
        process.exitCode = 1;
    } finally {
        try {
            if (db.pool && typeof db.pool.end === 'function') {
                await db.pool.end();
            }
        } catch (closeError) {
            logger.warn(`Failed to close database pool: ${closeError.message}`);
        }
    }
};

if (require.main === module) {
    seedSuperAdmin();
}

module.exports = { seedSuperAdmin };