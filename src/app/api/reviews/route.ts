import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from session phone
    const userResult = await query('SELECT id, role FROM "User" WHERE phone = $1', [session.user.phone]);
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userRole = user.role?.toUpperCase();
    if (userRole !== "WORKER" && userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      return NextResponse.json({ error: "Only workers, admin, or superadmin can view reviews" }, { status: 403 });
    }

    // Get reviews using raw SQL
    let reviewsQuery: string;
    let queryParams: any[];

    if (userRole === "ADMIN" || userRole === "SUPERADMIN") {
      // Admins can see all reviews
      reviewsQuery = `
        SELECT r.*, 
               u1.id as reviewer_id, u1.name as reviewer_name, u1.phone as reviewer_phone,
               u2.id as reviewee_id, u2.name as reviewee_name, u2.phone as reviewee_phone,
               j.id as job_id, j.title as job_title
        FROM "Review" r
        JOIN "User" u1 ON r."reviewerId" = u1.id
        JOIN "User" u2 ON r."revieweeId" = u2.id
        LEFT JOIN "Job" j ON r."jobId" = j.id
        ORDER BY r."createdAt" DESC
      `;
      queryParams = [];
    } else {
      // Workers can only see reviews they're involved in
      reviewsQuery = `
        SELECT r.*, 
               u1.id as reviewer_id, u1.name as reviewer_name, u1.phone as reviewer_phone,
               u2.id as reviewee_id, u2.name as reviewee_name, u2.phone as reviewee_phone,
               j.id as job_id, j.title as job_title
        FROM "Review" r
        JOIN "User" u1 ON r."reviewerId" = u1.id
        JOIN "User" u2 ON r."revieweeId" = u2.id
        LEFT JOIN "Job" j ON r."jobId" = j.id
        WHERE r."reviewerId" = $1 OR r."revieweeId" = $1
        ORDER BY r."createdAt" DESC
      `;
      queryParams = [user.id];
    }

    const reviewsResult = await query(reviewsQuery, queryParams);

    // Define type for database row
    interface ReviewRow {
      id: string;
      rating: number;
      comment: string;
      reviewerId: string;
      revieweeId: string;
      createdAt: string;
      updatedAt: string;
      reviewer_id: string;
      reviewer_name: string;
      reviewer_phone: string;
      reviewee_id: string;
      reviewee_name: string;
      reviewee_phone: string;
      job_id?: string;
      job_title?: string;
    }

    const reviews = reviewsResult.rows.map((row: ReviewRow) => ({
      ...row,
      reviewer: { id: row.reviewer_id, name: row.reviewer_name, phone: row.reviewer_phone },
      reviewee: { id: row.reviewee_id, name: row.reviewee_name, phone: row.reviewee_phone }
    }));

    return NextResponse.json(reviews);

  } catch (error) {
    console.error("Reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
