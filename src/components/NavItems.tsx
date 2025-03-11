"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideCode, LucideFlaskConical, LucideHome, LucideMessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export function NavItems() {
  const pathname = usePathname();
  const { status } = useSession();
  
  // Only show nav items for authenticated users
  if (status !== "authenticated") {
    return null;
  }

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

  return (
    <nav className="hidden md:flex items-center gap-6">
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
  );
} 