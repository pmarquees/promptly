"use client";

import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { LucideHelpCircle } from "lucide-react";
import { OnboardingModal } from "@/components/OnboardingModal";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { NavItems } from "@/components/NavItems";
import { UserMenu } from "@/components/auth/user-menu";
import { motion } from "framer-motion";

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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <motion.span 
            className="text-xl font-bold text-orange"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Promptly
          </motion.span>
        </Link>
        <NavItems />
        <div className="ml-auto flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={showOnboarding}
            title="Show onboarding guide"
            className="hover-orange"
          >
            <LucideHelpCircle className="h-5 w-5" />
          </Button>
          <UserMenu />
        </div>
      </header>
      <main className="flex-1 p-10">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Toaster />
      <OnboardingModal />
    </div>
  );
} 