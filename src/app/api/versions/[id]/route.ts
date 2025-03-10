import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = await params.id;
  
  try {
    // Fetch the version from the database
    const version = await prisma.promptVersion.findUnique({
      where: { id },
    });
    
    if (!version) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(version);
  } catch (error) {
    console.error(`Error fetching version ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch version", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = await params.id;
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.content) {
      return NextResponse.json(
        { error: "Name and content are required" },
        { status: 400 }
      );
    }
    
    // Check if version exists
    const existingVersion = await prisma.promptVersion.findUnique({
      where: { id },
    });
    
    if (!existingVersion) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }
    
    // Update the version
    const updatedVersion = await prisma.promptVersion.update({
      where: { id },
      data: {
        name: body.name,
        content: body.content,
        variables: body.variables || existingVersion.variables,
        isActive: body.isActive !== undefined ? body.isActive : existingVersion.isActive,
      },
    });
    
    return NextResponse.json(updatedVersion);
  } catch (error) {
    console.error(`Error updating version ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to update version", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = await params.id;
  
  try {
    // Check if version exists
    const existingVersion = await prisma.promptVersion.findUnique({
      where: { id },
    });
    
    if (!existingVersion) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }
    
    // Delete the version
    await prisma.promptVersion.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting version ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete version", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 