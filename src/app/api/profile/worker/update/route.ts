import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { query } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from session
    const userResult = await query('SELECT id, role FROM "User" WHERE phone = $1', [session.user.phone]);
    const user = userResult.rows[0];

    if (!user || user.role?.toUpperCase() !== "WORKER") {
      return NextResponse.json({ error: "Only workers can update this profile" }, { status: 403 });
    }

    const formData = await request.formData();
    
    // Extract basic info fields
    const name = formData.get("name") as string;
    const ageStr = formData.get("age") as string;
    const age = ageStr ? parseInt(ageStr) : null;
    const gender = formData.get("gender") as string;
    const phone = formData.get("phone") as string;
    const district = formData.get("district") as string;
    
    // Extract work-related fields
    const category = formData.get("category") as string;
    const skills = formData.get("skills") as string;
    const experienceYearsStr = formData.get("experienceYears") as string;
    const experienceYears = experienceYearsStr ? parseInt(experienceYearsStr) : 0;
    const availability = formData.get("availability") as string;
    const minMonthlyPayStr = formData.get("minMonthlyPay") as string;
    const minMonthlyPay = minMonthlyPayStr ? parseInt(minMonthlyPayStr) : null;
    const liveIn = formData.get("liveIn") === "true";
    const bio = formData.get("bio") as string;
    const nationalId = formData.get("nationalId") as string;
    const passportNumber = formData.get("passportNumber") as string;

    // Get files if provided
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
    let photoUrl = null;
    if (photoFile && photoFile.size > 0) {
      const photoBytes = await photoFile.arrayBuffer();
      const photoBuffer = Buffer.from(photoBytes);
      const photoFileName = `${user.id}-photo-${Date.now()}.${photoFile.type.split('/')[1]}`;
      const photoPath = path.join(uploadsDir, photoFileName);
      await writeFile(photoPath, photoBuffer);
      photoUrl = `/uploads/${photoFileName}`;
    }

    // Save passport if provided
    let passportUrl = null;
    if (passportFile && passportFile.size > 0) {
      const passportBytes = await passportFile.arrayBuffer();
      const passportBuffer = Buffer.from(passportBytes);
      const passportFileName = `${user.id}-passport-${Date.now()}.${passportFile.type.split('/')[1] || 'pdf'}`;
      const passportPath = path.join(uploadsDir, passportFileName);
      await writeFile(passportPath, passportBuffer);
      passportUrl = `/uploads/${passportFileName}`;
    }

    // Update user basic info first
    if (name || phone || district) {
      const userFields = [];
      const userValues = [];
      let userParamIndex = 1;

      if (name) {
        userFields.push(`name = $${userParamIndex++}`);
        userValues.push(name);
      }
      if (phone) {
        userFields.push(`phone = $${userParamIndex++}`);
        userValues.push(phone);
      }
      if (district) {
        userFields.push(`district = $${userParamIndex++}`);
        userValues.push(district);
      }

      userValues.push(user.id);
      await query(
        `UPDATE "User" SET ${userFields.join(', ')} WHERE id = $${userParamIndex}`,
        userValues
      );
    }

    // Check if WorkerProfile exists, create if not
    const profileExistsResult = await query(`
      SELECT EXISTS (
        SELECT FROM "WorkerProfile" 
        WHERE "userId" = $1
      ) as exists
    `, [user.id]);

    const profileExists = profileExistsResult.rows[0].exists;

    if (!profileExists) {
      // Create new WorkerProfile
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
          "createdAt", 
          "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
        )
      `, [
        `worker_${user.id}_${Date.now()}`,
        user.id,
        category || 'GENERAL',
        skills || null,
        experienceYears,
        availability || 'FULL_TIME',
        minMonthlyPay,
        liveIn,
        bio || null,
        nationalId || null,
        passportNumber || null,
        age,
        gender
      ]);
    } else {
      // Update existing worker profile using raw SQL
      const fields = [
        'category = $1',
        'skills = $2',
        '"experienceYears" = $3',
        'availability = $4',
        '"minMonthlyPay" = $5',
        '"liveIn" = $6',
        'bio = $7',
        '"nationalId" = $8',
        '"passportNumber" = $9',
        'age = $10',
        'gender = $11',
        '"updatedAt" = NOW()'
      ];
      const values = [
        category, 
        skills || null, 
        experienceYears, 
        availability, 
        minMonthlyPay, 
        liveIn, 
        bio || null, 
        nationalId || null, 
        passportNumber || null,
        age,
        gender
      ];
      
      let paramIndex = 12;
      if (photoUrl) {
        fields.push(`"photoUrl" = $${paramIndex++}`);
        values.push(photoUrl);
      }
      if (passportUrl) {
        fields.push(`"passportUrl" = $${paramIndex++}`);
        values.push(passportUrl);
      }

      values.push(user.id);
      await query(
        `UPDATE "WorkerProfile" SET ${fields.join(', ')} WHERE "userId" = $${paramIndex}`,
        values
      );
    }

    // Get the updated profile
    const updatedProfileResult = await query(`
      SELECT * FROM "WorkerProfile" WHERE "userId" = $1
    `, [user.id]);

    return NextResponse.json({ 
      message: "Profile updated successfully", 
      profile: updatedProfileResult.rows[0] 
    });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
