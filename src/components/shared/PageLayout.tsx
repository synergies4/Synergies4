'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowRight, 
  Brain,
  Menu,
  X,
  ChevronUp,
  MessageSquare,
  Users,
  Award,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

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

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  );
}

// Navigation Component
function Navigation() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Countdown Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <p className="text-sm md:text-base">
              🚀 Expand your potential through learning. Offering earlybirds a discount of $295.00.
            </p>
            <div className="flex gap-2">
              {['00 Days', '00 Hours', '00 Minutes', '00 Seconds'].map((time, index) => (
                <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                  {time}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Fixed width for consistent spacing */}
            <div className="flex-shrink-0 w-32">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                  Synergies4
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation - Centered */}
            <div className="hidden xl:flex items-center justify-center flex-1 space-x-6">
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
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium whitespace-nowrap text-sm"
                >
                  {item}
                </Link>
              ))}
            </div>
            
            {/* Desktop Action Buttons - Right side with consistent spacing */}
            <div className="hidden xl:flex items-center space-x-2 flex-shrink-0">
              {/* Synergize Button */}
              <Button 
                asChild 
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Link href="/synergize">
                  <Brain className="w-3 h-3 mr-1" />
                  Synergize
                </Link>
              </Button>
              
              {/* Contact Button */}
              <Button 
                asChild 
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Link href="/contact">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Contact
                </Link>
              </Button>

              {/* Auth Buttons */}
              {user ? (
                <UserAvatar />
              ) : (
                <div className="flex items-center space-x-1 ml-3 pl-3 border-l border-gray-200">
                  <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 transition-colors">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="xl:hidden">
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
          {mobileMenuOpen && (
            <div className="xl:hidden border-t bg-white/95 backdrop-blur-md">
              <div className="px-4 py-4 space-y-4">
                {/* Navigation Links */}
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
                
                {/* Action Buttons */}
                <div className="pt-4 border-t space-y-3">
                  <Button 
                    asChild 
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg py-3"
                  >
                    <Link href="/synergize" onClick={() => setMobileMenuOpen(false)}>
                      <Brain className="w-4 h-4 mr-2" />
                      Synergize
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg py-3"
                  >
                    <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact Us
                    </Link>
                  </Button>
                </div>
                
                {/* Auth Section - Always in mobile menu */}
                <div className="pt-4 border-t space-y-3">
                  {user ? (
                    <div className="flex items-center space-x-2 py-2">
                      <UserAvatar />
                      <span className="text-gray-700">Welcome back!</span>
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
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Synergies4</h3>
            <p className="text-gray-400">
              AI-powered learning platform for professional development
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Courses</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/courses" className="hover:text-white transition-colors">All Courses</Link></li>
              <li><Link href="/courses" className="hover:text-white transition-colors">Agile & Scrum</Link></li>
              <li><Link href="/courses" className="hover:text-white transition-colors">Leadership</Link></li>
              <li><Link href="/courses" className="hover:text-white transition-colors">Product Management</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about-us" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/coaching" className="hover:text-white transition-colors">Coaching</Link></li>
              <li><Link href="/consulting" className="hover:text-white transition-colors">Consulting</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/contact" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="/synergize" className="hover:text-white transition-colors">AI Assistant</Link></li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8 bg-gray-700" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">
            © 2024 Synergies4. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Stats Section Component (reusable)
export function StatsSection() {
  const stats = [
    { number: "10,000+", label: "Students Trained", icon: <Users className="h-6 w-6" /> },
    { number: "95%", label: "Success Rate", icon: <TrendingUp className="h-6 w-6" /> },
    { number: "50+", label: "Expert Instructors", icon: <Award className="h-6 w-6" /> },
    { number: "24/7", label: "Learning Support", icon: <CheckCircle className="h-6 w-6" /> }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-3 text-blue-200">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {stat.number}
              </div>
              <div className="text-blue-100 text-sm md:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Main Page Layout Component
interface PageLayoutProps {
  children: React.ReactNode;
  showStats?: boolean;
}

export default function PageLayout({ children, showStats = false }: PageLayoutProps) {
  // Add smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <main className="min-h-screen">
      <ScrollToTop />
      <Navigation />
      {children}
      {showStats && <StatsSection />}
      <Footer />
    </main>
  );
} 