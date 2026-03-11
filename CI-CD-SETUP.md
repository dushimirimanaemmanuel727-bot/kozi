# CI/CD Setup Guide

## Overview

This repository is configured with a comprehensive CI/CD pipeline using GitHub Actions, Docker, and automated testing.

## 🚀 CI/CD Pipeline Features

### **Automated Testing**
- **Unit Tests**: Jest with React Testing Library
- **Integration Tests**: Database integration testing
- **E2E Tests**: Playwright end-to-end testing
- **Code Coverage**: Coverage reporting with Codecov
- **Security Scanning**: Trivy vulnerability scanning

### **Automated Deployment**
- **Docker Builds**: Multi-stage Docker builds
- **Container Registry**: GitHub Container Registry
- **Environment Promotion**: Staging → Production
- **Health Checks**: Automated deployment verification

### **Code Quality**
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Pre-commit hooks

## 📁 Files Created

### **GitHub Actions Workflows**
- `.github/workflows/ci-cd.yml` - Main CI/CD pipeline
- `.github/workflows/docker-build.yml` - Docker build and deploy
- `.github/workflows/test.yml` - Testing pipeline

### **Testing Configuration**
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Test setup and mocks
- `playwright.config.ts` - E2E test configuration
- `tests/` - Test files directory

### **Kubernetes Deployment**
- `kubernetes/deployment.yml` - K8s deployment manifests

## 🔧 Required Setup

### **1. GitHub Secrets**

Add these secrets to your GitHub repository:

```bash
# Render Deployment
RENDER_SERVICE_ID=your_render_service_id
RENDER_API_KEY=your_render_api_key

# Slack Notifications (optional)
SLACK_WEBHOOK=your_slack_webhook_url
```

### **2. Container Registry**

The pipeline uses GitHub Container Registry (`ghcr.io`). Images are automatically pushed to:
```
ghcr.io/dushimirimanaemmanuel727-bot/kozi:latest
ghcr.io/dushimirimanaemmanuel727-bot/kozi:{commit-sha}
```

### **3. Environment Variables**

The pipeline automatically sets these during deployment:
```env
NODE_ENV=production
DATABASE_URL=from_render_secrets
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=from_render_secrets
DATABASE_SSL=false
```

## 🔄 Pipeline Triggers

### **On Push to Main**
1. ✅ Run all tests (unit, integration, E2E)
2. ✅ Build and test Docker image
3. ✅ Push to Container Registry
4. ✅ Deploy to Production (Render)
5. ✅ Run security scans
6. ✅ Send notifications

### **On Pull Request**
1. ✅ Run all tests
2. ✅ Code quality checks
3. ✅ Security scanning
4. ✅ No deployment (manual merge required)

## 🧪 Testing

### **Run Tests Locally**

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### **Test Coverage Requirements**

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## 🐳 Docker Configuration

### **Build Docker Image**
```bash
# Build locally
docker build -t kazi-home .

# Run locally
docker run -p 3000:3000 kazi-home
```

### **Multi-stage Build**
- **Stage 1**: Build dependencies
- **Stage 2**: Production image
- **Optimization**: Minimal production image

## ☸️ Kubernetes Deployment

### **Deploy to Kubernetes**

```bash
# Apply namespace and secrets
kubectl apply -f kubernetes/namespace.yml
kubectl apply -f kubernetes/secrets.yml

# Deploy application
kubectl apply -f kubernetes/deployment.yml

# Check deployment
kubectl get pods -n kazi-home
```

### **Features**
- **Health Checks**: Liveness and readiness probes
- **Auto-scaling**: Configurable replica counts
- **SSL Termination**: Automatic HTTPS with cert-manager
- **Resource Limits**: Memory and CPU constraints

## 📊 Monitoring & Logging

### **Health Endpoints**
- `/api/health` - Application health check
- Database connectivity monitoring
- Response time tracking

### **Deployment Monitoring**
- GitHub Actions status
- Render deployment logs
- Slack notifications (optional)

## 🔒 Security

### **Automated Security Scanning**
- **Trivy**: Container vulnerability scanning
- **Dependency Checks**: Automated vulnerability detection
- **Secrets Scanning**: Prevent credential leaks

### **Security Best Practices**
- Environment variables for secrets
- Minimal container images
- Non-root user execution
- SSL/TLS enforcement

## 🚀 Deployment Process

### **Production Deployment**
1. **Code pushed** to `main` branch
2. **CI pipeline** triggers automatically
3. **Tests run** and must pass
4. **Docker image** built and pushed
5. **Render deployment** triggered
6. **Health checks** verify deployment
7. **Notifications** sent

### **Rollback Process**
```bash
# Rollback to previous version
git checkout previous-commit-tag
git push origin main --force
```

## 📝 Development Workflow

### **Feature Development**
1. Create feature branch from `develop`
2. Implement changes with tests
3. Push to feature branch
4. Create pull request to `develop`
5. CI runs tests and checks
6. Merge to `develop`
7. Create release PR to `main`
8. Deploy to production

### **Pre-commit Hooks**
- ESLint runs automatically
- Prettier formats code
- Tests run on staged files

## 🛠️ Troubleshooting

### **Common Issues**

**Tests Failing:**
```bash
# Check test environment
npm run test:debug

# Update test dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

**Docker Build Fails:**
```bash
# Clean Docker cache
docker system prune -f

# Rebuild without cache
docker build --no-cache -t kazi-home .
```

**Deployment Fails:**
```bash
# Check Render logs
# Verify environment variables
# Test health endpoint manually
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Deployment Guide](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Playwright Testing](https://playwright.dev/)
- [Jest Testing Framework](https://jestjs.io/)

## 🎯 Next Steps

1. **Set up GitHub secrets** for deployment
2. **Configure Render** for automatic deployments
3. **Add monitoring** and alerting
4. **Set up staging environment**
5. **Configure backup strategies**

---

**The CI/CD pipeline is now fully configured and ready for automated deployments!** 🚀
