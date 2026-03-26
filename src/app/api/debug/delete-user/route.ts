import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Check current user role
    const currentUserRole = session.user?.role;
    console.log('Current user role:', currentUserRole);
    
    // Check if user exists and their role
    const userResult = await query(
      'SELECT * FROM "User" WHERE id = $1',
      [userId]
    );
    
    const userToDelete = userResult.rows[0];
    
    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log('User to delete:', {
      id: userToDelete.id,
      name: userToDelete.name,
      role: userToDelete.role
    });

    // Check all deletion conditions
    const conditions = {
      isCurrentUserSuperAdmin: currentUserRole === "superadmin",
      userToDeleteIsSuperAdmin: userToDelete.role === "superadmin",
      canDelete: currentUserRole === "superadmin" && userToDelete.role !== "superadmin"
    };

    console.log('Deletion conditions:', conditions);

    if (!conditions.isCurrentUserSuperAdmin) {
      return NextResponse.json({ 
        error: "Only superadmin can delete users",
        conditions 
      }, { status: 403 });
    }

    if (conditions.userToDeleteIsSuperAdmin) {
      return NextResponse.json({ 
        error: "Cannot delete superadmin users",
        conditions 
      }, { status: 403 });
    }

    // If we reach here, deletion should be allowed
    return NextResponse.json({ 
      message: "User can be deleted",
      conditions,
      user: {
        id: userToDelete.id,
        name: userToDelete.name,
        role: userToDelete.role
      }
    });

  } catch (error: any) {
    console.error("Debug delete error:", error);
    return NextResponse.json(
      { error: "Debug error: " + error.message },
      { status: 500 }
    );
  }
}
