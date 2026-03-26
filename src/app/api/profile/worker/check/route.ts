import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "WORKER") {
      return NextResponse.json({ error: "Not a worker" }, { status: 403 });
    }

    // Get user from session
    const userResult = await query('SELECT id FROM "User" WHERE phone = $1', [session.user.phone]);
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get worker profile
    const profileResult = await query(
      `SELECT nationalId, passportNumber, photoUrl, passportUrl 
       FROM "WorkerProfile" 
       WHERE userId = $1`,
      [user.id]
    );
    const workerProfile = profileResult.rows[0];

    // Check if required fields are completed
    const completed = !!(
      workerProfile?.nationalId &&
      workerProfile?.passportNumber &&
      workerProfile?.photoUrl &&
      workerProfile?.passportUrl
    );

    return NextResponse.json({ completed });

  } catch (error) {
    console.error("Profile check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
