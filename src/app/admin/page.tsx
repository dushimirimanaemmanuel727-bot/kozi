import { requireAdmin } from "@/lib/admin-middleware";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  const session = await requireAdmin();

  // Fetch dashboard statistics
  const [
    totalUsers,
    totalJobs,
    totalApplications,
    pendingVerifications,
    recentUsers,
    activeJobs,
    workers,
    employers,
    openJobs,
    pendingApplications,
    totalReviews,
    avgRatingResult,
    // Previous month data for trends
    prevMonthUsers,
    prevMonthJobs,
    prevMonthApplications,
    prevMonthVerifications
  ] = await Promise.all([
    // Current data
    prisma.user.count(),
    prisma.job.count(),
    prisma.application.count(),
    prisma.verification.count({ where: { status: "PENDING" } }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        employerProfile: { select: { organization: true } },
        workerProfile: { select: { category: true } }
      }
    }),
    prisma.job.findMany({
      take: 5,
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      include: {
        employer: { select: { name: true } },
        applications: { select: { id: true } }
      }
    }),
    // Get system statistics using separate queries for better compatibility
    prisma.user.count({ where: { role: 'WORKER' } }),
    prisma.user.count({ where: { role: 'EMPLOYER' } }),
    prisma.job.count({ where: { status: 'OPEN' } }),
    prisma.application.count({ where: { status: 'PENDING' } }),
    prisma.review.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),
    // Previous month data for trend calculations
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    }),
    prisma.job.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    }),
    prisma.application.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    }),
    prisma.verification.count({
      where: {
        issuedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })
  ]);

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const userTrend = calculateTrend(totalUsers, prevMonthUsers);
  const jobTrend = calculateTrend(totalJobs, prevMonthJobs);
  const applicationTrend = calculateTrend(totalApplications, prevMonthApplications);
  const verificationTrend = calculateTrend(pendingVerifications, prevMonthVerifications);

  return (
    <AdminDashboard
      session={session}
      stats={{
        totalUsers,
        totalJobs,
        totalApplications,
        pendingVerifications,
        workers,
        employers,
        openJobs,
        pendingApplications,
        totalReviews,
        avgRating: avgRatingResult._avg.rating || 0
      }}
      trends={{
        userTrend,
        jobTrend,
        applicationTrend,
        verificationTrend
      }}
      recentUsers={recentUsers}
      activeJobs={activeJobs}
    />
  );
}
