import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const employer = await prisma.user.findUnique({
      where: { phone: session.user.phone },
      select: { id: true }
    });

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 });
    }

    const applications = await prisma.application.findMany({
      where: {
        job: {
          employerId: employer.id
        }
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            category: true,
            description: true,
            budget: true,
            district: true,
            status: true
          }
        },
        worker: {
          include: {
            workerProfile: {
              select: {
                category: true,
                experienceYears: true,
                rating: true,
                reviewCount: true,
                photoUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Add isClosed flag for new applications
    const applicationsWithStatus = applications.map(app => ({
      ...app,
      isClosed: app.status === "PENDING" && app.job.status === "CLOSED"
    }));

    return NextResponse.json(applicationsWithStatus);

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

    if (session.user?.role !== "WORKER") {
      return NextResponse.json({ error: "Only workers can apply for jobs" }, { status: 403 });
    }

    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Get the worker user ID
    const worker = await prisma.user.findUnique({
      where: { phone: session.user.phone },
      select: { id: true }
    });

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, employerId: true }
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_workerId: {
          jobId: jobId,
          workerId: worker.id
        }
      }
    });

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied for this job" }, { status: 400 });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId: jobId,
        workerId: worker.id,
        status: "PENDING"
      },
      include: {
        job: {
          select: {
            title: true,
            category: true
          }
        }
      }
    });

    // Create notification for the employer
    try {
      // Get worker details for notification
      const workerDetails = await prisma.user.findUnique({
        where: { id: worker.id },
        select: { name: true }
      });

      if (workerDetails) {
        await prisma.notification.create({
          data: {
            userId: job.employerId,
            title: "New Job Application! 📋",
            message: `${workerDetails.name} has applied for your position: ${application.job?.title || "Job"}`,
            type: "APPLICATION"
          }
        });
      }
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
