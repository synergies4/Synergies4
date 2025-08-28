'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { UserAvatar } from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageLayout from '@/components/shared/PageLayout';
import { 
  Loader2, 
  BookOpen, 
  Users, 
  FileText, 
  DollarSign, 
  Plus,
  Home,
  Settings,
  BarChart3,
  Shield,
  TrendingUp
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Course {
  id: string;
  title: string;
  category: string;
  status: string;
  price: number | null;
  enrollments: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, userProfile, loading: authLoading, isAdmin, canAccessAdmin } = useAuth();
  const { canAccessAdminArea } = useAuthRedirect({ requireAuth: true, requireAdmin: true });
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    totalEnrollments: 0,
    completionRate: 0,
    averageQuizScore: 0
  });

  useEffect(() => {
    console.log('Admin Dashboard - authLoading:', authLoading);
    console.log('Admin Dashboard - user:', user?.email);
    console.log('Admin Dashboard - userProfile:', userProfile);
    console.log('Admin Dashboard - isAdmin:', isAdmin);
    console.log('Admin Dashboard - canAccessAdmin:', canAccessAdmin);
    console.log('Admin Dashboard - canAccessAdminArea:', canAccessAdminArea);
    
    if (authLoading) return;
    
    // If userProfile is null, wait for it to load
    if (!userProfile) {
      console.log('Admin Dashboard - Waiting for user profile to load');
      return;
    }

    // Only fetch data if user can access admin area
    if (canAccessAdminArea) {
      console.log('Admin Dashboard - Admin user confirmed, fetching courses');
      fetchDashboardData();
    }
  }, [user, userProfile, authLoading, isAdmin, canAccessAdmin, canAccessAdminArea]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get auth token for API call
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      // Fetch courses with auth token
      const coursesResponse = await fetch('/api/courses?page=1&per_page=100', {
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        }
      });
      
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        console.log('Admin dashboard courses response:', coursesData);
        const coursesWithEnrollments = await fetchEnrollmentDataForCourses(coursesData.courses || [], session);
        setCourses(coursesWithEnrollments);
        
        const totalCourses = coursesWithEnrollments.length || 0;
        const publishedCourses = coursesWithEnrollments.filter((c: any) => c.status === 'PUBLISHED').length || 0;
        
        setStats(prev => ({
          ...prev,
          totalCourses,
          publishedCourses
        }));
      } else {
        console.error('Courses API error:', coursesResponse.status, coursesResponse.statusText);
        // Set empty courses array to avoid errors
        setCourses([]);
        setStats(prev => ({
          ...prev,
          totalCourses: 0,
          publishedCourses: 0
        }));
      }

      // Fetch enrollment analytics (reuse existing supabase client)
      
      if (session) {
        // Fetch enrollment stats
        const enrollmentResponse = await fetch('/api/admin/analytics/enrollments', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (enrollmentResponse.ok) {
          const enrollmentData = await enrollmentResponse.json();
          setStats(prev => ({
            ...prev,
            totalEnrollments: enrollmentData.totalEnrollments || 0,
            totalStudents: enrollmentData.totalStudents || 0,
            totalRevenue: enrollmentData.totalRevenue || 0,
            completionRate: enrollmentData.completionRate || 0,
            averageQuizScore: enrollmentData.averageQuizScore || 0
          }));
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollmentDataForCourses = async (coursesData: any[], session: any) => {
    try {
      // Fetch enrollment data for each course
      const enrollmentPromises = coursesData.map(async (course) => {
        try {
          const response = await fetch(`/api/enrollments?course_id=${course.id}&page=1&per_page=1`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
          });

          if (response.ok) {
            const enrollmentData = await response.json();
            return {
              ...course,
              enrollments: enrollmentData.pagination?.count_total || 0
            };
          }
          return { ...course, enrollments: 0 };
        } catch (error) {
          console.error(`Error fetching enrollments for course ${course.id}:`, error);
          return { ...course, enrollments: 0 };
        }
      });

      const coursesWithEnrollments = await Promise.all(enrollmentPromises);
      return coursesWithEnrollments;
    } catch (error) {
      console.error('Error fetching enrollment data for courses:', error);
      return coursesData.map(course => ({ ...course, enrollments: 0 }));
    }
  };

  if (authLoading || loading || !userProfile) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
            <p className="text-gray-600 font-medium">
              {authLoading ? 'Loading authentication...' : 
               !userProfile ? 'Loading user profile...' : 
               'Loading admin dashboard...'}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show redirect state for unauthenticated users (handled by useAuthRedirect hook)
  if (!authLoading && !canAccessAdminArea) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
            <p className="text-gray-600">Redirecting to home page...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-teal-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 md:py-6">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-teal-700 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm md:text-base text-gray-600 font-medium">
                    Welcome back, {userProfile?.name || user?.user_metadata?.name || user?.email}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <Button variant="outline" size="sm" className="w-full sm:w-auto bg-white/80 border-2 border-teal-200 hover:bg-teal-50 hover:border-teal-400 text-gray-900 font-medium" asChild>
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    View Site
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto bg-white/80 border-2 border-teal-200 hover:bg-teal-50 hover:border-teal-400 text-gray-900 font-medium" asChild>
                  <Link href="/admin/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-4 md:py-6 px-4 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <div>
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-semibold text-gray-700">Total Courses</CardTitle>
                  <BookOpen className="h-3 w-3 md:h-4 md:w-4 text-teal-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalCourses}</div>
                  <p className="text-xs text-gray-600 font-medium">
                    {stats.publishedCourses} published
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-semibold text-gray-700">Total Students</CardTitle>
                  <Users className="h-3 w-3 md:h-4 md:w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalStudents}</div>
                  <p className="text-xs text-gray-600 font-medium">
                    {stats.totalEnrollments} enrollments
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-semibold text-gray-700">Revenue</CardTitle>
                  <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-gray-600 font-medium">
                    Total earnings
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-semibold text-gray-700">Completion Rate</CardTitle>
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.completionRate}%</div>
                  <p className="text-xs text-gray-600 font-medium">
                    Avg quiz score: {stats.averageQuizScore}%
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div>
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base md:text-lg text-gray-900 group-hover:text-teal-700 transition-colors">
                    <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2 text-teal-600 group-hover:text-teal-700" />
                    Create Course
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Add a new course to your platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full text-sm bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                    <Link href="/admin/courses/new">
                      Create New Course
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base md:text-lg text-gray-900 group-hover:text-teal-700 transition-colors">
                    <Users className="h-4 w-4 md:h-5 md:w-5 mr-2 text-emerald-600 group-hover:text-emerald-700" />
                    Manage Users
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    View and manage user accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full text-sm bg-white/80 border-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-400 hover:text-teal-800 font-medium" asChild>
                    <Link href="/admin/users">
                      View Users
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base md:text-lg text-gray-900 group-hover:text-teal-700 transition-colors">
                    <BarChart3 className="h-4 w-4 md:h-5 md:w-5 mr-2 text-purple-600 group-hover:text-purple-700" />
                    Analytics
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    View detailed analytics and reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full text-sm bg-white/80 border-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-400 hover:text-teal-800 font-medium" asChild>
                    <Link href="/admin/analytics">
                      View Analytics
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            <div>
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base md:text-lg text-gray-900 group-hover:text-teal-700 transition-colors">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2 text-orange-600 group-hover:text-orange-700" />
                    Blog Management
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Create and manage industry insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="flex-1 text-sm bg-white/80 border-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-400 hover:text-teal-800 font-medium" asChild>
                      <Link href="/admin/blog">
                        Manage Posts
                      </Link>
                    </Button>
                    <Button className="flex-1 text-sm bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300" asChild>
                      <Link href="/admin/blog/new">
                        <Plus className="h-4 w-4 mr-2" />
                        New Post
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base md:text-lg text-gray-900 group-hover:text-teal-700 transition-colors">
                    <Settings className="h-4 w-4 md:h-5 md:w-5 mr-2 text-gray-600 group-hover:text-gray-700" />
                    System Settings
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Configure platform settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full text-sm bg-white/80 border-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-400 hover:text-teal-800 font-medium" asChild>
                    <Link href="/admin/settings">
                      Open Settings
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Courses */}
          <div>
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100">
                <CardTitle className="text-lg md:text-xl text-gray-900 font-bold">Recent Courses</CardTitle>
                <Button variant="outline" size="sm" className="bg-white/80 border-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-400 hover:text-teal-800 font-medium" asChild>
                  <Link href="/admin/courses">View All</Link>
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses created yet</h3>
                    <p className="text-gray-600 mb-6">Get started by creating your first course</p>
                    <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                      <Link href="/admin/courses/new">Create Your First Course</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.slice(0, 5).map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-teal-50 hover:from-teal-50 hover:to-emerald-50 hover:border-teal-200 transition-all duration-300 group">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-teal-800 transition-colors">{course.title}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs border-teal-200 text-teal-700 bg-white/80 font-medium">
                              {course.category}
                            </Badge>
                            <Badge 
                              variant={course.status === 'PUBLISHED' ? 'default' : 'secondary'}
                              className={`text-xs font-medium ${course.status === 'PUBLISHED' 
                                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-sm' 
                                : 'bg-gray-200 text-gray-700'}`}
                            >
                              {course.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {course.price ? `$${course.price}` : 'Free'}
                          </p>
                          <p className="text-sm text-gray-600 font-medium">
                            {course.enrollments || 0} enrolled
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </PageLayout>
  );
} 