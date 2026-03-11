# Deployment Fix Instructions

## Critical Issues Fixed

The following deployment issues have been identified and fixed:

### 1. Environment Variables
- **Problem**: Hardcoded values in docker-compose.yml
- **Fix**: Updated to use environment variables with defaults
- **Action**: Copy `env-template.txt` to `.env` and fill in your values

### 2. NextAuth Configuration
- **Problem**: NEXTAUTH_URL hardcoded to localhost
- **Fix**: Uses environment variable with fallback
- **Action**: Set NEXTAUTH_URL to your actual domain

### 3. Database SSL Issues
- **Problem**: SSL configuration causing connection failures
- **Fix**: Added DATABASE_SSL environment variable to control SSL
- **Action**: Set DATABASE_SSL=false if SSL causes issues

### 4. Health Checks
- **Problem**: No monitoring of container health
- **Fix**: Added health checks to all services
- **Action**: Monitor container status with `docker-compose ps`

## Quick Deployment Steps

### 1. Setup Environment Variables
```bash
# Copy the template
cp env-template.txt .env

# Edit the file with your actual values
nano .env
```

### 2. Generate Secure Secrets
```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate database password (use a strong one)
```

### 3. Deploy
```bash
# Stop existing containers
docker-compose down

# Build and start with new configuration
docker-compose up -d --build

# Check container status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Verify Deployment
```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Test database connection
curl http://localhost:3000/api/debug/test-db
```

## Required Environment Variables

Create a `.env` file with these values:

```env
NODE_ENV=production
PORT=3000

POSTGRES_DB=kazi_home
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_database_password_here
DATABASE_URL=postgresql://postgres:your_secure_database_password_here@db:5432/kazi_home

NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_very_secure_nextauth_secret_key_here

DB_PORT=5433
REDIS_PORT=6379
DATABASE_SSL=false  # Set to true if using SSL
```

## Troubleshooting

### If containers fail to start:
1. Check environment variables in `.env`
2. Verify DATABASE_URL format
3. Ensure NEXTAUTH_SECRET is at least 32 characters
4. Check port conflicts

### If database connection fails:
1. Set DATABASE_SSL=false in `.env`
2. Verify database container is healthy: `docker-compose ps db`
3. Check database logs: `docker-compose logs db`

### If NextAuth fails:
1. Verify NEXTAUTH_URL matches your domain
2. Ensure NEXTAUTH_SECRET is set
3. Check application logs: `docker-compose logs app`

## Production Considerations

1. **Security**: Use strong, unique passwords and secrets
2. **Domain**: Update NEXTAUTH_URL to your actual domain
3. **SSL**: Consider using HTTPS in production
4. **Monitoring**: Monitor health checks and logs regularly
5. **Backups**: Set up database backups for production data
