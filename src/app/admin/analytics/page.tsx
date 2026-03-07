import { requireAdmin } from "@/lib/admin-middleware";
import { prisma } from "@/lib/prisma";
import { AdminAnalytics } from "@/components/admin/admin-analytics";

export default async function AnalyticsPage() {
  const session = await requireAdmin();

  // Get analytics data
  const [
    userGrowthData,
    jobStatsData,
    applicationTrends,
    categoryData,
    districtData,
    monthlyRevenue,
    userActivityData,
    systemMetrics
  ] = await Promise.all([
    // User growth over last 6 months - group by month
    prisma.$queryRaw<any[]>`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as users,
        COUNT(CASE WHEN role = 'WORKER' THEN 1 END) as workers,
        COUNT(CASE WHEN role = 'EMPLOYER' THEN 1 END) as employers
      FROM "User" 
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `,
    
    // Job statistics by month
    prisma.$queryRaw<any[]>`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as posted,
        COUNT(CASE WHEN status = 'OPEN' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'CLOSED' THEN 1 END) as closed
      FROM "Job" 
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `,
    
    // Application trends by month
    prisma.$queryRaw<any[]>`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as applications,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) as accepted,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected
      FROM "Application" 
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `,
    
    // Job categories distribution
    prisma.job.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    }),
    
    // District distribution
    prisma.$queryRaw<any[]>`
      SELECT 
        district,
        COUNT(*) as count
      FROM "User" 
      WHERE district IS NOT NULL
      GROUP BY district
      ORDER BY count DESC
      LIMIT 10
    `,
    
    // Monthly revenue estimation from job budgets
    prisma.$queryRaw<any[]>`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COALESCE(SUM(budget), 0) as estimated_revenue
      FROM "Job" 
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        AND budget IS NOT NULL
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `,
    
    // User activity - last 30 days grouped by day
    prisma.$queryRaw<any[]>`
      SELECT 
        DATE_TRUNC('day', "createdAt") as day,
        COUNT(*) as new_users
      FROM "User" 
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY day DESC
    `,
    
    // System metrics using separate queries
    Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.review.count(),
      prisma.review.aggregate({ _avg: { rating: true } }),
      prisma.verification.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ 
        where: { 
          createdAt: { 
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
          } 
        } 
      }),
      prisma.job.count({ 
        where: { 
          createdAt: { 
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
          } 
        } 
      })
    ]).then(([totalUsers, totalJobs, totalApplications, totalReviews, avgRatingResult, pendingVerifications, newUsersWeek, newJobsWeek]) => ({
      totalUsers,
      totalJobs,
      totalApplications,
      totalReviews,
      avgRating: avgRatingResult._avg.rating || 0,
      pendingVerifications,
      newUsersThisWeek: newUsersWeek,
      newJobsThisWeek: newJobsWeek
    }))
  ]);

  return (
    <AdminAnalytics
      session={session}
      data={{
        userGrowth: userGrowthData,
        jobStats: jobStatsData,
        applicationTrends: applicationTrends,
        categories: categoryData,
        districts: districtData,
        revenue: monthlyRevenue,
        userActivity: userActivityData,
        metrics: systemMetrics
      }}
    />
  );
}
