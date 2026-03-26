import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const district = searchParams.get("district");
    const availability = searchParams.get("availability");
    const minExp = searchParams.get("minExp");
    const liveIn = searchParams.get("liveIn");
    const q = searchParams.get("q");

    console.log('Workers API called with params:', { category, district, availability, minExp, liveIn, q });

    let sql = `
      SELECT 
        wp.id, wp.category, wp.availability, wp.experienceyears, 
        wp.rating, wp.reviewcount, wp.photourl, wp.skills, wp.bio, wp.minmonthlypay,
        u.id as user_id, u.name as user_name, u.phone as user_phone, 
        wp.location as user_district
      FROM "WorkerProfile" wp
      JOIN "User" u ON wp.userid = u.id
      WHERE u.role = 'worker'
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND wp.category = $${paramIndex++}`;
      params.push(category);
    }
    if (district) {
      sql += ` AND wp.location = $${paramIndex++}`;
      params.push(district);
    }
    if (availability) {
      sql += ` AND wp.availability = $${paramIndex++}`;
      params.push(availability);
    }
    if (liveIn === "true") {
      sql += ` AND wp.availability = 'LIVE_IN'`;
    }
    if (minExp) {
      sql += ` AND wp.experienceyears >= $${paramIndex++}`;
      params.push(Number(minExp) || 0);
    }
    if (q) {
      sql += ` AND (wp.skills ILIKE $${paramIndex} OR wp.bio ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    sql += ` ORDER BY wp.rating DESC, wp.reviewcount DESC LIMIT 50`;

    console.log('Executing SQL:', sql);
    console.log('With params:', params);

    const result = await query(sql, params);
    const workers = result.rows;

    console.log('Found workers:', workers.length);

    const data = workers.map((w: any) => ({
      id: w.id,
      category: w.category,
      availability: w.availability,
      liveIn: w.availability === 'LIVE_IN',
      experienceYears: w.experienceyears,
      rating: parseFloat(w.rating) || 0,
      reviewCount: parseInt(w.reviewcount) || 0,
      photoUrl: w.photourl,
      skills: w.skills,
      bio: w.bio,
      minMonthlyPay: w.minmonthlypay ? Number(w.minmonthlypay) : null,
      user: {
        id: w.user_id,
        name: w.user_name,
        phone: w.user_phone,
        district: w.user_district,
      },
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Workers API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
