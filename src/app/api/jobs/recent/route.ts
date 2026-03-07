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
    
    // Fallback to mock data if database fails
    const fallbackLimit = parseInt(new URL(req.url).searchParams.get("limit") || "6");
    const mockJobs = [
      {
        id: "1",
        title: "Live-in nanny for 2-year-old",
        category: "Childcare",
        description: "Looking for an experienced nanny to care for our 2-year-old child. Live-in position with private room provided.",
        budget: 180000,
        district: "Kigali",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        deadline: null,
        employerName: "Acme Family",
        organizationName: "Acme Family"
      },
      {
        id: "2", 
        title: "Housekeeper for Family Home",
        category: "Housekeeping",
        description: "Need a reliable housekeeper for daily cleaning and maintenance of a 4-bedroom family home.",
        budget: 120000,
        district: "Nyarugenge",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        deadline: null,
        employerName: "Johnson Family",
        organizationName: "Johnson Family"
      },
      {
        id: "3",
        title: "Cook for Family of 4",
        category: "Cooking", 
        description: "Seeking a skilled cook to prepare daily meals for a family of 4. Experience with Rwandan cuisine required.",
        budget: 150000,
        district: "Kicukiro",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        deadline: null,
        employerName: "Mukamana Family",
        organizationName: "Mukamana Family"
      },
      {
        id: "4",
        title: "Elderly Care Assistant",
        category: "Elderly Care",
        description: "Looking for a compassionate caregiver to assist with elderly care including medication reminders and companionship.",
        budget: 160000,
        district: "Gasabo",
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        deadline: null,
        employerName: "Care Home Services",
        organizationName: "Care Home Services"
      }
    ];

    const limitedJobs = mockJobs.slice(0, fallbackLimit);

    return NextResponse.json({
      jobs: limitedJobs,
      total: limitedJobs.length
    });
  }
}
