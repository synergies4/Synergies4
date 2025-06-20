'use client';

// AI Interview Practice - Comprehensive interview preparation tool
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Clock,
  Brain,
  Target,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Users,
  Briefcase,
  Code,
  MessageSquare,
  Home,
  ArrowLeft,
  Settings,
  Camera,
  Volume2
} from 'lucide-react';

interface InterviewQuestion {
  id: number;
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'company';
  difficulty: 'easy' | 'medium' | 'hard';
  tips: string[];
  followUp?: string[];
}

interface InterviewSession {
  id: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  startTime: Date;
  responses: {
    questionId: number;
    response: string;
    duration: number;
    feedback?: string;
    score?: number;
  }[];
  isRecording: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
}

const defaultQuestions: InterviewQuestion[] = [
  {
    id: 1,
    question: "Tell me about yourself and your background.",
    category: 'behavioral',
    difficulty: 'easy',
    tips: [
      "Keep it concise (2-3 minutes)",
      "Focus on professional experiences",
      "Connect your background to the role",
      "End with why you're interested in this position"
    ]
  },
  {
    id: 2,
    question: "Why are you interested in this position and our company?",
    category: 'company',
    difficulty: 'medium',
    tips: [
      "Research the company beforehand",
      "Mention specific company values or projects",
      "Connect your career goals to the role",
      "Show genuine enthusiasm"
    ]
  },
  {
    id: 3,
    question: "Describe a challenging project you worked on and how you overcame obstacles.",
    category: 'behavioral',
    difficulty: 'medium',
    tips: [
      "Use the STAR method (Situation, Task, Action, Result)",
      "Be specific about your role and actions",
      "Quantify the results if possible",
      "Highlight problem-solving skills"
    ],
    followUp: [
      "What would you do differently if you faced a similar situation again?",
      "How did this experience change your approach to future projects?"
    ]
  },
  {
    id: 4,
    question: "What are your greatest strengths and how do they relate to this role?",
    category: 'behavioral',
    difficulty: 'easy',
    tips: [
      "Choose strengths relevant to the job",
      "Provide specific examples",
      "Connect to how you'll add value",
      "Be authentic and confident"
    ]
  },
  {
    id: 5,
    question: "Where do you see yourself in 5 years?",
    category: 'behavioral',
    difficulty: 'medium',
    tips: [
      "Show ambition but be realistic",
      "Align with company growth opportunities",
      "Focus on skill development",
      "Demonstrate long-term thinking"
    ]
  }
];

