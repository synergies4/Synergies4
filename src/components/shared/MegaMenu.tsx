'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  User,
  BarChart3,
  LogOut,
  MessageSquare,
  BookOpen,
  Video,
  FileText,
  Target,
  Brain,
  Users,
  Trophy,
  TrendingUp,
  Calendar,
  Settings,
  Menu,
  X,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Search
} from 'lucide-react';

interface MenuCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  items: {
    title: string;
    description: string;
    href: string;
    icon: any;
    badge?: string;
    isNew?: boolean;
  }[];
}

const menuCategories: MenuCategory[] = [
  {
    id: 'courses',
    title: 'Courses & Learning',
    description: 'Professional development and training programs',
    icon: BookOpen,
    items: [
      {
        title: 'All Courses',
        description: 'Browse our complete course catalog',
        href: '/courses',
        icon: BookOpen
      },
      {
        title: 'My Learning',
        description: 'Continue your enrolled courses',
        href: '/dashboard',
        icon: GraduationCap
      },
      {
        title: 'Certificates',
        description: 'View and download your certificates',
        href: '/certificates',
        icon: Trophy
      }
    ]
  },
  {
    id: 'tools',
    title: 'AI Tools & Features',
    description: '24/7 AI coaching for daily challenges',
    icon: Brain,
    items: [
      {
        title: 'Resume Customizer',
        description: 'AI-powered resume tailoring and interview prep',
        href: '/resume-customizer',
        icon: FileText,
        isNew: true,
        badge: 'Public'
      },
      {
        title: 'AI Interview Practice',
        description: 'Practice interviews with AI coaching',
        href: '/ai-interview-practice',
        icon: Video,
        isNew: true
      },
      {
        title: 'Goal Setting',
        description: 'Set and track your career goals',
        href: '/goal-setting',
        icon: Target
      },
      {
        title: 'ROI Calculator',
        description: 'Calculate personalized course ROI & value projections',
        href: '/roi-engine',
        icon: TrendingUp,
        isNew: true
      }
    ]
  },
  {
    id: 'insights',
    title: 'Industry Insights',
    description: 'Latest trends and analysis',
    icon: Lightbulb,
    items: [
      {
        title: 'Industry Reports',
        description: 'Latest market insights and trends',
        href: '/industry-insights',
        icon: BarChart3
      },
      {
        title: 'Career Guidance',
        description: 'Expert advice for career growth',
        href: '/career-guidance',
        icon: Users
      },
      {
        title: 'Skills Assessment',
        description: 'Evaluate your current skill level',
        href: '/skills-assessment',
        icon: Target
      }
    ]
  },
  {
    id: 'community',
    title: 'Community & Support',
    description: 'Tools and guidance for the agentic workforce',
    icon: Users,
    items: [
      {
        title: 'Community Hub',
        description: 'Connect with other learners',
        href: '/community',
        icon: Users
      },
      {
        title: 'Events & Webinars',
        description: 'Join live learning sessions',
        href: '/events',
        icon: Calendar
      },
      {
        title: 'Support Center',
        description: 'Get help when you need it',
        href: '/support',
        icon: MessageSquare
      }
    ]
  }
];

interface MegaMenuProps {
  isScrolled: boolean;
  onSearchOpen: () => void;
}

