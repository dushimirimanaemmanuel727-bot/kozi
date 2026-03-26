import { requireAdmin } from "@/lib/admin-middleware";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { query } from "@/lib/db";
import { User, Job } from "@/types/database";

export default async function AdminPage() {
  const session = await requireAdmin();

  // Fetch dashboard statistics using raw SQL
  const now = new Date();
  const firstOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsersResult,
    totalJobsResult,
    totalApplicationsResult,
    recentUsersResult,
    activeJobsResult,
    workersCountResult,
    employersCountResult,
    openJobsCountResult,
    pendingApplicationsCountResult,
    totalReviewsResult,
    avgRatingResult,
    // Previous month data for trends
    prevMonthUsersResult,
    prevMonthJobsResult,
    prevMonthApplicationsResult
  ] = await Promise.all([
    query('SELECT COUNT(*) as count FROM "User"'),
    query('SELECT COUNT(*) as count FROM "Job"'),
    query('SELECT COUNT(*) as count FROM "Application"'),
    query(`
      SELECT u.id, u.name, u.phone, u.role, u.createdat, 
             ep.companyname as organization, wp.category as category
      FROM "User" u
      LEFT JOIN "EmployerProfile" ep ON u.id = ep.userid
      LEFT JOIN "WorkerProfile" wp ON u.id = wp.userid
      ORDER BY u.createdat DESC LIMIT 5
    `),
    query(`
      SELECT j.id, j.title, j.status, j.createdat, e.name as employer_name,
             (SELECT COUNT(*) FROM "Application" a WHERE a.jobid = j.id) as application_count
      FROM "Job" j
      JOIN "User" e ON j.employerid = e.id
      WHERE j.status = 'active'
      ORDER BY j.createdat DESC LIMIT 5
    `),
    query('SELECT COUNT(*) as count FROM "User" WHERE role = \'worker\''),
    query('SELECT COUNT(*) as count FROM "User" WHERE role = \'employer\''),
    query('SELECT COUNT(*) as count FROM "Job" WHERE status = \'active\''),
    query('SELECT COUNT(*) as count FROM "Application" WHERE status = \'pending\''),
    query('SELECT COUNT(*) as count FROM "Review"'),
    query('SELECT AVG(rating) as avg_rating FROM "Review"'),
    query('SELECT COUNT(*) as count FROM "User" WHERE createdat >= $1 AND createdat < $2', [firstOfPrevMonth, firstOfCurrentMonth]),
    query('SELECT COUNT(*) as count FROM "Job" WHERE createdat >= $1 AND createdat < $2', [firstOfPrevMonth, firstOfCurrentMonth]),
    query('SELECT COUNT(*) as count FROM "Application" WHERE appliedat >= $1 AND appliedat < $2', [firstOfPrevMonth, firstOfCurrentMonth])
  ]);

  const totalUsers = parseInt(totalUsersResult.rows[0].count);
  const totalJobs = parseInt(totalJobsResult.rows[0].count);
  const totalApplications = parseInt(totalApplicationsResult.rows[0].count);
  const workers = parseInt(workersCountResult.rows[0].count);
  const employers = parseInt(employersCountResult.rows[0].count);
  const openJobs = parseInt(openJobsCountResult.rows[0].count);
  const pendingApplications = parseInt(pendingApplicationsCountResult.rows[0].count);
  const totalReviews = parseInt(totalReviewsResult.rows[0].count);
  const avgRating = parseFloat(avgRatingResult.rows[0].avg_rating || 0);

  const prevMonthUsers = parseInt(prevMonthUsersResult.rows[0].count);
  const prevMonthJobs = parseInt(prevMonthJobsResult.rows[0].count);
  const prevMonthApplications = parseInt(prevMonthApplicationsResult.rows[0].count);

  const recentUsers = recentUsersResult.rows.map((u: User & { organization?: string; category?: string }) => ({
    ...u,
    employerProfile: u.organization ? { organization: u.organization } : null,
    workerProfile: u.category ? { category: u.category } : null
  }));

  const activeJobs = activeJobsResult.rows.map((j: Job & { employer_name: string; application_count: string }) => ({
    ...j,
    employer: { name: j.employer_name },
    applications: new Array(parseInt(j.application_count)).fill({})
  }));

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const userTrend = calculateTrend(totalUsers, prevMonthUsers);
  const jobTrend = calculateTrend(totalJobs, prevMonthJobs);
  const applicationTrend = calculateTrend(totalApplications, prevMonthApplications);

  return (
    <AdminDashboard
      session={session}
      stats={{
        totalUsers,
        totalJobs,
        totalApplications,
        pendingVerifications: 0, // No verification table exists
        workers,
        employers,
        openJobs,
        pendingApplications,
        totalReviews,
        avgRating: avgRating
      }}
      trends={{
        userTrend,
        jobTrend,
        applicationTrend,
        verificationTrend: "0%" // No verification data available
      }}
      recentUsers={recentUsers}
      activeJobs={activeJobs}
    />
  );
}
