# Deployment Configuration

## Environment Variables

Create a `.env.local` file with the following configuration:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Security Configuration
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Security Headers
CSP_DIRECTIVE=default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self' https://api.example.com;

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json

# Monitoring Configuration
SENTRY_DSN=your-sentry-dsn-here

# Production Configuration
NODE_ENV=production
PORT=3000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Security Headers Configuration

Create a `security-headers.ts` file with the following content:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function securityHeaders(response: NextResponse): void {
  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  
  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' https: data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];
  
  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));
  
  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
}

export function securityHeadersMiddleware(request: NextRequest, response: NextResponse): NextResponse {
  securityHeaders(response);
  return response;
}
```

## Rate Limiting Configuration

Create a `rate-limiter.ts` file with the following content:

```typescript
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
  const ip = request.ip || 'unknown';
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
```

## Database Configuration

Update your `db.ts` file with the following content:

```typescript
import { Pool, PoolClient } from 'pg';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { QueryResult } from '@/types/database';

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false // Always disable SSL for Docker containers
});

let initStarted = false;

// Connection helper
export async function getConnection(): Promise<PoolClient> {
  return pool.connect();
}

// Query helper
export async function query<T = any>(text: string | TemplateStringsArray, params?: any[]): Promise<QueryResult<T>> {
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
    } catch (error) {
      client.release();
      console.warn('⚠️  Database tables not found - Migration required:', error);
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

/**
 * Render/Next builds can import server modules during `next build` / prerendering.
 * We must NOT attempt DB connections during the build phase, otherwise deploys fail
 * with ECONNREFUSED/ETIMEDOUT before the DB is reachable.
 */
export function maybeInitializeDatabase() {
  if (initStarted) return;
  initStarted = true;

  const phase = process.env.NEXT_PHASE;
  const isBuildPhase =
    phase === PHASE_PRODUCTION_BUILD ||
    phase === 'phase-production-build' ||
    process.env.NEXT_RUNTIME === 'edge';

  if (isBuildPhase) return;

  if (process.env.NODE_ENV === 'production') {
    initializeDatabase().catch((error) => {
      console.error('💥 Unhandled database initialization error:', error);
    });
  }
}

export default pool;
```

## Middleware Configuration

Update your `middleware.ts` file with the following content:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "./lib/rate-limiter";
import { securityHeaders } from "./lib/security-headers";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Security headers
  const response = NextResponse.next();
  securityHeaders(response);

  // Rate limiting
  const rateLimitResult = await rateLimit(request);
  if (rateLimitResult.limited) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later."
      },
      { status: 429 }
    );
  }

  // Debug endpoint protection - disable in production
  if (process.env.NODE_ENV === 'production') {
    if (pathname.startsWith('/api/debug/')) {
      return NextResponse.json(
        {
          error: "Endpoint not found",
          message: "Debug endpoints are disabled in production"
        },
        { status: 404 }
      );
    }
  }

  // Allow access to auth pages, API routes, and static files
  if (
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/uploads/") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // For now, we'll handle admin protection at the page level
  // The dashboard redirect logic will handle routing
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

## Deployment Steps

1. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Update with your actual configuration

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Test the application**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Deploy**
   - For Vercel: Push to your repository and deploy via Vercel dashboard
   - For other platforms: Follow their specific deployment procedures

## Security Best Practices

- Never commit `.env.local` to version control
- Use strong, unique secrets for JWT and session tokens
- Regularly update dependencies
- Monitor logs for suspicious activity
- Implement proper backup procedures
- Use HTTPS in production

## Monitoring and Maintenance

- Set up error tracking (e.g., Sentry)
- Monitor database performance
- Regularly check security headers
- Review rate limiting logs
- Keep dependencies updated

This configuration provides a solid foundation for secure, production-ready deployment with proper security measures, rate limiting, and error handling.