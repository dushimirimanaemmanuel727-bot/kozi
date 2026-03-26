import { query } from '@/lib/db';

export async function POST() {
  try {
    // Add passwordHash column if it doesn't exist
    const result = await query(`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "passwordHash" VARCHAR(255)
    `);

    return Response.json({ 
      success: true, 
      message: 'passwordHash column added successfully',
      result 
    });
  } catch (error) {
    console.error('Error adding passwordHash column:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
