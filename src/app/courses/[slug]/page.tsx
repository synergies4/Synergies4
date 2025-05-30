'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Video,
  FileText,
  Link as LinkIcon,
  File,
  Play
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
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
    );
  }

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <motion.nav 
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link href="/">
                <Image 
                  src="/synergies4_logo.jpeg" 
                  alt="Synergies4 Logo" 
                  width={150} 
                  height={72} 
                  className="h-10 w-auto"
                />
              </Link>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              {['About Us', 'Courses', 'Coaching', 'Consulting', 'Industry Insight'].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                >
                  <Link 
                    href={
                      item === 'About Us' ? '/about-us' :
                      item === 'Courses' ? '/courses' :
                      item === 'Coaching' ? '/coaching' : 
                      item === 'Consulting' ? '/consulting' : 
                      item === 'Industry Insight' ? '/industry-insight' :
                      `/${item.toLowerCase().replace(' ', '-')}`
                    } 
                    className={`text-gray-600 hover:text-blue-600 transition-colors font-medium ${
                      item === 'Courses' ? 'text-blue-600 font-semibold' : ''
                    }`}
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 overflow-hidden">
        <motion.div 
          className="container mx-auto px-4"
          style={{ y: heroY }}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Button variant="ghost" asChild className="mb-6">
              <Link href="/courses">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Link>
            </Button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-blue-100 text-blue-700">
                  {course.category}
                </Badge>
                {course.featured && (
                  <Badge className="ml-2 mb-4 bg-yellow-100 text-yellow-700">
                    Featured Course
                  </Badge>
                )}
                
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {course.title}
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {course.short_desc || course.description}
                </p>
                
                <div className="flex flex-wrap gap-4 mb-8">
                  {course.duration && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Target className="w-5 h-5 mr-2" />
                    <span>{course.level}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="w-5 h-5 mr-2" />
                    <span>{modules.length} Modules</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatPrice(course.price)}
                  </div>
                  {getEnrollmentButton()}
                </div>
              </div>
              
              <div className="relative">
                <img 
                  src={course.image || getDefaultImage(course.category)}
                  alt={course.title}
                  className="w-full h-96 object-cover rounded-lg shadow-2xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getDefaultImage(course.category);
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Course Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Course Overview</h2>
                <div className="prose prose-lg max-w-none text-gray-600 mb-12">
                  <p>{course.description}</p>
                </div>

                {/* Course Modules */}
                {modules.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-8">Course Curriculum</h3>
                    <div className="space-y-6">
                      {modules.map((module, index) => (
                        <Card key={module.id} className="border-l-4 border-l-blue-500">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center space-x-3">
                                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                                  Module {module.order_num}
                                </span>
                                <span>{module.title}</span>
                              </CardTitle>
                              {module.duration && (
                                <Badge variant="outline">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {module.duration}
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="mt-2">
                              {module.description}
                            </CardDescription>
                          </CardHeader>
                          
                          {module.lessons.length > 0 && (
                            <CardContent>
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-900 mb-3">
                                  Lessons ({module.lessons.length})
                                </h4>
                                {module.lessons.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className={`p-2 rounded ${getContentTypeColor(lesson.content)}`}>
                                        {getContentTypeIcon(lesson.content)}
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">{lesson.title}</p>
                                        {lesson.duration && (
                                          <p className="text-sm text-gray-600">{lesson.duration}</p>
                                        )}
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      <Play className="w-4 h-4" />
                                    </Button>
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
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="sticky top-24"
              >
                <Card className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {formatPrice(course.price)}
                    </div>
                    {getEnrollmentButton()}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Course Includes:</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        Lifetime access
                      </li>
                      <li className="flex items-center text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        Certificate of completion
                      </li>
                      <li className="flex items-center text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        Expert instructor support
                      </li>
                      <li className="flex items-center text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        Mobile and desktop access
                      </li>
                      {modules.length > 0 && (
                        <li className="flex items-center text-gray-600">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                          {modules.length} comprehensive modules
                        </li>
                      )}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 