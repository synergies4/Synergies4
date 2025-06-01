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
  MessageSquare
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
        size="large"
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
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
            <Lightbulb className="w-4 h-4 mr-2" />
            Why Choose Our Coaching
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Personalized Growth That Delivers Results
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our coaching approach combines proven methodologies with AI-powered insights to accelerate your professional development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Brain className="h-8 w-8" />,
              title: "AI-Enhanced Coaching",
              description: "Leverage cutting-edge AI tools to identify growth opportunities and track your progress with precision."
            },
            {
              icon: <Target className="h-8 w-8" />,
              title: "Goal-Oriented Approach",
              description: "Set clear, measurable objectives and receive personalized strategies to achieve your career aspirations."
            },
            {
              icon: <Users className="h-8 w-8" />,
              title: "Expert Mentorship",
              description: "Work with industry leaders who have successfully navigated the challenges you're facing."
            },
            {
              icon: <Rocket className="h-8 w-8" />,
              title: "Accelerated Growth",
              description: "Fast-track your development with proven frameworks and real-world application opportunities."
            },
            {
              icon: <CheckCircle className="h-8 w-8" />,
              title: "Measurable Results",
              description: "Track your progress with data-driven insights and celebrate meaningful achievements."
            },
            {
              icon: <Award className="h-8 w-8" />,
              title: "Industry Recognition",
              description: "Gain credentials and recognition that advance your career and open new opportunities."
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

// Focus Areas Section
function FocusAreasSection() {
  return (
    <section id="coaching-programs" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
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
          <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">
            <Compass className="w-4 h-4 mr-2" />
            Coaching Focus Areas
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Specialized Coaching Programs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose from our targeted coaching programs designed to address specific professional development needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "AI Integration Leadership",
              description: "Master the art of leading AI transformation initiatives and building AI-ready teams",
              features: ["AI Strategy Development", "Change Management", "Team Transformation", "Technology Adoption"],
              color: "from-blue-400 to-blue-600"
            },
            {
              title: "Agile Excellence",
              description: "Become a certified Agile leader with deep expertise in modern methodologies",
              features: ["Scrum Mastery", "Kanban Implementation", "Team Facilitation", "Continuous Improvement"],
              color: "from-green-400 to-green-600"
            },
            {
              title: "Positive Intelligence (PQ®)",
              description: "Develop mental fitness and emotional intelligence for peak performance",
              features: ["Mental Fitness Training", "Stress Management", "Peak Performance", "Leadership Presence"],
              color: "from-purple-400 to-purple-600"
            }
          ].map((program, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden rounded-xl flex flex-col h-full">
              <div className={`h-2 bg-gradient-to-r ${program.color}`}></div>
              
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors min-h-[3rem] flex items-center">
                  {program.title}
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed min-h-[4.5rem]">
                  {program.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Program Includes:</h4>
                  <div className="space-y-2">
                    {program.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <Button 
                    className={`w-full bg-gradient-to-r ${program.color} hover:shadow-lg text-white shadow-md transition-all duration-300 group-hover:scale-105`}
                    asChild
                  >
                    <Link href="/contact">
                      <span className="flex items-center justify-center">
                        Get Started
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200">
            <Star className="w-4 h-4 mr-2" />
            Success Stories
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Real results from professionals who transformed their careers through our coaching programs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Chen",
              role: "Senior Product Manager",
              company: "Tech Innovators Inc.",
              content: "The AI Integration Leadership coaching transformed how I approach product development. I'm now leading our company's AI strategy with confidence.",
              rating: 5,
              image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
            },
            {
              name: "Marcus Rodriguez",
              role: "Agile Coach",
              company: "Global Solutions Ltd.",
              content: "The Agile Excellence program gave me the tools and confidence to transform our entire organization's approach to project management.",
              rating: 5,
              image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
            },
            {
              name: "Emily Watson",
              role: "Executive Director",
              company: "Future Enterprises",
              content: "Positive Intelligence coaching helped me develop the mental fitness needed to lead through challenging times with clarity and resilience.",
              rating: 5,
              image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
            }
          ].map((testimonial, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 group border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-gray-500">{testimonial.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-white/10 rounded-lg blur-lg"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Transform Your Leadership?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Take the first step towards becoming the leader you're meant to be. Our expert coaches are ready to guide your journey.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            asChild
          >
            <Link href="/contact">
              Start Your Coaching Journey
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            asChild
          >
            <Link href="/courses">
              Explore Our Courses
              <BookOpen className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
} 