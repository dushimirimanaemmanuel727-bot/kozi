#!/bin/bash

# Database Migration and Deployment Script
# This script handles database migrations and deployment setup

echo "🚀 Starting database deployment process..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    exit 1
fi

echo "📍 DATABASE_URL is configured"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma client generation failed"
    exit 1
fi

echo "✅ Prisma client generated successfully"

# Run database migrations
echo "🗄️ Running database migrations..."
npm run db:migrate

if [ $? -ne 0 ]; then
    echo "❌ Database migration failed"
    exit 1
fi

echo "✅ Database migrations completed successfully"

# Optional: Run database seeding (only in specific environments)
if [ "$NODE_ENV" != "production" ] && [ "$DB_SEED" = "true" ]; then
    echo "🌱 Seeding database..."
    npm run db:seed
    
    if [ $? -ne 0 ]; then
        echo "⚠️ Database seeding failed (optional)"
    else
        echo "✅ Database seeded successfully"
    fi
fi

# Test database connection
echo "🔍 Testing database connection..."
node -e "
import { prisma } from './src/lib/prisma.js';

async function testConnection() {
    try {
        await prisma.\$connect();
        console.log('✅ Database connection test passed');
        
        const userCount = await prisma.user.count();
        console.log(\`📊 Database ready: \${userCount} users found\`);
        
        await prisma.\$disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection test failed:', error);
        process.exit(1);
    }
}

testConnection();
"

if [ $? -ne 0 ]; then
    echo "❌ Database connection test failed"
    exit 1
fi

echo "🎉 Database deployment completed successfully!"
echo "🚀 Ready to start the application..."
