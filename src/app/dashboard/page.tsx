'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Target, 
  TrendingUp, 
  User, 
  Video, 
  BarChart3, 
  FileText, 
  CreditCard, 
  Plus, 
  Calendar, 
  Users, 
  ArrowRight,
  Eye,
  Award,
  Settings,
  Edit3,
  Save,
  Trophy,
  Zap,
  Sparkles,
  Activity,
  MessageSquare,
  Check
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/shared/PageLayout';
import { UserAvatar } from '@/components/UserAvatar';
import { useRouter, useSearchParams } from 'next/navigation';

interface Enrollment {
  id: string;
  status: string;
  enrolled_at: string;
  progress_percentage: number;
  completed_at?: string;
  certificate_issued: boolean;
  course: {
    id: string;
    title: string;
    description: string;
    image?: string;
    category: string;
    level: string;
    duration: number;
  };
  lessonsCompleted?: number;
  totalLessons?: number;
  timeSpent?: number;
}

interface QuizAttempt {
  id: string;
  score: number;
  total_points: number;
  percentage: number;
  completed_at: string;
  course: {
    title: string;
  };
}

// Helper function to format relative time
const formatRelativeTime = (date: string | Date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} days ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} months ago`;
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} years ago`;
};

function DashboardContent() {
  const { user, userProfile, loading: authLoading, isLoggingOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [activeBots, setActiveBots] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [contentUsage, setContentUsage] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [userOnboarding, setUserOnboarding] = useState<any>(null);
  const [profileForm, setProfileForm] = useState<any>({
    full_name: '',
    job_title: '',
    company: '',
    primary_role: '',
    management_level: '',
    years_experience: '',
    team_size: '',
    company_size: '',
    work_environment: '',
    team_structure: '',
    biggest_challenges: [],
    primary_goals: [],
    focus_areas: [],
    coaching_style: 'balanced',
    communication_tone: 'professional',
    learning_style: 'mixed'
  });

  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    averageScore: 0,
    totalMeetings: 0,
    activeBots: 0,
    completedMilestones: 0,
    totalGoals: 0
  });

  // Calculate completion percentage and items
  const completionItems = [
    { label: 'Profile Information', completed: !!userOnboarding?.full_name },
    { label: 'Career Goals', completed: userOnboarding?.primary_goals?.length > 0 },
    { label: 'Skills Assessment', completed: !!userOnboarding?.focus_areas?.length },
    { label: 'Learning Preferences', completed: !!userOnboarding?.learning_style },
    { label: 'First Course Enrollment', completed: enrollments.length > 0 }
  ];

  const completionPercentage = Math.round((completionItems.filter(item => item.completed).length / completionItems.length) * 100);

  useEffect(() => {
    if (user && !authLoading) {
      fetchDashboardData();
      
      // Check for subscription success
      const subscriptionSuccess = searchParams.get('subscription');
      if (subscriptionSuccess === 'success') {
        // Refresh subscription data after successful payment
        setTimeout(() => refreshSubscriptionData(0, true), 2000);
      }
    }
  }, [user, authLoading, searchParams]);

  const refreshSubscriptionData = async (retryCount = 0, useAPI = false) => {
    if (retryCount >= 3) {
      console.log('Max retries reached for subscription data refresh');
      return;
    }

    setRefreshing(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      if (useAPI) {
        // Try to sync with Stripe first
        try {
          const response = await fetch('/api/stripe/sync-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          
          if (response.ok) {
            console.log('Stripe sync completed successfully');
            // Wait a moment for sync to complete
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.warn('Stripe sync failed, continuing with database query:', error);
        }
      }

      // Fetch subscription data
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Fetch usage data
      const { data: settings } = await supabase
        .from('subscription_settings')
        .select('*')
        .eq('plan_type', subscription?.plan_id || 'free')
        .single();

      const { count: presentationsCount } = await supabase
        .from('presentations')
        .select('id', { count: 'exact' })
        .eq('user_id', session.user.id)
        .eq('is_archived', false);

      const { count: conversationsCount } = await supabase
        .from('ai_conversations')
        .select('id', { count: 'exact' })
        .eq('user_id', session.user.id)
        .eq('is_archived', false);

      setSubscriptionData(subscription);
      setContentUsage({
        settings,
        currentPresentations: presentationsCount || 0,
        currentConversations: conversationsCount || 0
      });

      console.log('Subscription data refreshed:', subscription);
      console.log('Content usage:', { settings, presentationsCount, conversationsCount });
    } catch (error) {
      console.error('Error refreshing subscription data:', error);
      if (retryCount < 3) {
        // Retry in case webhook is still processing
        setTimeout(() => refreshSubscriptionData(retryCount + 1, useAPI), 3000);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      // Fetch enrollments
      const { data: enrollmentsData } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', session.user.id)
        .order('enrolled_at', { ascending: false });

      // Fetch quiz attempts
      const { data: quizData } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          course:courses(title)
        `)
        .eq('user_id', session.user.id)
        .order('completed_at', { ascending: false });

      // Fetch meetings
      const { data: meetingsData } = await supabase
        .from('meeting_recordings')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      // Fetch active recording bots
      const { data: botsData } = await supabase
        .from('recording_bots')
        .select('*')
        .eq('user_id', session.user.id)
        .in('status', ['recording', 'joining']);

      // Fetch goals
      const { data: goalsData } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true);

      // Fetch recent activities
      const { data: activitiesData } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setEnrollments(enrollmentsData || []);
      setQuizAttempts(quizData || []);
      setMeetings(meetingsData || []);
      setActiveBots(botsData || []);
      setGoals(goalsData || []);
      setRecentActivities(activitiesData || []);

      // Calculate stats
      const completedCourses = enrollmentsData?.filter(e => e.progress_percentage === 100).length || 0;
      const totalHours = enrollmentsData?.reduce((acc, e) => acc + (e.course?.duration || 0), 0) || 0;
      const avgScore = quizData?.length ? 
        Math.round(quizData.reduce((acc, q) => acc + q.percentage, 0) / quizData.length) : 0;

      setStats({
        totalCourses: enrollmentsData?.length || 0,
        completedCourses,
        totalHours: Math.round(totalHours / 60), // Convert to hours
        averageScore: avgScore,
        totalMeetings: meetingsData?.length || 0,
        activeBots: botsData?.length || 0,
        completedMilestones: completedCourses,
        totalGoals: goalsData?.length || 0
      });

      // Refresh subscription data
      await refreshSubscriptionData();

      // Fetch user onboarding/profile data
      try {
        const { data: onboarding } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (onboarding) {
          setUserOnboarding(onboarding);
          setProfileForm({
            full_name: onboarding.full_name || '',
            job_title: onboarding.job_title || '',
            company: onboarding.company || '',
            primary_role: onboarding.primary_role || '',
            management_level: onboarding.management_level || '',
            years_experience: onboarding.years_experience || '',
            team_size: onboarding.team_size || '',
            company_size: onboarding.company_size || '',
            work_environment: onboarding.work_environment || '',
            team_structure: onboarding.team_structure || '',
            biggest_challenges: onboarding.biggest_challenges || [],
            primary_goals: onboarding.primary_goals || [],
            focus_areas: onboarding.focus_areas || [],
            coaching_style: onboarding.coaching_style || 'balanced',
            communication_tone: onboarding.communication_tone || 'professional',
            learning_style: onboarding.learning_style || 'mixed'
          });
        }
      } catch (error) {
        console.error('Error fetching user onboarding data:', error);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCourseSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const saveProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: session.user.id,
          ...profileForm,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      setUserOnboarding(profileForm);
      setEditingProfile(false);
      // Show success message
      const toast = (await import('sonner')).toast;
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      const toast = (await import('sonner')).toast;
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const handleSubscriptionUpgrade = async (planId: string) => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const toast = (await import('sonner')).toast;
        toast.error('Please log in to upgrade your subscription.');
        return;
      }

      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/dashboard?subscription=success`,
          cancelUrl: `${window.location.origin}/dashboard`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        const toast = (await import('sonner')).toast;
        toast.error(data.message || 'Failed to create subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      const toast = (await import('sonner')).toast;
      toast.error('Failed to create subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get badge styles based on difficulty level
  const getLevelBadgeStyle = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (authLoading || loading || isLoggingOut) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {isLoggingOut ? 'Logging out...' : 'Loading your dashboard...'}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Enhanced Hero Section */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-8 lg:space-y-0">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Welcome back{userProfile?.first_name ? `, ${userProfile.first_name}` : ''}!
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">
                      Ready to accelerate your career growth?
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="card-modern p-6 rounded-2xl text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Trophy className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.completedMilestones}</div>
                    <div className="text-sm text-gray-600">Milestones Complete</div>
                  </div>
                  
                  <div className="card-modern p-6 rounded-2xl text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalGoals}</div>
                    <div className="text-sm text-gray-600">Active Goals</div>
                  </div>
                  
                  <div className="card-modern p-6 rounded-2xl text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{completionPercentage}%</div>
                    <div className="text-sm text-gray-600">Profile Complete</div>
                  </div>
                </div>
              </div>

              <div className="lg:w-80">
                <div className="card-modern p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Profile Completion</h3>
                    <span className="text-sm text-gray-500">{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <div className="space-y-2 text-sm">
                    {completionItems.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {item.completed ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        )}
                        <span className={item.completed ? 'text-green-700' : 'text-gray-600'}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Quick Actions */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                <p className="text-gray-600 mt-1">Jump into your most important tasks</p>
              </div>
              <Button 
                onClick={() => router.push('/onboarding')} 
                className="btn-modern bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Settings className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Resume Customizer - Featured */}
              <div className="lg:col-span-2 card-modern p-8 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200/50 hover:border-purple-300/50 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Resume Customizer</h3>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-gradient-to-r from-green-400 to-emerald-400 text-white text-xs font-bold rounded-full animate-pulse">
                            NEW
                          </span>
                          <span className="px-2 py-1 bg-gradient-to-r from-blue-400 to-indigo-400 text-white text-xs font-bold rounded-full">
                            AI-POWERED
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      Transform your career with AI-powered resume optimization, job fit analysis, and personalized cover letters. Get interview-ready in minutes.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Job Analysis</span>
                      <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">Resume Tailoring</span>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">Cover Letters</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Interview Prep</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/resume-customizer')}
                  className="btn-modern w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-[1.02]"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Resume Optimization
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </div>

              {/* Other Quick Actions */}
              <div className="space-y-6">
                <div className="card-modern p-6 rounded-2xl hover:shadow-lg transition-all duration-200 group cursor-pointer" onClick={() => router.push('/goal-setting')}>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Goal Setting</h3>
                      <p className="text-sm text-gray-600">Define your career path</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{stats.totalGoals} active goals</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>

                <div className="card-modern p-6 rounded-2xl hover:shadow-lg transition-all duration-200 group cursor-pointer" onClick={() => router.push('/ai-interview-practice')}>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Video className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI Interview Practice</h3>
                      <p className="text-sm text-gray-600">Practice with AI coach</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Build confidence</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Recent Activity & Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="card-modern p-8 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Clock className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description || 'Activity completed'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatRelativeTime(activity.created_at || '')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent activity</h3>
                  <p className="text-gray-600 mb-6">Start your career development journey today!</p>
                  <Button 
                    onClick={() => router.push('/resume-customizer')}
                    className="btn-modern bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>

            {/* Active Goals */}
            <div className="card-modern p-8 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Active Goals</h2>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
              </div>
              
              {goals.length > 0 ? (
                <div className="space-y-4">
                  {goals.slice(0, 5).map((goal, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {goal.goal_text || 'Career Goal'}
                        </h3>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          {goal.priority || 'Medium'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-green-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.random() * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-green-700 font-medium">
                          {Math.floor(Math.random() * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No active goals</h3>
                  <p className="text-gray-600 mb-6">Set your first career goal to get started!</p>
                  <Button 
                    onClick={() => router.push('/goal-setting')}
                    className="btn-modern bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Set Goals
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Learning Resources */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Continue Learning</h2>
                <p className="text-gray-600 mt-1">Recommended resources for your career path</p>
              </div>
              <Button 
                onClick={() => router.push('/learning')}
                className="btn-modern bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                View All Resources
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Leadership Development",
                  description: "Build essential leadership skills for career advancement",
                  icon: Users,
                  color: "from-blue-500 to-indigo-500",
                  bgColor: "from-blue-50 to-indigo-50",
                  borderColor: "border-blue-200/50"
                },
                {
                  title: "Technical Skills",
                  description: "Stay current with industry-relevant technologies",
                  icon: Zap,
                  color: "from-purple-500 to-pink-500",
                  bgColor: "from-purple-50 to-pink-50",
                  borderColor: "border-purple-200/50"
                },
                {
                  title: "Communication",
                  description: "Enhance your professional communication abilities",
                  icon: MessageSquare,
                  color: "from-green-500 to-emerald-500",
                  bgColor: "from-green-50 to-emerald-50",
                  borderColor: "border-green-200/50"
                }
              ].map((resource, index) => (
                <div key={index} className={`card-modern p-6 rounded-2xl bg-gradient-to-br ${resource.bgColor} border-2 ${resource.borderColor} hover:shadow-lg transition-all duration-200 group cursor-pointer`}>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${resource.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                      <resource.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                      <p className="text-sm text-gray-600">{resource.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Explore now</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </PageLayout>
    }>
      <DashboardContent />
    </Suspense>
  );
} 