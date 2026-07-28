"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideCode, LucideFlaskConical, LucideHome, LucideMessageSquare, LucideSettings } from "lucide-react";
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
    {
      name: "Settings",
      href: "/settings",
      icon: LucideSettings,
    },
  ];

  return (
    <nav className="promptly-nav" aria-label="Primary navigation">
      {navItems.map((navItem) => (
        <Link
          key={navItem.href}
          href={navItem.href}
          className="promptly-nav-link"
          data-active={pathname === navItem.href || (navItem.href !== "/" && pathname.startsWith(navItem.href))}
          aria-current={pathname === navItem.href ? "page" : undefined}
        >
          <navItem.icon className="h-[17px] w-[17px]" strokeWidth={1.5} />
          {navItem.name}
        </Link>
      ))}
    </nav>
  );
}
