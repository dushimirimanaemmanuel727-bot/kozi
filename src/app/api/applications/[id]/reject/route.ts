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

    if (session.user.role?.toUpperCase() !== "EMPLOYER") {
      return NextResponse.json({ error: "Only employers can reject applications" }, { status: 403 });
    }

    // Get employer user ID from session phone
    const employerResult = await query('SELECT id FROM "User" WHERE phone = $1', [session.user.phone]);
    const employer = employerResult.rows[0];

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 });
    }

    // Get the application and verify ownership
    const applicationResult = await query(`
      SELECT a.id, a.status, j."employerId" 
      FROM "Application" a
      JOIN "Job" j ON a."jobId" = j.id
      WHERE a.id = $1
    `, [applicationId]);
    
    const application = applicationResult.rows[0];

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.employerId !== employer.id) {
      return NextResponse.json({ error: "Not authorized to reject this application" }, { status: 403 });
    }

    if (application.status !== "PENDING") {
      return NextResponse.json({ error: "Application is not pending" }, { status: 400 });
    }

    // Update application status
    const updatedResult = await query(`
      UPDATE "Application" 
      SET status = 'REJECTED', "updatedAt" = NOW()
      WHERE id = $1
      RETURNING *
    `, [applicationId]);
    
    const updatedApplication = updatedResult.rows[0];

    return NextResponse.json({ 
      message: "Application rejected successfully",
      application: updatedApplication
    });

  } catch (error) {
    console.error("Reject application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
