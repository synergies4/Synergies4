import { useState, useEffect } from 'react';

interface OnboardingData {
  id?: number;
  full_name: string;
  job_title: string;
  company: string;
  industry: string;
  years_experience: number;
  team_size: number;
  primary_role: string;
  secondary_roles: string[];
  management_level: string;
  biggest_challenges: string[];
  primary_goals: string[];
  pain_points: string[];
  success_metrics: string[];
  company_size: string;
  work_environment: string;
  team_structure: string;
  technology_stack: string[];
  learning_style: string;
  preferred_content_types: string[];
  time_availability: string;
  coaching_style: string;
  communication_tone: string;
  feedback_frequency: string;
  focus_areas: string[];
  skill_levels: Record<string, string>;
  completed_steps: string[];
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export function usePersonalization() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadOnboardingData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/onboarding');
      if (response.ok) {
        const result = await response.json();
        setOnboardingData(result.onboarding);
        setHasCompletedOnboarding(result.hasCompletedOnboarding);
        
        // Show onboarding modal if user hasn't completed it and this is their first AI interaction
        if (!result.hasCompletedOnboarding && !localStorage.getItem('onboarding-dismissed')) {
          setShowOnboardingModal(true);
        }
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOnboardingData();
  }, []);

  const completeOnboarding = () => {
    setShowOnboardingModal(false);
    setHasCompletedOnboarding(true);
    loadOnboardingData(); // Reload data
  };

  const dismissOnboarding = () => {
    setShowOnboardingModal(false);
    localStorage.setItem('onboarding-dismissed', 'true');
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding-dismissed');
    setShowOnboardingModal(true);
  };

  // Generate AI context based on user's onboarding data
  const getAIContext = () => {
    if (!onboardingData || !hasCompletedOnboarding) {
      return '';
    }

    return `
User Profile Context:
- Name: ${onboardingData.full_name}
- Role: ${onboardingData.job_title} at ${onboardingData.company}
- Primary Role: ${onboardingData.primary_role}
- Management Level: ${onboardingData.management_level}
- Experience: ${onboardingData.years_experience} years
- Team Size: ${onboardingData.team_size}
- Company Size: ${onboardingData.company_size}
- Work Environment: ${onboardingData.work_environment}
- Team Structure: ${onboardingData.team_structure}

Current Challenges: ${onboardingData.biggest_challenges?.join(', ') || 'None specified'}
Primary Goals: ${onboardingData.primary_goals?.join(', ') || 'None specified'}
Focus Areas: ${onboardingData.focus_areas?.join(', ') || 'None specified'}

Communication Preferences:
- Coaching Style: ${onboardingData.coaching_style || 'balanced'}
- Communication Tone: ${onboardingData.communication_tone || 'professional'}
- Learning Style: ${onboardingData.learning_style || 'mixed'}

Please tailor your responses to this user's specific role, challenges, and preferences. Provide advice that's relevant to their experience level and current situation.
`;
  };

  return {
    onboardingData,
    hasCompletedOnboarding,
    showOnboardingModal,
    loading,
    completeOnboarding,
    dismissOnboarding,
    resetOnboarding,
    getAIContext,
    refreshData: loadOnboardingData
  };
} 