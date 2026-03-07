import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const result = await prisma.verification.updateMany({
      where: {
        id: { in: verificationIds },
        status: "PENDING" // Only update pending verifications
      },
      data: {
        status,
        expiresAt: expiresAt && action === "APPROVE" ? new Date(expiresAt) : undefined
      }
    });

    // TODO: Send notifications to affected users
    // await sendBulkVerificationNotifications(verificationIds, status);

    return NextResponse.json({
      message: `Successfully ${action.toLowerCase()}d ${result.count} verifications`,
      updated: result.count
    });
  } catch (error) {
    console.error("Error in bulk verification action:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}
