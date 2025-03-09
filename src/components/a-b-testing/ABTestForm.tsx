"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LucideX, LucidePlus } from "lucide-react";
import { CreateABTestFormValues, createABTestSchema, ABTest, PromptVersion } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface ABTestFormProps {
  promptId: string;
  versions: PromptVersion[];
  defaultValues?: Partial<ABTest>;
  onSubmit: (values: ABTest) => void;
  isEditing?: boolean;
}

export function ABTestForm({ promptId, versions, defaultValues, onSubmit, isEditing = false }: ABTestFormProps) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [distributions, setDistributions] = useState<Record<string, number>>({});
  const [metrics, setMetrics] = useState<string[]>([]);
  const [newMetric, setNewMetric] = useState("");

  const form = useForm<CreateABTestFormValues>({
    resolver: zodResolver(createABTestSchema),
    defaultValues: {
      name: "",
      description: "",
      promptId,
      versionIds: [],
      distribution: {},
      startDate: new Date(),
      isActive: true,
      metrics: [],
      ...defaultValues,
    },
  });

  // Initialize selected versions and distributions from default values
  useEffect(() => {
    if (isEditing && defaultValues) {
      if (defaultValues.versionIds) {
        setSelectedVersions(defaultValues.versionIds);
      }
      
      if (defaultValues.distribution) {
        setDistributions(defaultValues.distribution);
      }
      
      if (defaultValues.metrics) {
        setMetrics(defaultValues.metrics);
      }
    }
  }, [isEditing, defaultValues]);

  // Update form values when selected versions or distributions change
  useEffect(() => {
    form.setValue("versionIds", selectedVersions);
    form.setValue("distribution", distributions);
  }, [selectedVersions, distributions, form]);

  // Update form values when metrics change
  useEffect(() => {
    form.setValue("metrics", metrics);
  }, [metrics, form]);

  const handleAddVersion = (versionId: string) => {
    if (!selectedVersions.includes(versionId)) {
      const newSelectedVersions = [...selectedVersions, versionId];
      setSelectedVersions(newSelectedVersions);
      
      // Distribute evenly
      const evenDistribution = 1 / newSelectedVersions.length;
      const newDistributions: Record<string, number> = {};
      
      newSelectedVersions.forEach(id => {
        newDistributions[id] = evenDistribution;
      });
      
      setDistributions(newDistributions);
    }
  };

  const handleRemoveVersion = (versionId: string) => {
    const newSelectedVersions = selectedVersions.filter(id => id !== versionId);
    setSelectedVersions(newSelectedVersions);
    
    if (newSelectedVersions.length > 0) {
      // Redistribute evenly
      const evenDistribution = 1 / newSelectedVersions.length;
      const newDistributions: Record<string, number> = {};
      
      newSelectedVersions.forEach(id => {
        newDistributions[id] = evenDistribution;
      });
      
      setDistributions(newDistributions);
    } else {
      setDistributions({});
    }
  };

  const handleDistributionChange = (versionId: string, value: string) => {
    const numValue = parseFloat(value) / 100;
    
    if (isNaN(numValue) || numValue < 0 || numValue > 1) return;
    
    // Calculate the total of other distributions
    const otherTotal = Object.entries(distributions)
      .filter(([id]) => id !== versionId)
      .reduce((sum, [, val]) => sum + val, 0);
    
    // Check if the new total would exceed 1
    if (otherTotal + numValue > 1) return;
    
    // Update the distribution for this version
    const newDistributions = { ...distributions, [versionId]: numValue };
    
    // If the total is less than 1, adjust the last version to make it 1
    const total = Object.values(newDistributions).reduce((sum, val) => sum + val, 0);
    
    if (total < 1 && selectedVersions.length > 0) {
      const lastVersionId = selectedVersions[selectedVersions.length - 1];
      
      if (lastVersionId !== versionId) {
        newDistributions[lastVersionId] = 1 - (total - newDistributions[lastVersionId]);
      }
    }
    
    setDistributions(newDistributions);
  };

  const handleAddMetric = () => {
    if (newMetric && !metrics.includes(newMetric)) {
      setMetrics([...metrics, newMetric]);
      setNewMetric("");
    }
  };

  const handleRemoveMetric = (metric: string) => {
    setMetrics(metrics.filter(m => m !== metric));
  };

  const handleSubmit = (values: CreateABTestFormValues) => {
    const test: ABTest = {
      id: isEditing && defaultValues?.id ? defaultValues.id : generateId(),
      startDate: new Date(values.startDate),
      endDate: values.endDate ? new Date(values.endDate) : undefined,
      results: isEditing && defaultValues?.results ? defaultValues.results : undefined,
      ...values,
    };
    
    onSubmit(test);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter A/B test name" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name for this A/B test.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a description for this A/B test"
                  className="min-h-20"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Optional description to explain the purpose of this test.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel>Versions</FormLabel>
          <FormDescription className="mt-1 mb-2">
            Select at least two versions to compare in this A/B test.
          </FormDescription>
          
          <div className="space-y-4">
            {selectedVersions.length > 0 ? (
              <div className="space-y-2">
                {selectedVersions.map(versionId => {
                  const version = versions.find(v => v.id === versionId);
                  if (!version) return null;
                  
                  return (
                    <div key={versionId} className="flex items-center gap-4 p-3 border rounded-md">
                      <div className="flex-1">
                        <p className="font-medium">{version.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          className="w-20"
                          value={Math.round((distributions[versionId] || 0) * 100)}
                          onChange={(e) => handleDistributionChange(versionId, e.target.value)}
                        />
                        <span>%</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveVersion(versionId)}
                        >
                          <LucideX className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No versions selected.</p>
            )}
            
            <div>
              <Select
                onValueChange={handleAddVersion}
                value=""
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add a version" />
                </SelectTrigger>
                <SelectContent>
                  {versions
                    .filter(version => !selectedVersions.includes(version.id))
                    .map(version => (
                      <SelectItem key={version.id} value={version.id}>
                        {version.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {selectedVersions.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                Total: {Math.round(Object.values(distributions).reduce((sum, val) => sum + val, 0) * 100)}%
              </p>
            </div>
          )}
          
          {form.formState.errors.versionIds && (
            <p className="text-sm font-medium text-destructive mt-2">
              {form.formState.errors.versionIds.message}
            </p>
          )}
        </div>
        
        <div>
          <FormLabel>Metrics</FormLabel>
          <FormDescription className="mt-1 mb-2">
            Define metrics to track for this A/B test.
          </FormDescription>
          
          <div className="mt-2 mb-1 flex flex-wrap gap-2">
            {metrics.map((metric) => (
              <Badge key={metric} variant="secondary" className="text-sm">
                {metric}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 p-0"
                  onClick={() => handleRemoveMetric(metric)}
                >
                  <LucideX className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Add metric (e.g., conversion_rate)"
              value={newMetric}
              onChange={(e) => setNewMetric(e.target.value)}
              className="max-w-xs"
            />
            <Button type="button" variant="outline" onClick={handleAddMetric}>
              <LucidePlus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value || ""}
                />
              </FormControl>
              <FormDescription>
                If not set, the test will run indefinitely until manually stopped.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
          <Button type="submit" disabled={selectedVersions.length < 2}>
            {isEditing ? "Update A/B Test" : "Create A/B Test"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 