"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LucideX } from "lucide-react";
import { CreateVersionFormValues, createVersionSchema, PromptVersion } from "@/lib/types";
import { extractVariables, generateId } from "@/lib/utils";

interface VersionFormProps {
  promptId: string;
  defaultValues?: Partial<PromptVersion>;
  onSubmit: (values: PromptVersion) => void;
  isEditing?: boolean;
}

export function VersionForm({ promptId, defaultValues, onSubmit, isEditing = false }: VersionFormProps) {
  const [extractedVariables, setExtractedVariables] = useState<string[]>([]);
  const [customVariables, setCustomVariables] = useState<string[]>([]);
  const [newVariable, setNewVariable] = useState("");

  const form = useForm<CreateVersionFormValues>({
    resolver: zodResolver(createVersionSchema),
    defaultValues: {
      promptId,
      name: "",
      content: "",
      variables: [],
      createdBy: "Anonymous",
      isActive: false,
      ...defaultValues,
    },
  });

  // Extract variables from content when it changes
  useEffect(() => {
    const content = form.watch("content");
    if (content) {
      const variables = extractVariables(content);
      setExtractedVariables(variables);
    }
  }, [form.watch("content"), form]);

  // Update form variables when extracted or custom variables change
  useEffect(() => {
    const allVariables = [...new Set([...extractedVariables, ...customVariables])];
    form.setValue("variables", allVariables);
  }, [extractedVariables, customVariables, form]);

  const handleAddVariable = () => {
    if (newVariable && !customVariables.includes(newVariable)) {
      setCustomVariables([...customVariables, newVariable]);
      setNewVariable("");
    }
  };

  const handleRemoveVariable = (variable: string) => {
    setCustomVariables(customVariables.filter(v => v !== variable));
  };

  const handleSubmit = (values: CreateVersionFormValues) => {
    const version: PromptVersion = {
      id: isEditing && defaultValues?.id ? defaultValues.id : generateId(),
      createdAt: isEditing && defaultValues?.createdAt ? new Date(defaultValues.createdAt) : new Date(),
      triggerCount: isEditing && defaultValues?.triggerCount !== undefined ? defaultValues.triggerCount : 0,
      performance: isEditing && defaultValues?.performance ? defaultValues.performance : {},
      ...values,
    };
    
    onSubmit(version);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Version Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter version name" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name for this version.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your prompt content. Use {{variable}} syntax for variables."
                  className="min-h-40 font-mono"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The actual prompt content. Use <code>{"{{variable}}"}</code> syntax for variables.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel>Variables</FormLabel>
          <div className="mt-2 mb-1 flex flex-wrap gap-2">
            {form.watch("variables").map((variable) => (
              <Badge key={variable} variant="secondary" className="text-sm">
                {variable}
                {customVariables.includes(variable) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => handleRemoveVariable(variable)}
                  >
                    <LucideX className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                )}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Add custom variable"
              value={newVariable}
              onChange={(e) => setNewVariable(e.target.value)}
              className="max-w-xs"
            />
            <Button type="button" variant="outline" onClick={handleAddVariable}>
              Add
            </Button>
          </div>
          <FormDescription className="mt-2">
            Variables are automatically extracted from your prompt content. You can also add custom variables.
          </FormDescription>
        </div>
        
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4"
                />
              </FormControl>
              <FormLabel className="text-sm font-normal">Active</FormLabel>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit">
            {isEditing ? "Update Version" : "Create Version"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 