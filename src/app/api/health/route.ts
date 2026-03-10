import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Test basic database connection
    const result = await query('SELECT 1 as test, NOW() as timestamp');
    const queryTime = Date.now() - startTime;
    
    // Test user table access
    const userResult = await query('SELECT COUNT(*) as count FROM "User"');
    const userCount = parseInt(userResult.rows[0].count);
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        queryTime: `${queryTime}ms`,
        userCount: userCount
      },
      environment: process.env.NODE_ENV || 'development'
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      environment: process.env.NODE_ENV || 'development'
    }, { status: 500 });
  }
}
