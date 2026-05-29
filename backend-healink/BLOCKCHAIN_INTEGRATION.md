# 🔗 Blockchain Integration Documentation

## Overview
Sistem mengintegrasikan **MySQL Database** + **Hyperledger Fabric Blockchain** untuk:
1. **Immutability** - Rekam medis tidak bisa diubah
2. **Traceability** - Riwayat lengkap setiap transaksi
3. **Privacy** - Private data collection untuk data sensitif

---

## 📊 Data Flow

### Patient Registration
```
Frontend POST /api/pasien
    ↓
pasienController.createPasien()
    ↓
(Blockchain) fabricService.invokeChaincode('CreatePatientRecord')
    ↓ (tx_id returned)
(Database) INSERT pasien + tx_id_blockchain
    ↓
Response: { nik, nama, tx_id_blockchain }
```

### Diagnosis Creation
```
Frontend POST /api/diagnosa
    ↓
diagnosaController.createDiagnosa()
    ↓
(Validate) Check pasien, dokter, rumah sakit
    ↓
(Blockchain) fabricService.invokeChaincode('AddDiagnosis')
    ↓ (tx_id returned)
(Database) INSERT diagnosa + tx_id_blockchain
    ↓
Response: { id_diagnosa, tx_id_blockchain }
```

### Medical History Query
```
Frontend GET /api/diagnosa/patient/:nik/medical-history
    ↓
diagnosaController.getPatientMedicalHistory()
    ↓
(Database) Query: SELECT * FROM diagnosa WHERE nik_pasien = ?
    ↓ (dengan JOIN ke dokter, rumah sakit)
(Blockchain) fabricService.queryChaincode('GetPatientMedicalHistory', nik)
    ↓ (riwayat lengkap dengan tx_id)
Response: { pasien, databaseRecords, blockchainRecords, totalRecords }
```

### Hospital Analytics
```
Frontend GET /api/diagnosa/hospital/:id_rs/summary
    ↓
diagnosaController.getHospitalDiagnosisSummary()
    ↓
(Database) Complex queries:
  - COUNT(*) total diagnosa
  - GROUP BY diagnosa (TOP 5)
  - GROUP BY dokter (TOP 5)
  - GROUP BY month (trend 12 bulan)
    ↓
Response: { totalDiagnosa, topDiagnosa, topDokter, monthlyTrend }
```

---

## 🔧 Key Components

### 1. Fabric Service (`services/fabricService.js`)
- `initializeFabric()` - Initialize koneksi ke blockchain
- `invokeChaincode()` - Write operations (CreatePatientRecord, AddDiagnosis)
- `queryChaincode()` - Read operations (GetPatientMedicalHistory)
- `getFabricStatus()` - Check koneksi status

### 2. Chaincode (`chaincode/lib/rekammedis.js`)
- `CreatePatientRecord()` - Create pasien di blockchain
- `AddDiagnosis()` - Add diagnosis dengan private data collection
- `GetPatientMedicalHistory()` - Query history dengan traceability

### 3. Controllers
**pasienController.js:**
- `createPasien()` - Invoke CreatePatientRecord + INSERT DB

**diagnosaController.js:**
- `createDiagnosa()` - Invoke AddDiagnosis + INSERT DB
- `getPatientMedicalHistory()` - Combine DB + blockchain query
- `getHospitalDiagnosisSummary()` - Complex aggregation
- `queryBlockchainTransaction()` - Query by tx_id

---

## 📡 API Endpoints

### Create Patient (dengan blockchain)
```
POST /api/pasien
Headers: { Authorization: Bearer TOKEN }
Body: {
  nik: string,
  nama: string,
  alamat: string,
  tgl_lahir: date,
  jenis_kelamin: char
}
Response: { nik, nama, tx_id_blockchain }
```

