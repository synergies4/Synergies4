'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ChevronDown,
  Brain,
  BookOpen,
  Users,
  Target,
  MessageSquare,
  Phone,
  Mail,
  Award,
  TrendingUp,
  Zap,
  Shield,
  FileText,
  Building,
  Heart,
  Sparkles,
  LogOut,
  User,
  BarChart3,
  Settings
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
    id: 'learn',
    title: 'Learn & Develop',
    description: 'Courses, coaching, and AI-powered learning',
    icon: BookOpen,
    items: [
      {
        title: 'Courses',
        description: 'Professional development and training programs',
        href: '/courses',
        icon: BookOpen
      },
      {
        title: 'Pocket Coach',
        description: '24/7 AI coaching for daily challenges',
        href: '/pocket-coach',
        icon: Brain
      },
      {
        title: 'Industry Insight',
        description: 'Latest trends and analysis',
        href: '/industry-insight',
        icon: TrendingUp
      },
      {
        title: 'Synergize AI',
        description: 'Personalized AI learning assistant',
        href: '/synergize',
        icon: Sparkles,
        badge: 'Popular'
      }
    ]
  },
  {
    id: 'hr-transformation',
    title: 'HR Transformation',
    description: 'Tools and guidance for the agentic workforce',
    icon: Users,
    items: [
      {
        title: 'HR Playbook',
        description: 'Complete guide for agentic workforce transformation',
        href: '/hr-playbook',
        icon: FileText,
        isNew: true
      },
      {
        title: 'Readiness Assessment',
        description: 'Evaluate your AI workforce readiness',
        href: '/hr-playbook/assessment',
        icon: Target,
        isNew: true
      },
      {
        title: 'New HR Roles',
        description: 'Essential roles for hybrid workforce management',
        href: '/hr-playbook/roles',
        icon: Users,
        isNew: true
      }
    ]
  },
  {
    id: 'services',
    title: 'Services',
    description: 'Expert consulting and coaching services',
    icon: Award,
    items: [
      {
        title: 'Coaching',
        description: 'Leadership and professional development',
        href: '/coaching',
        icon: Target
      },
      {
        title: 'Consulting',
        description: 'Organizational transformation expertise',
        href: '/consulting',
        icon: Building
      }
    ]
  },
  {
    id: 'company',
    title: 'Company',
    description: 'About us and our mission',
    icon: Heart,
    items: [
      {
        title: 'About Us',
        description: 'Our story, mission, and team',
        href: '/about-us',
        icon: Heart
      }
    ]
  }
];

interface MegaMenuProps {
  isScrolled: boolean;
}

export default function MegaMenu({ isScrolled }: MegaMenuProps) {
  const { user, userProfile, signOut } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle mounting for portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close mega menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveCategory(null);
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

  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const handleCategoryEnter = (categoryId: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setActiveCategory(categoryId);
  };

  const handleCategoryLeave = () => {
    const timeout = setTimeout(() => {
      setActiveCategory(null);
    }, 200);
    setHoverTimeout(timeout);
  };

  const handleDropdownEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleDropdownLeave = () => {
    const timeout = setTimeout(() => {
      setActiveCategory(null);
    }, 200);
    setHoverTimeout(timeout);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setActiveCategory(null);
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center space-x-1">
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

              {/* Mega Menu Dropdown */}
              {isActive && (
                <div 
                  className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-3 pb-3 border-b border-gray-100">
                      <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">{category.title}</h3>
                        <p className="text-xs text-gray-600 leading-tight">{category.description}</p>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="space-y-1">
                      {category.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors group/item"
                            onClick={() => setActiveCategory(null)}
                          >
                            <div className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center group-hover/item:bg-teal-100 transition-colors flex-shrink-0">
                              <ItemIcon className="w-3.5 h-3.5 text-gray-600 group-hover/item:text-teal-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900 group-hover/item:text-teal-600 transition-colors text-sm truncate">
                                  {item.title}
                                </h4>
                                {item.isNew && (
                                  <Badge className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 font-medium">New</Badge>
                                )}
                                {item.badge && (
                                  <Badge className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 font-medium">{item.badge}</Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-0.5 leading-tight truncate">{item.description}</p>
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

      {/* Mobile Menu Button */}
      <div className="lg:hidden flex items-center space-x-2">
        <Link href="/contact">
          <Button size="sm" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
            <MessageSquare className="w-4 h-4" />
          </Button>
        </Link>
        
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-gray-700 hover:text-teal-600 hover:bg-gray-100 transition-colors"
          aria-label="Toggle mobile menu"
        >
          <div className="w-6 h-6 flex flex-col justify-center space-y-1">
            <div className={`w-full h-0.5 bg-current transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-full h-0.5 bg-current transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-full h-0.5 bg-current transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && isMounted && createPortal(
        <div className="lg:hidden fixed inset-0 z-[9999] bg-black bg-opacity-50" onClick={closeMobileMenu}>
          <div 
            className="fixed top-0 right-0 w-full max-w-sm h-full bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Categories */}
              <div className="space-y-4">
                {menuCategories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.id;
                  
                  return (
                    <div key={category.id} className="space-y-2">
                      <button
                        onClick={() => setActiveCategory(isActive ? null : category.id)}
                        className="flex items-center justify-between w-full text-left p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-teal-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-teal-600" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm">{category.title}</h3>
                            <p className="text-xs text-gray-600 mt-0.5">{category.description}</p>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
                      </button>

                      {isActive && (
                        <div className="ml-2 space-y-1">
                          {category.items.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center space-x-3 p-2.5 rounded-md hover:bg-gray-50 transition-colors"
                                onClick={closeMobileMenu}
                              >
                                <div className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                                  <ItemIcon className="w-3.5 h-3.5 text-gray-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-900 text-sm">{item.title}</span>
                                    {item.isNew && (
                                      <Badge className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 font-medium">New</Badge>
                                    )}
                                    {item.badge && (
                                      <Badge className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 font-medium">{item.badge}</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-0.5 truncate">{item.description}</p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mobile Auth Section */}
              <div className="mt-6 pt-5 border-t border-gray-200">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                      <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">Welcome back!</span>
                    </div>
                    <Link
                      href={userProfile?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                      className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-50 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">
                        {userProfile?.role === 'ADMIN' ? 'Admin Dashboard' : 'Dashboard'}
                      </span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        closeMobileMenu();
                      }}
                      className="flex items-center space-x-3 p-3 rounded-md hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                        <LogOut className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="font-medium text-red-600 text-sm">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-900 text-sm">Login</span>
                    </Link>
                    <Link
                      href="/signup"
                      className="flex items-center justify-center space-x-2 p-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <span className="font-medium text-sm">Sign Up</span>
                    </Link>
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