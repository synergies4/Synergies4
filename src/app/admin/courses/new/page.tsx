'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft,
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  BookOpen,
  Clock,
  Users,
  DollarSign,
  Target,
  Award,
  Loader2,
  X,
  Edit,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Video,
  Link as LinkIcon,
  FileText,
  CheckCircle,
  Eye,
  Sparkles,
  Brain,
  Lightbulb,
  Copy,
  Image as ImageIcon,
  Play,
  TrendingUp
} from 'lucide-react';

interface ModuleContent {
  id: string;
  type: 'video' | 'link' | 'document' | 'text';
  title: string;
  content: string; // URL for video/link/document, text content for text
  description?: string;
  order: number;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  contents: ModuleContent[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
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

interface CourseFormData {
  title: string;
  description: string;
  shortDesc: string;
  category: string;
  level: string;
  price: string;
  duration: string;
  status: string;
  image: string;
  featured: boolean;
  modules: CourseModule[];
  quiz?: Quiz;
}

export default function CreateCourse() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newModule, setNewModule] = useState({ title: '', description: '' });
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [newContent, setNewContent] = useState({
    type: 'video' as 'video' | 'link' | 'document' | 'text',
    title: '',
    content: '',
    description: ''
  });
  
  // AI Assistant State
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiMode, setAiMode] = useState('description');
  const [aiContext, setAiContext] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [moduleAiSuggestions, setModuleAiSuggestions] = useState<{[key: string]: any}>({});
  const [showModuleAI, setShowModuleAI] = useState<{[key: string]: boolean}>({});
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    shortDesc: '',
    category: '',
    level: '',
    price: '',
    duration: '',
    status: 'DRAFT',
    image: '',
    featured: false,
    modules: []
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || userProfile?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
  }, [user, userProfile, authLoading, router]);

  const handleInputChange = (field: keyof CourseFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addModule = () => {
    if (newModule.title.trim()) {
      const module: CourseModule = {
        id: Date.now().toString(),
        title: newModule.title,
        description: newModule.description,
        order: formData.modules.length + 1,
        contents: []
      };
      setFormData(prev => ({
        ...prev,
        modules: [...prev.modules, module]
      }));
      setNewModule({ title: '', description: '' });
    }
  };

  const removeModule = (moduleId: string) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== moduleId)
    }));
  };

  const addContentToModule = (moduleId: string) => {
    if (newContent.title.trim() && newContent.content.trim()) {
      const content: ModuleContent = {
        id: Date.now().toString(),
        type: newContent.type,
        title: newContent.title,
        content: newContent.content,
        description: newContent.description,
        order: 1
      };

      setFormData(prev => ({
        ...prev,
        modules: prev.modules.map(module => {
          if (module.id === moduleId) {
            const newContents = [...module.contents, content];
            // Update order for all contents
            newContents.forEach((c, index) => {
              c.order = index + 1;
            });
            return { ...module, contents: newContents };
          }
          return module;
        })
      }));

      setNewContent({
        type: 'video',
        title: '',
        content: '',
        description: ''
      });
      setEditingModule(null);
    }
  };

  const removeContentFromModule = (moduleId: string, contentId: string) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            contents: module.contents.filter(content => content.id !== contentId)
          };
        }
        return module;
      })
    }));
  };

  const addQuiz = () => {
    const quiz: Quiz = {
      id: Date.now().toString(),
      title: 'Course Quiz',
      description: 'Test your knowledge',
      questions: []
    };
    setFormData(prev => ({ ...prev, quiz }));
  };

  const addQuizQuestion = () => {
    if (!formData.quiz) return;

    const question: QuizQuestion = {
      id: Date.now().toString(),
      question_text: '',
      question_type: 'MULTIPLE_CHOICE',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: '',
      points: 1
    };

    setFormData(prev => ({
      ...prev,
      quiz: prev.quiz ? {
        ...prev.quiz,
        questions: [...prev.quiz.questions, question]
      } : undefined
    }));
  };

  const updateQuizQuestion = (questionId: string, field: string, value: any) => {
    if (!formData.quiz) return;

    setFormData(prev => ({
      ...prev,
      quiz: prev.quiz ? {
        ...prev.quiz,
        questions: prev.quiz.questions.map(q => 
          q.id === questionId ? { ...q, [field]: value } : q
        )
      } : undefined
    }));
  };

  const removeQuizQuestion = (questionId: string) => {
    if (!formData.quiz) return;

    setFormData(prev => ({
      ...prev,
      quiz: prev.quiz ? {
        ...prev.quiz,
        questions: prev.quiz.questions.filter(q => q.id !== questionId)
      } : undefined
    }));
  };

  // AI Assistant Functions
  const generateAISuggestions = async () => {
    if (!formData.title && aiMode !== 'title') {
      alert('Please enter a course title first');
      return;
    }

    setAiLoading(true);
    try {
      let prompt = '';
      
      switch (aiMode) {
        case 'title':
          prompt = `Generate 5 compelling course titles for a ${formData.category || 'general'} course at ${formData.level || 'beginner'} level. Context: ${aiContext}. Make them engaging and SEO-friendly.`;
          break;
        case 'description':
          prompt = `Create a comprehensive course description for "${formData.title}" - a ${formData.category} course for ${formData.level} level students. Include learning objectives, what students will gain, and why they should take this course. Context: ${aiContext}`;
          break;
        case 'modules':
          prompt = `Create a detailed module structure for the course "${formData.title}" (${formData.category}, ${formData.level} level). Include 6-8 modules with titles, descriptions, and learning objectives. Format as JSON with this structure:
          {
            "modules": [
              {
                "title": "Module Title",
                "description": "Module description",
                "learningObjectives": ["Objective 1", "Objective 2"],
                "estimatedDuration": "2 hours"
              }
            ]
          }
          Context: ${aiContext}`;
          break;
        case 'quiz':
          prompt = `Generate 10 quiz questions for the course "${formData.title}" (${formData.category}, ${formData.level} level). Include multiple choice, true/false, and short answer questions. Format as JSON:
          {
            "questions": [
              {
                "question": "Question text",
                "type": "MULTIPLE_CHOICE",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "correctAnswer": "Option 1",
                "explanation": "Why this is correct",
                "points": 5
              }
            ]
          }
          Context: ${aiContext}`;
          break;
        case 'content':
          prompt = `Suggest specific content ideas for the course "${formData.title}" including:
          1. Video topics and scripts
          2. Interactive exercises
          3. Real-world projects
          4. Reading materials
          5. Practical assignments
          6. Case studies
          Context: ${aiContext}`;
          break;
        case 'pricing':
          prompt = `Suggest appropriate pricing for the course "${formData.title}" (${formData.category}, ${formData.level} level). Consider market rates, course value, target audience, and competition. Provide 3 pricing options with justification.`;
          break;
        case 'marketing':
          prompt = `Create marketing copy for the course "${formData.title}" including:
          1. Compelling tagline
          2. Key selling points
          3. Target audience description
          4. Social media posts
          5. Email marketing subject lines
          Context: ${aiContext}`;
          break;
        default:
          prompt = `Provide suggestions for improving the course "${formData.title}" in the ${formData.category} category.`;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are an expert course creation assistant. Provide detailed, actionable suggestions for online course development.' },
            { role: 'user', content: prompt }
          ],
          provider: 'anthropic'
        }),
      });

      if (!response.ok) throw new Error('Failed to generate suggestions');
      
      const data = await response.json();
      setAiSuggestions(data.content || data.response);
    } catch (error) {
      console.error('AI Generation Error:', error);
      alert('Failed to generate AI suggestions. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const generateModuleContent = async (moduleId: string, contentType: 'video' | 'text' | 'exercise' | 'image') => {
    const module = formData.modules.find(m => m.id === moduleId);
    if (!module) return;

    setAiLoading(true);
    try {
      let prompt = '';
      
      switch (contentType) {
        case 'video':
          prompt = `Create a detailed video script for the module "${module.title}" in the course "${formData.title}". Include:
          1. Video title and description
          2. Detailed script with timestamps
          3. Key points to emphasize
          4. Visual suggestions
          5. Recommended video length
          6. Equipment/setup recommendations`;
          break;
        case 'text':
          prompt = `Create comprehensive text content for the module "${module.title}" in the course "${formData.title}". Include:
          1. Detailed explanations
          2. Examples and case studies
          3. Key takeaways
          4. Action items
          5. Further reading suggestions`;
          break;
        case 'exercise':
          prompt = `Design interactive exercises for the module "${module.title}" in the course "${formData.title}". Include:
          1. Hands-on activities
          2. Practice problems
          3. Real-world scenarios
          4. Group exercises
          5. Self-assessment tools`;
          break;
        case 'image':
          prompt = `Suggest visual content for the module "${module.title}" in the course "${formData.title}". Include:
          1. Infographic ideas
          2. Diagram suggestions
          3. Image prompts for AI generation
          4. Chart and graph recommendations
          5. Visual metaphors and illustrations`;
          break;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are an expert instructional designer. Create detailed, engaging educational content.' },
            { role: 'user', content: prompt }
          ],
          provider: 'anthropic'
        }),
      });

      if (!response.ok) throw new Error('Failed to generate content');
      
      const data = await response.json();
      setModuleAiSuggestions(prev => ({
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          [contentType]: data.content || data.response
        }
      }));
    } catch (error) {
      console.error('Content Generation Error:', error);
      alert('Failed to generate content suggestions. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const generateImagePrompt = async (description: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are an expert at creating detailed image prompts for AI image generation. Create specific, detailed prompts that will generate high-quality educational images.' },
            { role: 'user', content: `Create a detailed image generation prompt for: ${description}. Make it specific, include style, composition, colors, and educational context.` }
          ],
          provider: 'anthropic'
        }),
      });

      if (!response.ok) throw new Error('Failed to generate image prompt');
      
      const data = await response.json();
      return data.content || data.response;
    } catch (error) {
      console.error('Image Prompt Generation Error:', error);
      return description;
    }
  };

  const generateCourseImage = async () => {
    if (!formData.title) {
      alert('Please enter a course title first');
      return;
    }

    setAiLoading(true);
    try {
      // First generate a detailed prompt
      const imagePrompt = await generateImagePrompt(`Professional course thumbnail for "${formData.title}" - ${formData.category} course`);
      
      // Then generate the image
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          provider: 'openai'
        }),
      });

      if (!response.ok) throw new Error('Failed to generate image');
      
      const data = await response.json();
      if (data.imageUrl) {
        handleInputChange('image', data.imageUrl);
        alert('Course image generated successfully!');
      }
    } catch (error) {
      console.error('Image Generation Error:', error);
      alert('Failed to generate course image. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestion = (field: string) => {
    if (!aiSuggestions) return;
    
    switch (field) {
      case 'description':
        handleInputChange('description', aiSuggestions);
        break;
      case 'shortDesc':
        // Extract first paragraph or first 200 characters for short description
        const shortDesc = aiSuggestions.split('\n')[0].substring(0, 200) + '...';
        handleInputChange('shortDesc', shortDesc);
        break;
      case 'title':
        // If multiple titles are suggested, use the first one
        const titles = aiSuggestions.split('\n').filter(line => line.trim());
        if (titles.length > 0) {
          handleInputChange('title', titles[0].replace(/^\d+\.\s*/, ''));
        }
        break;
      case 'modules':
        try {
          const moduleData = JSON.parse(aiSuggestions);
          if (moduleData.modules) {
            const newModules = moduleData.modules.map((mod: any, index: number) => ({
              id: Date.now().toString() + index,
              title: mod.title,
              description: mod.description,
              order: index + 1,
              contents: []
            }));
            setFormData(prev => ({ ...prev, modules: newModules }));
          }
        } catch (error) {
          console.error('Failed to parse module data:', error);
          alert('Failed to apply module suggestions. Please copy and paste manually.');
        }
        break;
      case 'quiz':
        try {
          const quizData = JSON.parse(aiSuggestions);
          if (quizData.questions) {
            const newQuiz = {
              id: Date.now().toString(),
              title: `${formData.title} Quiz`,
              description: 'Test your knowledge',
              questions: quizData.questions.map((q: any, index: number) => ({
                id: Date.now().toString() + index,
                question_text: q.question,
                question_type: q.type,
                options: q.options || [],
                correct_answer: q.correctAnswer,
                explanation: q.explanation,
                points: q.points || 5
              }))
            };
            setFormData(prev => ({ ...prev, quiz: newQuiz }));
          }
        } catch (error) {
          console.error('Failed to parse quiz data:', error);
          alert('Failed to apply quiz suggestions. Please copy and paste manually.');
        }
        break;
    }
    
    setShowAIAssistant(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSubmit = async (status: string) => {
    setLoading(true);
    try {
      // Get the current session for authentication
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('You must be logged in to create a course');
        return;
      }

      const courseData = {
        title: formData.title,
        description: formData.description,
        shortDesc: formData.shortDesc,
        category: formData.category,
        level: formData.level,
        price: formData.price ? parseFloat(formData.price) : null,
        duration: formData.duration,
        status: status,
        image: formData.image || null,
        featured: formData.featured
      };
      
      // Create course via API with authentication header
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create course');
      }

      const course = await response.json();
      console.log('Course created:', course);

      // Create modules and their contents
      if (formData.modules.length > 0) {
        for (const module of formData.modules) {
          try {
            const moduleResponse = await fetch(`/api/courses/${course.id}/modules`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                title: module.title,
                description: module.description,
                order: module.order,
                contents: module.contents
              }),
            });

            if (!moduleResponse.ok) {
              console.error('Failed to create module:', module.title);
            } else {
              console.log('Module created:', module.title);
            }
          } catch (moduleError) {
            console.error('Error creating module:', moduleError);
          }
        }
      }

      // Create quiz if exists
      if (formData.quiz && formData.quiz.questions.length > 0) {
        try {
          const quizResponse = await fetch(`/api/courses/${course.id}/quiz`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              questions: formData.quiz.questions
            }),
          });

          if (!quizResponse.ok) {
            const errorData = await quizResponse.json();
            console.error('Failed to create quiz:', errorData.message);
          } else {
            console.log('Quiz created successfully');
          }
        } catch (quizError) {
          console.error('Error creating quiz:', quizError);
        }
      }
      
      // Redirect to admin dashboard
      router.push('/admin');
    } catch (error) {
      console.error('Error creating course:', error);
      alert(`Error creating course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Course title, description, and category' },
    { number: 2, title: 'Details', description: 'Pricing, level, and duration' },
    { number: 3, title: 'Content', description: 'Modules and course structure' },
    { number: 4, title: 'Quiz', description: 'Optional course quiz' },
    { number: 5, title: 'Review', description: 'Review and publish' }
  ];

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'link': return <LinkIcon className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || userProfile?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Optimized Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Create Course</h1>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Add a new course to your platform</p>
              </div>
            </div>
            <div className="flex space-x-2 sm:space-x-3">
              <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                <Link href="/admin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back to Admin</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {/* Mobile-Optimized Progress Steps */}
        <div className="mb-6 sm:mb-8">
          {/* Mobile: Horizontal Scrollable Steps */}
          <div className="block sm:hidden">
            <div className="flex items-center space-x-4 overflow-x-auto pb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-shrink-0">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm ${
                    currentStep >= step.number 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step.number ? <CheckCircle className="w-4 h-4" /> : step.number}
                  </div>
                  <div className="ml-2 min-w-0">
                    <p className={`text-xs font-medium truncate ${
                      currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-3 ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Full Steps Display */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Steps */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="title" className="text-sm font-medium">Course Title *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAiMode('title');
                          setShowAIAssistant(true);
                        }}
                        className="text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Suggest
                      </Button>
                    </div>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter course title"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAiMode('category');
                          setShowAIAssistant(true);
                        }}
                        className="text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Suggest
                      </Button>
                    </div>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agile">Agile & Scrum</SelectItem>
                        <SelectItem value="leadership">Leadership</SelectItem>
                        <SelectItem value="product">Product Management</SelectItem>
                        <SelectItem value="mental-fitness">Mental Fitness</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description" className="text-sm font-medium">Course Description *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAiMode('description');
                        setShowAIAssistant(true);
                      }}
                      className="text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Generate
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what students will learn in this course"
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shortDesc" className="text-sm font-medium">Short Description</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAiMode('shortDesc');
                        setShowAIAssistant(true);
                      }}
                      className="text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Generate
                    </Button>
                  </div>
                  <Textarea
                    id="shortDesc"
                    value={formData.shortDesc}
                    onChange={(e) => handleInputChange('shortDesc', e.target.value)}
                    placeholder="Brief description for course cards"
                    className="mt-2"
                    rows={2}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="image" className="text-sm font-medium">Course Image URL</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateCourseImage}
                        disabled={aiLoading}
                        className="text-xs"
                      >
                        {aiLoading ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <ImageIcon className="w-3 h-3 mr-1" />
                        )}
                        AI Generate
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAiMode('imageIdeas');
                          setShowAIAssistant(true);
                        }}
                        className="text-xs"
                      >
                        <Lightbulb className="w-3 h-3 mr-1" />
                        Ideas
                      </Button>
                    </div>
                  </div>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="Enter image URL or generate with AI"
                    className="mt-2"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img 
                        src={formData.image} 
                        alt="Course preview" 
                        className="w-32 h-20 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="level" className="text-sm font-medium">Level *</Label>
                    <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration" className="text-sm font-medium">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="e.g., 4 weeks, 20 hours"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-sm font-medium">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      className="mt-2"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="image" className="text-sm font-medium">Course Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="featured" className="text-sm font-medium">Featured Course</Label>
                </div>
              </div>
            )}

            {/* Step 3: Modules */}
            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-lg font-semibold">Course Modules</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setAiMode('modules');
                        setShowAIAssistant(true);
                      }}
                      className="text-sm"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Generate Modules
                    </Button>
                    <Button onClick={addModule} className="text-sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Module
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.modules.map((module, index) => (
                    <Card key={module.id}>
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <CardTitle className="text-base">Module {index + 1}</CardTitle>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowModuleAI(prev => ({
                                ...prev,
                                [module.id]: !prev[module.id]
                              }))}
                              className="text-xs"
                            >
                              <Brain className="w-3 h-3 mr-1" />
                              AI Assist
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeModule(module.id)}
                              className="text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Module Title</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => generateModuleContent(module.id, 'text')}
                              disabled={aiLoading}
                              className="text-xs"
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Suggest
                            </Button>
                          </div>
                          <Input
                            value={module.title}
                            onChange={(e) => {
                              const updatedModules = formData.modules.map(m =>
                                m.id === module.id ? { ...m, title: e.target.value } : m
                              );
                              setFormData(prev => ({ ...prev, modules: updatedModules }));
                            }}
                            placeholder="Enter module title"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Module Description</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => generateModuleContent(module.id, 'text')}
                              disabled={aiLoading}
                              className="text-xs"
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Generate
                            </Button>
                          </div>
                          <Textarea
                            value={module.description}
                            onChange={(e) => {
                              const updatedModules = formData.modules.map(m =>
                                m.id === module.id ? { ...m, description: e.target.value } : m
                              );
                              setFormData(prev => ({ ...prev, modules: updatedModules }));
                            }}
                            placeholder="Describe what this module covers"
                            className="mt-2"
                            rows={3}
                          />
                        </div>

                        {/* AI Assistant Panel for Module */}
                        {showModuleAI[module.id] && (
                          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm text-purple-800">AI Content Assistant</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generateModuleContent(module.id, 'video')}
                                  disabled={aiLoading}
                                  className="text-xs"
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  Video Script
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generateModuleContent(module.id, 'text')}
                                  disabled={aiLoading}
                                  className="text-xs"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Text Content
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generateModuleContent(module.id, 'exercise')}
                                  disabled={aiLoading}
                                  className="text-xs"
                                >
                                  <Target className="w-3 h-3 mr-1" />
                                  Exercises
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generateModuleContent(module.id, 'image')}
                                  disabled={aiLoading}
                                  className="text-xs"
                                >
                                  <ImageIcon className="w-3 h-3 mr-1" />
                                  Visuals
                                </Button>
                              </div>

                              {/* Display AI Suggestions for this module */}
                              {moduleAiSuggestions[module.id] && (
                                <div className="space-y-2">
                                  {Object.entries(moduleAiSuggestions[module.id]).map(([type, content]) => (
                                    <div key={type} className="bg-white rounded p-3 border">
                                      <div className="flex items-center justify-between mb-2">
                                        <h5 className="text-sm font-medium capitalize">{type} Suggestions</h5>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => copyToClipboard(content as string)}
                                          className="text-xs"
                                        >
                                          <Copy className="w-3 h-3 mr-1" />
                                          Copy
                                        </Button>
                                      </div>
                                      <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                                        <pre className="whitespace-pre-wrap">{content as string}</pre>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Module Content */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-sm font-medium">Module Content</Label>
                            <span className="text-xs text-gray-500">{module.contents.length} items</span>
                          </div>
                          
                          {module.contents.map((content, contentIndex) => (
                            <div key={content.id} className="flex items-center justify-between p-3 bg-gray-50 rounded mb-2">
                              <div className="flex items-center space-x-3">
                                {getContentIcon(content.type)}
                                <div>
                                  <p className="text-sm font-medium">{content.title}</p>
                                  <p className="text-xs text-gray-500">{content.type}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeContentFromModule(module.id, content.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        {editingModule === module.id ? (
                          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-sm font-medium">Content Type</Label>
                                <Select 
                                  value={newContent.type} 
                                  onValueChange={(value) => setNewContent(prev => ({ ...prev, type: value as any }))}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="text">Text Content</SelectItem>
                                    <SelectItem value="document">Document</SelectItem>
                                    <SelectItem value="link">External Link</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Content Title</Label>
                                <Input
                                  value={newContent.title}
                                  onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                                  placeholder="Enter content title"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">
                                {newContent.type === 'text' ? 'Content' : 'URL'}
                              </Label>
                              {newContent.type === 'text' ? (
                                <Textarea
                                  value={newContent.content}
                                  onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
                                  placeholder="Enter text content"
                                  className="mt-2"
                                  rows={4}
                                />
                              ) : (
                                <Input
                                  value={newContent.content}
                                  onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
                                  placeholder="Enter URL"
                                  className="mt-2"
                                />
                              )}
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Description (Optional)</Label>
                              <Textarea
                                value={newContent.description}
                                onChange={(e) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter content description"
                                className="mt-2"
                                rows={2}
                              />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button onClick={() => addContentToModule(module.id)} className="flex-1 sm:flex-none">
                                Add Content
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setEditingModule(null)}
                                className="flex-1 sm:flex-none"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => setEditingModule(module.id)}
                            className="w-full sm:w-auto"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Content
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Quiz */}
            {currentStep === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-lg font-semibold">Course Quiz (Optional)</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAiMode('quiz');
                      setShowAIAssistant(true);
                    }}
                    className="text-sm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Generate Quiz
                  </Button>
                </div>

                {!formData.quiz ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium mb-2">No Quiz Added</h4>
                      <p className="text-gray-600 mb-4">Add a quiz to test your students' knowledge</p>
                      <Button onClick={addQuiz}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Quiz
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Quiz Questions</CardTitle>
                        <CardDescription>
                          Add questions to test student understanding
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={addQuizQuestion} className="w-full sm:w-auto mb-4">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Question
                        </Button>

                        {formData.quiz.questions.map((question, index) => (
                          <Card key={question.id} className="mb-4">
                            <CardHeader className="pb-3">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <CardTitle className="text-sm">Question {index + 1}</CardTitle>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeQuizQuestion(question.id)}
                                  className="self-start sm:self-auto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Question Text</Label>
                                <Textarea
                                  value={question.question_text}
                                  onChange={(e) => updateQuizQuestion(question.id, 'question_text', e.target.value)}
                                  placeholder="Enter your question"
                                  className="mt-2"
                                  rows={3}
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Question Type</Label>
                                  <Select 
                                    value={question.question_type} 
                                    onValueChange={(value) => updateQuizQuestion(question.id, 'question_type', value)}
                                  >
                                    <SelectTrigger className="mt-2">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                      <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                                      <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Points</Label>
                                  <Input
                                    type="number"
                                    value={question.points}
                                    onChange={(e) => updateQuizQuestion(question.id, 'points', parseInt(e.target.value) || 1)}
                                    className="mt-2"
                                    min="1"
                                  />
                                </div>
                              </div>

                              {question.question_type === 'MULTIPLE_CHOICE' && (
                                <div>
                                  <Label className="text-sm font-medium">Answer Options</Label>
                                  <div className="space-y-2 mt-2">
                                    {question.options.map((option, optionIndex) => (
                                      <Input
                                        key={optionIndex}
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [...question.options];
                                          newOptions[optionIndex] = e.target.value;
                                          updateQuizQuestion(question.id, 'options', newOptions);
                                        }}
                                        placeholder={`Option ${optionIndex + 1}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                <Label className="text-sm font-medium">Correct Answer</Label>
                                <Input
                                  value={question.correct_answer}
                                  onChange={(e) => updateQuizQuestion(question.id, 'correct_answer', e.target.value)}
                                  placeholder="Enter the correct answer"
                                  className="mt-2"
                                />
                              </div>

                              <div>
                                <Label className="text-sm font-medium">Explanation (Optional)</Label>
                                <Textarea
                                  value={question.explanation || ''}
                                  onChange={(e) => updateQuizQuestion(question.id, 'explanation', e.target.value)}
                                  placeholder="Explain why this is the correct answer"
                                  className="mt-2"
                                  rows={2}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Review & Publish</h3>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Course Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Title</Label>
                          <p className="font-medium">{formData.title || 'Not set'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Category</Label>
                          <p className="font-medium">{formData.category || 'Not set'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Level</Label>
                          <p className="font-medium">{formData.level || 'Not set'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Price</Label>
                          <p className="font-medium">{formData.price ? `$${formData.price}` : 'Free'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Duration</Label>
                          <p className="font-medium">{formData.duration || 'Not set'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Status</Label>
                          <Badge variant={formData.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                            {formData.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Description</Label>
                        <p className="text-sm mt-1">{formData.description || 'No description provided'}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Modules</Label>
                        <p className="text-sm mt-1">{formData.modules.length} modules created</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Quiz</Label>
                        <p className="text-sm mt-1">
                          {formData.quiz ? `${formData.quiz.questions.length} questions` : 'No quiz added'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                      onClick={() => handleSubmit('DRAFT')}
                      disabled={loading}
                      variant="outline"
                      className="flex-1"
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save as Draft
                    </Button>
                    <Button
                      onClick={() => handleSubmit('PUBLISHED')}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                      Publish Course
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile-Optimized Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex-1 sm:flex-none"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          
          <Button
            onClick={nextStep}
            disabled={currentStep === steps.length}
            className="flex-1 sm:flex-none"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* AI Assistant Floating Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setShowAIAssistant(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full w-14 h-14"
            size="lg"
          >
            <Sparkles className="w-6 h-6" />
          </Button>
        </div>
      </main>

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Brain className="w-6 h-6" />
                  <div>
                    <CardTitle>AI Course Assistant</CardTitle>
                    <CardDescription className="text-purple-100">
                      Get AI-powered suggestions for your course content
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIAssistant(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* AI Mode Selection */}
                <div>
                  <Label className="text-sm font-medium">What would you like help with?</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    <Button
                      variant={aiMode === 'title' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAiMode('title')}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <Sparkles className="w-5 h-5 mb-2" />
                      <span className="text-xs">Title Ideas</span>
                    </Button>
                    <Button
                      variant={aiMode === 'description' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAiMode('description')}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <FileText className="w-5 h-5 mb-2" />
                      <span className="text-xs">Description</span>
                    </Button>
                    <Button
                      variant={aiMode === 'modules' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAiMode('modules')}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <BookOpen className="w-5 h-5 mb-2" />
                      <span className="text-xs">Modules</span>
                    </Button>
                    <Button
                      variant={aiMode === 'quiz' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAiMode('quiz')}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <HelpCircle className="w-5 h-5 mb-2" />
                      <span className="text-xs">Quiz</span>
                    </Button>
                    <Button
                      variant={aiMode === 'content' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAiMode('content')}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <Lightbulb className="w-5 h-5 mb-2" />
                      <span className="text-xs">Content Ideas</span>
                    </Button>
                    <Button
                      variant={aiMode === 'pricing' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAiMode('pricing')}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <DollarSign className="w-5 h-5 mb-2" />
                      <span className="text-xs">Pricing</span>
                    </Button>
                    <Button
                      variant={aiMode === 'marketing' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAiMode('marketing')}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <TrendingUp className="w-5 h-5 mb-2" />
                      <span className="text-xs">Marketing</span>
                    </Button>
                    <Button
                      variant={aiMode === 'imageIdeas' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAiMode('imageIdeas')}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <ImageIcon className="w-5 h-5 mb-2" />
                      <span className="text-xs">Image Ideas</span>
                    </Button>
                  </div>
                </div>

                {/* Mode-specific instructions */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-800">
                    {aiMode === 'title' && 'Generate Course Title Ideas'}
                    {aiMode === 'description' && 'Generate Course Description'}
                    {aiMode === 'modules' && 'Generate Module Structure'}
                    {aiMode === 'quiz' && 'Generate Quiz Questions'}
                    {aiMode === 'content' && 'Generate Content Ideas'}
                    {aiMode === 'pricing' && 'Get Pricing Recommendations'}
                    {aiMode === 'marketing' && 'Create Marketing Copy'}
                    {aiMode === 'imageIdeas' && 'Get Image Suggestions'}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {aiMode === 'title' && 'Get 5 compelling, SEO-friendly course title suggestions based on your category and level.'}
                    {aiMode === 'description' && 'Create a comprehensive course description with learning objectives and benefits.'}
                    {aiMode === 'modules' && 'Generate a complete module structure with titles, descriptions, and learning objectives.'}
                    {aiMode === 'quiz' && 'Create quiz questions with multiple choice, true/false, and short answer formats.'}
                    {aiMode === 'content' && 'Get specific ideas for videos, exercises, projects, and reading materials.'}
                    {aiMode === 'pricing' && 'Receive market-based pricing recommendations with justification.'}
                    {aiMode === 'marketing' && 'Generate taglines, selling points, and social media content.'}
                    {aiMode === 'imageIdeas' && 'Get suggestions for course thumbnails, diagrams, and visual content.'}
                  </p>
                </div>

                {/* Context Input */}
                <div>
                  <Label htmlFor="aiContext" className="text-sm font-medium">
                    Additional Context (Optional)
                  </Label>
                  <Textarea
                    id="aiContext"
                    value={aiContext}
                    onChange={(e) => setAiContext(e.target.value)}
                    placeholder="Provide any additional context about your course, target audience, specific requirements, etc."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                {/* Course Info Display */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Current Course Info:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Title:</span> {formData.title || 'Not set'}
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span> {formData.category || 'Not set'}
                    </div>
                    <div>
                      <span className="text-gray-600">Level:</span> {formData.level || 'Not set'}
                    </div>
                    <div>
                      <span className="text-gray-600">Modules:</span> {formData.modules.length}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateAISuggestions}
                  disabled={aiLoading || !formData.title}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Suggestions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Suggestions
                    </>
                  )}
                </Button>

                {/* AI Suggestions */}
                {aiSuggestions && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">AI Suggestions:</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(aiSuggestions)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-white border rounded-lg p-4 max-h-60 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">{aiSuggestions}</pre>
                    </div>
                    
                    {aiMode === 'description' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => applyAISuggestion('description')}
                          size="sm"
                          className="flex-1"
                        >
                          Apply to Description
                        </Button>
                        <Button
                          onClick={() => applyAISuggestion('shortDesc')}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Apply to Short Description
                        </Button>
                      </div>
                    )}

                    {aiMode === 'title' && (
                      <Button
                        onClick={() => applyAISuggestion('title')}
                        size="sm"
                        className="w-full"
                      >
                        Apply First Title
                      </Button>
                    )}

                    {aiMode === 'modules' && (
                      <Button
                        onClick={() => applyAISuggestion('modules')}
                        size="sm"
                        className="w-full"
                      >
                        Apply Module Structure
                      </Button>
                    )}

                    {aiMode === 'quiz' && (
                      <Button
                        onClick={() => applyAISuggestion('quiz')}
                        size="sm"
                        className="w-full"
                      >
                        Apply Quiz Questions
                      </Button>
                    )}

                    {(aiMode === 'content' || aiMode === 'pricing' || aiMode === 'marketing' || aiMode === 'imageIdeas') && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          Copy the suggestions above and use them as reference for your course content.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {!formData.title && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      Please enter a course title first to get AI suggestions.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 