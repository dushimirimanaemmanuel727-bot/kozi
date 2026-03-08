import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" 
      ? ["query", "error", "warn"] 
      : ["error", "warn", "info"],
    errorFormat: 'pretty'
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Enhanced database connection testing with detailed logging
async function testDatabaseConnection() {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Initializing database connection...');
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📍 Database URL configured: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);
    
    await prisma.$connect();
    const connectionTime = Date.now() - startTime;
    
    console.log(`✅ Database connected successfully in ${connectionTime}ms`);
    console.log('🗄️  Connection pool established');
    
    // Test database responsiveness
    const queryStart = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const queryTime = Date.now() - queryStart;
    
    console.log(`⚡ Database query test passed in ${queryTime}ms`);
    
    // Verify database accessibility with user count
    const userCount = await prisma.user.count();
    console.log(`👥 Database verification: ${userCount} users found`);
    
    console.log('🎉 Database initialization completed successfully');
    
  } catch (error) {
    const connectionTime = Date.now() - startTime;
    console.error(`❌ Database connection failed after ${connectionTime}ms:`, error);
    console.error('🔥 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
}

// Only test connection in production to avoid dev noise
if (process.env.NODE_ENV === "production") {
  testDatabaseConnection();
}

// Enhanced connection error handling with logging
process.on('beforeExit', async () => {
  console.log('🔄 Application shutting down - Closing database connections...');
  try {
    await prisma.$disconnect();
    console.log('✅ Database connections closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received - Closing database connections...');
  try {
    await prisma.$disconnect();
    console.log('✅ Database connections closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received - Closing database connections...');
  try {
    await prisma.$disconnect();
    console.log('✅ Database connections closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
  process.exit(0);
});

