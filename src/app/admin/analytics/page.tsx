'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  BarChart3, 
  Shield, 
  Home,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  DollarSign,
  Eye,
  Clock,
  Star,
  Download,
  Award,
  Calendar,
  Target,
  ArrowUp,
  ArrowDown,
  Filter
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Modal } from '@/components/ui/modal';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalStudents: number;
    totalCourses: number;
    totalRevenue: number;
    totalEnrollments: number;
    completionRate: number;
    averageQuizScore: number;
    userGrowth: number;
    revenueGrowth: number;
    enrollmentGrowth: number;
    courseGrowth: number;
  };
  topCourses: Array<{
    id: string;
    title: string;
    enrollments: number;
    revenue: number;
    rating: number;
    category: string;
    completionRate?: number;
    avgQuizScore?: number;
  }>;
  recentEnrollments: Array<{
    id: string;
    enrolled_at: string;
    course: {
      title: string;
    };
    user: {
      name: string;
      email: string;
    };
  }>;
  userActivity: Array<{
    date: string;
    newUsers: number;
    activeUsers: number;
    enrollments: number;
  }>;
  revenueData: Array<{
    month: string;
    revenue: number;
    enrollments: number;
  }>;
}

interface UserListItem {
  id: string;
  name?: string;
  email?: string;
  progress: number;
  status: string;
  quizScore: number;
}

