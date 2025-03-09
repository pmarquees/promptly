#!/bin/bash

echo "Testing build process..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Push schema to database
echo "Pushing schema to database..."
npx prisma db push

# Build Next.js app
echo "Building Next.js app..."
next build

echo "Build process completed!" 