# 🚀 Production Deployment Guide

## Pre-Deployment Checklist

### 1. **Environment Setup**
- [ ] Change `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET` (use `openssl rand -base64 32`)
- [ ] Setup production database credentials
- [ ] Configure `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- [ ] Update `FABRIC_NETWORK_PROFILE_PATH` dan `FABRIC_WALLET_PATH`
- [ ] Set `RATE_LIMIT_WINDOW_MS` dan `RATE_LIMIT_MAX_REQUESTS`

### 2. **Security**
- [ ] Use HTTPS with valid SSL certificates
- [ ] Setup firewall rules
- [ ] Enable database encryption
- [ ] Setup password manager untuk credentials
- [ ] Rotate API keys dan secrets regularly
- [ ] Setup VPN untuk database access

### 3. **Database**
- [ ] Create production database
- [ ] Run database setup script: `node config/setupDatabase.js`
- [ ] Setup database backups (daily recommended)
- [ ] Setup database replication jika perlu
- [ ] Create database indexes untuk performance
- [ ] Setup monitoring untuk slow queries

### 4. **Monitoring & Logging**
- [ ] Setup centralized logging (ELK Stack, Datadog, etc)
- [ ] Configure log rotation
- [ ] Setup error tracking (Sentry)
- [ ] Setup performance monitoring (New Relic)
- [ ] Setup uptime monitoring
- [ ] Setup alerts untuk critical issues

### 5. **Hyperledger Fabric**
- [ ] Setup production Fabric network
- [ ] Deploy chaincode
- [ ] Create network profile
- [ ] Enroll user di wallet
- [ ] Test blockchain connectivity
- [ ] Setup backup untuk ledger

---

## Deployment Methods

### **Option 1: Traditional Server (Ubuntu/Debian)**

#### **1. Setup Server**
```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install nginx (reverse proxy)
sudo apt-get install -y nginx
```

#### **2. Clone Repository**
```bash
cd /var/www
git clone <your-repo-url> medical-records-api
cd medical-records-api/backend
```

#### **3. Install Dependencies**
```bash
npm install --production
```

#### **4. Setup Environment**
```bash
# Copy .env.example ke .env
cp .env.example .env

# Edit .env dengan production values
nano .env
```

#### **5. Setup Database**
```bash
# Setup MySQL database
mysql -u root -p < database_setup.sql

# Jalankan setup script
node config/setupDatabase.js
```

#### **6. Start Application with PM2**
```bash
# Start application
pm2 start server.js --name "medical-api"

# Setup auto-start on reboot
pm2 startup
pm2 save

# Monitor application
pm2 monitor
```

#### **7. Configure Nginx**
```nginx
# /etc/nginx/sites-available/medical-api
upstream medical_api {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 80;
    server_name api.medical.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.medical.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/api.medical.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.medical.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
    
    location / {
        proxy_pass http://medical_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API docs (jika ada)
    location /docs {
        proxy_pass http://medical_api/docs;
    }
}
```

#### **8. Enable Nginx Site**
```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/medical-api /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### **9. Setup SSL with Let's Encrypt**
```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot certonly --standalone -d api.medical.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

### **Option 2: Docker Containerization**

#### **1. Create Dockerfile**
```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

#### **2. Create docker-compose.yml**
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: medical_mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: .
    container_name: medical_api
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: mysql
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      mysql:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs

volumes:
  mysql_data:
```

#### **3. Build and Run**
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f api

# Stop services
docker-compose down
```

---

### **Option 3: Kubernetes Deployment**

#### **1. Create k8s manifests**
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: medical-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: medical-api
  template:
    metadata:
      labels:
        app: medical-api
    spec:
      containers:
      - name: api
        image: your-registry/medical-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: host
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
```

#### **2. Deploy to Kubernetes**
```bash
# Apply deployment
kubectl apply -f deployment.yaml

# Check deployment
kubectl get deployments

# View pods
kubectl get pods

# Check logs
kubectl logs -f deployment/medical-api
```

---

## Post-Deployment

### **1. Verification**
```bash
# Check API health
curl https://api.medical.com/api/health

# Check application logs
pm2 logs medical-api

# Monitor performance
pm2 plus
```

### **2. Backup Strategy**
```bash
# Daily database backup
0 2 * * * mysqldump -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} | gzip > /backups/db-$(date +%Y%m%d).sql.gz

# Weekly backup to cloud storage
0 3 * * 0 aws s3 sync /backups/ s3://backup-bucket/medical-api/
```

### **3. Monitoring & Alerts**
```bash
# Setup Prometheus for metrics
# Setup Grafana for visualization
# Setup alerts untuk:
# - High CPU usage
# - High memory usage
# - Database connection errors
# - API response time > 1s
# - Error rate > 1%
```

---

## Troubleshooting

### **API Not Responding**
```bash
# Check if process is running
pm2 status

# Restart application
pm2 restart medical-api

# Check logs for errors
pm2 logs medical-api --err
```

### **Database Connection Error**
```bash
# Check MySQL service
sudo systemctl status mysql

# Check connection
mysql -h${DB_HOST} -u${DB_USER} -p${DB_PASSWORD} -e "SELECT 1"

# Check connection pool
# Look at DB_CONNECTION_LIMIT in .env
```

### **High Memory Usage**
```bash
# Check memory usage
pm2 monit

# Increase Node.js memory
NODE_MAX_OLD_SPACE_SIZE=4096 pm2 start server.js
```

---

## Scaling Strategy

### **Horizontal Scaling**
1. Setup multiple API instances
2. Use load balancer (Nginx/HAProxy)
3. Shared database connection pool
4. Distributed caching (Redis)

### **Vertical Scaling**
1. Increase server resources (CPU, RAM)
2. Optimize database queries
3. Add indexes untuk frequently accessed data
4. Setup read replicas untuk database

---

## Disaster Recovery

### **Backup**
- Daily automated database backups
- Weekly backup to cloud storage
- Quarterly disaster recovery test

### **Recovery Procedure**
1. Restore database dari backup
2. Restart API services
3. Verify data integrity
4. Update monitoring alerts

---

**Last Updated:** May 29, 2024
