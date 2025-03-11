"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LucideChevronRight } from "lucide-react";

export function PremiumFeatures() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl bg-gradient-to-br from-blue-900 to-indigo-800 p-6 text-white shadow-md relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-2">Unlock Premium Features</h3>
        <p className="text-blue-100 text-sm mb-6">
          Get access to exclusive benefits and expand your freelancing opportunities
        </p>
        
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button className="w-full bg-white text-blue-900 hover:bg-blue-50 flex items-center justify-between">
            <span>Upgrade now</span>
            <LucideChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
} 