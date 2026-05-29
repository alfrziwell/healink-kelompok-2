# 📋 Medical Records Backend API Documentation

**Backend Express.js untuk Sistem Rekam Medis Berbasis Blockchain Hyperledger Fabric**

---

## 📁 Project Structure

```
backend/
├── config/                    # Konfigurasi aplikasi
│   ├── database.js           # Database connection pool
│   ├── logger.js             # Winston logging configuration
│   ├── constants.js          # Global constants
│   └── setupDatabase.js      # Database initialization script
│
├── middleware/               # Express middleware
│   ├── auth.js              # JWT authentication & refresh token
│   ├── authorization.js     # Role-based access control
│   ├── errorHandler.js      # Global error handling
│   └── security.js          # Security headers, rate limiting, sanitization
│
├── controllers/              # Business logic handlers
│   ├── authController.js     # Login, register, profile
│   ├── pasienController.js   # Patient CRUD operations
│   ├── dokterController.js   # Doctor CRUD operations
│   ├── rumahSakitController.js  # Hospital CRUD operations
│   └── diagnosaController.js # Diagnosis CRUD + blockchain integration
│
├── routes/                   # API route definitions
│   ├── authRoutes.js        # Authentication routes
│   ├── pasienRoutes.js      # Patient routes
│   ├── dokterRoutes.js      # Doctor routes
│   ├── rumahSakitRoutes.js  # Hospital routes
│   └── diagnosaRoutes.js    # Diagnosis routes
│
├── services/                 # External service integrations
│   └── fabricService.js      # Hyperledger Fabric blockchain integration
│
├── utils/                    # Utility functions
│   ├── response.js          # Standardized API response format
│   └── validation.js        # Input validation rules
│
├── logs/                     # Application logs
│   ├── app.log              # General application logs
│   └── error.log            # Error logs
│
├── server.js                 # Main application entry point
├── package.json              # Dependencies management
├── .env                      # Environment variables
└── README.md                 # Documentation (ini)
```

---

## 🚀 Quick Start

### 1. **Installation**

```bash
# Install dependencies
npm install

# Atau gunakan yarn
yarn install
```

### 2. **Environment Setup**

Konfigurasi file `.env`:

```env
# APPLICATION
PORT=3000
NODE_ENV=development
API_URL=http://localhost:3000

# DATABASE
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=rekam_medis_db

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=2h

# SECURITY
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. **Database Setup**

```bash
# Buat database dan tabel
node config/setupDatabase.js
```

### 4. **Run Server**

**Development Mode** (dengan nodemon):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

---

## 🔐 Authentication & Authorization

### **User Roles:**
- `super_admin` - Full access, bisa register user, manage all data
- `admin` - Manage hospital data, users, doctors, patients
- `dokter` - Create and view diagnoses
- `staff` - View data only
- `pasien` - View own medical records

### **Authentication Flow:**

1. **Register (Super Admin only)**
```http
POST /api/auth/register
Content-Type: application/json

{
  "id_rs": 1,
  "role": "admin",
  "username": "admin1",
  "pw": "password123"
}
```

2. **Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "superadmin",
  "pw": "admin123"
}

Response:
{
  "success": true,
  "message": "Login berhasil!",
  "data": {
    "id_user": 1,
    "username": "superadmin",
    "role": "super_admin",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "2h"
  }
}
```

3. **Use Token in Headers**
```http
GET /api/pasien
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 📚 API Endpoints

### **Health Check**
```http
GET /api/health
```

### **Authentication**
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Super Admin | Register user baru |
| POST | `/api/auth/login` | Public | Login and get token |
| GET | `/api/auth/profile` | Private | Get current user profile |
| POST | `/api/auth/logout` | Private | Logout |

### **Pasien (Patients)**
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/pasien` | Private | Get all patients (with pagination) |
| POST | `/api/pasien` | Admin | Create new patient |
| GET | `/api/pasien/:nik` | Private | Get patient by NIK |
| PUT | `/api/pasien/:nik` | Admin | Update patient |
| DELETE | `/api/pasien/:nik` | Admin | Delete patient |

### **Dokter (Doctors)**
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dokter` | Private | Get all doctors |
| POST | `/api/dokter` | Admin | Create new doctor |
| GET | `/api/dokter/:id` | Private | Get doctor by ID |
| PUT | `/api/dokter/:id` | Admin | Update doctor |
| DELETE | `/api/dokter/:id` | Admin | Delete doctor |

### **Rumah Sakit (Hospitals)**
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/rumah-sakit` | Private | Get all hospitals |
| POST | `/api/rumah-sakit` | Super Admin | Create new hospital |
| GET | `/api/rumah-sakit/:id` | Private | Get hospital by ID |
| PUT | `/api/rumah-sakit/:id` | Super Admin | Update hospital |
| DELETE | `/api/rumah-sakit/:id` | Super Admin | Delete hospital |

