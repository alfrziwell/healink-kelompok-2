/**
 * @file Architecture & Best Practices Guide
 * @description Penjelasan tentang clean architecture dan design patterns yang digunakan
 */

# 🏗️ Clean Architecture & Best Practices

## Architecture Overview

Backend ini mengimplementasikan **Clean Architecture** dengan separation of concerns yang jelas.

```
┌─────────────────────────────────────────┐
│        Express Routes                   │
│  (Endpoint definitions & HTTP methods)  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   Middleware Layer                      │
│  (Auth, validation, error handling)     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   Controllers Layer                     │
│  (Business logic & orchestration)       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   Services Layer                        │
│  (External integrations & complex ops)  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   Data Access Layer                     │
│  (Database queries)                     │
└─────────────────────────────────────────┘
```

## Layer Descriptions

### **1. Routes Layer** (`routes/`)
- Mendefine HTTP endpoints
- Menentukan HTTP methods (GET, POST, PUT, DELETE)
- Mengatur middleware untuk setiap route
- Memanggil controller yang sesuai

**Karakteristik:**
- Thin dan fokus pada routing
- Tidak mengandung business logic
- Mudah untuk di-test

### **2. Middleware Layer** (`middleware/`)
- **Auth Middleware** - JWT verification
- **Authorization Middleware** - Role-based access control
- **Validation Middleware** - Input validation
- **Error Handler** - Global error handling
- **Security Middleware** - Headers, rate limiting, sanitization

**Karakteristik:**
- Reusable di berbagai routes
- Modular dan independent
- Handle cross-cutting concerns

### **3. Controllers Layer** (`controllers/`)
- Menerima request dari routes
- Memvalidasi input (jika diperlukan)
- Memanggil service layer untuk business logic
- Format response dan mengembalikan ke client

**Karakteristik:**
- Orchestrate antara routes dan services
- Tidak mengandung database queries langsung
- Menangani response formatting

```javascript
// Controller example
exports.createDiagnosa = async (req, res, next) => {
    try {
        // 1. Ekstrak data dari request
        const { tanggal, id_rs, ... } = req.body;
        
        // 2. Validasi/check data referensi
        const checkRs = await db.query(...);
        if (!checkRs) return responseError(...);
        
        // 3. Invoke service (e.g., blockchain)
        const txId = await fabricService.invokeChaincode(...);
        
        // 4. Insert ke database
        const result = await db.query(...);
        
        // 5. Return response
        return responseSuccess(res, ..., result);
    } catch (error) {
        // Handle error
        return responseError(res, ..., error.message);
    }
};
```

### **4. Services Layer** (`services/`)
- Mengandung business logic kompleks
- Integrasi dengan external services/APIs
- Bisa digunakan oleh multiple controllers
- Non-HTTP specific (bisa di-reuse oleh CLI, jobs, etc)

**Karakteristik:**
- Fokus pada business domain
- Independent dari HTTP layer
- Testable secara unit

```javascript
// Service example
async function invokeChaincode(functionName, args) {
    // Business logic untuk invoke blockchain
    const result = await contract.submitTransaction(...);
    return result;
}
```

### **5. Data Access Layer** (`config/database.js`)
- Semua database queries ada di sini
- Abstraksi dari implementation details
- Connection pooling dan error handling

**Karakteristik:**
- Centralized database connection
- Query helpers dengan error handling
- Support untuk transactions

## Design Patterns

### **1. Repository Pattern** (Simplified)
```
Database queries → db.query() → Results
```

### **2. Service Locator Pattern**
Dependency injection via function imports:
```javascript
const db = require('../config/database');
const fabricService = require('../services/fabricService');
const logger = require('../config/logger');
```

### **3. Middleware Chain Pattern**
```
Request → Auth → Validation → Controller → Response
```

### **4. Error Handling Pattern**
Global error handler yang catch semua error:
```javascript
try {
    // Business logic
} catch (error) {
    return responseError(res, ..., error.message);
}
// + Global middleware errorHandler di app.js
```

## Best Practices Implemented

### ✅ **Error Handling**
- Try-catch di semua async functions
- Global error middleware
- Consistent error response format
- Detailed logging untuk debugging

### ✅ **Validation**
- Input validation di middleware
- Database constraint validation
- Business logic validation di controllers

### ✅ **Security**
- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- Input sanitization
- CORS configuration
- Security headers (Helmet)

### ✅ **Database**
- Connection pooling untuk performance
- Query parameterization untuk prevent SQL injection
- Foreign key relationships untuk data integrity
- Indexes untuk query optimization

