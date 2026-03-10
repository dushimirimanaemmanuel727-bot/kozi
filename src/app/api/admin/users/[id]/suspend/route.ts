import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-middleware";
import { query } from "@/lib/db";

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

    // Only superadmin can suspend users
    if (session.user.role?.toLowerCase() !== "superadmin") {
      return NextResponse.json(
        { error: "Only superadmin can suspend users" },
        { status: 403 }
      );
    }

    // Check if user exists
    const userResult = await query(
      'SELECT * FROM "User" WHERE id = $1',
      [id]
    );
    
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent suspension of superadmin users
    if (user.role?.toLowerCase() === "superadmin") {
      return NextResponse.json(
        { error: "Cannot suspend superadmin users" },
        { status: 403 }
      );
    }

    // Update user suspension status
    const updatedUserResult = await query(
      `UPDATE "User" 
       SET "suspended" = $1, 
           "suspensionReason" = $2, 
           "suspendedAt" = $3, 
           "suspendedBy" = $4 
       WHERE id = $5 
       RETURNING *`,
      [
        suspended,
        suspended ? reason : null,
        suspended ? new Date() : null,
        suspended ? session.user.id : null,
        id
      ]
    );
    
    const updatedUser = updatedUserResult.rows[0];

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
