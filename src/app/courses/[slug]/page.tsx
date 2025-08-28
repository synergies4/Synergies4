'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/shared/PageLayout';
import CourseROIWidget from '@/components/CourseROIWidget';
import { 
  ArrowLeft,
  ArrowRight, 
  BookOpen, 
  Users, 
  Award, 
  Star,
  CheckCircle,
  Clock,
  Target,
  GraduationCap,
  Loader2,
  Play,
  Download,
  Share2,
  Heart,
  MessageSquare,
  Calendar,
  Globe,
  Zap,
  TrendingUp,
  BarChart3,
  Brain,
  Video,
  Link as LinkIcon,
  File,
  FileText,
  MapPin,
  Home
} from 'lucide-react';

// Interfaces
interface Course {
  id: string;
  title: string;
  description: string;
  short_desc?: string;
  category: string;
  level: string;
  price?: number;
  duration?: string;
  image?: string;
  featured: boolean;
  created_at: string;
  course_type?: string;
  max_participants?: number;
  location?: string;
  instructor_name?: string;
  materials_included?: string;
  prerequisites?: string;
  current_participants?: number;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  video_url?: string;
  order_num: number;
  duration?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_num: number;
  duration?: string;
  video_url?: string;
  content?: string;
  resources?: string;
  lessons: Lesson[];
}

