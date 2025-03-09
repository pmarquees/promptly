import { promptStorage, versionStorage, abTestStorage, promptlyApi } from './localStorage';
import { Prompt, PromptVersion, ABTest } from '@/lib/types';

// Check if we're running on the client side
const isClient = typeof window !== 'undefined';

// Client-side storage wrapper
export const clientPromptStorage = {
  getAll: () => {
    if (!isClient) return [];
    return promptStorage.getAll();
  },
  
  getById: (id: string) => {
    if (!isClient) return undefined;
    return promptStorage.getById(id);
  },
  
  save: (prompt: Prompt) => {
    if (!isClient) return;
    promptStorage.save(prompt);
  },
  
  delete: (id: string) => {
    if (!isClient) return;
    promptStorage.delete(id);
  },
  
  incrementTriggerCount: (id: string) => {
    if (!isClient) return;
    promptStorage.incrementTriggerCount(id);
  }
};

export const clientVersionStorage = {
  getAll: () => {
    if (!isClient) return [];
    return versionStorage.getAll();
  },
  
  getById: (id: string) => {
    if (!isClient) return undefined;
    return versionStorage.getById(id);
  },
  
  getByPromptId: (promptId: string) => {
    if (!isClient) return [];
    return versionStorage.getByPromptId(promptId);
  },
  
  save: (version: PromptVersion) => {
    if (!isClient) return;
    versionStorage.save(version);
  },
  
  delete: (id: string) => {
    if (!isClient) return;
    versionStorage.delete(id);
  },
  
  incrementTriggerCount: (id: string) => {
    if (!isClient) return;
    versionStorage.incrementTriggerCount(id);
  },
  
  updatePerformance: (id: string, metric: string, value: number) => {
    if (!isClient) return;
    versionStorage.updatePerformance(id, metric, value);
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
  getPrompt: (id: string) => {
    if (!isClient) return null;
    return promptlyApi.getPrompt(id);
  },
  
  getPromptForABTest: (promptId: string) => {
    if (!isClient) return null;
    return promptlyApi.getPromptForABTest(promptId);
  },
  
  recordMetric: (promptId: string, versionId: string, metric: string, value: number) => {
    if (!isClient) return;
    promptlyApi.recordMetric(promptId, versionId, metric, value);
  }
}; 