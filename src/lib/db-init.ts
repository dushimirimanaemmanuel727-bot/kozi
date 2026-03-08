import { prisma } from './prisma';

export async function initializeDatabase() {
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('🗄️  Database connection established');
    
    // Test a simple query to ensure the database is responsive
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test passed');
    
    // Check if we can access the User table (basic table existence check)
    const userCount = await prisma.user.count();
    console.log(`📊 Database ready - Found ${userCount} users in the system`);
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

// Only initialize in production to avoid dev noise
if (process.env.NODE_ENV === 'production') {
  initializeDatabase().catch(console.error);
}
