const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        phone: true,
        name: true,
        role: true,
        passwordHash: true
      }
    });
    
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`Phone: ${user.phone}, Name: ${user.name}, Role: ${user.role}, HasPassword: ${!!user.passwordHash}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
