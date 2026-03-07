import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "6");

    // Get recent open jobs with employer information using Prisma client
    const recentJobs = await prisma.job.findMany({
      where: {
        status: 'OPEN'
      },
      include: {
        employer: {
          include: {
            employerProfile: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Format the jobs data
    const formattedJobs = recentJobs.map((job) => ({
      id: job.id,
      title: job.title,
      category: job.category,
      description: job.description,
      budget: job.budget,
      district: job.district,
      createdAt: job.createdAt.toISOString(),
      deadline: job.deadline ? job.deadline.toISOString() : null,
      employerName: job.employer.name || "Anonymous Employer",
      organizationName: job.employer.employerProfile?.organization
    }));

    return NextResponse.json({
      jobs: formattedJobs,
      total: formattedJobs.length
    });

  } catch (error) {
    console.error("Failed to fetch recent jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
