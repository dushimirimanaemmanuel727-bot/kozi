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
      console.log('Uploads directory might already exist:', error);
    }

    // Save photo if provided
    let photoUrl = null;
    if (photoFile && photoFile.size > 0) {
      try {
        const photoBytes = await photoFile.arrayBuffer();
        const photoBuffer = Buffer.from(photoBytes);
        const photoFileName = `${user.id}-photo-${Date.now()}.${photoFile.type.split('/')[1] || 'jpg'}`;
        const photoPath = path.join(uploadsDir, photoFileName);
        await writeFile(photoPath, photoBuffer);
        photoUrl = `/uploads/${photoFileName}`;
        console.log('Photo saved successfully:', photoUrl);
      } catch (photoError) {
        console.error('Failed to save photo:', photoError);
        // Continue without photo
      }
    }

    // Save passport if provided
    let passportUrl = null;
    if (passportFile && passportFile.size > 0) {
      try {
        const passportBytes = await passportFile.arrayBuffer();
        const passportBuffer = Buffer.from(passportBytes);
        const passportFileName = `${user.id}-passport-${Date.now()}.${passportFile.type.split('/')[1] || 'pdf'}`;
        const passportPath = path.join(uploadsDir, passportFileName);
        await writeFile(passportPath, passportBuffer);
        passportUrl = `/uploads/${passportFileName}`;
        console.log('Passport saved successfully:', passportUrl);
      } catch (passportError) {
        console.error('Failed to save passport:', passportError);
        // Continue without passport
      }
    }

    // Update user basic info first
    if (name || phone) {
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

      userValues.push(user.id);
      await query(
        `UPDATE "User" SET ${userFields.join(', ')}, updatedat = NOW() WHERE id = $${userParamIndex}`,
        userValues
      );
    }

    // Try to update district separately in case the column doesn't exist
    if (district) {
      try {
        await query(
          'UPDATE "User" SET district = $1, updatedat = NOW() WHERE id = $2',
          [district, user.id]
        );
      } catch (districtError) {
        console.log('District column might not exist, skipping district update:', districtError);
        // Continue without district update
      }
    }

    // Check if WorkerProfile exists, create if not
    const profileExistsResult = await query(`
      SELECT EXISTS (
        SELECT FROM "WorkerProfile" 
        WHERE userid = $1
      ) as exists
    `, [user.id]);

    const profileExists = profileExistsResult.rows[0].exists;

    try {
      if (!profileExists) {
        console.log('Creating new WorkerProfile for user:', user.id);
        // Create new WorkerProfile
        await query(`
          INSERT INTO "WorkerProfile" (
            userid, 
            category, 
            skills, 
            experienceyears, 
            availability, 
            minmonthlypay, 
            bio, 
            nationalid, 
            passporturl, 
            age, 
            gender,
            photourl,
            createdat, 
            updatedat
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
          )
        `, [
          user.id,
          category || 'GENERAL',
          skills || null,
          experienceYears,
          availability || 'FULL_TIME',
          minMonthlyPay,
          bio || null,
          nationalId || null,
          passportUrl || null,
          age,
          gender,
          photoUrl || null
        ]);
        console.log('WorkerProfile created successfully');
      } else {
        console.log('Updating existing WorkerProfile for user:', user.id);
        // Update existing worker profile using correct column names
        const fields = [
          'category = $1',
          'skills = $2',
          'experienceyears = $3',
          'availability = $4',
          'minmonthlypay = $5',
          'bio = $6',
          'nationalid = $7',
          'passporturl = $8',
          'age = $9',
          'gender = $10',
          'updatedat = NOW()'
        ];
        const values = [
          category, 
          skills || null, 
          experienceYears, 
          availability, 
          minMonthlyPay, 
          bio || null, 
          nationalId || null, 
          passportUrl || null,
          age,
          gender
        ];
        
        let paramIndex = 11;
        if (photoUrl) {
          fields.push(`photourl = $${paramIndex++}`);
          values.push(photoUrl);
        }

        values.push(user.id);
        const updateQuery = `UPDATE "WorkerProfile" SET ${fields.join(', ')} WHERE userid = $${paramIndex}`;
        console.log('Update query:', updateQuery);
        console.log('Update values:', values);
        
        await query(updateQuery, values);
        console.log('WorkerProfile updated successfully');
      }
    } catch (profileError) {
      console.error('WorkerProfile operation failed:', profileError);
      throw profileError;
    }

    // Get the updated profile
    const updatedProfileResult = await query(`
      SELECT * FROM "WorkerProfile" WHERE userid = $1
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
