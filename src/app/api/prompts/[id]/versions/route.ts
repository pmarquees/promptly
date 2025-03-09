import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/utils";

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
    
    // Create the version
    const version = await prisma.promptVersion.create({
      data: {
        id,
        promptId,
        name: body.name,
        content: body.content,
        variables: body.variables || [],
        createdBy: body.createdBy || "Anonymous",
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