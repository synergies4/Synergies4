'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import PageLayout from '@/components/shared/PageLayout';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  BookOpen,
  Tag,
  Eye,
  Heart,
  MessageSquare,
  Loader2,
  ChevronRight
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  published_date: string;
  read_time: number;
  featured_image?: string;
  views?: number;
  likes?: number;
}

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  published_date: string;
  read_time: number;
  featured_image?: string;
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogPost();
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      
      // Fetch all blog posts to find the one with matching slug
      const response = await fetch('/api/blog');
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      
      const data = await response.json();
      const foundPost = data.posts?.find((p: BlogPost) => 
        createSlug(p.title) === slug
      );
      
      if (!foundPost) {
        setError('Blog post not found');
        return;
      }
      
      setPost(foundPost);
      
      // Fetch related posts (same category, excluding current post)
      const related = data.posts
        ?.filter((p: BlogPost) => p.category === foundPost.category && p.id !== foundPost.id)
        ?.slice(0, 3) || [];
      setRelatedPosts(related);
      
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setError('Failed to load blog post. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDefaultImage = (category: string) => {
    const categoryColors = {
      'Agile Transformation': '15803d',
      'Leadership': 'ec4899',
      'Product Management': '0ea5e9',
      'Technology': 'f59e0b',
      'Business Strategy': '6366f1',
      'Industry Insights': '8b5cf6',
      'default': '6b7280'
    };
    
    const color = categoryColors[category as keyof typeof categoryColors] || categoryColors.default;
    const encodedTitle = encodeURIComponent(category);
    return `https://placehold.co/1200x600/${color}/FFFFFF/png?text=${encodedTitle}`;
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading blog post...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !post) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Post Not Found</CardTitle>
              <CardDescription className="text-center">
                {error || "The blog post you're looking for doesn't exist."}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/industry-insight">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
            <div className="absolute bottom-20 left-10 w-24 h-24 bg-white/10 rounded-lg blur-lg animate-float-delayed"></div>
          </div>

          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm text-gray-300 mb-8">
                <Link href="/industry-insight" className="hover:text-white transition-colors">
                  Industry Insights
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">{post.title}</span>
              </div>

              {/* Category and Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Badge className="bg-blue-600 text-white">
                  {post.category}
                </Badge>
                <div className="flex items-center text-gray-300 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(post.published_date)}
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  {post.read_time} min read
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <User className="w-4 h-4 mr-2" />
                  {post.author}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-xl text-gray-200 leading-relaxed mb-8">
                {post.excerpt}
              </p>

              {/* Actions */}
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                {post.views && (
                  <div className="flex items-center text-gray-300 text-sm">
                    <Eye className="w-4 h-4 mr-2" />
                    {post.views.toLocaleString()} views
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Featured Image */}
                {post.featured_image && (
                  <div className="mb-12">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-96 object-cover rounded-2xl shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getDefaultImage(post.category);
                      }}
                    />
                  </div>
                )}

                {/* Article Content */}
                <article className="prose prose-lg max-w-none">
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
                  />
                </article>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Author Bio */}
                <div className="mt-12 p-6 bg-blue-50 rounded-2xl">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{post.author}</h3>
                      <p className="text-gray-600 mt-1">
                        Expert in {post.category.toLowerCase()} with years of industry experience. 
                        Passionate about sharing insights and helping organizations transform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="w-5 h-5 mr-2" />
                        Related Posts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {relatedPosts.map((relatedPost) => (
                        <Link
                          key={relatedPost.id}
                          href={`/blog/${createSlug(relatedPost.title)}`}
                          className="block group"
                        >
                          <div className="space-y-2">
                            {relatedPost.featured_image && (
                              <img
                                src={relatedPost.featured_image}
                                alt={relatedPost.title}
                                className="w-full h-32 object-cover rounded-lg"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = getDefaultImage(relatedPost.category);
                                }}
                              />
                            )}
                            <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {relatedPost.title}
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {relatedPost.excerpt}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {relatedPost.read_time} min read
                            </div>
                          </div>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Newsletter Signup */}
                <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                  <CardHeader>
                    <CardTitle>Stay Updated</CardTitle>
                    <CardDescription className="text-blue-100">
                      Get the latest insights delivered to your inbox
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                      Subscribe to Newsletter
                    </Button>
                  </CardContent>
                </Card>

                {/* Back to Blog */}
                <Card>
                  <CardContent className="pt-6">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/industry-insight">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to All Posts
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
} 