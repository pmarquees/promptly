import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const promptId = params.id;
  
  try {
    // Check if prompt exists
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    });
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }
    
    // Fetch versions for this prompt
    const versions = await prisma.promptVersion.findMany({
      where: { promptId },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(versions);
  } catch (error) {
    console.error("Error fetching versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch versions", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const promptId = params.id;
  
  try {
    // Check if prompt exists
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    });
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }
    
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
    
    // If no user is authenticated, use the same user as the prompt creator
    if (!userId) {
      userId = prompt.createdBy;
    }
    
    // Create the version
    const version = await prisma.promptVersion.create({
      data: {
        id,
        promptId,
        name: body.name,
        content: body.content,
        variables: body.variables || [],
        createdBy: userId,
        isActive: body.isActive !== undefined ? body.isActive : false,
        triggerCount: 0,
      },
    });
    
    return NextResponse.json(version, { status: 201 });
  } catch (error) {
    console.error("Error creating version:", error);
    return NextResponse.json(
      { error: "Failed to create version", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 