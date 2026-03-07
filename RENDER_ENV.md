# Environment Variables for Render Deployment

# Database (will be automatically set by render.yaml)
DATABASE_URL=postgresql://username:password@host:5432/kazi_home

# NextAuth.js (set these in Render dashboard)
NEXTAUTH_URL=https://your-app-name.onrender.com
NEXTAUTH_SECRET=your-secure-secret-here

# Application
NODE_ENV=production

# Optional: Upload configuration
UPLOAD_DIR=/app/public/uploads
MAX_FILE_SIZE=5242880
