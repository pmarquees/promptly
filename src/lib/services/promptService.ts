import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/utils";

export async function getAllPrompts() {
  try {
    const prompts = await prisma.prompt.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    
    return prompts;
  } catch (error) {
    console.error("Error fetching prompts:", error);
    throw error;
  }
}

export async function getPromptById(id: string) {
  try {
    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        versions: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    
    return prompt;
  } catch (error) {
    console.error(`Error fetching prompt with ID ${id}:`, error);
    throw error;
  }
}

export async function createPrompt(data: {
  name: string;
  description?: string;
  content: string;
  variables: string[];
  tags?: string[];
  createdBy: string;
}) {
  try {
    const { name, description, content, variables, tags, createdBy } = data;
    
    const prompt = await prisma.prompt.create({
      data: {
        id: generateId(),
        name,
        description: description || "",
        content,
        variables,
        createdBy,
        tags: tags || [],
        triggerCount: 0,
      },
    });
    
    return prompt;
  } catch (error) {
    console.error("Error creating prompt:", error);
    throw error;
  }
}

export async function updatePrompt(id: string, data: {
  name?: string;
  description?: string;
  content?: string;
  variables?: string[];
  tags?: string[];
  isActive?: boolean;
  currentVersionId?: string;
}) {
  try {
    const prompt = await prisma.prompt.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    
    return prompt;
  } catch (error) {
    console.error(`Error updating prompt with ID ${id}:`, error);
    throw error;
  }
}

export async function deletePrompt(id: string) {
  try {
    await prisma.prompt.delete({
      where: { id },
    });
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting prompt with ID ${id}:`, error);
    throw error;
  }
}

export async function incrementPromptTriggerCount(id: string) {
  try {
    const prompt = await prisma.prompt.update({
      where: { id },
      data: {
        triggerCount: {
          increment: 1,
        },
      },
    });
    
    return prompt;
  } catch (error) {
    console.error(`Error incrementing trigger count for prompt with ID ${id}:`, error);
    throw error;
  }
}

export async function getPromptContent(id: string) {
  try {
    const prompt = await prisma.prompt.findUnique({
      where: { id },
      select: {
        content: true,
        variables: true,
        currentVersionId: true,
      },
    });
    
    if (!prompt) {
      return null;
    }
    
    // If there's a current version, use that
    if (prompt.currentVersionId) {
      const version = await prisma.promptVersion.findUnique({
        where: { id: prompt.currentVersionId },
        select: {
          content: true,
          variables: true,
        },
      });
      
      if (version) {
        // Increment trigger counts
        await incrementPromptTriggerCount(id);
        await incrementVersionTriggerCount(prompt.currentVersionId);
        
        return {
          content: version.content,
          variables: version.variables,
        };
      }
    }
    
    // Otherwise, use the prompt's content
    await incrementPromptTriggerCount(id);
    
    return {
      content: prompt.content,
      variables: prompt.variables,
    };
  } catch (error) {
    console.error(`Error getting content for prompt with ID ${id}:`, error);
    throw error;
  }
}

export async function createVersion(data: {
  promptId: string;
  name: string;
  content: string;
  variables: string[];
  createdBy: string;
  isActive?: boolean;
}) {
  try {
    const { promptId, name, content, variables, createdBy, isActive } = data;
    
    const version = await prisma.promptVersion.create({
      data: {
        id: generateId(),
        promptId,
        name,
        content,
        variables,
        createdBy,
        isActive: isActive || false,
        triggerCount: 0,
      },
    });
    
    return version;
  } catch (error) {
    console.error("Error creating version:", error);
    throw error;
  }
}

export async function incrementVersionTriggerCount(id: string) {
  try {
    const version = await prisma.promptVersion.update({
      where: { id },
      data: {
        triggerCount: {
          increment: 1,
        },
      },
    });
    
    return version;
  } catch (error) {
    console.error(`Error incrementing trigger count for version with ID ${id}:`, error);
    throw error;
  }
}

export async function updateVersionPerformance(id: string, metric: string, value: number) {
  try {
    const version = await prisma.promptVersion.findUnique({
      where: { id },
      select: { performance: true },
    });
    
    const currentPerformance = version?.performance as Record<string, number> || {};
    
    await prisma.promptVersion.update({
      where: { id },
      data: {
        performance: {
          ...currentPerformance,
          [metric]: value,
        },
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating performance for version with ID ${id}:`, error);
    throw error;
  }
} 