'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Eye, X, FileText, Tag, Image as ImageIcon, Sparkles, Brain, Lightbulb, Copy, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import PageLayout from '@/components/shared/PageLayout';

interface BlogCategory {
  name: string;
  slug: string;
  color: string;
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    category: '',
    tags: [] as string[],
    status: 'draft',
    meta_title: '',
    meta_description: ''
  });
  const [tagInput, setTagInput] = useState('');

  // AI Assistant State
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [aiMode, setAiMode] = useState<'content' | 'outline' | 'title' | 'seo'>('content');

  useEffect(() => {
    if (userProfile?.role === 'ADMIN') {
      fetchCategories();
    }
  }, [userProfile]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // AI Assistant Functions
  const generateAISuggestions = async () => {
    setAiLoading(true);
    try {
      let prompt = '';
      
      switch (aiMode) {
        case 'content':
          prompt = `Write a comprehensive blog post about "${formData.title}" in the ${formData.category} category. Context: ${aiContext}. Include an engaging introduction, main sections with subheadings, practical examples, and a compelling conclusion. Make it informative and engaging for professionals.`;
          break;
        case 'outline':
          prompt = `Create a detailed blog post outline for "${formData.title}" in the ${formData.category} category. Context: ${aiContext}. Provide a structured outline with main sections, subsections, and key points to cover. Include introduction, main body sections, and conclusion.`;
          break;
        case 'title':
          prompt = `Generate 10 compelling blog post titles related to "${formData.title || aiContext}" in the ${formData.category} category. Context: ${aiContext}. Make them engaging, SEO-friendly, and click-worthy for professional audiences.`;
          break;
        case 'seo':
          prompt = `Create SEO-optimized meta title, meta description, and suggest relevant tags for a blog post titled "${formData.title}" in the ${formData.category} category. Context: ${aiContext}. Focus on search engine optimization and user engagement.`;
          break;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are an expert content writer and SEO specialist. Create high-quality, engaging blog content for professional audiences.' },
            { role: 'user', content: prompt }
          ],
          provider: 'anthropic'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.content || data.response);
      } else {
        setAiSuggestions('Sorry, I encountered an error generating suggestions. Please try again.');
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
      setAiSuggestions('Sorry, I encountered an error generating suggestions. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestion = (field: string) => {
    if (field === 'content') {
      setFormData(prev => ({ ...prev, content: aiSuggestions }));
    } else if (field === 'excerpt') {
      // Extract first paragraph for excerpt
      const excerpt = aiSuggestions.split('\n\n')[0].substring(0, 300) + '...';
      setFormData(prev => ({ ...prev, excerpt }));
    } else if (field === 'title') {
      // Use first suggested title
      const firstTitle = aiSuggestions.split('\n')[0].replace(/^\d+\.\s*/, '');
      setFormData(prev => ({ ...prev, title: firstTitle, slug: generateSlug(firstTitle) }));
    }
    setShowAIAssistant(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const savePost = async () => {
    if (!formData.title || !formData.content || !formData.category) {
      alert('Please fill in all required fields (title, content, category)');
      return;
    }

    try {
      setLoading(true);
      
      // Get Supabase session token
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        alert('Please log in to continue');
        return;
      }

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          reading_time: Math.ceil(formData.content.split(' ').length / 200)
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Blog post created successfully!');
        router.push('/admin/blog');
      } else {
        const error = await response.json();
        alert(`Error saving post: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post');
    } finally {
      setLoading(false);
    }
  };

  if (userProfile?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center">
            <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
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
        {/* Mobile-Optimized Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-teal-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-teal-700 bg-clip-text text-transparent truncate">Create New Post</h1>
                  <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Write and publish a new blog post</p>
                </div>
              </div>
              <div className="flex space-x-2 sm:space-x-3">
                <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none bg-white/80 border-teal-200 text-gray-900 hover:bg-teal-50 hover:border-teal-400">
                  <Link href="/admin/blog">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Back to Blog</span>
                    <span className="sm:hidden">Back</span>
                  </Link>
                </Button>
                <Button 
                  size="sm"
                  onClick={savePost}
                  disabled={loading}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  <span className="hidden sm:inline">{loading ? 'Saving...' : 'Save Post'}</span>
                  <span className="sm:hidden">{loading ? 'Saving...' : 'Save'}</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Main Content - Mobile First, Desktop 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-4 bg-white/50 backdrop-blur-sm">
                  <CardTitle className="text-lg text-gray-900">Basic Information</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Enter the main details for your blog post
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 bg-white/50 backdrop-blur-sm">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-gray-900">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Enter post title..."
                      className="mt-2 bg-white/80 border-teal-200 focus:border-teal-400 text-gray-900"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug" className="text-sm font-medium text-gray-900">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="url-friendly-slug"
                      className="mt-2 bg-white border-gray-300 text-gray-900"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      URL: /industry-insight/{formData.slug || 'your-post-slug'}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="excerpt" className="text-sm font-medium text-gray-900">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Brief description of the post..."
                      className="mt-2 bg-white border-gray-300 text-gray-900"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Content */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-4 bg-white/50 backdrop-blur-sm">
                  <CardTitle className="text-lg flex items-center text-gray-900">
                    <FileText className="w-5 h-5 mr-2 text-teal-600" />
                    Content *
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Write your blog post content. You can use HTML tags for formatting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-white/50 backdrop-blur-sm">
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your blog post content here... You can use HTML tags like <h2>, <p>, <strong>, <ul>, <li>, etc."
                    className="min-h-[300px] sm:min-h-[400px] bg-white border-gray-300 text-gray-900"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Estimated reading time: {Math.ceil(formData.content.split(' ').length / 200)} minutes
                  </p>
                </CardContent>
              </Card>

              {/* SEO - Mobile: Show after content, Desktop: Show after content */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4 bg-white">
                  <CardTitle className="text-lg">SEO Settings</CardTitle>
                  <CardDescription className="text-sm">
                    Optimize your post for search engines
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 bg-white">
                  <div>
                    <Label htmlFor="meta_title" className="text-sm font-medium text-gray-900">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                      placeholder="SEO title (defaults to post title)"
                      className="mt-2 bg-white border-gray-300 text-gray-900"
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_description" className="text-sm font-medium text-gray-900">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                      placeholder="SEO description (defaults to excerpt)"
                      className="mt-2 bg-white border-gray-300 text-gray-900"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Mobile: Stack below content, Desktop: 1/3 width */}
            <div className="space-y-6">
              {/* Category */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4 bg-white">
                  <CardTitle className="text-lg flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    Category *
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-white">
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      {categories.map((category) => (
                        <SelectItem key={category.slug} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4 bg-white">
                  <CardTitle className="text-lg flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Featured Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 bg-white">
                  <div>
                    <Label htmlFor="image" className="text-sm font-medium text-gray-900">Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                      className="mt-2 bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                  {formData.image && (
                    <div className="mt-4">
                      <img
                        src={formData.image}
                        alt="Featured image preview"
                        className="w-full h-32 object-cover rounded-md border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4 bg-white">
                  <CardTitle className="text-lg flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-white">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a tag..."
                        className="flex-1 bg-white border-gray-300 text-gray-900"
                      />
                      <Button onClick={addTag} size="sm" variant="outline">
                        Add
                      </Button>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-900">Current Tags:</Label>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs">
                              {tag}
                              <X 
                                className="h-3 w-3 cursor-pointer hover:text-red-600" 
                                onClick={() => removeTag(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Publish Actions - Mobile: Show at bottom, Desktop: Show in sidebar */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4 bg-white">
                  <CardTitle className="text-lg">Publish</CardTitle>
                  <CardDescription className="text-sm">
                    Ready to publish your post?
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-white">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-900">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="mt-2 bg-white border-gray-300 text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      onClick={savePost}
                      disabled={loading}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {formData.status === 'published' ? 'Publish Post' : 'Save Draft'}
                        </>
                      )}
                    </Button>
                    
                    {formData.title && formData.slug && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        asChild
                      >
                        <Link href={`/industry-insight/${formData.slug}`} target="_blank">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview Post
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* AI Assistant Floating Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setShowAIAssistant(true)}
            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full w-14 h-14"
            size="lg"
          >
            <Sparkles className="w-6 h-6" />
          </Button>
        </div>

        {/* AI Assistant Modal */}
        {showAIAssistant && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white border border-gray-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-teal-600 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-6 h-6" />
                    <div>
                      <CardTitle>AI Blog Assistant</CardTitle>
                      <CardDescription className="text-teal-100">
                        Get AI-powered suggestions for your blog content
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
              <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-white">
                <div className="space-y-6">
                  {/* AI Mode Selection */}
                  <div>
                    <Label className="text-sm font-medium">What would you like help with?</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                      <Button
                        variant={aiMode === 'content' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAiMode('content')}
                        className="flex flex-col items-center p-4 h-auto"
                      >
                        <FileText className="w-5 h-5 mb-2" />
                        <span className="text-xs">Full Content</span>
                      </Button>
                      <Button
                        variant={aiMode === 'outline' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAiMode('outline')}
                        className="flex flex-col items-center p-4 h-auto"
                      >
                        <Lightbulb className="w-5 h-5 mb-2" />
                        <span className="text-xs">Outline</span>
                      </Button>
                      <Button
                        variant={aiMode === 'title' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAiMode('title')}
                        className="flex flex-col items-center p-4 h-auto"
                      >
                        <Tag className="w-5 h-5 mb-2" />
                        <span className="text-xs">Title Ideas</span>
                      </Button>
                      <Button
                        variant={aiMode === 'seo' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAiMode('seo')}
                        className="flex flex-col items-center p-4 h-auto"
                      >
                        <Eye className="w-5 h-5 mb-2" />
                        <span className="text-xs">SEO</span>
                      </Button>
                    </div>
                  </div>

                  {/* Context Input */}
                  <div>
                    <Label htmlFor="aiContext" className="text-sm font-medium">
                      Topic or Additional Context
                    </Label>
                    <Textarea
                      id="aiContext"
                      value={aiContext}
                      onChange={(e) => setAiContext(e.target.value)}
                      placeholder="Describe your blog topic, target audience, key points to cover, etc."
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  {/* Blog Info Display */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Current Blog Info:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Title:</span> {formData.title || 'Not set'}
                      </div>
                      <div>
                        <span className="text-gray-600">Category:</span> {formData.category || 'Not set'}
                      </div>
                      <div>
                        <span className="text-gray-600">Tags:</span> {formData.tags.length}
                      </div>
                      <div>
                        <span className="text-gray-600">Content:</span> {formData.content ? `${formData.content.length} chars` : 'Empty'}
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={generateAISuggestions}
                    disabled={aiLoading || (!formData.title && !aiContext)}
                    className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
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
                      
                      <div className="flex gap-2">
                        {aiMode === 'content' && (
                          <>
                            <Button
                              onClick={() => applyAISuggestion('content')}
                              size="sm"
                              className="flex-1"
                            >
                              Apply to Content
                            </Button>
                            <Button
                              onClick={() => applyAISuggestion('excerpt')}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              Apply to Excerpt
                            </Button>
                          </>
                        )}
                        {aiMode === 'title' && (
                          <Button
                            onClick={() => applyAISuggestion('title')}
                            size="sm"
                            className="flex-1"
                          >
                            Apply First Title
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {!formData.title && !aiContext && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        Please enter a blog title or provide context to get AI suggestions.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  );
}