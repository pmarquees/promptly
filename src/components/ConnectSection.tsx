"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LucidePlus } from "lucide-react";

interface Connection {
  id: string;
  name: string;
  role: string;
  level: "Senior" | "Middle" | "Junior";
  avatar: string;
}

const connections: Connection[] = [
  {
    id: "1",
    name: "Randy Gouse",
    role: "Cybersecurity specialist",
    level: "Senior",
    avatar: "https://i.pravatar.cc/100?img=1"
  },
  {
    id: "2",
    name: "Giana Schleifer",
    role: "UX/UI Designer",
    level: "Middle",
    avatar: "https://i.pravatar.cc/100?img=5"
  }
];

const getLevelColor = (level: string) => {
  switch (level) {
    case "Senior":
      return "bg-orange-500 hover:bg-orange-600";
    case "Middle":
      return "bg-blue-500 hover:bg-blue-600";
    case "Junior":
      return "bg-green-500 hover:bg-green-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

export function ConnectSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Let's Connect</h2>
        <Button variant="ghost" className="text-sm text-gray-600">
          See all
        </Button>
      </div>
      
      <div className="space-y-4">
        {connections.map((connection, index) => (
          <motion.div
            key={connection.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 bg-white rounded-full p-2 shadow-sm"
          >
            <motion.img
              whileHover={{ scale: 1.1 }}
              src={connection.avatar}
              alt={connection.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center">
                <p className="font-medium">{connection.name}</p>
                <Badge className={`ml-2 text-xs ${getLevelColor(connection.level)}`}>
                  {connection.level}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{connection.role}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200"
            >
              <LucidePlus className="h-4 w-4" />
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 