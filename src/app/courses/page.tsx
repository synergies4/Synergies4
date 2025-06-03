'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageLayout from '@/components/shared/PageLayout';
import HeroSection from '@/components/shared/HeroSection';
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  Target,
  Clock,
  Download,
  Loader2,
  GraduationCap,
  Star,
  Search,
  Filter,
  CheckCircle,
  MessageSquare,
  Award
} from 'lucide-react';

// Course interface
interface Course {
  id: string;
  title: string;
  description: string;
  short_desc?: string;
  category: string;
  level: string;
  price?: number;
  duration?: string;
  image?: string;
  featured: boolean;
  created_at: string;
}

export default function Courses() {
  return (
    <PageLayout showStats={true}>
      {/* Hero Section */}
      <HeroSection
        badge={{
          icon: <GraduationCap className="w-4 h-4" />,
          text: "Course Directory"
        }}
        title="AI-Powered"
        highlightText="Learning Paths"
        description="Discover our comprehensive collection of AI-powered, role-based training programs designed to accelerate your professional growth and unlock your full potential."
        primaryCTA={{
          text: "Explore Courses",
          href: "#course-directory"
        }}
        secondaryCTA={{
          text: "Download Brochure",
          href: "#brochure",
          icon: <Download className="w-4 h-4" />
        }}
        backgroundVariant="gradient"
      />

      {/* Course Directory Section */}
      <CourseDirectorySection />

      {/* Get Your Brochure Section */}
      <BrochureSection />
    </PageLayout>
  );
}

