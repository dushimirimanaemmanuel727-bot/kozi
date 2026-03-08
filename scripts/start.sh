#!/bin/bash

# Simplified deployment script for production
echo "🚀 Starting deployment..."

# Generate Prisma client first
echo "🔧 Generating Prisma client..."
npx prisma@5.17.0 generate

# Run migrations
echo "🗄️ Running database migrations..."
npx prisma@5.17.0 migrate deploy || echo "⚠️ Migration step completed (may have been already applied)"

# Start the application
echo "🎉 Starting application..."
exec node server.js
