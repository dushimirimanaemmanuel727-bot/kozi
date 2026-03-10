import { requireAdmin } from "@/lib/admin-middleware";
import { query } from "@/lib/db";
import { SystemMonitoring } from "@/components/admin/system-monitoring";

export default async function SystemPage() {
  const session = await requireAdmin();

  // Get system statistics
  const [
    userStats,
    jobStats,
    applicationStats,
    verificationStats,
    reviewStats,
    notificationStats,
    systemHealth,
    recentActivity,
    errorLogs
  ] = await Promise.all([
    // User statistics
    query`
      SELECT 
        role,
        COUNT(*) as _count
      FROM "User"
      GROUP BY role
      ORDER BY _count DESC
    `,
    
    // Job statistics by status
    query`
      SELECT 
        status,
        COUNT(*) as _count,
        COALESCE(AVG(budget), 0) as _avg_budget
      FROM "Job"
      GROUP BY status
    `,
    
    // Application statistics by status
    query`
      SELECT 
        status,
        COUNT(*) as _count
      FROM "Application"
      GROUP BY status
    `,
    
    // Verification statistics
    query`
      SELECT 
        status,
        COUNT(*) as _count
      FROM "Verification"
      GROUP BY status
    `,
    
    // Review statistics
    query('SELECT COUNT(*) as _count, COALESCE(AVG(rating), 0) as _avg_rating, COALESCE(MIN(rating), 0) as _min_rating, COALESCE(MAX(rating), 0) as _max_rating FROM "Review"')
      .then(r => ({
        _count: { id: parseInt(r.rows[0]._count) },
        _avg: { rating: parseFloat(r.rows[0]._avg_rating) },
        _min: { rating: parseFloat(r.rows[0]._min_rating) },
        _max: { rating: parseFloat(r.rows[0]._max_rating) }
      })),
    
    // Notification statistics
    query`
      SELECT 
        read,
        COUNT(*) as _count
      FROM "Notification"
      GROUP BY read
    `,
    
    // System health metrics
    query`
      SELECT 
        (SELECT COUNT(*) FROM "User" WHERE "createdAt" >= NOW() - INTERVAL '24 hours') as new_users_today,
        (SELECT COUNT(*) FROM "Job" WHERE "createdAt" >= NOW() - INTERVAL '24 hours') as new_jobs_today,
        (SELECT COUNT(*) FROM "Application" WHERE "createdAt" >= NOW() - INTERVAL '24 hours') as new_applications_today,
        (SELECT COUNT(*) FROM "User" WHERE "createdAt" >= NOW() - INTERVAL '7 days') as new_users_week,
        (SELECT COUNT(*) FROM "Job" WHERE "createdAt" >= NOW() - INTERVAL '7 days') as new_jobs_week,
        (SELECT COUNT(*) FROM "Application" WHERE "createdAt" >= NOW() - INTERVAL '7 days') as new_applications_week,
        (SELECT COUNT(*) FROM "User" WHERE "createdAt" >= NOW() - INTERVAL '30 days') as new_users_month,
        (SELECT COUNT(*) FROM "Job" WHERE "createdAt" >= NOW() - INTERVAL '30 days') as new_jobs_month,
        (SELECT COUNT(*) FROM "Application" WHERE "createdAt" >= NOW() - INTERVAL '30 days') as new_applications_month
    `,
    
    // Recent system activity
    query`
      SELECT 
        'USER_CREATED' as type,
        u.name,
        u.role,
        u."createdAt"
      FROM "User" u
      WHERE u."createdAt" >= NOW() - INTERVAL '24 hours'
      
      UNION ALL
      
      SELECT 
        'JOB_CREATED' as type,
        j.title,
        j.category,
        j."createdAt"
      FROM "Job" j
      WHERE j."createdAt" >= NOW() - INTERVAL '24 hours'
      
      UNION ALL
      
      SELECT 
        'APPLICATION_SUBMITTED' as type,
        w.name,
        j.title,
        a."createdAt"
      FROM "Application" a
      JOIN "User" w ON a."workerId" = w.id
      JOIN "Job" j ON a."jobId" = j.id
      WHERE a."createdAt" >= NOW() - INTERVAL '24 hours'
      
      ORDER BY "createdAt" DESC
      LIMIT 20
    `,
    
    // Simulated error logs (in a real app, these would come from a logging system)
    Promise.resolve([
      { level: 'ERROR', message: 'Database connection timeout', timestamp: new Date(), count: 3 },
      { level: 'WARNING', message: 'High memory usage detected', timestamp: new Date(), count: 1 },
      { level: 'INFO', message: 'System backup completed', timestamp: new Date(), count: 1 }
    ])
  ]);

  const health = Array.isArray(systemHealth) ? systemHealth[0] : systemHealth;

  return (
    <SystemMonitoring 
      session={session}
      data={{
        userStats,
        jobStats,
        applicationStats,
        verificationStats,
        reviewStats,
        notificationStats,
        systemHealth: health,
        recentActivity,
        errorLogs
      }}
    />
  );
}
