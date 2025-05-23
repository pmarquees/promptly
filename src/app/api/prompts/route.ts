import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateApiKey } from "@/lib/apiAuth";

export async function GET(request: NextRequest) {
  try {
    // Validate API key authentication
    const authResult = await validateApiKey(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Fetch all prompts from the database for the authenticated user
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
        isActive: true,
        createdBy: authResult.userId
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
    // Validate API key authentication
    const authResult = await validateApiKey(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
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
    
    // Create the prompt in the database
    const prompt = await prisma.prompt.create({
      data: {
        id,
        name: body.name,
        description: body.description || "",
        content: body.content,
        variables: body.variables || [],
        createdBy: authResult.userId!,
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