"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LucideKey, LucidePlus, LucideTrash2, LucideCopy, LucideEye, LucideEyeOff } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<{ [keyId: string]: boolean }>({});

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/api-keys");
      if (response.ok) {
        const keys = await response.json();
        setApiKeys(keys);
      } else {
        toast.error("Failed to fetch API keys");
      }
    } catch (error) {
      toast.error("Error fetching API keys");
      console.error("Error fetching API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });

      if (response.ok) {
        const newKey = await response.json();
        setCreatedKey(newKey.key);
        setNewKeyName("");
        await fetchApiKeys();
        toast.success("API key created successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create API key");
      }
    } catch (error) {
      toast.error("Error creating API key");
      console.error("Error creating API key:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteApiKey = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the API key "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchApiKeys();
        toast.success("API key deleted successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete API key");
      }
    } catch (error) {
      toast.error("Error deleting API key");
      console.error("Error deleting API key:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard");
  };

  const toggleShowKey = (keyId: string) => {
    setShowKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const closeCreateDialog = () => {
    setShowCreateDialog(false);
    setCreatedKey(null);
    setNewKeyName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and API keys
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LucideKey className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Generate API keys to authenticate requests to the Promptly API
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <LucidePlus className="mr-2 h-4 w-4" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    {createdKey ? (
                      "Your API key has been created. Copy it now - you won't be able to see it again."
                    ) : (
                      "Enter a name for your new API key. This will help you identify it later."
                    )}
                  </DialogDescription>
                </DialogHeader>
                
                {createdKey ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="created-key">Your new API key</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="created-key"
                          value={createdKey}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(createdKey)}
                        >
                          <LucideCopy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={closeCreateDialog}>Done</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="key-name">API Key Name</Label>
                      <Input
                        id="key-name"
                        placeholder="e.g., Production API Key"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && createApiKey()}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={closeCreateDialog}>
                        Cancel
                      </Button>
                      <Button onClick={createApiKey} disabled={isCreating}>
                        {isCreating ? "Creating..." : "Create API Key"}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div>Loading API keys...</div>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <LucideKey className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No API keys</h3>
              <p className="text-muted-foreground mb-4">
                Create your first API key to start using the Promptly API
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <LucidePlus className="mr-2 h-4 w-4" />
                Create API Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{apiKey.name}</h4>
                      <Badge variant="secondary">
                        {apiKey.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Created {formatDate(new Date(apiKey.createdAt))}</span>
                      {apiKey.lastUsedAt && (
                        <>
                          <span>•</span>
                          <span>Last used {formatDate(new Date(apiKey.lastUsedAt))}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        value={showKey[apiKey.id] ? apiKey.key : apiKey.key}
                        readOnly
                        className="font-mono text-sm flex-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleShowKey(apiKey.id)}
                      >
                        {showKey[apiKey.id] ? (
                          <LucideEyeOff className="h-4 w-4" />
                        ) : (
                          <LucideEye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <LucideCopy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteApiKey(apiKey.id, apiKey.name)}
                    className="ml-4 text-destructive hover:text-destructive"
                  >
                    <LucideTrash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
          <CardDescription>
            Learn how to use your API keys to authenticate requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Authentication</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Include your API key in the Authorization header of your requests:
              </p>
              <div className="bg-muted p-3 rounded font-mono text-sm">
                Authorization: Bearer your-api-key
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Example Request</h4>
              <div className="bg-muted p-3 rounded font-mono text-sm whitespace-pre">
{`curl -X GET "${window.location.origin}/api/prompts" \\
  -H "Authorization: Bearer your-api-key"`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}