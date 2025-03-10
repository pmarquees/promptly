"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LucidePlus, LucideFlaskConical, LucideTrash, LucideEdit } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

// Define the type for A/B tests
interface ABTestWithVersions {
  id: string;
  name: string;
  description: string | null;
  promptId: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  metrics: string[];
  results: any | null;
  createdBy: string;
  versions: {
    id: string;
    abTestId: string;
    versionId: string;
    weight: number;
    version: {
      id: string;
      name: string;
      content: string;
      variables: string[];
    };
  }[];
  prompt: {
    id: string;
    name: string;
  };
}

export default function ABTestingPage() {
  const [tests, setTests] = useState<ABTestWithVersions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch('/api/a-b-tests');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTests(data);
      } catch (err) {
        console.error("Error fetching A/B tests:", err);
        setError("Failed to load A/B tests");
        toast.error("Failed to load A/B tests");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const getTestStatus = (test: ABTestWithVersions): string => {
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

  if (loading) {
    return <div className="flex justify-center items-center h-[60vh]">Loading A/B tests...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-[60vh] text-red-500">{error}</div>;
  }

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
                {tests.map((test: ABTestWithVersions) => {
                  const status = getTestStatus(test);
                  
                  return (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">
                        <Link href={`/a-b-testing/${test.id}`} className="hover:underline">
                          {test.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/prompts/${test.promptId}`} className="hover:underline">
                          {test.prompt.name}
                        </Link>
                      </TableCell>
                      <TableCell>{test.versions.length}</TableCell>
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
                          <form action={`/api/a-b-tests/${test.id}/delete`} method="POST">
                            <Button 
                              variant="outline" 
                              size="icon"
                              type="submit"
                            >
                              <LucideTrash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </form>
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