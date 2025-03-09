"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LucidePlus, LucideMessageSquare, LucideTrash, LucideEdit } from "lucide-react";
import { clientPromptStorage, clientVersionStorage } from "@/lib/store/clientStorage";
import { Prompt } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [versions, setVersions] = useState<Record<string, number>>({}); // promptId -> version count

  useEffect(() => {
    // Load prompts from localStorage
    const loadedPrompts = clientPromptStorage.getAll();
    setPrompts(loadedPrompts);
    
    // Count versions for each prompt
    const versionCounts: Record<string, number> = {};
    const loadedVersions = clientVersionStorage.getAll();
    
    loadedVersions.forEach(version => {
      versionCounts[version.promptId] = (versionCounts[version.promptId] || 0) + 1;
    });
    
    setVersions(versionCounts);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this prompt? This action cannot be undone.")) {
      clientPromptStorage.delete(id);
      setPrompts(prompts.filter(prompt => prompt.id !== id));
      toast.success("Prompt deleted successfully");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Prompts</h1>
        <Link href="/prompts/new">
          <Button>
            <LucidePlus className="mr-2 h-4 w-4" />
            New Prompt
          </Button>
        </Link>
      </div>

      {prompts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Prompts</CardTitle>
            <CardDescription>
              Manage and track all your prompts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Versions</TableHead>
                  <TableHead>Triggers</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prompts.map((prompt) => (
                  <TableRow key={prompt.id}>
                    <TableCell className="font-medium">
                      <Link href={`/prompts/${prompt.id}`} className="hover:underline">
                        {prompt.name}
                      </Link>
                    </TableCell>
                    <TableCell>{versions[prompt.id] || 0}</TableCell>
                    <TableCell>{prompt.triggerCount}</TableCell>
                    <TableCell>{formatDate(new Date(prompt.updatedAt))}</TableCell>
                    <TableCell>
                      <Badge variant={prompt.isActive ? "default" : "secondary"}>
                        {prompt.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/prompts/${prompt.id}/edit`}>
                          <Button variant="outline" size="icon">
                            <LucideEdit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleDelete(prompt.id)}
                        >
                          <LucideTrash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
          <div className="text-center">
            <LucideMessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">No prompts yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new prompt.
            </p>
            <Link href="/prompts/new" className="mt-4 inline-block">
              <Button>
                <LucidePlus className="mr-2 h-4 w-4" />
                New Prompt
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 