# Security Configuration Guide

## Environment Variables

The application now uses environment variables for all sensitive configuration. **Never commit actual credentials to version control.**

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | Database connection URL | `jdbc:mariadb://localhost:3306/ogame` |
| `DB_USERNAME` | Database username | `your_db_user` |
| `DB_PASSWORD` | Database password | `your_secure_password` |
| `JWT_SECRET` | JWT signing secret (≥32 chars) | `your_generated_jwt_secret_32chars_min` |
| `JWT_EXPIRATION` | JWT token expiration (ms) | `86400000` (24 hours) |

### Docker Compose Additional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MYSQL_ROOT_PASSWORD` | MariaDB root password | `your_mysql_root_password` |

## Security Best Practices

### 1. Environment Variables Setup

**For Development:**
```bash
# Copy the template
cp .env.example .env

# Edit with your actual values
nano .env

# Make sure .env is in .gitignore
echo ".env" >> .gitignore
```

**For Production:**
- Use your platform's secrets management (AWS Secrets Manager, Azure Key Vault, etc.)
- Set environment variables directly in your deployment platform
- Never use the default values from .env.example

### 2. JWT Secret Requirements

- **Minimum 32 characters** (256-bit security)
- Use a cryptographically secure random generator
- **Example generation:**
  ```bash
  # Generate a secure JWT secret
  openssl rand -base64 32
  ```

### 3. Database Security

- Use strong passwords (mix of letters, numbers, symbols)
- Limit database access to application-only
- Enable SSL/TLS for database connections in production
- Regular password rotation

### 4. Deployment Security

**Docker Compose:**
```bash
# Create .env file with your secrets
cp .env.example .env
nano .env

# Start the stack
docker-compose up -d
```

**Standalone Docker:**
```bash
docker run -d \
  --name ogame-backend \
  -p 8080:8080 \
  -e DB_URL="jdbc:mariadb://your-db:3306/ogame" \
  -e DB_USERNAME="ogame_user" \
  -e DB_PASSWORD="$DB_PASSWORD" \
  -e JWT_SECRET="$JWT_SECRET" \
  ogame-backend-simple
```

**Kubernetes:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ogame-secrets
data:
  db-password: <base64-encoded>
  jwt-secret: <base64-encoded>
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ogame-backend
spec:
  template:
    spec:
      containers:
      - name: ogame-backend
        image: ogame-backend-simple
        env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: ogame-secrets
              key: db-password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: ogame-secrets
              key: jwt-secret
```

## Default Credentials

The application creates a default admin user:
- **Username:** `admin`
- **Password:** `changeme`

**⚠️ IMPORTANT:** Change the default admin password immediately after first login in production!

## Security Checklist

- [ ] Environment variables configured
- [ ] Strong JWT secret generated (≥32 chars)
- [ ] Database credentials secured
- [ ] Default admin password changed
- [ ] SSL/TLS enabled for database (production)
- [ ] Firewall configured for database access
- [ ] Regular security updates applied
- [ ] Monitoring and logging enabled
