import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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