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
    <section id="consulting-services" className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
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
            <Settings className="w-5 h-5 text-blue-600 mr-3" />
            <span className="text-blue-700 font-medium">Our Services</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Comprehensive Consulting
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Solutions
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-light">
            From strategy development to implementation, we provide 
            <span className="text-blue-600 font-medium"> end-to-end consulting services </span>
            tailored to your organization's unique needs and challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Brain className="h-8 w-8" />,
              title: "AI Integration Strategy",
              description: "Develop comprehensive AI adoption strategies that align with your business objectives and drive measurable results across your organization.",
              features: ["AI Readiness Assessment", "Technology Roadmap", "Implementation Planning", "Change Management"],
              gradient: "from-blue-500 to-cyan-400",
              bgGradient: "from-blue-50 to-cyan-50"
            },
            {
              icon: <Zap className="h-8 w-8" />,
              title: "Agile Transformation",
              description: "Transform your organization with proven Agile methodologies that improve efficiency, team collaboration, and delivery speed.",
              features: ["Agile Assessment", "Process Optimization", "Team Training", "Cultural Change"],
              gradient: "from-emerald-500 to-teal-400",
              bgGradient: "from-emerald-50 to-teal-50"
            },
            {
              icon: <Target className="h-8 w-8" />,
              title: "Organizational Development",
              description: "Build high-performing teams with positive intelligence and leadership development programs that create lasting impact.",
              features: ["Leadership Coaching", "Team Dynamics", "Performance Optimization", "Culture Building"],
              gradient: "from-purple-500 to-pink-400",
              bgGradient: "from-purple-50 to-pink-50"
            }
          ].map((service, index) => (
            <div key={index} className={`group relative animate-fade-in-up animation-delay-${index * 200}`}>
              {/* Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${service.gradient} rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-1000 group-hover:duration-200`}></div>
              
              {/* Main Card */}
              <div className={`relative bg-gradient-to-br ${service.bgGradient} rounded-2xl border border-white/50 p-8 h-full hover:bg-white/80 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-3 shadow-lg hover:shadow-2xl backdrop-blur-sm text-center`}>
                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {service.icon}
                  </div>
                  
                  {/* Floating ring effect */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 border-2 border-current rounded-full opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700" style={{ color: service.gradient.includes('blue') ? '#3B82F6' : service.gradient.includes('emerald') ? '#10B981' : service.gradient.includes('teal') ? '#14B8A6' : '#F97316' }}></div>
                </div>

                {/* Content */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base mb-6 group-hover:text-gray-800 transition-colors duration-300">
                    {service.description}
                  </p>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">What's Included:</h4>
                    <div className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-600 justify-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  className={`w-full bg-gradient-to-r ${service.gradient} hover:shadow-lg text-white shadow-md transition-all duration-300 group-hover:scale-105 border-0 rounded-xl`}
                  asChild
                >
                  <Link href="/contact">
                    <span className="flex items-center justify-center">
                      Learn More
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </Button>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" style={{ animationDelay: '200ms' }}></div>
                
                {/* Bottom highlight */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent group-hover:w-20 transition-all duration-500 rounded-full" style={{ color: service.gradient.includes('blue') ? '#3B82F6' : service.gradient.includes('emerald') ? '#10B981' : service.gradient.includes('teal') ? '#14B8A6' : '#F97316' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Why Choose Section
function WhyChooseSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-indigo-950 via-slate-900 to-gray-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-gradient-to-br from-purple-500/15 to-pink-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
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
            <Award className="w-5 h-5 text-teal-300 mr-3" />
            <span className="text-white/90 font-medium">Why Choose Us</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
              Proven Expertise,
            </span>
            <br />
            <span className="bg-gradient-to-r from-teal-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
              Measurable Results
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-blue-200/90 max-w-4xl mx-auto leading-relaxed font-light">
            Partner with consultants who understand both 
            <span className="text-cyan-300 font-medium"> technology and business transformation </span>
            to drive sustainable organizational success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <BarChart3 className="h-8 w-8" />,
              title: "Data-Driven Approach",
              description: "Every recommendation is backed by thorough analysis and measurable metrics that ensure sustainable success.",
              gradient: "from-blue-500 to-cyan-400",
              bgGradient: "from-blue-900/20 to-cyan-900/20"
            },
            {
              icon: <Globe className="h-8 w-8" />,
              title: "Global Experience",
              description: "Proven track record with organizations across industries and continents, bringing diverse perspectives and solutions.",
              gradient: "from-emerald-500 to-teal-400",
              bgGradient: "from-emerald-900/20 to-teal-900/20"
            },
            {
              icon: <Rocket className="h-8 w-8" />,
              title: "Rapid Implementation",
              description: "Accelerated timelines without compromising quality or sustainability, ensuring fast time-to-value for your organization.",
              gradient: "from-purple-500 to-pink-400",
              bgGradient: "from-purple-900/20 to-pink-900/20"
            },
            {
              icon: <Users className="h-8 w-8" />,
              title: "Team Empowerment",
              description: "We build internal capabilities to ensure long-term success and independence, creating lasting organizational capacity.",
              gradient: "from-orange-500 to-red-400",
              bgGradient: "from-orange-900/20 to-red-900/20"
            }
          ].map((item, index) => (
            <div key={index} className={`group relative animate-fade-in-up animation-delay-${index * 200}`}>
              {/* Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-1000 group-hover:duration-200`}></div>
              
              {/* Main Card */}
              <div className={`relative bg-gradient-to-br ${item.bgGradient} backdrop-blur-xl rounded-2xl border border-white/20 p-8 h-full hover:bg-white/5 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-3 shadow-xl hover:shadow-2xl text-center`}>
                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {item.icon}
                  </div>
                  
                  {/* Floating ring effect */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 border-2 border-current rounded-full opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700" style={{ color: item.gradient.includes('blue') ? '#3B82F6' : item.gradient.includes('emerald') ? '#10B981' : item.gradient.includes('teal') ? '#14B8A6' : '#F97316' }}></div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-200 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-blue-200/80 leading-relaxed text-base group-hover:text-white/90 transition-colors duration-300">
                    {item.description}
                  </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" style={{ animationDelay: '200ms' }}></div>
                
                {/* Bottom highlight */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent group-hover:w-20 transition-all duration-500 rounded-full" style={{ color: item.gradient.includes('blue') ? '#3B82F6' : item.gradient.includes('emerald') ? '#10B981' : item.gradient.includes('teal') ? '#14B8A6' : '#F97316' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Case Studies Section
function CaseStudiesSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-gradient-to-br from-blue-500/15 to-cyan-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
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
              Transformations That
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
              Deliver Results
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
            Real outcomes from organizations that partnered with us for their 
            <span className="text-yellow-300 font-medium"> transformation journey </span>
            and achieved remarkable, measurable success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {[
            {
              company: "Global Manufacturing Corp",
              industry: "Manufacturing",
              challenge: "Legacy processes hindering digital transformation and operational efficiency",
              solution: "Comprehensive AI integration and Agile transformation across all business units",
              results: ["40% increase in operational efficiency", "60% faster time-to-market", "25% reduction in costs", "95% employee adoption rate"],
              testimonial: "Synergies4's consulting transformed our entire operation. We're now a truly digital-first organization with capabilities we never thought possible.",
              author: "Chief Technology Officer",
              gradient: "from-blue-500 to-cyan-400",
              bgGradient: "from-blue-900/20 to-cyan-900/20"
            },
            {
              company: "Financial Services Leader",
              industry: "Financial Services",
              challenge: "Scaling agile practices across multiple teams and geographic locations",
              solution: "Enterprise Agile transformation with leadership coaching and cultural change management",
              results: ["50% improvement in delivery speed", "90% employee satisfaction increase", "35% boost in innovation metrics", "99% project success rate"],
              testimonial: "The cultural transformation was remarkable. Our teams are more collaborative and innovative than ever, delivering exceptional value to our clients.",
              author: "VP of Digital Transformation",
              gradient: "from-emerald-500 to-teal-400",
              bgGradient: "from-emerald-900/20 to-teal-900/20"
            }
          ].map((study, index) => (
            <div key={index} className={`group relative animate-fade-in-up animation-delay-${index * 300}`}>
              {/* Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${study.gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-1000 group-hover:duration-200`}></div>
              
              {/* Main Card */}
              <div className={`relative bg-gradient-to-br ${study.bgGradient} backdrop-blur-xl rounded-2xl border border-white/20 p-8 h-full hover:bg-white/5 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-3 shadow-xl hover:shadow-2xl`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Badge variant="outline" className="text-sm bg-white/10 border-white/30 text-white">
                    {study.industry}
                  </Badge>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                    ))}
                  </div>
                </div>

                {/* Company */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-200 transition-colors duration-300">
                  {study.company}
                </h3>

                {/* Challenge & Solution */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="text-lg font-semibold text-blue-200 mb-2 group-hover:text-white transition-colors duration-300">Challenge:</h4>
                    <p className="text-gray-300 leading-relaxed group-hover:text-white/90 transition-colors duration-300">{study.challenge}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-blue-200 mb-2 group-hover:text-white transition-colors duration-300">Solution:</h4>
                    <p className="text-gray-300 leading-relaxed group-hover:text-white/90 transition-colors duration-300">{study.solution}</p>
                  </div>
                </div>

                {/* Results */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-yellow-300 mb-4 group-hover:text-yellow-200 transition-colors duration-300">Key Results:</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {study.results.map((result, idx) => (
                      <div key={idx} className="flex items-center text-gray-300 group-hover:text-white/90 transition-colors duration-300">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                        <span className="font-medium">{result}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonial */}
                <blockquote className="text-gray-200 italic leading-relaxed mb-4 group-hover:text-white transition-colors duration-300 font-light text-lg border-l-4 border-yellow-400 pl-4">
                  "{study.testimonial}"
                </blockquote>
                <p className="text-yellow-300 font-semibold group-hover:text-yellow-200 transition-colors duration-300">— {study.author}</p>

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

// CTA Section
function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 text-white relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-white/10 to-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-gradient-to-br from-blue-300/15 to-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 left-1/4 w-64 h-64 bg-gradient-to-br from-indigo-300/10 to-purple-300/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
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
          <span className="text-white/90 font-medium">Ready to Transform?</span>
        </div>
        
        <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
          <span className="bg-gradient-to-r from-white via-teal-100 to-blue-200 bg-clip-text text-transparent">
            Ready to Transform
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
            Your Organization?
          </span>
        </h2>
        
        <p className="text-xl md:text-2xl text-teal-100/90 max-w-4xl mx-auto leading-relaxed font-light mb-12">
          Let's discuss how our consulting services can help you achieve your 
          <span className="text-white font-medium"> transformation goals </span>
          and drive sustainable growth across your organization.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
          <Button 
            size="lg" 
            className="w-full sm:w-auto text-lg px-10 py-4 bg-white text-purple-600 hover:bg-gray-100 shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105 font-semibold rounded-xl border-0 group"
            asChild
          >
            <Link href="/contact">
              <span className="flex items-center justify-center">
                Schedule Consultation
                <MessageSquare className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform" />
              </span>
            </Link>
          </Button>
          
          <Button 
            size="lg" 
            className="w-full sm:w-auto text-lg px-10 py-4 bg-gradient-to-r from-white/20 to-white/10 border-2 border-white text-white hover:bg-white hover:text-purple-600 shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105 font-semibold rounded-xl backdrop-blur-sm group"
            asChild
          >
            <Link href="/courses">
              <span className="flex items-center justify-center">
                <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Explore Our Programs
              </span>
            </Link>
          </Button>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
          {[
            { number: "100+", label: "Organizations", icon: <Building className="w-5 h-5" /> },
            { number: "95%", label: "Success Rate", icon: <TrendingUp className="w-5 h-5" /> },
            { number: "4.8", label: "Client Rating", icon: <Star className="w-5 h-5" /> },
            { number: "30+", label: "Countries", icon: <Globe className="w-5 h-5" /> }
          ].map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-center mb-3 text-purple-300 group-hover:text-white transition-colors">
                {stat.icon}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">{stat.number}</div>
              <div className="text-sm text-purple-200/80 uppercase tracking-wide font-medium group-hover:text-white/90 transition-colors">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 