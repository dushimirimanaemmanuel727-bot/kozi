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
      return NextResponse.json({ error: "Only employers can access these stats" }, { status: 403 });
    }

    // Get employer user ID
    const employerResult = await query('SELECT id FROM "User" WHERE phone = $1', [session.user.phone]);
    const employer = employerResult.rows[0];

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 });
    }

    // Get stats using raw SQL
    const [
      activeJobsResult,
      pendingAppsResult,
      workersHiredResult
    ] = await Promise.all([
      query('SELECT COUNT(*) as count FROM "Job" WHERE "employerId" = $1 AND status = \'active\'', [employer.id]),
      query('SELECT COUNT(*) as count FROM "Application" a JOIN "Job" j ON a."jobId" = j.id WHERE j."employerId" = $1 AND a.status = \'pending\'', [employer.id]),
      query('SELECT COUNT(*) as count FROM "Application" a JOIN "Job" j ON a."jobId" = j.id WHERE j."employerId" = $1 AND a.status = \'accepted\'', [employer.id])
    ]);

    return NextResponse.json({
      activeJobs: parseInt(activeJobsResult.rows[0].count),
      pendingApplications: parseInt(pendingAppsResult.rows[0].count),
      workersHired: parseInt(workersHiredResult.rows[0].count)
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
