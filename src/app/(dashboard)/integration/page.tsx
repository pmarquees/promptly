"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LucideClipboard, LucideCheck } from "lucide-react";
import { PromptlyClient } from "@/components/integration/PromptlyClient";

export default function IntegrationPage() {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopy = (code: string, tab: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const jsCode = `// Fetch prompt from Promptly
const response = await fetch("${baseUrl}/api/prompts/YOUR_PROMPT_ID");
const { content, variables } = await response.json();

// Replace variables in the prompt if needed
const filledPrompt = variables.reduce((result, varName) => {
  return result.replace(\`{{$\{varName}}}\`, yourVariableValues[varName] || "");
}, content);

// Use the prompt with your LLM
const llmResponse = await yourLLMFunction(filledPrompt);`;

  const pythonCode = `# Fetch prompt from Promptly
import requests

response = requests.get("${baseUrl}/api/prompts/YOUR_PROMPT_ID")
data = response.json()
content = data["content"]
variables = data["variables"]

# Replace variables in the prompt if needed
filled_prompt = content
for var_name in variables:
    filled_prompt = filled_prompt.replace(f"{{{{{var_name}}}}}", your_variable_values.get(var_name, ""))

# Use the prompt with your LLM
llm_response = your_llm_function(filled_prompt)`;

  const curlCode = `# Fetch prompt from Promptly
curl "${baseUrl}/api/prompts/YOUR_PROMPT_ID"`;

  const abTestingJsCode = `// Fetch prompt from Promptly with A/B testing
const response = await fetch("${baseUrl}/api/prompts/YOUR_PROMPT_ID?abTest=true");
const { content, variables, versionId } = await response.json();

// Replace variables in the prompt if needed
const filledPrompt = variables.reduce((result, varName) => {
  return result.replace(\`{{$\{varName}}}\`, yourVariableValues[varName] || "");
}, content);

// Use the prompt with your LLM
const llmResponse = await yourLLMFunction(filledPrompt);

// Record metrics for the version
await fetch("${baseUrl}/api/prompts/YOUR_PROMPT_ID", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    versionId,
    metric: "conversion_rate",
    value: 0.75, // Your metric value
  }),
});`;

  const abTestingPythonCode = `# Fetch prompt from Promptly with A/B testing
import requests

response = requests.get("${baseUrl}/api/prompts/YOUR_PROMPT_ID?abTest=true")
data = response.json()
content = data["content"]
variables = data["variables"]
version_id = data["versionId"]

# Replace variables in the prompt if needed
filled_prompt = content
for var_name in variables:
    filled_prompt = filled_prompt.replace(f"{{{{{var_name}}}}}", your_variable_values.get(var_name, ""))

# Use the prompt with your LLM
llm_response = your_llm_function(filled_prompt)

# Record metrics for the version
requests.post(
    "${baseUrl}/api/prompts/YOUR_PROMPT_ID",
    json={
        "versionId": version_id,
        "metric": "conversion_rate",
        "value": 0.75  # Your metric value
    }
)`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integration Guide</h1>
        <p className="text-muted-foreground mt-2">
          Learn how to integrate Promptly into your applications.
        </p>
      </div>

      <PromptlyClient />

      <Card>
        <CardHeader>
          <CardTitle>Basic Integration</CardTitle>
          <CardDescription>
            Integrate prompts from Promptly into your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="javascript">
            <TabsList>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>
            <TabsContent value="javascript" className="mt-4">
              <div className="relative">
                <pre className="rounded-md bg-muted p-4 overflow-x-auto font-mono text-sm">
                  {jsCode}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(jsCode, "javascript")}
                >
                  {copiedTab === "javascript" ? (
                    <LucideCheck className="h-4 w-4" />
                  ) : (
                    <LucideClipboard className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy code</span>
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="python" className="mt-4">
              <div className="relative">
                <pre className="rounded-md bg-muted p-4 overflow-x-auto font-mono text-sm">
                  {pythonCode}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(pythonCode, "python")}
                >
                  {copiedTab === "python" ? (
                    <LucideCheck className="h-4 w-4" />
                  ) : (
                    <LucideClipboard className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy code</span>
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="curl" className="mt-4">
              <div className="relative">
                <pre className="rounded-md bg-muted p-4 overflow-x-auto font-mono text-sm">
                  {curlCode}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(curlCode, "curl")}
                >
                  {copiedTab === "curl" ? (
                    <LucideCheck className="h-4 w-4" />
                  ) : (
                    <LucideClipboard className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy code</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>A/B Testing Integration</CardTitle>
          <CardDescription>
            Integrate A/B testing into your application and record metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="javascript">
            <TabsList>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            <TabsContent value="javascript" className="mt-4">
              <div className="relative">
                <pre className="rounded-md bg-muted p-4 overflow-x-auto font-mono text-sm">
                  {abTestingJsCode}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(abTestingJsCode, "javascript-ab")}
                >
                  {copiedTab === "javascript-ab" ? (
                    <LucideCheck className="h-4 w-4" />
                  ) : (
                    <LucideClipboard className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy code</span>
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="python" className="mt-4">
              <div className="relative">
                <pre className="rounded-md bg-muted p-4 overflow-x-auto font-mono text-sm">
                  {abTestingPythonCode}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(abTestingPythonCode, "python-ab")}
                >
                  {copiedTab === "python-ab" ? (
                    <LucideCheck className="h-4 w-4" />
                  ) : (
                    <LucideClipboard className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy code</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Reference</CardTitle>
          <CardDescription>
            Reference for the Promptly API endpoints.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">GET /api/prompts/:id</h3>
            <p className="text-muted-foreground mt-1">
              Fetch a prompt by ID. Returns the prompt content and variables.
            </p>
            <h4 className="text-sm font-medium mt-2">Query Parameters</h4>
            <ul className="list-disc pl-5 mt-1 text-sm">
              <li><code>abTest</code> - Set to "true" to use A/B testing for this prompt.</li>
            </ul>
            <h4 className="text-sm font-medium mt-2">Response</h4>
            <pre className="rounded-md bg-muted p-4 mt-1 overflow-x-auto font-mono text-sm">
{`{
  "content": "The prompt content with {{variables}}",
  "variables": ["variable1", "variable2"],
  "versionId": "version-id" /* Only included when abTest=true */
}`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">POST /api/prompts/:id</h3>
            <p className="text-muted-foreground mt-1">
              Record metrics for a prompt version.
            </p>
            <h4 className="text-sm font-medium mt-2">Request Body</h4>
            <pre className="rounded-md bg-muted p-4 mt-1 overflow-x-auto font-mono text-sm">
{`{
  "versionId": "version-id",
  "metric": "metric-name",
  "value": 0.75
}`}
            </pre>
            <h4 className="text-sm font-medium mt-2">Response</h4>
            <pre className="rounded-md bg-muted p-4 mt-1 overflow-x-auto font-mono text-sm">
{`{
  "success": true
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Important Note About API Integration</CardTitle>
          <CardDescription>
            Understanding the current limitations of the demo application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              In this demo application, the API endpoints return mock data because:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                The application uses browser localStorage for data persistence, which is not accessible from the server-side API routes.
              </li>
              <li>
                In a production environment, you would use a database (like MongoDB, PostgreSQL, etc.) that both the client and server can access.
              </li>
              <li>
                The client-side demo above shows how your prompts would actually work when integrated with a proper database.
              </li>
            </ul>
            <p className="font-medium">
              To implement this in a real application, you would need to:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Set up a database to store prompts, versions, and A/B test data</li>
              <li>Update the API routes to read from and write to the database</li>
              <li>Implement authentication to secure your prompts</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 