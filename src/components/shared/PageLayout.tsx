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
  CheckCircle,
  Search,
  User,
  LogOut,
  BarChart3,
  BookOpen,
  Settings,
  FileText,
  UserPlus
} from 'lucide-react';
import GlobalSearch from '@/components/shared/GlobalSearch';

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
      className="fixed bottom-8 right-8 z-50 bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  );
}

// Navigation Component
interface NavigationProps {
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

function Navigation({ isSearchOpen, setIsSearchOpen }: NavigationProps) {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(140);

  // Close mobile menu on escape key and calculate dynamic header height
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden';
      
      // Calculate actual header height dynamically
      const calculateHeaderHeight = () => {
        const banner = document.querySelector('[role="banner"]') as HTMLElement;
        const nav = document.querySelector('[role="navigation"]') as HTMLElement;
        if (banner && nav) {
          const totalHeight = banner.offsetHeight + nav.offsetHeight;
          setHeaderHeight(totalHeight);
        }
      };
      
      // Calculate immediately and on resize
      calculateHeaderHeight();
      window.addEventListener('resize', calculateHeaderHeight);
      
      return () => {
        window.removeEventListener('resize', calculateHeaderHeight);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navigationItems = [
    { label: 'About Us', href: '/about-us' },
    { label: 'Courses', href: '/courses' },
    { label: 'Coaching', href: '/coaching' },
    { label: 'Consulting', href: '/consulting' },
    { label: 'Industry Insight', href: '/industry-insight' },
  ];

  return (
    <>
      {/* Countdown Banner - Fixed Mobile Layout */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-3 px-4" role="banner">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
            <p className="text-sm sm:text-base font-medium">
              🚀 Expand your potential through learning. Offering earlybirds a discount of $295.00.
            </p>
            <div className="flex gap-1 sm:gap-2 text-xs sm:text-sm" aria-label="Countdown timer">
              {['00 Days', '00 Hours', '00 Minutes', '00 Seconds'].map((time, index) => (
                <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30 px-2 py-1 text-xs">
                  {time}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm" role="navigation" aria-label="Main navigation">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center" aria-label="Synergies4 home">
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent hover:from-teal-700 hover:to-emerald-700 transition-all duration-300">
                  Synergies4
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center flex-1 space-x-6 mx-8">
              {navigationItems.map((item) => (
                <Link 
                  key={item.label}
                  href={item.href} 
                  className="text-gray-600 hover:text-teal-600 transition-colors font-medium whitespace-nowrap text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-md px-2 py-1"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
              <Link href="/synergize" className="group">
                <Button 
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  aria-label="Access Synergize AI assistant"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Synergize AI
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              {/* Desktop Search Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center space-x-2 text-gray-900 hover:text-teal-600 border-gray-400 hover:border-teal-500 hover:bg-teal-50 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 bg-white"
                aria-label="Open search"
              >
                <Search className="w-4 h-4" />
                <span className="hidden xl:inline">Search</span>
                <kbd className="hidden xl:inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium opacity-100 ml-2">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>

              {user ? (
                <div className="flex items-center space-x-2">
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="text-gray-900 hover:text-teal-600 border-gray-400 hover:border-teal-500 hover:bg-teal-50 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 bg-white">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut()}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-400 hover:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 bg-white"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="text-gray-900 hover:text-teal-600 border-gray-400 hover:border-teal-500 hover:bg-teal-50 font-medium focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 bg-white">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-medium focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile/Tablet Action Buttons */}
            <div className="lg:hidden flex items-center space-x-2">
              {/* Mobile Search Button - Always Visible */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 border-gray-400 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 bg-white text-gray-900"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
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
            <div 
              id="mobile-menu"
              className="lg:hidden fixed bg-white shadow-2xl z-[99999] border-t border-gray-200"
              style={{ 
                top: '120px',
                left: '0',
                right: '0',
                bottom: '0',
                width: '100vw',
                height: 'calc(100vh - 120px)',
                backgroundColor: 'white'
              }}
              role="menu"
              aria-label="Mobile navigation menu"
            >
              <div className="h-full overflow-y-auto bg-white">
                <div className="h-full px-4 py-4 space-y-4 flex flex-col bg-white">
                  {/* Navigation Links */}
                  <div className="space-y-1">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block text-gray-800 hover:text-teal-600 hover:bg-teal-50 transition-colors font-semibold py-4 px-4 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 bg-gray-50 border border-gray-200 mb-2"
                        onClick={() => setMobileMenuOpen(false)}
                        role="menuitem"
                      >
                        {item.label}
                      </Link>
                    ))}
                    
                    {/* Mobile Search - Additional Option */}
                    <button
                      onClick={() => {
                        setIsSearchOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center text-gray-800 hover:text-teal-600 hover:bg-teal-50 transition-colors font-semibold py-4 px-4 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 bg-gray-50 border border-gray-200 mb-2"
                      role="menuitem"
                    >
                      <Search className="w-5 h-5 mr-3" />
                      Search
                    </button>
                  </div>
                  
                  {/* Spacer to push auth section to bottom */}
                  <div className="flex-1"></div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3 pb-4">
                    <Button 
                      asChild 
                      className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-150 text-base py-3 h-12 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                    >
                      <Link href="/synergize" onClick={() => setMobileMenuOpen(false)} role="menuitem">
                        <Brain className="w-5 h-5 mr-2" />
                        Synergize AI
                      </Link>
                    </Button>
                    
                    <Button 
                      asChild 
                      className="w-full bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-150 text-base py-3 h-12 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      <Link href="/contact" onClick={() => setMobileMenuOpen(false)} role="menuitem">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Contact Us
                      </Link>
                    </Button>
                  </div>
                  
                  {/* Auth Section - Always at bottom */}
                  <div className="border-t border-gray-200 pt-4 pb-4 bg-gray-50 rounded-lg">
                    {user ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 py-2 px-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <UserAvatar />
                          <span className="text-gray-700 font-medium text-sm">Welcome back!</span>
                        </div>
                        <Button variant="outline" className="w-full text-base py-3 h-12 border-gray-300 text-gray-900 hover:text-teal-600 hover:bg-teal-50 hover:border-teal-300 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 bg-white font-semibold" asChild>
                          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} role="menuitem">
                            <BarChart3 className="w-5 h-5 mr-2" />
                            Dashboard
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 hover:border-red-400 text-base py-3 h-12 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 bg-white font-semibold"
                          onClick={() => {
                            signOut();
                            setMobileMenuOpen(false);
                          }}
                          role="menuitem"
                        >
                          <LogOut className="w-5 h-5 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full text-base py-3 h-12 border-gray-300 text-gray-900 hover:text-teal-600 hover:bg-teal-50 hover:border-teal-300 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 bg-white font-semibold" asChild>
                          <Link href="/login" onClick={() => setMobileMenuOpen(false)} role="menuitem">
                            <User className="w-5 h-5 mr-2" />
                            Login
                          </Link>
                        </Button>
                        <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base py-3 h-12 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all duration-150" asChild>
                          <Link href="/signup" onClick={() => setMobileMenuOpen(false)} role="menuitem">
                            <UserPlus className="w-5 h-5 mr-2" />
                            Sign Up
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
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
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Synergies4</h3>
            <p className="text-white">
              AI-powered learning platform for professional development
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Courses</h4>
            <ul className="space-y-2">
              <li><Link href="/courses" className="text-white hover:text-teal-400 transition-colors">All Courses</Link></li>
              <li><Link href="/courses" className="text-white hover:text-teal-400 transition-colors">Agile & Scrum</Link></li>
              <li><Link href="/courses" className="text-white hover:text-teal-400 transition-colors">Leadership</Link></li>
              <li><Link href="/courses" className="text-white hover:text-teal-400 transition-colors">Product Management</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about-us" className="text-white hover:text-teal-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-white hover:text-teal-400 transition-colors">Contact</Link></li>
              <li><Link href="/coaching" className="text-white hover:text-teal-400 transition-colors">Coaching</Link></li>
              <li><Link href="/consulting" className="text-white hover:text-teal-400 transition-colors">Consulting</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-white hover:text-teal-400 transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="text-white hover:text-teal-400 transition-colors">Contact Support</Link></li>
              <li><Link href="/synergize" className="text-white hover:text-teal-400 transition-colors">AI Assistant</Link></li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8 bg-gray-700" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-white">
            © 2024 Synergies4. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/contact" className="text-white hover:text-teal-400 transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="text-white hover:text-teal-400 transition-colors">Terms of Service</Link>
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
    <section className="py-16 bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-3 text-teal-200">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {stat.number}
              </div>
              <div className="text-teal-100 text-sm md:text-base">{stat.label}</div>
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
  const { user, userProfile, signOut } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Close search with Escape
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Add smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Skip Links for Accessibility */}
      <div className="sr-only">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <a href="#navigation" className="skip-link">
          Skip to navigation
        </a>
      </div>
      
      <div id="navigation">
        <Navigation isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
      </div>
      
      <main id="main-content" role="main" className="min-h-screen">
        {children}
      </main>
      
      {showStats && <StatsSection />}
      <Footer />
      
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <ScrollToTop />
      )}
      
      {/* Global Search Modal */}
      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        placeholder="Search courses, articles, pages..."
        showFilters={true}
      />
    </div>
  );
} 