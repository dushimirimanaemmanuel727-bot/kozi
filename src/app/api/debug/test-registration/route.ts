import { query } from '@/lib/db';

export async function GET() {
  try {
    // Count users by role
    const userCountByRole = await query(`
      SELECT role, COUNT(*) as count 
      FROM "User" 
      GROUP BY role
    `);

    // Count profiles
    const workerProfileCount = await query('SELECT COUNT(*) as count FROM "WorkerProfile"');
    const employerProfileCount = await query('SELECT COUNT(*) as count FROM "EmployerProfile"');

    return Response.json({ 
      success: true,
      usersByRole: userCountByRole.rows,
      workerProfileCount: workerProfileCount.rows[0].count,
      employerProfileCount: employerProfileCount.rows[0].count
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ 
      success: false, 
      error: errorMessage
    }, { status: 500 });
  }
}
