"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideArrowLeft } from "lucide-react";
import { VersionForm } from "@/components/prompts/VersionForm";
import { clientPromptStorage, clientVersionStorage } from "@/lib/store/clientStorage";
import { Prompt, PromptVersion } from "@/lib/types";
import { toast } from "sonner";

interface NewVersionPageProps {
  params: {
    id: string;
  };
}

export default function NewVersionPage({ params }: NewVersionPageProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load prompt from server
    const fetchPrompt = async () => {
      setLoading(true);
      try {
        const promptId = params.id;
        const loadedPrompt = await clientPromptStorage.getById(promptId);
        
        if (!loadedPrompt) {
          toast.error("Prompt not found");
          router.push("/prompts");
          return;
        }
        
        setPrompt(loadedPrompt);
      } catch (error) {
        console.error("Error loading prompt:", error);
        toast.error("Failed to load prompt");
        router.push("/prompts");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrompt();
  }, [params.id, router]);

  const handleSubmit = async (version: PromptVersion) => {
    if (!prompt) return;
    
    try {
      // Save the version to server
      const savedVersion = await clientVersionStorage.save(version);
      
      if (!savedVersion) {
        throw new Error("Failed to save version");
      }
      
      // Update the prompt's versions array
      const updatedPrompt = {
        ...prompt,
        versions: [...(prompt.versions || []), version.id],
      };
      
      // If this is the first version or it's set as active, set it as the current version
      if (!prompt.versions || prompt.versions.length === 0 || version.isActive) {
        updatedPrompt.currentVersionId = version.id;
      }
      
      // Save the updated prompt
      await clientPromptStorage.save(updatedPrompt);
      
      // Show success message
      toast.success("Version created successfully");
      
      // Redirect to the prompt detail page
      router.push(`/prompts/${prompt.id}`);
    } catch (error) {
      console.error("Error creating version:", error);
      toast.error("Failed to create version");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p>Loading prompt...</p>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p>Prompt not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/prompts/${prompt.id}`}>
          <Button variant="ghost" size="icon">
            <LucideArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">New Version</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Version</CardTitle>
          <CardDescription>
            Create a new version for the prompt: {prompt.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VersionForm 
            promptId={prompt.id} 
            onSubmit={handleSubmit}
            defaultValues={{
              content: prompt.content,
              variables: prompt.variables,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
} 