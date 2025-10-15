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
  Award,
  PlayCircle,
  Calendar,
  MapPin,
  User
} from 'lucide-react';
import Image from 'next/image';

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
  course_type?: string;
  max_participants?: number;
  location?: string;
  instructor_name?: string;
  materials_included?: string;
  prerequisites?: string;
  current_participants?: number;
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
        // secondary CTA temporarily removed
        backgroundVariant="gradient"
        customColors={{
          background: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
          accent: "bg-gradient-to-br from-blue-400/20 to-indigo-400/25",
          particles: "bg-gradient-to-r from-blue-400 to-indigo-400"
        }}
      />

      {/* Course Directory Section */}
      <CourseDirectorySection />

      {/* Course Summary Section temporarily removed */}
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
  const [selectedType, setSelectedType] = useState('All');

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

  const getFormattedDescription = (course: Course) => {
    const description = course.short_desc || course.description;
    if (!description || description.trim() === '') {
      // Fallback description based on category
      const fallbackDescriptions = {
        'Executive': 'Develop strategic leadership skills and executive presence for senior-level responsibilities.',
        'Agile': 'Master Agile methodologies and frameworks to drive team productivity and project success.',
        'Product': 'Learn product management fundamentals and strategies for successful product development.',
        'PQ Skills': 'Build positive intelligence and emotional resilience for peak performance and leadership.',
        'Leadership': 'Enhance your leadership capabilities and learn to inspire and motivate teams effectively.',
        'Business': 'Develop essential business skills and strategic thinking for professional growth.',
        'Technology': 'Gain cutting-edge technology skills and digital literacy for the modern workplace.',
        'default': 'Comprehensive professional development course designed to advance your career and skills.'
      };
      return fallbackDescriptions[course.category as keyof typeof fallbackDescriptions] || fallbackDescriptions.default;
    }
    
    // Truncate to consistent length (150 characters)
    if (description.length > 150) {
      return description.substring(0, 147) + '...';
    }
    return description;
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
      case 'beginner': return 'from-green-500 to-emerald-600';
      case 'intermediate': return 'from-yellow-500 to-orange-600';
      case 'advanced': return 'from-teal-500 to-blue-600';
      default: return 'from-teal-500 to-blue-600';
    }
  };

  // Filter courses and add random ratings/students
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesType = selectedType === 'All' || course.course_type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  }).map((course, index) => ({
    ...course,
    // Use course ID hash to generate consistent random values
    _rating: 4.5 + ((parseInt(course.id.substring(0, 8), 36) % 50) / 100),
    _students: 500 + ((parseInt(course.id.substring(8, 16), 36) % 3000))
  }));

  // Get unique categories and types
  const categories = ['All', ...Array.from(new Set(courses.map(course => course.category)))];
  const courseTypes = ['All', 'digital', 'in_person', 'hybrid'];

  return (
    <section id="course-directory" className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-teal-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-teal-300/15 to-cyan-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-teal-400/10 to-blue-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
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
          
          {/* Strategic Quotes Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-16 mb-8">
            {/* Rob Thomas Quote */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-r-xl p-6 shadow-lg">
              <blockquote className="text-lg font-semibold text-gray-900 italic mb-4 leading-relaxed">
                "AI is not going to replace managers, but managers who use AI will replace the managers who do not."
              </blockquote>
              <cite className="flex items-center text-gray-800 font-medium">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-3 text-white text-sm font-bold">RT</div>
                <span className="text-sm text-gray-800">Rob Thomas, IBM Senior Vice President</span>
              </cite>
            </div>

            {/* Dario Amodei Quote */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-600 rounded-r-xl p-6 shadow-lg">
              <blockquote className="text-lg font-semibold text-gray-900 italic mb-4 leading-relaxed">
                "AI could eliminate up to 50% of entry-level white-collar jobs within the next five years."
              </blockquote>
              <cite className="flex items-center text-gray-800 font-medium">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mr-3 text-white text-sm font-bold">DA</div>
                <span className="text-sm text-gray-800">Dario Amodei, CEO of Anthropic</span>
              </cite>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="group relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-150"></div>
            
            {/* Main Container */}
            <div className="relative glass-effect-light rounded-2xl border border-white/50 p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search courses by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/90"
                  />
                </div>
                
                {/* Course Type Filter */}
                <div>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full h-12 px-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 font-medium text-gray-900"
                  >
                    {courseTypes.map(type => (
                      <option key={type} value={type} className="text-gray-900">
                        {type === 'All' ? 'All Course Types' : 
                         type === 'digital' ? '🌐 Digital Courses' :
                         type === 'in_person' ? '🏢 In-Person Events' :
                         type === 'hybrid' ? '🔄 Hybrid Courses' : type}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Category Filter */}
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-12 px-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 font-medium text-gray-900"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="text-gray-900">
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
                    {selectedType !== 'All' && <span className="text-gray-500"> • {selectedType === 'digital' ? 'Digital' : selectedType === 'in_person' ? 'In-Person' : selectedType === 'hybrid' ? 'Hybrid' : selectedType} courses</span>}
                    {selectedCategory !== 'All' && <span className="text-gray-500"> • {selectedCategory}</span>}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredCourses.map((course, index) => (
              <Link 
                key={course.id} 
                href={`/courses/${createCourseSlug(course.title)}`}
                className={`group relative animate-fade-in-up animation-delay-${index * 100} block`}
              >
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-25 transition-opacity"></div>
                
                {/* Main Card */}
                <div className="relative bg-white/90 rounded-2xl border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105 overflow-hidden flex flex-col h-full cursor-pointer">
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden flex-shrink-0">
                    <Image
                      src={course.image || getDefaultImage(course.category)}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    
                    {/* Level Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className={`bg-gradient-to-r ${getLevelColor(course.level)} text-white border-0 font-semibold`}>
                        {course.level}
                      </Badge>
                    </div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-800 font-medium">
                        {course.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-col flex-1 p-6">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem] flex items-start">
                      {course.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1 group-hover:text-gray-700 transition-colors">
                      {getFormattedDescription(course)}
                    </p>

                    {/* Course Meta */}
                    <div className="flex items-center justify-between mb-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < Math.floor(course._rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-gray-600 font-medium ml-1">
                          {course._rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{course.course_type === 'in_person' && course.max_participants ? 
                          `${course.current_participants || 0}/${course.max_participants}` : 
                          `${course._students.toLocaleString()}+`}</span>
                      </div>
                    </div>

                    {/* In-Person Event Details */}
                    {course.course_type === 'in_person' && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Calendar className="h-4 w-4 text-amber-600 mr-2" />
                          <span className="text-amber-800 font-semibold text-sm">In-Person Event</span>
                        </div>
                        {course.location && (
                          <div className="flex items-center mb-1 text-sm text-amber-700">
                            <MapPin className="h-3 w-3 mr-2" />
                            <span>{course.location}</span>
                          </div>
                        )}
                        {course.instructor_name && (
                          <div className="flex items-center mb-1 text-sm text-amber-700">
                            <User className="h-3 w-3 mr-2" />
                            <span>Led by {course.instructor_name}</span>
                          </div>
                        )}
                        {course.max_participants && (
                          <div className="flex items-center text-sm text-amber-700">
                            <Users className="h-3 w-3 mr-2" />
                            <span>{course.max_participants - (course.current_participants || 0)} spots remaining</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Duration */}
                    {course.duration && (
                      <div className="flex items-center text-gray-500 text-sm mb-4">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{course.duration}</span>
                      </div>
                    )}

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatPrice(course.price)}
                      </div>
                      <div className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all group-hover:scale-105 rounded-xl border-0 px-4 py-2">
                        <span className="flex items-center text-white">
                          Start Learning
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform text-white" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Course Summary Section Component
function CourseSummarySection() {
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
    <section id="summary" className="py-24 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 relative overflow-hidden">
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
          <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200/50 mb-8">
            <MessageSquare className="w-5 h-5 text-blue-600 mr-3" />
            <span className="text-blue-700 font-medium">Course Information</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
              Get Your Personalized
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-teal-300 bg-clip-text text-transparent">
              Course Summary
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-100 max-w-4xl mx-auto leading-relaxed font-light mb-12">
            Join a community of professionals shaping the future of 
            <span className="text-cyan-300 font-medium"> agile leadership </span>
            and organizational excellence
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="group relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            
            {/* Main Card */}
            <div className="relative glass-effect-dark rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="p-8 md:p-12">
                {isSubmitted ? (
                  <div className="text-center py-12 animate-fade-in-up">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce">
                      <CheckCircle className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Course Summary Sent!</h3>
                    <p className="text-blue-200/90 text-lg leading-relaxed">
                      Check your email for your personalized course recommendations and next steps to get started.
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
                            Sending Summary...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                            Get Course Summary
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