import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

interface RecentApplicationRow {
  id: string;
  status: string;
  createdAt: string;
  job_title: string;
  job_id: string;
  worker_name: string;
  photourl?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get employer user ID
    const employerResult = await query('SELECT id FROM "User" WHERE phone = $1', [session.user.phone]);
    const employer = employerResult.rows[0];

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 });
    }

    // Get statistics using raw SQL
    const [
      activeJobsResult,
      pendingAppsResult,
      workersHiredResult,
      recentAppsResult,
      recentJobsResult
    ] = await Promise.all([
      query('SELECT COUNT(*) as count FROM "Job" WHERE employerid = $1 AND status = \'active\'', [employer.id]),
      query('SELECT COUNT(*) as count FROM "Application" a JOIN "Job" j ON a.jobid = j.id WHERE j.employerid = $1 AND a.status = \'pending\'', [employer.id]),
      query('SELECT COUNT(*) as count FROM "Application" a JOIN "Job" j ON a.jobid = j.id WHERE j.employerid = $1 AND a.status = \'accepted\'', [employer.id]),
      query(`
        SELECT a.id, a.status, a.appliedat as "createdAt", j.title as job_title, j.id as job_id, u.name as worker_name, wp.photourl
        FROM "Application" a
        JOIN "Job" j ON a.jobid = j.id
        JOIN "User" u ON a.workerid = u.id
        LEFT JOIN "WorkerProfile" wp ON u.id = wp.userid
        WHERE j.employerid = $1
        ORDER BY a.appliedat DESC LIMIT 5
      `, [employer.id]),
      query('SELECT * FROM "Job" WHERE employerid = $1 ORDER BY createdat DESC LIMIT 5', [employer.id])
    ]);

    const activeJobs = parseInt(activeJobsResult.rows[0].count);
    const pendingApplications = parseInt(pendingAppsResult.rows[0].count);
    const workersHired = parseInt(workersHiredResult.rows[0].count);
    
    const recentApplications = recentAppsResult.rows.map((row: RecentApplicationRow) => ({
      ...row,
      job: { title: row.job_title, id: row.job_id },
      worker: { name: row.worker_name, workerProfile: { photoUrl: row.photourl } }
    }));
    
    const recentJobs = recentJobsResult.rows;

    return NextResponse.json({
      activeJobs,
      pendingApplications,
      workersHired,
      recentApplications,
      recentJobs
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
