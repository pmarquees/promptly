"use client";

import { useEffect, useState } from "react";
import { IncomeTracker } from "@/components/IncomeTracker";
import { ProjectList } from "@/components/ProjectList";
import { ConnectSection } from "@/components/ConnectSection";
import { PremiumFeatures } from "@/components/PremiumFeatures";
import { ProposalProgress } from "@/components/ProposalProgress";
import { motion } from "framer-motion";

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
  versions: Array<any>;
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

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <IncomeTracker />
        </div>
        <div className="md:col-span-1 space-y-6">
          <ConnectSection />
          <PremiumFeatures />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ProjectList />
        </div>
        <div className="md:col-span-1">
          <ProposalProgress />
        </div>
      </div>
    </div>
  );
}
