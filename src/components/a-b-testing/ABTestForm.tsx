"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LucideCheck,
  LucideEqual,
  LucidePlus,
  LucideX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HighlightedPromptText } from "@/components/prompts/HighlightedPromptText";
import {
  ABTest,
  CreateABTestFormValues,
  createABTestSchema,
  PromptVersion,
} from "@/lib/types";
import { generateId } from "@/lib/utils";

interface ABTestFormProps {
  promptId: string;
  promptName: string;
  versions: PromptVersion[];
  defaultValues?: Partial<ABTest>;
  onSubmit: (values: ABTest) => void;
  isEditing?: boolean;
}

const RECOMMENDED_METRICS = [
  {
    id: "success_rate",
    label: "Success rate",
    description: "Share of runs that meet the intended outcome.",
  },
  {
    id: "user_rating",
    label: "User rating",
    description: "Average quality score supplied by your product.",
  },
  {
    id: "latency_ms",
    label: "Latency",
    description: "Time to complete a prompt run, in milliseconds.",
  },
] as const;

function distributeEvenly(versionIds: string[]) {
  if (versionIds.length === 0) return {};
  const weight = 1 / versionIds.length;
  return Object.fromEntries(versionIds.map((id) => [id, weight]));
}

export function ABTestForm({
  promptId,
  promptName,
  versions,
  defaultValues,
  onSubmit,
  isEditing = false,
}: ABTestFormProps) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [distributions, setDistributions] = useState<Record<string, number>>(
    {}
  );
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

  useEffect(() => {
    if (isEditing && defaultValues) {
      const initialVersions = defaultValues.versionIds || [];
      setSelectedVersions(initialVersions);
      setDistributions(
        defaultValues.distribution || distributeEvenly(initialVersions)
      );
      setMetrics(defaultValues.metrics || []);
      return;
    }

    const initialVersions = versions.slice(0, 2).map((version) => version.id);
    setSelectedVersions(initialVersions);
    setDistributions(distributeEvenly(initialVersions));
    setMetrics(RECOMMENDED_METRICS.map((metric) => metric.id));
  }, [defaultValues, isEditing, versions]);

  useEffect(() => {
    form.setValue("promptId", promptId);
    form.setValue("versionIds", selectedVersions, { shouldValidate: true });
    form.setValue("distribution", distributions, { shouldValidate: true });
  }, [distributions, form, promptId, selectedVersions]);

  useEffect(() => {
    form.setValue("metrics", metrics, { shouldValidate: true });
  }, [form, metrics]);

  const selectedVersionDetails = useMemo(
    () =>
      selectedVersions
        .map((id) => versions.find((version) => version.id === id))
        .filter((version): version is PromptVersion => Boolean(version)),
    [selectedVersions, versions]
  );

  const trafficTotal = Object.values(distributions).reduce(
    (sum, value) => sum + value,
    0
  );
  const trafficIsValid = Math.abs(trafficTotal - 1) < 0.001;
  const canLaunch =
    selectedVersions.length >= 2 && metrics.length > 0 && trafficIsValid;

  const handleToggleVersion = (versionId: string) => {
    const isSelected = selectedVersions.includes(versionId);
    const nextVersions = isSelected
      ? selectedVersions.filter((id) => id !== versionId)
      : [...selectedVersions, versionId];

    setSelectedVersions(nextVersions);
    setDistributions(distributeEvenly(nextVersions));
  };

  const handleDistributionChange = (versionId: string, value: string) => {
    const nextValue = Math.min(100, Math.max(0, Number(value))) / 100;
    if (!Number.isFinite(nextValue)) return;

    const otherIds = selectedVersions.filter((id) => id !== versionId);
    if (otherIds.length === 0) {
      setDistributions({ [versionId]: 1 });
      return;
    }

    const remainingWeight = (1 - nextValue) / otherIds.length;
    setDistributions({
      ...Object.fromEntries(otherIds.map((id) => [id, remainingWeight])),
      [versionId]: nextValue,
    });
  };

  const handleAddMetric = (metric = newMetric) => {
    const normalizedMetric = metric.trim().toLowerCase().replaceAll(" ", "_");
    if (!normalizedMetric || metrics.includes(normalizedMetric)) return;
    setMetrics((current) => [...current, normalizedMetric]);
    setNewMetric("");
  };

  const handleRemoveMetric = (metric: string) => {
    setMetrics((current) => current.filter((item) => item !== metric));
  };

  const handleSubmit = (values: CreateABTestFormValues) => {
    const test: ABTest = {
      id: isEditing && defaultValues?.id ? defaultValues.id : generateId(),
      ...values,
      startDate: new Date(values.startDate),
      endDate: values.endDate ? new Date(values.endDate) : undefined,
      results:
        isEditing && defaultValues?.results
          ? defaultValues.results
          : undefined,
    };

    onSubmit(test);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="ab-create-form"
      >
        <div className="ab-create-workflow">
          <section className="ab-create-section">
            <header className="ab-create-section-header">
              <span>02</span>
              <div>
                <h2>Describe the experiment</h2>
                <p>Give teammates enough context to understand the decision.</p>
              </div>
            </header>
            <div className="ab-create-field-grid">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Concise vs. contextual follow-up"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Name the difference you are testing.
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
                    <FormLabel>Hypothesis</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="We expect the contextual version to improve success rate because…"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional, but useful when reading results later.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <section className="ab-create-section">
            <header className="ab-create-section-header">
              <span>03</span>
              <div>
                <h2>Choose variants</h2>
                <p>
                  Select at least two versions. The newest two are selected for
                  you.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setDistributions(distributeEvenly(selectedVersions))
                }
                disabled={selectedVersions.length === 0}
              >
                <LucideEqual className="h-4 w-4" />
                Balance evenly
              </Button>
            </header>

            <div className="ab-create-version-list">
              {versions.map((version, index) => {
                const isSelected = selectedVersions.includes(version.id);
                return (
                  <article
                    className="ab-create-version"
                    data-selected={isSelected}
                    key={version.id}
                  >
                    <button
                      type="button"
                      className="ab-create-version-select"
                      aria-pressed={isSelected}
                      onClick={() => handleToggleVersion(version.id)}
                    >
                      <span>
                        {isSelected ? (
                          <LucideCheck className="h-4 w-4" />
                        ) : (
                          String(index + 1).padStart(2, "0")
                        )}
                      </span>
                      <div>
                        <strong>{version.name}</strong>
                        <small>
                          {version.triggerCount.toLocaleString()} triggers
                        </small>
                      </div>
                      <em>{isSelected ? "Selected" : "Select"}</em>
                    </button>

                    <p>
                      <HighlightedPromptText content={version.content} />
                    </p>

                    {isSelected ? (
                      <label className="ab-create-traffic-control">
                        <span>Traffic</span>
                        <div>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            aria-label={`${version.name} traffic percentage`}
                            value={Math.round(
                              (distributions[version.id] || 0) * 100
                            )}
                            onChange={(event) =>
                              handleDistributionChange(
                                version.id,
                                event.target.value
                              )
                            }
                          />
                          <span>%</span>
                        </div>
                      </label>
                    ) : null}
                  </article>
                );
              })}
            </div>

            <div className="ab-create-traffic-total" data-valid={trafficIsValid}>
              <span>Traffic allocation</span>
              <strong>{Math.round(trafficTotal * 100)}%</strong>
              <p>
                {trafficIsValid
                  ? "Ready—every request is allocated."
                  : "Traffic must total 100%."}
              </p>
            </div>
            {form.formState.errors.versionIds ? (
              <p className="text-destructive ab-create-inline-error">
                {form.formState.errors.versionIds.message}
              </p>
            ) : null}
          </section>

          <section className="ab-create-section">
            <header className="ab-create-section-header">
              <span>04</span>
              <div>
                <h2>Define success</h2>
                <p>
                  Start with the recommended signals or add your own metric key.
                </p>
              </div>
            </header>

            <div className="ab-create-metric-options">
              {RECOMMENDED_METRICS.map((metric) => {
                const isSelected = metrics.includes(metric.id);
                return (
                  <button
                    type="button"
                    data-selected={isSelected}
                    aria-pressed={isSelected}
                    key={metric.id}
                    onClick={() =>
                      isSelected
                        ? handleRemoveMetric(metric.id)
                        : handleAddMetric(metric.id)
                    }
                  >
                    <span>
                      {isSelected ? (
                        <LucideCheck className="h-4 w-4" />
                      ) : null}
                    </span>
                    <strong>{metric.label}</strong>
                    <p>{metric.description}</p>
                    <code>{metric.id}</code>
                  </button>
                );
              })}
            </div>

            <div className="ab-create-custom-metric">
              <Input
                aria-label="Custom metric key"
                placeholder="Custom metric key"
                value={newMetric}
                onChange={(event) => setNewMetric(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddMetric();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddMetric()}
              >
                <LucidePlus className="h-4 w-4" />
                Add metric
              </Button>
            </div>

            {metrics.length > 0 ? (
              <div className="ab-create-selected-metrics">
                {metrics.map((metric) => (
                  <span key={metric}>
                    <code>{metric}</code>
                    <button
                      type="button"
                      aria-label={`Remove ${metric}`}
                      onClick={() => handleRemoveMetric(metric)}
                    >
                      <LucideX className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-destructive ab-create-inline-error">
                Choose at least one success metric.
              </p>
            )}
          </section>

          <section className="ab-create-section">
            <header className="ab-create-section-header">
              <span>05</span>
              <div>
                <h2>Schedule the test</h2>
                <p>Launch now or define a fixed experiment window.</p>
              </div>
            </header>

            <div className="ab-create-schedule">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value instanceof Date
                            ? field.value.toISOString().split("T")[0]
                            : field.value
                        }
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
                    <FormLabel>End date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value instanceof Date
                            ? field.value.toISOString().split("T")[0]
                            : field.value || ""
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Leave blank to run until manually stopped.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="ab-create-launch-state">
                  <FormControl>
                    <input
                      id="ab-test-active"
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <div>
                    <FormLabel htmlFor="ab-test-active">
                      Start collecting traffic when the test begins
                    </FormLabel>
                    <FormDescription>
                      Turn this off to save the experiment as inactive.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </section>
        </div>

        <aside className="ab-create-review">
          <span className="rail-label">Review</span>
          <h2>Ready to launch?</h2>
          <p>
            Confirm the experiment setup before creating the test.
          </p>

          <dl>
            <div>
              <dt>Prompt</dt>
              <dd>{promptName}</dd>
            </div>
            <div>
              <dt>Variants</dt>
              <dd>{selectedVersions.length}</dd>
            </div>
            <div>
              <dt>Traffic</dt>
              <dd data-valid={trafficIsValid}>
                {Math.round(trafficTotal * 100)}%
              </dd>
            </div>
            <div>
              <dt>Metrics</dt>
              <dd>{metrics.length}</dd>
            </div>
          </dl>

          <div className="ab-create-review-versions">
            {selectedVersionDetails.map((version, index) => (
              <div key={version.id}>
                <span>{String.fromCharCode(65 + index)}</span>
                <strong>{version.name}</strong>
                <em>
                  {Math.round((distributions[version.id] || 0) * 100)}%
                </em>
              </div>
            ))}
          </div>

          <Button type="submit" disabled={!canLaunch}>
            {isEditing ? "Update A/B test" : "Create A/B test"}
          </Button>
          {!canLaunch ? (
            <small>
              Select two variants, allocate 100% of traffic, and choose a
              metric.
            </small>
          ) : (
            <small>
              You can pause or end the test from its results page.
            </small>
          )}
        </aside>
      </form>
    </Form>
  );
}
