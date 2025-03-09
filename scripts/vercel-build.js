const { execSync } = require('child_process');

// Log the start of the build process
console.log('Starting Vercel build process...');

try {
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Push schema to database
  console.log('Pushing schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  // Build Next.js app
  console.log('Building Next.js app...');
  execSync('next build', { stdio: 'inherit' });

  console.log('Build process completed successfully!');
} catch (error) {
  console.error('Build process failed:', error);
  process.exit(1);
} 