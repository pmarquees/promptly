"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ProgressItem {
  label: string;
  value: number;
  color: string;
}

const progressItems: ProgressItem[] = [
  {
    label: "Proposals sent",
    value: 64,
    color: "bg-blue-200"
  },
  {
    label: "Interviews",
    value: 12,
    color: "bg-orange-500"
  },
  {
    label: "Hires",
    value: 10,
    color: "bg-gray-800"
  }
];

export function ProposalProgress() {
  const maxValue = Math.max(...progressItems.map(item => item.value));
  
  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Proposal Progress</CardTitle>
        <div className="flex items-center gap-2 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          <span>April 11, 2024</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {progressItems.map((item, index) => (
            <div key={index} className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-2xl font-bold"
              >
                {item.value}
              </motion.div>
              <div className="text-sm text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
        
        <div className="relative h-20">
          <div className="absolute inset-0 flex items-end">
            {progressItems.map((item, index) => (
              <div key={index} className="flex-1 px-1">
                <div className="flex flex-col items-center">
                  {Array.from({ length: item.value }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      transition={{ delay: 0.1 + (i * 0.01) }}
                      className={`w-1 h-1 mb-0.5 ${item.color} rounded-full`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 