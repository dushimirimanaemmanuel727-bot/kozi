const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://kazi_user:kazi_password@localhost:5433/kazi_home'
});

async function main() {
  try {
    console.log('Starting migration...');
    
    // Add missing columns to WorkerProfile
    await pool.query(`
      ALTER TABLE "WorkerProfile" 
      ADD COLUMN IF NOT EXISTS "liveIn" BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS "passportNumber" VARCHAR(50),
      ADD COLUMN IF NOT EXISTS "passportUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "age" INTEGER,
      ADD COLUMN IF NOT EXISTS "gender" VARCHAR(20),
      ADD COLUMN IF NOT EXISTS "rating" DECIMAL(3,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "viewCount" INTEGER DEFAULT 0;
    `);
    console.log('WorkerProfile updated.');

    // Create EmployerProfile table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "EmployerProfile" (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        "companyName" VARCHAR(255),
        "website" VARCHAR(255),
        "description" TEXT,
        "industry" VARCHAR(100),
        "companySize" VARCHAR(50),
        "rating" DECIMAL(3,2) DEFAULT 0,
        "reviewCount" INTEGER DEFAULT 0,
        "logoUrl" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('EmployerProfile created.');

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
