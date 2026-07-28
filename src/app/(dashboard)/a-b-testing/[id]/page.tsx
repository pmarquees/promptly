"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LucideArrowLeft,
  LucideArrowUpRight,
  LucideCalendarDays,
  LucideCheck,
  LucideCopy,
} from "lucide-react";
import { toast } from "sonner";
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

interface TestResults {
  lift?: number;
  confidence?: number;
  totalSamples?: number;
  status?: string;
  [key: string]: unknown;
}

interface ABTestDetail {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  metrics: string[];
  results: TestResults | null;
  prompt: {
    id: string;
    name: string;
  };
  versions: TestVersion[];
}

interface ABTestDetailPageProps {
  params: Promise<{ id: string }>;
}

const METRIC_ALIASES: Record<string, string[]> = {
  success_rate: ["success_rate", "successRate"],
  user_rating: ["user_rating", "userRating", "averageRating"],
  latency_ms: ["latency_ms", "latencyMs", "averageLatencyMs"],
};

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

function getMetricValue(version: TestVersion["version"], metric: string) {
  const aliases = METRIC_ALIASES[metric] || [metric];
  for (const alias of aliases) {
    const value = version.performance?.[alias];
    if (typeof value === "number") return value;
  }
  return null;
}

function formatMetricValue(metric: string, value: number | null) {
  if (value === null) return "—";
  if (/rate|percentage|conversion/i.test(metric)) {
    return `${(value <= 1 ? value * 100 : value).toFixed(1)}%`;
  }
  if (/latency|_ms|time_ms/i.test(metric)) {
    return `${Math.round(value)} ms`;
  }
  if (/rating|score/i.test(metric)) {
    return `${value.toFixed(2)} / 5`;
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function isLowerBetter(metric: string) {
  return /latency|time|cost|error/i.test(metric);
}

function PromptExcerpt({ content }: { content: string }) {
  return (
    <pre className="ab-prompt-excerpt">
      {content.split(/(\{\{[^}]+\}\})/g).map((part, index) =>
        part.startsWith("{{") ? (
          <mark key={`${part}-${index}`}>{part}</mark>
        ) : (
          part
        )
      )}
    </pre>
  );
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
        if (
          fetchError instanceof DOMException &&
          fetchError.name === "AbortError"
        ) {
          return;
        }
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load A/B test"
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchTest();
    return () => controller.abort();
  }, [id]);

  const analysis = useMemo(() => {
    if (!test) return null;
    const primaryMetric = test.metrics[0] || "trigger_count";
    const versionValues = test.versions.map((item) => ({
      item,
      value:
        primaryMetric === "trigger_count"
          ? item.version.triggerCount
          : getMetricValue(item.version, primaryMetric),
    }));
    const ranked = [...versionValues]
      .filter(
        (
          entry
        ): entry is { item: TestVersion; value: number } =>
          typeof entry.value === "number"
      )
      .sort((a, b) =>
        isLowerBetter(primaryMetric) ? a.value - b.value : b.value - a.value
      );
    const winner = ranked[0]?.item || test.versions[0];
    const runnerUp = ranked[1];
    const improvement =
      ranked[0] && runnerUp && runnerUp.value !== 0
        ? Math.abs(
            ((ranked[0].value - runnerUp.value) / runnerUp.value) * 100
          )
        : test.results?.lift;

    return {
      primaryMetric,
      winner,
      improvement:
        typeof improvement === "number" ? improvement : null,
    };
  }, [test]);

  if (loading) {
    return (
      <div className="promptly-state" aria-live="polite">
        <div>Loading test results…</div>
      </div>
    );
  }

  if (error || !test || !analysis) {
    return (
      <div className="space-y-6">
        <Link href="/a-b-testing" className="detail-back-link">
          <LucideArrowLeft className="h-4 w-4" />
          A/B Testing
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
  const totalSamples =
    typeof test.results?.totalSamples === "number"
      ? test.results.totalSamples
      : totalTriggers;
  const confidence =
    typeof test.results?.confidence === "number"
      ? test.results.confidence * 100
      : null;
  return (
    <div className="product-detail-page ab-results-page">
      <Link href="/a-b-testing" className="detail-back-link">
        <LucideArrowLeft className="h-4 w-4" />
        A/B Testing
      </Link>

      <header className="product-detail-header ab-results-header">
        <div>
          <div className="detail-status-line">
            <span
              className="detail-status-dot"
              data-active={status === "Running"}
              aria-hidden="true"
            />
            {status}
            <span aria-hidden="true">·</span>
            Results
          </div>
          <h1>{test.name}</h1>
          <p>
            {test.description ||
              `Comparing ${test.versions.length} versions of ${test.prompt.name}.`}
          </p>
        </div>
        <dl className="ab-header-metadata">
          <div>
            <dt>Prompt</dt>
            <dd>
              <Link href={`/prompts/${test.prompt.id}`}>
                {test.prompt.name}
                <LucideArrowUpRight className="h-4 w-4" />
              </Link>
            </dd>
          </div>
          <div>
            <dt>Traffic allocation</dt>
            <dd>
              {test.versions
                .map((item) => `${Math.round(item.weight * 100)}%`)
                .join(" / ")}
            </dd>
          </div>
          <div>
            <dt>Test ID</dt>
            <dd>{test.id}</dd>
          </div>
        </dl>
      </header>

      <section className="ab-result-hero">
        <div className="ab-result-statement">
          <span className="section-index">Current read</span>
          <h2>
            {analysis.winner?.version.name || "A variant"}{" "}
            <em>is leading.</em>
          </h2>
          <p>
            {analysis.improvement !== null
              ? `${analysis.improvement.toFixed(
                  1
                )}% improvement on ${formatMetric(analysis.primaryMetric)}.`
              : `Leading on ${formatMetric(analysis.primaryMetric)} with the data collected so far.`}
            {confidence !== null
              ? ` Confidence is currently ${confidence.toFixed(0)}%.`
              : ""}
          </p>
        </div>
        <div className="ab-result-facts">
          <div>
            <span>Primary metric</span>
            <strong>{formatMetric(analysis.primaryMetric)}</strong>
          </div>
          <div>
            <span>Samples</span>
            <strong>{totalSamples.toLocaleString()}</strong>
          </div>
          <div>
            <span>Lift</span>
            <strong>
              {analysis.improvement !== null
                ? `+${analysis.improvement.toFixed(1)}%`
                : "Collecting"}
            </strong>
          </div>
          <div>
            <span>Confidence</span>
            <strong>
              {confidence !== null ? `${confidence.toFixed(0)}%` : "—"}
            </strong>
          </div>
        </div>
      </section>

      <section className="editorial-section ab-variant-section">
        <div className="editorial-section-heading">
          <div>
            <span className="section-index">01</span>
            <h2>Version comparison</h2>
          </div>
          <span className="section-count">
            {test.versions.length} variants
          </span>
        </div>
        <div className="ab-variant-grid">
          {test.versions.map((item, index) => {
            const isWinner = item.version.id === analysis.winner?.version.id;
            return (
              <article
                className="ab-variant-panel"
                data-winner={isWinner}
                key={item.id}
              >
                <header>
                  <div>
                    <span className="ab-variant-letter">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <h3>{item.version.name}</h3>
                  </div>
                  {isWinner ? (
                    <span className="ab-leading-label">
                      <LucideCheck className="h-3.5 w-3.5" />
                      Leading
                    </span>
                  ) : (
                    <span>{Math.round(item.weight * 100)}% traffic</span>
                  )}
                </header>
                <PromptExcerpt content={item.version.content} />
                <footer>
                  <span>{item.version.variables.length} variables</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.version.content);
                      toast.success(`${item.version.name} copied`);
                    }}
                  >
                    <LucideCopy className="h-4 w-4" />
                    Copy
                  </button>
                </footer>
              </article>
            );
          })}
        </div>
      </section>

      <section className="editorial-section">
        <div className="editorial-section-heading">
          <div>
            <span className="section-index">02</span>
            <h2>Metric readout</h2>
          </div>
          <span className="section-count">{totalTriggers} total triggers</span>
        </div>
        <div className="ab-metric-ledger">
          <div className="ab-metric-ledger-head">
            <span>Metric</span>
            {test.versions.map((item) => (
              <span key={item.id}>{item.version.name}</span>
            ))}
            <span>Read</span>
          </div>
          {test.metrics.map((metric) => {
            const values = test.versions.map((item) =>
              getMetricValue(item.version, metric)
            );
            const numericValues = values.filter(
              (value): value is number => value !== null
            );
            const maxValue = Math.max(...numericValues, 1);
            const bestValue =
              numericValues.length > 0
                ? isLowerBetter(metric)
                  ? Math.min(...numericValues)
                  : Math.max(...numericValues)
                : null;

            return (
              <div className="ab-metric-ledger-row" key={metric}>
                <strong>{formatMetric(metric)}</strong>
                {values.map((value, index) => (
                  <div
                    className="ab-metric-value"
                    data-best={value !== null && value === bestValue}
                    key={test.versions[index].id}
                  >
                    <span>{formatMetricValue(metric, value)}</span>
                    <div aria-hidden="true">
                      <i
                        style={{
                          width: `${
                            value === null
                              ? 0
                              : Math.max(6, (value / maxValue) * 100)
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <span className="ab-metric-read">
                  {bestValue === null
                    ? "Awaiting data"
                    : `${test.versions.find(
                        (item) =>
                          getMetricValue(item.version, metric) === bestValue
                      )?.version.name || "Leading"} ahead`}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="ab-results-footer">
        <section>
          <div className="editorial-section-heading">
            <div>
              <span className="section-index">03</span>
              <h2>Test window</h2>
            </div>
          </div>
          <dl className="ab-window-ledger">
            <div>
              <dt>
                <LucideCalendarDays className="h-4 w-4" />
                Started
              </dt>
              <dd>{formatDate(new Date(test.startDate))}</dd>
            </div>
            <div>
              <dt>
                <LucideCalendarDays className="h-4 w-4" />
                Ends
              </dt>
              <dd>
                {test.endDate
                  ? formatDate(new Date(test.endDate))
                  : "No end date"}
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{status}</dd>
            </div>
          </dl>
        </section>
        <section>
          <div className="editorial-section-heading">
            <div>
              <span className="section-index">04</span>
              <h2>Tracked metrics</h2>
            </div>
          </div>
          <div className="tracked-metric-list">
            {test.metrics.map((metric, index) => (
              <div key={metric}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <code>{metric}</code>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
