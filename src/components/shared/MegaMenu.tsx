'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Settings,
  Calculator
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
      },
      {
        title: 'ROI Engine',
        description: 'Calculate personalized course ROI & value projections',
        href: '/roi-engine',
        icon: Calculator,
        isNew: true
      },
      {
        title: 'Resume Customizer',
        description: 'AI-powered resume tailoring and interview prep',
        href: '/resume-customizer',
        icon: FileText,
        isNew: true,
        badge: 'Public'
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
  const router = useRouter();

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
        <div 
          className="lg:hidden fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm mobile-menu-overlay transition-all duration-300" 
          onClick={closeMobileMenu}
        >
          <div 
            className="fixed top-0 right-0 w-full max-w-md h-full bg-white/95 backdrop-blur-xl shadow-2xl overflow-y-auto touch-manipulation mobile-menu-content border-l border-white/20"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.15), -10px 0 30px rgba(0,0,0,0.1)'
            }}
          >
            <div className="p-6">
              {/* Enhanced Mobile Menu Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gradient-to-r from-gray-200/50 to-transparent">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">S4</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Navigation
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">Explore our platform</p>
                  </div>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="w-10 h-10 rounded-xl bg-gray-100/80 hover:bg-red-100/80 flex items-center justify-center transition-all duration-200 hover:scale-105 group"
                >
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Enhanced Mobile Categories */}
              <div className="space-y-3">
                {menuCategories.map((category, categoryIndex) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.id;
                  
                  return (
                    <div 
                      key={category.id} 
                      className="space-y-2"
                      style={{
                        animation: `slideInRight 0.4s ease-out ${categoryIndex * 0.1}s both`
                      }}
                    >
                      <button
                        onClick={() => setActiveCategory(isActive ? null : category.id)}
                        className={`flex items-center justify-between w-full text-left p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] group ${
                          isActive 
                            ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200/50 shadow-lg' 
                            : 'bg-white/60 hover:bg-white/80 border-2 border-gray-100/50 hover:border-teal-200/50 shadow-md hover:shadow-lg'
                        }`}
                        style={{
                          backdropFilter: 'blur(10px)',
                          background: isActive 
                            ? 'linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(16,185,129,0.1) 100%)' 
                            : 'rgba(255,255,255,0.8)'
                        }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            isActive 
                              ? 'bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/25' 
                              : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-teal-100 group-hover:to-emerald-100'
                          }`}>
                            <Icon className={`w-6 h-6 transition-colors duration-300 ${
                              isActive ? 'text-white' : 'text-gray-600 group-hover:text-teal-600'
                            }`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className={`font-bold text-lg transition-colors duration-300 ${
                              isActive ? 'text-teal-700' : 'text-gray-900 group-hover:text-teal-700'
                            }`}>
                              {category.title}
                            </h3>
                            <p className={`text-sm leading-tight transition-colors duration-300 ${
                              isActive ? 'text-teal-600' : 'text-gray-500 group-hover:text-teal-600'
                            }`}>
                              {category.description}
                            </p>
                          </div>
                        </div>
                        <div className={`transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}>
                          <svg className={`w-6 h-6 transition-colors duration-300 ${
                            isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-teal-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {isActive && (
                        <div 
                          className="ml-4 space-y-2 overflow-hidden bg-white/90 backdrop-blur-sm rounded-xl p-2 border border-gray-200/50 shadow-lg"
                          style={{
                            animation: 'slideDown 0.3s ease-out'
                          }}
                        >
                          {category.items.map((item, itemIndex) => {
                            const ItemIcon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center space-x-3 p-3 rounded-lg bg-white hover:bg-teal-50 transition-all duration-200 group hover:scale-[1.02] hover:shadow-sm border border-gray-100 hover:border-teal-200"
                                onClick={() => {
                                  // Close menu and navigate
                                  setIsMobileMenuOpen(false);
                                  setActiveCategory(null);
                                }}
                                style={{
                                  animation: `slideInLeft 0.3s ease-out ${itemIndex * 0.05}s both`
                                }}
                              >
                                <div className="w-8 h-8 bg-gray-100 group-hover:bg-teal-100 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0">
                                  <ItemIcon className="w-4 h-4 text-gray-700 group-hover:text-teal-600 transition-colors duration-200" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors duration-200 text-sm">
                                      {item.title}
                                    </span>
                                    {item.isNew && (
                                      <span className="px-1.5 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-sm">
                                        NEW
                                      </span>
                                    )}
                                    {item.badge && (
                                      <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full shadow-sm">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-200 leading-tight">
                                    {item.description}
                                  </p>
                                </div>
                                <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                                  <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
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

              {/* Enhanced Mobile Auth Section */}
              <div className="mt-8 pt-6 border-t border-gray-200/50">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="font-bold text-blue-900">Welcome back!</span>
                        <p className="text-sm text-blue-600">Ready to continue learning?</p>
                      </div>
                    </div>
                    <Link
                      href={userProfile?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                      className="flex items-center space-x-4 p-4 bg-white/80 rounded-xl hover:bg-white transition-all duration-200 mobile-menu-item cursor-pointer group hover:scale-[1.02] hover:shadow-md border border-gray-200/50"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setActiveCategory(null);
                      }}
                      onTouchStart={(e) => {
                        const target = e.currentTarget;
                        target.style.backgroundColor = 'rgba(59,130,246,0.1)';
                      }}
                      onTouchEnd={(e) => {
                        const target = e.currentTarget;
                        target.style.backgroundColor = '';
                      }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 rounded-lg flex items-center justify-center transition-all duration-200">
                        <BarChart3 className="w-5 h-5 text-blue-600 transition-colors duration-200" />
                      </div>
                      <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                        {userProfile?.role === 'ADMIN' ? 'Admin Dashboard' : 'Dashboard'}
                      </span>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                        setActiveCategory(null);
                      }}
                      className="flex items-center space-x-4 p-4 bg-red-50/80 hover:bg-red-100/80 rounded-xl transition-all duration-200 w-full text-left group hover:scale-[1.02] border border-red-200/50"
                    >
                      <div className="w-10 h-10 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center transition-all duration-200">
                        <LogOut className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="font-semibold text-red-700 group-hover:text-red-800 transition-colors duration-200">
                        Sign Out
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/login"
                      className="flex items-center justify-center space-x-3 p-4 bg-white/80 hover:bg-white rounded-xl transition-all duration-200 mobile-menu-item cursor-pointer group hover:scale-[1.02] hover:shadow-md border-2 border-gray-200/50 hover:border-blue-300/50"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setActiveCategory(null);
                      }}
                      onTouchStart={(e) => {
                        const target = e.currentTarget;
                        target.style.backgroundColor = 'rgba(59,130,246,0.1)';
                      }}
                      onTouchEnd={(e) => {
                        const target = e.currentTarget;
                        target.style.backgroundColor = '';
                      }}
                    >
                      <User className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                      <span className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                        Login
                      </span>
                    </Link>
                    <Link
                      href="/signup"
                      className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-200 mobile-menu-item cursor-pointer group hover:scale-[1.02] shadow-lg hover:shadow-xl"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setActiveCategory(null);
                      }}
                      onTouchStart={(e) => {
                        const target = e.currentTarget;
                        target.style.transform = 'scale(0.98)';
                      }}
                      onTouchEnd={(e) => {
                        const target = e.currentTarget;
                        target.style.transform = '';
                      }}
                    >
                      <span className="font-bold">Get Started Free</span>
                      <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
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