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
  const superAdminPassword = await bcrypt.hash("SuperAdmin@2024!", 10);

  // Create SuperAdmin user only
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
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

