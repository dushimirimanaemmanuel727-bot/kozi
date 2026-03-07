import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get employer user ID
    const employer = await prisma.user.findUnique({
      where: { phone: session.user.phone },
      select: { id: true }
    });

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 });
    }

    // Get active jobs count
    const activeJobs = await prisma.job.count({
      where: {
        employerId: employer.id,
        status: "OPEN"
      }
    });

    // Get pending applications count
    const pendingApplications = await prisma.application.count({
      where: {
        job: {
          employerId: employer.id
        },
        status: "PENDING"
      }
    });

    // Get workers hired count (applications with ACCEPTED status)
    const workersHired = await prisma.application.count({
      where: {
        job: {
          employerId: employer.id
        },
        status: "ACCEPTED"
      }
    });

    // Get recent applications
    const recentApplications = await prisma.application.findMany({
      where: {
        job: {
          employerId: employer.id
        }
      },
      include: {
        job: {
          select: { title: true, id: true }
        },
        worker: {
          select: { name: true },
          include: {
            workerProfile: {
              select: { photoUrl: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    // Get recent jobs
    const recentJobs = await prisma.job.findMany({
      where: {
        employerId: employer.id
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

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
