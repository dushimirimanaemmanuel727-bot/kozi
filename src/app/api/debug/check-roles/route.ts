import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get all current roles in the database
    const rolesResult = await query(`
      SELECT DISTINCT role, COUNT(*) as count 
      FROM "User" 
      GROUP BY role
    `);

    // Try to insert a test superadmin to see the exact constraint error
    try {
      await query(`
        INSERT INTO "User" (id, name, phone, role, passwordhash, suspended, createdAt)
        VALUES ('test', 'test', '0000000000', 'superadmin', 'hash', false, NOW())
      `);
      await query(`DELETE FROM "User" WHERE id = 'test'`);
      return Response.json({ 
        success: true,
        message: "Superadmin role is allowed",
        currentRoles: rolesResult.rows
      });
    } catch (constraintError) {
      return Response.json({ 
        success: false,
        constraintError: constraintError instanceof Error ? constraintError.message : 'Unknown constraint error',
        currentRoles: rolesResult.rows
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