### **Diagnosa (Diagnosis)**
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/diagnosa` | Private | Get all diagnoses (with JOIN) |
| POST | `/api/diagnosa` | Medical Staff | Create diagnosis + blockchain |
| GET | `/api/diagnosa/:id` | Private | Get diagnosis by ID |
| PUT | `/api/diagnosa/:id` | Medical Staff | Update diagnosis |
| DELETE | `/api/diagnosa/:id` | Medical Staff | Delete diagnosis |
| GET | `/api/diagnosa/blockchain/:txId` | Private | Query from blockchain |

---

## 💡 Request/Response Examples

### **Create Pasien**
```http
POST /api/pasien
Authorization: Bearer {token}
Content-Type: application/json

{
  "nik": "1234567890123456",
  "nama": "John Doe",
  "alamat": "Jl. Merdeka No. 5",
  "tgl_lahir": "1990-05-15",
  "jenis_kelamin": "L"
}

Response:
{
  "success": true,
  "message": "Data berhasil ditambahkan!",
  "data": {
    "nik": "1234567890123456",
    "nama": "John Doe",
    "alamat": "Jl. Merdeka No. 5",
    "tgl_lahir": "1990-05-15",
    "jenis_kelamin": "L"
  }
}
```

### **Get Pasien with Pagination**
```http
GET /api/pasien?page=1&limit=10&search=John
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Data berhasil diambil!",
  "data": [
    {
      "nik": "1234567890123456",
      "nama": "John Doe",
      "alamat": "Jl. Merdeka No. 5",
      "tgl_lahir": "1990-05-15",
      "jenis_kelamin": "L"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### **Create Diagnosa (with Blockchain)**
```http
POST /api/diagnosa
Authorization: Bearer {token}
Content-Type: application/json

{
  "tanggal": "2024-05-29T10:00:00",
  "id_rs": 1,
  "id_dokter": 1,
  "nik_pasien": "1234567890123456",
  "nama_diagnosa": "Diabetes Mellitus",
  "kriteria_ciri": "Kadar gula darah tinggi, sering haus",
  "obat": "Metformin 500mg"
}

Response:
{
  "success": true,
  "message": "Data berhasil ditambahkan!",
  "data": {
    "id_diagnosa": 1,
    "tanggal": "2024-05-29T10:00:00",
    "id_rs": 1,
    "id_dokter": 1,
    "nik_pasien": "1234567890123456",
    "nama_diagnosa": "Diabetes Mellitus",
    "kriteria_ciri": "Kadar gula darah tinggi, sering haus",
    "obat": "Metformin 500mg",
    "tx_id_blockchain": "abc123def456..."
  }
}
```

### **Get Diagnosa with JOIN**
```http
GET /api/diagnosa?page=1&limit=10
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Data berhasil diambil!",
  "data": [
    {
      "id_diagnosa": 1,
      "tanggal": "2024-05-29T10:00:00",
      "id_rs": 1,
      "nama_rs": "RS Pusat Medika",
      "id_dokter": 1,
      "nama_dokter": "Dr. Budi Santoso",
      "nik_pasien": "1234567890123456",
      "nama_pasien": "John Doe",
      "nama_diagnosa": "Diabetes Mellitus",
      "kriteria_ciri": "Kadar gula darah tinggi",
      "obat": "Metformin 500mg",
      "tx_id_blockchain": "abc123def456..."
    }
  ],
  "pagination": { ... }
}
```

---

## 🔒 Security Features

### **Implemented:**
✅ **Helmet.js** - HTTP headers security  
✅ **Rate Limiting** - Protect from brute force attacks  
✅ **Input Sanitization** - Prevent NoSQL injection  
✅ **CORS Configuration** - Control cross-origin requests  
✅ **JWT Authentication** - Secure token-based auth  
✅ **Password Hashing** - bcrypt for password security  
✅ **Role-Based Access Control** - Authorization middleware  
✅ **Error Handling** - Global error handler  
✅ **Logging** - Winston logger untuk tracking  
✅ **Input Validation** - Express-validator for data validation  

---

## 📊 Database Schema

### **rumah_sakit**
```sql
CREATE TABLE rumah_sakit (
  id_rs INT PRIMARY KEY AUTO_INCREMENT,
  nama_rs VARCHAR(100) UNIQUE NOT NULL,
  alamat VARCHAR(255) NOT NULL,
  telepon VARCHAR(20) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### **dokter**
```sql
CREATE TABLE dokter (
  id_dokter INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(100) NOT NULL,
  alamat VARCHAR(255) NOT NULL,
  nomor_telp VARCHAR(20) NOT NULL,
  id_rs INT (FK) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### **pasien**
```sql
CREATE TABLE pasien (
  nik VARCHAR(16) PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  alamat VARCHAR(255) NOT NULL,
  tgl_lahir DATE NOT NULL,
  jenis_kelamin CHAR(1) CHECK (jenis_kelamin IN ('L', 'P')),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### **diagnosa**
```sql
CREATE TABLE diagnosa (
  id_diagnosa INT PRIMARY KEY AUTO_INCREMENT,
  tanggal DATETIME NOT NULL,
  id_rs INT (FK) NOT NULL,
  id_dokter INT (FK) NOT NULL,
  nik_pasien VARCHAR(16) (FK) NOT NULL,
  nama_diagnosa VARCHAR(255) NOT NULL,
  kriteria_ciri TEXT NOT NULL,
  obat TEXT NOT NULL,
  tx_id_blockchain VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### **user**
```sql
CREATE TABLE user (
  id_user INT PRIMARY KEY AUTO_INCREMENT,
  id_rs INT (FK),
  role ENUM('super_admin', 'admin', 'dokter', 'staff', 'pasien'),
  username VARCHAR(50) UNIQUE NOT NULL,
  pw VARCHAR(255) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🔗 Hyperledger Fabric Integration

### **Chaincode Invocation (for Diagnosa)**
Saat membuat diagnosa, sistem akan otomatis:
1. Invoke chaincode ke Hyperledger Fabric
2. Menyimpan hasil transaksi ke blockchain
3. Menyimpan `tx_id_blockchain` ke MySQL untuk referensi

### **Chaincode Query**
Untuk query data dari blockchain:
```http
GET /api/diagnosa/blockchain/{txId}
Authorization: Bearer {token}
```

### **Prerequisites Fabric:**
- Hyperledger Fabric network sudah ter-setup
- Network profile file ada di `./fabric/network_profile.json`
- Wallet dengan enrolled user ada di `./fabric/wallet`
- Chaincode sudah ter-deploy di channel `mychannel` dengan nama chaincode `basic`
- Identity yang digunakan: `appUser` (sesuaikan `FABRIC_USERNAME` di `.env` jika berubah)

### **Import identity ke wallet**
Jika Anda sudah memiliki sertifikat dan private key untuk `appUser`, jalankan langsung dengan Node:
```bash
cd backend
node scripts/importFabricIdentity.js --fabric-cert=/path/to/cert.pem --fabric-key=/path/to/key.pem --fabric-msp=Org1MSP --fabric-label=appUser
```
atau dengan argumen terpisah:
```bash
node scripts/importFabricIdentity.js --fabric-cert /path/to/cert.pem --fabric-key /path/to/key.pem --fabric-msp Org1MSP --fabric-label appUser
```

Jika Anda ingin tetap menggunakan npm pada PowerShell, gunakan environment variable helper:
```powershell
$env:FABRIC_IMPORT_CERT = "./path/to/cert.pem"
$env:FABRIC_IMPORT_KEY = "./path/to/key.pem"
$env:FABRIC_IMPORT_MSP = "Org1MSP"
$env:FABRIC_IMPORT_LABEL = "appUser"
npm run fabric:import-identity-env
```

> Jika Anda menjalankan Fabric di WSL, gunakan path WSL yang dapat diakses dari Windows atau salin file `cert.pem` dan `key.pem` ke mesin Windows terlebih dahulu.

---

## 📝 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| NODE_ENV | development | Environment mode |
| DB_HOST | localhost | MySQL host |
| DB_USER | root | MySQL user |
| DB_PASSWORD | (empty) | MySQL password |
| DB_NAME | rekam_medis_db | Database name |
| JWT_SECRET | (required) | JWT signing key |
| JWT_EXPIRE | 2h | Token expiration time |
| BCRYPT_ROUNDS | 10 | Password hash rounds |
| RATE_LIMIT_WINDOW_MS | 900000 | Rate limit window (15 min) |
| RATE_LIMIT_MAX_REQUESTS | 100 | Max requests per window |

---

## 🐛 Logging

Logs disimpan di folder `./logs/`:
- **app.log** - General application logs
- **error.log** - Error logs only
- **access.log** - HTTP request logs

---

## ⚙️ Middleware Architecture

```
Request
  ↓
[Security Headers - Helmet]
  ↓
[Body Parser - JSON/URL]
  ↓
[CORS Configuration]
  ↓
[Input Sanitization]
  ↓
[Rate Limiting]
  ↓
[JWT Verification] (jika route protected)
  ↓
[Authorization Check] (jika ada role restriction)
  ↓
[Input Validation]
  ↓
[Controller/Handler]
  ↓
[Response Handler]
  ↓
[Error Middleware] (jika ada error)
  ↓
Response
```

---

## 🚀 Deployment Checklist

- [ ] Update `.env` dengan production values
- [ ] Change `JWT_SECRET` ke random string yang kuat
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS (TLS/SSL certificates)
- [ ] Setup database backups
- [ ] Configure Hyperledger Fabric untuk production
- [ ] Setup monitoring dan alerting
- [ ] Configure CI/CD pipeline
- [ ] Load testing sebelum go-live
- [ ] Setup log rotation untuk logs

---

## 📞 Support & Troubleshooting

### **Database Connection Error**
```bash
# Check MySQL service
mysql -u root -p

# Update .env dengan correct credentials
# Jalankan setup database lagi
node config/setupDatabase.js
```

### **Port Already in Use**
```bash
# Change PORT di .env
# Atau kill process yang menggunakan port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### **Token Expired**
```bash
# Login lagi untuk get token baru
# Atau gunakan refresh token mechanism
```

---

## 📄 License

ISC

---

**Last Updated:** May 29, 2024  
**Version:** 1.0.0
