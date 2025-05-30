'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Play,
  Pause,
  SkipForward,
  ArrowLeft,
  Award,
  FileText,
  Video,
  Link as LinkIcon,
  Lock,
  Unlock,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Course {
  id: string;
  title: string;
  description: string;
  image?: string;
  category: string;
  level: string;
  duration: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_num: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  content_type: 'VIDEO' | 'TEXT' | 'DOCUMENT' | 'LINK';
  content_url?: string;
  duration_minutes: number;
  order_num: number;
  is_free: boolean;
}

interface LessonProgress {
  id: string;
  lesson_id: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  started_at?: string;
  completed_at?: string;
  time_spent_minutes: number;
}

interface Enrollment {
  id: string;
  status: string;
  progress_percentage: number;
  completed_at?: string;
}

interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  points: number;
}

export default function LearnCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'lesson' | 'quiz'>('lesson');

  const createCourseSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return;
      }
      fetchCourseData();
    }
  }, [user, authLoading, resolvedParams.slug]);

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
        createCourseSlug(c.title) === resolvedParams.slug
      );
      
      if (!foundCourse) {
        setError('Course not found');
        return;
      }
      
      setCourse(foundCourse);

      // Check enrollment
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Authentication required');
        return;
      }

      // Check if user is enrolled
      const enrollmentResponse = await fetch(`/api/courses/${foundCourse.id}/enroll`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (enrollmentResponse.ok) {
        const enrollmentData = await enrollmentResponse.json();
        if (!enrollmentData.enrolled) {
          setError('You are not enrolled in this course');
          return;
        }
        setEnrollment(enrollmentData.enrollment);
      }

      // Fetch modules and lessons
      const modulesResponse = await fetch(`/api/courses/${foundCourse.id}/modules`);
      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json();
        setModules(modulesData);
        
        // Set first lesson as current if available
        if (modulesData.length > 0 && modulesData[0].lessons.length > 0) {
          setCurrentModule(modulesData[0]);
          setCurrentLesson(modulesData[0].lessons[0]);
        }
      }

      // Fetch lesson progress
      await fetchLessonProgress(foundCourse.id, session.access_token);

      // Fetch quiz questions
      await fetchQuizQuestions(foundCourse.id, session.access_token);

    } catch (error) {
      console.error('Error fetching course data:', error);
      setError('Failed to load course. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonProgress = async (courseId: string, token: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLessonProgress(data.progress || []);
      }
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
    }
  };

  const fetchQuizQuestions = async (courseId: string, token: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/quiz`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuizQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!course || !user) return;

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const response = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh lesson progress
        await fetchLessonProgress(course.id, session.access_token);
        
        // Move to next lesson
        const nextLesson = getNextLesson();
        if (nextLesson) {
          setCurrentLesson(nextLesson.lesson);
          setCurrentModule(nextLesson.module);
        }
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const getNextLesson = () => {
    if (!currentModule || !currentLesson) return null;

    const currentModuleIndex = modules.findIndex(m => m.id === currentModule.id);
    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);

    // Check if there's a next lesson in current module
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      return {
        lesson: currentModule.lessons[currentLessonIndex + 1],
        module: currentModule
      };
    }

    // Check if there's a next module
    if (currentModuleIndex < modules.length - 1) {
      const nextModule = modules[currentModuleIndex + 1];
      if (nextModule.lessons.length > 0) {
        return {
          lesson: nextModule.lessons[0],
          module: nextModule
        };
      }
    }

    return null;
  };

  const getLessonProgress = (lessonId: string) => {
    return lessonProgress.find(p => p.lesson_id === lessonId);
  };

  const isLessonCompleted = (lessonId: string) => {
    const progress = getLessonProgress(lessonId);
    return progress?.status === 'COMPLETED';
  };

  const calculateOverallProgress = () => {
    const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0);
    const completedLessons = lessonProgress.filter(p => p.status === 'COMPLETED').length;
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  const renderLessonContent = () => {
    if (!currentLesson) return null;

    const progress = getLessonProgress(currentLesson.id);
    const isCompleted = isLessonCompleted(currentLesson.id);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {currentLesson.duration_minutes} min
              </div>
              <Badge variant={isCompleted ? 'default' : 'secondary'}>
                {isCompleted ? 'Completed' : 'In Progress'}
              </Badge>
            </div>
          </div>
          {!isCompleted && (
            <Button onClick={() => markLessonComplete(currentLesson.id)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark Complete
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            {currentLesson.content_type === 'VIDEO' && currentLesson.content_url && (
              <div className="aspect-video mb-6">
                <iframe
                  src={currentLesson.content_url}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            )}

            {currentLesson.content_type === 'LINK' && currentLesson.content_url && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">External Resource</span>
                </div>
                <a
                  href={currentLesson.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {currentLesson.content_url}
                </a>
              </div>
            )}

            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/courses/${resolvedParams.slug}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course
            </Link>
          </Button>

          {getNextLesson() && (
            <Button onClick={() => {
              const next = getNextLesson();
              if (next) {
                setCurrentLesson(next.lesson);
                setCurrentModule(next.module);
              }
            }}>
              Next Lesson
              <SkipForward className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <BookOpen className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {error}
            </h3>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course?.title}</h1>
              <p className="text-gray-600">{course?.description}</p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {course?.level}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Course Progress</span>
              <span className="font-medium">{calculateOverallProgress()}%</span>
            </div>
            <Progress value={calculateOverallProgress()} className="h-3" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Course Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {modules.map((module) => (
                  <div key={module.id} className="space-y-2">
                    <h4 className="font-semibold text-gray-900">{module.title}</h4>
                    <div className="space-y-1">
                      {module.lessons.map((lesson) => {
                        const isCompleted = isLessonCompleted(lesson.id);
                        const isCurrent = currentLesson?.id === lesson.id;
                        
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setCurrentLesson(lesson);
                              setCurrentModule(module);
                              setActiveTab('lesson');
                            }}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              isCurrent
                                ? 'bg-blue-100 border-2 border-blue-300'
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : lesson.is_free ? (
                                <Unlock className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Lock className="h-4 w-4 text-gray-400" />
                              )}
                              <span className={`text-sm ${isCurrent ? 'font-medium' : ''}`}>
                                {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              {lesson.content_type === 'VIDEO' && <Video className="h-3 w-3" />}
                              {lesson.content_type === 'TEXT' && <FileText className="h-3 w-3" />}
                              {lesson.content_type === 'LINK' && <LinkIcon className="h-3 w-3" />}
                              <span>{lesson.duration_minutes} min</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {quizQuestions.length > 0 && (
                  <div className="pt-4 border-t">
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        activeTab === 'quiz'
                          ? 'bg-purple-100 border-2 border-purple-300'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Course Quiz</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {quizQuestions.length} questions
                      </div>
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'lesson' && (
                <motion.div
                  key="lesson"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {renderLessonContent()}
                </motion.div>
              )}

              {activeTab === 'quiz' && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <QuizComponent 
                    questions={quizQuestions} 
                    courseId={course?.id || ''} 
                    enrollmentId={enrollment?.id || ''}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Quiz Component
function QuizComponent({ 
  questions, 
  courseId, 
  enrollmentId 
}: { 
  questions: QuizQuestion[]; 
  courseId: string; 
  enrollmentId: string; 
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const response = await fetch(`/api/courses/${courseId}/quiz/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId,
          answers
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setScore(result.percentage);
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No quiz available
          </h3>
          <p className="text-gray-600">
            This course doesn't have a quiz yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Award className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Quiz Completed!
          </h3>
          <p className="text-lg text-gray-600 mb-4">
            Your Score: {score}%
          </p>
          <Badge variant={score >= 80 ? 'default' : 'secondary'} className="text-lg px-4 py-2">
            {score >= 80 ? 'Passed' : 'Needs Improvement'}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Course Quiz</h2>
        <Badge variant="outline">
          Question {currentQuestionIndex + 1} of {questions.length}
        </Badge>
      </div>

      <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />

      <Card>
        <CardHeader>
          <CardTitle>{currentQuestion.question_text}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                answers[currentQuestion.id] === option
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {option}
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!answers[currentQuestion.id] || loading}
            >
              {loading ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 