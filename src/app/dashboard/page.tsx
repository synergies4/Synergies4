'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { UserAvatar } from '@/components/UserAvatar';

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
  const { user, userProfile, loading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    averageScore: 0
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    } else if (!authLoading && !user) {
      // Redirect to login
      window.location.href = '/login?redirect=/dashboard';
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      // Fetch enrollments
      const enrollmentsResponse = await fetch('/api/enrollments', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (enrollmentsResponse.ok) {
        const enrollmentsData = await enrollmentsResponse.json();
        setEnrollments(enrollmentsData.enrollments || []);
        
        // Calculate stats
        const totalCourses = enrollmentsData.enrollments?.length || 0;
        const completedCourses = enrollmentsData.enrollments?.filter(
          (e: Enrollment) => e.status === 'COMPLETED'
        ).length || 0;
        const totalHours = enrollmentsData.enrollments?.reduce(
          (sum: number, e: Enrollment) => sum + (e.course.duration || 0), 0
        ) || 0;

        setStats(prev => ({
          ...prev,
          totalCourses,
          completedCourses,
          totalHours
        }));
      }

      // Fetch quiz attempts
      const quizResponse = await fetch('/api/quiz-attempts', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        setQuizAttempts(quizData.attempts || []);
        
        // Calculate average score
        const attempts = quizData.attempts || [];
        const averageScore = attempts.length > 0 
          ? attempts.reduce((sum: number, a: QuizAttempt) => sum + a.percentage, 0) / attempts.length
          : 0;
        
        setStats(prev => ({
          ...prev,
          averageScore: Math.round(averageScore)
        }));
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

  if (authLoading || loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <Card>
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

            <Card>
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

            <Card>
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

            <Card>
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
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="courses" className="text-xs md:text-sm py-2 md:py-3">My Courses</TabsTrigger>
                <TabsTrigger value="progress" className="text-xs md:text-sm py-2 md:py-3">Progress</TabsTrigger>
                <TabsTrigger value="certificates" className="text-xs md:text-sm py-2 md:py-3">Certificates</TabsTrigger>
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
                      <div
                        key={enrollment.id}
                      >
                        <Card className="h-full hover:shadow-lg transition-shadow">
                          <div className="aspect-video relative overflow-hidden rounded-t-lg">
                            {enrollment.course.image ? (
                              <img
                                src={enrollment.course.image}
                                alt={enrollment.course.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <BookOpen className="h-8 w-8 md:h-12 md:w-12 text-white" />
                              </div>
                            )}
                            <div className="absolute top-2 md:top-4 right-2 md:right-4">
                              <Badge variant={enrollment.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-xs">
                                {enrollment.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <CardContent className="p-4 md:p-6">
                            <div className="space-y-3 md:space-y-4">
                              <div>
                                <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-2">
                                  {enrollment.course.title}
                                </h3>
                                <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                                  {enrollment.course.description}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs">{enrollment.course.level}</Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 md:h-4 md:w-4" />
                                  {enrollment.course.duration}h
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between text-xs md:text-sm">
                                  <span className="text-gray-600">Progress</span>
                                  <span className="font-medium">{enrollment.progress_percentage}%</span>
                                </div>
                                <Progress value={enrollment.progress_percentage} className="h-2" />
                              </div>

                              <div className="flex gap-2">
                                {enrollment.status === 'COMPLETED' ? (
                                  <Button variant="outline" className="flex-1 text-xs md:text-sm py-2" disabled>
                                    <CheckCircle className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                                    Completed
                                  </Button>
                                ) : (
                                  <Button asChild className="flex-1 text-xs md:text-sm py-2">
                                    <Link href={`/learn/${createCourseSlug(enrollment.course.title)}`}>
                                      <Play className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                                      Continue
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="progress" className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Learning Progress</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <Card>
                    <CardHeader className="pb-3 md:pb-6">
                      <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                        <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                        Course Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 md:space-y-4">
                      {enrollments.map((enrollment) => (
                        <div key={enrollment.id} className="space-y-2">
                          <div className="flex justify-between text-xs md:text-sm">
                            <span className="font-medium truncate pr-2">{enrollment.course.title}</span>
                            <span className="flex-shrink-0">{enrollment.progress_percentage}%</span>
                          </div>
                          <Progress value={enrollment.progress_percentage} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3 md:pb-6">
                      <CardTitle className="flex items-center gap-2 text-base md:text-lg">
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

              <TabsContent value="certificates" className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Certificates</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {enrollments
                    .filter(enrollment => enrollment.certificate_issued)
                    .map((enrollment) => (
                      <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
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
                          <Button variant="outline" size="sm" className="w-full text-xs md:text-sm">
                            Download Certificate
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  
                  {enrollments.filter(enrollment => enrollment.certificate_issued).length === 0 && (
                    <Card className="col-span-full">
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