"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LucideArrowLeft } from "lucide-react";
import { ABTestForm } from "@/components/a-b-testing/ABTestForm";
import { toast } from "sonner";

// Define types
interface Prompt {
  id: string;
  name: string;
  variables: string[];
}

interface PromptVersion {
  id: string;
  promptId: string;
  name: string;
  content: string;
  variables: string[];
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
  triggerCount: number;
  performance?: Record<string, number>;
}

interface ABTest {
  id: string;
  name: string;
  description?: string;
  promptId: string;
  versionIds: string[];
  distribution: Record<string, number>;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  metrics: string[];
  results?: Record<string, Record<string, number>>;
}

export default function NewABTestPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load prompts from API
    const fetchPrompts = async () => {
      try {
        const response = await fetch('/api/prompts');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPrompts(data);
      } catch (err) {
        console.error("Error fetching prompts:", err);
        setError("Failed to load prompts");
        toast.error("Failed to load prompts");
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  useEffect(() => {
    if (selectedPromptId) {
      // Load versions for the selected prompt from API
      const fetchVersions = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/prompts/${selectedPromptId}/versions`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setVersions(data);
        } catch (err) {
          console.error("Error fetching versions:", err);
          setError("Failed to load versions");
          toast.error("Failed to load versions");
        } finally {
          setLoading(false);
        }
      };

      fetchVersions();
    } else {
      setVersions([]);
    }
  }, [selectedPromptId]);

  const handleSubmit = (values: ABTest) => {
    const submitTest = async () => {
      try {
        // Save the A/B test via API
        const response = await fetch('/api/a-b-tests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...values,
            versionIds: values.versionIds,
            weights: Object.values(values.distribution)
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Show success message
        toast.success("A/B test created successfully");
        
        // Redirect to the A/B tests list
        router.push("/a-b-testing");
      } catch (error) {
        console.error("Error creating A/B test:", error);
        toast.error("Failed to create A/B test");
      }
    };

    submitTest();
  };

  if (loading && !selectedPromptId) {
    return <div className="flex justify-center items-center h-[60vh]">Loading prompts...</div>;
  }

  if (error && !selectedPromptId) {
    return <div className="flex justify-center items-center h-[60vh] text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/a-b-testing">
          <Button variant="ghost" size="icon">
            <LucideArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create New A/B Test</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New A/B Test</CardTitle>
          <CardDescription>
            Create a new A/B test to compare different versions of a prompt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {prompts.length > 0 ? (
            <>
              <div className="mb-6">
                <label className="text-sm font-medium">Select Prompt</label>
                <Select
                  value={selectedPromptId}
                  onValueChange={setSelectedPromptId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a prompt" />
                  </SelectTrigger>
                  <SelectContent>
                    {prompts.map((prompt) => (
                      <SelectItem key={prompt.id} value={prompt.id}>
                        {prompt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedPromptId ? (
                loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading versions...</p>
                  </div>
                ) : versions.length >= 2 ? (
                  <ABTestForm
                    promptId={selectedPromptId}
                    versions={versions}
                    onSubmit={handleSubmit}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      You need at least two versions of this prompt to create an A/B test.
                    </p>
                    <Link href={`/prompts/${selectedPromptId}/versions/new`}>
                      <Button>
                        Create Version
                      </Button>
                    </Link>
                  </div>
                )
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Please select a prompt to continue.
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You need to create a prompt before you can create an A/B test.
              </p>
              <Link href="/prompts/new">
                <Button>
                  Create Prompt
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 