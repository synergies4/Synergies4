'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Eye,
  Heart,
  Lightbulb,
  MessageSquare
} from 'lucide-react';

export default function AboutUs() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        badge={{
          icon: <Heart className="w-4 h-4" />,
          text: "About Synergies4"
        }}
        title="Your Growth Journey"
        highlightText="Starts Here"
        description="Synergies4 helps teams lead better, adapt faster, and work smarter with AI. We're not consultants. We're integration partners who train people to think clearly, lead confidently, and build organizations that thrive in complexity."
        primaryCTA={{
          text: "Start Your Journey",
          href: "/courses"
        }}
        secondaryCTA={{
          text: "Contact Us",
          href: "/contact",
          icon: <MessageSquare className="w-4 h-4" />
        }}
        backgroundVariant="gradient"
      />

      {/* Mission Section */}
      <MissionSection />

      {/* Statistics Section */}
      <StatisticsSection />

      {/* What Makes Us Special Section */}
      <SpecialSection />

      {/* About Details Section */}
      <AboutDetailsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />
    </PageLayout>
  );
}

// Mission Section
function MissionSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-teal-500/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-gradient-to-br from-cyan-500/15 to-teal-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Sophisticated Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, rgba(20, 184, 166, 0.3) 2px, transparent 2px),
            radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 80px 80px, 40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
            <Target className="w-5 h-5 text-blue-300 mr-3" />
            <span className="text-white/90 font-medium">Our Mission</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
              Sharper Minds.
            </span>
            <br />
            <span className="bg-gradient-to-r from-teal-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
              Stronger Teams.
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-blue-100/90 max-w-4xl mx-auto leading-relaxed font-light">
            We believe in the power of 
            <span className="text-cyan-300 font-medium"> human potential </span>
            amplified by intelligent technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Eye className="h-10 w-10" />,
              title: "Our Vision",
              description: "A world where every professional has the tools and mindset to thrive in an AI-enhanced workplace.",
              gradient: "from-blue-500 to-cyan-400",
              glowColor: "blue-400/30"
            },
            {
              icon: <Heart className="h-10 w-10" />,
              title: "Our Values", 
              description: "Human-centered design, continuous learning, and sustainable transformation guide everything we do.",
              gradient: "from-teal-500 to-cyan-400",
              glowColor: "teal-400/30"
            },
            {
              icon: <Rocket className="h-10 w-10" />,
              title: "Our Approach",
              description: "We combine cutting-edge AI with proven methodologies to create lasting organizational change.",
              gradient: "from-emerald-500 to-teal-400",
              glowColor: "emerald-400/30"
            }
          ].map((item, index) => (
            <div key={index} className="group relative">
              {/* Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-1000 group-hover:duration-200`}></div>
              
              {/* Main Card */}
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 h-full hover:bg-white/15 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    {item.icon}
                  </div>
                  {/* Floating particles effect */}
                  <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-${item.glowColor} rounded-full blur-xl opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700`}></div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-200 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-blue-100/80 leading-relaxed text-base group-hover:text-white/90 transition-colors duration-300">
                    {item.description}
                  </p>
                </div>

                {/* Hover indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent group-hover:w-16 transition-all duration-500 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Statistics Section
function StatisticsSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-teal-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 left-1/4 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Geometric Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(59, 130, 246, 0.3) 60deg, transparent 120deg),
                           conic-gradient(from 180deg at 25% 75%, transparent 0deg, rgba(20, 184, 166, 0.3) 60deg, transparent 120deg)`,
          backgroundSize: '120px 120px, 80px 80px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-teal-500/20 backdrop-blur-sm rounded-full border border-blue-300/30 mb-8">
            <TrendingUp className="w-5 h-5 text-blue-300 mr-3" />
            <span className="text-blue-100 font-medium">Our Impact in Numbers</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
              Real Results from
            </span>
            <br />
            <span className="bg-gradient-to-r from-teal-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
              Real Organizations
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-blue-200/90 max-w-4xl mx-auto leading-relaxed font-light">
            Professionals and organizations who chose to 
            <span className="text-cyan-300 font-medium"> transform with us </span>
            and unlock their full potential.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: 10000, suffix: "+", label: "Professionals Trained", gradient: "from-blue-400 to-cyan-500" },
            { number: 95, suffix: "%", label: "Success Rate", gradient: "from-emerald-400 to-green-500" },
            { number: 500, suffix: "+", label: "Organizations Served", gradient: "from-teal-400 to-blue-500" },
            { number: 50, suffix: "+", label: "Countries Reached", gradient: "from-orange-400 to-red-500" }
          ].map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Enhanced Stat Card Component
