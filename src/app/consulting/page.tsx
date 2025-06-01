'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
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
  Settings,
  BarChart3,
  MessageSquare
} from 'lucide-react';

// Animation variants
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

// Enhanced button animation variants
const buttonHover = {
  scale: 1.02,
  transition: { type: "spring", stiffness: 400, damping: 25 }
};

const buttonTap = {
  scale: 0.98,
  transition: { type: "spring", stiffness: 400, damping: 25 }
};

// Scroll-triggered animation hook
function useScrollAnimation() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return { ref, isInView };
}

export default function Consulting() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const { user } = useAuth();

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
            
            <div className="hidden md:flex items-center space-x-8">
              {['About Us', 'Courses', 'Coaching', 'Consulting', 'Industry Insight'].map((item, index) => (
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
                      `/${item.toLowerCase().replace(' ', '-')}`
                    } 
                    className={`text-gray-600 hover:text-blue-600 transition-colors font-medium ${
                      item === 'Consulting' ? 'text-blue-600 font-semibold' : ''
                    }`}
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="flex items-center space-x-3"
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
          </div>
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

          {/* Floating Particles */}
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

          {/* Gradient Mesh */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />
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
              <Building className="w-4 h-4 mr-2" />
              Business Consulting
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Business
              </span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
              with Synergies4 Consulting
            </h2>
          </motion.div>
          
          <motion.p 
            className="text-lg text-gray-700 max-w-4xl mx-auto space-y-4 mb-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            At Synergies4, we don't just provide solutions — we partner with you to transform your business, streamline operations, and create lasting impact. Whether you're seeking to integrate cutting-edge AI, implement agile transformation, or develop positive intelligence (PQ) within your teams, our consulting services offer actionable strategies and hands-on support to make it happen.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <motion.div
              whileHover={{ 
                scale: 1.02,
                y: -2
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group" 
                asChild
              >
                <Link href="/contact">
                  {/* Subtle shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                  
                  <span className="relative z-10 flex items-center">
                    Request Consultation
                    <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Why Choose Section */}
      <WhyChooseSection />

      {/* Our Approach Section */}
      <OurApproachSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <FooterSection />
    </main>
  );
}

// Why Choose Section Component
function WhyChooseSection() {
  const { ref, isInView } = useScrollAnimation();

  const benefits = [
    {
      title: "Tailored Strategies for Real-World Impact",
      description: "We understand that every business is unique. That's why our consulting approach is customized to align with your specific goals, culture, and challenges. We dive deep into your business, crafting solutions that fit seamlessly into your existing operations.",
      icon: <Target className="h-8 w-8" />
    },
    {
      title: "Scalable Solutions",
      description: "Whether you are a startup, mid-sized business, or enterprise-level organization, our consulting services scale to meet your needs. We empower your teams to adopt new technologies, practices, and mindsets, driving innovation and transformation at every level.",
      icon: <BarChart3 className="h-8 w-8" />
    },
    {
      title: "Certified Experts & Proven Frameworks",
      description: "Our consultants are seasoned experts with deep industry knowledge in AI, Agile, and PQ. With years of hands-on experience, we apply proven methodologies and frameworks that guarantee tangible results.",
      icon: <Award className="h-8 w-8" />
    },
    {
      title: "Sustainable Transformation",
      description: "We don't just focus on short-term gains. Our consulting is designed to help you achieve long-term sustainability, ensuring that your organization is equipped for the future — resilient, agile, and adaptive to change.",
      icon: <Rocket className="h-8 w-8" />
    }
  ];

  return (
    <motion.section 
      ref={ref}
      className="py-20 bg-white"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-16" variants={fadeInUp}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Synergies4 Consulting?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience personalized consulting that transforms challenges into opportunities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div key={index} variants={scaleIn}>
              <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// Our Approach Section Component
function OurApproachSection() {
  const { ref, isInView } = useScrollAnimation();

  const steps = [
    {
      number: "1",
      title: "Discovery & Assessment",
      description: "We start with a thorough assessment of your business needs, challenges, and goals. Through interviews, workshops, and data analysis, we uncover the key areas for transformation and define the strategic direction.",
      icon: <Lightbulb className="h-8 w-8" />
    },
    {
      number: "2",
      title: "Strategy Development",
      description: "Based on our insights, we design a tailored strategy and roadmap that outlines the actions required to achieve your business objectives. Whether it's AI integration, Agile transformation, or PQ development, our strategies are designed to deliver measurable results.",
      icon: <Settings className="h-8 w-8" />
    },
    {
      number: "3",
      title: "Execution & Support",
      description: "We don't just give advice — we roll up our sleeves and help you implement the solutions. Our consultants work alongside your teams, providing guidance, training, and hands-on support to ensure the successful execution of your strategy.",
      icon: <Users className="h-8 w-8" />
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
            Our Approach: A Proven 3-Step Process
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A systematic approach to transformation that delivers measurable results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div key={index} variants={scaleIn}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 group relative">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                    {step.number}
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    {step.icon}
                  </div>
                  <CardTitle className="text-xl text-blue-600">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// Testimonials Section Component
function TestimonialsSection() {
  const { ref, isInView } = useScrollAnimation();

  const testimonials = [
    {
      quote: "Synergies4's consulting helped us integrate AI into our operations, improving efficiency and customer experience. Their deep understanding of both the technology and our business needs made all the difference.",
      author: "VP of Operations",
      company: "Global Tech Firm",
      avatar: "VO"
    },
    {
      quote: "Our organization's Agile transformation journey was challenging, but with Synergies4's expertise, we've built a more collaborative and high-performing team. We're seeing faster delivery times and greater innovation.",
      author: "CTO",
      company: "Fortune 500",
      avatar: "CT"
    }
  ];

  return (
    <motion.section 
      ref={ref}
      className="py-20 bg-white"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-16" variants={fadeInUp}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real transformations from organizations that experienced our consulting services.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={scaleIn}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-600 mb-6 italic leading-relaxed text-lg">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">{testimonial.company}</p>
                    </div>
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

// CTA Section Component
function CTASection() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <motion.section 
      ref={ref}
      className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4 text-center">
        <motion.div variants={fadeInUp}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Is Your Business Ready for Transformation?
          </h2>
          <p className="text-xl mb-4 opacity-90">
            It's about changing mindsets, behaviors, and results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href="/contact">
                Request Consultation
                <MessageSquare className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/courses">
                View Our Programs
                <BookOpen className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

// Footer Section Component
function FooterSection() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <motion.footer 
      ref={ref}
      className="bg-gray-900 text-white py-16"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <motion.div variants={fadeInUp}>
            <Image 
              src="/synergies4_logo.jpeg" 
              alt="Synergies4 Logo" 
              width={150} 
              height={72} 
              className="h-12 w-auto mb-4 brightness-0 invert"
            />
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

          <motion.div variants={fadeInUp}>
            <h3 className="text-lg font-semibold mb-4">Courses</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Agile & Scrum</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Product Management</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Leadership</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Business Analysis</a></li>
            </ul>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about-us" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/coaching" className="hover:text-white transition-colors">Coaching</Link></li>
              <li><Link href="/consulting" className="hover:text-white transition-colors">Consulting</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </motion.div>

          <motion.div variants={fadeInUp}>
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
          variants={fadeInUp}
        >
          <p>&copy; {new Date().getFullYear()} Synergies4 LLC. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Synergies4™, PocketCoachAI™, Adaptive Content Pods™ are trademarks of Synergies4 LLC.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
} 