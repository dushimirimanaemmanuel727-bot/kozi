import { requireAdmin } from "@/lib/admin-middleware";
import { prisma } from "@/lib/prisma";
import { JobManagement } from "@/components/admin/job-management";

export default async function JobsPage() {
  const session = await requireAdmin();

  // Fetch jobs with employer and application data
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      employer: {
        select: { name: true, phone: true, email: true }
      },
      applications: {
        include: {
          worker: {
            select: { name: true, phone: true }
          }
        }
      },
      _count: {
        select: { applications: true }
      }
    }
  });

  // Get job statistics
  const jobStats = await prisma.$queryRaw<any[]>`
    SELECT 
      status,
      COUNT(*) as count,
      AVG(budget) as avg_budget
    FROM "Job" 
    GROUP BY status
  `;

  // Get category distribution
  const categoryStats = await prisma.job.groupBy({
    by: ['category'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });

  // Get recent activity
  const recentActivity = await prisma.$queryRaw<any[]>`
    SELECT 
      'JOB_POSTED' as type,
      j.title,
      j."createdAt",
      e.name as user_name
    FROM "Job" j
    JOIN "User" e ON j."employerId" = e.id
    WHERE j."createdAt" >= NOW() - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
      'APPLICATION_SUBMITTED' as type,
      j.title,
      a."createdAt",
      w.name as user_name
    FROM "Application" a
    JOIN "Job" j ON a."jobId" = j.id
    JOIN "User" w ON a."workerId" = w.id
    WHERE a."createdAt" >= NOW() - INTERVAL '7 days'
    
    ORDER BY "createdAt" DESC
    LIMIT 10
  `;

  return (
    <JobManagement 
      session={session}
      jobs={jobs}
      stats={jobStats}
      categoryStats={categoryStats}
      recentActivity={recentActivity}
    />
  );
}
