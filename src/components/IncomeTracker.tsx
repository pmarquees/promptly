"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DayPoint {
  day: string;
  value: number;
}

const weekData: DayPoint[] = [
  { day: "S", value: 1200 },
  { day: "M", value: 1800 },
  { day: "T", value: 2567 },
  { day: "W", value: 1900 },
  { day: "T", value: 2200 },
  { day: "F", value: 1700 },
  { day: "S", value: 1500 },
];

export function IncomeTracker() {
  const maxValue = Math.max(...weekData.map(d => d.value));
  
  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <div className="rounded-md bg-gray-100 p-2">
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
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          </div>
          <CardTitle className="text-xl font-bold">Income Tracker</CardTitle>
        </div>
        <Select defaultValue="week">
          <SelectTrigger className="w-[100px] border-gray-200">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          Track changes in income over time and access detailed data on each project and payments received
        </p>
        
        <div className="mt-6 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                $2,567
              </motion.div>
            </div>
            <div className="text-2xl font-bold text-green-600">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                +20%
              </motion.div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            This week's income is higher than last week's
          </p>
          
          <div className="relative h-40 mt-4">
            <div className="absolute inset-0 flex items-end justify-between">
              {weekData.map((point, index) => (
                <div key={point.day} className="flex flex-col items-center">
                  <motion.div 
                    className="relative"
                    initial={{ height: 0 }}
                    animate={{ height: `${(point.value / maxValue) * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <motion.div 
                      className="absolute -top-2 w-2 h-2 rounded-full bg-blue-400"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    />
                    <div className="w-0.5 bg-blue-200 h-full" />
                  </motion.div>
                  <div className={`mt-2 h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${point.day === 'T' && point.value === 2567 ? 'bg-blue-900 text-white' : 'bg-gray-200'}`}>
                    {point.day}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 