import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    console.log('Test Workers API called');

    // Start with the simplest possible query
    let sql = `
      SELECT COUNT(*) as worker_count
      FROM "User" u
      WHERE u.role = 'worker'
    `;

    console.log('Test 1 - Counting workers:', sql);
    const countResult = await query(sql);
    const workerCount = countResult.rows[0].worker_count;
    console.log('Found workers in User table:', workerCount);

    // Test if WorkerProfile table exists and has data
    sql = `
      SELECT COUNT(*) as profile_count
      FROM "WorkerProfile"
    `;

    console.log('Test 2 - Counting profiles:', sql);
    const profileResult = await query(sql);
    const profileCount = profileResult.rows[0].profile_count;
    console.log('Found WorkerProfile records:', profileCount);

    // Test the join with minimal columns
    sql = `
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.role as user_role
      FROM "User" u
      WHERE u.role = 'worker'
      LIMIT 5
    `;

    console.log('Test 3 - Simple user query:', sql);
    const userResult = await query(sql);
    console.log('Sample users:', userResult.rows.length);

    return NextResponse.json({
      message: "Test completed successfully",
      workerCount,
      profileCount,
      sampleUsers: userResult.rows
    });

  } catch (error) {
    console.error("Test Workers API error:", error);
    return NextResponse.json(
      { error: "Test failed", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
