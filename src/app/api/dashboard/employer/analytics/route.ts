import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "employer") {
      return NextResponse.json({ error: "Only employers can access these analytics" }, { status: 403 });
    }

    // Get employer user ID
    const employerResult = await query('SELECT id FROM "User" WHERE phone = $1', [session.user.phone]);
    const employer = employerResult.rows[0];

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 });
    }

    // Get job postings trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const jobPostingsTrendResult = await query(`
      SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count
      FROM "Job"
      WHERE "employerId" = $1 AND "createdAt" >= $2
      GROUP BY month
      ORDER BY month ASC
    `, [employer.id, sixMonthsAgo]);
    const jobPostingsTrend = jobPostingsTrendResult.rows;

    // Get applications trend (last 6 months)
    const applicationsTrendResult = await query(`
      SELECT DATE_TRUNC('month', a."createdAt") as month, COUNT(*) as count
      FROM "Application" a
      JOIN "Job" j ON a."jobId" = j.id
      WHERE j."employerId" = $1 AND a."createdAt" >= $2
      GROUP BY month
      ORDER BY month ASC
    `, [employer.id, sixMonthsAgo]);
    const applicationsTrend = applicationsTrendResult.rows;

    // Get job category distribution
    const categoryDistributionResult = await query(`
      SELECT category, COUNT(*) as count
      FROM "Job"
      WHERE "employerId" = $1
      GROUP BY category
    `, [employer.id]);
    const categoryDistribution = categoryDistributionResult.rows;

    // Get recent applications (last 5)
    const recentApplicationsResult = await query(`
      SELECT 
        a.id, a.status, a."createdAt",
        j.title as job_title, j.category as job_category,
        u.name as worker_name, wp."photoUrl" as worker_photo
      FROM "Application" a
      JOIN "Job" j ON a."jobId" = j.id
      JOIN "User" u ON a."workerId" = u.id
      LEFT JOIN "WorkerProfile" wp ON u.id = wp."userId"
      WHERE j."employerId" = $1
      ORDER BY a."createdAt" DESC
      LIMIT 5
    `, [employer.id]);
    const recentApplications = recentApplicationsResult.rows.map((row: any) => ({
      ...row,
      job: { title: row.job_title, category: row.job_category },
      worker: { name: row.worker_name, workerProfile: { photoUrl: row.worker_photo } }
    }));

    // Get popular job categories (most applications)
    const popularCategoriesResult = await query(`
      SELECT j.category, COUNT(a.id) as applications_count
      FROM "Job" j
      LEFT JOIN "Application" a ON j.id = a."jobId"
      WHERE j."employerId" = $1
      GROUP BY j.category
      ORDER BY applications_count DESC
      LIMIT 5
    `, [employer.id]);
    const popularCategories = popularCategoriesResult.rows;

    return NextResponse.json({
      jobPostingsTrend,
      applicationsTrend,
      categoryDistribution,
      recentApplications,
      popularCategories
    });

  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
