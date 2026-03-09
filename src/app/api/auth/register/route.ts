import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { createUser } from "@/lib/user-service";

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, password, role, district } = await request.json();

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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await createUser({
      name,
      phone,
      email: email || null,
      password,
      role,
      district: district || null
    });

    // Return success response with redirect info for workers
    return NextResponse.json(
      { 
        message: "User created successfully", 
        user,
        redirectTo: role === "WORKER" ? "/profile/worker/complete" : "/auth/signin"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
