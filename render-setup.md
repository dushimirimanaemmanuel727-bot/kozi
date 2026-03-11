# Render Database Setup Instructions

## Quick Fix for Database Issues

### 1. Check if Database is Empty
In Render PostgreSQL dashboard, run this query:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

### 2. If Database is Empty, Run Schema Setup

#### Option A: Use Render Console
1. Go to your PostgreSQL service in Render
2. Click on "Console" 
3. Copy and paste the entire content of `database-schema.sql`
4. Execute it

#### Option B: Connect via psql
```bash
psql "postgresql://postgres:YOUR_PASSWORD@YOUR_DB_HOST:5432/kazi_home" -f database-schema.sql
```

### 3. Verify Tables Exist
```sql
SELECT COUNT(*) FROM "User";
```

### 4. Create Superadmin if Needed
```sql
INSERT INTO "User" (
    id,
    name,
    phone,
    email,
    role,
    district,
    languages,
    passwordhash,
    suspended,
    createdat,
    updatedat
) VALUES (
    gen_random_uuid(),
    'Super Admin',
    '0750000001',
    'admin@kazihome.com',
    'admin',
    'Kigali',
    '["en", "rw", "fr"]',
    '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ',
    false,
    NOW(),
    NOW()
) ON CONFLICT (phone) DO NOTHING;
```

### 5. Test Connection
After setup, test: https://kozi.onrender.com/api/health

# 🔧 Render Automatic Deployment Setup

## Issue
Render is not automatically deploying when you push to GitHub because the required secrets are not configured.

## Required GitHub Secrets

You need to add these secrets to your GitHub repository:

### 1. Get Your Render Service ID
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your "kazi-home" service
3. Go to Settings → Web Service
4. Find the "Service ID" (it looks like: `srv-xxxxxxxxxxxxxxxx`)

### 2. Get Your Render API Key
1. In Render Dashboard, click your profile (top right)
2. Go to Account Settings → API Keys
3. Create a new API key
4. Copy the API key

### 3. Add GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

```
RENDER_SERVICE_ID=srv-your-service-id-here
RENDER_API_KEY=rnd-your-api-key-here
```

## Alternative: Simple Webhook Deployment

If you can't get API key, use this simpler approach:

### 1. Create Render Webhook
1. In Render Dashboard → Service Settings → Webhooks
2. Add webhook URL: `https://github.com/dushirimimimanaemmanuel727-bot/kozi`
3. Select "Push" events
4. Save the webhook

### 2. Update GitHub Actions
Replace the Render deploy step in `.github/workflows/ci-cd.yml`:

```yaml
deploy-render:
  needs: build
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  
  steps:
  - name: Deploy to Render
    run: |
      echo "🚀 Triggering Render webhook deployment"
      curl -X POST \
        -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
        -H "Content-Type: application/json" \
        -d '{"serviceId": "${{ secrets.RENDER_SERVICE_ID }}"}' \
        https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys
```

## Quick Fix for Now

**Option A: Manual Deploy (Fastest)**
1. Go to Render Dashboard
2. Click "Manual Deploy"
3. Select latest commit (f88fcf1)
4. Deploy

**Option B: Add Secrets (Recommended)**
1. Add the two GitHub secrets above
2. Push any small change to trigger auto-deployment
3. Future deployments will be automatic

---

**After adding secrets, your CI/CD will work automatically on every push!** 🚀.com/api/health
