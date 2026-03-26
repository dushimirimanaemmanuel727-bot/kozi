import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-middleware";
import { query } from "@/lib/db";
import { User, WorkerProfile } from "@/types/database";

// GET user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();
    
      const userResult = await query(
      'SELECT * FROM "User" WHERE id = $1',
      [id]
    );
    
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert Decimal to number for serialization
    const serializedUser = {
      ...user,
      workerProfile: user.workerProfile ? {
        ...user.workerProfile,
        minMonthlyPay: user.workerProfile.minMonthlyPay ? Number(user.workerProfile.minMonthlyPay) : null
      } : null
    };

    return NextResponse.json({ user: serializedUser });
  } catch (error: unknown) {
    console.error("Error fetching user:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch user", details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();
    
    const body = await request.json();
    const { name, email, phone, role, status } = body;

    // Only admin or superadmin can change roles
    if (role && !["admin", "superadmin"].includes(session.user.role?.toLowerCase())) {
      return NextResponse.json(
        { error: "Only admin can change user roles" },
        { status: 403 }
      );
    }

    const updateData: Partial<Pick<User, 'name' | 'email' | 'phone' | 'role'>> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;

    // Check if user exists
    const userResult = await query(
      'SELECT * FROM "User" WHERE id = $1',
      [id]
    );
    
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent users from modifying their own admin role
    if (role && parseInt(id) === parseInt(session.user.id) && ["admin", "superadmin"].includes(user.role?.toLowerCase())) {
      return NextResponse.json(
        { error: "Cannot modify your own admin role" },
        { status: 403 }
      );
    }

    const updatedUserResult = await query(
      `UPDATE "User" 
       SET "name" = COALESCE($1, "name"), 
           "email" = COALESCE($2, "email"), 
           "phone" = COALESCE($3, "phone"), 
           "role" = COALESCE($4, "role") 
       WHERE id = $5 
       RETURNING *`,
      [name, email, phone, role, id]
    );
    
    const updatedUser = updatedUserResult.rows[0];

    // Convert Decimal to number for serialization
    const serializedUser = {
      ...updatedUser,
      workerProfile: updatedUser.workerProfile ? {
        ...updatedUser.workerProfile,
        minMonthlyPay: updatedUser.workerProfile.minMonthlyPay ? Number(updatedUser.workerProfile.minMonthlyPay) : null
      } : null
    };

    return NextResponse.json({ user: serializedUser });
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update user", details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();
    
    // Only admin or superadmin can delete users
    if (!["admin", "superadmin"].includes(session.user.role?.toLowerCase())) {
      return NextResponse.json(
        { error: "Only admin can delete users" },
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

    // Prevent users from deleting themselves
    if (parseInt(id) === parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 403 }
      );
    }

    // Delete user
    await query(
      'DELETE FROM "User" WHERE id = $1',
      [id]
    );

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete user", details: errorMessage },
      { status: 500 }
    );
  }
}
