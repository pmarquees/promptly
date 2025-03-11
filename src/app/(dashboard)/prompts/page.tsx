"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LucidePlus, LucideMessageSquare, LucideTrash, LucideEdit } from "lucide-react";
import { Prompt } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Extended Prompt type that includes user information from the API
interface PromptWithUser extends Prompt {
  user?: {
    name: string | null;
  };
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptWithUser[]>([]);
  const [versions, setVersions] = useState<Record<string, number>>({}); // promptId -> version count
  const [isLoading, setIsLoading] = useState(true);
  const [creatorNames, setCreatorNames] = useState<Record<string, string>>({}); // userId -> name

  useEffect(() => {
    // Load prompts from API
    const fetchPrompts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/prompts');
        if (response.ok) {
          const data = await response.json();
          setPrompts(data);
          
          // Count versions for each prompt
          const versionCounts: Record<string, number> = {};
          
          // For each prompt, fetch its versions
          for (const prompt of data) {
            if (prompt.versions && Array.isArray(prompt.versions)) {
              versionCounts[prompt.id] = prompt.versions.length;
            } else {
              versionCounts[prompt.id] = 0;
            }

            // Store creator names if available
            if (prompt.user && prompt.user.name) {
              setCreatorNames(prev => ({
                ...prev,
                [prompt.createdBy]: prompt.user.name
              }));
            }
          }
          
          setVersions(versionCounts);
        } else {
          console.error('Failed to fetch prompts');
          toast.error('Failed to load prompts');
        }
      } catch (error) {
        console.error('Error fetching prompts:', error);
        toast.error('Failed to load prompts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this prompt? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/prompts/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setPrompts(prompts.filter(prompt => prompt.id !== id));
          toast.success("Prompt deleted successfully");
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.h1 
          className="text-3xl font-bold"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Prompts
        </motion.h1>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/prompts/new">
            <Button className="bg-orange hover:bg-orange-light border-orange">
              <LucidePlus className="h-4 w-4 mr-2" />
              New Prompt
            </Button>
          </Link>
        </motion.div>
      </div>

      <Card className="border-orange/10">
        <CardHeader>
          <CardTitle>Your Prompts</CardTitle>
          <CardDescription>
            Manage your prompts and their versions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading prompts...</div>
          ) : prompts.length === 0 ? (
            <motion.div 
              className="text-center py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-muted-foreground mb-4">You haven't created any prompts yet.</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/prompts/new">
                  <Button className="bg-orange hover:bg-orange-light border-orange">
                    <LucidePlus className="h-4 w-4 mr-2" />
                    Create Your First Prompt
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Variables</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Versions</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Trigger Count</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="contents"
                >
                  {prompts.map((prompt) => (
                    <motion.tr
                      key={prompt.id}
                      variants={item}
                      className="hover:bg-orange/5"
                    >
                      <TableCell className="font-medium">{prompt.name}</TableCell>
                      <TableCell>
                        {prompt.variables.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {prompt.variables.map((variable) => (
                              <Badge key={variable} variant="outline" className="border-orange/30 text-orange-dark">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {prompt.user?.name || creatorNames[prompt.createdBy] || "Anonymous"}
                      </TableCell>
                      <TableCell>{versions[prompt.id] || 0}</TableCell>
                      <TableCell>{formatDate(new Date(prompt.updatedAt))}</TableCell>
                      <TableCell>{prompt.triggerCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                            <Link href={`/prompts/${prompt.id}`}>
                              <Button variant="ghost" size="icon" className="hover:text-orange">
                                <LucideMessageSquare className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                            </Link>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                            <Link href={`/prompts/${prompt.id}/edit`}>
                              <Button variant="ghost" size="icon" className="hover:text-orange">
                                <LucideEdit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </Link>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(prompt.id)} className="hover:text-orange">
                              <LucideTrash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </motion.div>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </motion.div>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 