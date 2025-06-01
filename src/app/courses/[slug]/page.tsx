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
  Brain
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

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

// Scroll-triggered animation hook
function useScrollAnimation() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return { ref, isInView };
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

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

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
        // Redirect to login
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return;
      }

      const response = await fetch(`/api/courses/${course.id}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresPayment) {
          // TODO: Redirect to payment page
          alert('Payment integration coming soon! For now, course enrollment is free.');
          await checkEnrollmentStatus(course.id);
        } else {
          // Free course - enrollment successful
          alert('Successfully enrolled in course!');
          await checkEnrollmentStatus(course.id);
        }
      } else {
        alert(data.message || 'Failed to enroll in course');
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
        {/* Hero Section */}
        <section 
          className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white overflow-hidden"
          style={{ y: heroY }}
        >
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 left-10 w-24 h-24 bg-white/10 rounded-lg blur-lg"></div>
          </div>

          <div className="container mx-auto px-4 py-20 relative z-10">
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {/* Course Info */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Button variant="outline" size="sm" asChild className="text-white border-white/30 hover:bg-white/10">
                    <Link href="/courses">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Courses
                    </Link>
                  </Button>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {course.category}
                  </Badge>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  {course.title}
                </h1>
                
                <p className="text-xl text-blue-100 leading-relaxed">
                  {course.short_desc || course.description}
                </p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    <span>{course.level}</span>
                  </div>
                  {course.duration && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    <span>Certificate Included</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold">
                    {formatPrice(course.price)}
                  </div>
                  {getEnrollmentButton()}
                </div>
              </div>

              {/* Course Image */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
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
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-12">
                {/* Description */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Course Overview</h2>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <p>{course.description}</p>
                  </div>
                </div>

                {/* Course Modules */}
                {modules.length > 0 && (
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Course Curriculum</h2>
                    <div className="space-y-4">
                      {modules.map((module, index) => (
                        <Card key={module.id} className="border-l-4 border-l-blue-500">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>Module {module.order_num}: {module.title}</span>
                              {module.duration && (
                                <Badge variant="outline">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {module.duration}
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>{module.description}</CardDescription>
                          </CardHeader>
                          {module.lessons.length > 0 && (
                            <CardContent>
                              <div className="space-y-2">
                                {module.lessons.map((lesson) => (
                                  <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      {getContentTypeIcon(lesson.content)}
                                      <span className="font-medium">{lesson.title}</span>
                                    </div>
                                    {lesson.duration && (
                                      <span className="text-sm text-gray-500">{lesson.duration}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Course Stats */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Level</span>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>
                      {course.duration && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-medium">{course.duration}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Category</span>
                        <span className="font-medium">{course.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Certificate</span>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>Price</span>
                        <span className="text-blue-600">{formatPrice(course.price)}</span>
                      </div>
                      <div className="pt-4">
                        {getEnrollmentButton()}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* What You'll Learn */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>What You'll Learn</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          'Master the fundamentals and advanced concepts',
                          'Apply knowledge through practical exercises',
                          'Gain industry-recognized certification',
                          'Access to exclusive resources and community',
                          'Lifetime access to course materials'
                        ].map((item, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
} 