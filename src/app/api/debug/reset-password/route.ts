import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { phone, newPassword } = await request.json();

    if (!phone || !newPassword) {
      return Response.json({ 
        success: false, 
        error: "Phone and new password are required" 
      });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    const result = await query(
      'UPDATE "User" SET passwordhash = $1 WHERE phone = $2 RETURNING phone, name, role',
      [passwordHash, phone]
    );

    if (result.rows.length === 0) {
      return Response.json({ 
        success: false, 
        error: "User not found" 
      });
    }

    return Response.json({ 
      success: true,
      message: "Password reset successfully",
      user: result.rows[0],
      newCredentials: {
        phone: phone,
        password: newPassword
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
