"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideArrowLeft } from "lucide-react";
import { PromptForm } from "@/components/prompts/PromptForm";
import { clientPromptStorage } from "@/lib/store/clientStorage";
import { Prompt } from "@/lib/types";
import { toast } from "sonner";

export default function NewPromptPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (prompt: Prompt) => {
    setIsSubmitting(true);
    
    try {
      // Save the prompt to localStorage
      clientPromptStorage.save(prompt);
      
      // Show success message
      toast.success("Prompt created successfully");
      
      // Redirect to the prompts list
      router.push("/prompts");
    } catch (error) {
      console.error("Error creating prompt:", error);
      toast.error("Failed to create prompt");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/prompts">
          <Button variant="ghost" size="icon">
            <LucideArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create New Prompt</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Prompt</CardTitle>
          <CardDescription>
            Create a new prompt for your LLM applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromptForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
} 