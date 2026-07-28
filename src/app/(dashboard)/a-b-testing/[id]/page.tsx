"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  LucideArrowLeft,
  LucideArrowUpRight,
  LucideCalendarDays,
  LucideFlaskConical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

interface TestVersion {
  id: string;
  weight: number;
  version: {
    id: string;
    name: string;
    content: string;
    variables: string[];
    triggerCount: number;
    performance: Record<string, number> | null;
  };
}

interface ABTestDetail {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  metrics: string[];
  results: Record<string, Record<string, number>> | null;
  prompt: {
    id: string;
    name: string;
  };
  versions: TestVersion[];
}

interface ABTestDetailPageProps {
  params: Promise<{ id: string }>;
}

function getStatus(test: ABTestDetail) {
  if (!test.isActive) return "Inactive";

  const now = new Date();
  if (new Date(test.startDate) > now) return "Scheduled";
  if (test.endDate && new Date(test.endDate) < now) return "Completed";
  return "Running";
}

function formatMetric(metric: string) {
  return metric.replaceAll("_", " ");
}

export default function ABTestDetailPage({ params }: ABTestDetailPageProps) {
  const { id } = use(params);
  const [test, setTest] = useState<ABTestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTest() {
      try {
        const response = await fetch(`/api/a-b-tests/${id}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "A/B test not found"
              : "Failed to load A/B test"
          );
        }

        setTest(await response.json());
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load A/B test"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchTest();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <div className="promptly-state" aria-live="polite">
        <div>Loading test details…</div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="space-y-6">
        <Link href="/a-b-testing">
          <Button variant="ghost">
            <LucideArrowLeft className="h-4 w-4" />
            Back to A/B tests
          </Button>
        </Link>
        <div className="promptly-state text-destructive" role="alert">
          <div>{error || "A/B test not found"}</div>
        </div>
      </div>
    );
  }

  const status = getStatus(test);
  const totalTriggers = test.versions.reduce(
    (sum, item) => sum + item.version.triggerCount,
    0
  );

  return (
    <div className="space-y-6">
      <Link href="/a-b-testing">
        <Button variant="ghost">
          <LucideArrowLeft className="h-4 w-4" />
          Back to A/B tests
        </Button>
      </Link>

      <div className="flex items-start justify-between gap-6">
        <div>
          <h1>{test.name}</h1>
          <p>
            {test.description ||
              `Comparing ${test.versions.length} versions of ${test.prompt.name}.`}
          </p>
        </div>
        <Badge variant={status === "Running" ? "default" : "outline"}>
          {status}
        </Badge>
      </div>

      <div className="dashboard-metrics">
        <Card className="dashboard-metric">
          <CardHeader>
            <CardTitle>Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/prompts/${test.prompt.id}`}
              className="ab-detail-value ab-detail-link"
            >
              {test.prompt.name}
              <LucideArrowUpRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
        <Card className="dashboard-metric">
          <CardHeader>
            <CardTitle>Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <div>{test.versions.length}</div>
          </CardContent>
        </Card>
        <Card className="dashboard-metric">
          <CardHeader>
            <CardTitle>Total triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <div>{totalTriggers}</div>
          </CardContent>
        </Card>
        <Card className="dashboard-metric">
          <CardHeader>
            <CardTitle>Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div>{test.metrics.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Version allocation</CardTitle>
          <CardDescription>
            Traffic distribution and observed performance for this test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Traffic</TableHead>
                <TableHead>Triggers</TableHead>
                {test.metrics.map((metric) => (
                  <TableHead key={metric}>{formatMetric(metric)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {test.versions.map(({ id: assignmentId, weight, version }) => (
                <TableRow key={assignmentId}>
                  <TableCell>
                    <div className="ab-version-name">
                      <span>{version.name}</span>
                      {version.variables.length > 0 ? (
                        <small>{version.variables.length} variables</small>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>{Math.round(weight * 100)}%</TableCell>
                  <TableCell>{version.triggerCount}</TableCell>
                  {test.metrics.map((metric) => {
                    const value =
                      test.results?.[version.id]?.[metric] ??
                      version.performance?.[metric];

                    return (
                      <TableCell key={metric}>
                        {typeof value === "number" ? value.toFixed(2) : "—"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test window</CardTitle>
            <CardDescription>Schedule and current lifecycle</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="ab-detail-list">
              <div>
                <dt><LucideCalendarDays className="h-4 w-4" /> Started</dt>
                <dd>{formatDate(new Date(test.startDate))}</dd>
              </div>
              <div>
                <dt><LucideCalendarDays className="h-4 w-4" /> Ends</dt>
                <dd>
                  {test.endDate
                    ? formatDate(new Date(test.endDate))
                    : "No end date"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tracked metrics</CardTitle>
            <CardDescription>
              Signals recorded for each prompt version
            </CardDescription>
          </CardHeader>
          <CardContent>
            {test.metrics.length > 0 ? (
              <div className="ab-metric-list">
                {test.metrics.map((metric) => (
                  <div key={metric}>
                    <LucideFlaskConical className="h-4 w-4" />
                    <span>{formatMetric(metric)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No metrics configured for this test.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