// Course Directory Section Component
function CourseDirectorySection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Inquire';
    return `$${price.toLocaleString()}`;
  };

  const getDefaultImage = (category: string) => {
    const categoryColors = {
      'Executive': '1e3a8a',
      'Agile': '15803d',
      'Product': '0ea5e9',
      'PQ Skills': '8b5cf6',
      'Leadership': 'ec4899',
      'Business': '6366f1',
      'Technology': 'f59e0b',
      'default': '6b7280'
    };
    
    const color = categoryColors[category as keyof typeof categoryColors] || categoryColors.default;
    const encodedTitle = encodeURIComponent(category);
    return `https://placehold.co/400x250/${color}/FFFFFF/png?text=${encodedTitle}`;
  };

  const createCourseSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'from-emerald-500 to-green-600';
      case 'intermediate': return 'from-blue-500 to-indigo-600';
      case 'advanced': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  // Filter courses based on search and category
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(courses.map(course => course.category)))];

  return (
    <section id="course-directory" className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
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
            <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
            <span className="text-blue-700 font-medium">Professional Training Programs</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-gray-700 via-blue-800 to-teal-800 bg-clip-text text-transparent">
              Expertly Designed
            </span>
            <br />
            <span className="bg-gradient-to-r from-teal-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Learning Experiences
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-light">
            Choose from our expertly designed courses that combine 
            <span className="text-blue-600 font-medium"> AI innovation </span>
            with proven methodologies and real-world application.
          </p>
        </div>

        {/* Enhanced Search and Filter */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="group relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-700"></div>
            
            {/* Main Container */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 p-8 shadow-xl">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search courses by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/90"
                  />
                </div>
                
                {/* Category Filter */}
                <div className="md:w-64">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-12 px-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 font-medium"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'All' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results count */}
              {!loading && (
                <div className="text-center">
                  <p className="text-gray-600 font-medium">
                    {filteredCourses.length} 
                    <span className="text-blue-600 font-semibold"> course{filteredCourses.length !== 1 ? 's' : ''} </span>
                    found
                    {searchTerm && <span className="text-gray-500"> for "{searchTerm}"</span>}
                    {selectedCategory !== 'All' && <span className="text-gray-500"> in {selectedCategory}</span>}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <span className="text-gray-600 font-medium">Loading courses...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-200/50 max-w-md mx-auto">
              <div className="text-red-600 mb-4 font-medium">{error}</div>
              <Button 
                onClick={fetchCourses} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/50 max-w-md mx-auto">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {searchTerm || selectedCategory !== 'All' ? 'No matching courses found' : 'No courses available'}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {searchTerm || selectedCategory !== 'All' 
                  ? 'Try adjusting your search or filter criteria to find what you\'re looking for.' 
                  : 'Check back soon for new courses and learning opportunities!'}
              </p>
              {(searchTerm || selectedCategory !== 'All') && (
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}

        {!loading && !error && filteredCourses.length > 0 && (
          <div className="space-y-8 max-w-6xl mx-auto">
            {filteredCourses.map((course, index) => (
              <div key={course.id} className={`group relative animate-fade-in-up animation-delay-${index * 100}`}>
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
                
                {/* Main Card */}
                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8 h-full">
                    {/* Course Image */}
                    <div className="relative overflow-hidden rounded-xl flex-shrink-0">
                      <img 
                        src={course.image || getDefaultImage(course.category)}
                        alt={course.title}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getDefaultImage(course.category);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/40 transition-all duration-500"></div>
                      
                      {/* Level Badge */}
                      <div className="absolute top-4 left-4">
                        <div className={`px-3 py-1 bg-gradient-to-r ${getLevelColor(course.level)} rounded-full text-white text-sm font-semibold shadow-lg backdrop-blur-sm`}>
                          {course.level}
                        </div>
                      </div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/90 text-gray-900 border font-medium backdrop-blur-sm">
                          {course.category}
                        </Badge>
                      </div>
                      
                      {course.featured && (
                        <div className="absolute bottom-4 left-4">
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 font-medium shadow-lg">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Featured
                          </Badge>
                        </div>
                      )}

                      {/* Floating Icon */}
                      <div className="absolute bottom-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    </div>
                    
                    {/* Course Content */}
                    <div className="lg:col-span-2 flex flex-col justify-between">
                      <div className="flex-1">
                        <CardHeader className="p-0 mb-6">
                          <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-700 to-blue-800 bg-clip-text text-transparent mb-3 group-hover:from-blue-600 group-hover:to-teal-600 transition-all duration-300 min-h-[3rem] flex items-center leading-tight">
                            {course.title}
                          </CardTitle>
                          <div className="flex flex-wrap gap-3 mb-4">
                            {course.duration && (
                              <Badge variant="outline" className="text-sm border-blue-300 text-blue-700 bg-blue-50">
                                <Clock className="w-4 h-4 mr-1" />
                                {course.duration}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-sm border-teal-300 text-teal-700 bg-teal-50">
                              <Target className="w-4 h-4 mr-1" />
                              {course.level}
                            </Badge>
                          </div>
                          <CardDescription className="text-lg leading-relaxed text-gray-600 min-h-[4.5rem] group-hover:text-gray-800 transition-colors duration-300">
                            {course.short_desc || course.description}
                          </CardDescription>
                        </CardHeader>
                      </div>
                      
                      {/* Course Actions - Always at bottom */}
                      <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-auto">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {formatPrice(course.price)}
                        </div>
                        <Button 
                          asChild 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8 py-3 text-lg rounded-xl border-0 group"
                        >
                          <Link href={`/courses/${createCourseSlug(course.title)}`}>
                            <span className="flex items-center justify-center">
                              Learn More
                              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Brochure Section Component
function BrochureSection() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ firstName: '', lastName: '', email: '' });
    
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="brochure" className="py-24 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-gradient-to-br from-teal-500/15 to-emerald-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
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
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
            <Download className="w-5 h-5 text-blue-300 mr-3" />
            <span className="text-white/90 font-medium">Course Catalog</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
              Get Your Course
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              Brochure
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-blue-200/90 max-w-4xl mx-auto leading-relaxed font-light">
            Download our comprehensive course catalog and discover the 
            <span className="text-cyan-300 font-medium"> perfect learning path </span>
            for your career goals and aspirations.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="group relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            
            {/* Main Card */}
            <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="p-8 md:p-12">
                {isSubmitted ? (
                  <div className="text-center py-12 animate-fade-in-up">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce">
                      <CheckCircle className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Brochure Sent Successfully!</h3>
                    <p className="text-blue-200/90 text-lg leading-relaxed">
                      Check your email for the download link. Our comprehensive course catalog is on its way to you.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="firstName" className="text-white font-semibold text-lg">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Enter your first name"
                          className="h-12 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white/50 text-lg rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="lastName" className="text-white font-semibold text-lg">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Enter your last name"
                          className="h-12 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white/50 text-lg rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-white font-semibold text-lg">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="h-12 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white/50 text-lg rounded-xl"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-8">
                      <Button 
                        type="submit"
                        size="lg" 
                        disabled={isSubmitting}
                        className="text-xl px-12 py-4 bg-gradient-to-r from-white to-gray-100 text-blue-600 hover:from-gray-100 hover:to-white shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105 font-semibold rounded-xl border-0 group"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                            Sending Brochure...
                          </>
                        ) : (
                          <>
                            <Download className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                            Download Course Brochure
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 pt-8 border-t border-white/20">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        {[
                          { icon: <BookOpen className="w-6 h-6" />, title: "50+ Courses", description: "Comprehensive catalog" },
                          { icon: <Users className="w-6 h-6" />, title: "Expert Instructors", description: "Industry professionals" },
                          { icon: <Award className="w-6 h-6" />, title: "Certifications", description: "Globally recognized" }
                        ].map((item, index) => (
                          <div key={index} className="group">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
                              {item.icon}
                            </div>
                            <h4 className="text-white font-semibold text-lg mb-2">{item.title}</h4>
                            <p className="text-blue-200/80 text-sm">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 