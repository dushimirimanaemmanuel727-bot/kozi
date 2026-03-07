import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "6");

    console.log("Fetching recent jobs with limit:", limit);

    // Get recent open jobs with employer information
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

    console.log("Found jobs:", recentJobs.length);

    // Format the jobs data and convert Decimal to number
    const formattedJobs = recentJobs.map((job) => ({
      id: job.id,
      title: job.title,
      category: job.category,
      description: job.description,
      budget: job.budget ? Number(job.budget) : null,
      district: job.district,
      createdAt: job.createdAt.toISOString(),
      deadline: job.deadline ? job.deadline.toISOString() : null,
      employerName: job.employer.name || "Anonymous Employer",
      organizationName: job.employer.employerProfile?.organization
    }));

    console.log("Formatted jobs:", formattedJobs.length);

    return NextResponse.json({
      jobs: formattedJobs,
      total: formattedJobs.length
    });

  } catch (error: any) {
    console.error("Failed to fetch recent jobs:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch jobs",
        message: error.message || "Database error occurred"
      },
      { status: 500 }
    );
  }
}
