import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Health check: Database connection successful');
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'kazi-home',
      version: '1.0.0',
      database: 'connected'
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('❌ Health check: Database connection failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        service: 'kazi-home',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 503 }
    );
  }
}
