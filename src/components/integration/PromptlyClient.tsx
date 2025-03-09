"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { clientPromptStorage, clientVersionStorage } from "@/lib/store/clientStorage";
import { Prompt, PromptVersion } from "@/lib/types";
import { extractVariables } from "@/lib/utils";

export function PromptlyClient() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [filledPrompt, setFilledPrompt] = useState<string>("");
  const [apiResponse, setApiResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load prompts from localStorage
  useEffect(() => {
    const loadedPrompts = clientPromptStorage.getAll();
    setPrompts(loadedPrompts);
  }, []);

  // Update selected prompt when ID changes
  useEffect(() => {
    if (selectedPromptId) {
      const prompt = clientPromptStorage.getById(selectedPromptId);
      setSelectedPrompt(prompt || null);
      
      // Reset variables and filled prompt
      setVariables({});
      setFilledPrompt("");
      setApiResponse("");
      
      // Initialize variables if prompt exists
      if (prompt) {
        const vars = prompt.variables.reduce((acc, v) => ({ ...acc, [v]: "" }), {});
        setVariables(vars);
      }
    } else {
      setSelectedPrompt(null);
    }
  }, [selectedPromptId]);

  // Update filled prompt when variables change
  useEffect(() => {
    if (selectedPrompt) {
      let filled = selectedPrompt.content;
      
      // Replace variables in the prompt
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
        filled = filled.replace(regex, value || `{{${key}}}`);
      });
      
      setFilledPrompt(filled);
    }
  }, [selectedPrompt, variables]);

  // Handle variable input change
  const handleVariableChange = (name: string, value: string) => {
    setVariables(prev => ({ ...prev, [name]: value }));
  };

  // Fetch from API
  const handleFetchFromApi = async () => {
    if (!selectedPromptId) return;
    
    setIsLoading(true);
    setApiResponse("");
    
    try {
      const response = await fetch(`/api/prompts/${selectedPromptId}`);
      const data = await response.json();
      
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error fetching from API:", error);
      setApiResponse(JSON.stringify({ error: "Failed to fetch from API" }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Promptly Client Demo</CardTitle>
          <CardDescription>
            Test your prompts directly in the browser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select a Prompt</label>
            <select
              className="w-full p-2 mt-1 border rounded-md"
              value={selectedPromptId}
              onChange={(e) => setSelectedPromptId(e.target.value)}
            >
              <option value="">Select a prompt</option>
              {prompts.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedPrompt && (
            <>
              <div>
                <h3 className="text-sm font-medium">Variables</h3>
                <div className="space-y-2 mt-2">
                  {Object.keys(variables).length > 0 ? (
                    Object.keys(variables).map((varName) => (
                      <div key={varName} className="flex items-center gap-2">
                        <label className="w-1/3 text-sm">{varName}:</label>
                        <Input
                          value={variables[varName]}
                          onChange={(e) => handleVariableChange(varName, e.target.value)}
                          placeholder={`Enter value for ${varName}`}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No variables in this prompt.</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Filled Prompt</h3>
                <Textarea
                  className="mt-2 font-mono"
                  value={filledPrompt}
                  readOnly
                  rows={5}
                />
              </div>
              
              <div>
                <Button onClick={handleFetchFromApi} disabled={isLoading}>
                  {isLoading ? "Loading..." : "Fetch from API"}
                </Button>
              </div>
              
              {apiResponse && (
                <div>
                  <h3 className="text-sm font-medium">API Response</h3>
                  <pre className="mt-2 p-4 bg-muted rounded-md overflow-x-auto font-mono text-sm">
                    {apiResponse}
                  </pre>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 