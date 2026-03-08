import { prisma } from './prisma';

export async function initializeDatabase() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting database initialization...');
    
    // Test basic connection
    await prisma.$connect();
    const connectionTime = Date.now() - startTime;
    console.log(`🗄️  Database connection established in ${connectionTime}ms`);
    
    // Test a simple query to ensure the database is responsive
    const queryStart = Date.now();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    const queryTime = Date.now() - queryStart;
    console.log(`✅ Database query test passed in ${queryTime}ms`);
    
    // Check if database has been migrated by testing table existence
    console.log('🔍 Checking database migration status...');
    
    try {
      // Try to count users to see if User table exists
      const userCountStart = Date.now();
      const userCount = await prisma.user.count();
      const userCountTime = Date.now() - userCountStart;
      
      console.log(`📊 Database ready - Found ${userCount} users in the system (${userCountTime}ms)`);
      
      // Additional verification: Test table accessibility
      const tables = ['Job', 'Application', 'Review', 'Notification'];
      console.log('🔍 Verifying table accessibility...');
      
      for (const tableName of tables) {
        try {
          await prisma.$queryRaw`SELECT 1 FROM ${tableName} LIMIT 1`;
          console.log(`✅ ${tableName} table accessible`);
        } catch (error) {
          console.warn(`⚠️  ${tableName} table check failed:`, error);
        }
      }
      
      const totalTime = Date.now() - startTime;
      console.log(`🎉 Database initialization completed successfully in ${totalTime}ms`);
      
      return true;
    } catch (tableError) {
      // If User table doesn't exist, database needs migration
      if (tableError instanceof Error && tableError.message.includes('does not exist')) {
        console.warn('⚠️  Database tables not found - Migration required');
        console.log('💡 Please run: npx prisma migrate deploy');
        console.log('🔧 Or for development: npx prisma db push');
        
        const totalTime = Date.now() - startTime;
        console.log(`⏸️  Database initialization paused in ${totalTime}ms - Migration needed`);
        
        return false;
      }
      throw tableError;
    }
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Database initialization failed after ${totalTime}ms:`, error);
    console.error('🔥 Initialization error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
    return false;
  }
}

// Initialize database in all environments with enhanced logging
console.log('📍 Database initialization module loaded');

if (process.env.NODE_ENV === 'production') {
  console.log('🏭 Production environment detected - Running database initialization...');
  initializeDatabase().catch((error) => {
    console.error('💥 Unhandled database initialization error:', error);
  });
} else {
  console.log('🛠️  Development environment detected - Skipping automatic initialization');
}
