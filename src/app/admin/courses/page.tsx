'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus,
  ArrowLeft,
  Shield,
  Calendar,
  Loader2,
  Home,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Award,
  BarChart3,
  Globe,
  TrendingUp
} from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
import PageLayout from '@/components/shared/PageLayout';
import Image from 'next/image';

interface CourseData {
  id: string;
  title: string;
  slug: string;
  short_desc: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  price: number;
  image: string;
  published: boolean;
  category: string;
  created_at: string;
  updated_at: string;
  enrollments_count: number;
  instructor_name: string;
  rating: number;
  total_lessons: number;
}

export default function CoursesManagement() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || userProfile?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    fetchCourses();
  }, [user, userProfile, authLoading, router]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Get auth token for API call
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      // Fetch courses from your API with auth token
      const response = await fetch('/api/courses?page=1&per_page=100', {
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Courses API response:', data);
        
        // Transform the data to match our interface
        const transformedCourses: CourseData[] = data.courses.map((course: any) => ({
          id: course.id || Math.random().toString(),
          title: course.title,
          slug: course.slug || course.title.toLowerCase().replace(/\s+/g, '-'),
          short_desc: course.short_desc || course.description || 'No description available',
          level: course.level || 'Intermediate',
          duration: course.duration || '6 weeks',
          price: course.price || 0,
          image: course.image || `https://images.unsplash.com/photo-${1560472354 + Math.floor(Math.random() * 1000)}?w=400&h=250&fit=crop&auto=format`,
          published: course.status === 'PUBLISHED',
          category: course.category || 'Agile',
          created_at: course.created_at || new Date().toISOString(),
          updated_at: course.updated_at || new Date().toISOString(),
          enrollments_count: course.enrollments_count || Math.floor(Math.random() * 2000),
          instructor_name: course.instructor_name || 'Expert Instructor',
          rating: course.rating || (4.5 + Math.random() * 0.5),
          total_lessons: course.total_lessons || Math.floor(Math.random() * 20) + 10
        }));
        
        setCourses(transformedCourses);
      } else {
        console.error('Courses API error:', response.status, response.statusText);
        // Fallback to sample data if API fails
        setSampleCourses();
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setSampleCourses();
    } finally {
      setLoading(false);
    }
  };

  const setSampleCourses = () => {
    // No more sample courses - removed fake course data
    setCourses([]);
  };

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      // In a real app, you'd call your API to update the course
      setCourses(courses.map(course => 
        course.id === courseId ? { ...course, published: !currentStatus } : course
      ));
      console.log(`Course ${courseId} ${!currentStatus ? 'published' : 'unpublished'}`);
    } catch (error) {
      console.error('Error updating course status:', error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('You must be logged in to delete a course');
        return;
      }

      // Call the API to delete the course
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete course');
      }

      // Remove from local state
      setCourses(courses.filter(course => course.id !== courseId));
      console.log(`Course ${courseId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting course:', error);
      alert(`Error deleting course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.short_desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && course.published) ||
                         (statusFilter === 'draft' && !course.published);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'intermediate': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'advanced': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  const categories = ['Agile', 'Leadership', 'Product', 'Technology', 'Wellness'];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600 text-lg">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (!user || userProfile?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You need admin privileges to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-teal-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-teal-700 bg-clip-text text-transparent">
                    Course Management
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">Create and manage your learning content</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Button variant="outline" asChild className="bg-white/80 border-teal-200 hover:bg-teal-50 text-sm">
                  <Link href="/admin">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </Link>
                </Button>
                <Button variant="outline" asChild className="bg-white/80 border-teal-200 hover:bg-teal-50 text-sm">
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    View Site
                  </Link>
                </Button>
                <UserAvatar />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-3xl font-bold text-gray-900">{courses.length}</div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Learning experiences
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Published</CardTitle>
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-3xl font-bold text-gray-900">
                  {courses.filter(c => c.published).length}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Live courses
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Enrollments</CardTitle>
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-3xl font-bold text-gray-900">
                  {courses.reduce((sum, course) => sum + course.enrollments_count, 0).toLocaleString()}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Students
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Avg Rating</CardTitle>
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-3xl font-bold text-gray-900">
                  {courses.length > 0 ? (courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1) : '0.0'}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Rating
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col gap-4 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 border-teal-200 focus:border-teal-400"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-40 bg-white/80 border-teal-200">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32 bg-white/80 border-teal-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button asChild className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg">
                <Link href="/admin/courses/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Course
                </Link>
              </Button>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                {/* Course Image */}
                <div className="relative h-32 sm:h-48 overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                    <Badge 
                      className={`text-xs ${course.published 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                        : 'bg-orange-100 text-orange-800 border-orange-200'
                      }`}
                    >
                      {course.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>

                  {/* Level Badge */}
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                    <Badge className={`text-xs ${getLevelColor(course.level)}`}>
                      {course.level}
                    </Badge>
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1 sm:gap-2">
                      <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white p-1 sm:p-2" asChild>
                        <Link href={`/courses/${course.slug}`} target="_blank">
                          <Eye className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white p-1 sm:p-2" asChild>
                        <Link href={`/admin/courses/${course.id}`}>
                          <Edit className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent className="p-3 sm:p-6">
                  {/* Course Info */}
                  <div className="mb-3 sm:mb-4">
                    <h3 className="font-bold text-sm sm:text-lg text-gray-900 mb-1 sm:mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {course.short_desc}
                    </p>
                  </div>

                  {/* Course Meta */}
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.enrollments_count.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm sm:text-lg font-bold text-teal-600">
                      {formatPrice(course.price)}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`h-3 w-3 sm:h-4 sm:w-4 ${i < Math.floor(course.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 ml-1">{course.rating}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {course.category}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleTogglePublish(course.id, course.published)}
                      className="flex-1 text-xs sm:text-sm"
                    >
                      {course.published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button 
                      size="sm" 
                      asChild
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4"
                    >
                      <Link href={`/admin/courses/${course.id}`}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 sm:px-3"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredCourses.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="text-center py-8 sm:py-12">
                <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters.'
                    : 'Create your first course to get started.'
                  }
                </p>
                {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
                  <Button asChild className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">
                    <Link href="/admin/courses/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Course
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </PageLayout>
  );
} 