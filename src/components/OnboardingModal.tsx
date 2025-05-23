"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/hooks/useOnboarding";

// Define the steps for the onboarding process
const onboardingSteps = [
  {
    title: "Welcome to Promptly!",
    description: "Your AI prompt management platform for creating, testing, and optimizing prompts.",
    image: "/onboarding-welcome.svg",
  },
  {
    title: "Create and Manage Prompts",
    description: "Easily create, organize, and iterate on your AI prompts in one place.",
    image: "/onboarding-prompts.svg",
  },
  {
    title: "A/B Test Your Prompts",
    description: "Compare different versions of your prompts to find what works best.",
    image: "/onboarding-testing.svg",
  },
  {
    title: "Integrate with Your Apps",
    description: "Use our API to integrate your prompts directly into your applications.",
    image: "/onboarding-integration.svg",
  },
];

// Animation variants for different elements
const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const imageVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 20,
      delay: 0.2
    } 
  },
  exit: { 
    scale: 0.8, 
    opacity: 0,
    transition: { duration: 0.2 } 
  },
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

export function OnboardingModal() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [{ hasSeenOnboarding }, completeOnboarding] = useOnboarding();
  const [isOpen, setIsOpen] = useState(false);
  
  // Show modal if user hasn't seen onboarding
  useEffect(() => {
    if (hasSeenOnboarding === false) {
      setIsOpen(true);
    }
  }, [hasSeenOnboarding]);

  const handleClose = () => {
    completeOnboarding();
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleNext = () => {
    setDirection(1);
    nextStep();
  };
  
  const handlePrev = () => {
    setDirection(-1);
    prevStep();
  };

  // Allow manually opening the onboarding modal (for testing or if user wants to see it again)
  const openOnboarding = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  // Expose the openOnboarding function to the window for easy access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-expect-error - Adding function to global window object for testing purposes
      window.openOnboarding = openOnboarding;
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose();
      setIsOpen(open);
    }}>
      <DialogContent className="sm:max-w-md md:max-w-lg overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {onboardingSteps[currentStep].title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col items-center"
              >
                <motion.div
                  variants={imageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="mb-6 w-full max-w-[250px] h-[200px] flex items-center justify-center"
                >
                  <div className="bg-primary/10 rounded-lg w-full h-full flex items-center justify-center overflow-hidden">
                    <motion.img 
                      src={onboardingSteps[currentStep].image} 
                      alt={onboardingSteps[currentStep].title}
                      className="max-w-full max-h-full object-contain"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      onError={(e) => {
                        // Fallback if image doesn't exist
                        e.currentTarget.src = "https://placehold.co/250x200/e2e8f0/64748b?text=Promptly";
                      }}
                    />
                  </div>
                </motion.div>
                
                <DialogDescription className="text-center text-base">
                  {onboardingSteps[currentStep].description}
                </DialogDescription>
              </motion.div>
            </AnimatePresence>
            
            {/* Progress indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {onboardingSteps.map((_, index) => (
                <motion.div
                  key={index}
                  className="h-2 rounded-full bg-gray-300"
                  initial={false}
                  animate={{ 
                    width: index === currentStep ? 24 : 8,
                    backgroundColor: index === currentStep ? "var(--primary)" : "#d1d5db"
                  }}
                  transition={{ 
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                  onClick={() => {
                    setDirection(index > currentStep ? 1 : -1);
                    setCurrentStep(index);
                  }}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={currentStep === 0 ? "opacity-0 pointer-events-none" : ""}
              >
                Previous
              </Button>
            </motion.div>
            
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button onClick={handleNext}>
                {currentStep < onboardingSteps.length - 1 ? "Next" : "Get Started"}
              </Button>
            </motion.div>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
} 