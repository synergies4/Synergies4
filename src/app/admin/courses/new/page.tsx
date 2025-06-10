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
  Sparkles
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

export default function CreateCourse() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    course_type: 'digital',
    max_participants: '',
    location: '',
    instructor_name: '',
    materials_included: '',
    prerequisites: '',
  });

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Course fundamentals', icon: BookOpen },
    { number: 2, title: 'Details', description: 'Pricing & specifics', icon: FileText },
    { number: 3, title: 'Content', description: 'Description & media', icon: Sparkles },
    { number: 4, title: 'Review', description: 'Final review', icon: CheckCircle }
  ];

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
      router.push('/login');
      return;
    }
  }, [user, userProfile, authLoading, router]);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.title) errors.title = 'Course title is required';
      if (!formData.category) errors.category = 'Category is required';
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
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const generateAIContent = async (field: 'description' | 'shortDesc') => {
    if (!formData.title || !formData.category || !formData.level) {
      alert('Please fill in the course title, category, and level first to generate AI content.');
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
      alert(`Failed to generate ${field}. Please try again or write it manually.`);
    } finally {
      setLoading(false);
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
      
      router.push('/admin/courses');
    } catch (error) {
      console.error('Error creating course:', error);
      alert(`Error creating course: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
                    <SelectItem value="digital">🌐 Digital Course (Online)</SelectItem>
                    <SelectItem value="in_person">🏢 In-Person Course</SelectItem>
                    <SelectItem value="hybrid">🔄 Hybrid (Digital + In-Person)</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.course_type && <p className="text-red-600 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.course_type}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold text-gray-900">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className={`bg-white border-2 ${formErrors.category ? 'border-red-300' : 'border-gray-200'} focus:border-teal-500 text-gray-900`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center">
                          <Badge className={`${cat.color} mr-2 text-xs`}>{cat.label}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      className="bg-white border-2 border-gray-200 focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium"
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
              <Label htmlFor="image" className="text-sm font-semibold text-gray-900 flex items-center">
                <Upload className="w-4 h-4 mr-2 text-purple-600" />
                Course Image URL
              </Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="https://example.com/course-image.jpg"
                className="bg-white border-2 border-gray-200 focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium"
              />
              {formData.image && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                  <img
                    src={formData.image}
                    alt="Course preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
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
                  <p className="text-gray-600 font-medium">Build engaging learning experiences for your students</p>
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
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-0 p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-sm transition-all duration-300 ${
                    currentStep === step.number 
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg' 
                      : currentStep > step.number 
                      ? 'bg-green-500 text-white shadow-md' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-semibold ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    <p className={`text-xs ${currentStep >= step.number ? 'text-gray-600' : 'text-gray-400'}`}>
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-4 rounded-full transition-all duration-300 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
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
              <CardDescription className="text-gray-600 text-lg">
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
      </div>
    </PageLayout>
  );
} 