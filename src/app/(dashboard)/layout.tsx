"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { LucideCode, LucideFlaskConical, LucideHome, LucideMessageSquare, LucideHelpCircle } from "lucide-react";
import { OnboardingModal } from "@/components/OnboardingModal";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LucideHome,
    },
    {
      name: "Prompts",
      href: "/prompts",
      icon: LucideMessageSquare,
    },
    {
      name: "A/B Testing",
      href: "/a-b-testing",
      icon: LucideFlaskConical,
    },
    {
      name: "Integration",
      href: "/integration",
      icon: LucideCode,
    },
  ];

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
          <span className="text-xl font-bold">Promptly</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground/80",
                pathname === item.href
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={showOnboarding}
          title="Show onboarding guide"
          className="ml-auto md:ml-0"
        >
          <LucideHelpCircle className="h-5 w-5" />
        </Button>
      </header>
      <main className="flex-1 p-4 md:p-6">
        {children}
      </main>
      <Toaster />
      <OnboardingModal />
    </div>
  );
} 