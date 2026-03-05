import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this phone number already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email: email || null,
        passwordHash,
        role,
        district: district || null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        district: true,
        createdAt: true,
      }
    });

    // Create profile based on role
    if (role === "WORKER") {
      await prisma.workerProfile.create({
        data: {
          userId: user.id,
          category: "GENERAL", // Default category
          availability: "PART_TIME", // Default availability
        }
      });
    } else if (role === "EMPLOYER") {
      await prisma.employerProfile.create({
        data: {
          userId: user.id,
        }
      });
    }

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
