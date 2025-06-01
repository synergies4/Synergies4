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
        size="large"
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
            <Target className="w-4 h-4 mr-2" />
            Our Mission
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Sharper Minds. Stronger Teams. Healthier Workplaces.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We believe in the power of human potential amplified by intelligent technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Eye className="h-8 w-8" />,
              title: "Our Vision",
              description: "A world where every professional has the tools and mindset to thrive in an AI-enhanced workplace."
            },
            {
              icon: <Heart className="h-8 w-8" />,
              title: "Our Values",
              description: "Human-centered design, continuous learning, and sustainable transformation guide everything we do."
            },
            {
              icon: <Rocket className="h-8 w-8" />,
              title: "Our Approach",
              description: "We combine cutting-edge AI with proven methodologies to create lasting organizational change."
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

// Statistics Section
function StatisticsSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Our Impact in Numbers
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Real results from organizations and professionals who chose to transform with us
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: 10000, suffix: "+", label: "Professionals Trained" },
            { number: 95, suffix: "%", label: "Success Rate" },
            { number: 500, suffix: "+", label: "Organizations Served" },
            { number: 50, suffix: "+", label: "Countries Reached" }
          ].map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Stat Card Component
function StatCard({ stat, index }: { stat: any, index: number }) {
  const { count, setIsVisible } = useCounter(stat.number);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 200);
    return () => clearTimeout(timer);
  }, [setIsVisible, index]);

  return (
    <div className="text-center hover:scale-105 transition-transform duration-300">
      <div className="text-4xl md:text-5xl font-bold mb-2 text-blue-100">
        {count.toLocaleString()}{stat.suffix}
      </div>
      <div className="text-blue-200 text-sm md:text-base">{stat.label}</div>
    </div>
  );
}

// Special Section
function SpecialSection() {
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
          <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">
            <Lightbulb className="w-4 h-4 mr-2" />
            What Makes Us Special
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Beyond Traditional Training
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We don't just teach concepts - we transform how people think, work, and lead
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Brain className="h-8 w-8" />,
              title: "AI-Powered Personalization",
              description: "Every learning experience is tailored to your unique needs, goals, and learning style."
            },
            {
              icon: <Users className="h-8 w-8" />,
              title: "Human-Centered Design",
              description: "Technology serves people, not the other way around. We prioritize human connection and growth."
            },
            {
              icon: <Target className="h-8 w-8" />,
              title: "Results-Driven Approach",
              description: "We measure success by real-world impact, not just completion rates or satisfaction scores."
            },
            {
              icon: <Rocket className="h-8 w-8" />,
              title: "Continuous Innovation",
              description: "We stay ahead of industry trends to ensure our methods remain cutting-edge and effective."
            },
            {
              icon: <CheckCircle className="h-8 w-8" />,
              title: "Proven Methodologies",
              description: "Our approaches are backed by research, tested in practice, and refined through experience."
            },
            {
              icon: <Award className="h-8 w-8" />,
              title: "Expert Community",
              description: "Learn from and connect with a global network of industry leaders and practitioners."
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
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200">
            <Star className="w-4 h-4 mr-2" />
            What People Say
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Transformations That Speak for Themselves
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Real stories from professionals who've experienced the Synergies4 difference
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
              image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
            },
            {
              name: "Michael Chen",
              role: "Agile Coach",
              company: "Tech Startup",
              content: "The combination of Agile methodologies with AI insights has revolutionized how we approach product development. We're delivering value faster than ever before.",
              rating: 5,
              image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
            },
            {
              name: "Emily Rodriguez",
              role: "Team Lead",
              company: "Global Consulting Firm",
              content: "The positive intelligence training has been life-changing. I'm not just a better leader—I'm a better person. My team has noticed the difference immediately.",
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