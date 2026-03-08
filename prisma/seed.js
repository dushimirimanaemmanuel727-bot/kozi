import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function run() {
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords for seed users
  const superAdminPassword = await bcrypt.hash("SuperAdmin@2024!", 10);
  const employerPassword = await bcrypt.hash("Employer@2024!", 10);

  // Create SuperAdmin user
  const superAdmin = await prisma.user.create({
    data: {
      name: "System Administrator",
      phone: "+250780000000",
      email: "admin@kazihome.rw",
      role: "SUPERADMIN",
      district: "KIGALI",
      languages: "kinyarwanda,en,fr",
      passwordHash: superAdminPassword,
    },
  });

  // Create test employer
  const employer = await prisma.user.create({
    data: {
      name: "John Mugisha",
      phone: "+250788123456",
      email: "john.mugisha@example.com",
      role: "EMPLOYER",
      district: "KIGALI",
      languages: "kinyarwanda,en",
      passwordHash: employerPassword,
    },
  });

  // Create employer profile
  const employerProfile = await prisma.employerProfile.create({
    data: {
      userId: employer.id,
      organization: "Mugishi Family",
    },
  });

  // Create sample jobs
  const sampleJobs = [
    {
      title: "Experienced Housekeeper Needed",
      category: "Housekeeping",
      description: "We need a reliable housekeeper for daily cleaning and maintenance of our 3-bedroom house. Duties include vacuuming, mopping, dusting, and organizing.",
      budget: 45000,
      district: "KIGALI",
      employerId: employer.id,
      status: "OPEN",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    {
      title: "Part-time Cook for Family",
      category: "Cooking",
      description: "Seeking an experienced cook to prepare meals for our family of 4. Must be knowledgeable about Rwandan and international cuisine.",
      budget: 60000,
      district: "KIGALI",
      employerId: employer.id,
      status: "OPEN",
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    },
    {
      title: "Childcare Provider for Toddlers",
      category: "Childcare",
      description: "Looking for a caring and experienced childcare provider for our 2-year-old. Previous experience with toddlers required.",
      budget: 55000,
      district: "NYABHUGO",
      employerId: employer.id,
      status: "OPEN",
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    },
    {
      title: "Weekend Laundry Assistant",
      category: "Laundry",
      description: "Need help with laundry services on weekends. Must be familiar with different fabric types and ironing techniques.",
      budget: 25000,
      district: "KIGALI",
      employerId: employer.id,
      status: "OPEN",
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    },
    {
      title: "Home Gardener",
      category: "Gardening",
      description: "Seeking a skilled gardener to maintain our small garden and lawn. Knowledge of local plants and seasonal care required.",
      budget: 35000,
      district: "KICUKIRO",
      employerId: employer.id,
      status: "OPEN",
      deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days from now
    },
    {
      title: "Elderly Care Assistant",
      category: "Elderly Care",
      description: "Looking for a compassionate caregiver to assist with elderly family member. Experience with elderly care essential.",
      budget: 70000,
      district: "GASABO",
      employerId: employer.id,
      status: "OPEN",
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    }
  ];

  // Create the sample jobs
  for (const jobData of sampleJobs) {
    await prisma.job.create({
      data: jobData,
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log("✅ SuperAdmin created:");
  console.log("   Phone: +250780000000");
  console.log("   Password: SuperAdmin@2024!");
  console.log("   Email: admin@kazihome.rw");
  console.log("   Role: SUPERADMIN");
  console.log("✅ Test employer created:");
  console.log("   Phone: +250788123456");
  console.log("   Password: Employer@2024!");
  console.log("   Email: john.mugisha@example.com");
  console.log("   Role: EMPLOYER");
  console.log(`✅ Created ${sampleJobs.length} sample jobs`);
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

