import { NextRequest } from "next/server";
import { prisma } from "./prisma";

export async function validateApiKey(request: NextRequest): Promise<{ valid: boolean; userId?: string; error?: string }> {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader) {
    return { valid: false, error: "Missing authorization header" };
  }
  
  if (!authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Invalid authorization header format. Expected 'Bearer <token>'" };
  }
  
  const token = authHeader.substring(7); // Remove "Bearer " prefix
  
  if (!token) {
    return { valid: false, error: "Missing API key" };
  }
  
  try {
    // Find the API key in the database
    const apiKey = await prisma.apiKey.findUnique({
      where: { 
        key: token,
        isActive: true
      },
      include: {
        user: true
      }
    });
    
    if (!apiKey) {
      return { valid: false, error: "Invalid API key" };
    }
    
    // Check if the API key has expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return { valid: false, error: "API key has expired" };
    }
    
    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() }
    });
    
    return { valid: true, userId: apiKey.userId };
  } catch (error) {
    console.error("Error validating API key:", error);
    return { valid: false, error: "Internal server error" };
  }
}

export function generateApiKey(): string {
  const prefix = "pk_";
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const key = prefix + Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return key;
}