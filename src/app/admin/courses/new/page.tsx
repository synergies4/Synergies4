'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, 
  BookOpen, 
  Shield, 
  Home,
  ArrowLeft,
  Plus,
  X,
  Upload,
  Save,
  Eye,
  Video,
  Link as LinkIcon,
  FileText,
  HelpCircle,
  Trash2
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create Course</h1>
                <p className="text-gray-600">Add a new course to your platform</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" asChild>
                <Link href="/admin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {step.number}
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

        {/* Form Steps */}
        <Card>
          <CardContent className="p-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter course title"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what students will learn in this course"
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="shortDesc">Short Description</Label>
                  <Textarea
                    id="shortDesc"
                    value={formData.shortDesc}
                    onChange={(e) => handleInputChange('shortDesc', e.target.value)}
                    placeholder="Brief summary for course cards"
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agile">Agile & Scrum</SelectItem>
                      <SelectItem value="ai">Artificial Intelligence</SelectItem>
                      <SelectItem value="product">Product Management</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="pq">PQ Skills</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="level">Difficulty Level *</Label>
                    <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="e.g., 10 hours"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="Leave empty for free course"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">Leave empty to make this course free</p>
                </div>

                <div>
                  <Label htmlFor="image">Course Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">URL to course thumbnail image</p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="featured">Featured Course</Label>
                </div>
              </motion.div>
            )}

            {/* Step 3: Content */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <Label>Course Modules</Label>
                  <p className="text-sm text-gray-500 mb-4">Add modules and content to structure your course</p>
                  
                  <div className="space-y-6 mb-6">
                    {formData.modules.map((module, index) => (
                      <Card key={module.id} className="border-l-4 border-l-blue-500">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg">Module {index + 1}: {module.title}</CardTitle>
                              <CardDescription>{module.description}</CardDescription>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeModule(module.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* Module Contents */}
                          <div className="space-y-3 mb-4">
                            {module.contents.map((content) => (
                              <div key={content.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  {getContentIcon(content.type)}
                                  <div>
                                    <p className="font-medium">{content.title}</p>
                                    <p className="text-sm text-gray-500 capitalize">{content.type}</p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeContentFromModule(module.id, content.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Add Content Form */}
                          {editingModule === module.id ? (
                            <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Content Type</Label>
                                  <Select 
                                    value={newContent.type} 
                                    onValueChange={(value: 'video' | 'link' | 'document' | 'text') => 
                                      setNewContent(prev => ({ ...prev, type: value }))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="video">Video</SelectItem>
                                      <SelectItem value="link">Link</SelectItem>
                                      <SelectItem value="document">Document</SelectItem>
                                      <SelectItem value="text">Text Content</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Title</Label>
                                  <Input
                                    value={newContent.title}
                                    onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Content title"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>
                                  {newContent.type === 'video' && 'Video URL'}
                                  {newContent.type === 'link' && 'Link URL'}
                                  {newContent.type === 'document' && 'Document URL'}
                                  {newContent.type === 'text' && 'Text Content'}
                                </Label>
                                {newContent.type === 'text' ? (
                                  <Textarea
                                    value={newContent.content}
                                    onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
                                    placeholder="Enter text content"
                                    rows={4}
                                  />
                                ) : (
                                  <Input
                                    value={newContent.content}
                                    onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
                                    placeholder={`Enter ${newContent.type} URL`}
                                  />
                                )}
                              </div>
                              <div>
                                <Label>Description (Optional)</Label>
                                <Input
                                  value={newContent.description}
                                  onChange={(e) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                                  placeholder="Brief description"
                                />
                              </div>
                              <div className="flex space-x-2">
                                <Button onClick={() => addContentToModule(module.id)} size="sm">
                                  Add Content
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setEditingModule(null)} 
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingModule(module.id)}
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Content to Module
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Add New Module</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="moduleTitle">Module Title</Label>
                        <Input
                          id="moduleTitle"
                          value={newModule.title}
                          onChange={(e) => setNewModule(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter module title"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="moduleDescription">Module Description</Label>
                        <Textarea
                          id="moduleDescription"
                          value={newModule.description}
                          onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe what this module covers"
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                      <Button onClick={addModule} disabled={!newModule.title.trim()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Module
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Step 4: Quiz */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <Label>Course Quiz (Optional)</Label>
                  <p className="text-sm text-gray-500 mb-4">Add a quiz to test student knowledge at the end of the course</p>
                  
                  {!formData.quiz ? (
                    <Button onClick={addQuiz} variant="outline">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Add Course Quiz
                    </Button>
                  ) : (
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>Course Quiz</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, quiz: undefined }))}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Quiz Title</Label>
                          <Input
                            value={formData.quiz.title}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              quiz: prev.quiz ? { ...prev.quiz, title: e.target.value } : undefined
                            }))}
                            placeholder="Quiz title"
                          />
                        </div>
                        <div>
                          <Label>Quiz Description</Label>
                          <Textarea
                            value={formData.quiz.description}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              quiz: prev.quiz ? { ...prev.quiz, description: e.target.value } : undefined
                            }))}
                            placeholder="Quiz description"
                            rows={2}
                          />
                        </div>

                        {/* Quiz Questions */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label>Questions ({formData.quiz.questions.length})</Label>
                            <Button onClick={addQuizQuestion} size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Question
                            </Button>
                          </div>

                          {formData.quiz.questions.map((question, qIndex) => (
                            <Card key={question.id} className="border-l-4 border-l-green-500">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start">
                                    <Label>Question {qIndex + 1}</Label>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeQuizQuestion(question.id)}
                                      className="text-red-600"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <Textarea
                                    value={question.question_text}
                                    onChange={(e) => updateQuizQuestion(question.id, 'question_text', e.target.value)}
                                    placeholder="Enter your question"
                                    rows={2}
                                  />
                                  
                                  <div className="space-y-2">
                                    <Label>Answer Options</Label>
                                    {question.options.map((option, oIndex) => (
                                      <div key={oIndex} className="flex items-center space-x-2">
                                        <input
                                          type="radio"
                                          name={`correct-${question.id}`}
                                          checked={question.correct_answer === option}
                                          onChange={() => updateQuizQuestion(question.id, 'correct_answer', option)}
                                        />
                                        <Input
                                          value={option}
                                          onChange={(e) => {
                                            const newOptions = [...question.options];
                                            newOptions[oIndex] = e.target.value;
                                            updateQuizQuestion(question.id, 'options', newOptions);
                                            // If this was the selected answer, update the correct_answer too
                                            if (question.correct_answer === option) {
                                              updateQuizQuestion(question.id, 'correct_answer', e.target.value);
                                            }
                                          }}
                                          placeholder={`Option ${oIndex + 1}`}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-medium mb-4">Review Course Details</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Title</Label>
                        <p className="mt-1">{formData.title}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Category</Label>
                        <p className="mt-1">{formData.category}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Level</Label>
                        <p className="mt-1">{formData.level}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Price</Label>
                        <p className="mt-1">{formData.price ? `$${formData.price}` : 'Free'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Description</Label>
                      <p className="mt-1">{formData.description}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Modules ({formData.modules.length})</Label>
                      <div className="mt-1 space-y-2">
                        {formData.modules.map((module, index) => (
                          <div key={module.id} className="p-3 bg-gray-50 rounded">
                            <p className="font-medium">Module {index + 1}: {module.title}</p>
                            <p className="text-sm text-gray-600">{module.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{module.contents.length} content items</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {formData.quiz && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Quiz</Label>
                        <div className="mt-1 p-3 bg-green-50 rounded">
                          <p className="font-medium">{formData.quiz.title}</p>
                          <p className="text-sm text-gray-600">{formData.quiz.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{formData.quiz.questions.length} questions</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              <div className="flex space-x-3">
                {currentStep === 5 ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleSubmit('DRAFT')}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save as Draft
                    </Button>
                    <Button
                      onClick={() => handleSubmit('PUBLISHED')}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      Publish Course
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                    disabled={
                      (currentStep === 1 && (!formData.title || !formData.description || !formData.category)) ||
                      (currentStep === 2 && !formData.level)
                    }
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 