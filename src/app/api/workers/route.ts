import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const district = searchParams.get("district");
  const availability = searchParams.get("availability");
  const minExp = searchParams.get("minExp");
  const liveIn = searchParams.get("liveIn");
  const q = searchParams.get("q");

  let sql = `
    SELECT 
      wp.id, wp.category, wp.availability, wp."liveIn", wp."experienceYears", 
      wp.rating, wp."reviewCount", wp."photoUrl", wp.skills, wp.bio, wp."minMonthlyPay",
      u.id as user_id, u.name as user_name, u.phone as user_phone, 
      u.district as user_district, u.languages as user_languages
    FROM "WorkerProfile" wp
    JOIN "User" u ON wp."userId" = u.id
    WHERE u.role = 'worker'
  `;
  
  const params: any[] = [];
  let paramIndex = 1;

  if (category) {
    sql += ` AND wp.category = $${paramIndex++}`;
    params.push(category);
  }
  if (district) {
    sql += ` AND u.district = $${paramIndex++}`;
    params.push(district);
  }
  if (availability) {
    sql += ` AND wp.availability = $${paramIndex++}`;
    params.push(availability);
  }
  if (liveIn === "true") {
    sql += ` AND wp."liveIn" = true`;
  }
  if (minExp) {
    sql += ` AND wp."experienceYears" >= $${paramIndex++}`;
    params.push(Number(minExp) || 0);
  }
  if (q) {
    sql += ` AND (wp.skills ILIKE $${paramIndex} OR wp.bio ILIKE $${paramIndex})`;
    params.push(`%${q}%`);
    paramIndex++;
  }

  sql += ` ORDER BY wp.rating DESC, wp."reviewCount" DESC LIMIT 50`;

  const result = await query(sql, params);
  const workers = result.rows;

  const data = workers.map((w: any) => ({
    id: w.id,
    category: w.category,
    availability: w.availability,
    liveIn: w.liveIn,
    experienceYears: w.experienceYears,
    rating: w.rating,
    reviewCount: w.reviewCount,
    photoUrl: w.photoUrl,
    skills: w.skills,
    bio: w.bio,
    minMonthlyPay: w.minMonthlyPay ? Number(w.minMonthlyPay) : null,
    user: {
      id: w.user_id,
      name: w.user_name,
      phone: w.user_phone,
      district: w.user_district,
      languages: w.user_languages,
    },
  }));

  return NextResponse.json(data);
}
