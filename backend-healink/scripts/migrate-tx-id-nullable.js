/**
 * Jalankan sekali: node scripts/migrate-tx-id-nullable.js
 * Memperbolehkan tx_id_blockchain NULL jika blockchain gagal (non-blocking).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'db_jp8',
    });

    try {
        await connection.query(
            'ALTER TABLE diagnosa MODIFY tx_id_blockchain VARCHAR(255) NULL'
        );
        console.log('✅ diagnosa.tx_id_blockchain → NULL allowed');

        try {
            await connection.query(
                'ALTER TABLE pasien MODIFY tx_id_blockchain VARCHAR(255) NULL'
            );
            console.log('✅ pasien.tx_id_blockchain → NULL allowed');
        } catch (e) {
            if (!e.message.includes('Unknown column')) {
                throw e;
            }
            console.log('ℹ️  Kolom pasien.tx_id_blockchain tidak ada, dilewati');
        }
    } finally {
        await connection.end();
    }
}

migrate().catch((err) => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
});
