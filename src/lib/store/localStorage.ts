import { Prompt, PromptVersion, ABTest } from "../types";

// Storage keys
const STORAGE_KEYS = {
  PROMPTS: "promptly_prompts",
  VERSIONS: "promptly_versions",
  AB_TESTS: "promptly_ab_tests",
};

// Helper function to safely parse JSON from localStorage
const safelyParseJSON = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Helper function to safely stringify and save JSON to localStorage
const safelySaveJSON = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Prompt Storage
export const promptStorage = {
  getAll: (): Prompt[] => {
    return safelyParseJSON<Prompt[]>(STORAGE_KEYS.PROMPTS, []);
  },
  
  getById: (id: string): Prompt | undefined => {
    const prompts = promptStorage.getAll();
    return prompts.find(prompt => prompt.id === id);
  },
  
  save: (prompt: Prompt): void => {
    const prompts = promptStorage.getAll();
    const existingIndex = prompts.findIndex(p => p.id === prompt.id);
    
    if (existingIndex >= 0) {
      prompts[existingIndex] = {
        ...prompt,
        updatedAt: new Date(),
      };
    } else {
      prompts.push(prompt);
    }
    
    safelySaveJSON(STORAGE_KEYS.PROMPTS, prompts);
  },
  
  delete: (id: string): void => {
    const prompts = promptStorage.getAll().filter(prompt => prompt.id !== id);
    safelySaveJSON(STORAGE_KEYS.PROMPTS, prompts);
    
    // Also delete associated versions
    const versions = versionStorage.getAll().filter(version => version.promptId !== id);
    safelySaveJSON(STORAGE_KEYS.VERSIONS, versions);
    
    // Also delete associated A/B tests
    const tests = abTestStorage.getAll().filter(test => test.promptId !== id);
    safelySaveJSON(STORAGE_KEYS.AB_TESTS, tests);
  },
  
  incrementTriggerCount: (id: string): void => {
    const prompts = promptStorage.getAll();
    const promptIndex = prompts.findIndex(p => p.id === id);
    
    if (promptIndex >= 0) {
      prompts[promptIndex].triggerCount += 1;
      safelySaveJSON(STORAGE_KEYS.PROMPTS, prompts);
    }
  }
};

// Version Storage
export const versionStorage = {
  getAll: (): PromptVersion[] => {
    return safelyParseJSON<PromptVersion[]>(STORAGE_KEYS.VERSIONS, []);
  },
  
  getById: (id: string): PromptVersion | undefined => {
    const versions = versionStorage.getAll();
    return versions.find(version => version.id === id);
  },
  
  getByPromptId: (promptId: string): PromptVersion[] => {
    const versions = versionStorage.getAll();
    return versions.filter(version => version.promptId === promptId);
  },
  
  save: (version: PromptVersion): void => {
    const versions = versionStorage.getAll();
    const existingIndex = versions.findIndex(v => v.id === version.id);
    
    if (existingIndex >= 0) {
      versions[existingIndex] = version;
    } else {
      versions.push(version);
    }
    
    safelySaveJSON(STORAGE_KEYS.VERSIONS, versions);
  },
  
  delete: (id: string): void => {
    const versions = versionStorage.getAll().filter(version => version.id !== id);
    safelySaveJSON(STORAGE_KEYS.VERSIONS, versions);
  },
  
  incrementTriggerCount: (id: string): void => {
    const versions = versionStorage.getAll();
    const versionIndex = versions.findIndex(v => v.id === id);
    
    if (versionIndex >= 0) {
      versions[versionIndex].triggerCount += 1;
      safelySaveJSON(STORAGE_KEYS.VERSIONS, versions);
    }
  },
  
  updatePerformance: (id: string, metric: string, value: number): void => {
    const versions = versionStorage.getAll();
    const versionIndex = versions.findIndex(v => v.id === id);
    
    if (versionIndex >= 0) {
      const version = versions[versionIndex];
      const performance = version.performance || {};
      
      versions[versionIndex].performance = {
        ...performance,
        [metric]: value,
      };
      
      safelySaveJSON(STORAGE_KEYS.VERSIONS, versions);
    }
  }
};

