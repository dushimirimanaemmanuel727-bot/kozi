import { query } from '@/lib/db';

export async function POST() {
  try {
    // Get all users without WorkerProfile
    const workersWithoutProfile = await query(`
      SELECT u.id, u.role
      FROM "User" u
      LEFT JOIN "WorkerProfile" wp ON u.id = wp."userId"
      WHERE u.role = 'worker' AND wp."userId" IS NULL
    `);

    const employersWithoutProfile = await query(`
      SELECT u.id, u.role
      FROM "User" u
      LEFT JOIN "EmployerProfile" ep ON u.id = ep."userId"
      WHERE u.role = 'employer' AND ep."userId" IS NULL
    `);

    let createdWorkerProfiles = 0;
    let createdEmployerProfiles = 0;

    // Create missing WorkerProfiles
    for (const worker of workersWithoutProfile.rows) {
      await query(`
        INSERT INTO "WorkerProfile" (
          id, 
          "userId", 
          category, 
          skills, 
          "experienceYears", 
          availability, 
          "minMonthlyPay", 
          "liveIn", 
          bio, 
          "nationalId", 
          "passportNumber", 
          age, 
          gender,
          rating,
          "reviewCount",
          "viewCount",
          "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, now()
        )
      `, [
        `worker_${worker.id}_${Date.now()}`,
        worker.id,
        'GENERAL',        // $3 category
        '',              // $4 skills
        0,               // $5 experienceYears
        'FULL_TIME',     // $6 availability
        null,            // $7 minMonthlyPay
        false,           // $8 liveIn
        '',              // $9 bio
        '',              // $10 nationalId
        '',              // $11 passportNumber
        null,            // $12 age
        '',              // $13 gender
        0,               // $14 rating
        0,               // $15 reviewCount
        0                // $16 viewCount
      ]);
      createdWorkerProfiles++;
    }

    // Create missing EmployerProfiles
    for (const employer of employersWithoutProfile.rows) {
      await query(`
        INSERT INTO "EmployerProfile" (
          id, 
          "userId", 
          "companyName", 
          "website", 
          "description", 
          "industry", 
          "companySize", 
          rating,
          "reviewCount",
          "logoUrl",
          "createdAt", 
          "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now()
        )
      `, [
        `employer_${employer.id}_${Date.now()}`,
        employer.id,
        null,
        null,
        null,
        null,
        null,
        0,
        0,
        null
      ]);
      createdEmployerProfiles++;
    }

    return Response.json({ 
      success: true,
      message: "Missing profiles created successfully",
      createdWorkerProfiles,
      createdEmployerProfiles,
      workersWithoutProfile: workersWithoutProfile.rows.length,
      employersWithoutProfile: employersWithoutProfile.rows.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ 
      success: false, 
      error: errorMessage
    }, { status: 500 });
  }
}
