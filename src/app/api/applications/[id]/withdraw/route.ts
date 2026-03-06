import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "WORKER") {
      return NextResponse.json({ error: "Only workers can withdraw applications" }, { status: 403 });
    }

    const { id: applicationId } = await params;

    // Get the worker user ID
    const worker = await prisma.user.findUnique({
      where: { phone: session.user.phone },
      select: { id: true }
    });

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    // Find the application and verify it belongs to this worker
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            status: true
          }
        }
      }
    });

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
    if (application.job.status !== "OPEN") {
      return NextResponse.json({ 
        error: "Cannot withdraw application for a closed job" 
      }, { status: 400 });
    }

    // Delete the application
    await prisma.application.delete({
      where: { id: applicationId }
    });

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
