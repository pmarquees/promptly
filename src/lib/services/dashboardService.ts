import { prisma } from "@/lib/prisma";

export async function getDashboardMetrics() {
  try {
    // Get total prompts count
    const totalPrompts = await prisma.prompt.count();
    
    // Get total versions count
    const totalVersions = await prisma.promptVersion.count();
    
    // Get sum of all trigger counts for prompts
    const promptsWithTriggers = await prisma.prompt.findMany({
      select: {
        triggerCount: true,
      },
    });
    
    const totalTriggers = promptsWithTriggers.reduce(
      (sum: number, prompt: { triggerCount: number }) => sum + prompt.triggerCount,
      0
    );
    
    // Get count of active A/B tests
    const activeTests = await prisma.aBTest.count({
      where: {
        isActive: true,
      },
    });
    
    // Get recent prompts
    const recentPrompts = await prisma.prompt.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    
    // Get active A/B tests with details
    const activeTestsWithDetails = await prisma.aBTest.findMany({
      where: {
        isActive: true,
      },
      take: 5,
      include: {
        prompt: {
          select: {
            name: true,
          },
        },
        versions: {
          include: {
            version: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });
    
    return {
      totalPrompts,
      totalVersions,
      totalTriggers,
      activeTests,
      recentPrompts,
      activeTestsWithDetails,
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    throw error;
  }
} 