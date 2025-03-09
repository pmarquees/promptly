const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Try to connect to the database
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if we can query the database
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} users in the database`);
    
    console.log('Database check completed successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 