function StatCard({ stat, index }: { stat: any, index: number }) {
  const { count, setIsVisible } = useCounter(stat.number);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 200);
    return () => clearTimeout(timer);
  }, [setIsVisible, index]);

  return (
    <div className="group text-center relative">
      {/* Background glow */}
      <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-all duration-700`}></div>
      
      {/* Main content */}
      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2">
        <div className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
          {count.toLocaleString()}{stat.suffix}
        </div>
        <div className="text-blue-200/80 text-sm md:text-base group-hover:text-white transition-colors duration-300">{stat.label}</div>
        
        {/* Floating indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent group-hover:w-12 transition-all duration-500"></div>
      </div>
    </div>
  );
}

// Special Section
function SpecialSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-teal-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-teal-400/10 to-cyan-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Sophisticated Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #60A5FA 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, #A78BFA 1px, transparent 1px),
            radial-gradient(circle at 50% 50%, #34D399 0.5px, transparent 0.5px)
          `,
          backgroundSize: '60px 60px, 80px 80px, 40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-teal-200/50 mb-8">
            <Lightbulb className="w-5 h-5 text-teal-600 mr-3" />
            <span className="text-teal-700 font-medium">What Makes Us Special</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-gray-700 via-blue-800 to-teal-800 bg-clip-text text-transparent">
              Beyond Traditional
            </span>
            <br />
            <span className="bg-gradient-to-r from-teal-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Training
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-light">
            We don't just teach concepts - we 
            <span className="text-teal-600 font-medium"> transform how people think, </span>
            work, and lead
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Brain className="h-10 w-10" />,
              title: "AI-Powered Personalization",
              description: "Every learning experience is tailored to your unique needs, goals, and learning style.",
              gradient: "from-blue-500 to-cyan-400",
              bgGradient: "from-blue-50 to-cyan-50"
            },
            {
              icon: <Users className="h-10 w-10" />,
              title: "Human-Centered Design",
              description: "Technology serves people, not the other way around. We prioritize human connection and growth.",
              gradient: "from-teal-500 to-blue-400",
              bgGradient: "from-teal-50 to-blue-50"
            },
            {
              icon: <Target className="h-10 w-10" />,
              title: "Results-Driven Approach",
              description: "We measure success by real-world impact, not just completion rates or satisfaction scores.",
              gradient: "from-emerald-500 to-teal-400",
              bgGradient: "from-emerald-50 to-teal-50"
            },
            {
              icon: <Rocket className="h-10 w-10" />,
              title: "Continuous Innovation",
              description: "We stay ahead of industry trends to ensure our methods remain cutting-edge and effective.",
              gradient: "from-orange-500 to-red-400",
              bgGradient: "from-orange-50 to-red-50"
            },
            {
              icon: <CheckCircle className="h-10 w-10" />,
              title: "Proven Methodologies",
              description: "Our approaches are backed by research, tested in practice, and refined through experience.",
              gradient: "from-blue-500 to-cyan-400",
              bgGradient: "from-blue-50 to-cyan-50"
            },
            {
              icon: <Award className="h-10 w-10" />,
              title: "Expert Community",
              description: "Learn from and connect with a global network of industry leaders and practitioners.",
              gradient: "from-yellow-500 to-orange-400",
              bgGradient: "from-yellow-50 to-orange-50"
            }
          ].map((item, index) => (
            <div key={index} className={`group relative animate-fade-in-up animation-delay-${index * 100}`}>
              {/* Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} rounded-2xl blur opacity-0 group-hover:opacity-25 transition-opacity`}></div>
              
              {/* Main Card */}
              <div className={`relative bg-gradient-to-br ${item.bgGradient} rounded-2xl border border-white/50 p-8 h-full hover:bg-white/80 transition-all group-hover:scale-105 group-hover:-translate-y-3 shadow-lg hover:shadow-2xl backdrop-blur-sm`}>
                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                    {item.icon}
                  </div>
                  
                  {/* Floating ring effect */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 border-2 border-current rounded-full opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all" style={{ color: item.gradient.includes('blue') ? '#3B82F6' : item.gradient.includes('teal') ? '#14B8A6' : '#10B981' }}></div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base group-hover:text-gray-800 transition-colors">
                    {item.description}
                  </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-all"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all"></div>
                
                {/* Bottom highlight */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent group-hover:w-20 transition-all rounded-full" style={{ color: item.gradient.includes('blue') ? '#3B82F6' : item.gradient.includes('teal') ? '#14B8A6' : '#10B981' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// About Details Section
function AboutDetailsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Story
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Founded by industry veterans who saw the need for a new approach to professional development
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
            <p>
              Synergies4 was born from a simple observation: traditional training wasn't keeping pace with the rapid changes in the modern workplace. As AI and digital transformation reshaped industries, professionals needed more than just new skills—they needed new ways of thinking.
            </p>
            <p>
              Our founders, with decades of experience in organizational development, AI implementation, and leadership coaching, recognized that the future belonged to those who could seamlessly blend human intelligence with artificial intelligence.
            </p>
            <p>
              Today, we're proud to be at the forefront of this transformation, helping individuals and organizations not just adapt to change, but thrive in it. Our unique approach combines the latest in AI technology with time-tested principles of human development to create learning experiences that are both cutting-edge and deeply human.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-gradient-to-br from-blue-500/15 to-cyan-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 left-1/4 w-64 h-64 bg-gradient-to-br from-teal-500/10 to-emerald-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Geometric Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
            radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 80px 80px, 60px 60px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
            <Star className="w-5 h-5 text-yellow-300 mr-3" />
            <span className="text-white/90 font-medium">What People Say</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-yellow-100 to-orange-200 bg-clip-text text-transparent">
              Transformations That
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
              Speak for Themselves
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
            Real stories from professionals who've experienced the 
            <span className="text-yellow-300 font-medium"> Synergies4 difference </span>
            and transformed their careers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Johnson",
              role: "VP of Digital Transformation",
              company: "Fortune 500 Company",
              content: "Synergies4 didn't just teach us about AI—they transformed how we think about innovation. Our team's productivity has increased by 40% since completing their program.",
              rating: 5,
              image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
              gradient: "from-blue-500 to-cyan-400",
              bgGradient: "from-blue-900/20 to-cyan-900/20"
            },
            {
              name: "Michael Chen",
              role: "Agile Coach",
              company: "Tech Startup",
              content: "The combination of Agile methodologies with AI insights has revolutionized how we approach product development. We're delivering value faster than ever before.",
              rating: 5,
              image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
              gradient: "from-emerald-500 to-teal-400",
              bgGradient: "from-emerald-900/20 to-teal-900/20"
            },
            {
              name: "Emily Rodriguez",
              role: "Team Lead",
              company: "Global Consulting Firm",
              content: "The positive intelligence training has been life-changing. I'm not just a better leader—I'm a better person. My team has noticed the difference immediately.",
              rating: 5,
              image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
              gradient: "from-teal-500 to-blue-400",
              bgGradient: "from-teal-900/20 to-blue-900/20"
            }
          ].map((testimonial, index) => (
            <div key={index} className={`group relative animate-fade-in-up animation-delay-${index * 200}`}>
              {/* Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${testimonial.gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-1000 group-hover:duration-200`}></div>
              
              {/* Main Card */}
              <div className={`relative bg-gradient-to-br ${testimonial.bgGradient} backdrop-blur-xl rounded-2xl border border-white/20 p-8 h-full hover:bg-white/5 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-3 shadow-xl hover:shadow-2xl`}>
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 text-white/20 group-hover:text-white/40 transition-colors duration-300">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                </div>

                {/* Stars */}
                <div className="flex mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current mr-1 group-hover:scale-110 transition-transform duration-300" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-200 mb-8 italic leading-relaxed text-lg group-hover:text-white transition-colors duration-300 font-light">"{testimonial.content}"</p>
                
                {/* Author */}
                <div className="flex items-center">
                  <div className="relative">
                    <Avatar className="h-16 w-16 mr-4 ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300">
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-800 text-white">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {/* Glow effect for avatar */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${testimonial.gradient} rounded-full blur opacity-0 group-hover:opacity-30 transition-all duration-500`}></div>
                  </div>
                  
                  <div>
                    <p className="font-bold text-white text-lg group-hover:text-yellow-200 transition-colors duration-300">{testimonial.name}</p>
                    <p className="text-gray-300 text-base group-hover:text-gray-200 transition-colors duration-300">{testimonial.role}</p>
                    <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">{testimonial.company}</p>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute bottom-4 right-4 w-6 h-6 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute top-1/2 left-0 w-1 h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                
                {/* Bottom accent */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent group-hover:w-24 transition-all duration-500 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Counter animation hook
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return { count, setIsVisible };
} 