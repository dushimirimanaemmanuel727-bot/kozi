# Deployment Guide for Kazi-Home

This guide covers containerizing and deploying the Kazi-Home application using Docker.

## Prerequisites

- Docker and Docker Compose installed
- Git
- Basic command line knowledge

## Project Structure

The project is a Next.js application with the following key files for deployment:

- `Dockerfile` - Container configuration
- `docker-compose.yml` - Multi-service orchestration
- `.dockerignore` - Files to exclude from container

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kazi-home
   ```

2. **Build and run the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Database: localhost:5432

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL=postgresql://kazi_user:kazi_password@postgres:5432/kazi_home

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Security
JWT_SECRET=your-jwt-secret
```

### Database

The application uses PostgreSQL. The database is automatically initialized with the schema from `database-schema.sql`.

## Production Deployment

### 1. Build the Docker Image

```bash
docker-compose -f docker-compose.yml build
```

### 2. Run in Production Mode

```bash
docker-compose -f docker-compose.yml up -d
```

### 3. Health Checks

Verify the application is running:

```bash
curl http://localhost:3000/api/health
```

## Development Workflow

### Development Mode

```bash
# Start development services
docker-compose -f docker-compose.dev.yml up

# Or with hot reload
docker-compose -f docker-compose.dev.yml up --build
```

### Stopping Services

```bash
docker-compose down
```

## Monitoring and Logs

### View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f kazi-home
```

### Check Running Containers

```bash
docker-compose ps
```

## Scaling

To scale the application horizontally:

```bash
docker-compose up --scale kazi-home=3
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to version control
2. **Database Credentials**: Use strong passwords and rotate regularly
3. **Network Security**: Use firewall rules to restrict access
4. **SSL/TLS**: Configure HTTPS for production deployments

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Stop existing services
docker-compose down
   # Or use different ports in docker-compose.yml
   ```

2. **Database Connection Issues**
   - Check if PostgreSQL is running: `docker-compose ps`
   - Verify connection string in `.env`
   - Check database logs: `docker-compose logs postgres`

3. **Build Failures**
   - Ensure all dependencies are in `package.json`
   - Check `.dockerignore` for accidentally excluded files
   - Verify Docker daemon is running

### Debug Commands

```bash
# Enter running container
docker-compose exec kazi-home sh

# Check container status
docker-compose ps

# View container resource usage
docker stats
```

## Backup and Recovery

### Database Backup

```bash
# Backup database
docker-compose exec postgres pg_dump -U kazi_user kazi_home > backup.sql

# Restore database
docker-compose exec -T postgres psql -U kazi_user kazi_home < backup.sql
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and deploy
        run: |
          docker-compose build
          docker-compose up -d
```

## Performance Optimization

1. **Multi-stage Builds**: Already implemented in Dockerfile
2. **Layer Caching**: Order Dockerfile instructions by frequency of change
3. **Health Checks**: Add health check endpoints
4. **Resource Limits**: Configure memory and CPU limits in docker-compose.yml

## Monitoring

### Application Metrics

- Use Prometheus/Grafana for monitoring
- Implement health check endpoints
- Set up logging with ELK stack or similar

### Container Metrics

```bash
# View container resource usage
docker stats

# View detailed container information
docker inspect kazi-home
```

## Next Steps

1. Configure SSL/TLS for production
2. Set up automated backups
3. Implement monitoring and alerting
4. Configure load balancing for scaling
5. Set up CI/CD pipeline