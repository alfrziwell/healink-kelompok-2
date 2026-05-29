/**
 * @file Constants Configuration
 * @description Konfigurasi konstanta global untuk aplikasi
 */

module.exports = {
    // ===========================
    // USER ROLES
    // ===========================
    ROLES: {
        SUPER_ADMIN: 'super_admin',
        ADMIN: 'admin',
        DOKTER: 'dokter',
        STAFF: 'staff',
        PASIEN: 'pasien',
    },

    // ===========================
    // API RESPONSE MESSAGES
    // ===========================
    MESSAGES: {
        // Auth Messages
        LOGIN_SUCCESS: 'Login berhasil!',
        LOGOUT_SUCCESS: 'Logout berhasil!',
        REGISTER_SUCCESS: 'Registrasi berhasil!',
        INVALID_CREDENTIALS: 'Username atau password salah.',
        TOKEN_INVALID: 'Token tidak valid atau sudah kedaluwarsa.',
        TOKEN_REQUIRED: 'Token tidak ditemukan.',
        UNAUTHORIZED: 'Akses ditolak!',
        FORBIDDEN: 'Anda tidak memiliki izin untuk mengakses resource ini.',

        // CRUD Messages
        CREATE_SUCCESS: 'Data berhasil ditambahkan!',
        UPDATE_SUCCESS: 'Data berhasil diperbarui!',
        DELETE_SUCCESS: 'Data berhasil dihapus!',
        GET_SUCCESS: 'Data berhasil diambil!',
        NOT_FOUND: 'Data tidak ditemukan.',

        // Validation Messages
        VALIDATION_ERROR: 'Validasi data gagal.',
        REQUIRED_FIELD: 'Kolom wajib diisi.',
        INVALID_FORMAT: 'Format data tidak valid.',
        DUPLICATE_ENTRY: 'Data sudah ada di database.',

        // Server Messages
        INTERNAL_ERROR: 'Terjadi kesalahan server internal.',
        SERVICE_UNAVAILABLE: 'Layanan sedang tidak tersedia.',
    },

    // ===========================
    // HTTP STATUS CODES
    // ===========================
    STATUS_CODES: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        INTERNAL_ERROR: 500,
    },

    // ===========================
    // PAGINATION
    // ===========================
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100,
    },

    // ===========================
    // GENDER
    // ===========================
    GENDER: {
        MALE: 'L',
        FEMALE: 'P',
    },

    // ===========================
    // HYPERLEDGER FABRIC
    // ===========================
    FABRIC: {
        INVOKE_SUCCESS: 'Transaksi berhasil dicatat ke blockchain.',
        QUERY_SUCCESS: 'Data dari blockchain berhasil diambil.',
        TRANSACTION_ERROR: 'Gagal merekam transaksi ke blockchain.',
    },
};
