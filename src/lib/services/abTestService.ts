import { prisma } from "@/lib/prisma";

export type ABTestWithVersions = {
  id: string;
  name: string;
  description: string | null;
  promptId: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  metrics: string[];
  results: Record<string, Record<string, number>> | null;
  createdBy: string;
  versions: {
    id: string;
    abTestId: string;
    versionId: string;
    weight: number;
    version: {
      id: string;
      name: string;
      content: string;
      variables: string[];
    };
  }[];
  prompt: {
    id: string;
    name: string;
  };
};

export async function getAllABTests() {
  try {
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
    
    return tests;
  } catch (error) {
    console.error("Error fetching A/B tests:", error);
    throw error;
  }
}

export async function getABTestById(id: string) {
  try {
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
    
    return test;
  } catch (error) {
    console.error(`Error fetching A/B test with ID ${id}:`, error);
    throw error;
  }
}

export async function createABTest(data: {
  name: string;
  description?: string;
  promptId: string;
  versionIds: string[];
  weights: number[];
  metrics: string[];
  createdBy: string;
}) {
  try {
    const { name, description, promptId, versionIds, weights, metrics, createdBy } = data;
    
    // Create the A/B test
    const test = await prisma.aBTest.create({
      data: {
        name,
        description,
        promptId,
        startDate: new Date(),
        isActive: true,
        metrics,
        createdBy,
        versions: {
          create: versionIds.map((versionId, index) => ({
            versionId,
            weight: weights[index] || 1, // Default weight is 1 if not provided
          })),
        },
      },
      include: {
        versions: true,
      },
    });
    
    return test;
  } catch (error) {
    console.error("Error creating A/B test:", error);
    throw error;
  }
}

export async function updateABTestResults(
  testId: string,
  versionId: string,
  metric: string,
  value: number
) {
  try {
    // Get the current test
    const test = await prisma.aBTest.findUnique({
      where: { id: testId },
      select: { results: true },
    });
    
    // Initialize or update the results
    const currentResults = test?.results as Record<string, Record<string, number>> || {};
    const versionResults = currentResults[versionId] || {};
    
    // Update the metric
    const updatedResults = {
      ...currentResults,
      [versionId]: {
        ...versionResults,
        [metric]: value,
      },
    };
    
    // Save the updated results
    await prisma.aBTest.update({
      where: { id: testId },
      data: { results: updatedResults },
    });
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating A/B test results for test ${testId}:`, error);
    throw error;
  }
} 