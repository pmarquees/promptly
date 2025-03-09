import { NextRequest, NextResponse } from "next/server";

// Define types for our data
interface Prompt {
  id: string;
  name: string;
  content: string;
  variables: string[];
  currentVersionId?: string;
  [key: string]: any;
}

interface Version {
  id: string;
  content: string;
  variables: string[];
  [key: string]: any;
}

// Helper function to safely parse JSON
const safelyParseJSON = <T>(jsonString: string | null, defaultValue: T): T => {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return defaultValue;
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
    // Since we can't reliably access localStorage or cookies from the server,
    // we'll use a different approach for this demo
    
    // In a real application, you would fetch this data from a database
    // For now, we'll return a fallback response
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
    return NextResponse.json(
      { error: "Failed to fetch prompt" },
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
    
    // In a real application, this would update data in a database
    // For now, we'll just return a success response
    
    return NextResponse.json({ 
      success: true,
      message: `Recorded metric ${metric} with value ${value} for version ${versionId} of prompt ${id}`
    });
  } catch (error) {
    console.error("Error recording metric:", error);
    return NextResponse.json(
      { error: "Failed to record metric" },
      { status: 500 }
    );
  }
} 