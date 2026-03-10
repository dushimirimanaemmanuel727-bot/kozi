# Docker Deployment Guide

This guide explains how to deploy the Kazi Home application using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on your system
- Sufficient system resources (minimum 2GB RAM, 10GB disk space)

## Quick Start

### 1. Build and Start Services

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Database**: localhost:5432
- **Redis**: localhost:6379

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/kazi_home
POSTGRES_DB=kazi_home
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Application Configuration
NODE_ENV=production
PORT=3000
```

### 3. Database Setup

The PostgreSQL container will automatically initialize with the `create-superadmin.sql` script if it exists in the project root.

## Services

### Application Container
- **Image**: Built from Dockerfile using Node.js 18 Alpine
- **Port**: 3000
- **Environment**: Production
- **Restart Policy**: Unless stopped

### Database Container
- **Image**: PostgreSQL 15 Alpine
- **Port**: 5432
- **Volume**: Persistent data storage
- **Restart Policy**: Unless stopped

### Redis Container
- **Image**: Redis 7 Alpine
- **Port**: 6379
- **Volume**: Persistent data storage
- **Restart Policy**: Unless stopped

## Development vs Production

### Development
```bash
# Use the existing development setup
npm run dev
```

### Production
```bash
# Use Docker Compose for production deployment
docker-compose up -d --build
```

## Useful Commands

```bash
# View running containers
docker-compose ps

# View logs for a specific service
docker-compose logs app
docker-compose logs db
docker-compose logs redis

# Stop all services
docker-compose down

# Stop services and remove volumes
docker-compose down -v

# Rebuild a specific service
docker-compose up -d --build app

# Access the application container
docker-compose exec app sh

# Access the database container
docker-compose exec db psql -U postgres -d kazi_home
```

## Production Considerations

### Security
1. Change default passwords in environment variables
2. Use strong NextAuth secrets
3. Enable HTTPS in production
4. Consider using a reverse proxy (nginx/traefik)

### Performance
1. Increase container resource limits if needed
2. Enable database connection pooling
3. Consider using external database services for large scale

### Monitoring
1. Set up health checks
2. Monitor container resource usage
3. Set up log aggregation

## Troubleshooting

### Port Conflicts
If ports are already in use, modify the `docker-compose.yml` file:
```yaml
ports:
  - "3001:3000"  # Change host port
```

### Database Connection Issues
1. Verify database container is running: `docker-compose ps db`
2. Check database logs: `docker-compose logs db`
3. Ensure proper environment variables

### Build Issues
1. Clear Docker cache: `docker system prune -a`
2. Rebuild from scratch: `docker-compose build --no-cache`

## Scaling

For horizontal scaling, consider:
1. Using Docker Swarm or Kubernetes
2. External database services
3. Load balancers
4. Session storage in Redis

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec db pg_dump -U postgres kazi_home > backup.sql

# Restore backup
docker-compose exec -T db psql -U postgres kazi_home < backup.sql
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v kazi-home_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```
