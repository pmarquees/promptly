"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LucideArrowLeft,
  LucideArrowUpRight,
  LucideCheck,
} from "lucide-react";
import { toast } from "sonner";
import { ABTestForm } from "@/components/a-b-testing/ABTestForm";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ABTest, PromptVersion } from "@/lib/types";

interface PromptOption {
  id: string;
  name: string;
  description?: string;
  variables: string[];
}

const CREATION_STEPS = [
  "Prompt",
  "Experiment",
  "Variants",
  "Success",
  "Schedule",
] as const;

export default function NewABTestPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<PromptOption[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState("");
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPrompts() {
      try {
        const response = await fetch("/api/prompts", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to load prompts");
        setPrompts(await response.json());
      } catch (fetchError) {
        if (
          fetchError instanceof DOMException &&
          fetchError.name === "AbortError"
        ) {
          return;
        }
        setError("Failed to load prompts");
        toast.error("Failed to load prompts");
      } finally {
        if (!controller.signal.aborted) setLoadingPrompts(false);
      }
    }

    fetchPrompts();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedPromptId) {
      setVersions([]);
      return;
    }

    const controller = new AbortController();

    async function fetchVersions() {
      setLoadingVersions(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/prompts/${selectedPromptId}/versions`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("Failed to load versions");
        const data = (await response.json()) as Array<
          Omit<PromptVersion, "createdAt"> & { createdAt: string }
        >;
        setVersions(
          data.map((version) => ({
            ...version,
            createdAt: new Date(version.createdAt),
          }))
        );
      } catch (fetchError) {
        if (
          fetchError instanceof DOMException &&
          fetchError.name === "AbortError"
        ) {
          return;
        }
        setError("Failed to load prompt versions");
        toast.error("Failed to load prompt versions");
      } finally {
        if (!controller.signal.aborted) setLoadingVersions(false);
      }
    }

    fetchVersions();
    return () => controller.abort();
  }, [selectedPromptId]);

  const selectedPrompt = useMemo(
    () => prompts.find((prompt) => prompt.id === selectedPromptId),
    [prompts, selectedPromptId]
  );

  const handleSubmit = async (values: ABTest) => {
    try {
      const response = await fetch("/api/a-b-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          versionIds: values.versionIds,
          weights: Object.values(values.distribution),
        }),
      });

      if (!response.ok) {
        const responseBody = await response.json().catch(() => null);
        throw new Error(responseBody?.error || "Failed to create A/B test");
      }

      toast.success("A/B test created successfully");
      router.push("/a-b-testing");
    } catch (submitError) {
      toast.error(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create A/B test"
      );
    }
  };

  if (loadingPrompts) {
    return (
      <div className="promptly-state" aria-live="polite">
        <div>Loading prompts…</div>
      </div>
    );
  }

  if (error && prompts.length === 0) {
    return (
      <div className="promptly-state text-destructive" role="alert">
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div className="ab-create-page">
      <Link href="/a-b-testing" className="detail-back-link">
        <LucideArrowLeft className="h-4 w-4" />
        A/B Testing
      </Link>

      <header className="ab-create-page-header">
        <h1>Create an A/B test</h1>
        <p>
          Compare prompt versions, decide how traffic is split, and define what
          winning means.
        </p>
      </header>

      <nav className="ab-create-steps" aria-label="A/B test creation steps">
        {CREATION_STEPS.map((step, index) => {
          const isReady = index === 0 ? Boolean(selectedPrompt) : false;
          const isCurrent =
            (index === 0 && !selectedPrompt) ||
            (index === 1 && Boolean(selectedPrompt));
          return (
            <div
              data-complete={isReady}
              data-current={isCurrent}
              key={step}
            >
              <span>
                {isReady ? (
                  <LucideCheck className="h-3.5 w-3.5" />
                ) : (
                  String(index + 1).padStart(2, "0")
                )}
              </span>
              <strong>{step}</strong>
            </div>
          );
        })}
      </nav>

      {prompts.length > 0 ? (
        <section className="ab-create-prompt-section">
          <header className="ab-create-section-header">
            <span>01</span>
            <div>
              <h2>Choose a prompt</h2>
              <p>
                Tests compare existing versions of one prompt. You can change
                this until the test is created.
              </p>
            </div>
          </header>

          <div className="ab-create-prompt-picker">
            <div>
              <label htmlFor="ab-test-prompt">Prompt</label>
              <Select
                value={selectedPromptId}
                onValueChange={setSelectedPromptId}
              >
                <SelectTrigger id="ab-test-prompt">
                  <SelectValue placeholder="Choose a prompt to test" />
                </SelectTrigger>
                <SelectContent>
                  {prompts.map((prompt) => (
                    <SelectItem key={prompt.id} value={prompt.id}>
                      {prompt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPrompt ? (
              <div className="ab-create-prompt-summary">
                <div>
                  <span>Selected prompt</span>
                  <strong>{selectedPrompt.name}</strong>
                  <p>
                    {selectedPrompt.description ||
                      "A managed prompt with reusable versions."}
                  </p>
                </div>
                <dl>
                  <div>
                    <dt>Versions</dt>
                    <dd>{loadingVersions ? "…" : versions.length}</dd>
                  </div>
                  <div>
                    <dt>Variables</dt>
                    <dd>{selectedPrompt.variables.length}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="ab-create-prompt-guidance">
                <span>Start here</span>
                <p>
                  Pick the prompt whose versions answer the decision you want
                  to make.
                </p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="ab-create-blocked">
          <h2>Create a prompt first</h2>
          <p>
            A/B tests need a prompt with at least two versions to compare.
          </p>
          <Link href="/prompts/new">
            <Button>
              Create prompt
              <LucideArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>
      )}

      {selectedPrompt ? (
        loadingVersions ? (
          <div className="promptly-state" aria-live="polite">
            <div>Loading prompt versions…</div>
          </div>
        ) : versions.length >= 2 ? (
          <ABTestForm
            key={selectedPromptId}
            promptId={selectedPromptId}
            promptName={selectedPrompt.name}
            versions={versions}
            onSubmit={handleSubmit}
          />
        ) : (
          <section className="ab-create-blocked">
            <h2>Add another version</h2>
            <p>
              {selectedPrompt.name} needs at least two versions before it can be
              tested.
            </p>
            <Link href={`/prompts/${selectedPromptId}/versions/new`}>
              <Button>
                Create version
                <LucideArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </section>
        )
      ) : null}
    </div>
  );
}
