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

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role?.toUpperCase() !== "WORKER") {
      return NextResponse.json({ error: "Only workers can withdraw applications" }, { status: 403 });
    }

    const { id: applicationId } = await params;

    // Get the worker user ID
    const workerResult = await query('SELECT id FROM "User" WHERE phone = $1', [session.user.phone]);
    const worker = workerResult.rows[0];

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    // Find the application and verify it belongs to this worker
    const applicationResult = await query(`
      SELECT a.id, a.status, a."workerId", j.status as job_status
      FROM "Application" a
      JOIN "Job" j ON a."jobId" = j.id
      WHERE a.id = $1
    `, [applicationId]);
    
    const application = applicationResult.rows[0];

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.workerId !== worker.id) {
      return NextResponse.json({ error: "Unauthorized to withdraw this application" }, { status: 403 });
    }

    // Check if application can be withdrawn (only PENDING status)
    if (application.status !== "PENDING") {
      return NextResponse.json({ 
        error: "Cannot withdraw application that has been reviewed" 
      }, { status: 400 });
    }

    // Check if the job is still open
    if (application.job_status !== "ACTIVE") {
      return NextResponse.json({ 
        error: "Cannot withdraw application for a closed job" 
      }, { status: 400 });
    }

    // Delete the application
    await query('DELETE FROM "Application" WHERE id = $1', [applicationId]);

    return NextResponse.json({ 
      message: "Application withdrawn successfully" 
    });

  } catch (error) {
    console.error("Withdraw application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
