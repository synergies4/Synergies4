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
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/shared/PageLayout';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Save, 
  BookOpen,
  Loader2,
  Shield,
  Home,
  Eye,
  Upload,
  Users,
  MapPin,
  User,
  FileText,
  Clock,
  DollarSign,
  Star,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Target,
  Plus,
  X,
  Video,
  Link as LinkIcon,
  File
} from 'lucide-react';

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
  course_type: string;
  max_participants: string;
  location: string;
  instructor_name: string;
  materials_included: string;
  prerequisites: string;
}

interface ModuleFormData {
  title: string;
  description: string;
  order: number;
  contents: {
    title: string;
    type: 'video' | 'text' | 'link' | 'document';
    content: string;
    duration?: string;
  }[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function CreateCourse() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Module and quiz state
  const [modules, setModules] = useState<ModuleFormData[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  
  // Modal state
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null);
  const [moduleForm, setModuleForm] = useState<ModuleFormData>({
    title: '',
    description: '',
    order: 1,
    contents: []
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
    course_type: 'in_person',
    max_participants: '',
    location: '',
    instructor_name: '',
    materials_included: '',
    prerequisites: '',
  });

  // Multi-select categories (primary category remains the first selected)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (value: string) => {
    setSelectedCategories(prev => {
      const exists = prev.includes(value);
      const updated = exists ? prev.filter(v => v !== value) : [...prev, value];
      // Keep legacy single category in sync for API that expects a primary category
      handleInputChange('category', updated[0] || '');
      // Clear validation error when first picked
      if (updated.length > 0 && formErrors.category) {
        setFormErrors(prevErr => ({ ...prevErr, category: '' }));
      }
      return updated;
    });
  };

  const getStepsForCourseType = (courseType: string) => {
    const baseSteps = [
      { number: 1, title: 'Basic Info', description: 'Course fundamentals', icon: BookOpen },
      { number: 2, title: 'Details', description: 'Pricing & specifics', icon: FileText },
      { number: 3, title: 'Content', description: 'Description & media', icon: Sparkles },
    ];

    const digitalSteps = [
      { number: 4, title: 'Modules', description: 'Course modules & lessons', icon: BookOpen },
      { number: 5, title: 'Quiz', description: 'Optional course quiz', icon: Target },
    ];

    const reviewStep = { number: courseType === 'digital' || courseType === 'hybrid' ? 6 : 4, title: 'Review', description: 'Final review', icon: CheckCircle };

    if (courseType === 'digital' || courseType === 'hybrid') {
      return [...baseSteps, ...digitalSteps, reviewStep];
    } else {
      return [...baseSteps, reviewStep];
    }
  };

  const steps = getStepsForCourseType(formData.course_type);

