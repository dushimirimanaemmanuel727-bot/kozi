import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: jobId } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Count applications for this job
    const result = await query(
      'SELECT COUNT(*) as count FROM "Application" WHERE "jobId" = $1',
      [jobId]
    );
    
    const applicationCount = result.rows[0].count;

    return NextResponse.json({ count: parseInt(applicationCount) });

  } catch (error) {
    console.error("Applications count error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
