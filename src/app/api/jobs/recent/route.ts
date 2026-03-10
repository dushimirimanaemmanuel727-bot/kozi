import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "6");

    console.log("Fetching recent jobs with limit:", limit);

    // Get recent open jobs with employer information
    const recentJobsResult = await query(`
      SELECT 
        j.id,
        j.title,
        j.category,
        j.description,
        j.budget,
        j.district,
        j."createdAt",
        j.deadline,
        u.name as employer_name,
        ep.organization as organization_name
      FROM "Job" j
      LEFT JOIN "User" u ON j."employerId" = u.id
      LEFT JOIN "EmployerProfile" ep ON u.id = ep."userId"
      WHERE j.status = 'active'
      ORDER BY j."createdAt" DESC
      LIMIT $1
    `, [limit]);

    console.log("Found jobs:", recentJobsResult.rows.length);

    // Format the jobs data and convert Decimal to number
    const formattedJobs = recentJobsResult.rows.map((job: any) => ({
      id: job.id,
      title: job.title,
      category: job.category,
      description: job.description,
      budget: job.budget ? Number(job.budget) : null,
      district: job.district,
      createdAt: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
      deadline: job.deadline ? new Date(job.deadline).toISOString() : null,
      employerName: job.employer_name || "Anonymous Employer",
      organizationName: job.organization_name
    }));

    console.log("Formatted jobs:", formattedJobs.length);

    return NextResponse.json({
      jobs: formattedJobs,
      total: formattedJobs.length
    });

  } catch (error: any) {
    console.error("Failed to fetch recent jobs:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch jobs",
        message: error.message || "Database error occurred"
      },
      { status: 500 }
    );
  }
}
