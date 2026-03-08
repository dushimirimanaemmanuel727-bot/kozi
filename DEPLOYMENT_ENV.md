# Environment Variables for Deployment

## Required Environment Variables

### Database Configuration
```bash
DATABASE_URL="postgresql://username:password@host:port/database_name"
```

### NextAuth.js Configuration
```bash
# Generate a new secret for production: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="https://your-domain.com"
```

## Production Setup

### For Render.com Deployment
1. Go to your service dashboard
2. Add Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate a new secret using: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   - `NEXTAUTH_URL`: `https://your-app-name.onrender.com`

### For Docker Development
```bash
docker run -p 3001:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@kazi-home-db:5432/kazi_home" \
  -e NEXTAUTH_SECRET="bY0BVkHsEeA4F2nKXQhUvXs3vVJ/Cl8jurS6mz6KeqQ=" \
  -e NEXTAUTH_URL="http://localhost:3001" \
  kazi-home
```

### Local Development
Create a `.env.local` file (not committed to git):
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kazi_home"
NEXTAUTH_SECRET="bY0BVkHsEeA4F2nKXQhUvXs3vVJ/Cl8jurS6mz6KeqQ="
NEXTAUTH_URL="http://localhost:3000"
```

## Common Issues

### Error: "Please define a `secret` in production"
- **Cause**: Missing `NEXTAUTH_SECRET` environment variable
- **Fix**: Add the `NEXTAUTH_SECRET` environment variable with a randomly generated string

### Error: "Invalid callback URL"
- **Cause**: Missing or incorrect `NEXTAUTH_URL` environment variable  
- **Fix**: Set `NEXTAUTH_URL` to your production domain (e.g., `https://your-app.onrender.com`)
