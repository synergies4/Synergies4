'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { ChevronLeft, ChevronRight, User, Briefcase, Target, Settings, CheckCircle, Sparkles, Brain, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingData {
  // Personal Information
  full_name: string;
  job_title: string;
  company: string;
  industry: string;
  years_experience: number;
  team_size: number;
  
  // Role and Responsibilities
  primary_role: string;
  secondary_roles: string[];
  management_level: string;
  
  // Current Challenges and Goals
  biggest_challenges: string[];
  primary_goals: string[];
  pain_points: string[];
  success_metrics: string[];
  
  // Work Environment
  company_size: string;
  work_environment: string;
  team_structure: string;
  technology_stack: string[];
  
  // Learning Preferences
  learning_style: string;
  preferred_content_types: string[];
  time_availability: string;
  
  // AI Coach Preferences
  coaching_style: string;
  communication_tone: string;
  feedback_frequency: string;
  
  // Focus Areas
  focus_areas: string[];
  skill_levels: Record<string, string>;
  
  // Progress tracking
  completed_steps: string[];
  onboarding_completed: boolean;
}

const STEPS = [
  { id: 'personal', title: 'Personal Info', icon: User },
  { id: 'role', title: 'Your Role', icon: Briefcase },
  { id: 'goals', title: 'Goals & Challenges', icon: Target },
  { id: 'preferences', title: 'Preferences', icon: Settings },
  { id: 'complete', title: 'Complete', icon: CheckCircle }
];

const ROLES = [
  { value: 'developer', label: 'Software Developer' },
  { value: 'product_manager', label: 'Product Manager' },
  { value: 'scrum_master', label: 'Scrum Master' },
  { value: 'designer', label: 'Designer' },
  { value: 'qa_engineer', label: 'QA Engineer' },
  { value: 'tech_lead', label: 'Tech Lead' },
  { value: 'engineering_manager', label: 'Engineering Manager' },
  { value: 'cto', label: 'CTO' },
  { value: 'founder', label: 'Founder' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'other', label: 'Other' }
];

const CHALLENGES = [
  'Time management',
  'Team communication',
  'Prioritization',
  'Technical debt',
  'Stakeholder alignment',
  'Remote work challenges',
  'Meeting effectiveness',
  'Work-life balance',
  'Team motivation',
  'Process improvement',
  'Leadership skills',
  'Conflict resolution'
];

const GOALS = [
  'Improve team productivity',
  'Better leadership skills',
  'Enhanced communication',
  'Career advancement',
  'Technical skills growth',
  'Process optimization',
  'Team building',
  'Strategic thinking',
  'Innovation culture',
  'Personal effectiveness',
  'Work-life balance',
  'Industry knowledge'
];

const FOCUS_AREAS = [
  'Agile methodologies',
  'Leadership development',
  'Technical skills',
  'Communication',
  'Project management',
  'Team dynamics',
  'Process improvement',
  'Strategic planning',
  'Innovation',
  'Personal productivity',
  'Coaching skills',
  'Change management'
];

