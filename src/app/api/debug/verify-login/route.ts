import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return Response.json({ 
        success: false, 
        error: "Phone and password are required" 
      });
    }

    // Find user by phone
    const userResult = await query('SELECT * FROM "User" WHERE phone = $1', [phone]);
    const user = userResult.rows[0];

    if (!user) {
      return Response.json({ 
        success: false, 
        error: "User not found" 
      });
    }

    // Check password
    let passwordValid = false;
    if (user.passwordhash) {
      passwordValid = await bcrypt.compare(password, user.passwordhash);
    }

    if (!passwordValid) {
      return Response.json({ 
        success: false, 
        error: "Invalid password",
        userExists: true,
        userRole: user.role,
        phoneProvided: phone
      });
    }

    // Check if user is suspended
    if (user.suspended) {
      return Response.json({ 
        success: false, 
        error: "Account is suspended",
        suspensionReason: user.suspensionreason,
        suspendedAt: user.suspendedat
      });
    }

    return Response.json({ 
      success: true,
      message: "Login credentials are valid",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        district: user.district,
        suspended: user.suspended
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
