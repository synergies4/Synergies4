'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
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
  Rocket
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

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const { user, loading } = useAuth();

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
              <Link href="/">
                <Image 
                  src="/synergies4_logo.jpeg" 
                  alt="Synergies4 Logo" 
                  width={150} 
                  height={72} 
                  className="h-10 w-auto"
                />
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
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
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
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
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
        <motion.div 
          className="container mx-auto px-4 text-center"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Learning Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Build Skills That{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Set You Apart
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
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
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/courses">
                Boost Your Career – Explore Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Value Propositions */}
      <ValuePropositionsSection />

      {/* Featured Courses */}
      <FeaturedCoursesSection />

      {/* Certifications */}
      <CertificationsSection />

      {/* Testimonials */}
      <TestimonialsSection />

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

// Featured Courses Section
function FeaturedCoursesSection() {
  const { ref, isInView } = useScrollAnimation();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      title: "AI-Powered Executive",
      description: "AI strategy from an executive perspective",
      short_desc: "AI strategy from an executive perspective",
      image: "https://placehold.co/400x250/1e3a8a/FFFFFF/png?text=AI+Executive",
      category: "Executive",
      rating: 4.9,
      students: 1250
    },
    {
      id: 'fallback-2',
      title: "AI-Powered Scrum Master",
      description: "Master AI-enhanced Scrum methodologies and lead high-performing agile teams",
      short_desc: "Master AI-enhanced Scrum methodologies and lead high-performing agile teams",
      image: "https://placehold.co/400x250/15803d/FFFFFF/png?text=Scrum+Master",
      category: "Agile",
      rating: 4.8,
      students: 2100
    },
    {
      id: 'fallback-3',
      title: "AI Product Owner",
      description: "Drive product excellence using AI-enhanced strategies",
      short_desc: "Drive product excellence using AI-enhanced strategies",
      image: "https://placehold.co/400x250/0ea5e9/FFFFFF/png?text=Product+Owner",
      category: "Product",
      rating: 4.9,
      students: 1800
    },
    {
      id: 'fallback-4',
      title: "PQ Series: Advanced Intelligence",
      description: "Strengthen your mental fitness with our comprehensive PQ program",
      short_desc: "Strengthen your mental fitness with our comprehensive PQ program",
      image: "https://placehold.co/400x250/8b5cf6/FFFFFF/png?text=PQ+Series",
      category: "PQ Skills",
      rating: 4.7,
      students: 950
    }
  ];

  const displayCourses = courses.length > 0 ? courses : fallbackCourses;

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
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded mb-4"></div>
                <div className="bg-gray-200 h-8 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayCourses.map((course, index) => (
              <motion.div key={course.id || index} variants={scaleIn}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 group">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img 
                      src={course.image || `https://placehold.co/400x250/1e3a8a/FFFFFF/png?text=${encodeURIComponent(course.title)}`}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-4 left-4 bg-white text-gray-900">
                      {course.category || 'Course'}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description || course.short_desc || 'Learn valuable skills with this comprehensive course.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{course.rating || '4.8'}</span>
                      </div>
                      <span className="text-sm text-gray-500">{course.students || '0'} students</span>
                    </div>
                    <Button className="w-full" variant="outline" asChild>
                      <Link href={`/courses/${course.id}`}>
                        Learn More
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div className="text-center mt-12" variants={fadeInUp}>
          <Button size="lg" variant="outline" asChild>
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
    { title: "Agile", image: "https://placehold.co/300x200/1e3a8a/FFFFFF/png?text=Agile", courses: 12 },
    { title: "Business Analysis", image: "https://placehold.co/300x200/15803d/FFFFFF/png?text=Business+Analysis", courses: 8 },
    { title: "Product Management", image: "https://placehold.co/300x200/0ea5e9/FFFFFF/png?text=Product+Management", courses: 15 },
    { title: "Business Strategy", image: "https://placehold.co/300x200/8b5cf6/FFFFFF/png?text=Business+Strategy", courses: 10 },
    { title: "PQ Skills", image: "https://placehold.co/300x200/ec4899/FFFFFF/png?text=PQ+Skills", courses: 6 },
    { title: "Leadership", image: "https://placehold.co/300x200/f59e0b/FFFFFF/png?text=Leadership", courses: 9 }
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
            Professional Certifications
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advance your career with industry-recognized certifications across multiple domains.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div key={index} variants={scaleIn}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={category.image}
                    alt={category.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  <CardDescription>
                    {category.courses} courses available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Explore Courses
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
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
      className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4 text-center">
        <motion.div variants={fadeInUp}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of professionals who have accelerated their growth with our AI-powered learning platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href="/courses">
                Explore Courses
                <BookOpen className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/signup">
                Start Free Trial
                <Rocket className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
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
