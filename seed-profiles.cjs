const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://kazi_user:kazi_password@localhost:5433/kazi_home' });

async function seed() {
  try {
    const profiles = [
      {
        userid: 1,
        category: 'NANNY',
        skills: 'Cooking, Baby care, First aid',
        experienceyears: 5,
        availability: 'FULL_TIME',
        minmonthlypay: 150000,
        bio: 'Experienced nanny with 5 years experience in Kigali.',
        location: 'GASABO',
        rating: 4.8,
        reviewCount: 12,
        liveIn: true
      },
      {
        userid: 2,
        category: 'COOK',
        skills: 'Rwandan cuisine, International dishes, Pastry',
        experienceyears: 3,
        availability: 'PART_TIME',
        minmonthlypay: 80000,
        bio: 'Passionate cook with a focus on healthy meals.',
        location: 'KICUKIRO',
        rating: 4.5,
        reviewCount: 8,
        liveIn: false
      }
    ];

    for (const p of profiles) {
      await pool.query(`
        INSERT INTO "WorkerProfile" (
          userid, category, skills, experienceyears, availability, 
          minmonthlypay, bio, location, rating, "reviewCount", "liveIn"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        p.userid, p.category, p.skills, p.experienceyears, p.availability,
        p.minmonthlypay, p.bio, p.location, p.rating, p.reviewCount, p.liveIn
      ]);
    }
    console.log('Worker profiles seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
