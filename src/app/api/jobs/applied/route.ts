import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

interface ApplicationRow {
  id: string;
  status: string;
  createdAt: Date;
  jobId: string;
  title: string;
  category: string;
  description: string;
  budget: string;
  district: string;
  jobStatus: string;
  employerName: string;
  employerPhone: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user by phone to get the correct user ID and role
    const userResult = await query(
      'SELECT id, role FROM "User" WHERE phone = $1',
      [session.user?.phone]
    );
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role?.toUpperCase() !== "WORKER") {
      return NextResponse.json({ error: "Only workers can view applied jobs" }, { status: 403 });
    }

    // Get applications with job and employer details
    const applicationsResult = await query(`
      SELECT 
        a.id,
        a.status,
        a."createdAt",
        j.id as "jobId",
        j.title,
        j.category,
        j.description,
        j.budget,
        j.district,
        j.status as "jobStatus",
        e.name as "employerName",
        e.phone as "employerPhone"
      FROM "Application" a
      JOIN "Job" j ON a."jobId" = j.id
      JOIN "User" e ON j."employerId" = e.id
      WHERE a."workerId" = $1
      ORDER BY a."createdAt" DESC
    `, [user.id]);

    // Transform the data to match the expected format
    const applications = applicationsResult.rows.map((row: ApplicationRow) => ({
      id: row.id,
      status: row.status,
      createdAt: row.createdAt,
      job: {
        id: row.jobId,
        title: row.title,
        category: row.category,
        description: row.description,
        budget: row.budget,
        district: row.district,
        status: row.jobStatus,
        employer: {
          name: row.employerName,
          phone: row.employerPhone
        }
      }
    }));

    return NextResponse.json(applications);

  } catch (error) {
    console.error("Applied jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
