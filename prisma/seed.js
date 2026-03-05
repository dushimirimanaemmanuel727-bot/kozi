const { PrismaClient } = require("@prisma/client");
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

  const employer = await prisma.user.create({
    data: {
      name: "Acme Family",
      phone: "+250780000001",
      role: "EMPLOYER",
      district: "GASABO",
      languages: "kinyarwanda,en",
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
        workerProfile: {
          create: {
            category: "NANNY",
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
        workerProfile: {
          create: {
            category: "CLEANER",
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
        workerProfile: {
          create: {
            category: "COOK",
            availability: "LIVE_OUT",
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

  await prisma.job.create({
    data: {
      employerId: employer.id,
      title: "Live-in nanny for 2-year-old",
      category: "NANNY",
      description: "Looking for a caring nanny, weekdays and some weekends.",
      budget: 180000,
      district: "GASABO",
    },
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

