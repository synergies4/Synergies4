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
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  X, 
  FileText, 
  Tag, 
  Image as ImageIcon, 
  Sparkles, 
  Brain, 
  Lightbulb, 
  Copy, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Home,
  Shield,
  Clock,
  User,
  Globe,
  Search
} from 'lucide-react';
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
  const { user, userProfile, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
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

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Title and fundamentals', icon: FileText },
    { number: 2, title: 'Content', description: 'Main post content', icon: Sparkles },
    { number: 3, title: 'Media & Tags', description: 'Images and categorization', icon: ImageIcon },
    { number: 4, title: 'SEO & Review', description: 'Optimization and final review', icon: Search }
  ];

  const defaultCategories = [
    { name: 'Agile & Scrum', slug: 'agile-scrum', color: 'bg-blue-100 text-blue-800' },
    { name: 'Leadership', slug: 'leadership', color: 'bg-purple-100 text-purple-800' },
    { name: 'Product Management', slug: 'product-management', color: 'bg-green-100 text-green-800' },
    { name: 'Mental Fitness', slug: 'mental-fitness', color: 'bg-pink-100 text-pink-800' },
    { name: 'Technology', slug: 'technology', color: 'bg-orange-100 text-orange-800' },
    { name: 'Business Strategy', slug: 'business-strategy', color: 'bg-teal-100 text-teal-800' }
  ];

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || userProfile?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    
    fetchCategories();
  }, [user, userProfile, authLoading, router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories?.length ? data.categories : defaultCategories);
      } else {
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(defaultCategories);
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.title) errors.title = 'Post title is required';
      if (!formData.slug) errors.slug = 'URL slug is required';
      if (!formData.excerpt) errors.excerpt = 'Post excerpt is required';
    }
    
    if (step === 2) {
      if (!formData.content) errors.content = 'Post content is required';
      if (formData.content.split(' ').length < 50) errors.content = 'Content should be at least 50 words';
    }
    
    if (step === 3) {
      if (!formData.category) errors.category = 'Category is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
    
    if (formErrors.title) {
      setFormErrors(prev => ({ ...prev, title: '' }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
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
        setShowAIAssistant(true);
      } else {
        setAiSuggestions('Sorry, I encountered an error generating suggestions. Please try again.');
        setShowAIAssistant(true);
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
      setAiSuggestions('Sorry, I encountered an error generating suggestions. Please try again.');
      setShowAIAssistant(true);
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestion = (field: string) => {
    if (field === 'content') {
      setFormData(prev => ({ ...prev, content: aiSuggestions }));
    } else if (field === 'excerpt') {
      const excerpt = aiSuggestions.split('\n\n')[0].substring(0, 300) + '...';
      setFormData(prev => ({ ...prev, excerpt }));
    } else if (field === 'title') {
      const firstTitle = aiSuggestions.split('\n')[0].replace(/^\d+\.\s*/, '');
      setFormData(prev => ({ ...prev, title: firstTitle, slug: generateSlug(firstTitle) }));
    }
    setShowAIAssistant(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const savePost = async (status: string = 'draft') => {
    if (!validateStep(currentStep)) return;
    
    if (!formData.title || !formData.content || !formData.category) {
      alert('Please fill in all required fields (title, content, category)');
      return;
    }

    try {
      setLoading(true);
      
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
          status,
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
              You don't have permission to access this page.
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
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-gray-900 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-teal-600" />
                Post Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., 10 Essential Agile Leadership Principles for 2024"
                className={`bg-white border-2 ${formErrors.title ? 'border-red-300' : 'border-gray-200'} focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium`}
              />
              {formErrors.title && <p className="text-red-600 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-semibold text-gray-900 flex items-center">
                <Globe className="w-4 h-4 mr-2 text-blue-600" />
                URL Slug *
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="url-friendly-slug"
                className={`bg-white border-2 ${formErrors.slug ? 'border-red-300' : 'border-gray-200'} focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium`}
              />
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded border">
                <strong>Preview URL:</strong> /industry-insight/{formData.slug || 'your-post-slug'}
              </p>
              {formErrors.slug && <p className="text-red-600 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.slug}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt" className="text-sm font-semibold text-gray-900 flex items-center">
                <Eye className="w-4 h-4 mr-2 text-purple-600" />
                Post Excerpt *
              </Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Write a compelling summary that will appear in post previews and search results..."
                className={`bg-white border-2 ${formErrors.excerpt ? 'border-red-300' : 'border-gray-200'} focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium min-h-[120px]`}
                rows={4}
              />
              <p className="text-xs text-gray-600">{formData.excerpt.length}/300 characters</p>
              {formErrors.excerpt && <p className="text-red-600 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.excerpt}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content" className="text-sm font-semibold text-gray-900 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-teal-600" />
                  Post Content *
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAiMode('content');
                      generateAISuggestions();
                    }}
                    disabled={aiLoading}
                    className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  >
                    {aiLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Brain className="w-3 h-3 mr-1" />}
                    AI Content
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAiMode('outline');
                      generateAISuggestions();
                    }}
                    disabled={aiLoading}
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <Lightbulb className="w-3 h-3 mr-1" />
                    AI Outline
                  </Button>
                </div>
              </div>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your comprehensive blog post content here... 

You can use HTML tags for formatting:
- <h2>Section Headings</h2>
- <p>Paragraphs</p>
- <strong>Bold text</strong>
- <ul><li>Bullet points</li></ul>
- <a href='#'>Links</a>"
                className={`bg-white border-2 ${formErrors.content ? 'border-red-300' : 'border-gray-200'} focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium min-h-[400px]`}
                rows={20}
              />
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Words: {formData.content.split(' ').filter(w => w.length > 0).length}</span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Estimated reading time: {Math.ceil(formData.content.split(' ').length / 200)} minutes
                </span>
              </div>
              {formErrors.content && <p className="text-red-600 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.content}</p>}
            </div>

            {/* AI Context for better suggestions */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-purple-900 flex items-center">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Writing Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="ai-context" className="text-xs font-medium text-gray-700">
                    Provide context for better AI suggestions (optional)
                  </Label>
                  <Textarea
                    id="ai-context"
                    value={aiContext}
                    onChange={(e) => setAiContext(e.target.value)}
                    placeholder="e.g., Focus on remote teams, include case studies, target mid-level managers..."
                    className="bg-white border border-purple-200 text-gray-900 text-sm"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold text-gray-900 flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-teal-600" />
                  Category *
                </Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className={`bg-white border-2 ${formErrors.category ? 'border-red-300' : 'border-gray-200'} focus:border-teal-500 text-gray-900`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categories.map((category) => (
                      <SelectItem key={category.slug} value={category.name}>
                        <div className="flex items-center">
                          <Badge className={`${category.color} mr-2 text-xs`}>
                            {category.name}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && <p className="text-red-600 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{formErrors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900 flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-blue-600" />
                  Tags
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag..."
                    className="bg-white border-2 border-gray-200 focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium"
                  />
                  <Button 
                    onClick={addTag} 
                    size="sm" 
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium"
                  >
                    Add
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700">Current Tags:</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs bg-teal-100 text-teal-800">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-semibold text-gray-900 flex items-center">
                <ImageIcon className="w-4 h-4 mr-2 text-purple-600" />
                Featured Image URL
              </Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="https://example.com/featured-image.jpg"
                className="bg-white border-2 border-gray-200 focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium"
              />
              {formData.image && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Image Preview:</p>
                  <img
                    src={formData.image}
                    alt="Featured image preview"
                    className="w-full max-w-lg h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        const selectedCategory = categories.find(cat => cat.name === formData.category);
        return (
          <div className="space-y-6">
            {/* SEO Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-blue-900 flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  SEO Optimization
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Optimize your post for search engines and social sharing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title" className="text-sm font-semibold text-gray-900">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => handleInputChange('meta_title', e.target.value)}
                    placeholder="SEO title (defaults to post title if empty)"
                    className="bg-white border-2 border-gray-200 focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium"
                  />
                  <p className="text-xs text-gray-600">{(formData.meta_title || formData.title).length}/60 characters (recommended)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description" className="text-sm font-semibold text-gray-900">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                    placeholder="SEO description (defaults to excerpt if empty)"
                    className="bg-white border-2 border-gray-200 focus:border-teal-500 text-gray-900 placeholder-gray-500 font-medium"
                    rows={3}
                  />
                  <p className="text-xs text-gray-600">{(formData.meta_description || formData.excerpt).length}/160 characters (recommended)</p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAiMode('seo');
                    generateAISuggestions();
                  }}
                  disabled={aiLoading}
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  {aiLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                  Generate SEO with AI
                </Button>
              </CardContent>
            </Card>

            {/* Review Section */}
            <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-teal-900 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Post Review
                </CardTitle>
                <CardDescription className="text-teal-700">
                  Review your post before publishing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Title</p>
                      <p className="text-lg font-bold text-gray-900">{formData.title || 'Untitled Post'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Category</p>
                      {selectedCategory && (
                        <Badge className={`${selectedCategory.color} text-sm`}>
                          {selectedCategory.name}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Tags</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.tags.length > 0 ? (
                          formData.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No tags added</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Reading Time</p>
                      <p className="text-gray-900 font-medium flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-blue-600" />
                        {Math.ceil(formData.content.split(' ').length / 200)} minutes
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Word Count</p>
                      <p className="text-gray-900 font-medium">{formData.content.split(' ').filter(w => w.length > 0).length} words</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">URL Slug</p>
                      <p className="text-gray-900 font-medium text-sm break-all">/industry-insight/{formData.slug}</p>
                    </div>
                  </div>
                </div>

                {formData.excerpt && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">Excerpt Preview</p>
                    <div className="bg-white p-4 rounded-lg border max-h-24 overflow-y-auto">
                      <p className="text-gray-900 text-sm">{formData.excerpt}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-teal-700 bg-clip-text text-transparent">
                    Create New Post
                  </h1>
                  <p className="text-gray-600 font-medium">Write and publish engaging blog content</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild className="bg-white/80 border-2 border-teal-200 hover:bg-teal-50 hover:border-teal-400 text-gray-900 font-medium">
                  <Link href="/admin/blog">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Blog
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
                        onClick={() => savePost('draft')}
                        disabled={loading}
                        variant="outline"
                        className="bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-900 font-medium"
                      >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save as Draft
                      </Button>
                      <Button
                        onClick={() => savePost('published')}
                        disabled={loading}
                        className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium px-8"
                      >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                        Publish Post
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Modal */}
        {showAIAssistant && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden bg-white shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-purple-900">
                    <Brain className="w-5 h-5 mr-2" />
                    AI Writing Assistant
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAIAssistant(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap font-medium">{aiSuggestions}</pre>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => applyAISuggestion('content')}
                      className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium"
                    >
                      Apply to Content
                    </Button>
                    <Button
                      onClick={() => applyAISuggestion('excerpt')}
                      variant="outline"
                      className="border-2 border-teal-200 text-teal-700 hover:bg-teal-50"
                    >
                      Use as Excerpt
                    </Button>
                    <Button
                      onClick={() => copyToClipboard(aiSuggestions)}
                      variant="outline"
                      className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  );
}