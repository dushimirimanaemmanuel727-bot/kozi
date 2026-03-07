const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
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
  const employerPassword = await bcrypt.hash("password123", 10);
  const workerPassword = await bcrypt.hash("password123", 10);
  const superAdminPassword = await bcrypt.hash("SuperAdmin@2024!", 10);

  // Create SuperAdmin user first
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

  console.log("✅ SuperAdmin created:");
  console.log("   Phone: +250780000000");
  console.log("   Password: SuperAdmin@2024!");
  console.log("   Email: admin@kazihome.rw");
  console.log("   Role: SUPERADMIN");

  const employer = await prisma.user.create({
    data: {
      name: "Acme Family",
      phone: "+250780000001",
      role: "EMPLOYER",
      district: "GASABO",
      languages: "kinyarwanda,en",
      passwordHash: employerPassword,
      employerProfile: { create: { organization: "Home" } },
    },
  });

  const workers = await prisma.$transaction([
    prisma.user.create({
      data: {
        name: "Aline",
        phone: "+250780000101",
        role: "WORKER",
        district: "KICUKIRO",
        languages: "kinyarwanda,fr",
        passwordHash: workerPassword,
        workerProfile: {
          create: {
            category: "Childcare",
            availability: "FULL_TIME",
            experienceYears: 4,
            liveIn: true,
            minMonthlyPay: 150000,
            skills: "childcare, light cooking",
            bio: "Caring nanny with first aid basics",
            rating: 4.6,
            reviewCount: 8,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Eric",
        phone: "+250780000102",
        role: "WORKER",
        district: "NYARUGENGE",
        languages: "kinyarwanda,en",
        passwordHash: workerPassword,
        workerProfile: {
          create: {
            category: "Cleaning",
            availability: "PART_TIME",
            experienceYears: 3,
            liveIn: false,
            minMonthlyPay: 90000,
            skills: "deep cleaning, laundry, ironing",
            bio: "Reliable cleaner for apartments and offices",
            rating: 4.4,
            reviewCount: 5,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Claudine",
        phone: "+250780000103",
        role: "WORKER",
        district: "GASABO",
        languages: "kinyarwanda,fr",
        passwordHash: workerPassword,
        workerProfile: {
          create: {
            category: "Cooking",
            availability: "FULL_TIME",
            experienceYears: 6,
            liveIn: false,
            minMonthlyPay: 200000,
            skills: "rwandan cuisine, healthy meals",
            bio: "Home cook with 6 years experience",
            rating: 4.8,
            reviewCount: 12,
          },
        },
      },
    }),
  ]);

  // Create multiple sample jobs for the landing page
  await prisma.job.createMany({
    data: [
      {
        employerId: employer.id,
        title: "Live-in nanny for 2-year-old",
        category: "Childcare",
        description: "Looking for a caring nanny, weekdays and some weekends. Must have experience with toddlers.",
        budget: 180000,
        district: "GASABO",
      },
      {
        employerId: employer.id,
        title: "Weekend Housekeeping",
        category: "Housekeeping",
        description: "Need reliable housekeeper for weekend cleaning and laundry. 6 hours per weekend.",
        budget: 80000,
        district: "NYARUGENGE",
      },
      {
        employerId: employer.id,
        title: "Daily Family Cooking",
        category: "Cooking",
        description: "Seeking experienced cook for daily family meals. Monday to Friday, 8am-2pm.",
        budget: 120000,
        district: "KICUKIRO",
      },
      {
        employerId: employer.id,
        title: "Elderly Care Assistant",
        category: "Elderly Care",
        description: "Looking for compassionate caregiver for elderly person. Help with daily activities and companionship.",
        budget: 150000,
        district: "GASABO",
      }
    ]
  });

  console.log(`Seeded ${workers.length} workers and 1 employer`);
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

