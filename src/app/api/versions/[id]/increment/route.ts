import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = await params.id;
  
  try {
    // Check if version exists
    const version = await prisma.promptVersion.findUnique({
      where: { id },
    });
    
    if (!version) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }
    
    // Increment the trigger count
    const updatedVersion = await prisma.promptVersion.update({
      where: { id },
      data: {
        triggerCount: {
          increment: 1,
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      triggerCount: updatedVersion.triggerCount,
    });
  } catch (error) {
    console.error(`Error incrementing trigger count for version ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to increment trigger count", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 