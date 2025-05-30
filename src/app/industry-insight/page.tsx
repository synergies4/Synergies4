'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
  Lightbulb,
  Clock,
  Calendar,
  Filter,
  Search
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

export default function IndustryInsight() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

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
                    className={`text-gray-600 hover:text-blue-600 transition-colors font-medium ${
                      item === 'Industry Insight' ? 'text-blue-600 font-semibold' : ''
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
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
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
              <Lightbulb className="w-4 h-4 mr-2" />
              Industry Insights
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Industry{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Insights
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-lg text-gray-700 max-w-4xl mx-auto mb-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            Stay ahead with Synergies4's Industry Insights — your go-to resource for expert analysis, market trends, emerging technologies, and strategic advice across key sectors. Explore how innovation is reshaping industries and empowering businesses to thrive in a dynamic world.
          </motion.p>
        </motion.div>
      </section>

      {/* Blog Posts Section */}
      <BlogPostsSection />

      {/* Footer */}
      <FooterSection />
    </main>
  );
}

// Blog Posts Section Component
function BlogPostsSection() {
  const { ref, isInView } = useScrollAnimation();
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'Technology & Innovation', 'AI & Machine Learning', 'Agile Transformation', 'Leadership', 'Business Strategy'];

  const blogPosts = [
    {
      title: "Navigating the Future: Latest AI Trends and Emerging Technologies in 2025",
      excerpt: "Discover the cutting-edge AI innovations and technological breakthroughs that are set to transform industries and reshape the business landscape in 2025.",
      image: "https://placehold.co/600x400/1e3a8a/FFFFFF/png?text=AI+Trends+2025",
      category: "Technology & Innovation",
      date: "January 15, 2025",
      readTime: "8 min read",
      slug: "navigating-future-ai-trends-2025"
    },
    {
      title: "The Rise of AI-Powered Agile Teams: Transforming Project Management",
      excerpt: "Explore how artificial intelligence is revolutionizing agile methodologies and enabling teams to deliver better results faster than ever before.",
      image: "https://placehold.co/600x400/15803d/FFFFFF/png?text=AI+Agile+Teams",
      category: "AI & Machine Learning",
      date: "January 12, 2025",
      readTime: "6 min read",
      slug: "ai-powered-agile-teams"
    },
    {
      title: "Building Resilient Organizations: Leadership in the Digital Age",
      excerpt: "Learn the essential leadership skills and strategies needed to guide organizations through digital transformation and uncertainty.",
      image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Digital+Leadership",
      category: "Leadership",
      date: "January 10, 2025",
      readTime: "7 min read",
      slug: "building-resilient-organizations"
    },
    {
      title: "Scaling Agile: From Team Success to Enterprise Transformation",
      excerpt: "Discover proven strategies for scaling agile practices across large organizations and overcoming common implementation challenges.",
      image: "https://placehold.co/600x400/6366f1/FFFFFF/png?text=Scaling+Agile",
      category: "Agile Transformation",
      date: "January 8, 2025",
      readTime: "9 min read",
      slug: "scaling-agile-enterprise"
    },
    {
      title: "The Future of Work: How AI is Reshaping Professional Skills",
      excerpt: "Understand which skills will be most valuable in an AI-driven workplace and how professionals can prepare for the future.",
      image: "https://placehold.co/600x400/8b5cf6/FFFFFF/png?text=Future+of+Work",
      category: "Technology & Innovation",
      date: "January 5, 2025",
      readTime: "5 min read",
      slug: "future-of-work-ai-skills"
    },
    {
      title: "Strategic Innovation: Leveraging AI for Competitive Advantage",
      excerpt: "Learn how forward-thinking companies are using AI strategically to create sustainable competitive advantages in their markets.",
      image: "https://placehold.co/600x400/ec4899/FFFFFF/png?text=Strategic+AI",
      category: "Business Strategy",
      date: "January 3, 2025",
      readTime: "10 min read",
      slug: "strategic-innovation-ai-advantage"
    }
  ];

  const filteredPosts = activeFilter === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeFilter);

  return (
    <motion.section 
      ref={ref}
      className="py-20 bg-white"
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4">
        {/* Filter Buttons */}
        <motion.div 
          className="flex flex-wrap gap-3 mb-12 justify-center"
          variants={fadeInUp}
        >
          {categories.map((category, index) => (
            <motion.div key={category} variants={scaleIn}>
              <Button
                onClick={() => setActiveFilter(category)}
                variant={activeFilter === category ? "default" : "outline"}
                className="rounded-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                {category}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
        >
          {filteredPosts.map((post, index) => (
            <motion.div key={post.slug} variants={scaleIn}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <div className="relative">
                  <img 
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-white text-gray-900">
                    {post.category}
                  </Badge>
                </div>
                
                <CardHeader>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-xl text-blue-600 line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                  
                  <Button asChild className="w-full">
                    <Link href={`/industry-insight/${post.slug}`}>
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Load More Button */}
        <motion.div
          variants={fadeInUp}
          className="flex justify-center mt-12"
        >
          <Button size="lg" variant="outline" className="text-lg px-8 py-6">
            Load More Articles
            <TrendingUp className="ml-2 h-5 w-5" />
          </Button>
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