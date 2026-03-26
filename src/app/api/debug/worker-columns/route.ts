import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Check WorkerProfile table structure
    const workerProfileResult = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'WorkerProfile' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    // Check User table structure
    const userResult = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    // Test a simple query to see if we can fetch any workers
    const testQuery = await query(`
      SELECT COUNT(*) as count
      FROM "WorkerProfile" wp
      JOIN "User" u ON wp.userid = u.id
      WHERE u.role = 'worker'
    `);

    return NextResponse.json({ 
      message: "Debug information retrieved successfully",
      workerProfileColumns: workerProfileResult.rows,
      userColumns: userResult.rows,
      workerCount: testQuery.rows[0].count
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Debug failed", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
