import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Check if the test exists
    const test = await prisma.aBTest.findUnique({
      where: { id },
      select: { id: true, createdBy: true },
    });
    
    if (!test) {
      return NextResponse.json(
        { error: "A/B test not found" },
        { status: 404 }
      );
    }
    
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    // Check if the user is authorized to delete this test
    if (session?.user?.id !== test.createdBy) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    
    // Delete the test
    await prisma.aBTest.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting A/B test:", error);
    return NextResponse.json(
      { error: "Failed to delete A/B test", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 