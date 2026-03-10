import { query } from '@/lib/db';

export async function GET() {
  try {
    // Check User table structure
    const userResult = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    // Check WorkerProfile table structure
    const workerProfileResult = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'WorkerProfile' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    // Check if WorkerProfile table exists
    const tableExistsResult = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'WorkerProfile'
      ) as exists
    `);
    
    return Response.json({ 
      userTable: {
        columns: userResult.rows,
        count: userResult.rows.length
      },
      workerProfileTable: {
        exists: tableExistsResult.rows[0].exists,
        columns: workerProfileResult.rows,
        count: workerProfileResult.rows.length
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
