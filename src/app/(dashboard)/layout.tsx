"use client";

import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { LucideHelpCircle } from "lucide-react";
import { OnboardingModal } from "@/components/OnboardingModal";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { NavItems } from "@/components/NavItems";
import { UserMenu } from "@/components/auth/user-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Function to trigger the onboarding modal
  const showOnboarding = () => {
    if (typeof window !== 'undefined') {
      // Reset the onboarding flag
      localStorage.removeItem('hasSeenOnboarding');
      // Reload the page to trigger the onboarding flow
      window.location.reload();
    }
  };

  return (
    <div className="promptly-shell">
      <header className="promptly-mobile-header">
        <Link href="/" className="promptly-brand" aria-label="Promptly dashboard">
          <span>Promptly</span>
        </Link>
        <UserMenu />
      </header>
      <aside className="promptly-sidebar">
        <Link href="/" className="promptly-brand" aria-label="Promptly dashboard">
          <span>Promptly</span>
        </Link>
        <NavItems />
        <div className="promptly-sidebar-footer">
          <div className="promptly-sidebar-actions">
          <Button
            variant="ghost"
            onClick={showOnboarding}
            title="Show onboarding guide"
            className="promptly-help"
          >
            <LucideHelpCircle className="h-4 w-4" />
            Product guide
          </Button>
          <UserMenu />
          </div>
        </div>
      </aside>
      <main className="promptly-main">
        <div className="promptly-content">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
      <Toaster />
      <OnboardingModal />
    </div>
  );
}
