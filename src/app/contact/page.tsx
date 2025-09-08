'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import PageLayout from '@/components/shared/PageLayout';
import HeroSection from '@/components/shared/HeroSection';
import { 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  Users,
  Building,
  Globe,
  Lightbulb,
  Loader2,
  BookOpen,
  TrendingUp,
  Award
} from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, inquiryType: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Combine first and last name for the API
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          subject: formData.subject || formData.inquiryType,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      setIsSubmitted(true);
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          subject: '',
          message: '',
          inquiryType: ''
        });
      }, 5000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlanSelection = async (planId: string) => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to login with plan selection in URL
        window.location.href = `/login?redirect=${encodeURIComponent(`/contact?plan=${planId}`)}`;
        return;
      }

      // Create Stripe checkout session for subscription
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/dashboard?subscription=success&plan=${planId}`,
          cancelUrl: window.location.href
        }),
      });

      const checkoutData = await response.json();

      if (response.ok && checkoutData.url) {
        // Redirect to Stripe checkout
        window.location.href = checkoutData.url;
      } else {
        alert(checkoutData.message || 'Failed to create subscription checkout');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Failed to start subscription. Please try again.');
    }
  };

  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        badge={{
          icon: <MessageSquare className="w-4 h-4" />,
          text: "Get In Touch"
        }}
        title="Contact"
        highlightText="Us"
        description="Ready to unlock real results with AI-powered learning for yourself, team, or entire organization? We’re here to guide the journey, every step of the way."
        backgroundVariant="gradient"
        customColors={{
          background: "bg-gradient-to-br from-rose-50 via-pink-50 to-red-50",
          accent: "bg-gradient-to-br from-rose-400/20 to-pink-400/25",
          particles: "bg-gradient-to-r from-rose-400 to-pink-400"
        }}
      />

      {/* Contact Form Section */}
      <section id="contact-form" className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
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
          <div className="grid grid-cols-1 gap-12">
            {/* Contact Information */}
            <div className="space-y-8 animate-fade-in-up animation-delay-200">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-teal-200/50 mb-6">
                  <Phone className="w-4 h-4 text-teal-600 mr-2" />
                  <span className="text-teal-700 font-medium text-sm">Contact Info</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-700 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                  Get in Touch
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Prefer to reach out directly? Here are all the ways you can 
                  <span className="text-teal-600 font-medium"> contact us.</span>
                </p>
              </div>

              <div className="space-y-6">
                {/* Contact Methods */}
                {[
                  {
                    icon: <Mail className="h-6 w-6" />,
                    title: "Email Us",
                    description: "Send us an email anytime",
                    contact: "info@synergies4.com",
                    href: "mailto:info@synergies4.com",
                    gradient: "from-blue-500 to-cyan-400",
                    bgGradient: "from-blue-50 to-cyan-50"
                  },
                  {
                    icon: <Phone className="h-6 w-6" />,
                    title: "Call Us",
                    description: "Mon-Fri from 9am to 6pm EST",
                    contact: "(743) 837-3746",
                    href: "tel:+1-743-837-3746",
                    gradient: "from-green-500 to-emerald-400",
                    bgGradient: "from-green-50 to-emerald-50"
                  }
                ].map((item, index) => (
                  <div key={index} className={`group relative animate-fade-in-up animation-delay-${index * 100}`}>
                    {/* Glow Effect */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity-smooth`}></div>
                    
                    {/* Main Card */}
                    <div className={`relative bg-gradient-to-br ${item.bgGradient} rounded-2xl border border-white/50 p-6 hover:bg-white/80 card-hover-optimized shadow-lg hover:shadow-2xl`}>
                      {/* Icon Container */}
                      <div className="relative mb-6">
                        <div className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg transition-shadow-smooth`}>
                          {item.icon}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-700 transition-colors-smooth">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {item.description}
                      </p>
                      <Link 
                        href={item.href}
                        className="inline-flex items-center text-lg font-semibold text-gray-900 hover:text-teal-600 transition-colors"
                      >
                        {item.contact}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans and Pricing Section - removed for now */}
      {false && (
      <section id="plans-pricing" className="py-24 bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-teal-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-2/3 right-1/3 w-64 h-64 bg-gradient-to-br from-teal-400/10 to-cyan-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Sophisticated Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #3B82F6 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, #06B6D4 1px, transparent 1px),
              radial-gradient(circle at 50% 50%, #10B981 0.5px, transparent 0.5px)
            `,
            backgroundSize: '60px 60px, 80px 80px, 40px 40px'
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-blue-200/50 mb-8">
              <Award className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-blue-700 font-medium">Plans & Pricing</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                Choose Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Learning Path
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Unlock your Agile potential with 
              <span className="text-blue-600 font-medium"> flexible plans </span>
              designed for every stage of your learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Starter Plan */}
            <div className="group relative">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity-smooth"></div>
              
              {/* Plan Card */}
              <div className="relative bg-white rounded-2xl border border-blue-200/50 p-8 h-full hover:bg-blue-50/50 card-hover-optimized shadow-xl hover:shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transition-transform-smooth group-hover:scale-110">
                    <BookOpen className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors-smooth">
                    Starter
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Perfect for individuals getting started with Agile
                  </p>
                </div>

                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">$29</span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Billed monthly</p>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    '5 AI conversations per day',
                    'Basic presentation templates',
                    'Standard scenario simulations',
                    'Email support',
                    'Access to course library',
                    'Mobile app access'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handlePlanSelection('starter')}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 text-lg font-semibold rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Get Started
                </Button>
              </div>
            </div>

            {/* Professional Plan - Featured */}
            <div className="group relative">
              {/* Featured Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Most Popular
                </div>
              </div>

              {/* Enhanced Glow Effect for Featured */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity-smooth"></div>
              
              {/* Plan Card */}
              <div className="relative bg-white rounded-2xl border-2 border-emerald-300 p-8 h-full hover:bg-emerald-50/50 card-hover-optimized shadow-2xl hover:shadow-3xl">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transition-transform-smooth group-hover:scale-110">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors-smooth">
                    Professional
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Ideal for Agile practitioners and team leads
                  </p>
                </div>

                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">$79</span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Billed monthly</p>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    'Unlimited AI conversations',
                    'Advanced presentation tools',
                    'Custom scenario creation',
                    'Priority support',
                    'Advanced analytics',
                    '1-on-1 coaching sessions',
                    'Team collaboration tools',
                    'Export capabilities'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handlePlanSelection('professional')}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 text-lg font-semibold rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Get Started
                </Button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="group relative">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity-smooth"></div>
              
              {/* Plan Card */}
              <div className="relative bg-white rounded-2xl border border-purple-200/50 p-8 h-full hover:bg-purple-50/50 card-hover-optimized shadow-xl hover:shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transition-transform-smooth group-hover:scale-110">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors-smooth">
                    Enterprise
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Complete solution for organizations
                  </p>
                </div>

                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">$199</span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Per team (up to 50 users)</p>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    'Everything in Professional',
                    'Multi-team management',
                    'Custom integrations',
                    'Dedicated account manager',
                    'Advanced reporting',
                    'SSO integration',
                    'API access',
                    'White-label options'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handlePlanSelection('enterprise')}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 text-lg font-semibold rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-16">
            <p className="text-gray-600 text-lg mb-6">
              All plans include a 
              <span className="text-teal-600 font-semibold"> 14-day free trial </span>
              with no commitment required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Get in Touch Section */}
      <section id="locations" className="py-24 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/15 to-cyan-600/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-gradient-to-br from-emerald-500/15 to-teal-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-2/3 left-1/4 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-yellow-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Sophisticated Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
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
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200/50 mb-8">
              <MessageSquare className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-blue-700 font-medium">Ready to Connect?</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
                Contact
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent">
                Us
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light mb-12">
              Ready to unlock real results with AI-powered learning for yourself, team, or entire organization? 
              <span className="text-cyan-300 font-medium"> We’re here to guide the journey, every step of the way.</span>
            </p>

            <Button 
              onClick={() => {
                document.getElementById('contact-form')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
              className="group relative px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-2xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-3">
                <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                <span>Get in Touch</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
} 