'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout, { StatsSection } from '@/components/shared/PageLayout';
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
  Clock,
  MessageSquare,
  GraduationCap,
  Globe,
  BarChart3
} from 'lucide-react';
import HeroSection from '@/components/shared/HeroSection';

// Updated with AI assistance features - Build trigger
export default function HomePage() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 md:py-20">
        {/* Simple Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3B82F6 2px, transparent 2px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-4 md:mb-6 bg-blue-100/90 backdrop-blur-sm text-blue-700 hover:bg-blue-200/90 border border-blue-200/50">
            <Zap className="w-4 h-4 mr-2" />
            AI-Powered Learning Platform
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
            Build Skills That{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Set You Apart
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
            Learn practical frameworks in Agile, leadership, and mental fitness that teams and leaders actually use.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
              asChild
            >
              <Link href="/courses">
                Boost Your Career – Explore Courses
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
              </Link>
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
              asChild
            >
              <Link href="/synergize">
                <Brain className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Try Synergize AI
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <ValuePropositionsSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Featured Courses */}
      <FeaturedCoursesSection />

      {/* Certifications */}
      <CertificationsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Partners */}
      <PartnersSection />

      {/* CTA Section */}
      <CTASection />
    </PageLayout>
  );
}

// Value Propositions Section
function ValuePropositionsSection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Simple Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #3B82F6 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, #8B5CF6 2px, transparent 2px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Why Choose Synergies4?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We're not just another training company. We're your AI-powered partners in creating personalized learning journeys.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Brain className="h-8 w-8" />,
              title: "AI-Powered Learning",
              description: "Personalized learning paths powered by artificial intelligence to accelerate your growth."
            },
            {
              icon: <Target className="h-8 w-8" />,
              title: "Practical Skills",
              description: "Learn frameworks and methodologies that you can immediately apply in your work."
            },
            {
              icon: <Users className="h-8 w-8" />,
              title: "Expert Instructors",
              description: "Learn from industry leaders with real-world experience in their fields."
            },
            {
              icon: <Award className="h-8 w-8" />,
              title: "Recognized Certifications",
              description: "Earn certificates that are valued by employers and industry professionals."
            }
          ].map((item, index) => (
            <Card key={index} className="h-full text-center hover:shadow-xl transition-all duration-300 group border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Featured Courses Section
function FeaturedCoursesSection() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const createCourseSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advanced': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Free';
    return `$${price}`;
  };

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/courses');
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  // Fallback courses with better styling
  const fallbackCourses = [
    {
      id: 'fallback-1',
      title: "AI-Powered Executive Leadership",
      short_desc: "Master AI strategy from an executive perspective and lead digital transformation",
      level: "Advanced",
      duration: "8 weeks",
      rating: 4.9,
      students: 1250,
      price: 299,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop&auto=format"
    },
    {
      id: 'fallback-2',
      title: "AI-Powered Scrum Master",
      short_desc: "Master AI-enhanced Scrum methodologies and lead high-performing agile teams",
      level: "Intermediate",
      duration: "6 weeks",
      rating: 4.8,
      students: 2100,
      price: 199,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop&auto=format"
    },
    {
      id: 'fallback-3',
      title: "AI Product Owner Mastery",
      short_desc: "Drive product excellence using AI-enhanced strategies and data-driven decisions",
      level: "Intermediate",
      duration: "7 weeks",
      rating: 4.7,
      students: 1800,
      price: 249,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&auto=format"
    },
    {
      id: 'fallback-4',
      title: "Mental Fitness for Leaders",
      short_desc: "Build resilience and mental agility for high-performance leadership",
      level: "Beginner",
      duration: "4 weeks",
      rating: 4.9,
      students: 950,
      price: 149,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&auto=format"
    }
  ];

  const displayCourses = courses.length > 0 ? courses : fallbackCourses;

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, #3B82F6 2px, transparent 2px),
                           radial-gradient(circle at 80% 20%, #8B5CF6 2px, transparent 2px),
                           radial-gradient(circle at 40% 40%, #06B6D4 2px, transparent 2px)`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
            <BookOpen className="w-4 h-4 mr-2" />
            Featured Learning
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Start Your Learning Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover our most popular courses designed by industry experts to accelerate your career growth
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayCourses.map((course, index) => (
              <Card key={course.id} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden rounded-xl flex flex-col h-full">
                {/* Course Image */}
                <div className="relative h-48 overflow-hidden flex-shrink-0">
                  <img 
                    src={course.image || `https://images.unsplash.com/photo-${1560472354 + index}?w=400&h=250&fit=crop&auto=format`}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={`${getLevelColor(course.level)} border font-medium`}>
                      {course.level}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-sm font-semibold text-gray-700">
                    {course.duration || '6 weeks'}
                  </div>
                </div>

                {/* Card Content - Flexible */}
                <div className="flex flex-col flex-1 p-6">
                  <CardHeader className="p-0 mb-4 flex-shrink-0">
                    <CardTitle className="text-lg font-bold group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem] flex items-center">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 line-clamp-3 leading-relaxed min-h-[4.5rem]">
                      {course.short_desc}
                    </CardDescription>
                  </CardHeader>

                  {/* Rating and Students - Fixed Height */}
                  <div className="flex items-center justify-between mb-4 text-sm flex-shrink-0">
                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(course.rating || 4.8) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-gray-600 font-medium">{course.rating || '4.8'}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{course.students || '1,200'}+</span>
                    </div>
                  </div>

                  {/* Price - Fixed Height */}
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(course.price)}
                    </div>
                    {course.price && course.price > 0 && (
                      <div className="text-sm text-gray-500 line-through">
                        ${Math.round(course.price * 1.4)}
                      </div>
                    )}
                  </div>

                  {/* CTA Button - Always at bottom */}
                  <div className="mt-auto">
                    <Button 
                      asChild 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                    >
                      <Link href={`/courses/${createCourseSlug(course.title)}`}>
                        <span className="flex items-center justify-center">
                          Start Learning
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* View All Courses CTA */}
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            asChild
          >
            <Link href="/courses">
              View All Courses
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// Certifications Section
function CertificationsSection() {
  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advanced': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'from-green-400 to-green-600';
      case 'intermediate': return 'from-blue-400 to-blue-600';
      case 'advanced': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getIcon = (title: string) => {
    if (title.includes('Scrum')) return <Users className="h-8 w-8" />;
    if (title.includes('Product')) return <Target className="h-8 w-8" />;
    if (title.includes('Leadership')) return <Award className="h-8 w-8" />;
    return <GraduationCap className="h-8 w-8" />;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-lg blur-lg"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full blur-lg"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(90deg, #3B82F6 1px, transparent 1px),
                           linear-gradient(180deg, #3B82F6 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">
            <Award className="w-4 h-4 mr-2" />
            Professional Certifications
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Advance Your Career
            </span>
            <br />
            with Industry Certifications
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Earn globally recognized certifications that validate your expertise and open doors to new opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Certified Scrum Master",
              description: "Master Agile methodologies and lead high-performing teams with confidence",
              level: "Intermediate",
              duration: "6 weeks",
              modules: 12,
              projects: 3,
              completion: 85,
              students: "2,400+",
              rating: 4.8,
              features: ["Live Sessions", "Hands-on Projects", "Peer Learning", "Industry Mentorship"]
            },
            {
              title: "AI Product Manager",
              description: "Drive product excellence using AI-enhanced strategies and data-driven decisions",
              level: "Advanced",
              duration: "8 weeks",
              modules: 16,
              projects: 4,
              completion: 78,
              students: "1,800+",
              rating: 4.9,
              features: ["AI Tools Training", "Case Studies", "Portfolio Building", "Expert Reviews"]
            },
            {
              title: "Leadership Excellence",
              description: "Develop executive leadership skills for the modern workplace and digital age",
              level: "Advanced",
              duration: "10 weeks",
              modules: 20,
              projects: 5,
              completion: 92,
              students: "1,200+",
              rating: 4.7,
              features: ["360° Feedback", "Leadership Coaching", "Team Simulations", "Executive Mentoring"]
            }
          ].map((cert, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden rounded-xl flex flex-col h-full">
              {/* Header with Icon */}
              <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 p-6 border-b flex-shrink-0">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getProgressColor(cert.level)} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {getIcon(cert.title)}
                  </div>
                  <Badge className={`${getLevelColor(cert.level)} border font-medium`}>
                    {cert.level}
                  </Badge>
                </div>
                
                <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors mb-2 min-h-[3rem] flex items-center">
                  {cert.title}
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed min-h-[4.5rem]">
                  {cert.description}
                </CardDescription>
              </div>

              {/* Card Content - Flexible */}
              <div className="p-6 flex flex-col flex-1">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6 flex-shrink-0">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{cert.duration}</div>
                    <div className="text-sm text-gray-500">Duration</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{cert.modules}</div>
                    <div className="text-sm text-gray-500">Modules</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6 flex-shrink-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                    <span className="text-sm font-bold text-gray-900">{cert.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${getProgressColor(cert.level)} h-2 rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${cert.completion}%` }}
                    ></div>
                  </div>
                </div>

                {/* Rating and Students */}
                <div className="flex items-center justify-between mb-6 text-sm flex-shrink-0">
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(cert.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 font-medium">{cert.rating}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{cert.students}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6 flex-1">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">What's Included:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {cert.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button - Always at bottom */}
                <div className="mt-auto">
                  <Button 
                    className={`w-full bg-gradient-to-r ${getProgressColor(cert.level)} hover:shadow-lg text-white shadow-md transition-all duration-300 group-hover:scale-105`}
                  >
                    <span className="flex items-center justify-center">
                      Start Certification
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Certified?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of professionals who have advanced their careers with our industry-recognized certifications
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/courses">
                  Browse All Certifications
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/contact">
                  Talk to an Advisor
                  <MessageSquare className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            What Our Students Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Johnson",
              role: "Product Manager",
              content: "The AI-powered learning approach helped me advance my career faster than I ever imagined.",
              rating: 5
            },
            {
              name: "Michael Chen",
              role: "Scrum Master",
              content: "Excellent practical training that I could immediately apply in my daily work.",
              rating: 5
            },
            {
              name: "Emily Davis",
              role: "Team Lead",
              content: "The personalized learning path was exactly what I needed to develop my leadership skills.",
              rating: 5
            }
          ].map((testimonial, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Newsletter Section
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setEmail('');
    
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <section className="py-20 bg-blue-600">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Stay Updated
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Get the latest insights on AI, leadership, and professional development
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg"
            required
          />
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
        
        {isSubmitted && (
          <p className="text-green-200 mt-4">Thanks for subscribing!</p>
        )}
      </div>
    </section>
  );
}

// Partners Section
function PartnersSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Trusted by Leading Organizations
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
          {['Microsoft', 'Google', 'Amazon', 'Apple'].map((company) => (
            <div key={company} className="text-xl font-semibold text-gray-400">
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Transform Your Career?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of professionals who have accelerated their growth with our AI-powered learning platform
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100" asChild>
            <Link href="/courses">Start Learning Today</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600" asChild>
            <Link href="/contact">Talk to an Expert</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
