import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Fetch all prompts from the database
    const prompts = await prisma.prompt.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        content: true,
        variables: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        isActive: true,
        triggerCount: true,
        currentVersionId: true,
        tags: true
      },
      where: {
        isActive: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    return NextResponse.json(prompts);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompts", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.content) {
      return NextResponse.json(
        { error: "Name and content are required" },
        { status: 400 }
      );
    }
    
    // Generate ID if not provided
    const id = body.id || generateId();
    
    // Get the current user session
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;
    
    // If no user is authenticated, use a default user or create one
    if (!userId) {
      // Find or create a default user
      const defaultUser = await prisma.user.findFirst({
        where: { email: "anonymous@example.com" }
      });
      
      if (defaultUser) {
        userId = defaultUser.id;
      } else {
        // Create a default user if none exists
        const newUser = await prisma.user.create({
          data: {
            name: "Anonymous",
            email: "anonymous@example.com",
          }
        });
        userId = newUser.id;
      }
    }
    
    // Create the prompt in the database
    const prompt = await prisma.prompt.create({
      data: {
        id,
        name: body.name,
        description: body.description || "",
        content: body.content,
        variables: body.variables || [],
        createdBy: userId,
        isActive: body.isActive !== undefined ? body.isActive : true,
        triggerCount: 0,
        tags: body.tags || [],
      },
    });
    
    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error("Error creating prompt:", error);
    return NextResponse.json(
      { error: "Failed to create prompt", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 