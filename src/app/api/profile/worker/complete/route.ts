import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "WORKER") {
      return NextResponse.json({ error: "Only workers can complete this profile" }, { status: 403 });
    }

    // Get user from session
    const userResult = await query('SELECT id FROM "User" WHERE phone = $1', [session.user.phone]);
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await request.formData();
    
    // Extract form fields
    const category = formData.get("category") as string;
    const skills = formData.get("skills") as string;
    const experienceYears = parseInt(formData.get("experienceYears") as string);
    const availability = formData.get("availability") as string;
    const minMonthlyPay = formData.get("minMonthlyPay") ? parseInt(formData.get("minMonthlyPay") as string) : null;
    const liveIn = formData.get("liveIn") === "true";
    const bio = formData.get("bio") as string;
    const nationalId = formData.get("nationalId") as string;
    const passportNumber = formData.get("passportNumber") as string;

    // Get files
    const photoFile = formData.get("photo") as File;
    const passportFile = formData.get("passport") as File;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Save photo if provided
    let photoUrl = "";
    if (photoFile && photoFile.size > 0) {
      const photoBytes = await photoFile.arrayBuffer();
      const photoBuffer = Buffer.from(photoBytes);
      const photoFileName = `${user.id}-photo-${Date.now()}.${photoFile.type.split('/')[1]}`;
      const photoPath = path.join(uploadsDir, photoFileName);
      await writeFile(photoPath, photoBuffer);
      photoUrl = `/uploads/${photoFileName}`;
    }

    // Save passport if provided
    let passportUrl = "";
    if (passportFile && passportFile.size > 0) {
      const passportBytes = await passportFile.arrayBuffer();
      const passportBuffer = Buffer.from(passportBytes);
      const passportFileName = `${user.id}-passport-${Date.now()}.${passportFile.name.split('.').pop()}`;
      const passportPath = path.join(uploadsDir, passportFileName);
      await writeFile(passportPath, passportBuffer);
      passportUrl = `/uploads/${passportFileName}`;
    }

    // Update worker profile
    const updateResult = await query(
      `UPDATE "WorkerProfile" 
       SET category = $1, skills = $2, "experienceYears" = $3, availability = $4, 
           "minMonthlyPay" = $5, "liveIn" = $6, bio = $7, "photoUrl" = $8, 
           nationalId = $9, "passportNumber" = $10, "passportUrl" = $11
       WHERE userId = $12
       RETURNING *`,
      [category, skills || null, experienceYears, availability, minMonthlyPay, 
       liveIn, bio || null, photoUrl || null, nationalId, passportNumber, 
       passportUrl || null, user.id]
    );
    const updatedProfile = updateResult.rows[0];

    return NextResponse.json({ 
      message: "Profile completed successfully", 
      profile: updatedProfile 
    });

  } catch (error) {
    console.error("Profile completion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
