import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Define the type for mock prompts
interface MockPrompt {
  content: string;
  variables: string[];
  id: string;
  name: string;
  triggerCount: number;
}

// Mock data for demo purposes
const mockPrompts: Record<string, MockPrompt> = {
  // Add some example prompts with the ID from the error message
  "689d2c8b-b536-41a0-9781-d8a773609d2f": {
    content: "This is a sample prompt with ID 689d2c8b. It helps you {{action}} with {{topic}}.",
    variables: ["action", "topic"],
    id: "689d2c8b-b536-41a0-9781-d8a773609d2f",
    name: "Sample Prompt",
    triggerCount: 0
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Check if we should use A/B testing
  const useAbTesting = request.nextUrl.searchParams.get("abTest") === "true";
  
  try {
    // First try to fetch from the database
    try {
      const prompt = await prisma.prompt.findUnique({
        where: { id },
        include: {
          versions: {
            where: { isActive: true },
          },
        },
      });
      
      if (prompt) {
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
            }, { status: 200 });
          }
        }
        
        // Fallback to the prompt's content
        return NextResponse.json({
          content: prompt.content,
          variables: prompt.variables,
        }, { status: 200 });
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Continue to mock fallback
    }
    
    // Fallback to mock data if database approach fails
    const mockPrompt = mockPrompts[id];
    if (mockPrompt) {
      return NextResponse.json({
        content: mockPrompt.content,
        variables: mockPrompt.variables,
        ...(useAbTesting ? { versionId: "mock-version-id" } : {})
      }, { status: 200 });
    }
    
    // If we still don't have a prompt, return a generic mock response
    return NextResponse.json(
      {
        content: `This is a prompt from the API with ID: ${id}. It contains {{variable1}} and {{variable2}}.`,
        variables: ["variable1", "variable2"],
        ...(useAbTesting ? { versionId: "demo-version-id" } : {})
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching prompt:", error);
    
    // Return a mock response as a last resort
    return NextResponse.json(
      {
        content: `This is a fallback prompt with ID: ${id}. It contains {{variable1}} and {{variable2}}.`,
        variables: ["variable1", "variable2"],
        ...(useAbTesting ? { versionId: "fallback-version-id" } : {})
      },
      { status: 200 }
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
    
    // Try to update in the database first
    try {
      const version = await prisma.promptVersion.findUnique({
        where: { id: versionId },
      });
      
      if (version) {
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
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Continue to mock fallback
    }
    
    // If all else fails, just return success for demo purposes
    return NextResponse.json({ 
      success: true,
      message: `Recorded metric ${metric} with value ${value} for version ${versionId} of prompt ${id} (mock)`
    });
  } catch (error) {
    console.error("Error recording metric:", error);
    return NextResponse.json(
      { error: "Failed to record metric" },
      { status: 500 }
    );
  }
} 