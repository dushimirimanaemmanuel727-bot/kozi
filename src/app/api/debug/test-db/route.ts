import { query } from '@/lib/db';

export async function GET() {
  try {
    // Test basic database connection
    const result = await query('SELECT NOW() as current_time');
    
    // Test User table
    const userCount = await query('SELECT COUNT(*) as count FROM "User"');
    
    // Test WorkerProfile table
    const profileCount = await query('SELECT COUNT(*) as count FROM "WorkerProfile"');
    
    return Response.json({ 
      success: true,
      currentTime: result.rows[0].current_time,
      userCount: userCount.rows[0].count,
      profileCount: profileCount.rows[0].count
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ 
      success: false, 
      error: errorMessage,
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
}
