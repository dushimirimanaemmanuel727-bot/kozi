import bcrypt from 'bcryptjs';
import { query } from './src/lib/db.ts';

async function createSuperAdmin() {
  try {
    const adminData = {
      id: `admin_${Date.now()}`,
      name: "Super Admin",
      phone: "0750000001",
      email: "superadmin@kazihome.com",
      role: "admin",
      district: "KIGALI",
      languages: ["English", "Kinyarwanda"],
      password: "SuperAdmin123!"
    };

    console.log('Creating superadmin account...');

    // Check if admin already exists
    const existingUser = await query('SELECT * FROM "User" WHERE phone = $1', [adminData.phone]);
    
    if (existingUser.rows.length > 0) {
      console.log('Admin with this phone number already exists');
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(adminData.password, 12);

    // Create admin user
    const result = await query(
      `INSERT INTO "User" (
        id, name, phone, email, role, district, languages, 
        passwordhash, suspended, createdAt
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

    console.log('✅ Superadmin created successfully!');
    console.log('Credentials:');
    console.log(`Phone: ${adminData.phone}`);
    console.log(`Password: ${adminData.password}`);
    console.log(`Name: ${adminData.name}`);
    console.log(`Email: ${adminData.email}`);
    console.log(`Role: ${adminData.role}`);
    console.log('\nNote: Admin role has superadmin privileges in the system');

  } catch (error) {
    console.error('Error creating superadmin:', error);
  }
}

createSuperAdmin();
