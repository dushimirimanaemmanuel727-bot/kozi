import { query } from '@/lib/db';

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  district: string;
  suspended: boolean;
  createdat: string;
}

export async function GET() {
  try {
    // Get all admin users
    const adminUsers = await query(`
      SELECT id, name, phone, email, role, district, suspended, createdat 
      FROM "User" 
      WHERE role = 'admin'
      ORDER BY createdat DESC
    `);

    return Response.json({ 
      success: true,
      adminUsers: adminUsers.rows,
      credentials: adminUsers.rows.map((user: User) => ({
        phone: user.phone,
        password: "SuperAdmin123!", // This is the password we set
        name: user.name,
        role: user.role,
        suspended: user.suspended
      }))
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
