import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "worker") {
      return NextResponse.json({ error: "Only workers can access these stats" }, { status: 403 });
    }

    // Get worker user ID
    const workerResult = await query('SELECT id FROM "User" WHERE phone = $1', [session.user.phone]);
    const worker = workerResult.rows[0];

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    // Get applications counts using raw SQL
    const countsResult = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
       FROM "Application" WHERE workerid = $1`,
      [worker.id]
    );
    const counts = countsResult.rows[0];

    // Get profile completion percentage
    const profileResult = await query(
      `SELECT category, skills, experienceyears, availability, minmonthlypay, bio, photourl, nationalid
       FROM "WorkerProfile" WHERE userid = $1`,
      [worker.id]
    );
    const workerProfile = profileResult.rows[0];

    let profileCompletion = 0;
    if (workerProfile) {
      const fields = [
        workerProfile.category,
        workerProfile.skills,
        workerProfile.experienceyears,
        workerProfile.availability,
        workerProfile.minmonthlypay,
        workerProfile.bio,
        workerProfile.photourl,
        workerProfile.nationalid
      ];
      const completedFields = fields.filter(field => field && field !== '').length;
      profileCompletion = Math.round((completedFields / fields.length) * 100);
    }

    return NextResponse.json({
      totalApplications: parseInt(counts.total),
      pendingApplications: parseInt(counts.pending),
      acceptedApplications: parseInt(counts.accepted),
      rejectedApplications: parseInt(counts.rejected),
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
