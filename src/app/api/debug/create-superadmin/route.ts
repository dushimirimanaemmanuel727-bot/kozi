import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const adminData = {
      id: `admin_${Date.now()}`,
      name: "Super Admin",
      phone: "0750000001", // Unique phone number
      email: "superadmin@kazihome.com",
      role: "admin", // Use admin role instead of superadmin
      district: "KIGALI",
      languages: ["English", "Kinyarwanda"],
      password: "SuperAdmin123!" // Default password
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
      message: "Superadmin (admin role) created successfully",
      credentials: {
        phone: adminData.phone,
        password: adminData.password,
        name: adminData.name,
        email: adminData.email,
        role: adminData.role,
        note: "Admin role has superadmin privileges in the system"
      },
      user: {
        id: createdUser.id,
        name: createdUser.name,
        phone: createdUser.phone,
        email: createdUser.email,
        role: createdUser.role,
        district: createdUser.district,
        createdAt: createdUser.createdAt
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
