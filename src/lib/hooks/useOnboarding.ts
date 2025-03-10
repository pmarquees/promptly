import { useState, useEffect } from 'react';

export type OnboardingStatus = {
  hasSeenOnboarding: boolean;
  isFirstVisit: boolean;
};

export function useOnboarding(): [OnboardingStatus, () => void] {
  const [status, setStatus] = useState<OnboardingStatus>({
    hasSeenOnboarding: true, // Default to true to prevent flash of modal
    isFirstVisit: false,
  });

  useEffect(() => {
    // Check if running in browser environment
    if (typeof window !== 'undefined') {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true';
      const isFirstVisit = !localStorage.getItem('hasVisitedBefore');
      
      // Mark that the user has visited the site
      if (isFirstVisit) {
        localStorage.setItem('hasVisitedBefore', 'true');
      }
      
      setStatus({
        hasSeenOnboarding,
        isFirstVisit,
      });
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setStatus(prev => ({
      ...prev,
      hasSeenOnboarding: true,
    }));
  };

  return [status, completeOnboarding];
} 