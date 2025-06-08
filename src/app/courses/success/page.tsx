'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, BookOpen, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export default function CourseSuccessPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course_id');
  const sessionId = searchParams.get('session_id');
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

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
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Payment Successful!
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              {course 
                ? `Congratulations! You've successfully enrolled in "${course.title}". You can now start your learning journey.`
                : 'Congratulations! Your payment has been processed successfully.'
              }
            </p>

            {/* Course Details */}
            {course && (
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">{course.title}</h3>
                </div>
                {course.description && (
                  <p className="text-gray-700 text-lg leading-relaxed">{course.description}</p>
                )}
              </div>
            )}

            {/* Benefits Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Certificate Included</h4>
                <p className="text-sm text-gray-600">Get certified upon course completion</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Lifetime Access</h4>
                <p className="text-sm text-gray-600">Access your course materials anytime</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {course && (
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold py-4 px-8 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Link href={`/learn/${createCourseSlug(course.title)}`}>
                    Start Learning
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              )}
              
              <Button
                asChild
                variant="outline"
                className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-semibold py-4 px-8 text-lg rounded-xl transition-all"
              >
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </div>

            {/* Additional Information */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                A confirmation email has been sent to your email address with course details and access instructions.
              </p>
              {sessionId && (
                <p className="text-xs text-gray-400 mt-2">
                  Transaction ID: {sessionId}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 