import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Check if we should use A/B testing
  const useAbTesting = request.nextUrl.searchParams.get("abTest") === "true";
  
  try {
    // Fetch the prompt from the database
    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        versions: {
          where: { isActive: true },
        },
      },
    });
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }
    
    // Increment the trigger count
    await prisma.prompt.update({
      where: { id },
      data: { triggerCount: { increment: 1 } },
    });
    
    if (useAbTesting) {
      // Get active A/B test for this prompt
      const activeTest = await prisma.aBTest.findFirst({
        where: {
          promptId: id,
          isActive: true,
        },
        include: {
          versions: {
            include: {
              version: true,
            },
          },
        },
      });
      
      if (activeTest && activeTest.versions.length > 0) {
        // Select a version based on weights
        const random = Math.random();
        let cumulativeProbability = 0;
        let selectedVersion = null;
        
        for (const testVersion of activeTest.versions) {
          cumulativeProbability += testVersion.weight;
          
          if (random <= cumulativeProbability) {
            selectedVersion = testVersion.version;
            break;
          }
        }
        
        // If we have a selected version, use it
        if (selectedVersion) {
          // Increment the version trigger count
          await prisma.promptVersion.update({
            where: { id: selectedVersion.id },
            data: { triggerCount: { increment: 1 } },
          });
          
          return NextResponse.json({
            content: selectedVersion.content,
            variables: selectedVersion.variables,
            versionId: selectedVersion.id,
            isAbTest: true,
            testId: activeTest.id,
          }, { status: 200 });
        }
      }
    }
    
    // If no A/B test or no version selected, use the current version if available
    if (prompt.currentVersionId) {
      const currentVersion = await prisma.promptVersion.findUnique({
        where: { id: prompt.currentVersionId },
      });
      
      if (currentVersion) {
        // Increment the version trigger count
        await prisma.promptVersion.update({
          where: { id: currentVersion.id },
          data: { triggerCount: { increment: 1 } },
        });
        
        return NextResponse.json({
          content: currentVersion.content,
          variables: currentVersion.variables,
          versionId: currentVersion.id,
          isCurrentVersion: true,
        }, { status: 200 });
      }
    }
    
    // Fallback to the prompt's content
    return NextResponse.json({
      content: prompt.content,
      variables: prompt.variables,
      promptId: prompt.id,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching prompt:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompt", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    const body = await request.json();
    const { versionId, metric, value } = body;
    
    if (!versionId || !metric || value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Update version performance
    const version = await prisma.promptVersion.findUnique({
      where: { id: versionId },
    });
    
    if (!version) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }
    
    // Update the performance metrics
    const currentPerformance = version.performance as Record<string, number> || {};
    await prisma.promptVersion.update({
      where: { id: versionId },
      data: {
        performance: {
          ...currentPerformance,
          [metric]: value,
        },
      },
    });
    
    // Update A/B test results if applicable
    const activeTest = await prisma.aBTest.findFirst({
      where: {
        promptId: id,
        isActive: true,
        versions: {
          some: {
            versionId,
          },
        },
      },
    });
    
    if (activeTest) {
      const currentResults = activeTest.results as Record<string, Record<string, number>> || {};
      const versionResults = currentResults[versionId] || {};
      
      await prisma.aBTest.update({
        where: { id: activeTest.id },
        data: {
          results: {
            ...currentResults,
            [versionId]: {
              ...versionResults,
              [metric]: value,
            },
          },
        },
      });
    }
    
    return NextResponse.json({ 
      success: true,
      message: `Recorded metric ${metric} with value ${value} for version ${versionId} of prompt ${id}`
    });
  } catch (error) {
    console.error("Error recording metric:", error);
    return NextResponse.json(
      { error: "Failed to record metric", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.content) {
      return NextResponse.json(
        { error: "Name and content are required" },
        { status: 400 }
      );
    }
    
    // Check if prompt exists
    const existingPrompt = await prisma.prompt.findUnique({
      where: { id },
    });
    
    if (!existingPrompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }
    
    // Update the prompt
    const updatedPrompt = await prisma.prompt.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        content: body.content,
        variables: body.variables,
        updatedAt: new Date(),
        isActive: body.isActive !== undefined ? body.isActive : existingPrompt.isActive,
        tags: body.tags || existingPrompt.tags,
        currentVersionId: body.currentVersionId,
      },
    });
    
    return NextResponse.json(updatedPrompt);
  } catch (error) {
    console.error("Error updating prompt:", error);
    return NextResponse.json(
      { error: "Failed to update prompt", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    // Check if prompt exists
    const existingPrompt = await prisma.prompt.findUnique({
      where: { id },
    });
    
    if (!existingPrompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }
    
    // Delete the prompt
    await prisma.prompt.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return NextResponse.json(
      { error: "Failed to delete prompt", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 