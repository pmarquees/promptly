"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LucideArrowLeft, LucideEdit, LucideTrash, LucidePlus, LucideCode } from "lucide-react";
import { Prompt, PromptVersion } from "@/lib/types";
import { formatDate, generatePromptUrl, generateCodeSnippet } from "@/lib/utils";
import { toast } from "sonner";

interface PromptDetailPageProps {
  params: {
    id: string;
  };
}

export default function PromptDetailPage({ params }: PromptDetailPageProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLanguage, setSelectedLanguage] = useState<"javascript" | "python" | "curl">("javascript");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load prompt from API
    const fetchPrompt = async () => {
      setIsLoading(true);
      try {
        const promptId = params.id;
        const response = await fetch(`/api/prompts/${promptId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Prompt not found");
            router.push("/prompts");
            return;
          }
          throw new Error('Failed to fetch prompt');
        }
        
        const data = await response.json();
        
        // Create a prompt object from the API response
        const promptData: Prompt = {
          id: promptId,
          name: data.name || "Unnamed Prompt",
          description: data.description || "",
          content: data.content,
          variables: data.variables,
          createdAt: new Date(data.createdAt || new Date()),
          updatedAt: new Date(data.updatedAt || new Date()),
          createdBy: data.createdBy || "",
          isActive: data.isActive !== undefined ? data.isActive : true,
          triggerCount: data.triggerCount || 0,
          tags: data.tags || [],
          versions: data.versions || [],
          currentVersionId: data.currentVersionId
        };
        
        setPrompt(promptData);
        
        // Load versions for this prompt
        const versionsResponse = await fetch(`/api/prompts/${promptId}/versions`);
        if (versionsResponse.ok) {
          const versionsData = await versionsResponse.json();
          setVersions(versionsData);
        } else {
          setVersions([]);
        }
      } catch (error) {
        console.error('Error fetching prompt:', error);
        toast.error('Failed to load prompt');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompt();
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!prompt) return;
    
    if (confirm("Are you sure you want to delete this prompt? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/prompts/${prompt.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          toast.success("Prompt deleted successfully");
          router.push("/prompts");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete prompt');
        }
      } catch (error) {
        console.error('Error deleting prompt:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to delete prompt');
      }
    }
  };

  const handleCopyUrl = () => {
    if (!prompt) return;
    
    const url = generatePromptUrl(prompt.id);
    navigator.clipboard.writeText(url);
    toast.success("API URL copied to clipboard");
  };

  const handleCopyCode = () => {
    if (!prompt) return;
    
    const code = generateCodeSnippet(prompt.id, selectedLanguage);
    navigator.clipboard.writeText(code);
    toast.success("Code snippet copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p>Loading prompt...</p>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p>Prompt not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/prompts">
            <Button variant="ghost" size="icon">
              <LucideArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{prompt.name}</h1>
          <Badge variant={prompt.isActive ? "default" : "secondary"}>
            {prompt.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href={`/prompts/${prompt.id}/edit`}>
            <Button variant="outline">
              <LucideEdit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <LucideTrash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{prompt.description || "No description provided."}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                <p className="mt-1">{prompt.createdBy}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p className="mt-1">{formatDate(new Date(prompt.createdAt))}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                  <p className="mt-1">{formatDate(new Date(prompt.updatedAt))}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Trigger Count</h3>
                <p className="mt-1">{prompt.triggerCount}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Variables</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {prompt.variables.length > 0 ? (
                    prompt.variables.map((variable) => (
                      <Badge key={variable} variant="secondary">
                        {variable}
                      </Badge>
                    ))
                  ) : (
                    <p>No variables defined.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Prompt Content</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 font-mono text-sm">
                {prompt.content}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="versions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Prompt Versions</h2>
            <Link href={`/prompts/${prompt.id}/versions/new`}>
              <Button>
                <LucidePlus className="mr-2 h-4 w-4" />
                New Version
              </Button>
            </Link>
          </div>
          
          {versions.length > 0 ? (
            <div className="space-y-4">
              {versions.map((version) => (
                <Card key={version.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{version.name}</CardTitle>
                      <Badge variant={version.isActive ? "default" : "secondary"}>
                        {version.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Created {formatDate(new Date(version.createdAt))} by {version.createdBy}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Trigger Count</h3>
                      <p className="mt-1">{version.triggerCount}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Content</h3>
                      <pre className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-4 font-mono text-sm">
                        {version.content}
                      </pre>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Link href={`/prompts/${prompt.id}/versions/${version.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <LucideEdit className="mr-2 h-3 w-3" />
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant={prompt.currentVersionId === version.id ? "secondary" : "default"}
                        size="sm"
                        disabled={prompt.currentVersionId === version.id}
                        onClick={() => {
                          if (prompt.currentVersionId !== version.id) {
                            const updatedPrompt = {
                              ...prompt,
                              currentVersionId: version.id,
                            };
                            fetch(`/api/prompts/${prompt.id}`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify(updatedPrompt),
                            })
                            .then(response => {
                              if (response.ok) {
                                setPrompt(updatedPrompt);
                                toast.success(`Set "${version.name}" as the current version`);
                              } else {
                                throw new Error('Failed to update prompt');
                              }
                            })
                            .catch(error => {
                              console.error('Error updating prompt:', error);
                              toast.error('Failed to update prompt');
                            });
                          }
                        }}
                      >
                        {prompt.currentVersionId === version.id ? "Current Version" : "Set as Current"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-4">No versions created yet.</p>
                <Link href={`/prompts/${prompt.id}/versions/new`}>
                  <Button>
                    <LucidePlus className="mr-2 h-4 w-4" />
                    Create First Version
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Integration</CardTitle>
              <CardDescription>
                Use these endpoints to integrate this prompt into your application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">API Endpoint</h3>
                <div className="mt-1 flex items-center gap-2">
                  <code className="rounded-md bg-muted p-2 font-mono text-sm flex-1">
                    {generatePromptUrl(prompt.id)}
                  </code>
                  <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                    Copy
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-muted-foreground">Code Snippet</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant={selectedLanguage === "javascript" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedLanguage("javascript")}
                    >
                      JavaScript
                    </Button>
                    <Button 
                      variant={selectedLanguage === "python" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedLanguage("python")}
                    >
                      Python
                    </Button>
                    <Button 
                      variant={selectedLanguage === "curl" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedLanguage("curl")}
                    >
                      cURL
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex items-start gap-2">
                  <pre className="rounded-md bg-muted p-4 font-mono text-sm flex-1 whitespace-pre-wrap">
                    {generateCodeSnippet(prompt.id, selectedLanguage)}
                  </pre>
                  <Button variant="outline" size="sm" onClick={handleCopyCode}>
                    <LucideCode className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 