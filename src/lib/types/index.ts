import { z } from "zod";

// Prompt Schema
export const promptSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Prompt content is required"),
  variables: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().default("Anonymous"),
  isActive: z.boolean().default(true),
  triggerCount: z.number().default(0),
  versions: z.array(z.string()).default([]),
  currentVersionId: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type Prompt = z.infer<typeof promptSchema>;

// Prompt Version Schema
export const promptVersionSchema = z.object({
  id: z.string(),
  promptId: z.string(),
  name: z.string().min(1, "Version name is required"),
  content: z.string().min(1, "Prompt content is required"),
  variables: z.array(z.string()).default([]),
  createdAt: z.date(),
  createdBy: z.string().default("Anonymous"),
  isActive: z.boolean().default(false),
  triggerCount: z.number().default(0),
  performance: z.record(z.string(), z.number()).optional(),
});

export type PromptVersion = z.infer<typeof promptVersionSchema>;

// A/B Test Schema
export const abTestSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Test name is required"),
  description: z.string().optional(),
  promptId: z.string(),
  versionIds: z.array(z.string()).min(2, "At least two versions are required for A/B testing"),
  distribution: z.record(z.string(), z.number()),
  startDate: z.date(),
  endDate: z.date().optional(),
  isActive: z.boolean().default(true),
  metrics: z.array(z.string()).default([]),
  results: z.record(z.string(), z.record(z.string(), z.number())).optional(),
});

export type ABTest = z.infer<typeof abTestSchema>;

// Form Schemas
export const createPromptSchema = promptSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  triggerCount: true,
  versions: true,
  currentVersionId: true,
});

export type CreatePromptFormValues = z.infer<typeof createPromptSchema>;

export const createVersionSchema = promptVersionSchema.omit({
  id: true,
  createdAt: true,
  triggerCount: true,
  performance: true,
});

export type CreateVersionFormValues = z.infer<typeof createVersionSchema>;

export const createABTestSchema = abTestSchema.omit({
  id: true,
  results: true,
});

export type CreateABTestFormValues = z.infer<typeof createABTestSchema>; 