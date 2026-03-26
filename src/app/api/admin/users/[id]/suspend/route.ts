import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-middleware";
import { query } from "@/lib/db";
import { User } from "@/types/database";

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

    // Only admin or superadmin can suspend users
    if (!["admin", "superadmin"].includes(session.user.role?.toLowerCase())) {
      return NextResponse.json(
        { error: "Only admin can suspend users" },
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

    // Prevent users from suspending themselves
    if (parseInt(id) === parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "Cannot suspend your own account" },
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
  } catch (error: unknown) {
    console.error("Error updating user suspension:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update user suspension status", details: errorMessage },
      { status: 500 }
    );
  }
}
