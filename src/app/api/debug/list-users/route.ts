import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get all users with their basic info (excluding passwords)
    const result = await query(`
      SELECT id, name, phone, email, role, district, suspended, createdat
      FROM "User" 
      ORDER BY createdat DESC
      LIMIT 10
    `);

    return Response.json({ 
      success: true,
      users: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
