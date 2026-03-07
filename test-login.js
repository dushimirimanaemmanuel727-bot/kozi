const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testLogin() {
  try {
    const phone = '+250780000001';
    const password = 'password123';
    
    console.log('Testing login for phone:', phone);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { phone: phone }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', user.name);
    console.log('Has password hash:', !!user.passwordHash);
    
    // Test password
    if (!user.passwordHash) {
      console.log('No password hash found');
      return;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    console.log('Password valid:', isPasswordValid);
    
    if (isPasswordValid) {
      console.log('Login should succeed!');
    } else {
      console.log('Login should fail - invalid password');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
