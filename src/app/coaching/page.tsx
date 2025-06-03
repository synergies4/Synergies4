'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
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
  UserCheck,
  Lightbulb,
  Compass,
  MessageSquare,
  Heart
} from 'lucide-react';

export default function Coaching() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        badge={{
          icon: <UserCheck className="w-4 h-4" />,
          text: "Professional Coaching"
        }}
        title="Unlock Your"
        highlightText="Leadership Potential"
        description="Transform your career with personalized coaching from industry experts. Develop the skills and mindset needed to lead with confidence and drive meaningful change."
        primaryCTA={{
          text: "Start Your Coaching Journey",
          href: "/contact"
        }}
        secondaryCTA={{
          text: "Learn More",
          href: "#coaching-programs",
          icon: <ArrowRight className="w-4 h-4" />
        }}
        backgroundVariant="gradient"
      />

      {/* Why Choose Section */}
      <WhyChooseSection />

      {/* Focus Areas Section */}
      <FocusAreasSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />
    </PageLayout>
  );
}

// Why Choose Section
function WhyChooseSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-teal-600/20 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-to-br from-teal-500/15 to-cyan-600/15 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-2xl opacity-60"></div>
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
          <div className="inline-flex items-center px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-blue-200/50 mb-8">
            <Lightbulb className="w-5 h-5 text-blue-600 mr-3" />
            <span className="text-blue-700 font-medium">Why Choose Our Coaching</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-gray-700 via-blue-800 to-teal-800 bg-clip-text text-transparent">
              Personalized Growth
            </span>
            <br />
            <span className="bg-gradient-to-r from-teal-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              That Delivers Results
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-light">
            Our coaching approach combines proven methodologies with 
            <span className="text-blue-600 font-medium"> AI-powered insights </span>
            to accelerate your professional development and unlock your leadership potential.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Brain className="h-8 w-8" />,
              title: "AI-Enhanced Coaching",
              description: "Leverage cutting-edge AI tools to identify growth opportunities and track your progress with precision and data-driven insights.",
              gradient: "from-blue-500 to-cyan-400",
              bgGradient: "from-blue-50 to-cyan-50"
            },
            {
              icon: <Target className="h-8 w-8" />,
              title: "Goal-Oriented Approach",
              description: "Set clear, measurable objectives and receive personalized strategies to achieve your career aspirations and professional goals.",
              gradient: "from-teal-500 to-blue-400",
              bgGradient: "from-teal-50 to-blue-50"
            },
            {
              icon: <Users className="h-8 w-8" />,
              title: "Expert Mentorship",
              description: "Work with industry leaders who have successfully navigated the challenges you're facing and can guide your journey.",
              gradient: "from-emerald-500 to-teal-400",
              bgGradient: "from-emerald-50 to-teal-50"
            },
            {
              icon: <Rocket className="h-8 w-8" />,
              title: "Accelerated Growth",
              description: "Fast-track your development with proven frameworks and real-world application opportunities that deliver measurable results.",
              gradient: "from-orange-500 to-red-400",
              bgGradient: "from-orange-50 to-red-50"
            },
            {
              icon: <CheckCircle className="h-8 w-8" />,
              title: "Measurable Results",
              description: "Track your progress with data-driven insights and celebrate meaningful achievements along your professional development journey.",
              gradient: "from-blue-500 to-teal-400",
              bgGradient: "from-blue-50 to-teal-50"
            },
            {
              icon: <Award className="h-8 w-8" />,
              title: "Industry Recognition",
              description: "Gain credentials and recognition that advance your career and open new opportunities in your field and beyond.",
              gradient: "from-yellow-500 to-orange-400",
              bgGradient: "from-yellow-50 to-orange-50"
            },
            {
              icon: <Heart className="h-10 w-10" />,
              title: "1-on-1 Executive Coaching",
              description: "Personalized guidance to unlock your leadership potential and accelerate your career growth.",
              gradient: "from-teal-500 to-blue-400",
              bgGradient: "from-teal-50 to-blue-50"
            },
            {
              icon: <Lightbulb className="h-10 w-10" />,
              title: "Team Dynamics Coaching",
              description: "Transform your team's performance through collaborative coaching sessions and proven methodologies.",
              gradient: "from-cyan-500 to-teal-400",
              bgGradient: "from-cyan-50 to-teal-50"
            }
          ].map((item, index) => (
            <div key={index} className={`group relative animate-fade-in-up animation-delay-${index * 100}`}>
              {/* Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-1000 group-hover:duration-200`}></div>
              
              {/* Main Card */}
              <div className={`relative bg-gradient-to-br ${item.bgGradient} rounded-2xl border border-white/50 p-8 h-full hover:bg-white/80 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-3 shadow-lg hover:shadow-2xl backdrop-blur-sm text-center`}>
                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {item.icon}
                  </div>
                  
                  {/* Floating ring effect */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 border-2 border-current rounded-full opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700" style={{ color: item.gradient.includes('blue') ? '#3B82F6' : item.gradient.includes('green') ? '#10B981' : '#14B8A6' }}></div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base group-hover:text-gray-800 transition-colors duration-300">
                    {item.description}
                  </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" style={{ animationDelay: '200ms' }}></div>
                
                {/* Bottom highlight */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent group-hover:w-20 transition-all duration-500 rounded-full" style={{ color: item.gradient.includes('blue') ? '#3B82F6' : item.gradient.includes('green') ? '#10B981' : '#14B8A6' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Focus Areas Section
function FocusAreasSection() {
  return (
    <section id="coaching-programs" className="py-24 bg-gradient-to-br from-blue-900 via-teal-900 to-cyan-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-gradient-to-br from-teal-500/15 to-emerald-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 left-1/4 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
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
            <Compass className="w-5 h-5 text-teal-300 mr-3" />
            <span className="text-white font-semibold">Coaching Focus Areas</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
              Specialized Coaching
            </span>
            <br />
            <span className="bg-gradient-to-r from-teal-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
              Programs
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-white max-w-4xl mx-auto leading-relaxed font-light">
            Choose from our targeted coaching programs designed to address 
            <span className="text-cyan-300 font-medium"> specific professional development needs </span>
            and accelerate your career growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "AI Integration Leadership",
              description: "Master the art of leading AI transformation initiatives and building AI-ready teams that thrive in the digital age",
              features: ["AI Strategy Development", "Change Management", "Team Transformation", "Technology Adoption"],
              color: "from-blue-400 to-blue-600",
              bgGradient: "from-blue-900/40 to-cyan-900/40"
            },
            {
              title: "Agile Excellence",
              description: "Become a certified Agile leader with deep expertise in modern methodologies and team facilitation",
              features: ["Scrum Mastery", "Kanban Implementation", "Team Facilitation", "Continuous Improvement"],
              color: "from-green-400 to-green-600",
              bgGradient: "from-green-900/40 to-emerald-900/40"
            },
            {
              title: "Positive Intelligence (PQ®)",
              description: "Develop mental fitness and emotional intelligence for peak performance and sustainable leadership",
              features: ["Mental Fitness Training", "Stress Management", "Peak Performance", "Leadership Presence"],
              color: "from-teal-400 to-cyan-600",
              bgGradient: "from-teal-900/40 to-cyan-900/40"
            },
            {
              title: "Executive Leadership Transformation",
              description: "Accelerate your journey to senior leadership with comprehensive executive coaching and strategic thinking development.",
              features: ["1:1 Executive Coaching", "Strategic Planning", "Board Presentation Skills", "Crisis Leadership"],
              duration: "6 months",
              price: 8500,
              level: "Executive",
              color: "from-teal-500 to-blue-400",
              bgGradient: "from-teal-900/40 to-blue-900/40"
            }
          ].map((program, index) => (
            <div key={index} className={`group relative animate-fade-in-up animation-delay-${index * 200}`}>
              {/* Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${program.color} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-1000 group-hover:duration-200`}></div>
              
              {/* Main Card */}
              <div className={`relative bg-gradient-to-br ${program.bgGradient} backdrop-blur-xl rounded-2xl border border-white/30 p-8 h-full hover:bg-white/10 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-3 shadow-xl hover:shadow-2xl flex flex-col`}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)'
                }}
              >
                {/* Top Accent */}
                <div className={`h-2 bg-gradient-to-r ${program.color} rounded-t-xl -mt-8 -mx-8 mb-6`}></div>
                
                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-200 transition-colors duration-300 min-h-[3rem] flex items-center">
                    {program.title}
                  </h3>
                  <p className="text-white/90 leading-relaxed mb-6 min-h-[4.5rem] group-hover:text-white transition-colors duration-300 font-medium">
                    {program.description}
                  </p>

                  <div className="mb-8">
                    <h4 className="text-lg font-bold text-white mb-4 group-hover:text-cyan-200 transition-colors duration-300">Program Includes:</h4>
                    <div className="space-y-3">
                      {program.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-white/90 group-hover:text-white transition-colors duration-300">
                          <CheckCircle className="h-5 w-5 text-cyan-400 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-auto">
                  <Button 
                    className={`w-full bg-gradient-to-r ${program.color} hover:shadow-lg text-white font-semibold shadow-md transition-all duration-300 group-hover:scale-105 border-0 rounded-xl`}
                    asChild
                  >
                    <Link href="/contact">
                      <span className="flex items-center justify-center font-semibold">
                        Get Started
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Link>
                  </Button>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-6 right-6 w-8 h-8 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute bottom-6 left-6 w-6 h-6 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" style={{ animationDelay: '200ms' }}></div>
                
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
            <span className="text-white/90 font-medium">Success Stories</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-yellow-100 to-orange-200 bg-clip-text text-transparent">
              What Our Clients
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
              Say About Us
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
            Real results from professionals who transformed their careers through our 
            <span className="text-yellow-300 font-medium"> coaching programs </span>
            and achieved remarkable success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Chen",
              role: "Senior Product Manager",
              company: "Tech Innovators Inc.",
              content: "The AI Integration Leadership coaching transformed how I approach product development. I'm now leading our company's AI strategy with confidence and delivering exceptional results.",
              rating: 5,
              image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
              gradient: "from-blue-500 to-cyan-400",
              bgGradient: "from-blue-900/20 to-cyan-900/20"
            },
            {
              name: "Marcus Rodriguez",
              role: "Agile Coach",
              company: "Global Solutions Ltd.",
              content: "The Agile Excellence program gave me the tools and confidence to transform our entire organization's approach to project management and team collaboration.",
              rating: 5,
              image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
              gradient: "from-emerald-500 to-teal-400",
              bgGradient: "from-emerald-900/20 to-teal-900/20"
            },
            {
              name: "Emily Watson",
              role: "Executive Director",
              company: "Future Enterprises",
              content: "Positive Intelligence coaching helped me develop the mental fitness needed to lead through challenging times with clarity, resilience, and unwavering confidence.",
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

// CTA Section
function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-teal-600 via-blue-600 to-cyan-600 text-white relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-white/10 to-teal-300/20 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-gradient-to-br from-blue-300/15 to-white/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-2/3 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-300/10 to-teal-300/10 rounded-full blur-2xl opacity-60"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
          <Rocket className="w-5 h-5 text-teal-300 mr-3" />
          <span className="text-white/90 font-medium">Ready to Transform?</span>
        </div>
        
        <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
          <span className="bg-gradient-to-r from-white via-teal-100 to-blue-200 bg-clip-text text-transparent">
            Ready to Transform
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
            Your Leadership?
          </span>
        </h2>
        
        <p className="text-xl md:text-2xl text-teal-100/90 max-w-4xl mx-auto leading-relaxed font-light mb-12">
          Take the first step towards becoming the leader you're meant to be. Our 
          <span className="text-white font-medium"> expert coaches </span>
          are ready to guide your transformation journey.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
          <Button 
            size="lg" 
            className="w-full sm:w-auto text-lg px-10 py-4 bg-white text-teal-600 hover:bg-gray-100 shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105 font-semibold rounded-xl border-0 group"
            asChild
          >
            <Link href="/contact">
              <span className="flex items-center justify-center">
                Start Your Coaching Journey
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </Button>
          
          <Button 
            size="lg" 
            className="w-full sm:w-auto text-lg px-10 py-4 bg-gradient-to-r from-white/20 to-white/10 border-2 border-white text-white hover:bg-white hover:text-teal-600 shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105 font-semibold rounded-xl backdrop-blur-sm group"
            asChild
          >
            <Link href="/courses">
              <span className="flex items-center justify-center">
                <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Explore Our Courses
              </span>
            </Link>
          </Button>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
          {[
            { number: "500+", label: "Leaders Coached", icon: <Users className="w-5 h-5" /> },
            { number: "98%", label: "Success Rate", icon: <TrendingUp className="w-5 h-5" /> },
            { number: "4.9", label: "Average Rating", icon: <Star className="w-5 h-5" /> },
            { number: "20+", label: "Countries", icon: <Award className="w-5 h-5" /> }
          ].map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-center mb-3 text-teal-300 group-hover:text-white transition-colors">
                {stat.icon}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">{stat.number}</div>
              <div className="text-sm text-teal-200/80 uppercase tracking-wide font-medium group-hover:text-white/90 transition-colors">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}