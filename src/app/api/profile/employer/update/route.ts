import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

    if (!user || user.role?.toUpperCase() !== "EMPLOYER") {
      return NextResponse.json({ error: "Only employers can update this profile" }, { status: 403 });
    }

    const formData = await request.formData();
    
    // Extract form fields
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const district = formData.get("district") as string;
    const companyName = formData.get("companyName") as string;
    const website = formData.get("website") as string;
    const description = formData.get("description") as string;
    const industry = formData.get("industry") as string;
    const companySize = formData.get("companySize") as string;

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

    // Check if EmployerProfile exists, create if not
    const profileExistsResult = await query(`
      SELECT EXISTS (
        SELECT FROM "EmployerProfile" 
        WHERE "userId" = $1
      ) as exists
    `, [user.id]);

    const profileExists = profileExistsResult.rows[0].exists;

    if (!profileExists) {
      // Create new EmployerProfile
      await query(`
        INSERT INTO "EmployerProfile" (
          id, 
          "userId", 
          "companyName", 
          "website", 
          "description", 
          "industry", 
          "companySize",
          "createdAt", 
          "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
        )
      `, [
        `employer_${user.id}_${Date.now()}`,
        user.id,
        companyName || null,
        website || null,
        description || null,
        industry || null,
        companySize || null
      ]);
    } else {
      // Update existing employer profile
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (companyName !== undefined) {
        fields.push(`"companyName" = $${paramIndex++}`);
        values.push(companyName);
      }
      if (website !== undefined) {
        fields.push(`website = $${paramIndex++}`);
        values.push(website);
      }
      if (description !== undefined) {
        fields.push(`description = $${paramIndex++}`);
        values.push(description);
      }
      if (industry !== undefined) {
        fields.push(`industry = $${paramIndex++}`);
        values.push(industry);
      }
      if (companySize !== undefined) {
        fields.push(`"companySize" = $${paramIndex++}`);
        values.push(companySize);
      }

      fields.push(`"updatedAt" = NOW()`);
      values.push(user.id);
      
      await query(
        `UPDATE "EmployerProfile" SET ${fields.join(', ')} WHERE "userId" = $${paramIndex}`,
        values
      );
    }

    // Get the updated profile
    const updatedProfileResult = await query(`
      SELECT * FROM "EmployerProfile" WHERE "userId" = $1
    `, [user.id]);

    return NextResponse.json({ 
      message: "Profile updated successfully", 
      profile: updatedProfileResult.rows[0] 
    });

  } catch (error) {
    console.error("Employer profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
