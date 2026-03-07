import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-middleware";

// POST suspend/unsuspend user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();
    
    const body = await request.json();
    const { suspended, reason } = body;

    // Only SUPERADMIN can suspend users
    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Only SUPERADMIN can suspend users" },
        { status: 403 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent suspension of SUPERADMIN users
    if (user.role === "SUPERADMIN") {
      return NextResponse.json(
        { error: "Cannot suspend SUPERADMIN users" },
        { status: 403 }
      );
    }

    // Update user suspension status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        suspended: suspended,
        suspensionReason: suspended ? reason : null,
        suspendedAt: suspended ? new Date() : null,
        suspendedBy: suspended ? session.user.id : null
      } as any
    });

    return NextResponse.json({ 
      message: suspended ? "User suspended successfully" : "User unsuspended successfully",
      user: updatedUser
    });
  } catch (error: any) {
    console.error("Error updating user suspension:", error);
    return NextResponse.json(
      { error: "Failed to update user suspension status" },
      { status: 500 }
    );
  }
}
