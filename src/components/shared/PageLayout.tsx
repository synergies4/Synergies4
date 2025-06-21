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
import MegaMenu from '@/components/shared/MegaMenu';

// Scroll to top component
function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDarkBackground, setIsDarkBackground] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      // Check background color dynamically
      const viewportHeight = window.innerHeight;
      const scrollY = window.pageYOffset;
      const elementBehind = document.elementFromPoint(
        window.innerWidth - 100, // Bottom right area
        viewportHeight - 100
      );
      
      if (elementBehind) {
        const computedStyle = window.getComputedStyle(elementBehind);
        const bgColor = computedStyle.backgroundColor;
        const bgImage = computedStyle.backgroundImage;
        
        // Check if element has dark background
        const isDark = bgColor.includes('rgb(') && (
          bgColor.includes('slate') || 
          bgColor.includes('gray-9') ||
          bgColor.includes('black') ||
          bgImage.includes('gradient') && bgImage.includes('slate')
        );
        
        setIsDarkBackground(isDark);
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
      className={`fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 group backdrop-blur-sm border-2 ${
        isDarkBackground 
          ? 'bg-white/90 hover:bg-white text-gray-900 border-white/30 shadow-white/20' 
          : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white border-teal-500/30 shadow-teal-500/20'
      }`}
      style={{ 
        minHeight: '48px', 
        minWidth: '48px',
        // Dynamic background based on page content
        background: isDarkBackground 
          ? 'rgba(255, 255, 255, 0.95)' 
          : 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)'
      }}
      title="Scroll to top"
    >
      <ChevronUp className={`h-6 w-6 transition-transform duration-300 group-hover:scale-110 ${
        isDarkBackground ? 'text-gray-900' : 'text-white'
      }`} />
      
      {/* Glow effect */}
      <div className={`absolute -inset-1 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${
        isDarkBackground 
          ? 'bg-white' 
          : 'bg-gradient-to-r from-teal-400 to-emerald-400'
      }`} />
    </button>
  );
}

// Navigation Component
interface NavigationProps {
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  headerVisible: boolean;
  lastScrollY: number;
}

function Navigation({ isSearchOpen, setIsSearchOpen, headerVisible, lastScrollY }: NavigationProps) {
  return (
    <>
      {/* Main Navigation Header - Can Hide on Scroll */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        headerVisible 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-full opacity-0'
      }`}>
        {/* AI Assistant Promotion Banner */}
        <div className={`bg-gradient-to-r from-teal-600 to-emerald-600 py-3 px-4 transition-all duration-300 ${
          lastScrollY > 50 ? 'opacity-95' : 'opacity-100'
        }`} role="banner">
          <div className="container mx-auto">
            <Link href="/synergize" className="block hover:opacity-90 transition-opacity">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center cursor-pointer">
                <p className="text-sm sm:text-base font-bold text-white">
                  🎯 Try our AI learning assistant - Get personalized course recommendations instantly.
                </p>
                <div className="flex items-center gap-2 text-xs sm:text-sm bg-white rounded-full px-3 py-1 hover:bg-gray-50 transition-colors">
                  <Brain className="w-4 h-4 text-teal-600" />
                  <span className="font-semibold text-teal-600">Try Synergize AI</span>
                  <ArrowRight className="w-3 h-3 text-teal-600" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`z-50 transition-all duration-300 ${
          lastScrollY > 50 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
            : 'bg-white border-b border-gray-200'
        }`} role="navigation" aria-label="Main navigation">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex-shrink-0 mr-4">
                <Link href="/" className="flex items-center" aria-label="Synergies4 home">
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent hover:from-teal-700 hover:to-emerald-700 transition-all duration-300">
                    Synergies4
                  </span>
                </Link>
              </div>

              {/* Navigation Menu - Desktop and Mobile */}
              <div className="flex flex-1 justify-end ml-4">
                <MegaMenu isScrolled={lastScrollY > 50} onSearchOpen={() => setIsSearchOpen(true)} />
              </div>
            </div>
          </div>
        </nav>
      </div>
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
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide scroll to top button
      setShowScrollTop(currentScrollY > 300);
      
      // Header hide/show logic
      if (currentScrollY > 100) { // Start hiding after 100px
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
          // Scrolling down - hide header
          setHeaderVisible(false);
        } else {
          // Scrolling up - show header
          setHeaderVisible(true);
        }
      } else {
        // Always show header when near top
        setHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
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
  }, [lastScrollY]);

  // Add smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 light" style={{ backgroundColor: 'rgb(248, 250, 252)' }}>
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
        <Navigation isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} headerVisible={headerVisible} lastScrollY={lastScrollY} />
      </div>
      
      {/* Add padding-top to account for fixed header - more on mobile */}
      <main id="main-content" role="main" className="min-h-screen pt-[160px] md:pt-[140px]">
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