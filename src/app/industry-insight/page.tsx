'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageLayout from '@/components/shared/PageLayout';
import HeroSection from '@/components/shared/HeroSection';
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  Star,
  CheckCircle,
  Zap,
  Target,
  Brain,
  Rocket,
  Calendar,
  User,
  Search,
  Filter,
  Lightbulb,
  MessageSquare,
  Eye,
  Clock,
  Loader2,
  Mail
} from 'lucide-react';

// Blog post interface
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  published_date: string;
  category: string;
  tags: string[];
  featured_image?: string;
  read_time?: number;
  views?: number;
  slug: string;
}

export default function IndustryInsight() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        badge={{
          icon: <Lightbulb className="w-4 h-4" />,
          text: "Industry Insights"
        }}
        title="Stay Ahead with"
        highlightText="Expert Insights"
        description="Discover the latest trends, best practices, and thought leadership in AI, Agile, and organizational transformation from our team of industry experts."
        primaryCTA={{
          text: "Explore All Insights",
          href: "#insights"
        }}
        secondaryCTA={{
          text: "Subscribe to Updates",
          href: "#newsletter",
          icon: <ArrowRight className="w-4 h-4" />
        }}
        backgroundVariant="gradient"
        customColors={{
          background: "bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50",
          accent: "bg-gradient-to-br from-purple-400/20 to-violet-400/25",
          particles: "bg-gradient-to-r from-purple-400 to-violet-400"
        }}
      />

      {/* Industry Leaders Speak Section */}
      <IndustryLeadersSection />

      {/* Blog Posts Section */}
      <BlogPostsSection />

      {/* Newsletter Section */}
      <NewsletterSection />
    </PageLayout>
  );
}

