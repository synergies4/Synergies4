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
  Loader2
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

  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        badge={{
          icon: <MessageSquare className="w-4 h-4" />,
          text: "Get In Touch"
        }}
        title="Let's Start a"
        highlightText="Conversation"
        description="Ready to transform your organization with AI-powered learning? We're here to help you every step of the way."
        primaryCTA={{
          text: "Start Conversation",
          href: "#contact-form"
        }}
        secondaryCTA={{
          text: "View Our Locations",
          href: "#locations",
          icon: <ArrowRight className="w-4 h-4" />
        }}
        backgroundVariant="gradient"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-blue-200/50 mb-6">
                  <MessageSquare className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-blue-700 font-medium text-sm">Contact Form</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-700 via-blue-800 to-teal-800 bg-clip-text text-transparent">
                  Send us a Message
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Fill out the form below and we'll get back to you within 
                  <span className="text-blue-600 font-medium"> 24 hours.</span>
                </p>
              </div>

              {isSubmitted ? (
                <div className="group relative">
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-25 animate-pulse"></div>
                  
                  {/* Success Card */}
                  <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 p-8 text-center backdrop-blur-sm">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce">
                      <CheckCircle className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-800 mb-4">Message Sent Successfully!</h3>
                    <p className="text-green-700 leading-relaxed">
                      Thank you for reaching out. We'll get back to you within 24 hours with a personalized response.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="group relative">
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-700"></div>
                  
                  {/* Form Card */}
                  <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                          <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 mb-2 block">
                            First Name *
                          </Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 bg-white/90"
                            placeholder="John"
                          />
                        </div>
                        <div className="group">
                          <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 mb-2 block">
                            Last Name *
                          </Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 bg-white/90"
                            placeholder="Doe"
                          />
                        </div>
                      </div>

                      {/* Contact Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                          <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 bg-white/90"
                            placeholder="john@company.com"
                          />
                        </div>
                        <div className="group">
                          <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 block">
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 bg-white/90"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>

                      {/* Company and Inquiry Type */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                          <Label htmlFor="company" className="text-sm font-semibold text-gray-700 mb-2 block">
                            Company
                          </Label>
                          <Input
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 bg-white/90"
                            placeholder="Your Company"
                          />
                        </div>
                        <div className="group">
                          <Label htmlFor="inquiryType" className="text-sm font-semibold text-gray-700 mb-2 block">
                            Inquiry Type *
                          </Label>
                          <Select value={formData.inquiryType} onValueChange={handleSelectChange}>
                            <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 bg-white/90">
                              <SelectValue placeholder="Select inquiry type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white/95 backdrop-blur-xl border border-gray-200">
                              <SelectItem value="general">General Inquiry</SelectItem>
                              <SelectItem value="courses">Course Information</SelectItem>
                              <SelectItem value="coaching">Coaching Services</SelectItem>
                              <SelectItem value="consulting">Consulting Services</SelectItem>
                              <SelectItem value="partnership">Partnership</SelectItem>
                              <SelectItem value="support">Technical Support</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="group">
                        <Label htmlFor="subject" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Subject *
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 bg-white/90"
                          placeholder="How can we help you?"
                        />
                      </div>

                      {/* Message */}
                      <div className="group">
                        <Label htmlFor="message" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Message *
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={6}
                          className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 bg-white/90 resize-none"
                          placeholder="Tell us more about your needs..."
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="relative">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 rounded-xl group"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Sending Message...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

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
                    contact: "hello@synergies4.com",
                    href: "mailto:hello@synergies4.com",
                    gradient: "from-blue-500 to-cyan-400",
                    bgGradient: "from-blue-50 to-cyan-50"
                  },
                  {
                    icon: <Phone className="h-6 w-6" />,
                    title: "Call Us",
                    description: "Mon-Fri from 8am to 5pm PST",
                    contact: "+1 (555) 123-4567",
                    href: "tel:+1-555-123-4567",
                    gradient: "from-green-500 to-emerald-400",
                    bgGradient: "from-green-50 to-emerald-50"
                  },
                  {
                    icon: <MessageSquare className="h-6 w-6" />,
                    title: "Live Chat",
                    description: "Chat with our support team",
                    contact: "Start Chat",
                    href: "#",
                    gradient: "from-purple-500 to-pink-400",
                    bgGradient: "from-purple-50 to-pink-50"
                  }
                ].map((item, index) => (
                  <div key={index} className={`group relative animate-fade-in-up animation-delay-${index * 100}`}>
                    {/* Glow Effect */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-150`}></div>
                    
                    {/* Main Card */}
                    <div className={`relative bg-gradient-to-br ${item.bgGradient} rounded-2xl border border-white/50 p-6 hover:bg-white/80 transition-all duration-150 group-hover:scale-105 shadow-lg hover:shadow-2xl backdrop-blur-sm`}>
                      {/* Icon Container */}
                      <div className="relative mb-6">
                        <div className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-150`}>
                          {item.icon}
                        </div>
                        
                        {/* Accent Line */}
                        <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r ${item.gradient} group-hover:w-16 transition-all duration-150 rounded-full`}></div>
                      </div>
                      
                      {/* Content */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-700 transition-colors duration-150">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Business Hours */}
                <div className="group relative">
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-700"></div>
                  
                  {/* Hours Card */}
                  <div className="relative bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-white/50 p-6 hover:bg-white/80 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-1 shadow-lg hover:shadow-2xl backdrop-blur-sm">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-orange-700 transition-colors">Business Hours</h3>
                        <div className="space-y-2 text-sm text-gray-700">
                          <div className="flex justify-between items-center py-1 px-3 bg-white/50 rounded-lg">
                            <span className="font-medium">Monday - Friday</span>
                            <span className="text-orange-600 font-semibold">8:00 AM - 5:00 PM PST</span>
                          </div>
                          <div className="flex justify-between items-center py-1 px-3 bg-white/50 rounded-lg">
                            <span className="font-medium">Saturday</span>
                            <span className="text-orange-600 font-semibold">9:00 AM - 2:00 PM PST</span>
                          </div>
                          <div className="flex justify-between items-center py-1 px-3 bg-white/50 rounded-lg">
                            <span className="font-medium">Sunday</span>
                            <span className="text-gray-500 font-semibold">Closed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Decorative element */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent group-hover:w-16 transition-all duration-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Offices Section */}
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
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
              <Globe className="w-5 h-5 text-blue-300 mr-3" />
              <span className="text-white/90 font-medium">Global Presence</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
                We're Here to
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent">
                Serve You
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
              With offices around the world, we're 
              <span className="text-cyan-300 font-medium"> always close by </span>
              to provide personalized support and service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                city: "San Francisco",
                role: "Headquarters",
                address: "123 Innovation Drive",
                location: "San Francisco, CA 94105",
                country: "United States",
                icon: <Building className="h-8 w-8" />,
                gradient: "from-blue-500 to-cyan-400",
                bgGradient: "from-blue-900/20 to-cyan-900/20"
              },
              {
                city: "New York",
                role: "East Coast Hub",
                address: "456 Business Ave",
                location: "New York, NY 10001",
                country: "United States",
                icon: <Users className="h-8 w-8" />,
                gradient: "from-emerald-500 to-teal-400",
                bgGradient: "from-emerald-900/20 to-teal-900/20"
              },
              {
                city: "London",
                role: "European Office",
                address: "789 Tech Street",
                location: "London EC2A 4DP",
                country: "United Kingdom",
                icon: <Globe className="h-8 w-8" />,
                gradient: "from-purple-500 to-pink-400",
                bgGradient: "from-purple-900/20 to-pink-900/20"
              }
            ].map((office, index) => (
              <div key={index} className={`group relative animate-fade-in-up animation-delay-${index * 100}`}>
                {/* Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${office.gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-1000 group-hover:duration-200`}></div>
                
                {/* Office Card */}
                <div className={`relative bg-gradient-to-br ${office.bgGradient} backdrop-blur-xl rounded-2xl border border-white/20 p-8 h-full hover:bg-white/5 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-3 shadow-xl hover:shadow-2xl text-center`}>
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className={`w-20 h-20 bg-gradient-to-br ${office.gradient} rounded-2xl flex items-center justify-center mx-auto text-white shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      {office.icon}
                    </div>
                    
                    {/* Floating ring effect */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 border-2 border-current rounded-full opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700" style={{ color: office.gradient.includes('blue') ? '#3B82F6' : office.gradient.includes('emerald') ? '#10B981' : '#8B5CF6' }}></div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-200 transition-colors duration-300">{office.city}</h3>
                    <p className="text-gray-300 mb-6 text-lg group-hover:text-gray-200 transition-colors duration-300">{office.role}</p>
                    
                    <div className="space-y-2 text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                      <div className="flex items-center justify-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-cyan-400" />
                        <span>{office.address}</span>
                      </div>
                      <p className="text-sm">{office.location}</p>
                      <p className="text-sm font-medium">{office.country}</p>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-6 h-6 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="absolute bottom-4 left-4 w-4 h-4 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" style={{ animationDelay: '200ms' }}></div>
                  
                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent group-hover:w-20 transition-all duration-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
} 