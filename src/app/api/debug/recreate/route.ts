import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Drop and recreate the User table with correct schema
    await query('DROP TABLE IF EXISTS "User" CASCADE');
    
    await query(`
      CREATE TABLE "User" (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(20) UNIQUE NOT NULL,
          email VARCHAR(255),
          role VARCHAR(50) NOT NULL CHECK (role IN ('worker', 'employer', 'admin')),
          district VARCHAR(100),
          languages TEXT[],
          passwordHash VARCHAR(255),
          suspended BOOLEAN DEFAULT false,
          suspensionReason TEXT,
          suspendedAt TIMESTAMP,
          suspendedBy VARCHAR(255),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await query('CREATE INDEX idx_user_phone ON "User"(phone)');
    await query('CREATE INDEX idx_user_role ON "User"(role)');
    
    // Insert default admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    await query(`
      INSERT INTO "User" (id, name, phone, email, role, passwordHash, createdAt) VALUES 
      ('admin_1', 'System Administrator', '1234567890', 'admin@kazi-home.com', 'admin', 
      $1, CURRENT_TIMESTAMP)
    `, [adminPasswordHash]);
    
    return Response.json({ 
      success: true, 
      message: 'User table recreated successfully' 
    });
  } catch (error) {
    console.error('Recreation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ 
      error: errorMessage,
      details: error
    }, { status: 500 });
  }
}
