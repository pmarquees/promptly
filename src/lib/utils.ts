import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";

// Combine class names with Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a unique ID
export function generateId(): string {
  return uuidv4();
}

// Format date to a readable string
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Extract variables from a prompt content
export function extractVariables(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (!variables.includes(match[1].trim())) {
      variables.push(match[1].trim());
    }
  }

  return variables;
}

// Replace variables in a prompt content
export function replaceVariables(content: string, variables: Record<string, string>): string {
  let result = content;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
    result = result.replace(regex, value);
  }

  return result;
}

// Calculate the percentage change between two numbers
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

// Format a number as a percentage
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

// Generate a shareable URL for a prompt
export function generatePromptUrl(promptId: string, baseUrl: string = window.location.origin): string {
  return `${baseUrl}/api/prompts/${promptId}`;
}

// Generate code snippet for integrating a prompt
export function generateCodeSnippet(promptId: string, language: "javascript" | "python" | "curl" = "javascript"): string {
  const baseUrl = window.location.origin;
  
  switch (language) {
    case "javascript":
      return `// Fetch prompt from Promptly
const response = await fetch("${baseUrl}/api/prompts/${promptId}");
const { content, variables } = await response.json();

// Replace variables in the prompt if needed
const filledPrompt = variables.reduce((result, varName) => {
  return result.replace(\`{{$\{varName}}}\`, yourVariableValues[varName] || "");
}, content);

// Use the prompt with your LLM
const llmResponse = await yourLLMFunction(filledPrompt);`;

    case "python":
      return `# Fetch prompt from Promptly
import requests

response = requests.get("${baseUrl}/api/prompts/${promptId}")
data = response.json()
content = data["content"]
variables = data["variables"]

# Replace variables in the prompt if needed
filled_prompt = content
for var_name in variables:
    filled_prompt = filled_prompt.replace(f"{{{{{var_name}}}}}", your_variable_values.get(var_name, ""))

# Use the prompt with your LLM
llm_response = your_llm_function(filled_prompt)`;

    case "curl":
      return `# Fetch prompt from Promptly
curl "${baseUrl}/api/prompts/${promptId}"`;

    default:
      return "";
  }
} 