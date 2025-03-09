"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LucideArrowLeft } from "lucide-react";
import { ABTestForm } from "@/components/a-b-testing/ABTestForm";
import { clientPromptStorage, clientVersionStorage, clientAbTestStorage } from "@/lib/store/clientStorage";
import { Prompt, PromptVersion, ABTest } from "@/lib/types";
import { toast } from "sonner";

export default function NewABTestPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load prompts from localStorage
    const loadedPrompts = clientPromptStorage.getAll();
    setPrompts(loadedPrompts);
  }, []);

  useEffect(() => {
    if (selectedPromptId) {
      // Load versions for the selected prompt
      const loadedVersions = clientVersionStorage.getByPromptId(selectedPromptId);
      setVersions(loadedVersions);
    } else {
      setVersions([]);
    }
  }, [selectedPromptId]);

  const handleSubmit = (test: ABTest) => {
    setIsSubmitting(true);
    
    try {
      // Save the A/B test to localStorage
      clientAbTestStorage.save(test);
      
      // Show success message
      toast.success("A/B test created successfully");
      
      // Redirect to the A/B tests list
      router.push("/a-b-testing");
    } catch (error) {
      console.error("Error creating A/B test:", error);
      toast.error("Failed to create A/B test");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                versions.length >= 2 ? (
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