export default function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<{
    enrolled: boolean;
    enrollment: any;
  } | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [slug]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // First, get all courses to find the one with matching slug
      const coursesResponse = await fetch('/api/courses');
      if (!coursesResponse.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const coursesData = await coursesResponse.json();
      const foundCourse = coursesData.courses?.find((c: Course) => 
        createCourseSlug(c.title) === slug
      );
      
      if (!foundCourse) {
        setError('Course not found');
        return;
      }
      
      setCourse(foundCourse);
      
      // Fetch modules for this course
      const modulesResponse = await fetch(`/api/courses/${foundCourse.id}/modules`);
      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json();
        setModules(modulesData);
      }

      // Check enrollment status if user is logged in
      await checkEnrollmentStatus(foundCourse.id);
      
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async (courseId: string) => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setEnrollmentStatus({ enrolled: false, enrollment: null });
        return;
      }

      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEnrollmentStatus(data);
      }
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      setEnrollmentStatus({ enrolled: false, enrollment: null });
    }
  };

  const handleEnrollment = async () => {
    if (!course) return;

    try {
      setEnrolling(true);
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to login with redirect param
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      // If course requires payment, use Stripe checkout
      if (course.price && course.price > 0) {
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId: course.id,
            successUrl: `${process.env.NEXT_PUBLIC_URL || 'https://synergies4.vercel.app'}/courses/success?course_id=${course.id}`,
            cancelUrl: `${process.env.NEXT_PUBLIC_URL || 'https://synergies4.vercel.app'}/courses/${slug}`
          }),
        });

        const checkoutData = await response.json();

        if (response.ok && checkoutData.url) {
          // Redirect to Stripe checkout
          window.location.href = checkoutData.url;
        } else {
          alert(checkoutData.message || 'Failed to create checkout session');
        }
      } else {
        // Free course - use original enrollment flow
        const response = await fetch(`/api/courses/${course.id}/enroll`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          // Create a better success experience
          const successMessage = course.price && course.price > 0 
            ? 'Successfully enrolled! You can now start the course.'
            : 'Successfully enrolled in this free course! You can now start learning.';
          
          // Show success toast instead of alert
          alert(successMessage);
          await checkEnrollmentStatus(course.id);
        } else {
          // Better error handling
          console.error('Enrollment failed:', data);
          const errorMessage = data.message || 'Failed to enroll in course. Please try again.';
          alert(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Failed to enroll in course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const getEnrollmentButton = () => {
    if (loading || !course) return null;

    if (enrollmentStatus?.enrolled) {
      const enrollment = enrollmentStatus.enrollment;
      if (enrollment.status === 'COMPLETED') {
        return (
          <Button size="lg" variant="outline" disabled>
            Course Completed
          </Button>
        );
      } else {
        return (
          <Button size="lg" asChild>
            <Link href={`/learn/${createCourseSlug(course.title)}`}>
              Continue Learning
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        );
      }
    }

    return (
      <Button size="lg" onClick={handleEnrollment} disabled={enrolling}>
        {enrolling ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Enrolling...
          </>
        ) : (
          <>
            Enroll Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
    );
  };

  const createCourseSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Inquire';
    return `$${price.toLocaleString()}`;
  };

  const getDefaultImage = (category: string) => {
    const categoryColors = {
      'Executive': '1e3a8a',
      'Agile': '15803d',
      'Product': '0ea5e9',
      'PQ Skills': '8b5cf6',
      'Leadership': 'ec4899',
      'Business': '6366f1',
      'Technology': 'f59e0b',
      'default': '6b7280'
    };
    
    const color = categoryColors[category as keyof typeof categoryColors] || categoryColors.default;
    const encodedTitle = encodeURIComponent(category);
    return `https://placehold.co/800x400/${color}/FFFFFF/png?text=${encodedTitle}`;
  };

  const getContentTypeIcon = (content: string) => {
    if (content.includes('[VIDEO]')) return <Video className="w-4 h-4" />;
    if (content.includes('[LINK]')) return <LinkIcon className="w-4 h-4" />;
    if (content.includes('[DOCUMENT]')) return <File className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getContentTypeColor = (content: string) => {
    if (content.includes('[VIDEO]')) return 'text-red-600 bg-red-50';
    if (content.includes('[LINK]')) return 'text-blue-600 bg-blue-50';
    if (content.includes('[DOCUMENT]')) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading course...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !course) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Course Not Found</CardTitle>
              <CardDescription className="text-center">
                {error || "The course you're looking for doesn't exist."}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/courses">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Courses
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <main className="min-h-screen">
        {/* Hero Section - Fixed height and no parallax */}
        <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white overflow-hidden min-h-[600px] flex items-center">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
            <div className="absolute bottom-20 left-10 w-24 h-24 bg-white/10 rounded-lg blur-lg animate-float-delayed"></div>
          </div>

          <div className="container mx-auto px-4 py-12 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Course Info */}
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" asChild className="bg-white/90 text-gray-900 border-white/30 hover:bg-white hover:text-gray-900 transition-all duration-300">
                      <Link href="/courses">
                        <ArrowLeft className="w-4 h-4 mr-2 text-gray-900" />
                        <span className="text-gray-900">Back to Courses</span>
                      </Link>
                    </Button>
                    <Badge className="bg-white/20 text-white border-white/30">
                      {course.category}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" asChild className="bg-white/90 text-gray-900 border-white/30 hover:bg-white hover:text-gray-900 transition-all duration-300">
                    <Link href="/">
                      <Home className="w-4 h-4 mr-2 text-gray-900" />
                      <span className="text-gray-900">Home</span>
                    </Link>
                  </Button>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
                  {course.title}
                </h1>
                
                <p className="text-xl text-blue-50 leading-relaxed font-medium">
                  {showFullDescription ? course.description : course.short_desc || course.description}
                </p>

                {/* Read More Button - Only show if there's a meaningful difference */}
                {course.short_desc && course.description && course.short_desc !== course.description && course.description.length > course.short_desc.length + 50 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-blue-200 hover:text-white hover:bg-white/10 p-0 h-auto font-normal underline"
                  >
                    {showFullDescription ? 'Show Less' : 'Read More'}
                  </Button>
                )}

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center bg-white/10 px-3 py-2 text-white rounded-lg">
                    <Target className="w-4 h-4 mr-2" />
                    <span className="text-white">{course.level}</span>
                  </div>
                  {course.duration && (
                    <div className="flex items-center bg-white/10 px-3 py-2 text-white rounded-lg">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-white">{course.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center bg-white/10 px-3 py-2 text-white rounded-lg">
                    <Award className="w-4 h-4 mr-2" />
                    <span className="text-white">Certificate Included</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="text-3xl font-bold">
                    {formatPrice(course.price)}
                  </div>
                  {getEnrollmentButton()}
                </div>
              </div>

              {/* Course Image */}
              <div className="relative animate-fade-in-up animation-delay-200">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <img 
                    src={course.image || getDefaultImage(course.category)}
                    alt={course.title}
                    className="w-full h-80 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getDefaultImage(course.category);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute inset-0 bg-blue-500/10"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Content - Removed sticky behavior */}
        <section className="py-20 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-12">
                {/* Description */}
                <div className="animate-fade-in-up">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Course Overview</h2>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="text-lg leading-relaxed">{course.description}</p>
                  </div>
                </div>

                {/* In-Person Event Details */}
                {course.course_type === 'in_person' && (
                  <div className="animate-fade-in-up animation-delay-150">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Event Details</h2>
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 shadow-lg">
                      <div className="flex items-center mb-6">
                        <Calendar className="h-8 w-8 text-amber-600 mr-3" />
                        <h3 className="text-2xl font-bold text-amber-900">In-Person Event</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {course.location && (
                          <div className="flex items-start space-x-3">
                            <MapPin className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-amber-900 mb-1">Location</h4>
                              <p className="text-amber-800">{course.location}</p>
                            </div>
                          </div>
                        )}
                        
                        {course.instructor_name && (
                          <div className="flex items-start space-x-3">
                            <Users className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-amber-900 mb-1">Instructor</h4>
                              <p className="text-amber-800">{course.instructor_name}</p>
                            </div>
                          </div>
                        )}
                        
                        {course.max_participants && (
                          <div className="flex items-start space-x-3">
                            <Award className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-amber-900 mb-1">Capacity</h4>
                              <p className="text-amber-800">
                                {course.current_participants || 0} / {course.max_participants} participants
                              </p>
                              <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                                <div 
                                  className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${Math.min(100, ((course.current_participants || 0) / course.max_participants) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                              <p className="text-sm text-amber-700 mt-1">
                                {Math.max(0, course.max_participants - (course.current_participants || 0))} spots remaining
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {course.materials_included && (
                          <div className="flex items-start space-x-3">
                            <BookOpen className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-amber-900 mb-1">Materials Included</h4>
                              <p className="text-amber-800">{course.materials_included}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {course.prerequisites && (
                        <div className="mt-6 p-4 bg-amber-100 rounded-lg">
                          <h4 className="font-semibold text-amber-900 mb-2 flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Prerequisites
                          </h4>
                          <p className="text-amber-800">{course.prerequisites}</p>
                        </div>
                      )}
                      
                      <div className="mt-6 p-4 bg-amber-600 text-white rounded-lg">
                        <h4 className="font-semibold mb-2">📅 Event Notice</h4>
                        <p className="text-amber-100">
                          Detailed scheduling information, including exact dates and times, will be sent to registered participants. 
                          Please ensure your contact information is up to date.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Course Modules */}
                {modules.length > 0 && (
                  <div className="animate-fade-in-up animation-delay-200">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Course Curriculum</h2>
                    <div className="space-y-6">
                      {modules.map((module, index) => (
                        <div key={module.id} className="relative group">
                          {/* Glow Effect */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                          
                          {/* Main Module Card */}
                          <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group-hover:scale-105">
                            {/* Module Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                              <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">
                                  Module {module.order_num}: {module.title}
                                </h3>
                                {module.duration && (
                                  <Badge className="bg-white/20 text-white border-white/30">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {module.duration}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-blue-50 mt-2 font-medium leading-relaxed">{module.description}</p>
                            </div>
                            
                            {/* Module Content */}
                            {module.lessons.length > 0 && (
                              <div className="p-6 bg-white/70">
                                <div className="space-y-3">
                                  {module.lessons.map((lesson) => (
                                    <div key={lesson.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105 border border-gray-100">
                                      <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${getContentTypeColor(lesson.content)}`}>
                                          {getContentTypeIcon(lesson.content)}
                                        </div>
                                        <span className="font-medium text-gray-900">{lesson.title}</span>
                                      </div>
                                      {lesson.duration && (
                                        <span className="text-sm text-gray-500 font-medium">{lesson.duration}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* What You'll Learn */}
                <div className="animate-fade-in-up animation-delay-300">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">What You'll Learn</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'Master core concepts and methodologies',
                      'Apply practical skills in real-world scenarios',
                      'Develop strategic thinking capabilities',
                      'Build confidence in your expertise',
                      'Network with industry professionals',
                      'Earn a recognized certification'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar - Fixed positioning removed */}
              <div className="space-y-8">
                {/* ROI Widget */}
                <div className="animate-fade-in-up animation-delay-300">
                  <CourseROIWidget
                    courseId={course.id}
                    courseTitle={course.title}
                    courseCost={course.price || 0}
                    courseDuration={course.duration || ''}
                    courseSkills={course.category ? [course.category, course.level] : []}
                  />
                </div>

                {/* Course Details */}
                <div className="animate-fade-in-up animation-delay-400">
                  <div className="relative group">
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    
                    {/* Main Card */}
                    <div className="relative bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group-hover:scale-105">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-teal-600" />
                        Course Details
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg">
                          <span className="text-gray-700 font-medium">Level</span>
                          <Badge className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0">
                            {course.level}
                          </Badge>
                        </div>
                        
                        {course.duration && (
                          <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg">
                            <span className="text-gray-700 font-medium">Duration</span>
                            <span className="font-semibold text-gray-900">{course.duration}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg">
                          <span className="text-gray-700 font-medium">Category</span>
                          <span className="font-semibold text-teal-700">{course.category}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg">
                          <span className="text-gray-700 font-medium">Certificate</span>
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        
                        <div className="mt-6 p-4 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl text-center">
                          <div className="text-2xl font-bold text-white mb-3">
                            {formatPrice(course.price)}
                          </div>
                          <div className="space-y-3">
                            {getEnrollmentButton()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Features */}
                <div className="animate-fade-in-up animation-delay-500">
                  <div className="relative group">
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    
                    {/* Main Card */}
                    <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group-hover:scale-105">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-blue-600" />
                        Course Features
                      </h3>
                      
                      <div className="space-y-3">
                        {[
                          { icon: <BookOpen className="w-4 h-4" />, text: 'Comprehensive curriculum', color: 'text-blue-600' },
                          { icon: <Users className="w-4 h-4" />, text: 'Expert instructors', color: 'text-emerald-600' },
                          { icon: <Award className="w-4 h-4" />, text: 'Industry certification', color: 'text-teal-600' },
                          { icon: <Clock className="w-4 h-4" />, text: 'Flexible scheduling', color: 'text-cyan-600' },
                          { icon: <Globe className="w-4 h-4" />, text: 'Online access', color: 'text-blue-600' },
                          { icon: <MessageSquare className="w-4 h-4" />, text: 'Community support', color: 'text-emerald-600' }
                        ].map((feature, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg hover:bg-white/90 transition-all">
                            <div className={`${feature.color} p-1 bg-white rounded-lg shadow-sm`}>
                              {feature.icon}
                            </div>
                            <span className="text-gray-700 font-medium">{feature.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
} 