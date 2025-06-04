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
      <section className="relative bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 min-h-screen flex items-center overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated Orbs */}
          <div className="absolute top-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-teal-600/20 to-emerald-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/3 w-48 sm:w-80 h-48 sm:h-80 bg-gradient-to-br from-cyan-500/15 to-teal-600/15 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
          <div className="absolute top-2/3 left-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
          
          {/* Geometric Shapes - Mobile Optimized */}
          <div className="absolute top-20 left-4 sm:left-20 w-16 sm:w-32 h-16 sm:h-32 border border-teal-200/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-4 sm:right-20 w-12 sm:w-24 h-12 sm:h-24 border border-cyan-400/20 rounded-lg rotate-45 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 right-4 sm:right-10 w-8 sm:w-16 h-8 sm:h-16 border border-teal-400/20 rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>

        {/* Sophisticated Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(20, 184, 166, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(20, 184, 166, 0.1) 1px, transparent 1px),
              radial-gradient(circle at 25% 25%, rgba(20, 184, 166, 0.1) 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px, 40px 40px, 80px 80px, 60px 60px'
          }} />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10 py-12 sm:py-20">
          {/* Enhanced Badge with Animation - Mobile Optimized */}
          <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/80 backdrop-blur-md rounded-full border border-teal-200/50 mb-8 sm:mb-12 group hover:bg-white/90 card-hover-optimized">
            <div className="w-2 h-2 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full mr-2 sm:mr-3 animate-pulse"></div>
            <Zap className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 text-teal-600 group-hover:text-teal-700 transition-colors-smooth" />
            <span className="text-gray-700 font-medium group-hover:text-gray-800 transition-colors-smooth text-sm sm:text-base">AI-Powered Learning Platform</span>
            <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full ml-2 sm:ml-3 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Enhanced Hero Title with Better Typography - Mobile Optimized */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight tracking-tight">
            <span className="block mb-2 sm:mb-4">Build Skills That</span>
            <span className="block bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent animate-gradient relative">
              Set You Apart
              {/* Subtle underline effect */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 sm:w-32 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent rounded-full"></div>
            </span>
          </h1>
          
          {/* Urgent Quote from Jensen Huang */}
          <div className="mb-8 sm:mb-12">
            <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border-l-4 border-slate-600 rounded-r-xl shadow-lg">
              <blockquote className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 italic mb-4 leading-relaxed">
                "You're going to lose your job to someone who is using AI."
              </blockquote>
              <cite className="flex items-center justify-center text-gray-700 font-medium">
                <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-gray-600 rounded-full flex items-center justify-center mr-3 text-white text-sm font-bold">JH</div>
                <span className="text-base sm:text-lg">Jensen Huang, CEO of Nvidia</span>
              </cite>
            </div>
          </div>
          
          {/* Enhanced Subtitle - Mobile Optimized */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-12 sm:mb-16 max-w-4xl mx-auto leading-relaxed font-light px-4 sm:px-0">
            Learn practical frameworks in 
            <span className="text-gray-900 font-medium bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent"> Agile, leadership, and mental fitness </span>
            that teams and leaders actually use
          </p>
          
          {/* Enhanced CTA Buttons - Fixed Mobile Layout */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center max-w-3xl mx-auto mb-12 sm:mb-16 px-4 sm:px-0">
            <Button 
              size="lg" 
              className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-black transition-all font-semibold rounded-xl shadow-2xl hover:shadow-gray-500/25 hover:scale-105 border-0 group h-auto" 
              asChild
            >
              <Link href="/courses">
                <span className="flex items-center justify-center text-white group-hover:text-white font-semibold">
                  Explore Courses
                  <ArrowRight className="h-4 sm:h-5 w-4 sm:w-5 ml-2 group-hover:translate-x-1 transition-transform text-white group-hover:text-white" />
                </span>
              </Link>
            </Button>

            <Button 
              size="lg" 
              className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 transition-all font-semibold rounded-xl shadow-2xl hover:shadow-teal-500/25 hover:scale-105 border-0 group h-auto" 
              asChild
            >
              <Link href="/synergize">
                <span className="flex items-center justify-center text-white group-hover:text-white">
                  <Brain className="h-4 sm:h-5 w-4 sm:w-5 mr-2 group-hover:scale-110 transition-transform text-white group-hover:text-white" />
                  Try AI Assistant
                </span>
              </Link>
            </Button>
          </div>

          {/* Enhanced Stats with Cards - Fixed Spacing */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto mb-16 sm:mb-24 px-4 sm:px-0">
            {[
              { number: "10K+", label: "Learners", icon: <Users className="w-4 sm:w-5 h-4 sm:h-5" /> },
              { number: "95%", label: "Success Rate", icon: <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5" /> },
              { number: "4.9", label: "Rating", icon: <Star className="w-4 sm:w-5 h-4 sm:h-5" /> },
              { number: "50+", label: "Courses", icon: <BookOpen className="w-4 sm:w-5 h-4 sm:h-5" /> }
            ].map((stat, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 p-4 sm:p-6 transition-all hover:bg-white/90 hover:scale-105 group">
                <div className="flex items-center justify-center mb-2 sm:mb-3 text-teal-600 transition-colors group-hover:text-cyan-600">
                  {stat.icon}
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 transition-transform group-hover:scale-110">{stat.number}</div>
                <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Scroll Indicator with Centered Text - Fixed Positioning */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-6 h-10 border-2 border-gray-600/30 rounded-full flex justify-center relative group hover:border-gray-600/50 transition-colors animate-bounce">
            <div className="w-1 h-3 bg-gradient-to-b from-gray-600/60 to-transparent rounded-full mt-2 animate-pulse group-hover:from-cyan-600/80 transition-colors"></div>
          </div>
          <div className="text-gray-600/60 text-sm font-medium animate-pulse">
            Scroll to explore
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
    <section className="py-24 bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-emerald-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-teal-600/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-gray-400/10 to-slate-600/10 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Sophisticated Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #14B8A6 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #10B981 1px, transparent 1px),
                           radial-gradient(circle at 50% 50%, #06B6D4 0.5px, transparent 0.5px)`,
          backgroundSize: '60px 60px, 80px 80px, 40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
            <span className="w-2 h-2 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full mr-3 animate-pulse"></span>
            <span className="text-white/90 text-sm font-medium">Why Choose Synergies4?</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-cyan-200 bg-clip-text text-transparent">
              Your AI-Powered
            </span>
            <br />
            <span className="bg-gradient-to-r from-teal-200 via-emerald-200 to-cyan-200 bg-clip-text text-transparent">
              Learning Partner
            </span>
          </h2>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-100/90 max-w-4xl mx-auto leading-relaxed font-light">
            We're not just another training company. We're your intelligent partners in creating 
            <span className="text-cyan-300 font-medium"> personalized learning journeys </span>
            that adapt to your unique goals and accelerate your professional growth.
          </p>
          
          {/* Human-AI Collaboration Quote */}
          <div className="mt-12 mb-8">
            <div className="max-w-3xl mx-auto p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
              <blockquote className="text-lg md:text-xl font-semibold text-white italic mb-4 leading-relaxed text-center">
                "Superhuman innovation is about humans and AI working together to achieve outcomes neither could alone."
              </blockquote>
              <cite className="flex items-center justify-center text-white font-medium">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full flex items-center justify-center mr-3 text-gray-900 text-sm font-bold">CD</div>
                <span className="text-white">Chris Duffey, Author and AI Technologist</span>
              </cite>
            </div>
          </div>
        </div>

        {/* Revolutionary Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Brain className="h-10 w-10" />,
              title: "AI-Powered Learning",
              description: "Personalized learning paths powered by cutting-edge AI that understands your unique style and accelerates your growth trajectory.",
              gradient: "from-teal-500 to-cyan-400",
              glowColor: "teal-400/30",
              delay: "0"
            },
            {
              icon: <Target className="h-10 w-10" />,
              title: "Practical Skills",
              description: "Learn frameworks and methodologies that you can immediately apply in your work, with real-world projects and hands-on experience.",
              gradient: "from-emerald-500 to-teal-400",
              glowColor: "emerald-400/30",
              delay: "200"
            },
            {
              icon: <Users className="h-10 w-10" />,
              title: "Expert Instructors",
              description: "Learn from industry leaders with real-world experience, offering mentorship and insights you can't find anywhere else.",
              gradient: "from-cyan-500 to-emerald-400",
              glowColor: "cyan-400/30",
              delay: "400"
            },
            {
              icon: <Award className="h-10 w-10" />,
              title: "Recognized Certifications",
              description: "Earn globally recognized certificates that are valued by top employers and respected by industry professionals worldwide.",
              gradient: "from-slate-500 to-gray-400",
              glowColor: "slate-400/30",
              delay: "600"
            }
          ].map((item, index) => (
            <div
              key={index}
              className="group relative animate-fade-in-up h-full"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Main Card */}
              <div className={`relative bg-gradient-to-br ${item.gradient} border border-white/15 rounded-2xl p-8 text-center h-full flex flex-col transition-all group-hover:scale-105 shadow-lg hover:shadow-xl`}>
                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg transition-transform group-hover:scale-110`}>
                    {item.icon}
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-4 transition-colors group-hover:text-cyan-200">
                  {item.title}
                </h3>
                <p className="text-white/90 text-sm leading-relaxed flex-1">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call-to-Action */}
        <div className="text-center mt-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-3xl mx-auto">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl shadow-2xl hover:shadow-teal-500/25 transition-all hover:scale-105 border-0 group"
              asChild
            >
              <Link href="/courses">
                <span className="flex items-center justify-center text-white group-hover:text-white font-semibold">
                  Explore Our Courses
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform text-white group-hover:text-white" />
                </span>
              </Link>
            </Button>
            
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-white text-teal-600 hover:bg-gray-100 px-8 py-4 rounded-xl shadow-2xl hover:shadow-white/25 transition-all hover:scale-105 border-0 font-semibold group"
              asChild
            >
              <Link href="/synergize">
                <span className="flex items-center justify-center text-teal-600 group-hover:text-teal-600">
                  <Brain className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform text-teal-600 group-hover:text-teal-600" />
                  Try AI Assistant
                </span>
              </Link>
            </Button>
          </div>
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
      case 'intermediate': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'advanced': return 'bg-slate-100 text-slate-800 border-slate-200';
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

  // Enhanced fallback courses
  const fallbackCourses = [
    {
      id: 'fallback-1',
      title: "AI-Powered Executive Leadership",
      short_desc: "Master AI strategy from an executive perspective and lead digital transformation with confidence and vision.",
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
      short_desc: "Master AI-enhanced Scrum methodologies and lead high-performing agile teams to unprecedented success.",
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
      short_desc: "Drive product excellence using AI-enhanced strategies and data-driven decisions that deliver real impact.",
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
      short_desc: "Build resilience and mental agility for high-performance leadership in today's complex world.",
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
    <section className="py-24 bg-gradient-to-br from-slate-800 via-gray-800 to-slate-700 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-emerald-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-teal-600/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-2/3 left-1/4 w-64 h-64 bg-gradient-to-br from-slate-500/10 to-gray-600/10 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Geometric Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(20, 184, 166, 0.3) 60deg, transparent 120deg),
                           conic-gradient(from 180deg at 25% 75%, transparent 0deg, rgba(16, 185, 129, 0.3) 60deg, transparent 120deg),
                           conic-gradient(from 90deg at 75% 25%, transparent 0deg, rgba(6, 182, 212, 0.3) 60deg, transparent 120deg)`,
          backgroundSize: '120px 120px, 80px 80px, 100px 100px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 backdrop-blur-sm rounded-full border border-teal-300/30 mb-8">
            <BookOpen className="w-5 h-5 text-teal-300 mr-3" />
            <span className="text-teal-100 font-medium">Featured Learning Experiences</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-200 to-cyan-300 bg-clip-text text-transparent">
              Start Your Learning
            </span>
            <br />
            <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              Journey Today
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-200/90 max-w-4xl mx-auto leading-relaxed font-light">
            Discover our most popular courses designed by 
            <span className="text-cyan-300 font-medium"> industry experts </span>
            to accelerate your career growth and unlock your full potential.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-effect-light rounded-2xl shadow-lg overflow-hidden animate-pulse border border-white/20">
                <div className="h-48 bg-gradient-to-br from-gray-400/20 to-gray-600/20"></div>
                <div className="p-6">
                  <div className="h-4 bg-white/20 rounded mb-3"></div>
                  <div className="h-4 bg-white/20 rounded w-3/4 mb-4"></div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-6 bg-white/20 rounded w-20"></div>
                    <div className="h-6 bg-white/20 rounded w-16"></div>
                  </div>
                  <div className="h-10 bg-white/20 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayCourses.map((course, index) => (
              <div 
                key={course.id} 
                className={`group relative animate-fade-in-up animation-delay-${index * 200}`}
              >
                {/* Card Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity"></div>
                
                {/* Main Card */}
                <div className="relative bg-white/10 rounded-2xl border border-white/20 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 flex flex-col h-full">
                  {/* Course Image with Enhanced Overlay */}
                  <div className="relative h-48 overflow-hidden flex-shrink-0">
                    <img 
                      src={course.image || `https://images.unsplash.com/photo-${1560472354 + index}?w=400&h=250&fit=crop&auto=format`}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Level Badge */}
                    <div className="absolute top-4 left-4">
                      <div className={`px-3 py-1 bg-gradient-to-r ${getLevelColor(course.level)} rounded-full text-white text-sm font-semibold shadow-lg`}>
                        {course.level}
                      </div>
                    </div>
                    
                    {/* Duration Badge */}
                    <div className="absolute top-4 right-4 bg-white/90 rounded-full px-3 py-1 text-sm font-semibold text-gray-800 shadow-lg">
                      {course.duration || '6 weeks'}
                    </div>

                    {/* Floating Icon */}
                    <div className="absolute bottom-4 right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-110">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-col flex-1 p-6 bg-white/5">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-200 transition-colors line-clamp-2 min-h-[3.5rem] flex items-start">
                      {course.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-200/80 text-sm leading-relaxed mb-4 flex-1 group-hover:text-white/90 transition-colors">
                      {course.short_desc}
                    </p>

                    {/* Rating and Students */}
                    <div className="flex items-center justify-between mb-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < Math.floor(course.rating || 4.8) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-gray-200 font-medium ml-1">{course.rating || '4.8'}</span>
                      </div>
                      <div className="flex items-center text-gray-200 group-hover:text-white transition-colors">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{course.students || '1,200'}+</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-teal-400 bg-clip-text text-transparent">
                        {formatPrice(course.price)}
                      </div>
                      {course.price && course.price > 0 && (
                        <div className="text-sm text-gray-300/60 line-through">
                          ${Math.round(course.price * 1.4)}
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Button 
                      asChild 
                      className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all group-hover:scale-105 rounded-xl border-0 group"
                    >
                      <Link href={`/courses/${createCourseSlug(course.title)}`}>
                        <span className="flex items-center justify-center text-white group-hover:text-white font-semibold">
                          Start Learning
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform text-white group-hover:text-white" />
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white px-8 py-4 rounded-xl shadow-2xl hover:shadow-cyan-500/25 transition-all hover:scale-105 border-0 group"
              asChild
            >
              <Link href="/courses">
                <span className="flex items-center justify-center text-white group-hover:text-white font-semibold">
                  View All Courses
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform text-white group-hover:text-white" />
                </span>
              </Link>
            </Button>
            
            <div className="text-gray-200/60 text-sm">
              Join <span className="font-semibold text-cyan-300">10,000+</span> learners worldwide
            </div>
          </div>
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
      case 'intermediate': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'advanced': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'from-emerald-400 to-green-600';
      case 'intermediate': return 'from-teal-400 to-cyan-600';
      case 'advanced': return 'from-slate-400 to-gray-600';
      default: return 'from-gray-400 to-slate-600';
    }
  };

  const getIcon = (title: string) => {
    if (title.includes('Scrum')) return <Users className="h-8 w-8" />;
    if (title.includes('Product')) return <Target className="h-8 w-8" />;
    if (title.includes('Leadership')) return <Award className="h-8 w-8" />;
    return <GraduationCap className="h-8 w-8" />;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-teal-200/30 to-emerald-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-emerald-200/30 to-cyan-200/30 rounded-lg blur-lg"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-cyan-200/30 to-teal-200/30 rounded-full blur-lg"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(90deg, #14B8A6 1px, transparent 1px),
                           linear-gradient(180deg, #14B8A6 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-200">
            <Award className="w-4 h-4 mr-2" />
            Professional Certifications
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
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
            <Card key={index} className="group transition-all hover:shadow-2xl hover:-translate-y-2 bg-white/90 border-0 shadow-lg overflow-hidden rounded-xl flex flex-col h-full">
              {/* Header with Icon */}
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 border-b flex-shrink-0">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getProgressColor(cert.level)} flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110`}>
                    {getIcon(cert.title)}
                  </div>
                  <Badge className={`${getLevelColor(cert.level)} border font-medium`}>
                    {cert.level}
                  </Badge>
                </div>
                
                <CardTitle className="text-xl font-bold text-gray-900 transition-colors group-hover:text-teal-600 mb-2 min-h-[3rem] flex items-center">
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
                    <div className="text-2xl font-bold text-teal-600">{cert.duration}</div>
                    <div className="text-sm text-gray-500">Duration</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">{cert.modules}</div>
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
                      className={`bg-gradient-to-r ${getProgressColor(cert.level)} h-2 rounded-full transition-all`}
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
                    className={`w-full bg-gradient-to-r ${getProgressColor(cert.level)} hover:shadow-lg text-white font-semibold shadow-md transition-all group-hover:scale-105 group`}
                  >
                    <span className="flex items-center justify-center text-white group-hover:text-white font-semibold">
                      Start Certification
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform text-white group-hover:text-white" />
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
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
                asChild
              >
                <Link href="/courses">
                  <span className="flex items-center justify-center text-white group-hover:text-white font-semibold">
                    Browse All Certifications
                    <ArrowRight className="h-5 w-5 ml-2 text-white group-hover:text-white" />
                  </span>
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-gray-600 text-gray-900 hover:bg-gray-100 hover:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-white group"
                asChild
              >
                <Link href="/contact">
                  <span className="flex items-center justify-center text-gray-900 group-hover:text-gray-900 font-semibold">
                    <MessageSquare className="h-5 w-5 mr-2 text-gray-900 group-hover:text-gray-900" />
                    Talk to an Advisor
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
            <Card key={index} className="group transition-all hover:shadow-xl bg-white border border-gray-200 shadow-sm">
              <CardContent className="pt-6 bg-white">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current transition-transform group-hover:scale-110" />
                  ))}
                </div>
                <p className="text-gray-900 mb-4 font-medium">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
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
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to subscribe');
      }

      setIsSubmitted(true);
      setEmail('');
      
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setError(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-teal-600">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Stay Updated
        </h2>
        <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
          Get the latest insights on AI, leadership, and professional development
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-500"
              required
              disabled={isSubmitting}
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-white text-teal-600 hover:bg-gray-100 px-6 py-3 font-medium"
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </div>
          
          {error && (
            <p className="text-red-200 mt-3 text-sm">{error}</p>
          )}
        </form>
        
        {isSubmitted && (
          <p className="text-green-200 mt-4 font-medium">Thanks for subscribing! Check your email for confirmation.</p>
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
    <section className="py-20 bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 text-white relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-white/10 to-teal-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-gradient-to-br from-cyan-300/15 to-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 left-1/4 w-64 h-64 bg-gradient-to-br from-emerald-300/10 to-teal-300/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Geometric Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
            radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 80px 80px, 60px 60px'
        }} />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
          <Rocket className="w-5 h-5 text-teal-300 mr-3" />
          <span className="text-white/90 font-medium">Ready to Get Started?</span>
        </div>
        
        <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
          <span className="bg-gradient-to-r from-white via-gray-100 to-cyan-200 bg-clip-text text-transparent">
            Ready to Transform
          </span>
          <br />
          <span className="bg-gradient-to-r from-cyan-200 via-teal-200 to-emerald-200 bg-clip-text text-transparent">
            Your Career?
          </span>
        </h2>
        
        
        <p className="text-xl md:text-2xl text-teal-100/90 max-w-4xl mx-auto leading-relaxed font-light mb-12">
          Join thousands of professionals who have accelerated their growth with our 
          <span className="text-white font-medium"> AI-powered learning platform</span>
        </p>
        
        <div className="text-center mt-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-3xl mx-auto">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl shadow-2xl hover:shadow-teal-500/25 transition-all hover:scale-105 border-0 group"
              asChild
            >
              <Link href="/courses">
                <span className="flex items-center justify-center text-white group-hover:text-white font-semibold">
                  Start Learning Today
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform text-white group-hover:text-white" />
                </span>
              </Link>
            </Button>
            
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-white/20 to-white/10 border-2 border-white text-white hover:bg-white hover:text-teal-600 shadow-2xl hover:shadow-white/25 transition-all hover:scale-105 font-semibold rounded-xl group" 
              asChild
            >
              <Link href="/contact">
                <span className="flex items-center justify-center text-white group-hover:text-teal-600 font-semibold">
                  <MessageSquare className="h-5 w-5 mr-2 text-white group-hover:text-teal-600" />
                  Talk to an Expert
                </span>
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Enhanced Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
          {[
            { number: "10K+", label: "Happy Learners", icon: <Users className="w-5 h-5" /> },
            { number: "95%", label: "Success Rate", icon: <TrendingUp className="w-5 h-5" /> },
            { number: "4.9", label: "Average Rating", icon: <Star className="w-5 h-5" /> },
            { number: "50+", label: "Expert Courses", icon: <BookOpen className="w-5 h-5" /> }
          ].map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 transition-all hover:bg-white/10 hover:scale-105 group">
              <div className="flex items-center justify-center mb-3 text-teal-300 transition-colors group-hover:text-white">
                {stat.icon}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1 transition-transform group-hover:scale-110">{stat.number}</div>
              <div className="text-sm text-teal-200/80 uppercase tracking-wide font-medium transition-colors group-hover:text-white/90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
