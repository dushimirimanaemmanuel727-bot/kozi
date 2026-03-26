import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const adminData = {
      id: `admin_${Date.now()}`,
      name: "Superadmin User",
      phone: "0788888888", // Easy to remember phone number
      email: "admin@kazihome.com",
      role: "admin",
      district: "KIGALI",
      languages: ["English", "Kinyarwanda"],
      password: "Admin123!" // Simple password
    };

    // Check if admin already exists
    const existingUser = await query('SELECT * FROM "User" WHERE phone = $1', [adminData.phone]);
    
    if (existingUser.rows.length > 0) {
      return Response.json({ 
        success: false, 
        error: "Admin with this phone number already exists" 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(adminData.password, 12);

    // Create admin user
    const result = await query(
      `INSERT INTO "User" (
        id, name, phone, email, role, district, languages, 
        "passwordHash", suspended, createdAt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, name, phone, email, role, district, createdAt`,
      [
        adminData.id,
        adminData.name,
        adminData.phone,
        adminData.email,
        adminData.role,
        adminData.district,
        adminData.languages,
        passwordHash,
        false,
        new Date()
      ]
    );

    const createdUser = result.rows[0];

    return Response.json({ 
      success: true,
      message: "New admin account created successfully for superadmin dashboard access",
      credentials: {
        phone: adminData.phone,
        password: adminData.password,
        name: adminData.name,
        email: adminData.email,
        role: adminData.role,
        redirectUrl: "/admin"
      },
      user: {
        id: createdUser.id,
        name: createdUser.name,
        phone: createdUser.phone,
        email: createdUser.email,
        role: createdUser.role,
        district: createdUser.district,
        createdAt: createdUser.createdAt
      },
      instructions: [
        "1. Go to /auth/signin",
        "2. Enter phone: 0788888888",
        "3. Enter password: Admin123!",
        "4. You will be redirected to /admin dashboard"
      ]
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
