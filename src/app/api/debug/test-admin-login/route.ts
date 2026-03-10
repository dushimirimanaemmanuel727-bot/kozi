import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Test the specific admin credentials we created
    const phone = "0750000001";
    const password = "SuperAdmin123!";

    // Find user by phone
    const userResult = await query('SELECT * FROM "User" WHERE phone = $1', [phone]);
    const user = userResult.rows[0];

    if (!user) {
      return Response.json({ 
        success: false, 
        error: "Admin user not found",
        phone: phone
      });
    }

    // Check password
    let passwordValid = false;
    if (user.passwordhash) {
      passwordValid = await bcrypt.compare(password, user.passwordhash);
    }

    // Check if user is suspended
    const isSuspended = user.suspended;

    return Response.json({ 
      success: passwordValid && !isSuspended,
      credentials: {
        phone: phone,
        password: password
      },
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        district: user.district,
        suspended: isSuspended,
        hasPasswordHash: !!user.passwordhash,
        passwordValid: passwordValid
      },
      canLogin: passwordValid && !isSuspended
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
