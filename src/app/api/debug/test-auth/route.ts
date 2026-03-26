import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({
        success: false,
        error: "Phone and password are required",
        debug: "Missing credentials"
      });
    }

    // Get user with all password fields
    const userResult = await query(`
      SELECT *, 
             passwordhash as passwordhash_field,
             passwordHash as passwordHash_field
      FROM "User" 
      WHERE phone = $1
    `, [phone]);
    
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
        debug: {
          phone: phone,
          userExists: false,
          message: "No user found with this phone number"
        }
      });
    }

    // Check which password field exists
    const hasPasswordHash = !!user.passwordhash_field || !!user.passwordHash_field;
    const passwordFieldName = user.passwordhash_field ? "passwordhash_field" : 
                              user.passwordHash_field ? "passwordHash_field" : null;

    if (!hasPasswordHash) {
      return NextResponse.json({
        success: false,
        error: "User has no password hash",
        debug: {
          phone: phone,
          userExists: true,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          passwordFields: {
            passwordhash_field: !!user.passwordhash_field,
            passwordHash_field: !!user.passwordHash_field,
            foundField: passwordFieldName
          },
          message: "User exists but has no password hash stored"
        }
      });
    }

    // Try to verify password with the available hash
    let passwordValid = false;
    let hashUsed = null;
    
    if (user.passwordhash_field) {
      passwordValid = await bcrypt.compare(password, user.passwordhash_field);
      hashUsed = "passwordhash_field";
    } else if (user.passwordHash_field) {
      passwordValid = await bcrypt.compare(password, user.passwordHash_field);
      hashUsed = "passwordHash_field";
    }

    if (!passwordValid) {
      return NextResponse.json({
        success: false,
        error: "Invalid password",
        debug: {
          phone: phone,
          userExists: true,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          passwordFields: {
            passwordhash_field: !!user.passwordhash_field,
            passwordHash_field: !!user.passwordHash_field,
            foundField: passwordFieldName,
            hashUsed: hashUsed
          },
          message: "Password verification failed",
          suspended: user.suspended,
          suspensionReason: user.suspensionreason,
          suspendedAt: user.suspendedat
        }
      });
    }

    // Check if user is suspended
    if (user.suspended) {
      return NextResponse.json({
        success: false,
        error: "Account is suspended",
        debug: {
          phone: phone,
          userExists: true,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          suspended: true,
          suspensionReason: user.suspensionreason,
          suspendedAt: user.suspendedat,
          message: "Account is suspended, cannot login"
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Login credentials are valid",
      debug: {
        phone: phone,
        userExists: true,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        passwordFields: {
          passwordhash_field: !!user.passwordhash_field,
          passwordHash_field: !!user.passwordHash_field,
          foundField: passwordFieldName,
          hashUsed: hashUsed
        },
        suspended: user.suspended,
        suspensionReason: user.suspensionreason,
        suspendedAt: user.suspendedat,
        message: "Login successful!"
      }
    });

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: errorMessage,
      debug: {
        errorType: "exception",
        message: errorMessage,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}