// A/B Test Storage
export const abTestStorage = {
  getAll: (): ABTest[] => {
    return safelyParseJSON<ABTest[]>(STORAGE_KEYS.AB_TESTS, []);
  },
  
  getById: (id: string): ABTest | undefined => {
    const tests = abTestStorage.getAll();
    return tests.find(test => test.id === id);
  },
  
  getByPromptId: (promptId: string): ABTest[] => {
    const tests = abTestStorage.getAll();
    return tests.filter(test => test.promptId === promptId);
  },
  
  save: (test: ABTest): void => {
    const tests = abTestStorage.getAll();
    const existingIndex = tests.findIndex(t => t.id === test.id);
    
    if (existingIndex >= 0) {
      tests[existingIndex] = test;
    } else {
      tests.push(test);
    }
    
    safelySaveJSON(STORAGE_KEYS.AB_TESTS, tests);
  },
  
  delete: (id: string): void => {
    const tests = abTestStorage.getAll().filter(test => test.id !== id);
    safelySaveJSON(STORAGE_KEYS.AB_TESTS, tests);
  },
  
  updateResults: (id: string, versionId: string, metric: string, value: number): void => {
    const tests = abTestStorage.getAll();
    const testIndex = tests.findIndex(t => t.id === id);
    
    if (testIndex >= 0) {
      const test = tests[testIndex];
      const results = test.results || {};
      const versionResults = results[versionId] || {};
      
      tests[testIndex].results = {
        ...results,
        [versionId]: {
          ...versionResults,
          [metric]: value,
        },
      };
      
      safelySaveJSON(STORAGE_KEYS.AB_TESTS, tests);
    }
  }
};

// API service for external consumption
export const promptlyApi = {
  getPrompt: (id: string): { content: string; variables: string[] } | null => {
    const prompt = promptStorage.getById(id);
    
    if (!prompt) return null;
    
    // If there's a current version, use that
    if (prompt.currentVersionId) {
      const version = versionStorage.getById(prompt.currentVersionId);
      
      if (version) {
        promptStorage.incrementTriggerCount(id);
        versionStorage.incrementTriggerCount(version.id);
        
        return {
          content: version.content,
          variables: version.variables,
        };
      }
    }
    
    // Otherwise, use the prompt's content
    promptStorage.incrementTriggerCount(id);
    
    return {
      content: prompt.content,
      variables: prompt.variables,
    };
  },
  
  getPromptForABTest: (promptId: string): { content: string; variables: string[]; versionId: string } | null => {
    const prompt = promptStorage.getById(promptId);
    
    if (!prompt) return null;
    
    // Check if there's an active A/B test for this prompt
    const activeTests = abTestStorage.getByPromptId(promptId).filter(test => test.isActive);
    
    if (activeTests.length === 0) {
      // No active test, use the current version or prompt content
      return promptlyApi.getPrompt(promptId) as { content: string; variables: string[] } & { versionId: string };
    }
    
    // Use the first active test
    const test = activeTests[0];
    
    // Select a version based on the distribution
    const versionIds = test.versionIds;
    const distribution = test.distribution;
    
    // Generate a random number between 0 and 1
    const random = Math.random();
    
    // Calculate cumulative distribution
    let cumulativeProbability = 0;
    let selectedVersionId = versionIds[0]; // Default to first version
    
    for (const versionId of versionIds) {
      cumulativeProbability += distribution[versionId] || 0;
      
      if (random <= cumulativeProbability) {
        selectedVersionId = versionId;
        break;
      }
    }
    
    // Get the selected version
    const version = versionStorage.getById(selectedVersionId);
    
    if (!version) {
      // Fallback to prompt content
      promptStorage.incrementTriggerCount(promptId);
      
      return {
        content: prompt.content,
        variables: prompt.variables,
        versionId: promptId,
      };
    }
    
    // Increment trigger counts
    promptStorage.incrementTriggerCount(promptId);
    versionStorage.incrementTriggerCount(version.id);
    
    return {
      content: version.content,
      variables: version.variables,
      versionId: version.id,
    };
  },
  
  recordMetric: (promptId: string, versionId: string, metric: string, value: number): void => {
    // Update version performance
    versionStorage.updatePerformance(versionId, metric, value);
    
    // Update A/B test results if applicable
    const activeTests = abTestStorage.getByPromptId(promptId).filter(test => test.isActive);
    
    if (activeTests.length > 0) {
      const test = activeTests[0];
      
      if (test.versionIds.includes(versionId)) {
        abTestStorage.updateResults(test.id, versionId, metric, value);
      }
    }
  }
}; 