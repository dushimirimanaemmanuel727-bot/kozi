import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-middleware";
import { query } from "@/lib/db";
import { User } from "@/types/database";
import bcrypt from "bcryptjs";

// Password strength validation
const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+=\-\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (!hasUpperCase) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  
  if (!hasLowerCase) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  
  if (!hasNumber) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  
  if (!hasSpecial) {
    return { valid: false, message: "Password must contain at least one special character" };
  }
  
  return { valid: true, message: "Password is strong" };
};

// GET password change form (for self-change)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();
    
    // Check if user is trying to change their own password
    const isSelfChange = session.user.id === id;
    
    // Only allow self-change or superadmin access
    if (!isSelfChange && session.user.role?.toLowerCase() !== "superadmin") {
      return NextResponse.json(
        { error: "Only superadmins can change other users' passwords" },
        { status: 403 }
      );
    }
    
    // Get user information
    const userResult = await query(
      'SELECT id, name, email, phone, role FROM "User" WHERE id = $1',
      [id]
    );
    
    const user = userResult.rows[0];
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      user,
      canChange: true,
      isSelfChange,
      message: isSelfChange 
        ? "You can change your own password. Current password is required."
        : "You can change this user's password as a superadmin."
    });
  } catch (error: unknown) {
    console.error("Error fetching user for password change:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch user", details: errorMessage },
      { status: 500 }
    );
  }
}

// POST change password
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();
    
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;
    
    // Check if user is trying to change their own password
    const isSelfChange = session.user.id === id;
    
    // Only allow self-change or superadmin access
    if (!isSelfChange && session.user.role?.toLowerCase() !== "superadmin") {
      return NextResponse.json(
        { error: "Only superadmins can change other users' passwords" },
        { status: 403 }
      );
    }
    
    // Get user information
    const userResult = await query(
      'SELECT id, name, email, phone, role, "passwordHash", "passwordhash" FROM "User" WHERE id = $1',
      [id]
    );
    
    const user = userResult.rows[0];
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }
    
    // Check if new password matches confirmation
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation do not match" },
        { status: 400 }
      );
    }
    
    // For self-change, verify current password
    if (isSelfChange) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required for self-password change" },
          { status: 400 }
        );
      }
      
      const currentHash = user.passwordHash || user.passwordhash;
      if (!currentHash) {
        return NextResponse.json(
          { error: "User account has no password set" },
          { status: 400 }
        );
      }
      
      const isCurrentValid = await bcrypt.compare(currentPassword, currentHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }
    }
    
    // Hash the new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    
    // Update password in database
    await query(
      `UPDATE "User" 
       SET "passwordHash" = $1, "passwordhash" = $1 
       WHERE id = $2`,
      [newPasswordHash, id]
    );
    
    return NextResponse.json({
      message: isSelfChange 
        ? "Your password has been changed successfully"
        : "User's password has been changed successfully",
      userId: id
    });
  } catch (error: unknown) {
    console.error("Error changing password:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to change password", details: errorMessage },
      { status: 500 }
    );
  }
}