export default function Analytics() {
  const { user, userProfile, loading: authLoading, isAdmin, canAccessAdmin } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; title: string } | null>(null);
  const [userList, setUserList] = useState<UserListItem[]>([]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || !canAccessAdmin) {
      router.push('/login');
      return;
    }

    fetchAnalytics();
  }, [user, canAccessAdmin, authLoading, router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No session found');
        return;
      }

      // Fetch enrollment analytics from API
      const enrollmentResponse = await fetch('/api/admin/analytics/enrollments', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!enrollmentResponse.ok) {
        console.error('Failed to fetch enrollment analytics:', enrollmentResponse.status);
        return;
      }

      const enrollmentData = await enrollmentResponse.json();
      console.log('📊 Enrollment analytics data:', enrollmentData);

      // Fetch additional data from Supabase
      const [
        { count: totalUsers },
        { count: totalCourses },
        { data: courses }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select(`
          id,
          title,
          category,
          price
        `)
      ]);

      // Get top courses by enrollment (using recent enrollments data)
      const courseEnrollmentCounts = enrollmentData.recentEnrollments.reduce((acc: any, enrollment: any) => {
        const courseTitle = enrollment.course?.title;
        if (courseTitle) {
          acc[courseTitle] = (acc[courseTitle] || 0) + 1;
        }
        return acc;
      }, {});

      const topCourses = courses?.map(course => ({
        id: course.id,
        title: course.title,
        category: course.category,
        enrollments: courseEnrollmentCounts[course.title] || 0,
        revenue: (courseEnrollmentCounts[course.title] || 0) * (course.price || 0),
        rating: 4.5 + Math.random() * 0.5, // Mock rating for now
        completionRate: enrollmentData.completionRate,
        avgQuizScore: enrollmentData.averageQuizScore
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5) || [];

      // Create analytics data using real enrollment data
      const analyticsData: AnalyticsData = {
        overview: {
          totalUsers: totalUsers || 0,
          totalStudents: enrollmentData.totalStudents,
          totalCourses: totalCourses || 0,
          totalRevenue: enrollmentData.totalRevenue,
          totalEnrollments: enrollmentData.totalEnrollments,
          completionRate: enrollmentData.completionRate,
          averageQuizScore: enrollmentData.averageQuizScore,
          userGrowth: 12.5, // Mock growth - calculate from historical data
          revenueGrowth: 8.3,
          enrollmentGrowth: 15.2,
          courseGrowth: 4.1
        },
        topCourses: topCourses,
        recentEnrollments: enrollmentData.recentEnrollments,
        userActivity: [
          { date: '2024-01-01', newUsers: 45, activeUsers: 234, enrollments: 67 },
          { date: '2024-01-02', newUsers: 52, activeUsers: 267, enrollments: 73 },
          { date: '2024-01-03', newUsers: 38, activeUsers: 245, enrollments: 56 },
          { date: '2024-01-04', newUsers: 61, activeUsers: 289, enrollments: 82 },
          { date: '2024-01-05', newUsers: 47, activeUsers: 256, enrollments: 69 },
          { date: '2024-01-06', newUsers: 55, activeUsers: 278, enrollments: 75 },
          { date: '2024-01-07', newUsers: 43, activeUsers: 234, enrollments: 61 }
        ],
        revenueData: [
          { month: 'Jul', revenue: 3200, enrollments: 145 },
          { month: 'Aug', revenue: 4100, enrollments: 189 },
          { month: 'Sep', revenue: 3800, enrollments: 167 },
          { month: 'Oct', revenue: 5200, enrollments: 234 },
          { month: 'Nov', revenue: 4900, enrollments: 212 },
          { month: 'Dec', revenue: 6100, enrollments: 278 },
          { month: 'Jan', revenue: 7200, enrollments: 324 }
        ]
      };
      
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const handleViewUsers = async (courseId: string) => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('enrollments')
        .select('*')
        .eq('courses', courseId);

      const userList: UserListItem[] = (data ?? []).map(enrollment => ({
        id: enrollment.user_id,
        name: enrollment.user_profiles?.name,
        email: enrollment.user_profiles?.email,
        progress: 0, // Placeholder for progress
        status: 'Completed', // Placeholder for status
        quizScore: 0 // Placeholder for quiz score
      }));

      setUserList(userList);
      setSelectedCourse({ id: courseId, title: analytics?.topCourses.find(c => c.id === courseId)?.title || '' });
      setShowUserModal(true);
    } catch (error) {
      console.error('Error fetching user list:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || userProfile?.role !== 'ADMIN') {
    return (
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
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600">Platform insights and performance metrics</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  View Site
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalStudents.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  {analytics.overview.userGrowth >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  <span className={analytics.overview.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatPercentage(analytics.overview.userGrowth)}
                  </span>
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalEnrollments.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  {analytics.overview.enrollmentGrowth >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  <span className={analytics.overview.enrollmentGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatPercentage(analytics.overview.enrollmentGrowth)}
                  </span>
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.overview.totalRevenue)}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  {analytics.overview.revenueGrowth >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  <span className={analytics.overview.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatPercentage(analytics.overview.revenueGrowth)}
                  </span>
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.completionRate}%</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Target className="h-3 w-3 mr-1" />
                  <span>Course completion</span>
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Quiz Score</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.averageQuizScore}%</p>
                <p className="text-xs text-indigo-600 flex items-center mt-1">
                  <Star className="h-3 w-3 mr-1" />
                  <span>Quiz performance</span>
                </p>
              </div>
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalCourses}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  {analytics.overview.courseGrowth >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  <span className={analytics.overview.courseGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatPercentage(analytics.overview.courseGrowth)}
                  </span>
                </p>
              </div>
              <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analytics.revenueData.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center flex-1">
                  <div className="w-full bg-gray-200 rounded-t relative" style={{ height: '200px' }}>
                    <div 
                      className="bg-blue-500 rounded-t absolute bottom-0 w-full transition-all duration-500"
                      style={{ 
                        height: `${(data.revenue / Math.max(...analytics.revenueData.map(d => d.revenue))) * 100}%` 
                      }}
                    />
                    <div 
                      className="bg-blue-300 rounded-t absolute bottom-0 w-full transition-all duration-500"
                      style={{ 
                        height: `${(data.enrollments / Math.max(...analytics.revenueData.map(d => d.enrollments))) * 50}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2" />
                <span>Revenue</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-300 rounded mr-2" />
                <span>Enrollments</span>
              </div>
            </div>
          </div>

          {/* User Activity Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
              <select className="text-sm border rounded px-2 py-1">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Last year</option>
              </select>
            </div>
            <div className="h-64 flex items-end justify-between space-x-1">
              {analytics.userActivity.map((data, index) => (
                <div key={data.date} className="flex flex-col items-center flex-1">
                  <div className="w-full bg-gray-200 rounded-t relative" style={{ height: '200px' }}>
                    <div 
                      className="bg-green-500 rounded-t absolute bottom-0 w-full transition-all duration-500"
                      style={{ 
                        height: `${(data.newUsers / Math.max(...analytics.userActivity.map(d => d.newUsers))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-2">
                    {new Date(data.date).getDate()}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2" />
                <span>New Users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Courses</h3>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="space-y-4">
            {analytics.topCourses.map((course, index) => (
              <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <Badge variant="secondary">{course.category}</Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating}</span>
                      </div>
                      <span>{course.enrollments} enrollments</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(course.revenue)}</p>
                  <p className="text-sm text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Enrollments</h3>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="space-y-4">
            {analytics.recentEnrollments && analytics.recentEnrollments.length > 0 ? (
              analytics.recentEnrollments.map((enrollment, index) => (
                <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{enrollment.course?.title || 'Course Title'}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{enrollment.user?.name || 'Unknown User'}</span>
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>{enrollment.user?.email || 'No email'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(enrollment.enrolled_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent enrollments</h3>
                <p className="text-gray-600">No new enrollments in the selected time period.</p>
              </div>
            )}
          </div>
        </div>

        {/* Per-Course Analytics Table */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Per-Course Analytics</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Enrollments</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Completion Rate</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg. Quiz Score</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {analytics.topCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">{course.title}</td>
                    <td className="px-4 py-2">{course.enrollments}</td>
                    <td className="px-4 py-2">{formatCurrency(course.revenue)}</td>
                    <td className="px-4 py-2">{course.completionRate ? `${course.completionRate}%` : '—'}</td>
                    <td className="px-4 py-2">{course.avgQuizScore ? `${course.avgQuizScore}%` : '—'}</td>
                    <td className="px-4 py-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewUsers(course.id)}>
                        View Users
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* User Drill-Down Modal */}
          {showUserModal && (
            <Modal onClose={() => setShowUserModal(false)}>
              <h4 className="text-lg font-semibold mb-4">Enrolled Users for {selectedCourse?.title}</h4>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quiz Score</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map((user: UserListItem) => (
                    <tr key={user.id}>
                      <td className="px-4 py-2">{user.name || '—'}</td>
                      <td className="px-4 py-2">{user.email || '—'}</td>
                      <td className="px-4 py-2">{user.progress}%</td>
                      <td className="px-4 py-2">{user.status}</td>
                      <td className="px-4 py-2">{user.quizScore ? `${user.quizScore}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Modal>
          )}
        </div>
      </main>
    </div>
  );
} 