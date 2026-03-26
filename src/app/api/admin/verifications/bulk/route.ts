import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { verificationIds, action, expiresAt } = await request.json();

    if (!verificationIds || !Array.isArray(verificationIds) || verificationIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid verification IDs" },
        { status: 400 }
      );
    }

    if (!["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const status = action === "APPROVE" ? "APPROVED" : "REJECTED";

      const result = await query(
      `UPDATE "Verification" 
       SET status = $1, "expiresAt" = $2 
       WHERE id = ANY($3) AND status = 'PENDING'`,
      [status, expiresAt && action === "APPROVE" ? new Date(expiresAt) : null, verificationIds]
    );

    // TODO: Send notifications to affected users
    // await sendBulkVerificationNotifications(verificationIds, status);

    return NextResponse.json({
      message: `Successfully ${action.toLowerCase()}d ${result.rowCount} verifications`,
      updated: result.rowCount
    });
  } catch (error) {
    console.error("Error in bulk verification action:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}