// Industry Leaders Section Component
function IndustryLeadersSection() {
  const quotes = [
    {
      quote: "You're going to lose your job to someone who is using AI.",
      author: "Jensen Huang",
      title: "CEO of Nvidia",
      initials: "JH",
      gradient: "from-red-500 to-orange-500",
      bgGradient: "from-red-50 to-orange-50",
      category: "Urgency"
    },
    {
      quote: "AI is not going to replace managers, but managers who use AI will replace the managers who do not.",
      author: "Rob Thomas",
      title: "IBM Senior Vice President",
      initials: "RT",
      gradient: "from-blue-600 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
      category: "Leadership"
    },
    {
      quote: "AI could eliminate up to 50% of entry-level white-collar jobs within the next five years.",
      author: "Dario Amodei",
      title: "CEO of Anthropic",
      initials: "DA",
      gradient: "from-purple-600 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
      category: "Future Impact"
    },
    {
      quote: "The real value of AI will be in its ability to empower humans to make better decisions faster.",
      author: "Peter Diamandis",
      title: "Entrepreneur and Engineer",
      initials: "PD",
      gradient: "from-green-600 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      category: "Empowerment"
    },
    {
      quote: "There's a lot of automation that can happen that isn't a replacement of humans, but of mind-numbing behavior.",
      author: "Stewart Butterfield",
      title: "CEO & Co-Founder of Slack",
      initials: "SB",
      gradient: "from-yellow-600 to-orange-600",
      bgGradient: "from-yellow-50 to-orange-50",
      category: "Automation"
    },
    {
      quote: "AI will be one of humanity's most consequential technologies, transforming virtually every industry and aspect of civilization.",
      author: "Carl Benedikt Frey",
      title: "Economist and Author",
      initials: "CF",
      gradient: "from-teal-600 to-cyan-600",
      bgGradient: "from-teal-50 to-cyan-50",
      category: "Transformation"
    },
    {
      quote: "Superhuman innovation is about humans and AI working together to achieve outcomes neither could alone.",
      author: "Chris Duffey",
      title: "Author and AI Technologist",
      initials: "CD",
      gradient: "from-cyan-600 to-blue-600",
      bgGradient: "from-cyan-50 to-blue-50",
      category: "Collaboration"
    },
    {
      quote: "Adaptive leadership is essential in navigating structural transformations within global economies and organizations.",
      author: "Olaf Groth",
      title: "Futurist and Strategist",
      initials: "OG",
      gradient: "from-gray-600 to-slate-600",
      bgGradient: "from-gray-50 to-slate-50",
      category: "Adaptation"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-teal-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50 mb-8">
            <MessageSquare className="w-5 h-5 text-blue-600 mr-3" />
            <span className="text-gray-700 font-medium">Industry Leaders Speak</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            What Top Leaders Say About
            <span className="block bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              AI Reskilling
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Hear from industry visionaries and thought leaders about the urgent need for AI reskilling and the transformation happening across white-collar professions.
          </p>
        </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {quotes.map((item, index) => (
            <div
              key={index}
              className={`group relative animate-fade-in-up bg-gradient-to-br ${item.bgGradient} border border-gray-200/50 rounded-2xl p-8 transition-all hover:scale-105 hover:shadow-xl`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Category Badge */}
              <div className="mb-6">
                <Badge className={`bg-gradient-to-r ${item.gradient} text-white border-0 shadow-lg`}>
                  {item.category}
                </Badge>
              </div>

              {/* Quote */}
              <blockquote className="text-lg md:text-xl font-semibold text-gray-900 italic mb-8 leading-relaxed">
                "{item.quote}"
              </blockquote>

              {/* Author */}
              <cite className="flex items-center not-italic">
                <div className={`w-12 h-12 bg-gradient-to-r ${item.gradient} rounded-full flex items-center justify-center mr-4 text-white font-bold shadow-lg group-hover:scale-110 transition-transform`}>
                  {item.initials}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-lg">{item.author}</div>
                  <div className="text-gray-600 text-sm">{item.title}</div>
                </div>
              </cite>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="max-w-3xl mx-auto p-8 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Don't Get Left Behind
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              The future belongs to those who embrace AI and reskill themselves. Start your transformation journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                asChild
              >
                <Link href="/courses">
                  <span className="flex items-center justify-center text-white font-semibold">
                    Explore Courses
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-gray-300 text-white bg-gray-800 hover:border-teal-500 hover:bg-teal-600 hover:text-white px-8 py-4 rounded-xl transition-all hover:scale-105"
                asChild
              >
                <Link href="/coaching">
                  <span className="flex items-center justify-center text-white">
                    <Users className="mr-2 h-5 w-5 text-white" />
                    Get Coaching
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Blog Posts Section Component
function BlogPostsSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog?limit=9&offset=0');
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultImage = (category: string) => {
    const categoryColors = {
      'AI': '3B82F6',
      'Agile': '10B981',
      'Leadership': '8B5CF6',
      'Technology': 'F59E0B',
      'Business': 'EF4444',
      'default': '6B7280'
    };
    
    const color = categoryColors[category as keyof typeof categoryColors] || categoryColors.default;
    const encodedTitle = encodeURIComponent(category);
    return `https://placehold.co/400x250/${color}/FFFFFF/png?text=${encodedTitle}`;
  };

  const createPostSlug = (title: string) => {
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

  // Filter posts based on search and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(posts.map(post => post.category)))];

  return (
    <section id="insights" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Industry Insights
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay informed with our expert analysis and thought leadership on the latest trends in AI, Agile, and organizational transformation.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white text-gray-900 border-gray-300 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            {/* Category Filter */}
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="text-gray-900">{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          {!loading && (
            <p className="text-gray-600 text-center">
              {filteredPosts.length} insight{filteredPosts.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading insights...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={fetchPosts} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'All' ? 'No matching insights found' : 'No insights available'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Check back soon for new insights!'}
            </p>
          </div>
        )}

        {!loading && !error && filteredPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <Card key={post.id} className="card-hover-optimized bg-white/90 border-0 shadow-lg overflow-hidden rounded-xl group h-full flex flex-col">
                {/* Post Image */}
                <div className="relative overflow-hidden h-48">
                  <img 
                    src={post.featured_image || getDefaultImage(post.category)}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getDefaultImage(post.category);
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-gray-900 border font-medium">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                
                {/* Post Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <CardHeader className="p-0 mb-4 flex-1">
                    <CardTitle className="text-xl text-blue-600 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed text-gray-600 line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  
                  {/* Post Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(post.published_date)}</span>
                    </div>
                  </div>
                  
                  {/* Read More Button */}
                  <Button 
                    asChild 
                    className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 mt-auto"
                  >
                    <Link href={`/industry-insight/${post.slug}`}>
                      <span className="flex items-center justify-center text-white font-semibold">
                        Read More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </span>
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Newsletter Section Component
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setEmail('');
    
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <section id="newsletter" className="py-20 bg-gradient-to-r from-teal-600 to-blue-600 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-white/10 rounded-lg blur-lg"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Updated with Industry Insights
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Get the latest trends, best practices, and expert insights delivered directly to your inbox.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardContent className="p-8">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Successfully Subscribed!</h3>
                  <p className="text-white/80">You'll receive our latest insights in your inbox.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="email" className="sr-only">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                      required
                    />
                  </div>
                  <Button 
                    type="submit"
                    size="lg" 
                    disabled={isSubmitting}
                    className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-5 w-5" />
                        Subscribe
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
} 