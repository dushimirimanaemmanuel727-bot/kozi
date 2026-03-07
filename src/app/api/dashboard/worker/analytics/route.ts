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

    const applicationsTrend = await prisma.application.findMany({
      where: {
        workerId: worker.id,
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by month for trend data
    const trendByMonth = applicationsTrend.reduce((acc: any[], app) => {
      const month = new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const existingMonth = acc.find(item => item.month === month);
      if (existingMonth) {
        existingMonth.count += 1;
      } else {
        acc.push({ month, count: 1 });
      }
      return acc;
    }, []);

    // Get recommended jobs (matching worker's skills and location)
    const workerProfile = await prisma.workerProfile.findUnique({
      where: {
        userId: worker.id
      },
      select: {
        category: true,
        skills: true
      }
    });

    // Get worker's district from user table
    const workerUser = await prisma.user.findUnique({
      where: {
        id: worker.id
      },
      select: {
        district: true
      }
    });

    let recommendedJobs: Array<{
      id: string;
      title: string;
      category: string;
      budget?: number | null;
      district: string | null;
      employer: {
        name: string;
      };
      _count: {
        applications: number;
      };
    }> = [];
    if (workerProfile) {
      recommendedJobs = await prisma.job.findMany({
        where: {
          status: "OPEN",
          OR: [
            {
              category: workerProfile.category
            },
            {
              district: workerUser?.district
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
      applicationsTrend: trendByMonth,
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
      { 
        error: "Failed to fetch analytics data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