### ✅ **Logging**
- Structured logging dengan Winston
- Different log levels (debug, info, warn, error)
- Log rotation untuk manage disk space
- Separate error logs untuk easier debugging

### ✅ **Async/Await**
- Modern async syntax (tidak callback hell)
- Promise-based operations
- Async error handling

### ✅ **Separation of Concerns**
- Controllers tidak direct query database
- Services tidak handle HTTP
- Middleware focused pada single responsibility
- Utils untuk reusable functions

### ✅ **Consistent Response Format**
```javascript
{
  success: true/false,
  message: "...",
  data: {...},
  pagination: {...},
  errors: [...]
}
```

### ✅ **Code Organization**
- Folder structure yang jelas
- File naming yang consistent
- JSDoc comments untuk dokumentasi
- Single responsibility principle

## Scalability Considerations

### **Database**
- Connection pooling untuk handle concurrent requests
- Query optimization dengan indexes
- Can scale ke read replicas jika perlu

### **API**
- Stateless design (dapat di-deploy ke multiple instances)
- Session handling via JWT (tidak need shared session store)
- Horizontal scaling via load balancer

### **Blockchain Integration**
- Non-blocking - tetap bisa return response meski blockchain slow
- Async invocation untuk better performance
- Transaction ID stored untuk audit trail

### **Caching** (Future Enhancement)
```javascript
// Bisa ditambahkan Redis untuk caching
const cachedResult = await redis.get(key);
if (!cachedResult) {
    const result = await db.query(...);
    await redis.set(key, result, 'EX', 3600);
}
```

### **Load Balancing**
```
Users
  ↓
Load Balancer (nginx/HAProxy)
  ↓
┌───────────────────────────┐
│ API Instance 1 (Port 3001)│
│ API Instance 2 (Port 3002)│
│ API Instance 3 (Port 3003)│
└─────────┬─────────────────┘
          ↓
   Shared MySQL Database
```

## Testing Strategy

### **Unit Tests** (Controllers/Services)
```javascript
// Test business logic tanpa HTTP layer
describe('createPasien', () => {
    it('should create pasien with valid data', async () => {
        // Test logic
    });
});
```

### **Integration Tests** (Routes)
```javascript
// Test entire flow dari HTTP ke database
describe('POST /api/pasien', () => {
    it('should create pasien and return 201', async () => {
        const response = await request(app)
            .post('/api/pasien')
            .send(validData);
        expect(response.status).toBe(201);
    });
});
```

### **Database Tests**
```javascript
// Test database queries
describe('db.query', () => {
    it('should insert and retrieve pasien', async () => {
        // Test data persistence
    });
});
```

## Performance Optimization

### **Database**
- Use indexes untuk frequently queried columns
- Optimize JOIN queries
- Pagination untuk large datasets
- Connection pooling

### **API**
- Async/await untuk non-blocking operations
- Response compression
- Rate limiting untuk prevent abuse
- Caching untuk repeated queries

### **Blockchain**
- Async chaincode invocation
- Transaction batching jika possible
- Error handling jika blockchain slow

## Environment-Specific Configuration

### **Development**
- Full logging
- Hot reload (nodemon)
- Detailed error messages
- No rate limiting

### **Production**
- Minimal logging (performance)
- HTTPS only
- Obfuscated error messages
- Rate limiting enabled
- Database backups
- Monitoring & alerting

## Maintenance & Monitoring

### **Logs Monitoring**
```bash
# Check application logs
tail -f logs/app.log

# Check error logs
tail -f logs/error.log

# Search specific errors
grep "ERROR" logs/error.log
```

### **Database Monitoring**
```sql
-- Check slow queries
SHOW PROCESSLIST;

-- Check table sizes
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'rekam_medis_db';
```

### **Health Checks**
```bash
# Check API health
curl http://localhost:3000/api/health

# Check database
curl http://localhost:3000/api/info
```

## Future Enhancements

1. **Caching Layer** - Redis untuk frequent queries
2. **Message Queue** - RabbitMQ untuk async processing
3. **Search** - Elasticsearch untuk advanced search
4. **Monitoring** - Prometheus + Grafana untuk metrics
5. **API Documentation** - Swagger/OpenAPI
6. **Testing** - Jest unit tests + e2e tests
7. **CI/CD** - GitHub Actions untuk automated deployment
8. **Database Migration** - Flyway/Liquibase untuk version control

---

**This architecture adalah scalable, maintainable, dan production-ready untuk sistem rekam medis dengan blockchain integration.**
