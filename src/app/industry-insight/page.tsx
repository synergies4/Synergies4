'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, Search, ArrowRight, Menu, X, FileText, Lightbulb, MessageSquare, Brain } from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  category: string;
  tags: string[];
  published_at: string;
  reading_time: number;
  author_id: string;
}

interface BlogCategory {
  name: string;
  slug: string;
  color: string;
}

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

// Enhanced button animation variants
const buttonHover = {
  scale: 1.02,
  transition: { type: "spring", stiffness: 400, damping: 25 }
};

const buttonTap = {
  scale: 0.98,
  transition: { type: "spring", stiffness: 400, damping: 25 }
};

export default function IndustryInsightPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const postsPerPage = 9;
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [selectedCategory, currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * postsPerPage;
      const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
      
      const response = await fetch(`/api/blog?limit=${postsPerPage}&offset=${offset}${categoryParam}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        setTotalPosts(data.total);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || '#3B82F6';
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
              
              {/* Synergize Button */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button 
                    asChild 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                  >
                    <Link href="/synergize">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                      <span className="relative z-10 flex items-center">
                        <Brain className="w-4 h-4 mr-2" />
                        Synergize
                      </span>
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
              
              {/* Distinctive Contact Button */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button 
                    asChild 
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
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
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact
                      </span>
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
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
                      className={`block text-gray-600 hover:text-blue-600 transition-colors font-medium py-2 text-lg ${
                        item === 'Industry Insight' ? 'text-blue-600 font-semibold' : ''
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  ))}
                  
                  {/* Mobile Buttons */}
                  <div className="pt-2 space-y-3">
                    {/* Synergize Button for Mobile */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Button 
                        asChild 
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group text-lg py-3"
                      >
                        <Link href="/synergize" onClick={() => setMobileMenuOpen(false)}>
                          <span className="relative z-10 flex items-center justify-center">
                            <Brain className="w-4 h-4 mr-2" />
                            Synergize
                          </span>
                        </Link>
                      </Button>
                    </motion.div>
                    
                    {/* Contact Button for Mobile */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Button 
                        asChild 
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group text-lg py-3"
                      >
                        <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
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

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <Badge className="mb-4 md:mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200">
              <FileText className="w-4 h-4 mr-2" />
              Industry Insights
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
              Stay Ahead with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Industry Insights
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-600 mb-4 md:mb-6 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            Your go-to resource for expert analysis, market trends, emerging technologies, and strategic advice across key sectors.
          </motion.p>
          
          <motion.p 
            className="text-base md:text-lg text-gray-500 mb-6 md:mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            Explore how innovation is reshaping industries and empowering businesses to thrive in a dynamic world.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
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
                className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group" 
                asChild
              >
                <Link href="#insights">
                  {/* Subtle shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                  
                  <span className="relative z-10 flex items-center">
                    Explore Insights
                    <Lightbulb className="h-4 w-4 md:h-5 md:w-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search */}
      <section id="insights" className="py-6 md:py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.slug} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-500 text-center sm:text-left">
              {totalPosts} articles found
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-3 rounded mb-4"></div>
                  <div className="bg-gray-200 h-8 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No articles found</h3>
              <p className="text-gray-600 mb-8">Try adjusting your search or filter criteria.</p>
              <Button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 group">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={post.image || `https://placehold.co/400x250/3B82F6/FFFFFF/png?text=${encodeURIComponent(post.title)}`}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge 
                        className="absolute top-4 left-4 text-white border-0"
                        style={{ backgroundColor: getCategoryColor(post.category) }}
                      >
                        {post.category}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                        <Link href={`/industry-insight/${post.slug}`}>
                          {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(post.published_at)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.reading_time} min read</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Author</span>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/industry-insight/${post.slug}`}>
                            Read More
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(i + 1)}
                  className="w-10"
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </section>

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