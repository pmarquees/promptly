"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { LucideCode, LucideFlaskConical, LucideHome, LucideMessageSquare, LucideHelpCircle, LucideSearch, LucideBell } from "lucide-react";
import { OnboardingModal } from "@/components/OnboardingModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Home",
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
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white">
              <LucideHome className="h-4 w-4" />
            </div>
            <span className="ml-2 text-xl font-bold">TWISTY</span>
          </motion.div>
        </Link>
        <nav className="hidden flex-1 items-center gap-6 md:flex">
          {navItems.map((item) => (
            <motion.div
              key={item.href}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground/80",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                {item.name}
              </Link>
            </motion.div>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <LucideSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Enter your search request..."
              className="w-[300px] pl-8 rounded-lg border-gray-200"
            />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={showOnboarding}
            title="Show onboarding guide"
          >
            <LucideHelpCircle className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            title="Notifications"
          >
            <LucideBell className="h-5 w-5" />
          </Button>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="h-8 w-8 rounded-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://i.pravatar.cc/32')" }}
          />
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
      <Toaster />
      <OnboardingModal />
    </div>
  );
} 