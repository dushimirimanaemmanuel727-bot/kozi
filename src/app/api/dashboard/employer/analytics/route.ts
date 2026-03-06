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

    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Only employers can access these analytics" }, { status: 403 });
    }

    // Get employer user ID
    const employer = await prisma.user.findUnique({
      where: { phone: session.user.phone },
      select: { id: true }
    });

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 });
    }

    // Get job postings trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const jobPostingsTrend = await prisma.job.groupBy({
      by: ['createdAt'],
      where: {
        employerId: employer.id,
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

    // Get applications trend (last 6 months)
    const applicationsTrend = await prisma.application.groupBy({
      by: ['createdAt'],
      where: {
        job: {
          employerId: employer.id
        },
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

    // Get job category distribution
    const categoryDistribution = await prisma.job.groupBy({
      by: ['category'],
      where: {
        employerId: employer.id
      },
      _count: {
        id: true
      }
    });

    // Get recent applications (last 5)
    const recentApplications = await prisma.application.findMany({
      where: {
        job: {
          employerId: employer.id
        }
      },
      include: {
        job: {
          select: {
            title: true,
            category: true
          }
        },
        worker: {
          include: {
            workerProfile: {
              select: {
                photoUrl: true
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

    // Get popular job categories (most applications)
    const popularCategories = await prisma.job.findMany({
      where: {
        employerId: employer.id
      },
      select: {
        category: true,
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        applications: {
          _count: 'desc'
        }
      },
      take: 5
    });

    return NextResponse.json({
      jobPostingsTrend,
      applicationsTrend,
      categoryDistribution,
      recentApplications,
      popularCategories
    });

  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
