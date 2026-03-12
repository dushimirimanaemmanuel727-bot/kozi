import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-middleware";
import { query } from "@/lib/db";
import { Verification, User, WorkerProfile } from "@/types/database";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");

    // Build WHERE conditions
    const whereConditions: string[] = [];
    const queryParams: (string | number)[] = [];
    let paramIndex = 1;

    if (status && status !== "ALL") {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }
    
    if (type && type !== "ALL") {
      whereConditions.push(`type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }
    
    if (search) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM "User" u 
        WHERE u.id = v.user_id 
        AND u.name ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM "Verification" v 
      ${whereClause}
    `;
    const totalResult = await query(countQuery, queryParams);
    const total = parseInt(totalResult.rows[0].total);

    // Get paginated verifications
    const verificationsQuery = `
      SELECT 
        v.*,
        u.id as user_id,
        u.name as user_name,
        u.phone as user_phone,
        u.email as user_email,
        u.role as user_role,
        wp.national_id as worker_national_id,
        wp.passport_number as worker_passport_number,
        wp.passport_url as worker_passport_url,
        wp.category as worker_category
      FROM "Verification" v
      JOIN "User" u ON v.user_id = u.id
      LEFT JOIN "WorkerProfile" wp ON u.id = wp.user_id
      ${whereClause}
      ORDER BY v.issued_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const verificationsResult = await query(verificationsQuery, [
      ...queryParams,
      limit,
      (page - 1) * limit
    ]);

    // Format the response to match expected structure
    const verifications = verificationsResult.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      status: row.status,
      issuedAt: row.issued_at,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        id: row.user_id,
        name: row.user_name,
        phone: row.user_phone,
        email: row.user_email,
        role: row.user_role,
        workerProfile: row.worker_national_id ? {
          nationalId: row.worker_national_id,
          passportNumber: row.worker_passport_number,
          passportUrl: row.worker_passport_url,
          category: row.worker_category
        } : null
      }
    }));

    return NextResponse.json({
      verifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: unknown) {
    console.error("Error fetching verifications:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch verifications", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    const { userId, type, status, issuedAt, expiresAt } = await request.json();

    const verificationResult = await query(
      `INSERT INTO "Verification" (user_id, type, status, issued_at, expires_at) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        userId,
        type,
        status || "PENDING",
        issuedAt ? new Date(issuedAt) : new Date(),
        expiresAt ? new Date(expiresAt) : null
      ]
    );

    const verification = verificationResult.rows[0];

    return NextResponse.json(verification);
  } catch (error: unknown) {
    console.error("Error creating verification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create verification", details: errorMessage },
      { status: 500 }
    );
  }
}
