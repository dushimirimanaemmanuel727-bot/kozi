import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { Application, Job, User, WorkerProfile } from "@/types/database";

interface TrendRow {
  month: string;
  count: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "worker") {
      return NextResponse.json({ error: "Only workers can access these analytics" }, { status: 403 });
    }

    // Get worker user ID
    const workerResult = await query('SELECT id FROM "User" WHERE phone = $1', [session.user.phone]);
    const worker = workerResult.rows[0];

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    // Get application status distribution
    const statusDistributionResult = await query(
      'SELECT status, COUNT(*) as count FROM "Application" WHERE "workerId" = $1 GROUP BY status',
      [worker.id]
    );
    const applicationStatusDistribution = statusDistributionResult.rows;

    // Get applications trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trendResult = await query(
      `SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count 
       FROM "Application" 
       WHERE "workerId" = $1 AND "createdAt" >= $2
       GROUP BY month ORDER BY month ASC`,
      [worker.id, sixMonthsAgo]
    );
    const trendByMonth = trendResult.rows.map((row: TrendRow) => ({
      month: new Date(row.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count: parseInt(row.count)
    }));

    // Get worker profile for recommendations
    const workerProfileResult = await query(
      'SELECT category, skills FROM "WorkerProfile" WHERE "userId" = $1',
      [worker.id]
    );
    const workerProfile = workerProfileResult.rows[0];

    // Get worker's district
    const workerUserResult = await query('SELECT district FROM "User" WHERE id = $1', [worker.id]);
    const workerUser = workerUserResult.rows[0];

    let recommendedJobs: (Job & { employer_name: string; applications_count: string })[] = [];
    if (workerProfile) {
      const recommendedResult = await query(
        `SELECT j.*, u.name as employer_name, 
                (SELECT COUNT(*) FROM "Application" a WHERE a."jobId" = j.id) as applications_count
         FROM "Job" j
         JOIN "User" u ON j."employerId" = u.id
         WHERE j.status = 'active' AND (j.category = $1 OR j.district = $2)
         ORDER BY j."createdAt" DESC LIMIT 6`,
        [workerProfile.category, workerUser?.district]
      );
      recommendedJobs = recommendedResult.rows.map((row: Job & { employer_name: string; applications_count: string }) => ({
        ...row,
        employer: { name: row.employer_name },
        _count: { applications: parseInt(row.applications_count) }
      }));
    }

    // Get recent applications (last 5)
    const recentApplicationsResult = await query(
      `SELECT a.*, j.title as job_title, j.category as job_category, u.name as employer_name
       FROM "Application" a
       JOIN "Job" j ON a."jobId" = j.id
       JOIN "User" u ON j."employerId" = u.id
       WHERE a."workerId" = $1
       ORDER BY a."createdAt" DESC LIMIT 5`,
      [worker.id]
    );
    const recentApplications = recentApplicationsResult.rows.map((row: Application & { job_title: string; job_category: string; employer_name: string }) => ({
      ...row,
      job: { 
        title: row.job_title, 
        category: row.job_category,
        employer: { name: row.employer_name }
      }
    }));

    // Get stats
    const statsResult = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'ACCEPTED') as accepted
       FROM "Application" WHERE "workerId" = $1`,
      [worker.id]
    );
    const totalApplications = parseInt(statsResult.rows[0].total);
    const acceptedApplications = parseInt(statsResult.rows[0].accepted);
    const successRate = totalApplications > 0 ? (acceptedApplications / totalApplications) * 100 : 0;

    return NextResponse.json({
      applicationStatusDistribution,
      applicationsTrend: trendByMonth,
      recommendedJobs,
      recentApplications,
      stats: {
        totalApplications,
        acceptedApplications,
        successRate: Math.round(successRate * 100) / 100
      }
    });

  } catch (error: unknown) {
    console.error("Worker dashboard analytics error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch analytics data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
