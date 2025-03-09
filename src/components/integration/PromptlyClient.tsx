"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Prompt } from "@/lib/types";

export function PromptlyClient() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [filledPrompt, setFilledPrompt] = useState<string>("");
  const [apiResponse, setApiResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState<boolean>(false);

  // Load prompts from the server
  useEffect(() => {
    const fetchPrompts = async () => {
      setIsLoadingPrompts(true);
      try {
        const response = await fetch('/api/prompts');
        if (response.ok) {
          const data = await response.json();
          setPrompts(data);
        } else {
          console.error('Failed to fetch prompts');
        }
      } catch (error) {
        console.error('Error fetching prompts:', error);
      } finally {
        setIsLoadingPrompts(false);
      }
    };

    fetchPrompts();
  }, []);

  // Update selected prompt when ID changes
  useEffect(() => {
    if (selectedPromptId) {
      const fetchPrompt = async () => {
        try {
          const response = await fetch(`/api/prompts/${selectedPromptId}`);
          if (response.ok) {
            const data = await response.json();
            
            // Create a prompt object from the API response
            const prompt: Prompt = {
              id: selectedPromptId,
              name: data.name || "Unnamed Prompt",
              description: data.description || "",
              content: data.content,
              variables: data.variables,
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: "",
              isActive: true,
              triggerCount: 0,
              tags: [],
              versions: []
            };
            
            setSelectedPrompt(prompt);
            
            // Reset variables and filled prompt
            setVariables({});
            setFilledPrompt("");
            setApiResponse("");
            
            // Initialize variables
            const vars = data.variables.reduce((acc: Record<string, string>, v: string) => ({ ...acc, [v]: "" }), {});
            setVariables(vars);
          } else {
            console.error('Failed to fetch prompt details');
            setSelectedPrompt(null);
          }
        } catch (error) {
          console.error('Error fetching prompt details:', error);
          setSelectedPrompt(null);
        }
      };

      fetchPrompt();
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
      // Optionally add A/B testing parameter
      const useAbTesting = true; // You can make this configurable
      const url = useAbTesting 
        ? `/api/prompts/${selectedPromptId}?abTest=true`
        : `/api/prompts/${selectedPromptId}`;
        
      const response = await fetch(url);
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
            {isLoadingPrompts ? (
              <p className="text-sm text-muted-foreground">Loading prompts...</p>
            ) : (
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
            )}
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