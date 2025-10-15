'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, BookOpen, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface Course {
  id: string;
  title: string;
  description: string;
  image?: string;
}

function createCourseSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function CourseSuccessContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course_id');
  const sessionId = searchParams.get('session_id');
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentReady, setEnrollmentReady] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        
        const { data: courseData, error } = await supabase
          .from('courses')
          .select('id, title, description, image')
          .eq('id', courseId)
          .single();

        if (error) {
          console.error('Error fetching course:', error);
        } else {
          setCourse(courseData);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  // Poll for enrollment creation from Stripe webhook and auto-enable Start Learning
  useEffect(() => {
    let isCancelled = false;
    let attempts = 0;

    const pollEnrollment = async () => {
      if (!courseId) {
        setCheckingEnrollment(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setCheckingEnrollment(false);
          return;
        }

        const res = await fetch(`/api/courses/${courseId}/enroll`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.enrolled) {
            if (!isCancelled) {
              setEnrollmentReady(true);
              setCheckingEnrollment(false);
              // If we already know the course title, redirect straight to learn after a short delay
              if (course) {
                setTimeout(() => {
                  if (!isCancelled) {
                    const slug = createCourseSlug(course.title);
                    window.location.href = `/learn/${slug}`;
                  }
                }, 800);
              }
              return;
            }
          }
        }
      } catch (e) {
        // Ignore and retry
      }

      attempts += 1;
      if (attempts === 4 && !isCancelled) {
        // Midway fallback: call confirm-session to create enrollment if webhook was delayed
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session && sessionId && courseId) {
            await fetch('/api/stripe/confirm-session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ sessionId, courseId }),
            });
          }
        } catch {}
      }

      if (attempts < 8 && !isCancelled) {
        setTimeout(pollEnrollment, 1500); // try for ~12s total
      } else {
        if (!isCancelled) setCheckingEnrollment(false);
      }
    };

    // start polling shortly after mount to give webhook a moment
    const timer = setTimeout(pollEnrollment, 700);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [courseId, course]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-teal-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>

            {/* Success Message */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Payment Successful!
            </h1>

            {/* Action Button */}
            <div className="flex justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold py-4 px-12 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function CourseSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CourseSuccessContent />
    </Suspense>
  );
} 