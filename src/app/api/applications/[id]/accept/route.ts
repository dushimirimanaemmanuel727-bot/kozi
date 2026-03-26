import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: applicationId } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Only employers can accept applications" }, { status: 403 });
    }

    // Get employer user ID from session phone
    const employerResult = await query(
      `SELECT id FROM "User" WHERE phone = $1`,
      [session.user.phone]
    );
    const employer = employerResult.rows[0];

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 });
    }

    // Get the application and verify ownership
    const applicationResult = await query(
      `SELECT 
        a.id, a.status, a."workerId",
        j.id as "jobId", j."employerId", j.title as "jobTitle"
       FROM "Application" a 
       JOIN "Job" j ON a."jobId" = j.id 
       WHERE a.id = $1`,
      [applicationId]
    );
    const application = applicationResult.rows[0];

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.employerId !== employer.id) {
      return NextResponse.json({ error: "Not authorized to accept this application" }, { status: 403 });
    }

    if (application.status !== "PENDING") {
      return NextResponse.json({ error: "Application is not pending" }, { status: 400 });
    }

    // Update application status
    const updatedApplicationResult = await query(
      `UPDATE "Application" SET status = 'ACCEPTED' WHERE id = $1 RETURNING *`,
      [applicationId]
    );
    const updatedApplication = updatedApplicationResult.rows[0];

    // Create notification for worker
    await query(
      `INSERT INTO "Notification" (id, "userId", title, message, type, "read", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        crypto.randomUUID(),
        application.workerId,
        'Application Accepted! 🎉',
        `Your application for "${application.jobTitle || "a position"}" has been accepted! Contact the employer to discuss next steps.`,
        'SUCCESS',
        false,
        new Date()
      ]
    );

    return NextResponse.json({ 
      message: "Application accepted successfully",
      application: updatedApplication
    });

  } catch (error) {
    console.error("Accept application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
