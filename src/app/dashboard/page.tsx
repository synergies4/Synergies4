'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import PageLayout from '@/components/shared/PageLayout';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Play,
  CheckCircle,
  Calendar,
  Target,
  Menu,
  X,
  ArrowRight,
  BarChart3,
  CreditCard,
  Video,
  Users,
  FileText,
  Plus,
  Eye,
  User,
  Settings,
  Edit3,
  Save
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
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

export default function StudentDashboard() {
  const { user, userProfile, loading: authLoading, isLoggingOut } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [activeBots, setActiveBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [contentUsage, setContentUsage] = useState<any>(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    averageScore: 0,
    totalMeetings: 0,
    activeBots: 0
  });
  const [userOnboarding, setUserOnboarding] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
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
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    } else if (!authLoading && !user && !isLoggingOut) {
      // Only redirect to login if not in the process of logging out
      window.location.href = '/login?redirect=/dashboard';
    }
  }, [user, authLoading, isLoggingOut]);

  // Check for subscription success and refresh data
  useEffect(() => {
    const subscriptionSuccess = searchParams.get('subscription');
    if (subscriptionSuccess === 'success' && user) {
      // Clear the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('subscription');
      window.history.replaceState({}, '', url.toString());
      
      // Show success notification
      (async () => {
        const toast = (await import('sonner')).toast;
        toast.success('Payment successful! Your subscription is being activated...', {
          duration: 5000,
        });
      })();
      
      // Force refresh subscription data with retry logic
      refreshSubscriptionData();
    }
  }, [user, searchParams]);

  const refreshSubscriptionData = async (retryCount = 0, useAPI = false) => {
    try {
      setRefreshing(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      if (useAPI) {
        // Use the API endpoint to fetch from Stripe directly
        console.log('Refreshing subscription via API...');
        const response = await fetch('/api/subscription/refresh', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSubscriptionData(data.subscription);
          setContentUsage({
            settings: {
              plan_type: data.usage.planType,
              max_presentations: data.usage.maxPresentations,
              max_conversations: data.usage.maxConversations
            },
            currentPresentations: data.usage.currentPresentations,
            currentConversations: data.usage.currentConversations
          });
          console.log('Subscription refreshed via API:', data);
          return;
        } else {
          console.log('API refresh failed, falling back to database query...');
        }
      }

      // Try multiple queries to handle different subscription states
      let subscription = null;
      
      // First try: active subscriptions
      const { data: activeSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      if (activeSubscription) {
        subscription = activeSubscription;
      } else {
        // Second try: any subscription that's not cancelled
        const { data: anySubscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .neq('status', 'cancelled')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        subscription = anySubscription;
      }

      if (subscription) {
        setSubscriptionData(subscription);
        
        // Also refresh content usage settings
        const { data: settings } = await supabase
          .from('user_content_settings')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        const { count: presentationsCount } = await supabase
          .from('user_presentations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id);

        const { count: conversationsCount } = await supabase
          .from('user_conversations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('is_archived', false);

        setContentUsage({
          settings,
          currentPresentations: presentationsCount || 0,
          currentConversations: conversationsCount || 0
        });

        console.log('Subscription data refreshed:', subscription);
      } else if (retryCount < 3) {
        // Retry in case webhook is still processing
        console.log(`No subscription found, retrying in 2 seconds... (attempt ${retryCount + 1}/3)`);
        setTimeout(() => refreshSubscriptionData(retryCount + 1, retryCount === 2), 2000);
        return;
      } else {
        // Final retry with API call
        console.log('Final retry using API call...');
        setTimeout(() => refreshSubscriptionData(0, true), 1000);
      }
      
    } catch (error) {
      console.error('Error refreshing subscription data:', error);
      if (retryCount < 3) {
        setTimeout(() => refreshSubscriptionData(retryCount + 1, retryCount === 2), 2000);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // User profile comes from AuthContext, no need to fetch separately

      // Fetch enrollments with course details
      const { data: enrollmentsData } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:courses (
            id, title, description, image, category, level, duration, price
          )
        `)
        .eq('user_id', session.user.id)
        .order('enrolled_at', { ascending: false });

      if (enrollmentsData) {
        setEnrollments(enrollmentsData);
        setStats(prev => ({
          ...prev,
          totalCourses: enrollmentsData.length,
          completedCourses: enrollmentsData.filter(e => e.status === 'COMPLETED').length
        }));
      }

      // Fetch quiz attempts
      const { data: quizData } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          course:courses (title)
        `)
        .eq('user_id', session.user.id)
        .order('completed_at', { ascending: false });

      if (quizData) {
        setQuizAttempts(quizData);
      }

      // Fetch meetings and active bots
      try {
        const meetingsResponse = await fetch('/api/meeting-transcripts?limit=5', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (meetingsResponse.ok) {
          const meetingsData = await meetingsResponse.json();
          setMeetings(meetingsData.transcripts || []);
          setStats(prev => ({
            ...prev,
            totalMeetings: meetingsData.pagination?.total || 0
          }));
        }

        const activeBotsResponse = await fetch('/api/meeting-recorder/active', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (activeBotsResponse.ok) {
          const botsData = await activeBotsResponse.json();
          setActiveBots(botsData || []);
          setStats(prev => ({
            ...prev,
            activeBots: botsData?.length || 0
          }));
        }
      } catch (error) {
        console.error('Error fetching meetings data:', error);
      }

      // Fetch subscription data with improved logic
      try {
        // Try multiple queries to handle different subscription states
        let subscription = null;
        
        // First try: active subscriptions
        const { data: activeSubscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single();

        if (activeSubscription) {
          subscription = activeSubscription;
        } else {
          // Second try: any subscription that's not cancelled (including trialing, past_due, etc.)
          const { data: anySubscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', session.user.id)
            .neq('status', 'cancelled')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          subscription = anySubscription;
        }

        const { data: settings } = await supabase
          .from('user_content_settings')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        const { count: presentationsCount } = await supabase
          .from('user_presentations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id);

        const { count: conversationsCount } = await supabase
          .from('user_conversations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('is_archived', false);

        setSubscriptionData(subscription);
        setContentUsage({
          settings,
          currentPresentations: presentationsCount || 0,
          currentConversations: conversationsCount || 0
        });

        console.log('Subscription data:', subscription);
        console.log('Content usage:', { settings, presentationsCount, conversationsCount });
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      }

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative light" style={{ backgroundColor: '#f8fafc', color: '#1f2937' }}>
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {userProfile?.name || user?.email}!
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Continue your learning journey and track your progress.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-2 md:mb-0">
                    <p className="text-xs md:text-sm font-medium text-gray-600">Total Courses</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                  </div>
                  <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-blue-600 self-end md:self-auto" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-2 md:mb-0">
                    <p className="text-xs md:text-sm font-medium text-gray-600">Meetings</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalMeetings}</p>
                  </div>
                  <Video className="h-6 w-6 md:h-8 md:w-8 text-teal-600 self-end md:self-auto" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-2 md:mb-0">
                    <p className="text-xs md:text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600 self-end md:self-auto" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-2 md:mb-0">
                    <p className="text-xs md:text-sm font-medium text-gray-600">Learning Hours</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalHours}</p>
                  </div>
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-orange-600 self-end md:self-auto" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-2 md:mb-0">
                    <p className="text-xs md:text-sm font-medium text-gray-600">Avg. Score</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                  </div>
                  <Target className="h-6 w-6 md:h-8 md:w-8 text-purple-600 self-end md:self-auto" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div>
            <Tabs defaultValue="courses" className="space-y-4 md:space-y-6">
              <TabsList className="grid w-full grid-cols-6 h-auto bg-white border border-gray-200">
                <TabsTrigger value="courses" className="text-xs md:text-sm py-2 md:py-3 text-gray-900 data-[state=active]:bg-teal-600 data-[state=active]:text-white">My Courses</TabsTrigger>
                <TabsTrigger value="meetings" className="text-xs md:text-sm py-2 md:py-3 text-gray-900 data-[state=active]:bg-teal-600 data-[state=active]:text-white">Meetings</TabsTrigger>
                <TabsTrigger value="progress" className="text-xs md:text-sm py-2 md:py-3 text-gray-900 data-[state=active]:bg-teal-600 data-[state=active]:text-white">Progress</TabsTrigger>
                <TabsTrigger value="profile" className="text-xs md:text-sm py-2 md:py-3 text-gray-900 data-[state=active]:bg-teal-600 data-[state=active]:text-white">Profile</TabsTrigger>
                <TabsTrigger value="subscription" className="text-xs md:text-sm py-2 md:py-3 text-gray-900 data-[state=active]:bg-teal-600 data-[state=active]:text-white">Subscription</TabsTrigger>
                <TabsTrigger value="certificates" className="text-xs md:text-sm py-2 md:py-3 text-gray-900 data-[state=active]:bg-teal-600 data-[state=active]:text-white">Certificates</TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">My Courses</h2>
                  <Button asChild size="sm" className="w-full sm:w-auto">
                    <Link href="/courses">Browse More Courses</Link>
                  </Button>
                </div>

                {enrollments.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 md:p-12 text-center">
                      <BookOpen className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                        No courses enrolled yet
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                        Start your learning journey by enrolling in a course.
                      </p>
                      <Button asChild size="sm" className="w-full sm:w-auto">
                        <Link href="/courses">Browse Courses</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    {enrollments.map((enrollment) => (
                      <Card key={enrollment.id} className="h-full flex flex-col">
                        <CardContent className="p-6 flex flex-col flex-1">
                          {/* Course Header - Fixed Height */}
                          <div className="flex items-start space-x-4 mb-4">
                            <Image 
                              src={enrollment.course.image || '/default-course.png'} 
                              alt={enrollment.course.title} 
                              width={60} 
                              height={60} 
                              className="rounded-lg object-cover flex-shrink-0" 
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                                {enrollment.course.title}
                              </h3>
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className={getLevelBadgeStyle(enrollment.course.level)}>{enrollment.course.level}</Badge>
                                <Badge variant="secondary">{enrollment.course.category}</Badge>
                              </div>
                            </div>
                          </div>

                          {/* Course Description - Fixed Height */}
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem] flex-shrink-0">
                            {enrollment.course.description}
                          </p>

                          {/* Progress Section - Fixed Height */}
                          <div className="mb-4 flex-shrink-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Progress</span>
                              <span className="text-sm text-gray-500">{enrollment.progress_percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                              <div 
                                className="bg-gradient-to-r from-blue-600 to-teal-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${Math.max(enrollment.progress_percentage, 2)}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Lessons: {enrollment.lessonsCompleted || 0} / {enrollment.totalLessons || '—'}</span>
                              {enrollment.timeSpent && (
                                <span>Time: {enrollment.timeSpent}h</span>
                              )}
                            </div>
                          </div>

                          {/* Quiz Performance - Flex Section */}
                          {quizAttempts.filter(q => q.course.title === enrollment.course.title).length > 0 && (
                            <div className="mb-4 flex-1">
                              <h4 className="text-sm font-semibold mb-2 text-gray-700">Quiz Performance</h4>
                              <div className="bg-gray-50 rounded-lg p-3">
                                {quizAttempts.filter(q => q.course.title === enrollment.course.title).slice(0, 2).map((attempt) => (
                                  <div key={attempt.id} className="text-xs text-gray-600 mb-1 last:mb-0">
                                    <span className="font-medium">{attempt.percentage}%</span> on {new Date(attempt.completed_at).toLocaleDateString()}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons - Fixed at Bottom */}
                          <div className="flex flex-col space-y-2 mt-auto pt-4">
                            {enrollment.certificate_issued && (
                              <Button size="sm" variant="outline" asChild className="w-full">
                                <Link href={`/certificates/${enrollment.id}`}>
                                  <Award className="w-4 h-4 mr-2" />
                                  Download Certificate
                                </Link>
                              </Button>
                            )}
                            <Button size="sm" asChild className="w-full">
                              <Link href={`/learn/${createCourseSlug(enrollment.course.title)}`}>
                                Continue Learning
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="meetings" className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Meeting Recordings</h2>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                      <Link href="/record-meeting">Record Meeting</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 border-0">
                      <Link href="/pocket-coach">Pocket Coach</Link>
                    </Button>
                    <Button asChild size="sm" className="w-full sm:w-auto">
                      <Link href="/meetings">View All Meetings</Link>
                    </Button>
                  </div>
                </div>

                {/* Active Recording Bots */}
                {activeBots.length > 0 && (
                  <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-900">
                        <Video className="h-5 w-5 text-red-600" />
                        Active Recordings ({activeBots.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {activeBots.map((bot) => (
                        <div key={bot.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <div>
                              <p className="font-medium text-gray-900">{bot.botName || 'Meeting Recorder'}</p>
                              <p className="text-sm text-gray-600">{bot.platform} • {bot.status}</p>
                            </div>
                          </div>
                          <Badge variant="destructive" className="bg-red-100 text-red-800">
                            {bot.status === 'recording' ? 'Recording' : 'Joining...'}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Recent Meetings */}
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <FileText className="h-5 w-5" />
                      Recent Meeting Transcripts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {meetings.length === 0 ? (
                      <div className="text-center py-8">
                        <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No meetings recorded yet</h3>
                        <p className="text-gray-600 mb-4">Start recording meetings to see transcripts here</p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          <Button asChild size="sm">
                            <Link href="/record-meeting">Record Local Meeting</Link>
                          </Button>
                          <Button asChild size="sm" variant="outline">
                            <Link href="#" onClick={(e) => {
                              e.preventDefault();
                              // This will open the floating recorder
                              const recordButton = document.querySelector('[data-recorder-trigger]') as HTMLElement;
                              recordButton?.click();
                            }}>Join External Meeting</Link>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {meetings.slice(0, 5).map((meeting) => (
                          <div key={meeting.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">{meeting.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(meeting.meeting_date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {Math.floor((meeting.duration_minutes || 0) / 60)}h {(meeting.duration_minutes || 0) % 60}m
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {meeting.participants?.length || 0} participants
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">{meeting.summary}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/meetings/${meeting.id}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                        {meetings.length > 5 && (
                          <div className="text-center pt-4 border-t">
                            <Button variant="outline" asChild>
                              <Link href="/meetings">View All {stats.totalMeetings} Meetings</Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                          <Video className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-teal-900">Record Meeting</h3>
                          <p className="text-sm text-teal-700">Record local audio or screen</p>
                        </div>
                      </div>
                      <Button asChild className="w-full bg-teal-600 hover:bg-teal-700">
                        <Link href="/record-meeting">Start Recording</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Plus className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900">Join Meeting</h3>
                          <p className="text-sm text-blue-700">Add recorder to any meeting</p>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        data-recorder-trigger
                        onClick={() => {
                          // Open the floating recorder dialog
                          const event = new CustomEvent('openRecorder');
                          window.dispatchEvent(event);
                        }}
                      >
                        Add Recorder Bot
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="progress" className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Learning Progress</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader className="pb-3 md:pb-6">
                      <CardTitle className="flex items-center gap-2 text-base md:text-lg text-gray-900">
                        <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                        Course Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 md:space-y-4">
                      {enrollments.map((enrollment) => (
                        <div key={enrollment.id} className="space-y-2">
                          <div className="flex justify-between text-xs md:text-sm">
                            <span className="font-medium truncate pr-2 text-gray-900">{enrollment.course.title}</span>
                            <span className="flex-shrink-0 text-gray-700 font-medium">{enrollment.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-300 rounded-full h-2.5 border border-gray-200">
                            <div 
                              className="bg-gradient-to-r from-blue-600 to-teal-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                              style={{ 
                                width: `${Math.max(enrollment.progress_percentage, 2)}%`,
                                minWidth: enrollment.progress_percentage > 0 ? '8px' : '0px'
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader className="pb-3 md:pb-6">
                      <CardTitle className="flex items-center gap-2 text-base md:text-lg text-gray-900">
                        <Target className="h-4 w-4 md:h-5 md:w-5" />
                        Quiz Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 md:space-y-4">
                      {quizAttempts.length === 0 ? (
                        <p className="text-xs md:text-sm text-gray-500 text-center py-4">
                          No quiz attempts yet
                        </p>
                      ) : (
                        quizAttempts.slice(0, 5).map((attempt) => (
                          <div key={attempt.id} className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                                {attempt.course.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(attempt.completed_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs md:text-sm font-bold text-gray-900">
                                {attempt.percentage}%
                              </p>
                              <p className="text-xs text-gray-500">
                                {attempt.score}/{attempt.total_points}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-4 md:space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Profile & Personalization</h2>
                  <Button
                    onClick={() => editingProfile ? saveProfile() : setEditingProfile(true)}
                    className="flex items-center gap-2"
                  >
                    {editingProfile ? (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-4 w-4" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                        <User className="h-5 w-5 text-blue-600" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                          {editingProfile ? (
                            <Input
                              value={profileForm.full_name}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                              placeholder="Enter your full name"
                            />
                          ) : (
                            <p className="text-gray-900">{userOnboarding?.full_name || 'Not provided'}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Job Title</label>
                          {editingProfile ? (
                            <Input
                              value={profileForm.job_title}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, job_title: e.target.value }))}
                              placeholder="Enter your job title"
                            />
                          ) : (
                            <p className="text-gray-900">{userOnboarding?.job_title || 'Not provided'}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Company</label>
                          {editingProfile ? (
                            <Input
                              value={profileForm.company}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, company: e.target.value }))}
                              placeholder="Enter your company"
                            />
                          ) : (
                            <p className="text-gray-900">{userOnboarding?.company || 'Not provided'}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Years of Experience</label>
                          {editingProfile ? (
                            <Input
                              value={profileForm.years_experience}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, years_experience: e.target.value }))}
                              placeholder="Enter years of experience"
                            />
                          ) : (
                            <p className="text-gray-900">{userOnboarding?.years_experience || 'Not provided'}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Professional Details */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                        <Settings className="h-5 w-5 text-green-600" />
                        Professional Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Primary Role</label>
                        {editingProfile ? (
                          <Input
                            value={profileForm.primary_role}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, primary_role: e.target.value }))}
                            placeholder="e.g., Product Manager, Scrum Master"
                          />
                        ) : (
                          <p className="text-gray-900">{userOnboarding?.primary_role || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Management Level</label>
                        {editingProfile ? (
                          <Input
                            value={profileForm.management_level}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, management_level: e.target.value }))}
                            placeholder="e.g., Individual Contributor, Team Lead"
                          />
                        ) : (
                          <p className="text-gray-900">{userOnboarding?.management_level || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Team Size</label>
                        {editingProfile ? (
                          <Input
                            value={profileForm.team_size}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, team_size: e.target.value }))}
                            placeholder="e.g., 5-10 people"
                          />
                        ) : (
                          <p className="text-gray-900">{userOnboarding?.team_size || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Company Size</label>
                        {editingProfile ? (
                          <Input
                            value={profileForm.company_size}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, company_size: e.target.value }))}
                            placeholder="e.g., 100-500 employees"
                          />
                        ) : (
                          <p className="text-gray-900">{userOnboarding?.company_size || 'Not provided'}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Learning Preferences */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                        <Target className="h-5 w-5 text-purple-600" />
                        Learning Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Coaching Style</label>
                        {editingProfile ? (
                          <select
                            value={profileForm.coaching_style}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, coaching_style: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          >
                            <option value="directive">Directive</option>
                            <option value="collaborative">Collaborative</option>
                            <option value="balanced">Balanced</option>
                            <option value="supportive">Supportive</option>
                          </select>
                        ) : (
                          <p className="text-gray-900 capitalize">{userOnboarding?.coaching_style || 'balanced'}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Communication Tone</label>
                        {editingProfile ? (
                          <select
                            value={profileForm.communication_tone}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, communication_tone: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          >
                            <option value="casual">Casual</option>
                            <option value="professional">Professional</option>
                            <option value="formal">Formal</option>
                          </select>
                        ) : (
                          <p className="text-gray-900 capitalize">{userOnboarding?.communication_tone || 'professional'}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Learning Style</label>
                        {editingProfile ? (
                          <select
                            value={profileForm.learning_style}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, learning_style: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          >
                            <option value="visual">Visual</option>
                            <option value="auditory">Auditory</option>
                            <option value="hands-on">Hands-on</option>
                            <option value="mixed">Mixed</option>
                          </select>
                        ) : (
                          <p className="text-gray-900 capitalize">{userOnboarding?.learning_style || 'mixed'}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Goals & Challenges */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                        <Award className="h-5 w-5 text-orange-600" />
                        Goals & Challenges
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Current Challenges</label>
                        {userOnboarding?.biggest_challenges?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {userOnboarding.biggest_challenges.map((challenge: string, index: number) => (
                              <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                {challenge}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No challenges specified</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Primary Goals</label>
                        {userOnboarding?.primary_goals?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {userOnboarding.primary_goals.map((goal: string, index: number) => (
                              <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {goal}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No goals specified</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Focus Areas</label>
                        {userOnboarding?.focus_areas?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {userOnboarding.focus_areas.map((area: string, index: number) => (
                              <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No focus areas specified</p>
                        )}
                      </div>
                      {!userOnboarding && (
                        <div className="text-center py-6">
                          <p className="text-gray-600 mb-4">Complete your profile to get personalized AI coaching recommendations</p>
                          <Button asChild>
                            <Link href="/synergize">Complete Onboarding</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="subscription" className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Subscription Management</h2>
                  <div className="flex items-center gap-2">
                    {refreshing && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Updating subscription...
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refreshSubscriptionData(0, true)}
                      disabled={refreshing}
                      className="flex items-center gap-2"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Refresh Status
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Current Plan */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <CreditCard className="h-5 w-5 text-teal-600" />
                        Current Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {subscriptionData ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                {subscriptionData.plan_id === 'starter' && 'Starter Plan'}
                                {subscriptionData.plan_id === 'professional' && 'Professional Plan'}
                                {subscriptionData.plan_id === 'enterprise' && 'Enterprise Plan'}
                              </h3>
                              <p className="text-sm text-gray-600 capitalize">
                                Status: {subscriptionData.status}
                              </p>
                            </div>
                            <Badge className="bg-teal-100 text-teal-800">
                              {subscriptionData.status === 'active' ? 'Active' : subscriptionData.status}
                            </Badge>
                          </div>
                          
                          {subscriptionData.current_period_end && (
                            <div className="text-sm text-gray-600">
                              <p>Current period ends: {new Date(subscriptionData.current_period_end).toLocaleDateString()}</p>
                            </div>
                          )}

                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">Plan Features:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {subscriptionData.plan_id === 'starter' && (
                                <>
                                  <li>• 20 Presentations</li>
                                  <li>• 50 AI Conversations</li>
                                  <li>• Basic presentation templates</li>
                                  <li>• Email support</li>
                                </>
                              )}
                              {subscriptionData.plan_id === 'professional' && (
                                <>
                                  <li>• 50 Presentations</li>
                                  <li>• 200 AI Conversations</li>
                                  <li>• Advanced presentation tools</li>
                                  <li>• Priority support</li>
                                  <li>• 1-on-1 coaching sessions</li>
                                </>
                              )}
                              {subscriptionData.plan_id === 'enterprise' && (
                                <>
                                  <li>• 100 Presentations</li>
                                  <li>• 500 AI Conversations</li>
                                  <li>• White-label branding</li>
                                  <li>• Dedicated account manager</li>
                                  <li>• API access</li>
                                </>
                              )}
                            </ul>
                          </div>

                          {subscriptionData.status === 'active' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => {
                                // Handle subscription management (cancel, change plan, etc.)
                                alert('Subscription management coming soon!');
                              }}
                            >
                              Manage Subscription
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">Free Plan</h3>
                              <p className="text-sm text-gray-600">Limited features</p>
                            </div>
                            <Badge variant="secondary">Free</Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">Plan Features:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• 5 Presentations</li>
                              <li>• 10 AI Conversations</li>
                              <li>• Basic templates</li>
                              <li>• Community support</li>
                            </ul>
                          </div>

                          <div className="space-y-2">
                            <Button 
                              size="sm" 
                              className="w-full bg-teal-600 hover:bg-teal-700"
                              onClick={() => handleSubscriptionUpgrade('starter')}
                            >
                              Upgrade to Starter - $29/mo
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="w-full"
                              onClick={() => handleSubscriptionUpgrade('professional')}
                            >
                              Upgrade to Professional - $79/mo
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Usage Statistics */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Usage Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {contentUsage?.settings ? (
                        <div className="space-y-4">
                          {/* Presentations Usage */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Presentations</span>
                              <span className="text-sm text-gray-500">
                                {contentUsage.currentPresentations} / {contentUsage.settings.max_presentations}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min((contentUsage.currentPresentations / contentUsage.settings.max_presentations) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Conversations Usage */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">AI Conversations</span>
                              <span className="text-sm text-gray-500">
                                {contentUsage.currentConversations} / {contentUsage.settings.max_conversations}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min((contentUsage.currentConversations / contentUsage.settings.max_conversations) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="pt-2 border-t">
                            <div className="text-sm text-gray-600">
                              <p>Plan: <span className="font-medium capitalize">{contentUsage.settings.plan_type}</span></p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">Loading usage statistics...</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Subscription Plans (for free users) */}
                {!subscriptionData && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Upgrade Your Plan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Starter Plan */}
                      <Card className="border-2 border-gray-200 hover:border-teal-500 transition-colors">
                        <CardHeader>
                          <CardTitle className="text-lg">Starter Plan</CardTitle>
                          <div className="text-2xl font-bold">$29<span className="text-sm font-normal">/month</span></div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm text-gray-600 mb-4">
                            <li>• 20 Presentations</li>
                            <li>• 50 AI Conversations</li>
                            <li>• Basic templates</li>
                            <li>• Email support</li>
                          </ul>
                          <Button 
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            onClick={() => handleSubscriptionUpgrade('starter')}
                          >
                            Get Started
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Professional Plan */}
                      <Card className="border-2 border-teal-500 relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-teal-600 text-white">Most Popular</Badge>
                        </div>
                        <CardHeader>
                          <CardTitle className="text-lg">Professional Plan</CardTitle>
                          <div className="text-2xl font-bold">$79<span className="text-sm font-normal">/month</span></div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm text-gray-600 mb-4">
                            <li>• 50 Presentations</li>
                            <li>• 200 AI Conversations</li>
                            <li>• Advanced tools</li>
                            <li>• Priority support</li>
                            <li>• 1-on-1 coaching</li>
                          </ul>
                          <Button 
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            onClick={() => handleSubscriptionUpgrade('professional')}
                          >
                            Get Professional
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Enterprise Plan */}
                      <Card className="border-2 border-gray-200 hover:border-teal-500 transition-colors">
                        <CardHeader>
                          <CardTitle className="text-lg">Enterprise Plan</CardTitle>
                          <div className="text-2xl font-bold">$199<span className="text-sm font-normal">/month</span></div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm text-gray-600 mb-4">
                            <li>• 100 Presentations</li>
                            <li>• 500 AI Conversations</li>
                            <li>• White-label branding</li>
                            <li>• Dedicated manager</li>
                            <li>• API access</li>
                          </ul>
                          <Button 
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            onClick={() => handleSubscriptionUpgrade('enterprise')}
                          >
                            Get Enterprise
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="certificates" className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Certificates</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {enrollments
                    .filter(enrollment => enrollment.certificate_issued)
                    .map((enrollment) => (
                      <Card key={enrollment.id} className="hover:shadow-lg transition-shadow bg-white border border-gray-200 shadow-sm">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <Award className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">
                                {enrollment.course.title}
                              </h3>
                              <p className="text-xs md:text-sm text-gray-500">
                                Completed {enrollment.completed_at ? new Date(enrollment.completed_at).toLocaleDateString() : 'Recently'}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="w-full text-xs md:text-sm border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 bg-white">
                            Download Certificate
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  
                  {enrollments.filter(enrollment => enrollment.certificate_issued).length === 0 && (
                    <Card className="col-span-full bg-white border border-gray-200 shadow-sm">
                      <CardContent className="p-8 md:p-12 text-center">
                        <Award className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                          No certificates yet
                        </h3>
                        <p className="text-sm md:text-base text-gray-600">
                          Complete courses to earn certificates and showcase your achievements.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 