import { Pool, PoolClient } from 'pg';

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Connection helper
export async function getConnection(): Promise<PoolClient> {
  return pool.connect();
}

// Query helper
export async function query(text: string | TemplateStringsArray, params?: any[]): Promise<any> {
  const client = await getConnection();
  try {
    const queryString = typeof text === 'string' ? text : text.join('');
    const result = await client.query(queryString, params);
    return result;
  } finally {
    client.release();
  }
}

// Transaction helper
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getConnection();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Database initialization
export async function initializeDatabase() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting database initialization...');
    
    // Test basic connection
    const client = await getConnection();
    const connectionTime = Date.now() - startTime;
    console.log(`🗄️  Database connection established in ${connectionTime}ms`);
    
    // Test a simple query
    const queryStart = Date.now();
    await client.query('SELECT 1 as test');
    const queryTime = Date.now() - queryStart;
    console.log(`✅ Database query test passed in ${queryTime}ms`);
    
    // Check if users table exists
    try {
      const userCountStart = Date.now();
      const userResult = await client.query('SELECT COUNT(*) as count FROM "User"');
      const userCount = parseInt(userResult.rows[0].count);
      const userCountTime = Date.now() - userCountStart;
      
      console.log(`📊 Database ready - Found ${userCount} users in system (${userCountTime}ms)`);
      
      // Test table accessibility
      const tables = ['Job', 'Application', 'Review', 'Notification'];
      console.log('🔍 Verifying table accessibility...');
      
      for (const tableName of tables) {
        try {
          await client.query(`SELECT 1 FROM "${tableName}" LIMIT 1`);
          console.log(`✅ ${tableName} table accessible`);
        } catch (error) {
          console.warn(`⚠️  ${tableName} table check failed:`, error);
        }
      }
      
      const totalTime = Date.now() - startTime;
      console.log(`🎉 Database initialization completed successfully in ${totalTime}ms`);
      
      client.release();
      return true;
    } catch (tableError) {
      client.release();
      console.warn('⚠️  Database tables not found - Migration required');
      console.log('💡 Please run database migrations manually');
      return false;
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

// Initialize database in all environments
console.log('📍 Database module loaded');

if (process.env.NODE_ENV === 'production') {
  console.log('🏭 Production environment detected - Running database initialization...');
  initializeDatabase().catch((error) => {
    console.error('💥 Unhandled database initialization error:', error);
  });
} else {
  console.log('🛠️  Development environment detected - Skipping automatic initialization');
}

export default pool;
