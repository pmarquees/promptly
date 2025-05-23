"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideCode, LucideFlaskConical, LucideHome, LucideMessageSquare, LucideSettings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

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
    {
      name: "Settings",
      href: "/settings",
      icon: LucideSettings,
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariant = {
    hidden: { opacity: 0, y: -10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.nav 
      className="hidden md:flex items-center gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {navItems.map((navItem) => (
        <motion.div key={navItem.href} variants={itemVariant}>
          <Link
            href={navItem.href}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-orange",
              pathname === navItem.href
                ? "text-orange"
                : "text-white/70 hover:text-white"
            )}
          >
            <navItem.icon className="h-4 w-4" />
            {navItem.name}
          </Link>
        </motion.div>
      ))}
    </motion.nav>
  );
} 