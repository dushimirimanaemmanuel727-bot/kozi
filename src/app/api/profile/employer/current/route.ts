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
      return NextResponse.json({ error: "Not an employer" }, { status: 403 });
    }

    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            district: true
          }
        }
      }
    });

    if (!employerProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get additional stats
    const jobCount = await prisma.job.count({
      where: { employerId: session.user.id }
    });

    const applicationCount = await prisma.application.count({
      where: {
        job: { employerId: session.user.id }
      }
    });

    const hiredCount = await prisma.application.count({
      where: {
        job: { employerId: session.user.id },
        status: "ACCEPTED"
      }
    });

    const recentJobs = await prisma.job.findMany({
      where: { employerId: session.user.id },
      select: {
        title: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    return NextResponse.json({
      ...employerProfile,
      jobCount,
      applicationCount,
      hiredCount,
      recentJobs
    });

  } catch (error) {
    console.error("Get employer profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