  const categories = [
    { value: 'agile', label: 'Agile & Scrum', color: 'bg-blue-100 text-blue-800' },
    { value: 'leadership', label: 'Leadership', color: 'bg-purple-100 text-purple-800' },
    { value: 'product', label: 'Product Management', color: 'bg-green-100 text-green-800' },
    { value: 'mental-fitness', label: 'Mental Fitness', color: 'bg-pink-100 text-pink-800' },
    { value: 'technology', label: 'Technology', color: 'bg-orange-100 text-orange-800' },
    { value: 'business', label: 'Business', color: 'bg-teal-100 text-teal-800' }
  ];

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || userProfile?.role !== 'ADMIN') {
      router.push('/login?redirect=/admin/courses/new');
      return;
    }
  }, [user, userProfile, authLoading, router]);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.title) errors.title = 'Course title is required';
      if (selectedCategories.length === 0) errors.category = 'At least one category is required';
      if (!formData.level) errors.level = 'Level is required';
      if (!formData.course_type) errors.course_type = 'Course type is required';
    }
    
    if (step === 2) {
      if (!formData.price) errors.price = 'Price is required';
      if (!formData.duration) errors.duration = 'Duration is required';
      if (formData.course_type === 'in_person' && !formData.max_participants) {
        errors.max_participants = 'Max participants is required for in-person courses';
      }
    }
    
    if (step === 3) {
      if (!formData.description) errors.description = 'Course description is required';
      if (!formData.shortDesc) errors.shortDesc = 'Short description is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof CourseFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is updated
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // If course type changes, reset step if we're beyond the new max
    if (field === 'course_type') {
      const newSteps = getStepsForCourseType(value as string);
      if (currentStep > newSteps.length) {
        setCurrentStep(newSteps.length);
      }
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const currentSteps = getStepsForCourseType(formData.course_type);
      setCurrentStep(prev => Math.min(prev + 1, currentSteps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image file size must be less than 10MB');
      return;
    }

    setLoading(true);
    try {
      // Get Supabase client
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `course-images/${fileName}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('synergies4')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('synergies4')
        .getPublicUrl(filePath);

      if (urlData.publicUrl) {
        handleInputChange('image', urlData.publicUrl);
        toast.success('Image uploaded successfully!');
      } else {
        throw new Error('Failed to get public URL');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const generateAIContent = async (field: 'description' | 'shortDesc') => {
    if (!formData.title || !formData.category || !formData.level) {
      toast.error('Please fill in the course title, category, and level first to generate AI content.');
      return;
    }

    setLoading(true);
    try {
      const prompt = field === 'description' 
        ? `Create a comprehensive course description for a ${formData.level.toLowerCase()} level ${formData.category} course titled "${formData.title}". Include learning objectives, target audience, key topics covered, and benefits. Make it engaging and professional.`
        : `Create a compelling short description (2-3 sentences) for a ${formData.level.toLowerCase()} level ${formData.category} course titled "${formData.title}". Focus on the main value proposition and target audience.`;

      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          type: 'course_content',
          context: {
            title: formData.title,
            category: formData.category,
            level: formData.level,
            field
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI content');
      }

      const data = await response.json();
      
      if (data.content) {
        handleInputChange(field, data.content);
      } else {
        throw new Error('No content received from AI');
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      toast.error(`Failed to generate ${field}. Please try again or write it manually.`);
    } finally {
      setLoading(false);
    }
  };

  // Module management functions
  const addModule = () => {
    setEditingModuleIndex(null);
    setModuleForm({
      title: '',
      description: '',
      order: modules.length + 1,
      contents: []
    });
    setShowModuleModal(true);
  };

  const editModule = (index: number) => {
    setEditingModuleIndex(index);
    setModuleForm({ ...modules[index] });
    setShowModuleModal(true);
  };

  const saveModule = () => {
    if (editingModuleIndex !== null) {
      // Edit existing module
      setModules(modules.map((module, i) => 
        i === editingModuleIndex ? { ...moduleForm } : module
      ));
    } else {
      // Add new module
      setModules([...modules, { ...moduleForm }]);
    }
    setShowModuleModal(false);
  };

  const addContentToModuleForm = () => {
    setModuleForm(prev => ({
      ...prev,
      contents: [...prev.contents, { title: '', type: 'text', content: '', duration: '' }]
    }));
  };

  const removeContentFromModuleForm = (index: number) => {
    setModuleForm(prev => ({
      ...prev,
      contents: prev.contents.filter((_, i) => i !== index)
    }));
  };

  const updateModuleFormContent = (index: number, field: string, value: string) => {
    setModuleForm(prev => ({
      ...prev,
      contents: prev.contents.map((content, i) => 
        i === index ? { ...content, [field]: value } : content
      )
    }));
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const updateModule = (index: number, field: keyof ModuleFormData, value: any) => {
    setModules(modules.map((module, i) => 
      i === index ? { ...module, [field]: value } : module
    ));
  };

  const addContentToModule = (moduleIndex: number) => {
    const newContent = {
      title: '',
      type: 'text' as const,
      content: '',
      duration: ''
    };
    
    setModules(modules.map((module, i) => 
      i === moduleIndex 
        ? { ...module, contents: [...module.contents, newContent] }
        : module
    ));
  };

  const removeContentFromModule = (moduleIndex: number, contentIndex: number) => {
    setModules(modules.map((module, i) => 
      i === moduleIndex 
        ? { ...module, contents: module.contents.filter((_, ci) => ci !== contentIndex) }
        : module
    ));
  };

  const updateModuleContent = (moduleIndex: number, contentIndex: number, field: string, value: string) => {
    setModules(modules.map((module, i) => 
      i === moduleIndex 
        ? {
            ...module,
            contents: module.contents.map((content, ci) => 
              ci === contentIndex ? { ...content, [field]: value } : content
            )
          }
        : module
    ));
  };

  // Quiz management functions
  const addQuizQuestion = () => {
    const newQuestion: QuizQuestion = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    };
    setQuizQuestions([...quizQuestions, newQuestion]);
  };

  const removeQuizQuestion = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const updateQuizQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    setQuizQuestions(quizQuestions.map((question, i) => 
      i === index ? { ...question, [field]: value } : question
    ));
  };

  const updateQuizQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuizQuestions(quizQuestions.map((question, i) => 
      i === questionIndex 
        ? {
            ...question,
            options: question.options.map((option, oi) => 
              oi === optionIndex ? value : option
            )
          }
        : question
    ));
  };

  // Helper functions for content types
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'link': return <LinkIcon className="w-4 h-4" />;
      case 'document': return <File className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-red-600 bg-red-50';
      case 'link': return 'text-blue-600 bg-blue-50';
      case 'document': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleSubmit = async (status: string) => {
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to create a course');
        return;
      }

      const courseData = {
        title: formData.title,
        description: formData.description,
        shortDesc: formData.shortDesc,
        category: formData.category,
        categories: selectedCategories, // send multi-select for future-proof backend
        level: formData.level,
        price: formData.price ? parseFloat(formData.price) : null,
        duration: formData.duration,
        status: status,
        image: formData.image || null,
        featured: formData.featured,
        course_type: formData.course_type,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        location: formData.location || null,
        instructor_name: formData.instructor_name || null,
        materials_included: formData.materials_included || null,
        prerequisites: formData.prerequisites || null
      };
      
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
      
      // Now create modules and quiz if they exist
      if (formData.course_type === 'digital' && modules.length > 0) {
        await Promise.all(modules.map(async (module) => {
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
            }
          } catch (error) {
            console.error('Error creating module:', error);
          }
        }));
      }
      
      // Create quiz if questions exist
      if (quizQuestions.length > 0) {
        try {
          const quizResponse = await fetch(`/api/courses/${course.id}/quiz`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              title: quizTitle || 'Course Quiz',
              description: quizDescription || 'Test your knowledge',
              questions: quizQuestions
            }),
          });
          
          if (!quizResponse.ok) {
            console.error('Failed to create quiz');
          }
        } catch (error) {
          console.error('Error creating quiz:', error);
        }
      }
      
      toast.success('Course created successfully!');
      router.push('/admin/courses');
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error(`Error creating course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || userProfile?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Access Denied</CardTitle>
            <CardDescription className="text-gray-600">
              You need admin privileges to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-gray-900 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-teal-600" />
                  Course Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Advanced Agile Leadership"
                  className={`bg-white border-2 ${formErrors.title ? 'border-red-300' : 'border-gray-200'} focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium`}
                />
                {formErrors.title && <p className="text-red-600 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="course_type" className="text-sm font-semibold text-gray-900">Course Type *</Label>
                <Select value={formData.course_type} onValueChange={(value) => handleInputChange('course_type', value)}>
                  <SelectTrigger className={`bg-white border-2 ${formErrors.course_type ? 'border-red-300' : 'border-gray-200'} focus:border-teal-500 text-gray-900`}>
                    <SelectValue placeholder="Select course type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                     <SelectItem value="in_person">🏢 In-Person Course</SelectItem>
                    <SelectItem value="digital" disabled className="text-gray-400 cursor-not-allowed">🌐 Digital Course (Online) - Coming Soon</SelectItem>
                    <SelectItem value="hybrid" disabled className="text-gray-400 cursor-not-allowed">🔄 Hybrid (Digital + In-Person) - Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.course_type && <p className="text-red-600 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.course_type}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold text-gray-900">Category *</Label>
                <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-lg border-2 ${formErrors.category ? 'border-red-300' : 'border-gray-200'} bg-white`}>
                  {categories.map((cat) => {
                    const checked = selectedCategories.includes(cat.value);
                    return (
                      <label key={cat.value} className={`flex items-center gap-2 cursor-pointer rounded-md px-2 py-1 border ${checked ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input
                          type="checkbox"
                          className="accent-teal-600"
                          checked={checked}
                          onChange={() => toggleCategory(cat.value)}
                        />
                        <Badge className={`${cat.color} text-xs`}>{cat.label}</Badge>
                      </label>
                    );
                  })}
                </div>
                {selectedCategories.length > 0 && (
                  <p className="text-xs text-gray-600">Primary category: <span className="font-medium">{selectedCategories[0]}</span></p>
                )}
                {formErrors.category && <p className="text-red-600 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="level" className="text-sm font-semibold text-gray-900">Level *</Label>
                <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                  <SelectTrigger className={`bg-white border-2 ${formErrors.level ? 'border-red-300' : 'border-gray-200'} focus:border-teal-500 text-gray-900`}>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="BEGINNER">🌱 Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">🚀 Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">⭐ Advanced</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.level && <p className="text-red-600 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.level}</p>}
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-semibold text-gray-900 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-emerald-600" />
                  Price ($) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  className={`bg-white border-2 ${formErrors.price ? 'border-red-300' : 'border-gray-200'} focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium`}
                  min="0"
                  step="0.01"
                />
                {formErrors.price && <p className="text-red-600 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.price}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-semibold text-gray-900 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-blue-600" />
                  Duration *
                </Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 4 weeks, 20 hours"
                  className={`bg-white border-2 ${formErrors.duration ? 'border-red-300' : 'border-gray-200'} focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium`}
                />
                {formErrors.duration && <p className="text-red-600 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.duration}</p>}
              </div>
            </div>

            {/* In-Person Course Fields */}
            {(formData.course_type === 'in_person' || formData.course_type === 'hybrid') && (
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-amber-900 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    In-Person Course Details
                  </CardTitle>
                  <CardDescription className="text-amber-700">
                    Additional information required for in-person courses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_participants" className="text-sm font-semibold text-gray-900 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-amber-600" />
                        Max Participants *
                      </Label>
                      <Input
                        id="max_participants"
                        type="number"
                        value={formData.max_participants}
                        onChange={(e) => handleInputChange('max_participants', e.target.value)}
                        placeholder="20"
                        className={`bg-white border-2 ${formErrors.max_participants ? 'border-red-300' : 'border-gray-200'} focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium`}
                        min="1"
                        max="100"
                      />
                      {formErrors.max_participants && <p className="text-red-600 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.max_participants}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-semibold text-gray-900 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-red-600" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Conference Room A, Sydney Office"
                        className="bg-white border-2 border-gray-200 focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructor_name" className="text-sm font-semibold text-gray-900 flex items-center">
                      <User className="w-4 h-4 mr-2 text-purple-600" />
                      Instructor Name
                    </Label>
                    <Input
                      id="instructor_name"
                      value={formData.instructor_name}
                      onChange={(e) => handleInputChange('instructor_name', e.target.value)}
                      placeholder="Dr. Sarah Johnson"
                      className="bg-white border-2 border-gray-200 focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="materials_included" className="text-sm font-semibold text-gray-900 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-green-600" />
                      Materials Included
                    </Label>
                    <Textarea
                      id="materials_included"
                      value={formData.materials_included}
                      onChange={(e) => handleInputChange('materials_included', e.target.value)}
                      placeholder="Workbook, certificate, refreshments, course materials..."
                      className="bg-white resize-none border-2 border-gray-200 focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            {/* AI Content Generation */}
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-purple-900 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI Content Generator
                </CardTitle>
                <CardDescription className="text-purple-700">
                  Let AI help you create compelling course descriptions and content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => generateAIContent('description')}
                    className="w-full bg-white text-purple-700 border-purple-300 hover:bg-purple-50"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Description
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => generateAIContent('shortDesc')}
                    className="w-full bg-white text-purple-700 border-purple-300 hover:bg-purple-50"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Generate Short Description
                  </Button>
                </div>
                <div className="text-xs text-purple-600 bg-purple-100 p-3 rounded-lg">
                  💡 AI will use your course title, category, and level to create tailored content
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-900 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-teal-600" />
                Course Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide a comprehensive description of what students will learn, the course structure, and key benefits..."
                className={`bg-white border-2 ${formErrors.description ? 'border-red-300' : 'border-gray-200'} focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium min-h-[150px]`}
                rows={6}
              />
              {formErrors.description && <p className="text-red-600 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDesc" className="text-sm font-semibold text-gray-900">Short Description *</Label>
              <Textarea
                id="shortDesc"
                value={formData.shortDesc}
                onChange={(e) => handleInputChange('shortDesc', e.target.value)}
                placeholder="Brief, compelling description for course cards and previews..."
                className={`bg-white border-2 ${formErrors.shortDesc ? 'border-red-300' : 'border-gray-200'} focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium`}
                rows={3}
              />
              {formErrors.shortDesc && <p className="text-red-600 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.shortDesc}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prerequisites" className="text-sm font-semibold text-gray-900">Prerequisites</Label>
              <Textarea
                id="prerequisites"
                value={formData.prerequisites}
                onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                placeholder="List any required knowledge, skills, or experience..."
                className="bg-white border-2 border-gray-200 focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900 flex items-center">
                <Upload className="w-4 h-4 mr-2 text-purple-600" />
                Course Image
              </Label>
              <div className="relative">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  {formData.image ? (
                    <div className="relative w-full h-full">
                      <img
                        src={formData.image}
                        alt="Course preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="text-white opacity-0 hover:opacity-100 transition-opacity duration-200 text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm font-medium">Click to change image</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
              {formData.image && (
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">Image uploaded successfully</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInputChange('image', '')}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
                className="w-5 h-5 text-teal-600 border-2 border-gray-300 rounded focus:ring-teal-500"
              />
              <Label htmlFor="featured" className="text-sm font-semibold text-gray-900 flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-600" />
                Featured Course
              </Label>
              <p className="text-xs text-gray-600">Featured courses appear prominently on the homepage</p>
            </div>
          </div>
        );
      
      case 4:
        // This could be either Modules (for digital/hybrid) or Review (for in-person)
        if (formData.course_type === 'digital' || formData.course_type === 'hybrid') {
          return (
            <div className="space-y-6">
              {/* Show modules for digital/hybrid courses */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-teal-600" />
                    Course Modules
                  </h3>
                  <p className="text-gray-700 font-medium">Add modules and lessons to your course curriculum</p>
                </div>
                <Button onClick={() => addModule()} className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Module
                </Button>
              </div>

              {modules.length === 0 ? (
                <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200">
                  <CardContent className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
                    <p className="text-gray-700 font-medium mb-4">Start building your course by adding your first module.</p>
                    <Button onClick={() => addModule()} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Module
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <Card key={index} className="border-2 border-gray-200">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center space-x-2">
                              <Badge variant="outline">Module {module.order}</Badge>
                              <span>{module.title}</span>
                            </CardTitle>
                            <CardDescription className="mt-1">{module.description}</CardDescription>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => editModule(index)}>
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => removeModule(index)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium text-gray-900">Contents ({module.contents.length})</h4>
                          </div>
                          
                          {module.contents.length > 0 ? (
                            <div className="space-y-2">
                              {module.contents.map((content, contentIndex) => (
                                <div key={contentIndex} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded ${getContentTypeColor(content.type)}`}>
                                      {getContentTypeIcon(content.type)}
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{content.title}</p>
                                      <p className="text-sm text-gray-600">
                                        {content.duration && `${content.duration} • `}
                                        {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No content in this module yet. Click edit to add content.</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        } else {
          // For in-person courses, step 4 is Review
          const selectedCategory = categories.find(cat => cat.value === formData.category);
          return (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-xl border-2 border-teal-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-teal-600" />
                  Course Review
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Title</p>
                      <p className="text-lg font-bold text-gray-900">{formData.title || 'Untitled Course'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Category</p>
                      {selectedCategory && (
                        <Badge className={`${selectedCategory.color} text-sm`}>
                          {selectedCategory.label}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Level</p>
                      <p className="text-gray-900 font-medium">{formData.level}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Type</p>
                      <p className="text-gray-900 font-medium capitalize">{formData.course_type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Price</p>
                      <p className="text-2xl font-bold text-emerald-600">${formData.price || '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Duration</p>
                      <p className="text-gray-900 font-medium">{formData.duration || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Featured</p>
                      <p className="text-gray-900 font-medium">{formData.featured ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
                
                {formData.description && (
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Description Preview</p>
                    <div className="bg-white p-4 rounded-lg border max-h-32 overflow-y-auto">
                      <p className="text-gray-900 text-sm">{formData.description}</p>
                    </div>
                  </div>
                )}

                {/* Show modules and quiz summary for digital/hybrid courses */}
                {(formData.course_type === 'digital' || formData.course_type === 'hybrid') && (
                  <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">Modules</p>
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="text-gray-900 text-sm">{modules.length} modules created</p>
                          <p className="text-xs text-gray-500">
                            {modules.reduce((total, module) => total + module.contents.length, 0)} total lessons
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">Quiz</p>
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="text-gray-900 text-sm">
                            {quizQuestions.length > 0 ? `${quizQuestions.length} questions` : 'No quiz'}
                          </p>
                          {quizTitle && (
                            <p className="text-xs text-gray-500">{quizTitle}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }
      
      case 5:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Course Quiz (Optional)
                </h3>
                <p className="text-gray-700 font-medium">Add a quiz to test student knowledge</p>
              </div>
              <Button onClick={() => addQuizQuestion()} variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            {/* Quiz Title and Description */}
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle>Quiz Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz_title">Quiz Title</Label>
                  <Input
                    id="quiz_title"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g., Final Assessment"
                    className="bg-white border-2 border-gray-200 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiz_description">Quiz Description</Label>
                  <Textarea
                    id="quiz_description"
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                    placeholder="Test your understanding of the course material..."
                    className="bg-white border-2 border-gray-200 focus:border-purple-500"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quiz Questions */}
            {quizQuestions.length === 0 ? (
              <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
                <CardContent className="text-center py-12">
                  <Target className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No quiz questions yet</h3>
                  <p className="text-gray-700 font-medium mb-4">Add questions to create a quiz for this course.</p>
                  <Button onClick={() => addQuizQuestion()} variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Question
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {quizQuestions.map((question, index) => (
                  <Card key={index} className="border-2 border-purple-200">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="flex items-center space-x-2">
                          <Badge variant="outline" className="border-purple-300 text-purple-700">Question {index + 1}</Badge>
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={() => removeQuizQuestion(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Question</Label>
                        <Textarea
                          value={question.question}
                          onChange={(e) => updateQuizQuestion(index, 'question', e.target.value)}
                          placeholder="Enter your question..."
                          className="bg-white border-2 border-gray-200 focus:border-purple-500"
                          rows={2}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label>Answer Options</Label>
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name={`correct-${index}`}
                              checked={question.correctAnswer === optionIndex}
                              onChange={() => updateQuizQuestion(index, 'correctAnswer', optionIndex)}
                              className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                            />
                            <Input
                              value={option}
                              onChange={(e) => updateQuizQuestionOption(index, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              className="flex-1 bg-white border-2 border-gray-200 focus:border-purple-500"
                            />
                          </div>
                        ))}
                        <p className="text-sm text-gray-700 font-medium">Select the radio button next to the correct answer</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      
      case 6:
        // For digital/hybrid courses, step 6 is Review
        const selectedCategory = categories.find(cat => cat.value === formData.category);
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-xl border-2 border-teal-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-teal-600" />
                Course Review
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Title</p>
                    <p className="text-lg font-bold text-gray-900">{formData.title || 'Untitled Course'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Category</p>
                    {selectedCategory && (
                      <Badge className={`${selectedCategory.color} text-sm`}>
                        {selectedCategory.label}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Level</p>
                    <p className="text-gray-900 font-medium">{formData.level}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Type</p>
                    <p className="text-gray-900 font-medium capitalize">{formData.course_type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Price</p>
                    <p className="text-2xl font-bold text-emerald-600">${formData.price || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Duration</p>
                    <p className="text-gray-900 font-medium">{formData.duration || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Featured</p>
                    <p className="text-gray-900 font-medium">{formData.featured ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
              
              {formData.description && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Description Preview</p>
                  <div className="bg-white p-4 rounded-lg border max-h-32 overflow-y-auto">
                    <p className="text-gray-900 text-sm">{formData.description}</p>
                  </div>
                </div>
              )}

              {/* Show modules and quiz summary for digital/hybrid courses */}
              {(formData.course_type === 'digital' || formData.course_type === 'hybrid') && (
                <div className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-2">Modules</p>
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-gray-900 text-sm">{modules.length} modules created</p>
                        <p className="text-xs text-gray-500">
                          {modules.reduce((total, module) => total + module.contents.length, 0)} total lessons
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-2">Quiz</p>
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-gray-900 text-sm">
                          {quizQuestions.length > 0 ? `${quizQuestions.length} questions` : 'No quiz'}
                        </p>
                        {quizTitle && (
                          <p className="text-xs text-gray-500">{quizTitle}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 py-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-teal-700 bg-clip-text text-transparent">
                    Create New Course
                  </h1>
                  <p className="text-gray-800 font-semibold">Build engaging learning experiences for your students</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild className="bg-white/80 border-2 border-teal-200 hover:bg-teal-50 hover:border-teal-400 text-gray-900 font-medium">
                  <Link href="/admin/courses">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Courses
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-0 p-4 sm:p-6">
            <div className="flex items-center justify-between overflow-x-auto">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-shrink-0">
                  <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 ${
                    currentStep === step.number 
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg' 
                      : step.number < currentStep 
                      ? 'bg-green-500 text-white shadow-md' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.number < currentStep ? (
                      <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                    ) : (
                      <step.icon className="w-4 h-4 sm:w-6 sm:h-6" />
                    )}
                  </div>
                  <div className="ml-2 sm:ml-3 hidden md:block min-w-0">
                    <p className={`text-xs sm:text-sm font-semibold truncate ${step.number <= currentStep ? 'text-gray-900' : 'text-gray-700'}`}>
                      {step.title}
                    </p>
                    <p className={`text-xs truncate ${step.number <= currentStep ? 'text-gray-700' : 'text-gray-600'}`}>
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 sm:w-16 h-1 mx-2 sm:mx-4 rounded-full transition-all duration-300 flex-shrink-0 ${
                      step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            {/* Mobile step indicator */}
            <div className="block md:hidden mt-3 text-center">
              <p className="text-sm font-semibold text-gray-900">
                {steps[currentStep - 1]?.title}
              </p>
              <p className="text-xs text-gray-700 font-medium">
                Step {currentStep} of {steps.length}
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100 p-8">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {steps[currentStep - 1]?.title}
              </CardTitle>
              <CardDescription className="text-gray-800 text-lg font-medium">
                {steps[currentStep - 1]?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {renderStepContent()}
              
              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 mt-8 border-t border-gray-200">
                <div className="flex gap-3">
                  {currentStep > 1 && (
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-900 font-medium"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-3">
                  {currentStep < steps.length ? (
                    <Button
                      onClick={nextStep}
                      className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium px-8"
                    >
                      Next Step
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleSubmit('DRAFT')}
                        disabled={loading}
                        variant="outline"
                        className="bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-900 font-medium"
                      >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save as Draft
                      </Button>
                      <Button
                        onClick={() => handleSubmit('PUBLISHED')}
                        disabled={loading}
                        className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium px-8"
                      >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                        Publish Course
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Modal */}
        {showModuleModal && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingModuleIndex !== null ? 'Edit Module' : 'Add New Module'}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowModuleModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="module_title">Module Title</Label>
                      <Input
                        id="module_title"
                        value={moduleForm.title}
                        onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Introduction to React"
                        className="bg-white border-2 border-gray-200 focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="module_order">Module Order</Label>
                      <Input
                        id="module_order"
                        type="number"
                        value={moduleForm.order}
                        onChange={(e) => setModuleForm(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                        placeholder="1"
                        className="bg-white border-2 border-gray-200 focus:border-teal-500"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="module_description">Module Description</Label>
                    <Textarea
                      id="module_description"
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what students will learn in this module..."
                      className="bg-white border-2 border-gray-200 focus:border-teal-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Module Contents</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addContentToModuleForm}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Content
                      </Button>
                    </div>
                    
                    {moduleForm.contents.map((content, index) => (
                      <div key={index} className="border rounded-lg p-4 mb-3">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">Content {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContentFromModuleForm(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <Label>Content Title</Label>
                            <Input
                              value={content.title}
                              onChange={(e) => updateModuleFormContent(index, 'title', e.target.value)}
                              placeholder="e.g., Introduction Video"
                              className="mt-1 bg-white border-2 border-gray-200 focus:border-teal-500"
                            />
                          </div>
                          <div>
                            <Label>Content Type</Label>
                            <Select value={content.type} onValueChange={(value) => updateModuleFormContent(index, 'type', value)}>
                              <SelectTrigger className="mt-1 bg-white border-2 border-gray-200 focus:border-teal-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">📹 Video</SelectItem>
                                <SelectItem value="text">📝 Text</SelectItem>
                                <SelectItem value="link">🔗 Link</SelectItem>
                                <SelectItem value="document">📄 Document</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Label>Content</Label>
                          <Textarea
                            value={content.content}
                            onChange={(e) => updateModuleFormContent(index, 'content', e.target.value)}
                            placeholder={
                              content.type === 'video' ? 'Enter video URL' :
                              content.type === 'link' ? 'Enter link URL' :
                              content.type === 'document' ? 'Enter document URL or description' :
                              'Enter text content'
                            }
                            rows={3}
                            className="mt-1 bg-white border-2 border-gray-200 focus:border-teal-500"
                          />
                        </div>
                        
                        <div className="mt-3">
                          <Label>Duration (optional)</Label>
                          <Input
                            value={content.duration || ''}
                            onChange={(e) => updateModuleFormContent(index, 'duration', e.target.value)}
                            placeholder="e.g., 10 minutes"
                            className="mt-1 bg-white border-2 border-gray-200 focus:border-teal-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowModuleModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveModule} className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">
                    {editingModuleIndex !== null ? 'Update Module' : 'Add Module'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
} 