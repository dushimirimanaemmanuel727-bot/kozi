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
    
    const { name, phone, email, password, role, district } = parsed;

    // Convert role to lowercase to match database constraint
    const normalizedRole = role?.toLowerCase();

    if (!name || !phone || !password || !role) {
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
      name,
      phone,
      email: email || null,
      password: password,
      role: normalizedRole,
      district: district || null
    });

    // Create role-specific profile
    if (normalizedRole === "worker") {
      // Create WorkerProfile record
      await query(`
        INSERT INTO "WorkerProfile" (
          id, 
          "userId", 
          category, 
          skills, 
          "experienceYears", 
          availability, 
          "minMonthlyPay", 
          "liveIn", 
          bio, 
          "nationalId", 
          "passportNumber", 
          age, 
          gender,
          rating,
          "reviewCount",
          "viewCount",
          "createdAt", 
          "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()
        )
      `, [
        `worker_${user.id}_${Date.now()}`,
        user.id,
        'GENERAL',
        '',
        0,
        'FULL_TIME',
        null,
        false,
        '',
        '',
        '',
        null,
        '',
        0,
        0,
        0
      ]);
    } else if (normalizedRole === "employer") {
      // Create EmployerProfile record
      await query(`
        INSERT INTO "EmployerProfile" (
          id, 
          "userId", 
          "companyName", 
          "website", 
          "description", 
          "industry", 
          "companySize", 
          rating,
          "reviewCount",
          "logoUrl",
          "createdAt", 
          "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now()
        )
      `, [
        `employer_${user.id}_${Date.now()}`,
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
