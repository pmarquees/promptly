"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LucidePlus, LucideFlaskConical, LucideTrash, LucideEdit } from "lucide-react";
import { clientPromptStorage, clientVersionStorage, clientAbTestStorage } from "@/lib/store/clientStorage";
import { Prompt, PromptVersion, ABTest } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function ABTestingPage() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [prompts, setPrompts] = useState<Record<string, Prompt>>({});

  useEffect(() => {
    // Load A/B tests from localStorage
    const loadedTests = clientAbTestStorage.getAll();
    setTests(loadedTests);
    
    // Load prompts and create a lookup map
    const loadedPrompts = clientPromptStorage.getAll();
    const promptMap: Record<string, Prompt> = {};
    
    loadedPrompts.forEach(prompt => {
      promptMap[prompt.id] = prompt;
    });
    
    setPrompts(promptMap);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this A/B test? This action cannot be undone.")) {
      clientAbTestStorage.delete(id);
      setTests(tests.filter(test => test.id !== id));
      toast.success("A/B test deleted successfully");
    }
  };

  const getTestStatus = (test: ABTest): string => {
    if (!test.isActive) return "Inactive";
    
    const now = new Date();
    const startDate = new Date(test.startDate);
    
    if (startDate > now) return "Scheduled";
    
    if (test.endDate) {
      const endDate = new Date(test.endDate);
      if (endDate < now) return "Completed";
    }
    
    return "Running";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">A/B Testing</h1>
        <Link href="/a-b-testing/new">
          <Button>
            <LucidePlus className="mr-2 h-4 w-4" />
            New A/B Test
          </Button>
        </Link>
      </div>

      {tests.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All A/B Tests</CardTitle>
            <CardDescription>
              Manage and track all your A/B tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Prompt</TableHead>
                  <TableHead>Versions</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => {
                  const prompt = prompts[test.promptId];
                  const status = getTestStatus(test);
                  
                  return (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">
                        <Link href={`/a-b-testing/${test.id}`} className="hover:underline">
                          {test.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {prompt ? (
                          <Link href={`/prompts/${prompt.id}`} className="hover:underline">
                            {prompt.name}
                          </Link>
                        ) : (
                          "Unknown prompt"
                        )}
                      </TableCell>
                      <TableCell>{test.versionIds.length}</TableCell>
                      <TableCell>{formatDate(new Date(test.startDate))}</TableCell>
                      <TableCell>
                        {test.endDate ? formatDate(new Date(test.endDate)) : "No end date"}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            status === "Running" ? "default" : 
                            status === "Scheduled" ? "outline" :
                            status === "Completed" ? "secondary" : 
                            "destructive"
                          }
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/a-b-testing/${test.id}/edit`}>
                            <Button variant="outline" size="icon">
                              <LucideEdit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleDelete(test.id)}
                          >
                            <LucideTrash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
          <div className="text-center">
            <LucideFlaskConical className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">No A/B tests yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new A/B test.
            </p>
            <Link href="/a-b-testing/new" className="mt-4 inline-block">
              <Button>
                <LucidePlus className="mr-2 h-4 w-4" />
                New A/B Test
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 