### Create Diagnosis (dengan blockchain)
```
POST /api/diagnosa
Headers: { Authorization: Bearer TOKEN }
Body: {
  tanggal: date,
  id_rs: number,
  id_dokter: number,
  nik_pasien: string,
  nama_diagnosa: string,
  kriteria_ciri: string,
  obat: string
}
Response: { id_diagnosa, tx_id_blockchain }
```

### Query Medical History
```
GET /api/diagnosa/patient/:nik/medical-history
Headers: { Authorization: Bearer TOKEN }
Response: {
  pasien: { nik, nama, alamat, ... },
  databaseRecords: [ { id_diagnosa, tanggal, diagnosa, dokter, ... } ],
  blockchainRecords: { history: [ { txId, timestamp, ... } ] },
  totalRecords: number
}
```

### Query Hospital Summary
```
GET /api/diagnosa/hospital/:id_rs/summary
Headers: { Authorization: Bearer TOKEN }
Response: {
  rumahSakit: { id_rs, nama_rs },
  totalDiagnosa: number,
  topDiagnosa: [ { nama_diagnosa, count } ],
  topDokter: [ { id_dokter, nama, spesialisasi, count } ],
  monthlyTrend: [ { bulan, count } ]
}
```

### Query Blockchain Transaction
```
GET /api/diagnosa/blockchain/:txId
Headers: { Authorization: Bearer TOKEN }
Response: { txId, diagnosa, pasien, timestamp, ... }
```

---

## 🔐 Private Data Collection

Diagnosis data disimpan di 2 tempat:
1. **World State (Public)** - Semua field KECUALI detail medis
2. **Private Collection** - Detail medis (diagnosa, gejala, obat) → Encrypted

Hanya authorized parties yang bisa akses private data:
- Dokter yang menangani
- Pasien sendiri
- Admin rumah sakit

---

## ⚠️ Error Handling

### Blockchain Error
Jika blockchain invoke/query gagal:
- **Insert diagnosa tetap dilanjutkan ke database**
- `tx_id_blockchain` akan bernilai NULL
- User dapat query data dari database meskipun blockchain error
- Log error untuk monitoring

### Database Error
Jika database gagal:
- Return error response
- Blockchain transaksi sudah ter-commit (tidak bisa di-rollback)
- User perlu retry insert

### Solution
- Gunakan transaction pattern (2-phase commit) untuk production
- Implementasi retry logic dengan exponential backoff
- Monitor blockchain dan database consistency

---

## 🧪 Testing

Lihat: `TEST_BLOCKCHAIN_API.md`

Quick test:
```bash
# 1. Create pasien
curl -X POST http://localhost:5000/api/pasien -H "Authorization: Bearer TOKEN" ...

# 2. Get medical history
curl -X GET http://localhost:5000/api/diagnosa/patient/NIK/medical-history -H "Authorization: Bearer TOKEN"

# 3. Get hospital summary
curl -X GET http://localhost:5000/api/diagnosa/hospital/1/summary -H "Authorization: Bearer TOKEN"
```

---

## 📈 Performance Considerations

### Query Optimization
- Add INDEX pada: `nik`, `id_rs`, `tanggal`, `id_dokter`
- Use LIMIT untuk pagination
- Blockchain query bisa lambat → cache hasil

### Blockchain Query Limitations
- Tidak support complex JOIN di blockchain
- Gunakan database untuk analytics
- Blockchain untuk audit trail / immutability

### Caching Strategy
```javascript
// Cache medical history untuk 1 jam
const cacheKey = `medicalHistory:${nik}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const result = await queryMedicalHistory(nik);
await redis.setex(cacheKey, 3600, JSON.stringify(result));
return result;
```

---

## 🚀 Deployment Checklist

- [ ] Fabric wallet configured
- [ ] Network profile valid
- [ ] Channel name correct
- [ ] Chaincode name correct
- [ ] Database schema includes `tx_id_blockchain` column
- [ ] Endorsement policy configured
- [ ] Private data collection configured
- [ ] Error monitoring set up
- [ ] Load testing done
- [ ] Backup strategy ready

---

**Last Updated:** 2026-05-29
**Version:** 1.0
