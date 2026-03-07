import { requireAdmin } from "@/lib/admin-middleware";
import { prisma } from "@/lib/prisma";
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
    prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    }),
    
    // Job statistics by status
    prisma.job.groupBy({
      by: ['status'],
      _count: { id: true },
      _avg: { budget: true }
    }),
    
    // Application statistics by status
    prisma.application.groupBy({
      by: ['status'],
      _count: { id: true }
    }),
    
    // Verification statistics
    prisma.verification.groupBy({
      by: ['status'],
      _count: { id: true }
    }),
    
    // Review statistics
    prisma.review.aggregate({
      _count: { id: true },
      _avg: { rating: true },
      _min: { rating: true },
      _max: { rating: true }
    }),
    
    // Notification statistics
    prisma.notification.groupBy({
      by: ['read'],
      _count: { id: true }
    }),
    
    // System health metrics
    prisma.$queryRaw`
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
    prisma.$queryRaw<any[]>`
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
