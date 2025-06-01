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
import { ArrowLeft, Save, Eye, X, FileText, Tag, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access this page.
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
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Create New Post</h1>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Write and publish a new blog post</p>
              </div>
            </div>
            <div className="flex space-x-2 sm:space-x-3">
              <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
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
                className="flex-1 sm:flex-none"
              >
                <Save className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Save Post</span>
                <span className="sm:hidden">Save</span>
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
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription className="text-sm">
                  Enter the main details for your blog post
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter post title..."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="slug" className="text-sm font-medium">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-friendly-slug"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL: /industry-insight/{formData.slug || 'your-post-slug'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="excerpt" className="text-sm font-medium">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of the post..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Content *
                </CardTitle>
                <CardDescription className="text-sm">
                  Write your blog post content. You can use HTML tags for formatting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your blog post content here... You can use HTML tags like <h2>, <p>, <strong>, <ul>, <li>, etc."
                  className="min-h-[300px] sm:min-h-[400px]"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Estimated reading time: {Math.ceil(formData.content.split(' ').length / 200)} minutes
                </p>
              </CardContent>
            </Card>

            {/* SEO - Mobile: Show after content, Desktop: Show after content */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">SEO Settings</CardTitle>
                <CardDescription className="text-sm">
                  Optimize your post for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meta_title" className="text-sm font-medium">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="SEO title (defaults to post title)"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="meta_description" className="text-sm font-medium">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="SEO description (defaults to excerpt)"
                    className="mt-2"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Mobile: Stack below content, Desktop: 1/3 width */}
          <div className="space-y-6">
            {/* Category */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Category *
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
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
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Featured Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image" className="text-sm font-medium">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="mt-2"
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
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag..."
                      className="flex-1"
                    />
                    <Button onClick={addTag} size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Current Tags:</Label>
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
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Publish</CardTitle>
                <CardDescription className="text-sm">
                  Ready to publish your post?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
    </div>
  );
} 