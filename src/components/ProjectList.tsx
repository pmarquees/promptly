"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { LucideChevronDown, LucideCode, LucideCopyright, LucidePaintbrush } from "lucide-react";

interface Project {
  id: string;
  title: string;
  rate: string;
  isPaid: boolean;
  tags: string[];
  description: string;
  location: string;
  timeAgo: string;
  icon: "web-dev" | "copyright" | "web-design";
}

const projects: Project[] = [
  {
    id: "1",
    title: "Web Development Project",
    rate: "$10/hour",
    isPaid: true,
    tags: ["Remote", "Part-time"],
    description: "This project involves implementing both frontend and backend functionalities, as well as integrating with third-party APIs.",
    location: "Germany",
    timeAgo: "2h ago",
    icon: "web-dev"
  },
  {
    id: "2",
    title: "Copyright Project",
    rate: "$10/hour",
    isPaid: false,
    tags: ["Remote", "Full-time"],
    description: "Legal work related to copyright protection and intellectual property management.",
    location: "United States",
    timeAgo: "5h ago",
    icon: "copyright"
  },
  {
    id: "3",
    title: "Web Design Project",
    rate: "$10/hour",
    isPaid: true,
    tags: ["On-site", "Part-time"],
    description: "Creating modern and responsive web designs with a focus on user experience.",
    location: "Canada",
    timeAgo: "1d ago",
    icon: "web-design"
  }
];

const getIconComponent = (iconType: string) => {
  switch (iconType) {
    case "web-dev":
      return <LucideCode className="h-5 w-5 text-white" />;
    case "copyright":
      return <LucideCopyright className="h-5 w-5 text-white" />;
    case "web-design":
      return <LucidePaintbrush className="h-5 w-5 text-white" />;
    default:
      return <LucideCode className="h-5 w-5 text-white" />;
  }
};

const getIconBgColor = (iconType: string) => {
  switch (iconType) {
    case "web-dev":
      return "bg-red-500";
    case "copyright":
      return "bg-blue-800";
    case "web-design":
      return "bg-blue-400";
    default:
      return "bg-gray-500";
  }
};

export function ProjectList() {
  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Your Recent Projects</CardTitle>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          See all Project
        </motion.button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4 pb-4"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${getIconBgColor(project.icon)}`}>
                {getIconComponent(project.icon)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-gray-500">{project.rate}</p>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={project.isPaid ? "default" : "outline"} className={project.isPaid ? "bg-gray-800 hover:bg-gray-700" : ""}>
                      {project.isPaid ? "Paid" : "Not Paid"}
                    </Badge>
                    <motion.button 
                      whileHover={{ y: 2 }}
                      whileTap={{ y: 0 }}
                      className="ml-2"
                    >
                      <LucideChevronDown className="h-5 w-5 text-gray-400" />
                    </motion.button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <span>{project.location}</span>
                  <span className="mx-2">•</span>
                  <span>{project.timeAgo}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 