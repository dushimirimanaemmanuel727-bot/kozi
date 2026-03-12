import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return Response.json({ 
        success: false, 
        error: "Phone number is required" 
      });
    }

    // Get user with password fields
    const result = await query('SELECT phone, name, role, passwordhash, passwordHash FROM "User" WHERE phone = $1', [phone]);
    const user = result.rows[0];

    if (!user) {
      return Response.json({ 
        success: false, 
        error: "User not found" 
      });
    }

    return Response.json({ 
      success: true,
      user: {
        phone: user.phone,
        name: user.name,
        role: user.role,
        hasPasswordHash: !!(user.passwordhash || user.passwordHash),
        passwordHashField: user.passwordhash ? 'passwordhash' : (user.passwordHash ? 'passwordHash' : 'none'),
        hashLength: user.passwordhash?.length || user.passwordHash?.length || 0
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
