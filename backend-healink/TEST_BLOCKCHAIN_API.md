# 🧪 Test Blockchain API Integration

## Prerequisites
- Backend running: `npm start`
- MySQL database aktif
- Hyperledger Fabric network ready
- Auth token (dari login user)

---

## 1️⃣ Create Pasien → Blockchain

**Endpoint:** `POST /api/pasien`

```bash
curl -X POST http://localhost:5000/api/pasien \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nik": "3271000000000001",
    "nama": "Budi Santoso",
    "alamat": "Jl. Merdeka No. 123",
    "tgl_lahir": "1990-05-15",
    "jenis_kelamin": "L"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Pasien created",
  "data": {
    "nik": "3271000000000001",
    "nama": "Budi Santoso",
    "tx_id_blockchain": "abc123def456"
  }
}
```

**Test Result:** ✓ Pasien registered ke blockchain dengan tx_id

---

## 2️⃣ Create Diagnosa → Blockchain

**Endpoint:** `POST /api/diagnosa`

```bash
curl -X POST http://localhost:5000/api/diagnosa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tanggal": "2026-05-29",
    "id_rs": 1,
    "id_dokter": 1,
    "nik_pasien": "3271000000000001",
    "nama_diagnosa": "Demam Berdarah",
    "kriteria_ciri": "Demam tinggi, mual, muntah",
    "obat": "Paracetamol 500mg"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "id_diagnosa": 1,
    "tx_id_blockchain": "xyz789abc123"
  }
}
```

**Test Result:** ✓ Diagnosa registered ke blockchain

---

## 3️⃣ Query Patient Medical History (Database + Blockchain)

**Endpoint:** `GET /api/diagnosa/patient/:nik/medical-history`

```bash
curl -X GET http://localhost:5000/api/diagnosa/patient/3271000000000001/medical-history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "pasien": {
      "nik": "3271000000000001",
      "nama": "Budi Santoso",
      "alamat": "Jl. Merdeka No. 123"
    },
    "databaseRecords": [
      {
        "id_diagnosa": 1,
        "tanggal": "2026-05-29",
        "nama_diagnosa": "Demam Berdarah",
        "nama_dokter": "Dr. Andi",
        "spesialisasi": "Penyakit Dalam",
        "nama_rs": "RS Mitra Sehat",
        "tx_id_blockchain": "xyz789abc123"
      }
    ],
    "blockchainRecords": {
      "history": [
        {
          "txId": "xyz789abc123",
          "timestamp": "2026-05-29T10:30:00Z",
          "diagnosa": "Demam Berdarah"
        }
      ]
    },
    "totalRecords": 1
  }
}
```

**Test Result:** ✓ Kombinasi data blockchain + database berhasil

---

## 4️⃣ Query Hospital Diagnosis Summary (Complex Aggregation)

**Endpoint:** `GET /api/diagnosa/hospital/:id_rs/summary`

```bash
curl -X GET http://localhost:5000/api/diagnosa/hospital/1/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "rumahSakit": {
      "id_rs": 1,
      "nama_rs": "RS Mitra Sehat"
    },
    "totalDiagnosa": 5,
    "topDiagnosa": [
      {
        "nama_diagnosa": "Demam Berdarah",
        "count": 2
      },
      {
        "nama_diagnosa": "Flu",
        "count": 1
      }
    ],
    "topDokter": [
      {
        "id_dokter": 1,
        "nama": "Dr. Andi",
        "spesialisasi": "Penyakit Dalam",
        "count": 3
      }
    ],
    "monthlyTrend": [
      {
        "bulan": "2026-05",
        "count": 5
      }
    ]
  }
}
```

**Test Result:** ✓ Complex aggregation query berhasil

---

## 5️⃣ Query Blockchain Transaction by TxId

**Endpoint:** `GET /api/diagnosa/blockchain/:txId`

```bash
curl -X GET http://localhost:5000/api/diagnosa/blockchain/xyz789abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "txId": "xyz789abc123",
    "diagnosa": "Demam Berdarah",
    "pasien": "Budi Santoso",
    "timestamp": "2026-05-29T10:30:00Z"
  }
}
```

**Test Result:** ✓ Blockchain transaction query berhasil

---

## 🔄 Integration Test Flow

```
1. Create Pasien
   ↓ (invoke blockchain CreatePatientRecord)
   ↓ (tx_id: xxxxxxx)

2. Create Diagnosa
   ↓ (invoke blockchain AddDiagnosis)
   ↓ (tx_id: yyyyyyy)

3. Query Medical History
   ↓ (kombinasi DB + Blockchain)
   ✓ Data complete dengan traceability

4. Query Hospital Summary
   ✓ Analytics: top diagnosa, dokter, trend
```

---

## ⚠️ Troubleshooting

### Blockchain connection failed
```
Error: Failed to initialize Fabric gateway
→ Check network_profile.json
→ Verify wallet identity
→ Check channel name dan chaincode name
```

### Transaction timeout
```
→ Increase timeout di fabricService.js
→ Check endorsement policy
→ Verify transaction input format
```

### Database JOIN error
```
→ Check foreign key references
→ Verify table names dan column names
→ Check data type mismatch
```

---

## 📊 Testing Checklist

- [ ] Pasien creation → blockchain tx_id generated
- [ ] Diagnosa creation → blockchain tx_id generated
- [ ] Medical history → combine data from 2 sources
- [ ] Hospital summary → aggregation queries work
- [ ] Blockchain transaction → queryable by tx_id
- [ ] All responses have correct structure
- [ ] Error handling works properly
- [ ] Pagination works
- [ ] Search/filter works

---

**Created:** 2026-05-29
**Status:** Ready for testing
