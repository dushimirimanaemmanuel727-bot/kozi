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
      return NextResponse.json({ error: "Only workers can access these stats" }, { status: 403 });
    }

    // Get worker user ID
    const worker = await prisma.user.findUnique({
      where: { phone: session.user.phone },
      select: { id: true }
    });

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    // Get total applications count
    const totalApplications = await prisma.application.count({
      where: {
        workerId: worker.id
      }
    });

    // Get pending applications count
    const pendingApplications = await prisma.application.count({
      where: {
        workerId: worker.id,
        status: "PENDING"
      }
    });

    // Get accepted applications count (jobs hired)
    const acceptedApplications = await prisma.application.count({
      where: {
        workerId: worker.id,
        status: "ACCEPTED"
      }
    });

    // Get rejected applications count
    const rejectedApplications = await prisma.application.count({
      where: {
        workerId: worker.id,
        status: "REJECTED"
      }
    });

    // Get profile completion percentage
    const workerProfile = await prisma.workerProfile.findUnique({
      where: {
        userId: worker.id
      },
      select: {
        category: true,
        skills: true,
        experienceYears: true,
        availability: true,
        minMonthlyPay: true,
        bio: true,
        photoUrl: true,
        nationalId: true
      }
    });

    let profileCompletion = 0;
    if (workerProfile) {
      const fields = [
        workerProfile.category,
        workerProfile.skills,
        workerProfile.availability,
        workerProfile.bio,
        workerProfile.photoUrl,
        workerProfile.nationalId
      ];
      const completedFields = fields.filter(field => field && field !== '').length;
      profileCompletion = Math.round((completedFields / fields.length) * 100);
    }

    return NextResponse.json({
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      profileCompletion
    });

  } catch (error) {
    console.error("Worker dashboard stats error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch worker stats",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
