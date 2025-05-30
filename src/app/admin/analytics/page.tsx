'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Download
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalCourses: number;
    totalRevenue: number;
    totalEnrollments: number;
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

export default function Analytics() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || userProfile?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    fetchAnalytics();
  }, [user, userProfile, authLoading, router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const supabase = createClient();
      
      // Fetch overview statistics
      const [
        { count: totalUsers },
        { count: totalCourses },
        { count: totalEnrollments },
        { data: courses },
        { data: enrollments }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select(`
          id,
          title,
          category,
          price,
          enrollments(count)
        `),
        supabase.from('enrollments').select('enrolled_at, courses(price)')
      ]);

      // Calculate total revenue
      const totalRevenue = enrollments?.reduce((sum, enrollment) => {
        const course = Array.isArray(enrollment.courses) ? enrollment.courses[0] : enrollment.courses;
        return sum + (course?.price || 0);
      }, 0) || 0;

      // Get top courses by enrollment
      const topCourses = courses?.map(course => ({
        id: course.id,
        title: course.title,
        category: course.category,
        enrollments: course.enrollments?.[0]?.count || 0,
        revenue: (course.enrollments?.[0]?.count || 0) * (course.price || 0),
        rating: 4.5 + Math.random() * 0.5, // Mock rating for now
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5) || [];

      // Generate mock growth data (in a real app, you'd calculate this from historical data)
      const mockAnalytics: AnalyticsData = {
        overview: {
          totalUsers: totalUsers || 0,
          totalCourses: totalCourses || 0,
          totalRevenue: totalRevenue,
          totalEnrollments: totalEnrollments || 0,
          userGrowth: 12.5, // Mock growth - calculate from historical data
          revenueGrowth: 8.3,
          enrollmentGrowth: 15.2,
          courseGrowth: 4.1
        },
        topCourses: topCourses,
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
      
      setAnalytics(mockAnalytics);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.totalUsers.toLocaleString()}</div>
                <div className="flex items-center text-xs">
                  {analytics.overview.userGrowth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={analytics.overview.userGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {formatPercentage(analytics.overview.userGrowth)}
                  </span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.overview.totalRevenue)}</div>
                <div className="flex items-center text-xs">
                  {analytics.overview.revenueGrowth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={analytics.overview.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {formatPercentage(analytics.overview.revenueGrowth)}
                  </span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.totalEnrollments.toLocaleString()}</div>
                <div className="flex items-center text-xs">
                  {analytics.overview.enrollmentGrowth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={analytics.overview.enrollmentGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {formatPercentage(analytics.overview.enrollmentGrowth)}
                  </span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.totalCourses}</div>
                <div className="flex items-center text-xs">
                  {analytics.overview.courseGrowth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={analytics.overview.courseGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {formatPercentage(analytics.overview.courseGrowth)}
                  </span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue and enrollment growth</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </motion.div>

          {/* User Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Daily new users and activity</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Top Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>Courses ranked by enrollment and revenue</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
} 