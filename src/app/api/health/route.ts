import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'kazi-home',
      version: '1.0.0'
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      }, 
      { status: 503 }
    );
  }
}
