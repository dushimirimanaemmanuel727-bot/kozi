import { query } from '@/lib/db';

export async function POST() {
  try {
    // Create EmployerProfile table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS "EmployerProfile" (
        id TEXT PRIMARY KEY,
        "userId" TEXT UNIQUE NOT NULL,
        "companyName" TEXT,
        "website" TEXT,
        "description" TEXT,
        "industry" TEXT,
        "companySize" TEXT,
        "rating" DOUBLE PRECISION DEFAULT 0,
        "reviewCount" INTEGER DEFAULT 0,
        "logoUrl" TEXT,
        "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
      )
    `);

    // Add missing columns to WorkerProfile table
    const addAgeColumn = await query(`
      ALTER TABLE "WorkerProfile" 
      ADD COLUMN IF NOT EXISTS "age" INTEGER
    `);

    const addGenderColumn = await query(`
      ALTER TABLE "WorkerProfile" 
      ADD COLUMN IF NOT EXISTS "gender" TEXT
    `);

    // Also add updatedAt column if it doesn't exist
    const addUpdatedAtColumn = await query(`
      ALTER TABLE "WorkerProfile" 
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
    `);

    // Check updated table structures
    const workerProfileResult = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'WorkerProfile' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    const employerProfileResult = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'EmployerProfile' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    return Response.json({ 
      message: "Tables and columns created/updated successfully",
      workerProfileTable: {
        columns: workerProfileResult.rows,
        count: workerProfileResult.rows.length
      },
      employerProfileTable: {
        columns: employerProfileResult.rows,
        count: employerProfileResult.rows.length
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
