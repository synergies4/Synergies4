'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
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
  Menu,
  X,
  Lightbulb
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }
};

// Scroll-triggered animation hook
function useScrollAnimation() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return { ref, isInView };
}

export default function Contact() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
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
    }, 3000);
  };

  return (
    <main className="min-h-screen">
      {/* Countdown Banner */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-sm md:text-base"
            >
              🚀 Expand your potential through learning. Offering earlybirds a discount of $295.00.
            </motion.p>
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {['00 Days', '00 Hours', '00 Minutes', '00 Seconds'].map((time, index) => (
                <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                  {time}
                </Badge>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.nav 
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link href="/" className="flex items-center">
                <motion.span 
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.02,
                    textShadow: "0 0 8px rgba(59, 130, 246, 0.5)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  Synergies4
                </motion.span>
              </Link>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['About Us', 'Courses', 'Coaching', 'Consulting', 'Industry Insight', 'Contact'].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                >
                  <Link 
                    href={
                      item === 'About Us' ? '/about-us' :
                      item === 'Courses' ? '/courses' :
                      item === 'Coaching' ? '/coaching' : 
                      item === 'Consulting' ? '/consulting' : 
                      item === 'Industry Insight' ? '/industry-insight' :
                      item === 'Contact' ? '/contact' :
                      `/${item.toLowerCase().replace(' ', '-')}`
                    } 
                    className={`text-gray-600 hover:text-blue-600 transition-colors font-medium ${
                      item === 'Contact' ? 'text-blue-600 font-semibold' : ''
                    }`}
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            {/* Desktop Auth */}
            <motion.div 
              className="hidden md:flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {user ? (
                <UserAvatar />
              ) : (
                <>
                  <Button variant="ghost" asChild className="hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 transition-colors">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </motion.div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden border-t bg-white/95 backdrop-blur-md overflow-hidden"
              >
                <div className="px-4 py-4 space-y-4">
                  {['About Us', 'Courses', 'Coaching', 'Consulting', 'Industry Insight'].map((item) => (
                    <Link
                      key={item}
                      href={
                        item === 'About Us' ? '/about-us' :
                        item === 'Courses' ? '/courses' :
                        item === 'Coaching' ? '/coaching' : 
                        item === 'Consulting' ? '/consulting' : 
                        item === 'Industry Insight' ? '/industry-insight' :
                        `/${item.toLowerCase().replace(' ', '-')}`
                      }
                      className="block text-gray-600 hover:text-blue-600 transition-colors font-medium py-2 text-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  ))}
                  
                  {/* Distinctive Contact Button for Mobile - Active State */}
                  <div className="pt-2">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Button 
                        asChild 
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg text-lg py-3 cursor-default"
                      >
                        <div className="flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact Us (Current)
                        </div>
                      </Button>
                    </motion.div>
                  </div>
                  
                  {/* Mobile Auth */}
                  <div className="pt-4 border-t space-y-3">
                    {user ? (
                      <div className="flex items-center space-x-2">
                        <UserAvatar />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button variant="ghost" className="w-full justify-start text-lg py-3" asChild>
                          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                            Login
                          </Link>
                        </Button>
                        <Button className="w-full text-lg py-3" asChild>
                          <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                            Sign Up
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Gradient Shapes */}
          <motion.div
            className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-lg blur-xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-32 right-20 w-24 h-24 bg-gradient-to-br from-purple-400/25 to-pink-400/25 rounded-full blur-lg"
            animate={{
              x: [0, -25, 0],
              y: [0, 15, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-indigo-400/15 to-blue-400/15 rounded-2xl blur-2xl"
            animate={{
              x: [0, 40, 0],
              y: [0, -30, 0],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div
            className="absolute top-1/2 right-10 w-28 h-28 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-lg blur-xl"
            animate={{
              x: [0, -20, 0],
              y: [0, 25, 0],
              rotate: [0, 270, 360],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          <motion.div
            className="absolute bottom-32 right-1/3 w-36 h-36 bg-gradient-to-br from-violet-400/18 to-purple-400/18 rounded-full blur-2xl"
            animate={{
              x: [0, 35, 0],
              y: [0, -40, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
          />
          
          {/* Pixelated Grid Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-12 md:grid-cols-20 lg:grid-cols-32 h-full gap-1">
              {Array.from({ length: 384 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-sm"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 0.3, 0],
                    scale: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.01,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Floating Particles - Mobile Optimized */}
          <div className="hidden md:block">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-40"
                style={{
                  left: `${(i * 5) % 100}%`,
                  top: `${(i * 7) % 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  x: [0, (i % 2 === 0 ? 25 : -25), 0],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 4 + (i % 4),
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          
          {/* Mobile-optimized particles */}
          <div className="block md:hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`mobile-particle-${i}`}
                className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30"
                style={{
                  left: `${(i * 20) % 100}%`,
                  top: `${(i * 25) % 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Gradient Mesh - Simplified for mobile */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/3 to-pink-500/3" />
        </div>

        <motion.div 
          className="container mx-auto px-4 text-center relative z-10"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200">
              <MessageSquare className="w-4 h-4 mr-2" />
              Get In Touch
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Let's Start a{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Conversation
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            Ready to transform your organization with AI-powered learning? We're here to help you every step of the way.
          </motion.p>
        </motion.div>
      </section>

      {/* Contact Form & Info Section */}
      <ContactFormSection 
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isSubmitted={isSubmitted}
      />

      {/* Contact Information Section */}
      <ContactInfoSection />

      {/* Footer */}
      <motion.footer 
        className="bg-gray-900 text-white py-16"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.span 
                className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 block"
              >
                Synergies4
              </motion.span>
              <p className="text-gray-400 mb-4">
                AI-powered learning tailored uniquely to you and your organization.
              </p>
              <div className="flex space-x-4">
                {['Facebook', 'Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                  <a key={social} href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">{social}</span>
                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                  </a>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold mb-4">Courses</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Agile & Scrum</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Product Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Leadership</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Analysis</a></li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about-us" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/coaching" className="hover:text-white transition-colors">Coaching</Link></li>
                <li><Link href="/consulting" className="hover:text-white transition-colors">Consulting</Link></li>
              </ul>
              
              {/* Distinctive Contact Button in Footer */}
              <div className="mt-6">
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button 
                    asChild 
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group w-full"
                  >
                    <Link href="/contact">
                      {/* Subtle shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                      <span className="relative z-10 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Us
                      </span>
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </motion.div>
          </div>

          <Separator className="bg-gray-800 mb-8" />

          <motion.div 
            className="text-center text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <p>&copy; {new Date().getFullYear()} Synergies4 LLC. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Synergies4™, PocketCoachAI™, Adaptive Content Pods™ are trademarks of Synergies4 LLC.
            </p>
          </motion.div>
        </div>
      </motion.footer>
    </main>
  );
}

// Contact Form Section Component
function ContactFormSection({ 
  formData, 
  handleInputChange, 
  handleSelectChange, 
  handleSubmit, 
  isSubmitting, 
  isSubmitted 
}: any) {
  const { ref, isInView } = useScrollAnimation();

  return (
    <motion.section 
      ref={ref}
      className="py-20 bg-white"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div variants={fadeInUp}>
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-600">Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h3>
                    <p className="text-green-600">Thank you for reaching out. We'll be in touch soon.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company/Organization</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inquiryType">Inquiry Type</Label>
                      <Select value={formData.inquiryType} onValueChange={handleSelectChange}>
                        <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="training">Training Programs</SelectItem>
                          <SelectItem value="consulting">Consulting Services</SelectItem>
                          <SelectItem value="coaching">Coaching Services</SelectItem>
                          <SelectItem value="partnership">Partnership Opportunities</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        className="focus:ring-2 focus:ring-blue-500"
                        placeholder="Tell us about your needs and how we can help..."
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={fadeInUp} className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Whether you're looking to transform your organization with AI-powered learning, 
                need expert consulting, or want to explore partnership opportunities, we're here to help.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email Us</h3>
                  <p className="text-gray-600">hello@synergies4.com</p>
                  <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Call Us</h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                  <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM EST</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Visit Us</h3>
                  <p className="text-gray-600">123 Innovation Drive<br />Tech Hub, CA 94105</p>
                  <p className="text-sm text-gray-500">By appointment only</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Business Hours</h3>
                  <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                  <p className="text-gray-600">Saturday - Sunday: Closed</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Need Immediate Help?</h3>
              <p className="text-gray-600 mb-4">
                For urgent inquiries or technical support, reach out to us directly.
              </p>
              <Button variant="outline" className="hover:bg-blue-50">
                <MessageSquare className="mr-2 h-4 w-4" />
                Live Chat Support
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

// Contact Information Section Component
function ContactInfoSection() {
  const { ref, isInView } = useScrollAnimation();

  const offices = [
    {
      city: "San Francisco",
      address: "123 Innovation Drive, Tech Hub, CA 94105",
      phone: "+1 (555) 123-4567",
      email: "sf@synergies4.com"
    },
    {
      city: "New York",
      address: "456 Business Ave, Manhattan, NY 10001",
      phone: "+1 (555) 987-6543",
      email: "ny@synergies4.com"
    },
    {
      city: "London",
      address: "789 Innovation Street, London, UK EC1A 1BB",
      phone: "+44 20 1234 5678",
      email: "london@synergies4.com"
    }
  ];

  return (
    <motion.section 
      ref={ref}
      className="py-20 bg-gray-50"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-16" variants={fadeInUp}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Global Presence
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            With offices around the world, we're always close by to support your learning journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offices.map((office, index) => (
            <motion.div key={index} variants={scaleIn}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                    <Building className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-blue-600">{office.city}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <p className="text-gray-600 text-sm">{office.address}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-600 text-sm">{office.phone}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-600 text-sm">{office.email}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
} 