export default function AIInterviewPractice() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Interview state
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [responseTime, setResponseTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Settings
  const [interviewType, setInterviewType] = useState('behavioral');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [enableVideo, setEnableVideo] = useState(true);
  const [enableAudio, setEnableAudio] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: enableVideo,
        audio: enableAudio
      });
      setStream(mediaStream);
      
      if (videoRef.current && enableVideo) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      toast.error('Failed to access camera or microphone');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startInterview = async () => {
    setIsLoading(true);
    
    // Filter questions based on settings
    let filteredQuestions = defaultQuestions.filter(q => {
      if (interviewType !== 'all' && q.category !== interviewType) return false;
      if (difficulty !== 'all' && q.difficulty !== difficulty) return false;
      return true;
    });

    // Shuffle and limit questions
    filteredQuestions = filteredQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);

    if (filteredQuestions.length === 0) {
      toast.error('No questions match your criteria. Please adjust your settings.');
      setIsLoading(false);
      return;
    }

    const newSession: InterviewSession = {
      id: `session_${Date.now()}`,
      questions: filteredQuestions,
      currentQuestionIndex: 0,
      startTime: new Date(),
      responses: [],
      isRecording: false,
      videoEnabled: enableVideo,
      audioEnabled: enableAudio
    };

    setSession(newSession);
    await startCamera();
    setIsLoading(false);
    toast.success('Interview started! Take your time to read the first question.');
  };

  const startQuestionTimer = () => {
    setResponseTime(0);
    const interval = setInterval(() => {
      setResponseTime(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopQuestionTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const nextQuestion = () => {
    if (!session) return;

    // Save current response
    if (currentResponse.trim()) {
      const currentQuestion = session.questions[session.currentQuestionIndex];
      const newResponse = {
        questionId: currentQuestion.id,
        response: currentResponse,
        duration: responseTime
      };

      setSession(prev => prev ? {
        ...prev,
        responses: [...prev.responses, newResponse]
      } : null);
    }

    stopQuestionTimer();
    setCurrentResponse('');
    setResponseTime(0);

    if (session.currentQuestionIndex < session.questions.length - 1) {
      setSession(prev => prev ? {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      } : null);
    } else {
      // Interview completed
      completeInterview();
    }
  };

  const completeInterview = () => {
    stopQuestionTimer();
    stopCamera();
    toast.success('Interview completed! Great job!');
  };

  const restartInterview = () => {
    stopQuestionTimer();
    stopCamera();
    setSession(null);
    setCurrentResponse('');
    setResponseTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'behavioral': return <Users className="h-4 w-4" />;
      case 'technical': return <Code className="h-4 w-4" />;
      case 'situational': return <Target className="h-4 w-4" />;
      case 'company': return <Briefcase className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/resume-customizer')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resume Customizer
            </Button>
            <div className="flex items-center gap-3">
              <Video className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Interview Practice</h1>
                <p className="text-gray-600">Practice interviews with AI-powered feedback</p>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </div>

        {!session ? (
          /* Setup Screen */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Interview Settings
                </CardTitle>
                <CardDescription>
                  Customize your practice session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="interview-type">Interview Type</Label>
                  <Select value={interviewType} onValueChange={setInterviewType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="situational">Situational</SelectItem>
                      <SelectItem value="company">Company-Specific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="question-count">Number of Questions</Label>
                  <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Questions</SelectItem>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Media Settings</Label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      <span>Enable Video</span>
                    </div>
                    <Button
                      variant={enableVideo ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEnableVideo(!enableVideo)}
                    >
                      {enableVideo ? 'On' : 'Off'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <span>Enable Audio</span>
                    </div>
                    <Button
                      variant={enableAudio ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEnableAudio(!enableAudio)}
                    >
                      {enableAudio ? 'On' : 'Off'}
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={startInterview} 
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Preparing...' : 'Start Interview Practice'}
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  What to Expect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Realistic Practice</h4>
                      <p className="text-sm text-gray-600">Experience real interview conditions with timed questions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Video Recording</h4>
                      <p className="text-sm text-gray-600">Practice with video to improve your presentation skills</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Expert Tips</h4>
                      <p className="text-sm text-gray-600">Get guidance on how to structure your answers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Progress Tracking</h4>
                      <p className="text-sm text-gray-600">Monitor your improvement over multiple sessions</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Pro Tip</h4>
                  <p className="text-sm text-blue-800">
                    Treat this like a real interview. Dress professionally, sit up straight, 
                    and maintain eye contact with the camera for the best practice experience.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Interview Screen */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video/Camera Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Interview Session
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono">{formatTime(responseTime)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Progress 
                      value={(session.currentQuestionIndex / session.questions.length) * 100} 
                      className="flex-1 mr-4"
                    />
                    <span className="text-sm text-gray-600">
                      {session.currentQuestionIndex + 1} of {session.questions.length}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Video Preview */}
                  {enableVideo && (
                    <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Current Question */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      {getCategoryIcon(session.questions[session.currentQuestionIndex].category)}
                      <Badge className={getDifficultyColor(session.questions[session.currentQuestionIndex].difficulty)}>
                        {session.questions[session.currentQuestionIndex].difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {session.questions[session.currentQuestionIndex].category}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {session.questions[session.currentQuestionIndex].question}
                    </h3>
                  </div>

                  {/* Response Area */}
                  <div>
                    <Label htmlFor="response">Your Response</Label>
                    <Textarea
                      id="response"
                      value={currentResponse}
                      onChange={(e) => setCurrentResponse(e.target.value)}
                      placeholder="Type your response here or speak aloud if audio is enabled..."
                      className="mt-2 min-h-[120px]"
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={startQuestionTimer}
                        disabled={timerInterval !== null}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Timer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={stopQuestionTimer}
                        disabled={timerInterval === null}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={restartInterview}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restart
                      </Button>
                      <Button onClick={nextQuestion}>
                        {session.currentQuestionIndex < session.questions.length - 1 ? 'Next Question' : 'Complete Interview'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tips and Progress */}
            <div className="space-y-6">
              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Tips for This Question
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {session.questions[session.currentQuestionIndex].tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Question Queue */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Upcoming Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {session.questions.slice(session.currentQuestionIndex + 1, session.currentQuestionIndex + 4).map((question, index) => (
                      <div key={question.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-600">
                            Question {session.currentQuestionIndex + index + 2}
                          </span>
                          <Badge size="sm" className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-800 line-clamp-2">
                          {question.question}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Session Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Questions Completed</span>
                    <span>{session.responses.length} / {session.questions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Response Time</span>
                    <span>
                      {session.responses.length > 0 
                        ? formatTime(Math.round(session.responses.reduce((acc, r) => acc + r.duration, 0) / session.responses.length))
                        : '0:00'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Session Duration</span>
                    <span>{formatTime(Math.floor((Date.now() - session.startTime.getTime()) / 1000))}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 