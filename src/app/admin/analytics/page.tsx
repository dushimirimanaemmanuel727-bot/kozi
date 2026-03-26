import { requireAdmin } from "@/lib/admin-middleware";
import { query } from "@/lib/db";
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
    query`
      SELECT 
        DATE_TRUNC('month', "createdat") as month,
        COUNT(*) as users,
        COUNT(CASE WHEN role = 'worker' THEN 1 END) as workers,
        COUNT(CASE WHEN role = 'employer' THEN 1 END) as employers
      FROM "User" 
      WHERE "createdat" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdat")
      ORDER BY month DESC
    `,
    
    // Job statistics by month
    query`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as posted,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed
      FROM "Job" 
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `,
    
    // Application trends by month
    query`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as applications,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
      FROM "Application" 
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `,
    
    // Job categories distribution
    query`
      SELECT 
        category,
        COUNT(*) as _count
      FROM "Job"
      GROUP BY category
      ORDER BY _count DESC
    `,
    
    // District distribution
    query`
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
    query`
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
    query`
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
      query('SELECT COUNT(*) as count FROM "User"').then(r => parseInt(r.rows[0].count)),
      query('SELECT COUNT(*) as count FROM "Job"').then(r => parseInt(r.rows[0].count)),
      query('SELECT COUNT(*) as count FROM "Application"').then(r => parseInt(r.rows[0].count)),
      query('SELECT COUNT(*) as count FROM "Review"').then(r => parseInt(r.rows[0].count)),
      query('SELECT COALESCE(AVG(rating), 0) as avg_rating FROM "Review"').then(r => parseFloat(r.rows[0].avg_rating)),
      query('SELECT COUNT(*) as count FROM "Verification" WHERE status = $1', ['PENDING']).then(r => parseInt(r.rows[0].count)),
      query('SELECT COUNT(*) as count FROM "User" WHERE "createdAt" >= NOW() - INTERVAL \'7 days\'').then(r => parseInt(r.rows[0].count)),
      query('SELECT COUNT(*) as count FROM "Job" WHERE "createdAt" >= NOW() - INTERVAL \'7 days\'').then(r => parseInt(r.rows[0].count))
    ]).then(([totalUsers, totalJobs, totalApplications, totalReviews, avgRating, pendingVerifications, newUsersWeek, newJobsWeek]) => ({
      totalUsers,
      totalJobs,
      totalApplications,
      totalReviews,
      avgRating: avgRating || 0,
      pendingVerifications,
      newUsersThisWeek: newUsersWeek,
      newJobsThisWeek: newJobsWeek
    }))
  ]);

  return (
    <AdminAnalytics
      session={session}
      data={{
        userGrowth: userGrowthData.rows,
        jobStats: jobStatsData.rows,
        applicationTrends: applicationTrends.rows,
        categories: categoryData.rows,
        districts: districtData.rows,
        revenue: monthlyRevenue.rows,
        userActivity: userActivityData.rows,
        metrics: systemMetrics
      }}
    />
  );
}
