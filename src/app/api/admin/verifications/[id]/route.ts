import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || (session.user.role?.toLowerCase() !== "admin" && session.user.role?.toLowerCase() !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, expiresAt, notes } = await request.json();

    // Check if verification exists
    const verificationResult = await query(
      'SELECT * FROM "Verification" WHERE id = $1',
      [id]
    );
    
    const existingVerification = verificationResult.rows[0];
    
    if (!existingVerification) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    // Update verification
    const updateResult = await query(
      'UPDATE "Verification" SET "status" = COALESCE($1, "status"), "expiresAt" = COALESCE($2, "expiresAt"), "notes" = COALESCE($3, "notes") WHERE id = $4 RETURNING *',
      [status, expiresAt ? new Date(expiresAt) : null, notes, id]
    );
    
    const verification = updateResult.rows[0];

    // Get user details
    const userResult = await query(
      'SELECT id, name, phone, email, role FROM "User" WHERE id = $1',
      [verification.userId]
    );
    
    const user = userResult.rows[0];
    
    // Attach user to verification
    verification.user = user;

    // TODO: Send notification to user about status change
    // await sendVerificationNotification(verification.userId, status);

    return NextResponse.json(verification);
  } catch (error) {
    console.error("Error updating verification:", error);
    return NextResponse.json(
      { error: "Failed to update verification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || (session.user.role?.toLowerCase() !== "admin" && session.user.role?.toLowerCase() !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if verification exists
    const verificationResult = await query(
      'SELECT * FROM "Verification" WHERE id = $1',
      [id]
    );
    
    const existingVerification = verificationResult.rows[0];
    
    if (!existingVerification) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    // Delete verification
    await query(
      'DELETE FROM "Verification" WHERE id = $1',
      [id]
    );

    return NextResponse.json({ message: "Verification deleted successfully" });
  } catch (error) {
    console.error("Error deleting verification:", error);
    return NextResponse.json(
      { error: "Failed to delete verification" },
      { status: 500 }
    );
  }
}
