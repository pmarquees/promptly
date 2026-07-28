"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function UserMenu() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <Button variant="ghost" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="hover:text-orange text-white">
          <Link href="/auth/login">Sign In</Link>
        </Button>
        <Button size="sm" asChild className="bg-orange hover:bg-orange-light border-orange text-white">
          <Link href="/auth/register">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative w-full justify-start">
          {session?.user?.name || session?.user?.email}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut({ redirect: false });
            toast.success("Signed out successfully");
            router.push("/");
          }}
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
