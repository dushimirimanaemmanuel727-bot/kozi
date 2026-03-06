import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "WORKER") {
      return NextResponse.json({ error: "Only workers can access these analytics" }, { status: 403 });
    }

    // Get worker user ID
    const worker = await prisma.user.findUnique({
      where: { phone: session.user.phone },
      select: { id: true }
    });

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    // Get application status distribution
    const applicationStatusDistribution = await prisma.application.groupBy({
      by: ['status'],
      where: {
        workerId: worker.id
      },
      _count: {
        id: true
      }
    });

    // Get applications trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const applicationsTrend = await prisma.application.groupBy({
      by: ['createdAt'],
      where: {
        workerId: worker.id,
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Get recommended jobs (matching worker's skills and location)
    const workerProfile = await prisma.workerProfile.findUnique({
      where: {
        userId: worker.id
      },
      select: {
        category: true,
        skills: true,
        district: true
      }
    });

    let recommendedJobs = [];
    if (workerProfile) {
      recommendedJobs = await prisma.job.findMany({
        where: {
          status: "OPEN",
          OR: [
            {
              category: workerProfile.category
            },
            {
              district: workerProfile.district
            }
          ]
        },
        include: {
          employer: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 6
      });
    }

    // Get recent applications (last 5)
    const recentApplications = await prisma.application.findMany({
      where: {
        workerId: worker.id
      },
      include: {
        job: {
          include: {
            employer: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // Get application success rate
    const totalApplications = await prisma.application.count({
      where: {
        workerId: worker.id
      }
    });

    const acceptedApplications = await prisma.application.count({
      where: {
        workerId: worker.id,
        status: "ACCEPTED"
      }
    });

    const successRate = totalApplications > 0 ? (acceptedApplications / totalApplications) * 100 : 0;

    return NextResponse.json({
      applicationStatusDistribution,
      applicationsTrend,
      recommendedJobs,
      recentApplications,
      stats: {
        totalApplications,
        acceptedApplications,
        successRate: Math.round(successRate * 100) / 100
      }
    });

  } catch (error) {
    console.error("Worker dashboard analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
