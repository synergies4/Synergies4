'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user, userProfile, loading: authLoading } = useAuth();
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
    console.log('Admin Dashboard - userProfile.role:', userProfile?.role);
    
    if (authLoading) return;
    
    if (!user) {
      console.log('Admin Dashboard - No user, redirecting to login');
      router.push('/login');
      return;
    }
    
    if (userProfile && userProfile.role !== 'ADMIN') {
      console.log('Admin Dashboard - User is not admin, redirecting to login');
      router.push('/login');
      return;
    }
    
    // If userProfile is null, wait for it to load
    if (!userProfile) {
      console.log('Admin Dashboard - Waiting for user profile to load');
      return;
    }

    console.log('Admin Dashboard - Admin user confirmed, fetching courses');
    fetchDashboardData();
  }, [user, userProfile, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch courses
      const coursesResponse = await fetch('/api/courses');
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses || []);
        
        const totalCourses = coursesData.courses?.length || 0;
        const publishedCourses = coursesData.courses?.filter((c: any) => c.status === 'PUBLISHED').length || 0;
        
        setStats(prev => ({
          ...prev,
          totalCourses,
          publishedCourses
        }));
      }

      // Fetch enrollment analytics
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
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

  if (authLoading || loading || !userProfile) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">
              {authLoading ? 'Loading authentication...' : 
               !userProfile ? 'Loading user profile...' : 
               'Loading admin dashboard...'}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user || userProfile?.role !== 'ADMIN') {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Access Denied</CardTitle>
              <CardDescription className="text-center">
                You need admin privileges to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 md:py-6">
              <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                <Shield className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm md:text-base text-gray-600">
                    Welcome back, {userProfile?.name || user.user_metadata?.name || user.email}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    View Site
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">{stats.totalCourses}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.publishedCourses} published
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalEnrollments} enrollments
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Total earnings
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">Completion Rate</CardTitle>
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">{stats.completionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Avg quiz score: {stats.averageQuizScore}%
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base md:text-lg">
                    <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Create Course
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Add a new course to your platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full text-sm" asChild>
                    <Link href="/admin/courses/new">
                      Create New Course
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base md:text-lg">
                    <Users className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Manage Users
                  </CardTitle>
                  <CardDescription className="text-sm">
                    View and manage user accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full text-sm" asChild>
                    <Link href="/admin/users">
                      View Users
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base md:text-lg">
                    <BarChart3 className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Analytics
                  </CardTitle>
                  <CardDescription className="text-sm">
                    View detailed analytics and reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full text-sm" asChild>
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
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base md:text-lg">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Blog Management
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Create and manage industry insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="flex-1 text-sm" asChild>
                      <Link href="/admin/blog">
                        Manage Posts
                      </Link>
                    </Button>
                    <Button className="flex-1 text-sm" asChild>
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
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base md:text-lg">
                    <Settings className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    System Settings
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Configure platform settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full text-sm" asChild>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg md:text-xl">Recent Courses</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/courses">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No courses created yet</p>
                    <Button asChild>
                      <Link href="/admin/courses/new">Create Your First Course</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.slice(0, 5).map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{course.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {course.category}
                            </Badge>
                            <Badge 
                              variant={course.status === 'PUBLISHED' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {course.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {course.price ? `$${course.price}` : 'Free'}
                          </p>
                          <p className="text-sm text-gray-600">
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