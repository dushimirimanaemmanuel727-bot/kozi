import { NextRequest } from "next/server";

interface RateLimitResult {
  limited: boolean;
  current: number;
  limit: number;
  resetTime: number;
}

const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
const rateLimitMaxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(request: NextRequest): Promise<RateLimitResult> {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const now = Date.now();

  // Clean up expired entries
  for (const [key, value] of ipRequestCounts.entries()) {
    if (value.resetTime < now) {
      ipRequestCounts.delete(key);
    }
  }

  // Get current count for this IP
  const current = ipRequestCounts.get(ip) || { count: 0, resetTime: now + rateLimitWindowMs };
  
  // Increment count
  current.count++;
  ipRequestCounts.set(ip, current);

  // Check if rate limit exceeded
  const limited = current.count > rateLimitMaxRequests;

  return {
    limited,
    current: current.count,
    limit: rateLimitMaxRequests,
    resetTime: current.resetTime
  };
}