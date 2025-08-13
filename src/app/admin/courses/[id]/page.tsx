'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Loader2, 
  BookOpen, 
  ArrowLeft,
  Save,
  Plus,
  Edit,
  Trash2,
  Video,
  FileText,
  Link as LinkIcon,
  File,
  X
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  short_desc?: string;
  category: string;
  level: string;
  price?: number;
  duration?: string;
  status: string;
  image?: string;
  featured: boolean;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  video_url?: string;
  order_num: number;
  duration?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_num: number;
  duration?: string;
  video_url?: string;
  content?: string;
  resources?: string;
  lessons: Lesson[];
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

interface LessonFormData {
  title: string;
  type: 'video' | 'text' | 'link' | 'document';
  content: string;
  duration?: string;
}

export default function EditCourse({ params }: { params: Promise<{ id: string }> }) {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [activeTab, setActiveTab] = useState<'course' | 'modules'>('course');
  
  // Modal states
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ lesson: Lesson; moduleId: string } | null>(null);
  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState<string | null>(null);
  
  // Form states
  const [moduleForm, setModuleForm] = useState<ModuleFormData>({
    title: '',
    description: '',
    order: 1,
    contents: []
  });
  const [lessonForm, setLessonForm] = useState<LessonFormData>({
    title: '',
    type: 'text',
    content: '',
    duration: ''
  });
  
  // Unwrap the async params
  const { id } = use(params);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || userProfile?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    fetchCourse();
    fetchModules();
  }, [user, userProfile, authLoading, router, id]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${id}`);
      if (response.ok) {
        const courseData = await response.json();
        setCourse(courseData);
      } else {
        console.error('Failed to fetch course');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/courses/${id}/modules`);
      if (response.ok) {
        const modulesData = await response.json();
        setModules(modulesData);
      } else {
        console.error('Failed to fetch modules');
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const handleSave = async () => {
    if (!course) return;
    
    setSaving(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('You must be logged in to update a course');
        return;
      }

      const response = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(course),
      });

      if (response.ok) {
        alert('Course updated successfully!');
        router.push('/admin');
      } else {
        alert('Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Error updating course');
    } finally {
      setSaving(false);
    }
  };

  // Module handlers
  const handleAddModule = () => {
    setEditingModule(null);
    setModuleForm({
      title: '',
      description: '',
      order: modules.length + 1,
      contents: []
    });
    setShowModuleModal(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setModuleForm({
      title: module.title,
      description: module.description,
      order: module.order_num,
      contents: module.lessons.map(lesson => ({
        title: lesson.title,
        type: lesson.content.includes('[VIDEO]') ? 'video' : 
              lesson.content.includes('[LINK]') ? 'link' :
              lesson.content.includes('[DOCUMENT]') ? 'document' : 'text',
        content: lesson.content.replace(/\[.*?\]\s*/, ''),
        duration: lesson.duration
      }))
    });
    setShowModuleModal(true);
  };

  const handleSaveModule = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('You must be logged in');
        return;
      }

      const method = editingModule ? 'PUT' : 'POST';
      const url = editingModule 
        ? `/api/courses/${id}/modules/${editingModule.id}`
        : `/api/courses/${id}/modules`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: moduleForm.title,
          description: moduleForm.description,
          order: moduleForm.order,
          contents: moduleForm.contents
        }),
      });

      if (response.ok) {
        setShowModuleModal(false);
        fetchModules();
        alert(editingModule ? 'Module updated successfully!' : 'Module created successfully!');
      } else {
        alert('Failed to save module');
      }
    } catch (error) {
      console.error('Error saving module:', error);
      alert('Error saving module');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('You must be logged in');
        return;
      }

      const response = await fetch(`/api/courses/${id}/modules/${moduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        fetchModules();
        alert('Module deleted successfully!');
      } else {
        alert('Failed to delete module');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Error deleting module');
    }
  };

  // Lesson handlers
  const handleAddLesson = (moduleId: string) => {
    setEditingLesson(null);
    setSelectedModuleForLesson(moduleId);
    setLessonForm({
      title: '',
      type: 'text',
      content: '',
      duration: ''
    });
    setShowLessonModal(true);
  };

  const handleEditLesson = (lesson: Lesson, moduleId: string) => {
    setEditingLesson({ lesson, moduleId });
    setSelectedModuleForLesson(moduleId);
    setLessonForm({
      title: lesson.title,
      type: lesson.content.includes('[VIDEO]') ? 'video' : 
            lesson.content.includes('[LINK]') ? 'link' :
            lesson.content.includes('[DOCUMENT]') ? 'document' : 'text',
      content: lesson.content.replace(/\[.*?\]\s*/, ''),
      duration: lesson.duration || ''
    });
    setShowLessonModal(true);
  };

  const handleSaveLesson = async () => {
    if (!selectedModuleForLesson) return;

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('You must be logged in');
        return;
      }

      const method = editingLesson ? 'PUT' : 'POST';
      const url = editingLesson 
        ? `/api/courses/${id}/modules/${selectedModuleForLesson}/lessons/${editingLesson.lesson.id}`
        : `/api/courses/${id}/modules/${selectedModuleForLesson}/lessons`;

      const formattedContent = lessonForm.type === 'text' 
        ? lessonForm.content 
        : `[${lessonForm.type.toUpperCase()}] ${lessonForm.content}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: lessonForm.title,
          content: formattedContent,
          video_url: lessonForm.type === 'video' ? lessonForm.content : null,
          duration: lessonForm.duration || null
        }),
      });

      if (response.ok) {
        setShowLessonModal(false);
        fetchModules();
        alert(editingLesson ? 'Lesson updated successfully!' : 'Lesson created successfully!');
      } else {
        alert('Failed to save lesson');
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Error saving lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string, moduleId: string) => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('You must be logged in');
        return;
      }

      const response = await fetch(`/api/courses/${id}/modules/${moduleId}/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        fetchModules();
        alert('Lesson deleted successfully!');
      } else {
        alert('Failed to delete lesson');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Error deleting lesson');
    }
  };

  // Helper functions
  const addContentToModule = () => {
    setModuleForm(prev => ({
      ...prev,
      contents: [...prev.contents, { title: '', type: 'text', content: '', duration: '' }]
    }));
  };

  const removeContentFromModule = (index: number) => {
    setModuleForm(prev => ({
      ...prev,
      contents: prev.contents.filter((_, i) => i !== index)
    }));
  };

  const updateModuleContent = (index: number, field: string, value: string) => {
    setModuleForm(prev => ({
      ...prev,
      contents: prev.contents.map((content, i) => 
        i === index ? { ...content, [field]: value } : content
      )
    }));
  };

  const getContentTypeIcon = (content: string) => {
    if (content.includes('[VIDEO]')) return <Video className="w-4 h-4" />;
    if (content.includes('[LINK]')) return <LinkIcon className="w-4 h-4" />;
    if (content.includes('[DOCUMENT]')) return <File className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getContentTypeColor = (content: string) => {
    if (content.includes('[VIDEO]')) return 'text-red-600 bg-red-50';
    if (content.includes('[LINK]')) return 'text-blue-600 bg-blue-50';
    if (content.includes('[DOCUMENT]')) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (authLoading || loading) {
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
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Course Not Found</CardTitle>
            <CardDescription className="text-center">
              The course you're looking for doesn't exist.
            </CardDescription>
          </CardHeader>
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
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
                <p className="text-gray-600">
                  {course?.title ? `Editing: ${course.title}` : 'Update course information and modules'}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" asChild>
                <Link href="/admin/courses">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Courses
                </Link>
              </Button>
              <Button 
                onClick={updateCourse} 
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('course')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'course'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Course Information
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'modules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Modules ({modules.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'course' && (
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>Update the course details below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={course.title}
                  onChange={(e) => setCourse(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={course.description}
                  onChange={(e) => setCourse(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="shortDesc">Short Description</Label>
                <Textarea
                  id="shortDesc"
                  value={course.short_desc || ''}
                  onChange={(e) => setCourse(prev => prev ? { ...prev, short_desc: e.target.value } : null)}
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={course.category}
                    onChange={(e) => setCourse(prev => prev ? { ...prev, category: e.target.value } : null)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="level">Level</Label>
                  <Input
                    id="level"
                    value={course.level}
                    onChange={(e) => setCourse(prev => prev ? { ...prev, level: e.target.value } : null)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={course.price || ''}
                    onChange={(e) => setCourse(prev => prev ? { ...prev, price: e.target.value ? parseFloat(e.target.value) : undefined } : null)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={course.duration || ''}
                    onChange={(e) => setCourse(prev => prev ? { ...prev, duration: e.target.value } : null)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Course Image URL</Label>
                <Input
                  id="image"
                  value={course.image || ''}
                  onChange={(e) => setCourse(prev => prev ? { ...prev, image: e.target.value } : null)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={course.featured}
                  onChange={(e) => setCourse(prev => prev ? { ...prev, featured: e.target.checked } : null)}
                  className="rounded"
                />
                <Label htmlFor="featured">Featured Course</Label>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button variant="outline" onClick={() => router.push('/admin')}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Course Modules</h2>
                <p className="text-gray-600">Manage the modules and lessons for this course</p>
              </div>
              <Button onClick={handleAddModule}>
                <Plus className="w-4 h-4 mr-2" />
                Add Module
              </Button>
            </div>

            {modules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first module to this course.</p>
                  <Button onClick={handleAddModule}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Module
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {modules.map((module, index) => (
                  <Card key={module.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Module {module.order_num}
                            </span>
                            <span>{module.title}</span>
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {module.description}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditModule(module)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Module</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{module.title}"? This will also delete all lessons in this module. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteModule(module.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Module
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-gray-900">
                            Lessons ({module.lessons.length})
                          </h4>
                          <Button variant="outline" size="sm" onClick={() => handleAddLesson(module.id)}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add Lesson
                          </Button>
                        </div>
                        
                        {module.lessons.length > 0 ? (
                          <div className="space-y-2">
                            {module.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={`p-2 rounded ${getContentTypeColor(lesson.content)}`}>
                                    {getContentTypeIcon(lesson.content)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{lesson.title}</p>
                                    <p className="text-sm text-gray-600">
                                      {lesson.duration && `${lesson.duration} • `}
                                      {lesson.content.replace(/\[.*?\]\s*/, '')}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleEditLesson(lesson, module.id)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{lesson.title}"? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteLesson(lesson.id, module.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete Lesson
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No lessons in this module yet.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingModule ? 'Edit Module' : 'Add New Module'}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowModuleModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="moduleTitle">Module Title</Label>
                  <Input
                    id="moduleTitle"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="moduleDescription">Description</Label>
                  <Textarea
                    id="moduleDescription"
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="moduleOrder">Module Order</Label>
                  <Input
                    id="moduleOrder"
                    type="number"
                    value={moduleForm.order}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Module Contents</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addContentToModule}>
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
                          onClick={() => removeContentFromModule(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={content.title}
                            onChange={(e) => updateModuleContent(index, 'title', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={content.type}
                            onValueChange={(value) => updateModuleContent(index, 'type', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="link">Link</SelectItem>
                              <SelectItem value="document">Document</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Label>Content</Label>
                        <Textarea
                          value={content.content}
                          onChange={(e) => updateModuleContent(index, 'content', e.target.value)}
                          placeholder={
                            content.type === 'video' ? 'Enter video URL' :
                            content.type === 'link' ? 'Enter link URL' :
                            content.type === 'document' ? 'Enter document URL or description' :
                            'Enter text content'
                          }
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="mt-3">
                        <Label>Duration (optional)</Label>
                        <Input
                          value={content.duration || ''}
                          onChange={(e) => updateModuleContent(index, 'duration', e.target.value)}
                          placeholder="e.g., 10 minutes"
                          className="mt-1"
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
                <Button onClick={handleSaveModule}>
                  {editingModule ? 'Update Module' : 'Create Module'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowLessonModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="lessonTitle">Lesson Title</Label>
                  <Input
                    id="lessonTitle"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lessonType">Content Type</Label>
                  <Select
                    value={lessonForm.type}
                    onValueChange={(value: 'video' | 'text' | 'link' | 'document') => 
                      setLessonForm(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="lessonContent">Content</Label>
                  <Textarea
                    id="lessonContent"
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder={
                      lessonForm.type === 'video' ? 'Enter video URL' :
                      lessonForm.type === 'link' ? 'Enter link URL' :
                      lessonForm.type === 'document' ? 'Enter document URL or description' :
                      'Enter text content'
                    }
                    rows={4}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lessonDuration">Duration (optional)</Label>
                  <Input
                    id="lessonDuration"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 10 minutes"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowLessonModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveLesson}>
                  {editingLesson ? 'Update Lesson' : 'Create Lesson'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 