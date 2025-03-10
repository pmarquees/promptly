import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = await params.id;
  
  try {
    // Check if prompt exists
    const prompt = await prisma.prompt.findUnique({
      where: { id },
    });
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }
    
    // Increment the trigger count
    const updatedPrompt = await prisma.prompt.update({
      where: { id },
      data: {
        triggerCount: {
          increment: 1,
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      triggerCount: updatedPrompt.triggerCount,
    });
  } catch (error) {
    console.error(`Error incrementing trigger count for prompt ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to increment trigger count", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 