# Render Environment Variables Setup

## Required Environment Variables

Add these environment variables to your Render dashboard:

### Database Configuration
```
DATABASE_URL=postgresql://your_username:your_password@your_host:5432/your_database
```

### NextAuth Configuration
```
NEXTAUTH_URL=https://kozi.onrender.com
NEXTAUTH_SECRET=your_very_long_random_secret_key_here
```

### Application Configuration
```
NODE_ENV=production
PORT=10000
```

## Generating NEXTAUTH_SECRET

Generate a secure secret using one of these methods:

### Method 1: OpenSSL (Recommended)
```bash
openssl rand -base64 32
```

### Method 2: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Method 3: Online Generator
Use a secure online generator like https://generate-secret.vercel.app/32

## Database Schema Fix

The main issue was a column name mismatch. The database schema has been updated to use `passwordHash` (camelCase) consistently.

## Steps to Fix Your Deployment

1. **Add Environment Variables** in Render Dashboard:
   - Go to your Render service dashboard
   - Navigate to "Environment" tab
   - Add all the required variables above

2. **Generate and Add NEXTAUTH_SECRET**:
   - Use one of the methods above to generate a secure secret
   - Add it to your environment variables

3. **Redeploy**:
   - Push the code changes to trigger a new deployment
   - The deployment should now work without the authentication errors

## Verification

After deployment, check:
- Registration works without database errors
- Login/Authentication works without NextAuth errors
- Application loads properly

## Common Issues

1. **Database Connection**: Ensure DATABASE_URL is correct and accessible
2. **NextAuth Secret**: Must be set in production, cannot be empty
3. **Column Names**: Fixed the `passwordhash` vs `passwordHash` issue
