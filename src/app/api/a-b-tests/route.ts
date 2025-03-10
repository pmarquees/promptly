import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    // Fetch all A/B tests from the database
    const tests = await prisma.aBTest.findMany({
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
              },
            },
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });
    
    return NextResponse.json(tests);
  } catch (error) {
    console.error("Error fetching A/B tests:", error);
    return NextResponse.json(
      { error: "Failed to fetch A/B tests", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.promptId || !body.versionIds || !body.weights || !body.metrics) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Get the current user session
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;
    
    // If no user is authenticated, use a default user or create one
    if (!userId) {
      // Find or create a default user
      const defaultUser = await prisma.user.findFirst({
        where: { email: "anonymous@example.com" }
      });
      
      if (defaultUser) {
        userId = defaultUser.id;
      } else {
        // Create a default user if none exists
        const newUser = await prisma.user.create({
          data: {
            name: "Anonymous",
            email: "anonymous@example.com",
          }
        });
        userId = newUser.id;
      }
    }
    
    // Create the A/B test
    const test = await prisma.aBTest.create({
      data: {
        id: body.id || generateId(),
        name: body.name,
        description: body.description || null,
        promptId: body.promptId,
        startDate: new Date(body.startDate) || new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        metrics: body.metrics,
        createdBy: userId,
        versions: {
          create: body.versionIds.map((versionId: string, index: number) => ({
            versionId,
            weight: body.weights[index] || 1, // Default weight is 1 if not provided
          })),
        },
      },
      include: {
        versions: true,
      },
    });
    
    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error("Error creating A/B test:", error);
    return NextResponse.json(
      { error: "Failed to create A/B test", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 