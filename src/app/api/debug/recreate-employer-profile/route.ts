import { query } from '@/lib/db';

export async function POST() {
  try {
    // Drop existing table
    await query('DROP TABLE IF EXISTS "EmployerProfile"');

    // Create new EmployerProfile table
    await query(`
      CREATE TABLE "EmployerProfile" (
        id TEXT PRIMARY KEY,
        "userId" TEXT UNIQUE NOT NULL,
        "companyName" TEXT,
        "website" TEXT,
        "description" TEXT,
        "industry" TEXT,
        "companySize" TEXT,
        rating DOUBLE PRECISION DEFAULT 0,
        "reviewCount" INTEGER DEFAULT 0,
        "logoUrl" TEXT,
        "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
        "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
        FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
      )
    `);

    // Check table structure
    const employerProfileResult = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'EmployerProfile' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    return Response.json({ 
      message: "EmployerProfile table recreated successfully",
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
