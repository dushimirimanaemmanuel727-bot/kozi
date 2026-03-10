import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Only employers can view applications" }, { status: 403 });
    }

    // Get employer user ID from session phone
    const employerResult = await query('SELECT id FROM "User" WHERE phone = $1', [session.user.phone]);
    const employer = employerResult.rows[0];

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 });
    }

    const applicationsResult = await query(
      `SELECT 
        a.id, a."jobId", a."workerId", a.status, a."createdAt", a."updatedAt",
        j.id as job_id, j.title as job_title, j.category as job_category, 
        j.description as job_description, j.budget as job_budget, 
        j.district as job_district, j.status as job_status,
        u.id as worker_id, u.name as worker_name, u.phone as worker_phone,
        wp.category as worker_category, wp."experienceYears" as worker_experience,
        wp.rating as worker_rating, wp."reviewCount" as worker_reviews,
        wp."photoUrl" as worker_photo
      FROM "Application" a
      JOIN "Job" j ON a."jobId" = j.id
      JOIN "User" u ON a."workerId" = u.id
      LEFT JOIN "WorkerProfile" wp ON u.id = wp."userId"
      WHERE j."employerId" = $1
      ORDER BY a."createdAt" DESC`,
      [employer.id]
    );

    const applications = applicationsResult.rows.map((row: any) => ({
      id: row.id,
      jobId: row.jobId,
      workerId: row.workerId,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      job: {
        id: row.job_id,
        title: row.job_title,
        category: row.job_category,
        description: row.job_description,
        budget: row.job_budget,
        district: row.job_district,
        status: row.job_status
      },
      worker: {
        id: row.worker_id,
        name: row.worker_name,
        phone: row.worker_phone,
        workerProfile: {
          category: row.worker_category,
          experienceYears: row.worker_experience,
          rating: row.worker_rating,
          reviewCount: row.worker_reviews,
          photoUrl: row.worker_photo
        }
      },
      isClosed: row.status === "PENDING" && row.job_status === "CLOSED"
    }));

    return NextResponse.json(applications);

  } catch (error) {
    console.error("Applications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role?.toUpperCase() !== "WORKER") {
      return NextResponse.json({ error: "Only workers can apply for jobs" }, { status: 403 });
    }

    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Get the worker user ID
    const workerResult = await query('SELECT id, name FROM "User" WHERE phone = $1', [session.user.phone]);
    const worker = workerResult.rows[0];

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    // Check if job exists
    const jobResult = await query('SELECT id, "employerId", title FROM "Job" WHERE id = $1', [jobId]);
    const job = jobResult.rows[0];

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if already applied
    const existingAppResult = await query(
      'SELECT id FROM "Application" WHERE "jobId" = $1 AND "workerId" = $2',
      [jobId, worker.id]
    );

    if (existingAppResult.rows.length > 0) {
      return NextResponse.json({ error: "You have already applied for this job" }, { status: 400 });
    }

    // Create application
    const applicationId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const createResult = await query(
      `INSERT INTO "Application" (id, "jobId", "workerId", status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, 'PENDING', NOW(), NOW())
       RETURNING *`,
      [applicationId, jobId, worker.id]
    );
    const application = createResult.rows[0];

    // Create notification for the employer
    try {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await query(
        `INSERT INTO "Notification" (id, "userId", title, message, type, read, "createdAt")
         VALUES ($1, $2, $3, $4, 'APPLICATION', false, NOW())`,
        [
          notificationId,
          job.employerId,
          "New Job Application! 📋",
          `${worker.name} has applied for your position: ${job.title || "Job"}`
        ]
      );
    } catch (notificationError) {
      console.error("Failed to send application notification:", notificationError);
      // Don't fail the application if notification fails
    }

    return NextResponse.json({ 
      message: "Application submitted successfully",
      application 
    });

  } catch (error) {
    console.error("Application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
