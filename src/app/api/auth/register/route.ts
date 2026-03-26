import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createUser } from "@/lib/user-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    console.log('Raw request body:', body);
    
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    const { username, name, phone, email, password, role, district } = parsed;

    // Use username if provided, otherwise fall back to name
    const finalName = username || name;

    // Convert role to lowercase to match database constraint
    const normalizedRole = role?.toLowerCase();

    if (!finalName || !phone || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserResult = await query('SELECT * FROM "User" WHERE phone = $1', [phone]);
    const existingUser = existingUserResult.rows[0];

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this phone number already exists" },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser({
      name: finalName,
      phone,
      email: email || null,
      password: password,
      role: normalizedRole,
      district: district || null
    });

    // Create role-specific profile
    if (normalizedRole === "worker") {
      // Create WorkerProfile record - simplified to match actual schema
      await query(`
        INSERT INTO "WorkerProfile" (
          userid, category, skills, experienceyears, availability, 
          minmonthlypay, bio, photourl, nationalid, location, 
          rating, reviewcount, viewcount, createdat, updatedat
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
        )
      `, [
        user.id,
        'GENERAL',
        '',
        0,
        'FULL_TIME',
        null,
        '',
        null,
        '',
        null,
        0,
        0,
        0
      ]);
    } else if (normalizedRole === "employer") {
      // Create EmployerProfile record - simplified to match actual schema
      await query(`
        INSERT INTO "EmployerProfile" (
          userid, companyname, website, description, 
          industry, companysize, rating, reviewcount, 
          logourl, createdat, updatedat
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now()
        )
      `, [
        user.id,
        null,
        null,
        null,
        null,
        null,
        0,
        0,
        null
      ]);
    }

    // Return success response with redirect info for workers
    return NextResponse.json(
      { 
        message: "User created successfully", 
        user,
        redirectTo: normalizedRole === "worker" ? "/profile/worker/complete" : "/auth/signin"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
