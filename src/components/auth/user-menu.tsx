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
import { motion } from "framer-motion";

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

  const menuItemVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: { opacity: 1, y: 0 },
    hover: { color: "var(--orange)", x: 2 }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="sm" className="relative hover:text-orange text-white">
            {session?.user?.name || session?.user?.email}
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
        >
          <motion.div variants={menuItemVariants} whileHover="hover">
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
          </motion.div>
          
          <motion.div variants={menuItemVariants} whileHover="hover">
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
          </motion.div>
          
          <DropdownMenuSeparator />
          
          <motion.div variants={menuItemVariants} whileHover="hover">
            <DropdownMenuItem
              onClick={async () => {
                await signOut({ redirect: false });
                toast.success("Signed out successfully");
                router.push("/");
              }}
            >
              Sign Out
            </DropdownMenuItem>
          </motion.div>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 