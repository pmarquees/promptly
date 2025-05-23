import { prisma } from "./prisma";

// Helper function to ensure user exists in database
export async function ensureUserExists(session: any) {
  if (!session?.user?.id) {
    throw new Error("No user ID in session");
  }

  let user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });
  
  // If user doesn't exist, create them
  if (!user) {
    console.log("Creating user for session:", { 
      id: session.user.id, 
      email: session.user.email, 
      name: session.user.name 
    });
    
    user = await prisma.user.create({
      data: {
        id: session.user.id,
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null,
      }
    });
    
    console.log("Created user:", user);
  }
  
  return user;
} 