const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@synergies4.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', email);
      console.log('Password:', password);
      return;
    }

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', admin.id);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 