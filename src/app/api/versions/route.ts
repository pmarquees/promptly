import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all versions from the database
    const versions = await prisma.promptVersion.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(versions);
  } catch (error) {
    console.error("Error fetching versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch versions", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 