export default function OnboardingQuestionnaire({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    full_name: '',
    job_title: '',
    company: '',
    industry: '',
    years_experience: 0,
    team_size: 0,
    primary_role: '',
    secondary_roles: [],
    management_level: '',
    biggest_challenges: [],
    primary_goals: [],
    pain_points: [],
    success_metrics: [],
    company_size: '',
    work_environment: '',
    team_structure: '',
    technology_stack: [],
    learning_style: '',
    preferred_content_types: [],
    time_availability: '',
    coaching_style: '',
    communication_tone: '',
    feedback_frequency: '',
    focus_areas: [],
    skill_levels: {},
    completed_steps: [],
    onboarding_completed: false
  });
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const response = await fetch('/api/onboarding');
      if (response.ok) {
        const result = await response.json();
        if (result.onboarding) {
          setData(result.onboarding);
          // If already completed, show completion step
          if (result.onboarding.onboarding_completed) {
            setCurrentStep(STEPS.length - 1);
          }
        }
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setInitialLoad(false);
    }
  };

  const saveData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Progress saved successfully!');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast.error('Failed to save progress');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      const stepId = STEPS[currentStep].id;
      const updatedSteps = [...data.completed_steps];
      if (!updatedSteps.includes(stepId)) {
        updatedSteps.push(stepId);
      }
      
      setData(prev => ({ ...prev, completed_steps: updatedSteps }));
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    const finalData = {
      ...data,
      onboarding_completed: true,
      completed_steps: STEPS.map(step => step.id)
    };
    
    setData(finalData);
    
    try {
      setLoading(true);
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        toast.success('Onboarding completed! Your AI coach is now personalized for you.');
        onComplete?.();
      } else {
        throw new Error('Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else {
      return [...array, item];
    }
  };

  const updateData = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  if (initialLoad) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Personalize Your AI Coach</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Help us understand your role, challenges, and goals so we can provide you with the most relevant coaching and support.
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
        
        {/* Step indicators */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = data.completed_steps.includes(step.id);
            const isCurrent = index === currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center space-y-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500 text-white' : 
                  isCurrent ? 'bg-blue-500 text-white' : 
                  'bg-gray-200 text-gray-400'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-xs font-medium ${
                  isCurrent ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="shadow-lg">
        <CardContent className="p-8">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
                <p className="text-gray-600">Basic information to help us get to know you better.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={data.full_name}
                    onChange={(e) => updateData('full_name', e.target.value)}
                    placeholder="Your full name"
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={data.job_title}
                    onChange={(e) => updateData('job_title', e.target.value)}
                    placeholder="Your current job title"
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={data.company}
                    onChange={(e) => updateData('company', e.target.value)}
                    placeholder="Your company name"
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={data.industry}
                    onChange={(e) => updateData('industry', e.target.value)}
                    placeholder="e.g., Technology, Healthcare, Finance"
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="years_experience">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    value={data.years_experience}
                    onChange={(e) => updateData('years_experience', parseInt(e.target.value) || 0)}
                    placeholder="Total years of professional experience"
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="team_size">Team Size</Label>
                  <Input
                    id="team_size"
                    type="number"
                    value={data.team_size}
                    onChange={(e) => updateData('team_size', parseInt(e.target.value) || 0)}
                    placeholder="Number of people you work with directly"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Briefcase className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Role & Responsibilities</h2>
                <p className="text-gray-600">Help us understand your position and work environment.</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label>Primary Role</Label>
                  <Select value={data.primary_role} onValueChange={(value) => updateData('primary_role', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select your primary role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Management Level</Label>
                  <Select value={data.management_level} onValueChange={(value) => updateData('management_level', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select your management level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual_contributor">Individual Contributor</SelectItem>
                      <SelectItem value="team_lead">Team Lead</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="vp">VP</SelectItem>
                      <SelectItem value="c_level">C-Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Company Size</Label>
                  <Select value={data.company_size} onValueChange={(value) => updateData('company_size', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select your company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup_1_10">Startup (1-10 employees)</SelectItem>
                      <SelectItem value="small_11_50">Small (11-50 employees)</SelectItem>
                      <SelectItem value="medium_51_200">Medium (51-200 employees)</SelectItem>
                      <SelectItem value="large_201_1000">Large (201-1000 employees)</SelectItem>
                      <SelectItem value="enterprise_1000+">Enterprise (1000+ employees)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Work Environment</Label>
                  <Select value={data.work_environment} onValueChange={(value) => updateData('work_environment', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select your work environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="in_office">In Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Team Structure</Label>
                  <Select value={data.team_structure} onValueChange={(value) => updateData('team_structure', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select your team structure" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agile_scrum">Agile/Scrum</SelectItem>
                      <SelectItem value="agile_kanban">Agile/Kanban</SelectItem>
                      <SelectItem value="waterfall">Waterfall</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="no_structure">No Structure</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Goals & Challenges</h2>
                <p className="text-gray-600">What are you trying to achieve and what obstacles do you face?</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">What are your biggest challenges? (Select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {CHALLENGES.map((challenge) => (
                      <div key={challenge} className="flex items-center space-x-2">
                        <Checkbox
                          id={`challenge-${challenge}`}
                          checked={data.biggest_challenges.includes(challenge)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateData('biggest_challenges', [...data.biggest_challenges, challenge]);
                            } else {
                              updateData('biggest_challenges', data.biggest_challenges.filter(c => c !== challenge));
                            }
                          }}
                        />
                        <Label htmlFor={`challenge-${challenge}`} className="text-sm">{challenge}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">What are your primary goals? (Select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {GOALS.map((goal) => (
                      <div key={goal} className="flex items-center space-x-2">
                        <Checkbox
                          id={`goal-${goal}`}
                          checked={data.primary_goals.includes(goal)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateData('primary_goals', [...data.primary_goals, goal]);
                            } else {
                              updateData('primary_goals', data.primary_goals.filter(g => g !== goal));
                            }
                          }}
                        />
                        <Label htmlFor={`goal-${goal}`} className="text-sm">{goal}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="pain_points" className="text-base font-semibold">Specific pain points you'd like help with</Label>
                  <Textarea
                    id="pain_points"
                    value={data.pain_points.join('\n')}
                    onChange={(e) => updateData('pain_points', e.target.value.split('\n').filter(p => p.trim()))}
                    placeholder="Describe specific situations or problems you face regularly..."
                    className="mt-2 min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Settings className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Preferences</h2>
                <p className="text-gray-600">Customize how your AI coach communicates and teaches you.</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label>Learning Style</Label>
                  <Select value={data.learning_style} onValueChange={(value) => updateData('learning_style', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="How do you learn best?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual (diagrams, charts, images)</SelectItem>
                      <SelectItem value="auditory">Auditory (listening, discussions)</SelectItem>
                      <SelectItem value="kinesthetic">Kinesthetic (hands-on, practice)</SelectItem>
                      <SelectItem value="reading_writing">Reading/Writing (text, notes)</SelectItem>
                      <SelectItem value="mixed">Mixed (combination of styles)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Coaching Style</Label>
                  <Select value={data.coaching_style} onValueChange={(value) => updateData('coaching_style', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="What coaching style do you prefer?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct (straight to the point)</SelectItem>
                      <SelectItem value="supportive">Supportive (encouraging, patient)</SelectItem>
                      <SelectItem value="analytical">Analytical (data-driven, logical)</SelectItem>
                      <SelectItem value="creative">Creative (innovative, brainstorming)</SelectItem>
                      <SelectItem value="balanced">Balanced (adaptive approach)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Communication Tone</Label>
                  <Select value={data.communication_tone} onValueChange={(value) => updateData('communication_tone', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="How should I communicate with you?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal (professional, structured)</SelectItem>
                      <SelectItem value="casual">Casual (relaxed, informal)</SelectItem>
                      <SelectItem value="friendly">Friendly (warm, personal)</SelectItem>
                      <SelectItem value="professional">Professional (business-like)</SelectItem>
                      <SelectItem value="adaptive">Adaptive (match the situation)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Time Availability</Label>
                  <Select value={data.time_availability} onValueChange={(value) => updateData('time_availability', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="How much time can you dedicate?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15_min_daily">15 minutes daily</SelectItem>
                      <SelectItem value="30_min_daily">30 minutes daily</SelectItem>
                      <SelectItem value="1_hour_daily">1 hour daily</SelectItem>
                      <SelectItem value="weekends_only">Weekends only</SelectItem>
                      <SelectItem value="flexible">Flexible schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold">Focus Areas (Select areas you want to improve)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {FOCUS_AREAS.map((area) => (
                      <div key={area} className="flex items-center space-x-2">
                        <Checkbox
                          id={`focus-${area}`}
                          checked={data.focus_areas.includes(area)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateData('focus_areas', [...data.focus_areas, area]);
                            } else {
                              updateData('focus_areas', data.focus_areas.filter(f => f !== area));
                            }
                          }}
                        />
                        <Label htmlFor={`focus-${area}`} className="text-sm">{area}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">You're All Set!</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Your AI coach is now personalized based on your preferences. You can update these settings anytime in your profile.
                </p>
              </div>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">What's Next?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">Personalized Coaching</p>
                        <p className="text-sm text-blue-700">Your AI coach now understands your role, challenges, and goals</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">Tailored Content</p>
                        <p className="text-sm text-blue-700">Recommendations and learning paths suited to your needs</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">Ongoing Support</p>
                        <p className="text-sm text-blue-700">24/7 pocket coach available for daily challenges</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button 
                  onClick={completeOnboarding}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg"
                >
                  {loading ? 'Saving...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      {currentStep < STEPS.length - 1 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={saveData}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Progress'}
            </Button>
            <Button
              onClick={nextStep}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 