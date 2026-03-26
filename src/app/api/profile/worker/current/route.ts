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

    // Get worker user ID from session phone
    const userResult = await query('SELECT id, role FROM "User" WHERE phone = $1', [session.user.phone]);
    const user = userResult.rows[0];

    if (!user || user.role?.toUpperCase() !== "WORKER") {
      return NextResponse.json({ error: "Not a worker" }, { status: 403 });
    }

    const workerProfileResult = await query(
      `SELECT wp.*, u.name, u.phone, u.district, u.languages
       FROM "WorkerProfile" wp
       JOIN "User" u ON wp.userid = u.id
       WHERE wp.userid = $1`,
      [user.id]
    );
    const workerProfile = workerProfileResult.rows[0];

    if (!workerProfile) {
      // Return default/empty profile data if no profile exists yet
      return NextResponse.json({
        // WorkerProfile fields with defaults using frontend-friendly names
        id: null,
        userId: user.id,
        category: "GENERAL",
        skills: "",
        experienceYears: 0,
        availability: "FULL_TIME",
        minMonthlyPay: null,
        bio: "",
        photoUrl: null,
        rating: 0,
        reviewCount: 0,
        nationalId: "",
        passportUrl: null,
        viewCount: 0,
        age: null,
        gender: "",
        createdAt: null,
        updatedAt: null,
        // User fields
        name: null,
        phone: null,
        district: null,
        languages: []
      });
    }

    // Transform database column names to frontend-friendly names
    const transformedProfile = {
      id: workerProfile.id,
      userId: workerProfile.userid,
      category: workerProfile.category,
      skills: workerProfile.skills,
      experienceYears: workerProfile.experienceyears,
      availability: workerProfile.availability,
      minMonthlyPay: workerProfile.minmonthlypay,
      bio: workerProfile.bio,
      photoUrl: workerProfile.photourl,
      rating: workerProfile.rating,
      reviewCount: workerProfile.reviewcount,
      nationalId: workerProfile.nationalid,
      passportUrl: workerProfile.passporturl,
      viewCount: workerProfile.viewcount,
      age: workerProfile.age,
      gender: workerProfile.gender,
      createdAt: workerProfile.createdat,
      updatedAt: workerProfile.updatedat,
      // User fields
      name: workerProfile.name,
      phone: workerProfile.phone,
      district: workerProfile.district,
      languages: workerProfile.languages
    };

    return NextResponse.json(transformedProfile);

  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
