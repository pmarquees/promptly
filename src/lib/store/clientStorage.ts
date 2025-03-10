import { promptStorage, versionStorage, abTestStorage, promptlyApi } from './localStorage';
import { Prompt, PromptVersion, ABTest } from '@/lib/types';

// Check if we're running on the client side
const isClient = typeof window !== 'undefined';

// Client-side storage wrapper with API fallback
export const clientPromptStorage = {
  getAll: async () => {
    if (!isClient) return [];
    
    try {
      // Try to fetch from API first
      const response = await fetch('/api/prompts');
      if (response.ok) {
        return await response.json();
      }
      // Fall back to localStorage if API fails
      return promptStorage.getAll();
    } catch (error) {
      console.error('Error fetching prompts:', error);
      return promptStorage.getAll();
    }
  },
  
  getById: async (id: string) => {
    if (!isClient) return undefined;
    
    try {
      // Try to fetch from API first
      const response = await fetch(`/api/prompts/${id}`);
      if (response.ok) {
        return await response.json();
      }
      // Fall back to localStorage if API fails
      return promptStorage.getById(id);
    } catch (error) {
      console.error(`Error fetching prompt ${id}:`, error);
      return promptStorage.getById(id);
    }
  },
  
  save: async (prompt: Prompt) => {
    if (!isClient) return;
    
    try {
      // Try to save to API first
      const method = prompt.id ? 'PUT' : 'POST';
      const url = prompt.id ? `/api/prompts/${prompt.id}` : '/api/prompts';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prompt),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save prompt: ${response.statusText}`);
      }
      
      // Also save to localStorage as backup
      promptStorage.save(prompt);
      
      return await response.json();
    } catch (error) {
      console.error('Error saving prompt:', error);
      // Fall back to localStorage
      promptStorage.save(prompt);
    }
  },
  
  delete: async (id: string) => {
    if (!isClient) return;
    
    try {
      // Try to delete from API first
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete prompt: ${response.statusText}`);
      }
      
      // Also delete from localStorage
      promptStorage.delete(id);
    } catch (error) {
      console.error(`Error deleting prompt ${id}:`, error);
      // Fall back to localStorage
      promptStorage.delete(id);
    }
  },
  
  incrementTriggerCount: async (id: string) => {
    if (!isClient) return;
    
    try {
      // Try to increment via API first
      const response = await fetch(`/api/prompts/${id}/increment`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to increment trigger count: ${response.statusText}`);
      }
      
      // Also update localStorage
      promptStorage.incrementTriggerCount(id);
    } catch (error) {
      console.error(`Error incrementing trigger count for prompt ${id}:`, error);
      // Fall back to localStorage
      promptStorage.incrementTriggerCount(id);
    }
  }
};

export const clientVersionStorage = {
  getAll: async () => {
    if (!isClient) return [];
    
    try {
      // Try to fetch from API first
      const response = await fetch('/api/versions');
      if (response.ok) {
        return await response.json();
      }
      // Fall back to localStorage if API fails
      return versionStorage.getAll();
    } catch (error) {
      console.error('Error fetching versions:', error);
      return versionStorage.getAll();
    }
  },
  
  getById: async (id: string) => {
    if (!isClient) return undefined;
    
    try {
      // Try to fetch from API first
      const response = await fetch(`/api/versions/${id}`);
      if (response.ok) {
        return await response.json();
      }
      // Fall back to localStorage if API fails
      return versionStorage.getById(id);
    } catch (error) {
      console.error(`Error fetching version ${id}:`, error);
      return versionStorage.getById(id);
    }
  },
  
  getByPromptId: async (promptId: string) => {
    if (!isClient) return [];
    
    try {
      // Try to fetch from API first
      const response = await fetch(`/api/prompts/${promptId}/versions`);
      if (response.ok) {
        return await response.json();
      }
      // Fall back to localStorage if API fails
      return versionStorage.getByPromptId(promptId);
    } catch (error) {
      console.error(`Error fetching versions for prompt ${promptId}:`, error);
      return versionStorage.getByPromptId(promptId);
    }
  },
  
  save: async (version: PromptVersion) => {
    if (!isClient) return;
    
    try {
      // Try to save to API first
      const method = version.id ? 'PUT' : 'POST';
      const url = version.id 
        ? `/api/versions/${version.id}` 
        : `/api/prompts/${version.promptId}/versions`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(version),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save version: ${response.statusText}`);
      }
      
      // Also save to localStorage as backup
      versionStorage.save(version);
      
      return await response.json();
    } catch (error) {
      console.error('Error saving version:', error);
      // Fall back to localStorage
      versionStorage.save(version);
    }
  },
  
  delete: async (id: string) => {
    if (!isClient) return;
    
    try {
      // Try to delete from API first
      const response = await fetch(`/api/versions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete version: ${response.statusText}`);
      }
      
      // Also delete from localStorage
      versionStorage.delete(id);
    } catch (error) {
      console.error(`Error deleting version ${id}:`, error);
      // Fall back to localStorage
      versionStorage.delete(id);
    }
  },
  
  incrementTriggerCount: async (id: string) => {
    if (!isClient) return;
    
    try {
      // Try to increment via API first
      const response = await fetch(`/api/versions/${id}/increment`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to increment trigger count: ${response.statusText}`);
      }
      
      // Also update localStorage
      versionStorage.incrementTriggerCount(id);
    } catch (error) {
      console.error(`Error incrementing trigger count for version ${id}:`, error);
      // Fall back to localStorage
      versionStorage.incrementTriggerCount(id);
    }
  },
  
  updatePerformance: async (id: string, metric: string, value: number) => {
    if (!isClient) return;
    
    try {
      // Try to update via API first
      const response = await fetch(`/api/versions/${id}/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metric, value }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update performance: ${response.statusText}`);
      }
      
      // Also update localStorage
      versionStorage.updatePerformance(id, metric, value);
    } catch (error) {
      console.error(`Error updating performance for version ${id}:`, error);
      // Fall back to localStorage
      versionStorage.updatePerformance(id, metric, value);
    }
  }
};

export const clientAbTestStorage = {
  getAll: () => {
    if (!isClient) return [];
    return abTestStorage.getAll();
  },
  
  getById: (id: string) => {
    if (!isClient) return undefined;
    return abTestStorage.getById(id);
  },
  
  getByPromptId: (promptId: string) => {
    if (!isClient) return [];
    return abTestStorage.getByPromptId(promptId);
  },
  
  save: (test: ABTest) => {
    if (!isClient) return;
    abTestStorage.save(test);
  },
  
  delete: (id: string) => {
    if (!isClient) return;
    abTestStorage.delete(id);
  },
  
  updateResults: (id: string, versionId: string, metric: string, value: number) => {
    if (!isClient) return;
    abTestStorage.updateResults(id, versionId, metric, value);
  }
};

export const clientPromptlyApi = {
  getPrompt: async (id: string) => {
    if (!isClient) return null;
    
    try {
      // Try to fetch from API first
      const response = await fetch(`/api/prompts/${id}`);
      if (response.ok) {
        const data = await response.json();
        return {
          content: data.content,
          variables: data.variables,
        };
      }
      // Fall back to localStorage if API fails
      return promptlyApi.getPrompt(id);
    } catch (error) {
      console.error(`Error fetching prompt ${id}:`, error);
      return promptlyApi.getPrompt(id);
    }
  },
  
  getPromptForABTest: async (promptId: string) => {
    if (!isClient) return null;
    
    try {
      // Try to fetch from API first with abTest flag
      const response = await fetch(`/api/prompts/${promptId}?abTest=true`);
      if (response.ok) {
        const data = await response.json();
        return {
          content: data.content,
          variables: data.variables,
          versionId: data.versionId,
        };
      }
      // Fall back to localStorage if API fails
      return promptlyApi.getPromptForABTest(promptId);
    } catch (error) {
      console.error(`Error fetching prompt ${promptId} for AB test:`, error);
      return promptlyApi.getPromptForABTest(promptId);
    }
  },
  
  recordMetric: async (promptId: string, versionId: string, metric: string, value: number) => {
    if (!isClient) return;
    
    try {
      // Try to record via API first
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ versionId, metric, value }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to record metric: ${response.statusText}`);
      }
      
      // Also update localStorage
      promptlyApi.recordMetric(promptId, versionId, metric, value);
    } catch (error) {
      console.error(`Error recording metric for prompt ${promptId}, version ${versionId}:`, error);
      // Fall back to localStorage
      promptlyApi.recordMetric(promptId, versionId, metric, value);
    }
  }
}; 