export default function MegaMenu({ isScrolled, onSearchOpen }: MegaMenuProps) {
  const { user, userProfile, signOut } = useAuth();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveCategory(null);
        // Don't close mobile menu on outside clicks - only explicit close button
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setActiveCategory(null);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);



  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleCategoryEnter = (categoryId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveCategory(categoryId);
  };

  const handleCategoryLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 150);
  };

  const handleDropdownEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleDropdownLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 150);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setActiveCategory(null);
  };

  const handleMobileNavigation = (href: string) => {
    console.log('🔥 NAVIGATION CLICKED:', href);
    // Immediately navigate - no delays, no complex logic
    window.location.href = href;
  };



  // Simplified mobile category toggle
  const toggleMobileCategory = (categoryId: string) => {
    console.log('Toggling category:', categoryId);
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center space-x-1">
        {/* Desktop Search Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSearchOpen}
          className="flex items-center space-x-2 text-gray-900 hover:text-teal-600 border-gray-400 hover:border-teal-500 hover:bg-teal-50 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 bg-white mr-6"
          aria-label="Open search"
        >
          <Search className="w-4 h-4" />
          <span className="hidden xl:inline">Search</span>
          <kbd className="hidden xl:inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium opacity-100 ml-2">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        {menuCategories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          
          return (
            <div
              key={category.id}
              className="relative group"
              onMouseEnter={() => handleCategoryEnter(category.id)}
              onMouseLeave={handleCategoryLeave}
            >
              <button
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'text-teal-600 bg-teal-50' 
                    : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.title}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Menu Dropdown - Horizontal Layout */}
              {isActive && (
                <div 
                  className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-100">
                      <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-base">{category.title}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    
                    {/* Menu Items - Horizontal Layout */}
                    <div className="space-y-2">
                      {category.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-teal-50 hover:border-teal-200 border border-transparent transition-all group/item"
                            onClick={() => setActiveCategory(null)}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover/item:bg-teal-100 transition-colors flex-shrink-0">
                                <ItemIcon className="w-4 h-4 text-gray-600 group-hover/item:text-teal-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 group-hover/item:text-teal-700 transition-colors text-sm">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-gray-500 group-hover/item:text-teal-600 transition-colors truncate">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-3">
                              {item.isNew && (
                                <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0.5 font-medium">New</Badge>
                              )}
                              {item.badge && (
                                <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 font-medium">{item.badge}</Badge>
                              )}
                              <ArrowRight className="w-4 h-4 text-gray-400 group-hover/item:text-teal-500 transition-colors" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Contact Button */}
        <Link href="/contact">
          <Button className="ml-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact
          </Button>
        </Link>

        {/* User Menu */}
        <div className="ml-4 flex items-center space-x-2">
          {user ? (
            <div className="flex items-center space-x-2">
              <Link href={userProfile?.role === 'ADMIN' ? '/admin' : '/dashboard'}>
                <Button variant="outline" size="sm" className="text-gray-700 hover:text-teal-600 border-gray-300 hover:border-teal-500">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {userProfile?.role === 'ADMIN' ? 'Admin' : 'Dashboard'}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="text-gray-700 hover:text-teal-600">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Buttons */}
      <div className="lg:hidden flex items-center space-x-3">
        {/* Mobile Search Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSearchOpen}
          className="p-2 border-gray-400 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 bg-white text-gray-900"
          aria-label="Open search"
        >
          <Search className="w-5 h-5" />
        </Button>

        {/* Contact Button */}
        <Link href="/contact">
          <Button size="sm" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
            <MessageSquare className="w-4 h-4" />
          </Button>
        </Link>
        
        {/* Hamburger Menu Button */}
        <button
          onClick={() => {
            console.log('Hamburger clicked, current state:', isMobileMenuOpen); // Debug log
            setIsMobileMenuOpen(!isMobileMenuOpen);
          }}
          className="p-2 rounded-lg text-gray-700 hover:text-teal-600 hover:bg-gray-100 transition-colors"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu - Using Portal with Maximum Z-Index */}
      {isMobileMenuOpen && isMounted && createPortal(
        <div 
          className="lg:hidden fixed inset-0 bg-black/50" 
          style={{ zIndex: 2147483647 }}
        >
          <div 
            className="fixed top-0 right-0 w-80 max-w-[90vw] h-full bg-white shadow-xl overflow-y-auto" 
            style={{ zIndex: 2147483647 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-teal-500 to-emerald-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">S4</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">Navigation</h2>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔥 CLOSE BUTTON CLICKED');
                    setIsMobileMenuOpen(false);
                    setActiveCategory(null);
                  }}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  type="button"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Menu Content */}
            <div className="p-4">
              {/* Featured Resume Customizer */}
              <div className="mb-6">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔥 RESUME BUTTON CLICKED');
                    console.log('🔥 About to navigate to resume customizer...');
                    window.location.href = '/resume-customizer';
                  }}
                  className="block w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white text-left hover:from-purple-600 hover:to-pink-600 transition-colors cursor-pointer"
                  type="button"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">Resume Customizer</h3>
                      <p className="text-sm opacity-90">AI-powered resume optimization</p>
                    </div>
                    <div className="ml-auto">
                      <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-bold">NEW</span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Navigation Categories - Simplified */}
              <div className="space-y-4">
                {menuCategories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.id;
                  
                  return (
                    <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🔥 CATEGORY TOGGLE CLICKED:', category.title);
                          toggleMobileCategory(category.id);
                        }}
                        className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                        type="button"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-teal-600" />
                          </div>
                          <span className="font-semibold text-gray-900">{category.title}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isActive ? 'rotate-180' : ''}`} />
                      </button>

                      {isActive && (
                        <div className="bg-white border-t border-gray-200">
                          {category.items.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <button
                                key={item.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('🔥 MENU ITEM CLICKED:', item.title, item.href);
                                  console.log('🔥 About to navigate...');
                                  window.location.href = item.href;
                                }}
                                className="flex items-center space-x-3 p-4 w-full text-left hover:bg-teal-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                                type="button"
                              >
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <ItemIcon className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-900 text-sm">{item.title}</span>
                                    {item.isNew && (
                                      <span className="px-1.5 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium">NEW</span>
                                    )}
                                    {item.badge && (
                                      <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">{item.badge}</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* User Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                {user ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-semibold text-blue-900">Welcome back!</p>
                      <p className="text-sm text-blue-700">{userProfile?.name || 'User'}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔥 DASHBOARD BUTTON CLICKED');
                        const url = userProfile?.role === 'ADMIN' ? '/admin' : '/dashboard';
                        console.log('🔥 About to navigate to:', url);
                        window.location.href = url;
                      }}
                      className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors w-full text-left cursor-pointer"
                      type="button"
                    >
                      <BarChart3 className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        {userProfile?.role === 'ADMIN' ? 'Admin Dashboard' : 'Dashboard'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                    </button>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                        setActiveCategory(null);
                      }}
                      className="flex items-center space-x-3 p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors w-full text-left"
                    >
                      <LogOut className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-900">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔥 LOGIN BUTTON CLICKED');
                        console.log('🔥 About to navigate to login...');
                        window.location.href = '/login';
                      }}
                      className="flex items-center justify-center space-x-2 p-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full cursor-pointer"
                      type="button"
                    >
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">Login</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔥 SIGNUP BUTTON CLICKED');
                        console.log('🔥 About to navigate to signup...');
                        window.location.href = '/signup';
                      }}
                      className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-colors w-full cursor-pointer"
                      type="button"
                    >
                      <span className="font-semibold">Get Started Free</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
} 