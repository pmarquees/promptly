"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideFlaskConical, LucideMessageSquare, LucidePlus } from "lucide-react";
import { formatDate } from "@/lib/utils";

// Define types for the data structures
interface PromptWithUser {
  id: string;
  name: string;
  updatedAt: Date;
  triggerCount: number;
  user: {
    name: string | null;
  };
}

interface ABTestWithDetails {
  id: string;
  name: string;
  prompt: {
    name: string;
  };
  versions: Array<{ id: string; weight: number }>;
}

interface DashboardMetrics {
  totalPrompts: number;
  totalVersions: number;
  totalTriggers: number;
  activeTests: number;
  recentPrompts: PromptWithUser[];
  activeTestsWithDetails: ABTestWithDetails[];
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPrompts: 0,
    totalVersions: 0,
    totalTriggers: 0,
    activeTests: 0,
    recentPrompts: [],
    activeTestsWithDetails: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/dashboard/metrics');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error("Error fetching dashboard metrics:", err);
        setError("Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-[60vh]">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-[60vh] text-red-500">{error}</div>;
  }

  const {
    totalPrompts,
    totalVersions,
    totalTriggers,
    activeTests,
    recentPrompts,
    activeTestsWithDetails
  } = metrics;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/prompts/new">
          <Button>
            <LucidePlus className="mr-2 h-4 w-4" />
            New Prompt
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPrompts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVersions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTriggers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active A/B Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTests}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Prompts</CardTitle>
            <CardDescription>
              Your most recently updated prompts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentPrompts.length > 0 ? (
              <div className="space-y-4">
                {recentPrompts.map((prompt: PromptWithUser) => (
                  <div key={prompt.id} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <LucideMessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Link href={`/prompts/${prompt.id}`} className="font-medium hover:underline">
                        {prompt.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Updated {formatDate(new Date(prompt.updatedAt))}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {prompt.triggerCount} triggers
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
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
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Active A/B Tests</CardTitle>
            <CardDescription>
              Your currently running A/B tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeTestsWithDetails.length > 0 ? (
              <div className="space-y-4">
                {activeTestsWithDetails.map((test: ABTestWithDetails) => (
                  <div key={test.id} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <LucideFlaskConical className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Link href={`/a-b-testing/${test.id}`} className="font-medium hover:underline">
                        {test.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {test.prompt.name}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {test.versions.length} versions
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                <div className="text-center">
                  <LucideFlaskConical className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">No active tests</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Start A/B testing your prompts to improve performance.
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
