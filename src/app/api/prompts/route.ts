import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/utils";

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
    
    // Create the prompt in the database
    const prompt = await prisma.prompt.create({
      data: {
        id,
        name: body.name,
        description: body.description || "",
        content: body.content,
        variables: body.variables || [],
        createdBy: body.createdBy || "Anonymous",
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