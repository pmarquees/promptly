import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = await params.id;
  
  try {
    // Parse request body
    const body = await request.json();
    const { metric, value } = body;
    
    if (!metric || value === undefined) {
      return NextResponse.json(
        { error: "Metric name and value are required" },
        { status: 400 }
      );
    }
    
    // Check if version exists
    const version = await prisma.promptVersion.findUnique({
      where: { id },
      select: { performance: true },
    });
    
    if (!version) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }
    
    // Update the performance metrics
    const currentPerformance = version.performance as Record<string, number> || {};
    
    const updatedVersion = await prisma.promptVersion.update({
      where: { id },
      data: {
        performance: {
          ...currentPerformance,
          [metric]: value,
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      performance: updatedVersion.performance,
    });
  } catch (error) {
    console.error(`Error updating performance for version ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to update performance", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 