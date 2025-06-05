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
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/shared/PageLayout';
import { 
  ArrowLeft,
  Save, 
  BookOpen,
  Loader2,
  Shield,
  Home,
  Eye
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

  const handleSubmit = async (status: string) => {
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
        featured: formData.featured
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
      
      router.push('/admin');
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
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || userProfile?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You need admin privileges to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-teal-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-teal-700 bg-clip-text text-transparent">
                    Create New Course
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">Build engaging learning experiences</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild className="bg-white/80 border-teal-200 hover:bg-teal-50 text-sm">
                  <Link href="/admin/courses">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Courses
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-gray-900">Course Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter course title"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="course_type" className="text-sm font-medium text-gray-900">Course Type *</Label>
                    <Select value={formData.course_type} onValueChange={(value) => handleInputChange('course_type', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select course type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital">Digital Course (Online)</SelectItem>
                        <SelectItem value="in_person">In-Person Course</SelectItem>
                        <SelectItem value="hybrid">Hybrid (Digital + In-Person)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-sm font-medium text-gray-900">Category *</Label>
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

                  <div>
                    <Label htmlFor="level" className="text-sm font-medium text-gray-900">Level *</Label>
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
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-900">Course Description *</Label>
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
                  <Label htmlFor="shortDesc" className="text-sm font-medium text-gray-900">Short Description</Label>
                  <Textarea
                    id="shortDesc"
                    value={formData.shortDesc}
                    onChange={(e) => handleInputChange('shortDesc', e.target.value)}
                    placeholder="Brief description for course cards"
                    className="mt-2"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-sm font-medium text-gray-900">Price ($)</Label>
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
                    <Label htmlFor="duration" className="text-sm font-medium text-gray-900">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="e.g., 4 weeks, 20 hours"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image" className="text-sm font-medium text-gray-900">Course Image URL</Label>
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
                  <Label htmlFor="featured" className="text-sm font-medium text-gray-900">Featured Course</Label>
                </div>

                {/* In-Person Course Fields */}
                {(formData.course_type === 'in_person' || formData.course_type === 'hybrid') && (
                  <div className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="text-lg font-semibold text-amber-800">In-Person Course Details</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="max_participants" className="text-sm font-medium text-gray-900">Max Participants</Label>
                        <Input
                          id="max_participants"
                          type="number"
                          value={formData.max_participants}
                          onChange={(e) => handleInputChange('max_participants', e.target.value)}
                          placeholder="e.g., 20"
                          className="mt-2"
                          min="1"
                          max="100"
                        />
                      </div>

                      <div>
                        <Label htmlFor="location" className="text-sm font-medium text-gray-900">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="e.g., Conference Room A, Sydney Office"
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="instructor_name" className="text-sm font-medium text-gray-900">Instructor Name</Label>
                      <Input
                        id="instructor_name"
                        value={formData.instructor_name}
                        onChange={(e) => handleInputChange('instructor_name', e.target.value)}
                        placeholder="e.g., Dr. Sarah Johnson"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="materials_included" className="text-sm font-medium text-gray-900">Materials Included</Label>
                      <Textarea
                        id="materials_included"
                        value={formData.materials_included}
                        onChange={(e) => handleInputChange('materials_included', e.target.value)}
                        placeholder="e.g., Workbook, certificate, refreshments"
                        className="mt-2"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
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
            </CardContent>
          </Card>
        </main>
      </div>
    </PageLayout>
  );
} 