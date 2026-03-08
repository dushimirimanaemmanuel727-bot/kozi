import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Health check initiated...');
    
    // Test database connection with timing
    const connectionStart = Date.now();
    await prisma.$queryRaw`SELECT 1 as health_check`;
    const connectionTime = Date.now() - connectionStart;
    
    console.log(`✅ Health check: Database connection successful in ${connectionTime}ms`);
    
    // Get database statistics for detailed health information
    const statsStart = Date.now();
    const [userCount, jobCount, applicationCount] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count()
    ]);
    const statsTime = Date.now() - statsStart;
    
    console.log(`📊 Database stats retrieved in ${statsTime}ms: ${userCount} users, ${jobCount} jobs, ${applicationCount} applications`);
    
    const totalTime = Date.now() - startTime;
    console.log(`🎉 Health check completed successfully in ${totalTime}ms`);
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'kazi-home',
      version: '1.0.0',
      database: {
        status: 'connected',
        connectionTime: `${connectionTime}ms`,
        queryTime: `${statsTime}ms`,
        stats: {
          users: userCount,
          jobs: jobCount,
          applications: applicationCount
        }
      },
      performance: {
        totalTime: `${totalTime}ms`
      }
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Health check: Database connection failed after ${totalTime}ms:`, error);
    console.error('🔥 Health check error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
    
    return NextResponse.json(
      { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        service: 'kazi-home',
        database: {
          status: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        performance: {
          totalTime: `${totalTime}ms`
        }
      }, 
      { status: 503 }
    );
  }
}
