'use client';

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
  Building,
  Lightbulb,
  Compass,
  MessageSquare,
  BarChart3,
  Settings,
  Globe
} from 'lucide-react';

export default function Consulting() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        badge={{
          icon: <Building className="w-4 h-4" />,
          text: "Enterprise Consulting"
        }}
        title="Transform Your"
        highlightText="Organization"
        description="Drive enterprise-wide transformation with our expert consulting services. From AI integration to Agile adoption, we help organizations build the capabilities needed for future success."
        primaryCTA={{
          text: "Schedule Consultation",
          href: "/contact"
        }}
        secondaryCTA={{
          text: "Our Services",
          href: "#consulting-services",
          icon: <ArrowRight className="w-4 h-4" />
        }}
        backgroundVariant="pattern"
        size="large"
      />

      {/* Services Section */}
      <ServicesSection />

      {/* Why Choose Section */}
      <WhyChooseSection />

      {/* Case Studies */}
      <CaseStudiesSection />

      {/* CTA Section */}
      <CTASection />
    </PageLayout>
  );
}

// Services Section
function ServicesSection() {
  return (
    <section id="consulting-services" className="py-20 bg-white relative overflow-hidden">
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
            <Settings className="w-4 h-4 mr-2" />
            Our Services
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Comprehensive Consulting Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From strategy development to implementation, we provide end-to-end consulting services tailored to your organization's needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Brain className="h-8 w-8" />,
              title: "AI Integration Strategy",
              description: "Develop comprehensive AI adoption strategies that align with your business objectives and drive measurable results.",
              features: ["AI Readiness Assessment", "Technology Roadmap", "Implementation Planning", "Change Management"]
            },
            {
              icon: <Zap className="h-8 w-8" />,
              title: "Agile Transformation",
              description: "Transform your organization with proven Agile methodologies that improve efficiency and team collaboration.",
              features: ["Agile Assessment", "Process Optimization", "Team Training", "Cultural Change"]
            },
            {
              icon: <Target className="h-8 w-8" />,
              title: "Organizational Development",
              description: "Build high-performing teams with positive intelligence and leadership development programs.",
              features: ["Leadership Coaching", "Team Dynamics", "Performance Optimization", "Culture Building"]
            }
          ].map((service, index) => (
            <Card key={index} className="h-full text-center hover:shadow-xl transition-all duration-300 group border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                  asChild
                >
                  <Link href="/contact">
                    <span className="flex items-center justify-center">
                      Learn More
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Why Choose Section
function WhyChooseSection() {
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
            <Award className="w-4 h-4 mr-2" />
            Why Choose Us
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Proven Expertise, Measurable Results
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Partner with consultants who understand both technology and business transformation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <BarChart3 className="h-8 w-8" />,
              title: "Data-Driven Approach",
              description: "Every recommendation is backed by thorough analysis and measurable metrics."
            },
            {
              icon: <Globe className="h-8 w-8" />,
              title: "Global Experience",
              description: "Proven track record with organizations across industries and continents."
            },
            {
              icon: <Rocket className="h-8 w-8" />,
              title: "Rapid Implementation",
              description: "Accelerated timelines without compromising quality or sustainability."
            },
            {
              icon: <Users className="h-8 w-8" />,
              title: "Team Empowerment",
              description: "We build internal capabilities to ensure long-term success and independence."
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

// Case Studies Section
function CaseStudiesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200">
            <Star className="w-4 h-4 mr-2" />
            Success Stories
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Transformations That Deliver Results
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Real outcomes from organizations that partnered with us for their transformation journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {[
            {
              company: "Global Manufacturing Corp",
              industry: "Manufacturing",
              challenge: "Legacy processes hindering digital transformation",
              solution: "Comprehensive AI integration and Agile transformation",
              results: ["40% increase in operational efficiency", "60% faster time-to-market", "25% reduction in costs"],
              testimonial: "Synergies4's consulting transformed our entire operation. We're now a truly digital-first organization.",
              author: "Chief Technology Officer"
            },
            {
              company: "Financial Services Leader",
              industry: "Financial Services",
              challenge: "Scaling agile practices across multiple teams",
              solution: "Enterprise Agile transformation with leadership coaching",
              results: ["50% improvement in delivery speed", "90% employee satisfaction increase", "35% boost in innovation metrics"],
              testimonial: "The cultural transformation was remarkable. Our teams are more collaborative and innovative than ever.",
              author: "VP of Digital Transformation"
            }
          ].map((study, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 group border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="text-xs">
                    {study.industry}
                  </Badge>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  {study.company}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  <strong>Challenge:</strong> {study.challenge}
                </CardDescription>
                <CardDescription className="text-base leading-relaxed">
                  <strong>Solution:</strong> {study.solution}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Results:</h4>
                  <div className="space-y-2">
                    {study.results.map((result, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{result}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <blockquote className="text-gray-600 italic leading-relaxed mb-4">
                  "{study.testimonial}"
                </blockquote>
                <p className="text-sm font-semibold text-gray-900">— {study.author}</p>
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
          Ready to Transform Your Organization?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Let's discuss how our consulting services can help you achieve your transformation goals and drive sustainable growth.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            asChild
          >
            <Link href="/contact">
              Schedule Consultation
              <MessageSquare className="h-5 w-5 ml-2" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            asChild
          >
            <Link href="/courses">
              Explore Our Programs
              <BookOpen className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
} 