"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LucideArrowLeft,
  LucideArrowUpRight,
  LucideCheck,
  LucideCode2,
  LucideCopy,
  LucideEdit,
  LucidePlus,
  LucideTrash,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HighlightedPromptText } from "@/components/prompts/HighlightedPromptText";
import { Prompt, PromptVersion } from "@/lib/types";
import {
  formatDate,
  generateCodeSnippet,
  generatePromptUrl,
} from "@/lib/utils";

interface PromptDetailPageProps {
  params: Promise<{ id: string }>;
}

type IntegrationLanguage = "javascript" | "python" | "curl";

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function PromptContent({ content }: { content: string }) {
  return (
    <div className="prompt-manuscript" aria-label="Prompt content">
      <div className="prompt-manuscript-gutter" aria-hidden="true">
        01
      </div>
      <pre>
        <HighlightedPromptText content={content} />
      </pre>
    </div>
  );
}

export default function PromptDetailPage({ params }: PromptDetailPageProps) {
  const { id: promptId } = use(params);
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLanguage, setSelectedLanguage] =
    useState<IntegrationLanguage>("javascript");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPrompt() {
      setIsLoading(true);
      setError(null);

      try {
        const [promptsResponse, versionsResponse] = await Promise.all([
          fetch("/api/prompts", { signal: controller.signal }),
          fetch(`/api/prompts/${promptId}/versions`, {
            signal: controller.signal,
          }),
        ]);

        if (!promptsResponse.ok) {
          throw new Error("Failed to load prompt");
        }

        const promptsData = (await promptsResponse.json()) as Array<
          Omit<Prompt, "createdAt" | "updatedAt"> & {
            createdAt: string;
            updatedAt: string;
          }
        >;
        const promptData = promptsData.find((item) => item.id === promptId);

        if (!promptData) {
          throw new Error("Prompt not found");
        }

        setPrompt({
          ...promptData,
          createdAt: new Date(promptData.createdAt),
          updatedAt: new Date(promptData.updatedAt),
          versions: promptData.versions || [],
        });

        if (versionsResponse.ok) {
          const versionsData = (await versionsResponse.json()) as Array<
            Omit<PromptVersion, "createdAt"> & { createdAt: string }
          >;
          setVersions(
            versionsData.map((version) => ({
              ...version,
              createdAt: new Date(version.createdAt),
            }))
          );
        } else {
          setVersions([]);
        }
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
            : "Failed to load prompt"
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchPrompt();
    return () => controller.abort();
  }, [promptId]);

  const handleDelete = async () => {
    if (
      !prompt ||
      !confirm(
        "Are you sure you want to delete this prompt? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete prompt");
      }

      toast.success("Prompt deleted successfully");
      router.push("/prompts");
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete prompt"
      );
    }
  };

  const handleCopyUrl = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(generatePromptUrl(prompt.id));
    toast.success("API URL copied to clipboard");
  };

  const handleCopyCode = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(
      generateCodeSnippet(prompt.id, selectedLanguage)
    );
    toast.success("Code snippet copied to clipboard");
  };

  const setCurrentVersion = async (version: PromptVersion) => {
    if (!prompt || prompt.currentVersionId === version.id) return;

    try {
      const updatedPrompt = { ...prompt, currentVersionId: version.id };
      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPrompt),
      });

      if (!response.ok) throw new Error("Failed to update prompt");
      setPrompt(updatedPrompt);
      toast.success(`Set "${version.name}" as the current version`);
    } catch {
      toast.error("Failed to update prompt");
    }
  };

  if (isLoading) {
    return (
      <div className="promptly-state" aria-live="polite">
        <div>Loading prompt overview…</div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="space-y-6">
        <Link href="/prompts" className="detail-back-link">
          <LucideArrowLeft className="h-4 w-4" />
          Prompts
        </Link>
        <div className="promptly-state text-destructive" role="alert">
          <div>{error || "Prompt not found"}</div>
        </div>
      </div>
    );
  }

  const currentVersion =
    versions.find((version) => version.id === prompt.currentVersionId) ||
    versions.find((version) => version.isActive) ||
    versions[0];
  const endpoint = generatePromptUrl(prompt.id);

  return (
    <div className="product-detail-page">
      <Link href="/prompts" className="detail-back-link">
        <LucideArrowLeft className="h-4 w-4" />
        Prompts
      </Link>

      <header className="product-detail-header">
        <div>
          <div className="detail-status-line">
            <span
              className="detail-status-dot"
              data-active={prompt.isActive}
              aria-hidden="true"
            />
            {prompt.isActive ? "Active" : "Inactive"}
          </div>
          <h1>{prompt.name}</h1>
          <p>
            {prompt.description ||
              "A production prompt managed, versioned, and delivered through Promptly."}
          </p>
        </div>
        <div className="detail-actions">
          <Link href={`/prompts/${prompt.id}/edit`}>
            <Button variant="outline">
              <LucideEdit className="h-4 w-4" />
              Edit prompt
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <LucideTrash className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList aria-label="Prompt sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="prompt-overview-grid">
            <div className="prompt-overview-main">
              <section className="editorial-section">
                <div className="editorial-section-heading">
                  <div>
                    <span className="section-index">01</span>
                    <h2>Prompt</h2>
                  </div>
                  <button
                    className="text-action"
                    onClick={() => {
                      navigator.clipboard.writeText(prompt.content);
                      toast.success("Prompt copied to clipboard");
                    }}
                  >
                    <LucideCopy className="h-4 w-4" />
                    Copy prompt
                  </button>
                </div>
                <PromptContent content={prompt.content} />
              </section>

              <section className="editorial-section">
                <div className="editorial-section-heading">
                  <div>
                    <span className="section-index">02</span>
                    <h2>Variables</h2>
                  </div>
                  <span className="section-count">
                    {prompt.variables.length} defined
                  </span>
                </div>
                {prompt.variables.length > 0 ? (
                  <div className="variable-ledger">
                    <div className="variable-ledger-head">
                      <span>Variable</span>
                      <span>Token</span>
                      <span>Required</span>
                    </div>
                    {prompt.variables.map((variable) => (
                      <div className="variable-ledger-row" key={variable}>
                        <strong>{variable.replaceAll("_", " ")}</strong>
                        <code>{`{{${variable}}}`}</code>
                        <span>
                          <LucideCheck className="h-3.5 w-3.5" />
                          Yes
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="editorial-empty">
                    This prompt has no variables.
                  </div>
                )}
              </section>

              <section className="editorial-section">
                <div className="editorial-section-heading">
                  <div>
                    <span className="section-index">03</span>
                    <h2>Usage</h2>
                  </div>
                </div>
                <div className="prompt-usage-strip">
                  <div>
                    <span>Triggers</span>
                    <strong>{formatCompactNumber(prompt.triggerCount)}</strong>
                  </div>
                  <div>
                    <span>Versions</span>
                    <strong>{versions.length}</strong>
                  </div>
                  <div>
                    <span>Variables</span>
                    <strong>{prompt.variables.length}</strong>
                  </div>
                  <div>
                    <span>Updated</span>
                    <strong>{formatDate(new Date(prompt.updatedAt))}</strong>
                  </div>
                </div>
              </section>
            </div>

            <aside className="prompt-overview-rail">
              <section>
                <span className="rail-label">Current version</span>
                <strong className="rail-version">
                  {currentVersion?.name || "Base prompt"}
                </strong>
                <dl className="rail-metadata">
                  <div>
                    <dt>Status</dt>
                    <dd>{prompt.isActive ? "Active" : "Inactive"}</dd>
                  </div>
                  <div>
                    <dt>Created</dt>
                    <dd>{formatDate(new Date(prompt.createdAt))}</dd>
                  </div>
                  <div>
                    <dt>Updated</dt>
                    <dd>{formatDate(new Date(prompt.updatedAt))}</dd>
                  </div>
                  <div>
                    <dt>ID</dt>
                    <dd className="rail-id">{prompt.id}</dd>
                  </div>
                </dl>
              </section>

              <section>
                <div className="rail-section-heading">
                  <h2>Version history</h2>
                  <button onClick={() => setActiveTab("versions")}>
                    View all <LucideArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="version-rail">
                  {versions.slice(0, 4).map((version) => (
                    <button
                      key={version.id}
                      data-current={version.id === currentVersion?.id}
                      onClick={() => setActiveTab("versions")}
                    >
                      <span>{version.name}</span>
                      <small>{formatDate(new Date(version.createdAt))}</small>
                    </button>
                  ))}
                  {versions.length === 0 ? (
                    <p>No versions created yet.</p>
                  ) : null}
                </div>
              </section>

              <section>
                <span className="rail-label">Integration</span>
                <h2>Run via API</h2>
                <p>Fetch this prompt from your application at any time.</p>
                <Button
                  variant="outline"
                  className="rail-copy-button"
                  onClick={handleCopyUrl}
                >
                  <LucideCode2 className="h-4 w-4" />
                  Copy endpoint
                </Button>
                <code className="rail-endpoint">{endpoint}</code>
              </section>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="versions">
          <section className="detail-tab-section">
            <div className="detail-tab-heading">
              <div>
                <h2>Version history</h2>
                <p>Compare, promote, and maintain prompt variants.</p>
              </div>
              <Link href={`/prompts/${prompt.id}/versions/new`}>
                <Button>
                  <LucidePlus className="h-4 w-4" />
                  New version
                </Button>
              </Link>
            </div>

            {versions.length > 0 ? (
              <div className="version-ledger">
                {versions.map((version, index) => (
                  <article
                    className="version-ledger-row"
                    data-current={prompt.currentVersionId === version.id}
                    key={version.id}
                  >
                    <span className="version-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="version-ledger-copy">
                      <div>
                        <h3>{version.name}</h3>
                        {prompt.currentVersionId === version.id ? (
                          <span>Current</span>
                        ) : null}
                      </div>
                      <p>
                        <HighlightedPromptText content={version.content} />
                      </p>
                    </div>
                    <dl>
                      <div>
                        <dt>Triggers</dt>
                        <dd>{formatCompactNumber(version.triggerCount)}</dd>
                      </div>
                      <div>
                        <dt>Created</dt>
                        <dd>{formatDate(new Date(version.createdAt))}</dd>
                      </div>
                    </dl>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={prompt.currentVersionId === version.id}
                      onClick={() => setCurrentVersion(version)}
                    >
                      {prompt.currentVersionId === version.id
                        ? "Current version"
                        : "Set current"}
                    </Button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="editorial-empty">
                <p>No versions created yet.</p>
                <Link href={`/prompts/${prompt.id}/versions/new`}>
                  Create the first version
                </Link>
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="integration">
          <section className="detail-tab-section">
            <div className="detail-tab-heading">
              <div>
                <h2>API integration</h2>
                <p>Fetch the current prompt and variables from your application.</p>
              </div>
              <Button variant="outline" onClick={handleCopyUrl}>
                <LucideCopy className="h-4 w-4" />
                Copy endpoint
              </Button>
            </div>

            <div className="integration-endpoint">
              <span>GET</span>
              <code>{endpoint}</code>
            </div>

            <div className="integration-code-heading">
              <div className="integration-language-tabs">
                {(["javascript", "python", "curl"] as const).map(
                  (language) => (
                    <button
                      data-active={selectedLanguage === language}
                      key={language}
                      onClick={() => setSelectedLanguage(language)}
                    >
                      {language === "curl"
                        ? "cURL"
                        : language[0].toUpperCase() + language.slice(1)}
                    </button>
                  )
                )}
              </div>
              <button className="text-action" onClick={handleCopyCode}>
                <LucideCopy className="h-4 w-4" />
                Copy code
              </button>
            </div>
            <pre className="integration-code">
              {generateCodeSnippet(prompt.id, selectedLanguage)}
            </pre>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
