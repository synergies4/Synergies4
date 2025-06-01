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
  Eye,
  Edit,
  FileText,
  Video,
  Link as LinkIcon,
  CheckCircle
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
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">Course Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter course title"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter detailed course description"
                    className="mt-2 min-h-[120px]"
                  />
                </div>

                <div>
                  <Label htmlFor="shortDesc" className="text-sm font-medium">Short Description</Label>
                  <Textarea
                    id="shortDesc"
                    value={formData.shortDesc}
                    onChange={(e) => handleInputChange('shortDesc', e.target.value)}
                    placeholder="Brief course summary for listings"
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
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

            {/* Step 3: Content */}
            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Course Modules</h3>
                  
                  {/* Add New Module */}
                  <Card className="mb-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Add New Module</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="moduleTitle" className="text-sm font-medium">Module Title</Label>
                        <Input
                          id="moduleTitle"
                          value={newModule.title}
                          onChange={(e) => setNewModule(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter module title"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="moduleDescription" className="text-sm font-medium">Module Description</Label>
                        <Textarea
                          id="moduleDescription"
                          value={newModule.description}
                          onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter module description"
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                      <Button onClick={addModule} className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Module
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Existing Modules */}
                  {formData.modules.map((module, index) => (
                    <Card key={module.id} className="mb-4">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <CardTitle className="text-base">
                            Module {index + 1}: {module.title}
                          </CardTitle>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeModule(module.id)}
                            className="self-start sm:self-auto"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                        <CardDescription>{module.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Module Contents */}
                        {module.contents.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Contents:</h4>
                            <div className="space-y-2">
                              {module.contents.map((content) => (
                                <div key={content.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2">
                                  <div className="flex items-center space-x-2 min-w-0">
                                    {getContentIcon(content.type)}
                                    <div className="min-w-0">
                                      <p className="font-medium text-sm truncate">{content.title}</p>
                                      <p className="text-xs text-gray-500 truncate">{content.type}</p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeContentFromModule(module.id, content.id)}
                                    className="self-start sm:self-auto text-red-600 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Add Content */}
                        {editingModule === module.id ? (
                          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Content Type</Label>
                                <Select 
                                  value={newContent.type} 
                                  onValueChange={(value: 'video' | 'link' | 'document' | 'text') => 
                                    setNewContent(prev => ({ ...prev, type: value }))
                                  }
                                >
                                  <SelectTrigger className="mt-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="link">Link</SelectItem>
                                    <SelectItem value="document">Document</SelectItem>
                                    <SelectItem value="text">Text</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Content Title</Label>
                                <Input
                                  value={newContent.title}
                                  onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                                  placeholder="Enter content title"
                                  className="mt-2"
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
                <div>
                  <h3 className="text-lg font-semibold mb-4">Course Quiz (Optional)</h3>
                  
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
      </main>
    </div>
  );
} 