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

    // Step 1: Check current user
    console.log('Current session:', {
      id: session.user?.id,
      name: session.user?.name,
      role: session.user?.role
    });

    if (session.user?.role !== "superadmin") {
      return NextResponse.json({ error: "Only superadmin can delete users" }, { status: 403 });
    }

    // Step 2: Check user to delete
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

    if (userToDelete.role === "superadmin") {
      return NextResponse.json({ error: "Cannot delete superadmin users" }, { status: 403 });
    }

    // Step 3: Check for related records before deletion
    const [jobsCount, applicationsCount, reviewsCount, notificationsCount] = await Promise.all([
      query('SELECT COUNT(*) as count FROM "Job" WHERE "employerId" = $1', [userId]),
      query('SELECT COUNT(*) as count FROM "Application" WHERE "workerId" = $1', [userId]),
      query('SELECT COUNT(*) as count FROM "Review" WHERE "reviewerId" = $1 OR "revieweeId" = $1', [userId]),
      query('SELECT COUNT(*) as count FROM "Notification" WHERE "userId" = $1', [userId])
    ]);

    console.log('Related records:', {
      jobs: jobsCount.rows[0].count,
      applications: applicationsCount.rows[0].count,
      reviews: reviewsCount.rows[0].count,
      notifications: notificationsCount.rows[0].count
    });

    // Step 4: Attempt deletion
    try {
      const deleteResult = await query(
        'DELETE FROM "User" WHERE id = $1 RETURNING *',
        [userId]
      );

      console.log('Delete result:', deleteResult.rows[0]);

      return NextResponse.json({ 
        message: "User deleted successfully",
        deletedUser: deleteResult.rows[0],
        relatedRecordsDeleted: {
          jobs: jobsCount.rows[0].count,
          applications: applicationsCount.rows[0].count,
          reviews: reviewsCount.rows[0].count,
          notifications: notificationsCount.rows[0].count
        }
      });

    } catch (deleteError: any) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ 
        error: "Failed to delete user: " + deleteError.message,
        details: deleteError
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Debug delete error:", error);
    return NextResponse.json(
      { error: "Debug error: " + error.message },
      { status: 500 }
    );
  }
}
