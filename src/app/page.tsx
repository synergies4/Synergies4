'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
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
  Menu,
  X,
  Clock,
  ChevronUp
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

// Scroll-triggered animation hook
function useScrollAnimation() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return { ref, isInView };
}

// Scroll to top component
function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronUp className="h-6 w-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Add smooth scroll behavior to the document
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <main className="min-h-screen">
      {/* Scroll to Top Button */}
      <ScrollToTop />

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
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
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
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
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
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 md:py-20 overflow-hidden">
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
            <Badge className="mb-4 md:mb-6 bg-blue-100/90 backdrop-blur-sm text-blue-700 hover:bg-blue-200/90 border border-blue-200/50">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Learning Platform
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
              Build Skills That{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Set You Apart
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            Learn practical frameworks in Agile, leadership, and mental fitness that teams and leaders actually use.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <Button size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300" asChild>
              <Link href="/courses">
                Boost Your Career – Explore Courses
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Value Propositions */}
      <ValuePropositionsSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Featured Courses */}
      <FeaturedCoursesSection />

      {/* Certifications */}
      <CertificationsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Partners */}
      <PartnersSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <FooterSection />
    </main>
  );
}

// Value Propositions Section
function ValuePropositionsSection() {
  const { ref, isInView } = useScrollAnimation();

  const valueProps = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Learning",
      description: "Personalized learning paths powered by artificial intelligence to accelerate your growth."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Practical Skills",
      description: "Learn frameworks and methodologies that you can immediately apply in your work."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Expert Instructors",
      description: "Learn from industry leaders with real-world experience in their fields."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Recognized Certifications",
      description: "Earn certificates that are valued by employers and industry professionals."
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
            Why Choose Synergies4?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're not just another training company. We're your AI-powered partners in creating personalized learning journeys.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {valueProps.map((prop, index) => (
            <motion.div key={index} variants={scaleIn}>
              <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    {prop.icon}
                  </div>
                  <CardTitle className="text-xl">{prop.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {prop.description}
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

// Stats Section
function StatsSection() {
  const { ref, isInView } = useScrollAnimation();
  
  const stats = [
    { number: "10,000+", label: "Students Trained", icon: <Users className="h-6 w-6" /> },
    { number: "95%", label: "Success Rate", icon: <TrendingUp className="h-6 w-6" /> },
    { number: "50+", label: "Expert Instructors", icon: <Award className="h-6 w-6" /> },
    { number: "24/7", label: "Learning Support", icon: <CheckCircle className="h-6 w-6" /> }
  ];

  return (
    <motion.section 
      ref={ref}
      className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex justify-center mb-3 text-blue-200">
                {stat.icon}
              </div>
              <motion.div 
                className="text-3xl md:text-4xl font-bold mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
              >
                {stat.number}
              </motion.div>
              <div className="text-blue-100 text-sm md:text-base">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// Featured Courses Section
function FeaturedCoursesSection() {
  const { ref, isInView } = useScrollAnimation();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to create course slug from title (matching the one in course page)
  const createCourseSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/courses');
        if (response.ok) {
          const data = await response.json();
          // Get first 4 courses for featured section
          setCourses(data.courses.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        // Fallback to empty array if fetch fails
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  // Fallback courses if no real courses are available
  const fallbackCourses = [
    {
      id: 'fallback-1',
      title: "AI-Powered Executive Leadership",
      description: "Master AI strategy from an executive perspective and lead digital transformation",
      short_desc: "Master AI strategy from an executive perspective and lead digital transformation",
      image: "https://placehold.co/400x250/1e3a8a/FFFFFF/png?text=AI+Executive",
      category: "Executive",
      level: "Advanced",
      duration: "8 weeks",
      rating: 4.9,
      students: 1250,
      price: 299
    },
    {
      id: 'fallback-2',
      title: "AI-Powered Scrum Master",
      description: "Master AI-enhanced Scrum methodologies and lead high-performing agile teams",
      short_desc: "Master AI-enhanced Scrum methodologies and lead high-performing agile teams",
      image: "https://placehold.co/400x250/15803d/FFFFFF/png?text=Scrum+Master",
      category: "Agile",
      level: "Intermediate",
      duration: "6 weeks",
      rating: 4.8,
      students: 2100,
      price: 199
    },
    {
      id: 'fallback-3',
      title: "AI Product Owner Mastery",
      description: "Drive product excellence using AI-enhanced strategies and data-driven decisions",
      short_desc: "Drive product excellence using AI-enhanced strategies and data-driven decisions",
      image: "https://placehold.co/400x250/0ea5e9/FFFFFF/png?text=Product+Owner",
      category: "Product",
      level: "Intermediate",
      duration: "7 weeks",
      rating: 4.9,
      students: 1800,
      price: 249
    },
    {
      id: 'fallback-4',
      title: "PQ Series: Advanced Mental Fitness",
      description: "Strengthen your mental fitness with our comprehensive PQ program for peak performance",
      short_desc: "Strengthen your mental fitness with our comprehensive PQ program for peak performance",
      image: "https://placehold.co/400x250/8b5cf6/FFFFFF/png?text=PQ+Series",
      category: "PQ Skills",
      level: "Beginner",
      duration: "4 weeks",
      rating: 4.7,
      students: 950,
      price: 149
    }
  ];

  const displayCourses = courses.length > 0 ? courses : fallbackCourses;

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Free';
    return `$${price}`;
  };

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
            Featured Courses
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our most popular AI-powered courses designed to accelerate your career growth.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                key={i} 
                className="animate-pulse"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <div className="bg-gray-200 h-48 rounded-t-lg mb-4"></div>
                  <CardHeader>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-3 rounded mb-4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-200 h-8 rounded"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayCourses.map((course, index) => (
              <motion.div key={course.id || index} variants={scaleIn}>
                <Card className="h-full hover:shadow-2xl transition-all duration-500 group cursor-pointer border-0 shadow-lg overflow-hidden">
                  <div className="relative overflow-hidden">
                    <img 
                      src={course.image || `https://placehold.co/400x250/1e3a8a/FFFFFF/png?text=${encodeURIComponent(course.title)}`}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm">
                        {course.category || 'Course'}
                      </Badge>
                      {course.level && (
                        <Badge className={`${getLevelColor(course.level)} shadow-sm`}>
                          {course.level}
                        </Badge>
                      )}
                    </div>

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-blue-600 text-white shadow-sm">
                        {formatPrice(course.price)}
                      </Badge>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        size="sm" 
                        className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
                        asChild
                      >
                        <Link href={`/courses/${createCourseSlug(course.title)}`}>
                          View Course
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {course.description || course.short_desc || 'Learn valuable skills with this comprehensive course.'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Course Meta */}
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                      {course.duration && (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {course.duration}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {course.students || '0'} students
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{course.rating || '4.8'}</span>
                        <span className="text-xs text-gray-500">({course.students || '0'})</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button 
                      className="w-full group-hover:bg-blue-600 group-hover:text-white transition-all duration-300" 
                      variant="outline" 
                      asChild
                    >
                      <Link href={`/courses/${createCourseSlug(course.title)}`}>
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div className="text-center mt-12" variants={fadeInUp}>
          <Button size="lg" variant="outline" className="hover:bg-blue-600 hover:text-white transition-all duration-300" asChild>
            <Link href="/courses">
              View All Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}

// Certifications Section
function CertificationsSection() {
  const { ref, isInView } = useScrollAnimation();

  const categories = [
    { 
      title: "Agile & Scrum", 
      image: "https://placehold.co/300x200/1e3a8a/FFFFFF/png?text=Agile", 
      courses: 12,
      description: "Master agile methodologies and scrum frameworks",
      level: "All Levels",
      duration: "4-8 weeks",
      popular: true
    },
    { 
      title: "Business Analysis", 
      image: "https://placehold.co/300x200/15803d/FFFFFF/png?text=Business+Analysis", 
      courses: 8,
      description: "Learn to analyze business requirements and processes",
      level: "Intermediate",
      duration: "6-10 weeks",
      popular: false
    },
    { 
      title: "Product Management", 
      image: "https://placehold.co/300x200/0ea5e9/FFFFFF/png?text=Product+Management", 
      courses: 15,
      description: "Drive product strategy and development",
      level: "All Levels",
      duration: "8-12 weeks",
      popular: true
    },
    { 
      title: "Business Strategy", 
      image: "https://placehold.co/300x200/8b5cf6/FFFFFF/png?text=Business+Strategy", 
      courses: 10,
      description: "Develop strategic thinking and planning skills",
      level: "Advanced",
      duration: "6-8 weeks",
      popular: false
    },
    { 
      title: "PQ Skills", 
      image: "https://placehold.co/300x200/ec4899/FFFFFF/png?text=PQ+Skills", 
      courses: 6,
      description: "Build mental fitness and emotional intelligence",
      level: "Beginner",
      duration: "4-6 weeks",
      popular: false
    },
    { 
      title: "Leadership", 
      image: "https://placehold.co/300x200/f59e0b/FFFFFF/png?text=Leadership", 
      courses: 9,
      description: "Develop leadership and team management skills",
      level: "Intermediate",
      duration: "8-10 weeks",
      popular: true
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      case 'All Levels': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

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
            Professional Certifications
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advance your career with industry-recognized certifications across multiple domains.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div key={index} variants={scaleIn}>
              <Card className="h-full hover:shadow-2xl transition-all duration-500 group cursor-pointer border-0 shadow-lg overflow-hidden">
                <div className="relative overflow-hidden">
                  <img 
                    src={category.image}
                    alt={category.title}
                    className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Popular Badge */}
                  {category.popular && (
                    <Badge className="absolute top-4 left-4 bg-yellow-500 text-white shadow-lg">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}

                  {/* Level Badge */}
                  <Badge className={`absolute top-4 right-4 ${getLevelColor(category.level)} shadow-lg`}>
                    {category.level}
                  </Badge>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button 
                      size="sm" 
                      className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
                    >
                      Explore Courses
                    </Button>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors duration-300">
                      {category.title}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {category.courses} courses
                    </Badge>
                  </div>
                  <CardDescription className="text-sm leading-relaxed">
                    {category.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Course Meta */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {category.duration}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {category.courses} courses
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Course Completion</span>
                      <span>{Math.floor(Math.random() * 40) + 60}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${Math.floor(Math.random() * 40) + 60}%` } : { width: 0 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                      />
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button 
                    className="w-full group-hover:bg-blue-600 group-hover:text-white transition-all duration-300" 
                    variant="outline"
                  >
                    Explore Courses
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div className="text-center mt-12" variants={fadeInUp}>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? We offer custom training programs.
          </p>
          <Button size="lg" variant="outline" className="hover:bg-blue-600 hover:text-white transition-all duration-300">
            Request Custom Training
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const { ref, isInView } = useScrollAnimation();

  const testimonials = [
    {
      quote: "Synergies4's Agile Mastery course completely transformed how our team manages projects. The hands-on approach and real-world simulations made all the difference.",
      author: "Sarah Johnson",
      role: "Project Manager",
      company: "TechCorp",
      avatar: "SJ"
    },
    {
      quote: "The AI-powered learning paths adapted to my pace perfectly. I gained practical skills that I could immediately apply in my role as a product owner.",
      author: "Michael Chen",
      role: "Product Owner",
      company: "InnovateLabs",
      avatar: "MC"
    },
    {
      quote: "The coaching sessions were invaluable. Not just learning theory, but getting personalized guidance on real challenges I was facing at work.",
      author: "Emily Rodriguez",
      role: "Team Lead",
      company: "StartupXYZ",
      avatar: "ER"
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
            What Our Students Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of professionals who have transformed their careers with Synergies4.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={scaleIn}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-600 mb-6 italic">
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
                      <p className="text-sm text-gray-500">{testimonial.role} at {testimonial.company}</p>
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

// Newsletter Section
function NewsletterSection() {
  const { ref, isInView } = useScrollAnimation();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubscribed(true);
    setIsLoading(false);
    setEmail('');
  };

  return (
    <motion.section 
      ref={ref}
      className="py-20 bg-gradient-to-br from-gray-50 to-blue-50"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4">
        <motion.div className="max-w-2xl mx-auto text-center" variants={fadeInUp}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Stay Ahead of the Curve
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Get the latest insights on AI, leadership, and career development delivered to your inbox.
          </p>
          
          {isSubscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-lg p-6"
            >
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">Thank you for subscribing!</h3>
              <p className="text-green-600">You'll receive our latest updates and exclusive content.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </form>
          )}
          
          <p className="text-sm text-gray-500 mt-4">
            No spam, unsubscribe at any time. We respect your privacy.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}

// Partners Section
function PartnersSection() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <motion.section 
      ref={ref}
      className="py-16 bg-white"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-12" variants={fadeInUp}>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Trusted by Leading Organizations
          </h3>
          <p className="text-gray-600">
            Join companies worldwide that trust Synergies4 for their learning and development needs.
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-wrap justify-center items-center gap-8 opacity-60"
          variants={fadeInUp}
        >
          {['Microsoft', 'Google', 'Amazon', 'Apple', 'Meta', 'Netflix'].map((company, index) => (
            <div key={index} className="text-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors">
              {company}
            </div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

// CTA Section
function CTASection() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <motion.section 
      ref={ref}
      className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/15 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div variants={fadeInUp}>
          {/* Social Proof Badge */}
          <motion.div 
            className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="flex -space-x-2 mr-3">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full border-2 border-white"
                />
              ))}
            </div>
            <span className="text-sm font-medium">Join 10,000+ professionals already learning</span>
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Transform
            </span>{' '}
            Your Career?
          </h2>
          
          <p className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto opacity-90 leading-relaxed">
            Join thousands of professionals who have accelerated their growth with our AI-powered learning platform.
          </p>
          
          {/* Urgency Indicator */}
          <motion.div 
            className="inline-flex items-center bg-red-500/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse" />
            <span className="text-sm font-medium">Limited time: $295 early bird discount</span>
          </motion.div>

          {/* Benefits List */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto"
            variants={staggerContainer}
          >
            {[
              { icon: <CheckCircle className="h-5 w-5" />, text: "Lifetime access to all courses" },
              { icon: <Users className="h-5 w-5" />, text: "Expert mentorship included" },
              { icon: <Award className="h-5 w-5" />, text: "Industry-recognized certificates" }
            ].map((benefit, index) => (
              <motion.div 
                key={index}
                className="flex items-center justify-center space-x-2 text-white/90"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-green-300">{benefit.icon}</div>
                <span className="text-sm md:text-base">{benefit.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold" 
                asChild
              >
                <Link href="/courses">
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Learning Today
                </Link>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300" 
                asChild
              >
                <Link href="/signup">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Try Free Course
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Trust Indicators */}
          <motion.div 
            className="mt-10 pt-8 border-t border-white/20"
            variants={fadeInUp}
          >
            <p className="text-white/70 text-sm mb-4">Trusted by professionals at</p>
            <div className="flex flex-wrap justify-center items-center gap-6 opacity-60">
              {['Microsoft', 'Google', 'Amazon', 'Apple', 'Meta'].map((company, index) => (
                <motion.div 
                  key={index} 
                  className="text-lg font-semibold text-white/80 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  {company}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Money Back Guarantee */}
          <motion.div 
            className="mt-8 inline-flex items-center bg-green-500/20 backdrop-blur-sm rounded-full px-4 py-2"
            variants={fadeInUp}
          >
            <CheckCircle className="h-4 w-4 text-green-300 mr-2" />
            <span className="text-sm">30-day money-back guarantee</span>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

// Footer Section
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
