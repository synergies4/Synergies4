'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowLeft, 
  Share2, 
  BookOpen, 
  Tag,
  MessageSquare,
  Menu,
  X
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  tags: string[];
  published_at: string;
  created_at: string;
  updated_at: string;
  reading_time: number;
  meta_title: string;
  meta_description: string;
  author_id: string;
}

export default function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (resolvedParams.slug) {
      fetchPost();
    }
  }, [resolvedParams.slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/${resolvedParams.slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Blog post not found');
        } else {
          setError('Error loading blog post');
        }
        return;
      }

      const data = await response.json();
      setPost(data.post);

      // Fetch related posts
      if (data.post.category) {
        fetchRelatedPosts(data.post.category, data.post.id);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Error loading blog post');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (category: string, currentPostId: string) => {
    try {
      const response = await fetch(`/api/blog?category=${encodeURIComponent(category)}&limit=3`);
      if (response.ok) {
        const data = await response.json();
        // Filter out current post
        const filtered = data.posts.filter((p: BlogPost) => p.id !== currentPostId);
        setRelatedPosts(filtered.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sharePost = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="bg-gray-200 h-8 rounded mb-4 w-3/4"></div>
              <div className="bg-gray-200 h-64 rounded mb-8"></div>
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-4 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {error || 'Post Not Found'}
            </h1>
            <p className="text-gray-600 mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/industry-insight">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Countdown Banner */}
      <div 
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <p
              className="text-sm md:text-base"
            >
              🚀 Expand your potential through learning. Offering earlybirds a discount of $295.00.
            </p>
            <div
              className="flex gap-2"
            >
              {['00 Days', '00 Hours', '00 Minutes', '00 Seconds'].map((time, index) => (
                <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                  {time}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav 
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center"
            >
              <Link href="/" className="flex items-center">
                <span 
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  Synergies4
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['About Us', 'Courses', 'Coaching', 'Consulting', 'Industry Insight'].map((item, index) => (
                <div
                  key={item}
                  className={`text-gray-600 hover:text-blue-600 transition-colors font-medium ${
                    item === 'Industry Insight' ? 'text-blue-600 font-semibold' : ''
                  }`}
                >
                  <Link 
                    href={
                      item === 'About Us' ? '/about-us' :
                      item === 'Courses' ? '/courses' :
                      item === 'Coaching' ? '/coaching' : 
                      item === 'Consulting' ? '/consulting' : 
                      item === 'Industry Insight' ? '/industry-insight' :
                      `/${item.toLowerCase().replace(' ', '-')}`
                    } 
                  >
                    {item}
                  </Link>
                </div>
              ))}
              
              {/* Distinctive Contact Button */}
              <div>
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                >
                  <Link href="/contact">
                    {/* Subtle shine effect */}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                    <span className="relative z-10 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Desktop Auth */}
            <div 
              className="hidden md:flex items-center space-x-3"
            >
              {user ? (
                <UserAvatar />
              ) : (
                <>
                  <Button variant="ghost" asChild className="hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 transition-colors">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div
              className="md:hidden border-t bg-white/95 backdrop-blur-md overflow-hidden"
            >
              <div className="px-4 py-4 space-y-4">
                {['About Us', 'Courses', 'Coaching', 'Consulting', 'Industry Insight'].map((item) => (
                  <Link
                    key={item}
                    href={
                      item === 'About Us' ? '/about-us' :
                      item === 'Courses' ? '/courses' :
                      item === 'Coaching' ? '/coaching' : 
                      item === 'Consulting' ? '/consulting' : 
                      item === 'Industry Insight' ? '/industry-insight' :
                      `/${item.toLowerCase().replace(' ', '-')}`
                    }
                    className={`block text-gray-600 hover:text-blue-600 transition-colors font-medium py-2 text-lg ${
                      item === 'Industry Insight' ? 'text-blue-600 font-semibold' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
                
                {/* Distinctive Contact Button for Mobile */}
                <div className="pt-2">
                  <Button 
                    asChild 
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group text-lg py-3"
                  >
                    <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                      {/* Subtle shine effect */}
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                      <span className="relative z-10 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Us
                      </span>
                    </Link>
                  </Button>
                </div>
                
                {/* Mobile Auth */}
                <div className="pt-4 border-t space-y-3">
                  {user ? (
                    <div className="flex items-center space-x-2">
                      <UserAvatar />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button variant="ghost" className="w-full justify-start text-lg py-3" asChild>
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                          Login
                        </Link>
                      </Button>
                      <Button className="w-full text-lg py-3" asChild>
                        <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div
            className="max-w-4xl mx-auto"
          >
            <Button variant="ghost" asChild className="mb-6">
              <Link href="/industry-insight">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Industry Insights
              </Link>
            </Button>
            
            <div className="max-w-4xl mx-auto">
              <Badge className="mb-4" style={{ backgroundColor: '#3B82F6' }}>
                {post.category}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>
              
              {post.excerpt && (
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-6 text-gray-500 mb-8">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="font-medium">Author</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>{post.reading_time} min read</span>
                </div>
                <Button variant="ghost" size="sm" onClick={sharePost}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.image && (
        <section className="bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div
                className="mt-12 pt-8 border-t"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600 font-medium">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Related Articles
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <div
                    key={relatedPost.id}
                    className="hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={relatedPost.image || `https://placehold.co/400x250/3B82F6/FFFFFF/png?text=${encodeURIComponent(relatedPost.title)}`}
                        alt={relatedPost.title}
                        className="w-full h-48 object-cover"
                      />
                      <Badge className="absolute top-4 left-4 bg-white text-gray-900">
                        {relatedPost.category}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">
                        <Link 
                          href={`/industry-insight/${relatedPost.slug}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {relatedPost.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {relatedPost.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{formatDate(relatedPost.published_at)}</span>
                        <span>{relatedPost.reading_time} min read</span>
                      </div>
                    </CardContent>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Skills?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Explore our AI-powered courses and take your career to the next level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/courses">
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Courses
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/industry-insight">
                <ArrowLeft className="mr-2 h-5 w-5" />
                More Articles
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="bg-gray-900 text-white py-16"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <span 
                className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 block"
              >
                Synergies4
              </span>
              <p className="text-gray-400 mb-4">
                AI-powered learning tailored uniquely to you and your organization.
              </p>
              <div className="flex space-x-4">
                {['Facebook', 'Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                  <a key={social} href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">{social}</span>
                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Courses</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Agile & Scrum</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Product Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Leadership</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Analysis</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about-us" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/coaching" className="hover:text-white transition-colors">Coaching</Link></li>
                <li><Link href="/consulting" className="hover:text-white transition-colors">Consulting</Link></li>
              </ul>
              
              {/* Distinctive Contact Button in Footer */}
              <div className="mt-6">
                <Button 
                  asChild 
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group w-full"
                >
                  <Link href="/contact">
                    {/* Subtle shine effect */}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                    <span className="relative z-10 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact Us
                    </span>
                  </Link>
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <Separator className="bg-gray-800 mb-8" />

          <div 
            className="text-center text-gray-400"
          >
            <p>&copy; {new Date().getFullYear()} Synergies4 LLC. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Synergies4™, PocketCoachAI™, Adaptive Content Pods™ are trademarks of Synergies4 LLC.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
} 