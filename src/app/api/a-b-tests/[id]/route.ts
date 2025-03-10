import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    
    // Fetch the A/B test from the database
    const test = await prisma.aBTest.findUnique({
      where: { id },
      include: {
        prompt: {
          select: {
            id: true,
            name: true,
          },
        },
        versions: {
          include: {
            version: {
              select: {
                id: true,
                name: true,
                content: true,
                variables: true,
                triggerCount: true,
                performance: true,
              },
            },
          },
        },
      },
    });
    
    if (!test) {
      return NextResponse.json(
        { error: "A/B test not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(test);
  } catch (error) {
    console.error(`Error fetching A/B test:`, error);
    return NextResponse.json(
      { error: "Failed to fetch A/B test", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    const body = await request.json();
    
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
    
    // Check if the user is authorized to update this test
    if (session?.user?.id !== test.createdBy) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    
    // Update the test
    const updatedTest = await prisma.aBTest.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        isActive: body.isActive,
        endDate: body.endDate ? new Date(body.endDate) : null,
        metrics: body.metrics,
      },
    });
    
    return NextResponse.json(updatedTest);
  } catch (error) {
    console.error(`Error updating A/B test:`, error);
    return NextResponse.json(
      { error: "Failed to update A/B test", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    const body = await request.json();
    
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
    
    // Check if the user is authorized to update this test
    if (session?.user?.id !== test.createdBy) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    
    // Update the test results
    const updatedTest = await prisma.aBTest.update({
      where: { id },
      data: {
        results: body.results,
      },
    });
    
    return NextResponse.json(updatedTest);
  } catch (error) {
    console.error(`Error updating A/B test results:`, error);
    return NextResponse.json(
      { error: "Failed to update A/B test results", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 