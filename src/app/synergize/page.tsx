'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import PageLayout from '@/components/shared/PageLayout';
import HeroSection from '@/components/shared/HeroSection';
import OnboardingModal from '@/components/OnboardingModal';
import { usePersonalization } from '@/hooks/usePersonalization';
import { 
  Send, 
  Copy, 
  Trash2, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Loader2,
  Bot,
  Sparkles,
  Zap,
  Brain,
  Users,
  Target,
  Presentation,
  PlayCircle,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Settings,
  MessageSquare,
  Lightbulb,
  Download,
  Mic,
  MicOff,
  X,
  Menu,
  RotateCcw,
  Edit,
  Save,
  Type,
  MousePointer,
  Trash,
  Plus
} from 'lucide-react';

import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import CleanSlideEditor from '@/components/CleanSlideEditor';
import { createClient } from '@/lib/supabase/client';

// Enhanced Canva-like performance optimizations and ultra-smooth animations
const ANIMATION_CONFIG = {
  duration: 0.15,
  ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number] // Custom cubic-bezier for ultra-smooth feel
};

const SMOOTH_TRANSITION_CONFIG = {
  type: "spring",
  stiffness: 400,
  damping: 28,
  mass: 0.6
};

// GPU-accelerated animation settings for maximum smoothness
const GPU_OPTIMIZED_TRANSITION = {
  type: "tween",
  duration: 0.12,
  ease: [0.23, 1, 0.32, 1] // Easing for smooth element manipulation
} as const;

// Performance constants for Canva-like responsiveness
const DEBOUNCE_DELAY = 100; // Reduced for faster response
const INTERSECTION_THRESHOLD = 0.1;
const AUTOSAVE_DEBOUNCE_MS = 800; // Faster autosave for better UX

// Performance monitoring
const TARGET_FPS = 120;

// Performance optimization utilities
const usePerformanceMonitor = () => {
  const [fps, setFps] = useState(0);
  const [isLagging, setIsLagging] = useState(false);
  const frameTimeRef = useRef<number[]>([]);
  
  useEffect(() => {
    const measurePerformance = () => {
      const now = performance.now();
      frameTimeRef.current.push(now);
      
      // Keep only last 60 frames
      if (frameTimeRef.current.length > 60) {
        frameTimeRef.current.shift();
      }
      
      if (frameTimeRef.current.length >= 2) {
        const timeDiff = now - frameTimeRef.current[0];
        const currentFps = (frameTimeRef.current.length - 1) / (timeDiff / 1000);
        setFps(Math.round(currentFps));
        setIsLagging(currentFps < TARGET_FPS * 0.7); // Flag if below 70% of target FPS
      }
      
      requestAnimationFrame(measurePerformance);
    };
    
    const rafId = requestAnimationFrame(measurePerformance);
    return () => cancelAnimationFrame(rafId);
  }, []);
  
  return { fps, isLagging };
};

// Optimize element updates with requestAnimationFrame batching
const useBatchedUpdates = () => {
  const pendingUpdatesRef = useRef<Map<string, any>>(new Map());
  const rafIdRef = useRef<number | null>(null);
  
  const batchUpdate = useCallback((id: string, updates: any, callback: (id: string, updates: any) => void) => {
    pendingUpdatesRef.current.set(id, { ...pendingUpdatesRef.current.get(id), ...updates });
    
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    
    rafIdRef.current = requestAnimationFrame(() => {
      pendingUpdatesRef.current.forEach((updates, id) => {
        callback(id, updates);
      });
      pendingUpdatesRef.current.clear();
      rafIdRef.current = null;
    });
  }, []);
  
  return { batchUpdate };
};

// Enhanced performance utilities for Canva-like smoothness
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Request Animation Frame throttling for smooth updates (commented out until needed)
// const useThrottledCallback = (callback: (...args: unknown[]) => void) => {
//   const callbackRef = useRef(callback);
//   const timeoutRef = useRef<number | null>(null);

//   useEffect(() => {
//     callbackRef.current = callback;
//   }, [callback]);

//   return useCallback((...args: unknown[]) => {
//     if (timeoutRef.current === null) {
//       timeoutRef.current = window.requestAnimationFrame(() => {
//         callbackRef.current(...args);
//         timeoutRef.current = null;
//       });
//     }
//   }, []);
// };

// Enhanced autosave with smart batching
const useSmartAutosave = (data: any, onSave: (data: any) => Promise<void>) => {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const saveQueueRef = useRef<any[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback(async () => {
    if (saveQueueRef.current.length === 0) return;
    
    setIsAutoSaving(true);
    try {
      const latestData = saveQueueRef.current[saveQueueRef.current.length - 1];
      await onSave(latestData);
      setLastSaved(new Date());
      saveQueueRef.current = [];
    } catch (error) {
      console.error('Autosave failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [onSave]);

  useEffect(() => {
    if (data) {
      saveQueueRef.current.push(data);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(debouncedSave, AUTOSAVE_DEBOUNCE_MS);
    }
  }, [data, debouncedSave]);

  return { isAutoSaving, lastSaved };
};

const useIntersectionObserver = (options: IntersectionObserverInit = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, { threshold: INTERSECTION_THRESHOLD, ...options });

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { targetRef, isIntersecting };
};

// Enhanced error boundary
class PresentationErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Presentation Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
              <X className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">
                Something went wrong with the presentation
              </p>
              <p className="text-xs text-red-600">
                Please try refreshing or generating a new presentation
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading skeleton component
const PresentationSkeleton = React.memo(() => (
  <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden animate-pulse">
    <div className="bg-gradient-to-r from-gray-300 to-gray-400 h-24"></div>
    <div className="p-6 space-y-4">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-3 bg-gray-200 rounded w-full"></div>
        ))}
      </div>
      <div className="flex space-x-2 pt-4">
        <div className="h-8 bg-gray-300 rounded w-24"></div>
        <div className="h-8 bg-gray-300 rounded w-20"></div>
      </div>
    </div>
  </div>
));

PresentationSkeleton.displayName = 'PresentationSkeleton';

// Toast notification system
const useToast = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  return { toasts, addToast };
};

// Agile roles and their specific capabilities - Updated with professional color scheme
const AGILE_ROLES = {
  'scrum-master': {
    name: 'Scrum Master',
    color: 'from-teal-600 to-emerald-600',
    icon: <Users className="w-5 h-5" />,
    description: 'Facilitate team processes and remove impediments',
    capabilities: ['Team Facilitation', 'Impediment Removal', 'Process Coaching', 'Metrics Analysis']
  },
  'product-owner': {
    name: 'Product Owner',
    color: 'from-emerald-600 to-cyan-600',
    icon: <Target className="w-5 h-5" />,
    description: 'Maximize product value and manage backlog',
    capabilities: ['Backlog Management', 'Stakeholder Communication', 'Value Prioritization', 'User Story Creation']
  },
  'developer': {
    name: 'Developer',
    color: 'from-slate-600 to-gray-700',
    icon: <Settings className="w-5 h-5" />,
    description: 'Build high-quality product increments',
    capabilities: ['Sprint Planning', 'Code Quality', 'Technical Debt Management', 'Cross-functional Collaboration']
  },
  'agile-coach': {
    name: 'Agile Coach',
    color: 'from-cyan-600 to-teal-600',
    icon: <Lightbulb className="w-5 h-5" />,
    description: 'Guide organizational agile transformation',
    capabilities: ['Organizational Change', 'Team Coaching', 'Agile Scaling', 'Culture Transformation']
  }
};

// Interaction modes
const INTERACTION_MODES = {
  'chat': {
    name: 'AI Chat Assistant',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Get instant answers to your Agile questions'
  },
  'scenario': {
    name: 'Scenario Simulator',
    icon: <PlayCircle className="w-5 h-5" />,
    description: 'Practice real-world Agile scenarios and challenges'
  },
  'advisor': {
    name: 'Role-Based Advisor',
    icon: <Brain className="w-5 h-5" />,
    description: 'Get personalized advice based on your specific role'
  }
};

// AI Provider configurations - Updated with professional colors
const AI_PROVIDERS = {
  anthropic: {
    name: 'Claude',
    color: 'from-amber-600 to-orange-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    badge: 'Anthropic',
    badgeColor: 'bg-amber-100 text-amber-800',
    icon: <Brain className="w-4 h-4" />
  },
  openai: {
    name: 'GPT',
    color: 'from-emerald-600 to-teal-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    badge: 'OpenAI',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    icon: <Zap className="w-4 h-4" />
  },
  google: {
    name: 'Gemini',
    color: 'from-slate-600 to-gray-700',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    badge: 'Google',
    badgeColor: 'bg-slate-100 text-slate-800',
    icon: <Sparkles className="w-4 h-4" />
  }
};

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  mode?: string;
  role?: string;
  provider?: keyof typeof AI_PROVIDERS;
}

// Enhanced Slide Presentation Component with better mobile support
const SlidePresentation = ({ 
  slides, 
  onClose, 
  presentationTitle,
  onExportPDF 
}: {
  slides: any[];
  onClose: () => void;
  presentationTitle: string;
  onExportPDF: () => void;
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[currentSlide];

  return (
    <div 
      className={`${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900' : 'fixed inset-0 z-50 bg-white'}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999
      }}
    >
      {/* Enhanced Presentation Header - Mobile Optimized */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 flex-shrink-0 font-medium"
            >
              <ArrowRight className="h-4 w-4 rotate-180 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Generator</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div className="h-6 w-px bg-white/30 hidden sm:block"></div>
            <h2 className="text-base sm:text-lg font-semibold truncate text-white">{presentationTitle}</h2>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto overflow-x-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
              className="text-white hover:bg-white/20 flex-shrink-0 text-xs sm:text-sm font-medium"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">{showNotes ? 'Hide' : 'Show'} Notes</span>
              <span className="sm:hidden">Notes</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20 flex-shrink-0 text-xs sm:text-sm font-medium"
            >
              <Presentation className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Present</span>
              <span className="sm:hidden">Full</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportPDF}
              className="text-white hover:bg-white/20 flex-shrink-0 text-xs sm:text-sm font-medium"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </div>
      )}

      <div className={`flex flex-col lg:flex-row ${isFullscreen ? 'h-screen' : 'h-full pt-16'}`}>
        {/* Mobile-First Slide Thumbnails */}
        {!isFullscreen && (
          <div className="w-full lg:w-72 bg-gradient-to-b from-teal-50 to-emerald-50 border-b lg:border-r lg:border-b-0 border-teal-200 max-h-40 lg:max-h-none overflow-y-auto">
            <div className="p-3 lg:p-4">
              <h3 className="text-xs lg:text-sm font-bold text-teal-800 mb-2 lg:mb-3 flex items-center">
                <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                Slides ({slides.length})
              </h3>
              <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {slides.map((slideItem, index) => (
                  <div
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`flex-shrink-0 lg:flex-shrink p-3 lg:p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentSlide === index 
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg transform scale-105' 
                        : 'bg-white border border-teal-200 hover:bg-teal-50 hover:border-teal-300 shadow-sm hover:shadow-md'
                    } min-w-[140px] lg:min-w-0`}
                  >
                    <div className={`text-xs font-bold mb-1 ${currentSlide === index ? 'text-teal-100' : 'text-teal-600'}`}>
                      Slide {slideItem.slideNumber}
                    </div>
                    <div className={`text-xs lg:text-sm font-semibold truncate ${currentSlide === index ? 'text-white' : 'text-gray-900'}`}>
                      {slideItem.title}
                    </div>
                    <div className={`text-xs mt-1 hidden lg:block ${currentSlide === index ? 'text-teal-100' : 'text-gray-500'}`}>
                      {slideItem.layout}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Main Slide Display - Mobile Optimized */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Slide Content */}
          <div className={`flex-1 bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto ${isFullscreen ? 'text-white bg-slate-900' : ''}`}>
            <div className="w-full max-w-4xl">
              {slide.layout === 'title-slide' ? (
                <div className="text-center">
                  <h1 className={`text-2xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 lg:mb-8 ${isFullscreen ? 'text-white' : 'text-gray-900'} leading-tight`}>
                    {slide.title}
                  </h1>
                  <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                    {slide.content.map((item: string, idx: number) => (
                      <p key={idx} className={`text-base sm:text-xl lg:text-2xl ${isFullscreen ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={`${slide.layout === 'two-column' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8' : ''}`}>
                  <div className={slide.layout === 'two-column' ? '' : 'mb-4 sm:mb-6 lg:mb-8'}>
                    <h2 className={`text-xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 lg:mb-6 ${isFullscreen ? 'text-white' : 'text-gray-900'} border-b-2 ${isFullscreen ? 'border-slate-600' : 'border-gray-200'} pb-2 sm:pb-3 lg:pb-4 leading-tight`}>
                      {slide.title}
                    </h2>
                    <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
                      {slide.content.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mt-2 sm:mt-2 mr-2 sm:mr-3 lg:mr-4 flex-shrink-0 ${isFullscreen ? 'bg-teal-400' : 'bg-teal-500'}`}></span>
                          <span className={`text-sm sm:text-lg lg:text-xl ${isFullscreen ? 'text-gray-200' : 'text-gray-700'} leading-relaxed`}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {(slide.imageUrl || (slide.imageElements && slide.imageElements.length > 0)) && (
                    <div className="flex items-center justify-center mt-4 lg:mt-0">
                      <div className="relative group">
                        <img 
                          src={slide.imageUrl || (slide.imageElements && slide.imageElements[0] ? slide.imageElements[0].src : '')} 
                          alt={`Slide ${slide.slideNumber} - ${slide.title}`}
                          className="max-w-full max-h-48 sm:max-h-64 lg:max-h-96 object-contain rounded-xl shadow-2xl border-2 border-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl"
                          style={{
                            filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.15))',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                          }}
                          loading="lazy"
                        />
                        {/* Image overlay for better integration */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-xl pointer-events-none"></div>
                        
                        {/* Multiple images indicator */}
                        {slide.imageElements && slide.imageElements.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                            +{slide.imageElements.length - 1} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Navigation Controls - Mobile Optimized */}
          <div className={`flex items-center justify-between p-4 sm:p-6 ${isFullscreen ? 'bg-slate-800 text-white' : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg'}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`${isFullscreen ? "text-white hover:bg-slate-700" : "text-white hover:bg-white/20"} flex-shrink-0 font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] sm:min-w-[100px]`}
            >
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 rotate-180 mr-2" />
              <span className="text-sm sm:text-base">Prev</span>
            </Button>

            <div className="flex items-center space-x-3 sm:space-x-6 mx-4">
              <span className={`text-sm sm:text-base font-medium whitespace-nowrap ${isFullscreen ? 'text-gray-300' : 'text-white'}`}>
                {currentSlide + 1} of {slides.length}
              </span>
              <div className="flex space-x-1.5 sm:space-x-2 max-w-[120px] sm:max-w-none overflow-hidden">
                {slides.slice(0, 8).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-200 flex-shrink-0 hover:scale-125 ${
                      currentSlide === index 
                        ? (isFullscreen ? 'bg-teal-400 shadow-lg' : 'bg-white shadow-lg')
                        : (isFullscreen ? 'bg-slate-600 hover:bg-slate-500' : 'bg-white/40 hover:bg-white/60')
                    }`}
                  />
                ))}
                {slides.length > 8 && (
                  <span className={`text-xs ${isFullscreen ? 'text-gray-400' : 'text-white/80'}`}>...</span>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className={`${isFullscreen ? "text-white hover:bg-slate-700" : "text-white hover:bg-white/20"} flex-shrink-0 font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] sm:min-w-[100px]`}
            >
              <span className="text-sm sm:text-base">Next</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Enhanced Speaker Notes Panel - Mobile Optimized */}
        {showNotes && !isFullscreen && slide.speakerNotes && (
          <div className="w-full lg:w-80 bg-gradient-to-b from-emerald-50 to-teal-50 border-t lg:border-l lg:border-t-0 border-emerald-200 p-4 sm:p-6 max-h-48 lg:max-h-none overflow-y-auto">
            <h3 className="text-sm font-bold text-emerald-800 mb-3 sm:mb-4 flex items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
              Speaker Notes
            </h3>
            <div className="bg-white rounded-lg border border-emerald-200 p-3 sm:p-4">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {slide.speakerNotes}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Exit Hint */}
      {isFullscreen && (
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-black/80 backdrop-blur-sm text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium shadow-lg border border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></div>
            <span>Press ESC to exit fullscreen</span>
          </div>
        </div>
      )}
    </div>
  );
};
// Enhanced Draggable Text Component with Rich Text Formatting
const DraggableText = React.memo(({ 
  id, 
  text, 
  style, 
  onUpdate, 
  onDelete, 
  isSelected, 
  onSelect,
  isMobile = false
}: {
  id: string;
  text: string;
  style: any;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isMobile?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showFormatPanel, setShowFormatPanel] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const textRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formatPanelRef = useRef<HTMLDivElement>(null);
  const debouncedEditText = useDebounce(editText, DEBOUNCE_DELAY);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const transformStyle = CSS.Transform.toString(transform);

  // Rich text formatting functions
  const applyFormatting = useCallback((formatting: any) => {
    const updatedStyle = { ...style, ...formatting };
    onUpdate(id, { style: updatedStyle });
    // Don't auto-hide the format panel so users can make multiple changes
  }, [style, onUpdate, id]);

  const toggleBold = useCallback(() => {
    const newWeight = style.fontWeight === 'bold' || style.fontWeight === '700' ? 'normal' : 'bold';
    applyFormatting({ fontWeight: newWeight });
  }, [style.fontWeight, applyFormatting]);

  const toggleItalic = useCallback(() => {
    const newStyle = style.fontStyle === 'italic' ? 'normal' : 'italic';
    applyFormatting({ fontStyle: newStyle });
  }, [style.fontStyle, applyFormatting]);

  const toggleUnderline = useCallback(() => {
    const newDecoration = style.textDecoration === 'underline' ? 'none' : 'underline';
    applyFormatting({ textDecoration: newDecoration });
  }, [style.textDecoration, applyFormatting]);

  const changeFontSize = useCallback((size: string) => {
    applyFormatting({ fontSize: size });
  }, [applyFormatting]);

  const changeTextColor = useCallback((color: string) => {
    applyFormatting({ color });
  }, [applyFormatting]);

  const changeTextAlign = useCallback((align: string) => {
    applyFormatting({ textAlign: align });
  }, [applyFormatting]);

  const changeBackgroundColor = useCallback((backgroundColor: string) => {
    applyFormatting({ backgroundColor, padding: '8px', borderRadius: '4px' });
  }, [applyFormatting]);

  const toggleBulletPoints = useCallback(() => {
    const lines = text.split('\n');
    const hasBullets = lines.some(line => line.trim().startsWith('•'));
    
    if (hasBullets) {
      // Remove bullets
      const newText = lines.map(line => line.replace(/^[\s]*•[\s]*/, '')).join('\n');
      onUpdate(id, { text: newText });
    } else {
      // Add bullets
      const newText = lines.map(line => line.trim() ? `• ${line.trim()}` : line).join('\n');
      onUpdate(id, { text: newText });
    }
  }, [text, id, onUpdate]);

  // Memoized handlers for performance
  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setEditText(text);
    setShowFormatPanel(false);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }, 0);
  }, [text]);

  const handleSave = useCallback(() => {
    if (editText.trim() !== text.trim()) {
      onUpdate(id, { text: editText.trim() });
    }
    setIsEditing(false);
  }, [editText, text, id, onUpdate]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditText(text);
  }, [text]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      handleSave();
    }
  }, [handleSave, handleCancel]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
    setShowFormatPanel(false);
    onSelect(id);
  }, [onSelect, id]);

  const handleSelect = useCallback(() => {
    onSelect(id);
    if (!isEditing) {
      // Always show format panel immediately when selecting text (even empty)
      setShowFormatPanel(true);
      setShowContextMenu(false);
    }
  }, [onSelect, id, isEditing]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setShowContextMenu(false);
  }, [text]);

  const handleDuplicate = useCallback(() => {
    // Create a new element with a new ID
    const newId = `text-${Date.now()}`;
    const newElement = {
      text: text + ' (Copy)',
      style: {
        ...style,
        top: style.top + 20,
        left: style.left + 20
      }
    };
    onUpdate(newId, newElement);
    setShowContextMenu(false);
  }, [id, text, style, onUpdate]);

  // Auto-save with debounce
  useEffect(() => {
    if (isEditing && debouncedEditText !== text && debouncedEditText.trim()) {
      onUpdate(id, { text: debouncedEditText });
    }
  }, [debouncedEditText, isEditing, text, id, onUpdate]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formatPanelRef.current && !formatPanelRef.current.contains(event.target as Node)) {
        setShowFormatPanel(false);
      }
      if (!formatPanelRef.current?.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };
    
    if (showFormatPanel || showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showFormatPanel, showContextMenu]);

  // Enhanced keyboard navigation
  useEffect(() => {
    if (isSelected && !isEditing) {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Format shortcuts
        if ((e.ctrlKey || e.metaKey) && !isEditing) {
          switch (e.key) {
            case 'b':
              e.preventDefault();
              toggleBold();
              break;
            case 'i':
              e.preventDefault();
              toggleItalic();
              break;
            case 'u':
              e.preventDefault();
              toggleUnderline();
              break;
          }
          return;
        }

        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            onDelete(id);
            break;
          case 'Enter':
          case 'F2':
            e.preventDefault();
            handleDoubleClick();
            break;
          case 'ArrowUp':
            e.preventDefault();
            const upStep = e.shiftKey ? 20 : (e.ctrlKey || e.metaKey) ? 1 : 5;
            onUpdate(id, { style: { ...style, top: Math.max(0, style.top - upStep) } });
            break;
          case 'ArrowDown':
            e.preventDefault();
            const downStep = e.shiftKey ? 20 : (e.ctrlKey || e.metaKey) ? 1 : 5;
            onUpdate(id, { style: { ...style, top: style.top + downStep } });
            break;
          case 'ArrowLeft':
            e.preventDefault();
            const leftStep = e.shiftKey ? 20 : (e.ctrlKey || e.metaKey) ? 1 : 5;
            onUpdate(id, { style: { ...style, left: Math.max(0, style.left - leftStep) } });
            break;
          case 'ArrowRight':
            e.preventDefault();
            const rightStep = e.shiftKey ? 20 : (e.ctrlKey || e.metaKey) ? 1 : 5;
            onUpdate(id, { style: { ...style, left: style.left + rightStep } });
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSelected, isEditing, id, style, onUpdate, onDelete, handleDoubleClick, toggleBold, toggleItalic, toggleUnderline]);

  // Font size options
  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '72px'];
  
  // Color presets
  const colorPresets = [
    '#000000', '#374151', '#6B7280', '#9CA3AF',
    '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
  ];

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={{
          transform: transformStyle,
          transition,
          ...style,
          position: 'absolute',
          cursor: isDragging ? 'grabbing' : isEditing ? 'text' : 'grab',
          zIndex: isDragging ? 1000 : isSelected ? 100 : 1,
          willChange: 'transform', // GPU acceleration
        }}
        className={`
          ${style.background || style.backgroundColor ? 'p-0' : isMobile ? 'p-4' : 'p-3'} 
          rounded-lg transition-all duration-200 select-none 
          ${isMobile ? 'touch-manipulation' : ''}
          ${isSelected && !style.background && !style.backgroundColor ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50/50' : 'hover:shadow-md'}
          ${isDragging ? 'opacity-75 shadow-2xl' : 'opacity-100'}
          ${isEditing ? 'bg-white border-2 border-blue-400' : style.background || style.backgroundColor ? '' : 'bg-white/90 backdrop-blur-sm border border-gray-200'}
          ${text || style.background || style.backgroundColor ? '' : 'border-dashed border-gray-300 bg-gray-50'}
          ${isMobile ? 'min-h-[44px] min-w-[44px]' : ''}
        `}
        onClick={handleSelect}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        {...(!isEditing ? attributes : {})}
        {...(!isEditing ? listeners : {})}
        whileHover={!isEditing ? { scale: 1.02 } : {}}
        whileTap={!isEditing ? { scale: 0.98 } : {}}
        layout
        transition={GPU_OPTIMIZED_TRANSITION}
        role="textbox"
        aria-label={`Editable text: ${text}`}
        aria-selected={isSelected}
        tabIndex={isSelected ? 0 : -1}
      >
        {isEditing ? (
          <div className="min-w-[200px]">
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleSave}
              className="w-full p-2 border-0 rounded-md resize-none focus:outline-none bg-transparent text-inherit"
              style={{ 
                fontSize: style.fontSize || '16px', 
                fontWeight: style.fontWeight || 'normal',
                fontStyle: style.fontStyle || 'normal',
                textDecoration: style.textDecoration || 'none',
                color: style.color || '#000000',
                lineHeight: style.lineHeight || '1.4',
                textAlign: style.textAlign || 'left'
              }}
              rows={Math.max(1, editText.split('\n').length)}
              placeholder="Enter text..."
              aria-label="Edit text content"
            />
            <div className="flex justify-end space-x-2 mt-2">
              <Button 
                size="sm" 
                onClick={handleSave} 
                className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                aria-label="Save changes"
              >
                <Save className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCancel} 
                className="h-6 px-2 text-xs"
                aria-label="Cancel editing"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <div 
              ref={textRef}
              style={{ 
                fontSize: style.fontSize || '16px', 
                fontWeight: style.fontWeight || 'normal',
                fontStyle: style.fontStyle || 'normal',
                textDecoration: style.textDecoration || 'none',
                color: style.color || '#000000',
                lineHeight: style.lineHeight || '1.4',
                textAlign: style.textAlign || 'left',
                textShadow: style.textShadow,
                maxWidth: style.maxWidth,
                width: style.width || 'auto',
                height: style.height || 'auto',
                minWidth: style.width ? style.width : '150px',
                minHeight: style.height ? style.height : '40px',
                background: style.background,
                backgroundColor: style.backgroundColor,
                borderRadius: style.borderRadius,
                boxShadow: style.boxShadow,
                border: style.border,
                padding: style.padding,
                zIndex: style.zIndex || 'auto',
                overflow: 'hidden'
              }}
              className={`whitespace-pre-wrap break-words select-text ${text ? '' : 'opacity-30'}`}
            >
              {text || (style.background || style.backgroundColor ? '' : 'Empty text element')}
            </div>
            
            {/* Accessibility indicator */}
            {isSelected && (
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            )}
            
            {/* Enhanced Mobile-Friendly Action buttons */}
            {isSelected && (text || !style.background) && (
              <motion.div 
                className={`absolute ${isMobile ? '-top-3 -right-3' : '-top-2 -right-2'} flex ${isMobile ? 'flex-col space-y-1' : 'space-x-1'}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={GPU_OPTIMIZED_TRANSITION}
              >
                {text && (
                  <>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDoubleClick();
                      }}
                      className={`${isMobile ? 'h-8 w-8' : 'h-6 w-6'} p-0 bg-blue-500 hover:bg-blue-600 text-white shadow-lg touch-manipulation ${isMobile ? 'mb-1' : 'mr-1'}`}
                      aria-label="Edit text"
                      title="Edit text"
                    >
                      <Edit className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFormatPanel(true);
                        setShowContextMenu(false);
                      }}
                      className={`${isMobile ? 'h-8 px-3' : 'h-6 px-2'} bg-purple-500 hover:bg-purple-600 text-white shadow-lg touch-manipulation ${isMobile ? 'mb-1' : 'mr-1'} flex items-center space-x-1`}
                      aria-label="Format text"
                      title="Format text (Bold, Italic, Colors, Bullets)"
                    >
                      <Type className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
                      {!isMobile && <span className="text-xs font-medium">Format</span>}
                    </Button>
                  </>
                )}
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(id);
                  }}
                  className={`${isMobile ? 'h-8 w-8' : 'h-6 w-6'} p-0 shadow-lg touch-manipulation`}
                  aria-label="Delete text element"
                  title="Delete element"
                >
                  <Trash className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
                </Button>
              </motion.div>
            )}
            
            {/* PowerPoint/Canva style resize handles - Made bigger and more obvious */}
            {isSelected && !isEditing && !isMobile && (
              <>
                {/* Resize instruction tooltip */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none">
                  Drag corners to resize
                </div>
                {/* Corner resize handles - like PowerPoint */}
                <div 
                  className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-nw-resize hover:bg-blue-600 shadow-lg transform hover:scale-110 transition-all duration-200"
                  title="Drag to resize from top-left corner"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startWidth = parseInt(style.width || '200');
                    const startHeight = parseInt(style.height || '100');
                    const startLeft = style.left;
                    const startTop = style.top;
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      const deltaX = e.clientX - startX;
                      const deltaY = e.clientY - startY;
                      const newWidth = Math.max(50, startWidth - deltaX);
                      const newHeight = Math.max(30, startHeight - deltaY);
                      
                      onUpdate(id, {
                        style: {
                          ...style,
                          width: `${newWidth}px`,
                          height: `${newHeight}px`,
                          left: startLeft + (startWidth - newWidth),
                          top: startTop + (startHeight - newHeight),
                          minWidth: `${newWidth}px`,
                          minHeight: `${newHeight}px`
                        }
                      });
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
                
                <div 
                  className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-ne-resize hover:bg-blue-600 shadow-lg transform hover:scale-110 transition-all duration-200"
                  title="Drag to resize from top-right corner"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startWidth = parseInt(style.width || '200');
                    const startHeight = parseInt(style.height || '100');
                    const startTop = style.top;
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      const deltaX = e.clientX - startX;
                      const deltaY = e.clientY - startY;
                      const newWidth = Math.max(50, startWidth + deltaX);
                      const newHeight = Math.max(30, startHeight - deltaY);
                      
                      onUpdate(id, {
                        style: {
                          ...style,
                          width: `${newWidth}px`,
                          height: `${newHeight}px`,
                          top: startTop + (startHeight - newHeight)
                        }
                      });
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
                
                <div 
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-sw-resize hover:bg-blue-600 shadow-lg transform hover:scale-110 transition-all duration-200"
                  title="Drag to resize from bottom-left corner"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startWidth = parseInt(style.width || '200');
                    const startHeight = parseInt(style.height || '100');
                    const startLeft = style.left;
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      const deltaX = e.clientX - startX;
                      const deltaY = e.clientY - startY;
                      const newWidth = Math.max(50, startWidth - deltaX);
                      const newHeight = Math.max(30, startHeight + deltaY);
                      
                      onUpdate(id, {
                        style: {
                          ...style,
                          width: `${newWidth}px`,
                          height: `${newHeight}px`,
                          left: startLeft + (startWidth - newWidth)
                        }
                      });
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
                
                <div 
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-se-resize hover:bg-blue-600 shadow-lg transform hover:scale-110 transition-all duration-200"
                  title="Drag to resize from bottom-right corner"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startWidth = parseInt(style.width || '200');
                    const startHeight = parseInt(style.height || '100');
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      const deltaX = e.clientX - startX;
                      const deltaY = e.clientY - startY;
                      const newWidth = Math.max(50, startWidth + deltaX);
                      const newHeight = Math.max(30, startHeight + deltaY);
                      
                      onUpdate(id, {
                        style: {
                          ...style,
                          width: `${newWidth}px`,
                          height: `${newHeight}px`
                        }
                      });
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
              </>
            )}
          </div>
        )}
      </motion.div>

      {/* Rich Text Formatting Panel */}
      <AnimatePresence>
        {showFormatPanel && isSelected && !isEditing && (
          <motion.div
            ref={formatPanelRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={ANIMATION_CONFIG}
            className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl p-3 min-w-[320px]"
            style={{
              left: Math.min(window.innerWidth - 340, Math.max(10, (style.left || 0) + 50)),
              top: Math.max(10, (style.top || 0) - 10),
            }}
          >
            <div className="space-y-3">
              {/* Font formatting row */}
              <div className="flex items-center space-x-2">
                <div className="flex bg-gray-100 rounded p-1">
                  <Button
                    size="sm"
                    onClick={toggleBold}
                    className={`h-8 w-8 p-0 ${style.fontWeight === 'bold' || style.fontWeight === '700' ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-800 hover:bg-gray-200 hover:text-gray-900'}`}
                    title="Bold (Ctrl+B)"
                  >
                    <span className="font-bold text-sm">B</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={toggleItalic}
                    className={`h-8 w-8 p-0 ml-1 ${style.fontStyle === 'italic' ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-800 hover:bg-gray-200 hover:text-gray-900'}`}
                    title="Italic (Ctrl+I)"
                  >
                    <span className="italic text-sm">I</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={toggleUnderline}
                    className={`h-8 w-8 p-0 ml-1 ${style.textDecoration === 'underline' ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-800 hover:bg-gray-200 hover:text-gray-900'}`}
                    title="Underline (Ctrl+U)"
                  >
                    <span className="underline text-sm">U</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={toggleBulletPoints}
                    className={`h-8 w-8 p-0 ml-1 ${text.includes('•') ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-800 hover:bg-gray-200 hover:text-gray-900'}`}
                    title="Toggle bullet points"
                  >
                    <span className="text-sm">•</span>
                  </Button>
                </div>

                {/* Font size selector */}
                <select
                  value={style.fontSize || '16px'}
                  onChange={(e) => changeFontSize(e.target.value)}
                  className="h-8 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                >
                  {fontSizes.map(size => (
                    <option key={size} value={size}>{parseInt(size)}px</option>
                  ))}
                </select>
              </div>

              {/* Color and alignment row */}
              <div className="flex items-center space-x-2">
                {/* Text color */}
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-600">Color:</span>
                  <div className="flex space-x-1">
                    {colorPresets.slice(0, 8).map(color => (
                      <button
                        key={color}
                        onClick={() => changeTextColor(color)}
                        className={`w-6 h-6 rounded border-2 ${style.color === color ? 'border-blue-500' : 'border-gray-300'}`}
                        style={{ backgroundColor: color }}
                        title={`Text color: ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Background color row */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">Background:</span>
                <button
                  onClick={() => changeBackgroundColor('transparent')}
                  className={`w-6 h-6 rounded border-2 ${!style.backgroundColor || style.backgroundColor === 'transparent' ? 'border-blue-500' : 'border-gray-300'} bg-white relative`}
                  title="No background"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-transparent to-red-500 opacity-30 rounded"></div>
                </button>
                {['#FEFCE8', '#FEF3C7', '#DBEAFE', '#E0E7FF', '#F3E8FF', '#FCE7F3'].map(color => (
                  <button
                    key={color}
                    onClick={() => changeBackgroundColor(color)}
                    className={`w-6 h-6 rounded border-2 ${style.backgroundColor === color ? 'border-blue-500' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                    title={`Background color: ${color}`}
                  />
                ))}
              </div>

              {/* Text alignment */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">Align:</span>
                <div className="flex bg-gray-100 rounded p-1">
                  {[
                    { value: 'left', icon: '⟵', title: 'Align left' },
                    { value: 'center', icon: '⟷', title: 'Center' },
                    { value: 'right', icon: '⟶', title: 'Align right' }
                  ].map(({ value, icon, title }) => (
                    <Button
                      key={value}
                      size="sm"
                      onClick={() => changeTextAlign(value)}
                      className={`h-8 w-8 p-0 ${style.textAlign === value ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-800 hover:bg-gray-200 hover:text-gray-900'}`}
                      title={title}
                    >
                      <span className="text-sm">{icon}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={ANIMATION_CONFIG}
            className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[120px]"
            style={{
              left: contextMenuPos.x,
              top: contextMenuPos.y,
            }}
          >
            <button
              onClick={handleDoubleClick}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
            >
              <Edit className="h-3 w-3" />
              <span>Edit</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFormatPanel(true);
                setShowContextMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
            >
              <Type className="h-3 w-3" />
              <span>Format Text</span>
            </button>
            <button
              onClick={handleCopy}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
            >
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </button>
            <button
              onClick={handleDuplicate}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
            >
              <Plus className="h-3 w-3" />
              <span>Duplicate</span>
            </button>
            <hr className="my-1" />
            <button
              onClick={() => {
                onDelete(id);
                setShowContextMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-red-100 text-red-600 flex items-center space-x-2"
            >
              <Trash className="h-3 w-3" />
              <span>Delete</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
DraggableText.displayName = 'DraggableText';
// Enhanced Draggable Image Component with Better PDF Support & Performance
const DraggableImage = React.memo(({ 
  id, 
  src, 
  style, 
  onUpdate, 
  onDelete, 
  isSelected, 
  onSelect,
  isMobile = false
}: {
  id: string;
  src: string;
  style: any;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isMobile?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showResizeHandles, setShowResizeHandles] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { targetRef, isIntersecting } = useIntersectionObserver();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const transformStyle = CSS.Transform.toString(transform);

  // Memoized handlers
  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
    onSelect(id);
  }, [onSelect, id]);

  const handleDuplicate = useCallback(() => {
    // Create a new element with a new ID
    const newId = `image-${Date.now()}`;
    const newElement = {
      src,
      style: {
        ...style,
        top: style.top + 20,
        left: style.left + 20
      }
    };
    onUpdate(newId, newElement);
    setShowContextMenu(false);
  }, [id, src, style, onUpdate]);

  const handleResize = useCallback((newWidth: number, newHeight: number) => {
    onUpdate(id, { 
      style: { 
        ...style, 
        width: `${newWidth}px`, 
        height: `${newHeight}px` 
      } 
    });
  }, [id, style, onUpdate]);

  const handleSelect = useCallback(() => {
    onSelect(id);
    setShowResizeHandles(true);
    setShowContextMenu(false);
  }, [onSelect, id]);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false);
    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showContextMenu]);

  // Enhanced keyboard navigation
  useEffect(() => {
    if (isSelected) {
      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            onDelete(id);
            break;
          case 'ArrowUp':
            e.preventDefault();
            const upStep = e.shiftKey ? 20 : (e.ctrlKey || e.metaKey) ? 1 : 5;
            onUpdate(id, { style: { ...style, top: Math.max(0, style.top - upStep) } });
            break;
          case 'ArrowDown':
            e.preventDefault();
            const downStep = e.shiftKey ? 20 : (e.ctrlKey || e.metaKey) ? 1 : 5;
            onUpdate(id, { style: { ...style, top: style.top + downStep } });
            break;
          case 'ArrowLeft':
            e.preventDefault();
            const leftStep = e.shiftKey ? 20 : (e.ctrlKey || e.metaKey) ? 1 : 5;
            onUpdate(id, { style: { ...style, left: Math.max(0, style.left - leftStep) } });
            break;
          case 'ArrowRight':
            e.preventDefault();
            const rightStep = e.shiftKey ? 20 : (e.ctrlKey || e.metaKey) ? 1 : 5;
            onUpdate(id, { style: { ...style, left: style.left + rightStep } });
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSelected, id, style, onUpdate, onDelete]);

  return (
    <>
      <motion.div
        ref={(node) => {
          setNodeRef(node);
          if (targetRef) {
            (targetRef as any).current = node;
          }
        }}
        style={{
          transform: transformStyle,
          transition,
          ...style,
          position: 'absolute',
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: isDragging ? 1000 : isSelected ? 100 : 1,
          willChange: 'transform',
        }}
        className={`
          rounded-lg transition-all duration-200 select-none
          ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}
          ${isDragging ? 'opacity-75 shadow-2xl' : 'opacity-100'}
        `}
        onClick={handleSelect}
        onContextMenu={handleContextMenu}
        {...attributes}
        {...listeners}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        layout
        transition={ANIMATION_CONFIG}
        role="img"
        aria-label="Draggable image element"
        aria-selected={isSelected}
        tabIndex={isSelected ? 0 : -1}
      >
        <div className="relative group">
          {/* Lazy loaded image with error handling */}
          {isIntersecting && (
            <>
              {isLoading && (
                <div 
                  className="bg-gray-200 rounded-lg flex items-center justify-center animate-pulse"
                  style={{ 
                    width: style.width || '200px', 
                    height: style.height || '150px',
                    maxWidth: '300px',
                    maxHeight: '200px'
                  }}
                >
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              {hasError && (
                <div 
                  className="bg-red-50 border-2 border-red-200 rounded-lg flex flex-col items-center justify-center p-4"
                  style={{ 
                    width: style.width || '200px', 
                    height: style.height || '150px',
                    maxWidth: '300px',
                    maxHeight: '200px'
                  }}
                >
                  <X className="h-8 w-8 text-red-400 mb-2" />
                  <span className="text-xs text-red-600 text-center">Failed to load image</span>
                </div>
              )}
              
              <img 
                ref={imgRef}
                src={src} 
                alt="Slide element"
                className={`rounded-lg shadow-sm max-w-full h-auto transition-opacity duration-200 ${
                  isLoading || hasError ? 'opacity-0 absolute' : 'opacity-100'
                }`}
                style={{ 
                  width: style.width || 'auto', 
                  height: style.height || 'auto',
                  maxWidth: '300px',
                  maxHeight: '200px'
                }}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
                draggable={false}
              />
            </>
          )}
          
          {/* Accessibility indicator */}
          {isSelected && (
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          )}
          
          {/* Action buttons */}
          {isSelected && (
            <motion.div 
              className="absolute -top-2 -right-2 flex space-x-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={ANIMATION_CONFIG}
            >
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
                className="h-6 w-6 p-0"
                aria-label="Delete image element"
              >
                <Trash className="h-3 w-3" />
              </Button>
            </motion.div>
          )}
          
          {/* PowerPoint/Canva style resize handles for images - Made bigger and more obvious */}
          {isSelected && !isMobile && (
            <>
              {/* Corner resize handles - like PowerPoint */}
              <div 
                className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-nw-resize hover:bg-blue-600 shadow-lg transform hover:scale-110 transition-all duration-200"
                title="Drag to resize from top-left corner"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startWidth = parseInt(style.width || '200');
                  const startHeight = parseInt(style.height || '150');
                  const startLeft = style.left;
                  const startTop = style.top;
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;
                    const newWidth = Math.max(50, startWidth - deltaX);
                    const newHeight = Math.max(50, startHeight - deltaY);
                    
                    onUpdate(id, {
                      style: {
                        ...style,
                        width: `${newWidth}px`,
                        height: `${newHeight}px`,
                        left: startLeft + (startWidth - newWidth),
                        top: startTop + (startHeight - newHeight)
                      }
                    });
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
              
              <div 
                className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-ne-resize hover:bg-blue-600 shadow-lg transform hover:scale-110 transition-all duration-200"
                title="Drag to resize from top-right corner"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startWidth = parseInt(style.width || '200');
                  const startHeight = parseInt(style.height || '150');
                  const startTop = style.top;
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;
                    const newWidth = Math.max(50, startWidth + deltaX);
                    const newHeight = Math.max(50, startHeight - deltaY);
                    
                    onUpdate(id, {
                      style: {
                        ...style,
                        width: `${newWidth}px`,
                        height: `${newHeight}px`,
                        top: startTop + (startHeight - newHeight)
                      }
                    });
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
              
              <div 
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-sw-resize hover:bg-blue-600 shadow-lg transform hover:scale-110 transition-all duration-200"
                title="Drag to resize from bottom-left corner"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startWidth = parseInt(style.width || '200');
                  const startHeight = parseInt(style.height || '150');
                  const startLeft = style.left;
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;
                    const newWidth = Math.max(50, startWidth - deltaX);
                    const newHeight = Math.max(50, startHeight + deltaY);
                    
                    onUpdate(id, {
                      style: {
                        ...style,
                        width: `${newWidth}px`,
                        height: `${newHeight}px`,
                        left: startLeft + (startWidth - newWidth)
                      }
                    });
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
              
              <div 
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded cursor-se-resize hover:bg-blue-600 shadow-lg transform hover:scale-110 transition-all duration-200"
                title="Drag to resize from bottom-right corner"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startWidth = parseInt(style.width || '200');
                  const startHeight = parseInt(style.height || '150');
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;
                    const newWidth = Math.max(50, startWidth + deltaX);
                    const newHeight = Math.max(50, startHeight + deltaY);
                    
                    onUpdate(id, {
                      style: {
                        ...style,
                        width: `${newWidth}px`,
                        height: `${newHeight}px`
                      }
                    });
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
            </>
          )}
        </div>
      </motion.div>

      {/* Enhanced Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={ANIMATION_CONFIG}
            className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[120px]"
            style={{
              left: contextMenuPos.x,
              top: contextMenuPos.y,
            }}
          >
            <button
              onClick={handleDuplicate}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
            >
              <Plus className="h-3 w-3" />
              <span>Duplicate</span>
            </button>
            <hr className="my-1" />
            <button
              onClick={() => {
                onDelete(id);
                setShowContextMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-red-100 text-red-600 flex items-center space-x-2"
            >
              <Trash className="h-3 w-3" />
              <span>Delete</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
DraggableImage.displayName = 'DraggableImage';
// Enhanced Editable Slide Presentation Component with Advanced Features
const EditableSlidePresentation = ({ 
  slides, 
  onClose, 
  presentationTitle,
  onSave 
}: {
  slides: any[];
  onClose: () => void;
  presentationTitle: string;
  onSave: (updatedSlides: any[]) => void;
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editableSlides, setEditableSlides] = useState(slides.map(slide => {
    // Check if slide already has elements (from previous editing)
    if (slide.elements && slide.elements.length > 0) {
      return {
        ...slide,
        elements: slide.elements
      };
    }

    // Initialize elements for new slides with clean, simple layout
    const baseElements = [];
    
    if (slide.layout === 'title-slide') {
      // Clean title slide - just title and content points
      baseElements.push(
        // Main title
        {
          id: `title-${slide.slideNumber}`,
          type: 'text',
          text: slide.title,
          style: {
            top: 100,
            left: 100,
            fontSize: '48px',
            fontWeight: '700',
            color: '#0f766e',
            maxWidth: '600px'
          }
        },
        // Content points with good spacing
        ...slide.content.map((content: string, idx: number) => ({
          id: `content-${slide.slideNumber}-${idx}`,
          type: 'text',
          text: content,
          style: {
            top: 220 + (idx * 60),
            left: 120,
            fontSize: '24px',
            fontWeight: '400',
            color: '#374151',
            maxWidth: '550px'
          }
        }))
      );
    } else {
      // Clean content slide - title and bullet points
      baseElements.push(
        // Slide title
        {
          id: `title-${slide.slideNumber}`,
          type: 'text',
          text: slide.title,
          style: {
            top: 80,
            left: 100,
            fontSize: '36px',
            fontWeight: '600',
            color: '#0f766e',
            maxWidth: '600px'
          }
        },
        // Content items with clean spacing
        ...slide.content.map((content: string, idx: number) => ({
          id: `content-${slide.slideNumber}-${idx}`,
          type: 'text',
          text: `• ${content}`,
          style: {
            top: 160 + (idx * 50),
            left: 120,
            fontSize: '20px',
            fontWeight: '400',
            color: '#374151',
            lineHeight: '1.5',
            maxWidth: '600px'
          }
        }))
      );
    }
    
    // Add any existing image elements with proper formatting
    const imageElements = (slide.imageElements || []).map((img: any) => ({
      ...img,
      type: 'image',
      id: img.id || `image-${Date.now()}-${Math.random()}`,
      style: img.style || {
        top: 200,
        left: 500,
        width: '200px',
        height: 'auto'
      }
    }));
    
    // Add primary imageUrl as an element if it exists and no imageElements
    if (slide.imageUrl && imageElements.length === 0) {
      imageElements.push({
        id: `image-primary-${slide.slideNumber}`,
        type: 'image',
        src: slide.imageUrl,
        style: {
          top: 250,
          left: 480,
          width: '250px',
          height: 'auto'
        }
      });
    }
    
    const customElements = slide.customElements || [];
    
    return {
      ...slide,
      elements: [...baseElements, ...imageElements, ...customElements]
    };
  }));
  
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [gridSize] = useState(20);
  const [showMobileFAB, setShowMobileFAB] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  
  // Check for mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Undo/Redo functionality
  const [history, setHistory] = useState<any[]>([editableSlides]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const maxHistorySize = 50;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toasts, addToast } = useToast();

  // Memoized values for performance
  const canUndo = useMemo(() => historyIndex > 0, [historyIndex]);
  const canRedo = useMemo(() => historyIndex < history.length - 1, [historyIndex, history.length]);
  const currentSlideData = useMemo(() => editableSlides[currentSlide], [editableSlides, currentSlide]);

  // Undo/Redo handlers
  const addToHistory = useCallback((newSlides: any[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newSlides);
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        setHistoryIndex(maxHistorySize - 1);
        return newHistory;
      }
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [historyIndex, maxHistorySize]);

  const undo = useCallback(() => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setEditableSlides(history[newIndex]);
      addToast('Undone', 'info');
    }
  }, [canUndo, historyIndex, history, addToast]);

  const redo = useCallback(() => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEditableSlides(history[newIndex]);
      addToast('Redone', 'info');
    }
  }, [canRedo, historyIndex, history, addToast]);

  // Grid snapping utility
  const snapToGridPosition = useCallback((position: number) => {
    return snapToGrid ? Math.round(position / gridSize) * gridSize : position;
  }, [snapToGrid, gridSize]);

  // Simplified auto-save functionality
  const debouncedSlides = useDebounce(editableSlides, 1000);
  
  useEffect(() => {
    if (debouncedSlides !== editableSlides && editableSlides.length > 0) {
      setIsAutoSaving(true);
      // Simulate auto-save with faster response
      setTimeout(() => {
        setIsAutoSaving(false);
        setLastSaved(new Date());
      }, 200);
    }
  }, [debouncedSlides, editableSlides]);

  // Enhanced handlers with history tracking - moved before useEffect
  const deleteElement = useCallback((id: string) => {
    setEditableSlides(prev => {
      const newSlides = prev.map((slide, idx) => {
        if (idx === currentSlide) {
          return {
            ...slide,
            elements: slide.elements.filter((element: any) => element.id !== id)
          };
        }
        return slide;
      });
      
      addToHistory(newSlides);
      addToast('Element deleted', 'info');
      
      return newSlides;
    });
    setSelectedElement(null);
  }, [currentSlide, addToHistory, addToast]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'a':
            e.preventDefault();
            // Select all elements (future feature)
            break;
          case 'c':
            e.preventDefault();
            if (selectedElement) {
              // Copy element (future feature)
            }
            break;
          case 'v':
            e.preventDefault();
            // Paste element (future feature)
            break;
        }
      } else {
        // Handle non-modifier keys
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            if (selectedElement && !document.activeElement?.tagName.toLowerCase().match(/input|textarea/)) {
              e.preventDefault();
              deleteElement(selectedElement);
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, undo, redo, deleteElement]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Much more responsive
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100, // Faster touch response
        tolerance: 8,
      },
    })
  );

  // Enhanced drag handler with GPU-accelerated animations, grid snapping, and history
  const handleDragEnd = useCallback((event: any) => {
    const { active, delta } = event;
    
    setEditableSlides(prev => {
      const newSlides = prev.map((slide, idx) => {
        if (idx === currentSlide) {
          return {
            ...slide,
            elements: slide.elements.map((element: any) => 
              element.id === active.id 
                ? {
                    ...element,
                    style: {
                      ...element.style,
                      top: snapToGridPosition(Math.max(0, element.style.top + delta.y)),
                      left: snapToGridPosition(Math.max(0, element.style.left + delta.x)),
                    }
                  }
                : element
            )
          };
        }
        return slide;
      });
      
      // Add to history for undo functionality
      addToHistory(newSlides);
      
      return newSlides;
    });
  }, [currentSlide, snapToGridPosition, addToHistory]);

  // Enhanced handlers with history tracking
  const updateElement = useCallback((id: string, updates: any) => {
    setEditableSlides(prev => {
      const newSlides = prev.map((slide, idx) => {
        if (idx === currentSlide) {
          return {
            ...slide,
            elements: slide.elements.map((element: any) => 
              element.id === id ? { ...element, ...updates } : element
            )
          };
        }
        return slide;
      });
      
      // Only add to history for significant changes (not text updates)
      if (updates.style) {
        addToHistory(newSlides);
      }
      
      return newSlides;
    });
  }, [currentSlide, addToHistory]);

  const addTextElement = useCallback(() => {
    // Find a good position for the new element
    const baseTop = 400;
    const baseLeft = 400;
    
    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'Click to edit text',
      style: {
        top: snapToGridPosition(baseTop),
        left: snapToGridPosition(baseLeft),
        width: '200px',
        height: '50px',
        fontSize: '18px',
        fontWeight: 'normal',
        color: '#374151'
      }
    };

    setEditableSlides(prev => {
      const newSlides = prev.map((slide, idx) => {
        if (idx === currentSlide) {
          return {
            ...slide,
            elements: [...slide.elements, newElement]
          };
        }
        return slide;
      });
      
      addToHistory(newSlides);
      addToast('Text element added', 'success');
      
      return newSlides;
    });
    
    setSelectedElement(newElement.id);
  }, [currentSlide, snapToGridPosition, addToHistory, addToast, currentSlideData]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addToast('Image too large. Please select an image under 5MB.', 'error');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        addToast('Please select a valid image file.', 'error');
        return;
      }

      addToast('Uploading image...', 'info');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const newElement = {
          id: `image-${Date.now()}`,
          type: 'image',
          src: e.target?.result as string,
          style: {
            top: snapToGridPosition(200),
            left: snapToGridPosition(500),
            width: '200px',
            height: 'auto'
          }
        };

        setEditableSlides(prev => {
          const newSlides = prev.map((slide, idx) => {
            if (idx === currentSlide) {
              return {
                ...slide,
                elements: [...slide.elements, newElement]
              };
            }
            return slide;
          });
          
          addToHistory(newSlides);
          addToast('Image added successfully', 'success');
          
          return newSlides;
        });
        
        setSelectedElement(newElement.id);
      };
      
      reader.onerror = () => {
        addToast('Failed to load image. Please try again.', 'error');
      };
      
      reader.readAsDataURL(file);
    }
  }, [currentSlide, snapToGridPosition, addToHistory, addToast]);

  const handleSave = useCallback(() => {
    try {
      // Convert back to original slide format while preserving all content
      const updatedSlides = editableSlides.map(slide => {
        // Find title element
        const titleElement = slide.elements.find((el: any) => el.id.startsWith('title-'));
        
        // Find content elements (text elements that aren't title)
        const contentElements = slide.elements
          .filter((el: any) => el.type === 'text' && !el.id.startsWith('title-'))
          .map((el: any) => el.text.replace(/^• /, ''));
        
        // Find image elements
        const imageElements = slide.elements.filter((el: any) => el.type === 'image');
        
        // Find any other custom elements
        const customElements = slide.elements.filter((el: any) => 
          !el.id.startsWith('title-') && 
          !el.id.startsWith('content-') && 
          el.type !== 'image'
        );
        
        // Extract image data for main slide object
        const primaryImage = imageElements.length > 0 ? imageElements[0] : null;
        
        console.log(`Slide ${slide.slideNumber} save data:`, {
          title: titleElement?.text || slide.title,
          contentCount: contentElements.length,
          imageElementsCount: imageElements.length,
          primaryImageSrc: primaryImage?.src ? 'present' : 'none',
          customElementsCount: customElements.length
        });
        
        const savedSlide = {
          ...slide,
          title: titleElement?.text || slide.title,
          content: contentElements.length > 0 ? contentElements : slide.content,
          // Add main image to slide for PDF export compatibility
          imageUrl: primaryImage?.src || slide.imageUrl,
          // Preserve all images and custom elements in the slide data - ALWAYS include these
          imageElements: imageElements.length > 0 ? imageElements : slide.imageElements || [],
          customElements: customElements.length > 0 ? customElements : slide.customElements || [],
          // Keep all elements for future editing - THIS IS CRITICAL
          elements: slide.elements
        };
        
        console.log(`Final saved slide ${slide.slideNumber}:`, {
          hasImageUrl: !!savedSlide.imageUrl,
          imageElementsCount: savedSlide.imageElements?.length || 0,
          customElementsCount: savedSlide.customElements?.length || 0,
          elementsCount: savedSlide.elements?.length || 0
        });
        
        return savedSlide;
      });
      
      console.log('Final updatedSlides being passed to onSave:', updatedSlides);
      onSave(updatedSlides);
      addToast('Presentation saved successfully!', 'success');
      setLastSaved(new Date());
    } catch (error) {
      addToast('Failed to save presentation. Please try again.', 'error');
      console.error('Save error:', error);
    }
  }, [editableSlides, onSave, addToast]);

  const addNewSlide = useCallback(() => {
    const newSlideNumber = editableSlides.length + 1;
    const newSlide = {
      slideNumber: newSlideNumber,
      title: `New Slide ${newSlideNumber}`,
      content: ['Click to edit this content'],
      layout: 'content-slide',
      elements: [
        {
          id: `title-${newSlideNumber}`,
          type: 'text',
          text: `New Slide ${newSlideNumber}`,
          style: {
            top: 80,
            left: 100,
            fontSize: '36px',
            fontWeight: '600',
            color: '#0f766e',
            maxWidth: '600px'
          }
        },
        {
          id: `content-${newSlideNumber}-0`,
          type: 'text',
          text: '• Click to edit this content',
          style: {
            top: 160,
            left: 120,
            fontSize: '20px',
            fontWeight: '400',
            color: '#374151',
            lineHeight: '1.5',
            maxWidth: '600px'
          }
        }
      ]
    };

    setEditableSlides(prev => {
      const newSlides = [...prev, newSlide];
      addToHistory(newSlides);
      return newSlides;
    });
    
    setCurrentSlide(editableSlides.length);
    addToast('New slide added!', 'success');
  }, [editableSlides, addToHistory, addToast]);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiContentType, setAiContentType] = useState('bullet-points');

  const generateAIContent = useCallback(async (userPrompt: string, contentType: string) => {
    if (!currentSlideData) return;
    
    addToast('Generating AI content...', 'info');
    
    try {
      // Get current slide context
      const currentTitle = currentSlideData.elements.find((el: any) => el.id.startsWith('title-'))?.text || 'Untitled Slide';
      const currentContent = currentSlideData.elements
        .filter((el: any) => el.type === 'text' && !el.id.startsWith('title-'))
        .map((el: any) => el.text)
        .join('\n');

      // Create AI prompt based on user input and content type
      let prompt = '';
      switch (contentType) {
        case 'bullet-points':
          prompt = `Generate 3-4 bullet points for a presentation slide with the title "${currentTitle}". 
          Context: ${userPrompt}
          Current content: "${currentContent}"
          
          Please provide concise, professional bullet points that expand on this topic. 
          Each bullet point should be 1-2 lines maximum.
          Return only the bullet points, one per line, without bullet symbols (I'll add them).`;
          break;
        case 'paragraph':
          prompt = `Generate a clear, professional paragraph for a presentation slide with the title "${currentTitle}".
          Context: ${userPrompt}
          
          Write 2-3 sentences that explain this topic clearly for a business presentation.
          Keep it concise and professional.`;
          break;
        case 'call-to-action':
          prompt = `Generate a compelling call-to-action for a presentation slide with the title "${currentTitle}".
          Context: ${userPrompt}
          
          Create 1-2 action-oriented sentences that motivate the audience to take specific steps.
          Make it clear and actionable.`;
          break;
        default:
          prompt = userPrompt;
      }

      // Use the existing AI infrastructure
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          provider: 'openai' // Use OpenAI for content generation
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI content');
      }

      const data = await response.json();
      const aiContent = data.response;

      // Create new elements based on content type
      let newElements = [];
      if (contentType === 'bullet-points') {
        // Parse the AI response into bullet points
        const bulletPoints = aiContent
          .split('\n')
          .filter((line: string) => line.trim())
          .map((line: string) => `• ${line.trim().replace(/^[•\-\*]\s*/, '')}`)
          .slice(0, 4); // Limit to 4 bullet points

        newElements = bulletPoints.map((point: string, index: number) => ({
          id: `ai-content-${Date.now()}-${index}`,
          type: 'text',
          text: point,
          style: {
            top: 250 + (index * 50),
            left: 120,
            width: '600px',
            height: '40px',
            fontSize: '18px',
            fontWeight: '400',
            color: '#374151',
            lineHeight: '1.5',
            maxWidth: '600px'
          }
        }));
      } else {
        // Single text element for paragraph or call-to-action
        newElements = [{
          id: `ai-content-${Date.now()}`,
          type: 'text',
          text: aiContent.trim(),
          style: {
            top: 250,
            left: 120,
            width: '600px',
            height: contentType === 'call-to-action' ? '60px' : '80px',
            fontSize: contentType === 'call-to-action' ? '22px' : '18px',
            fontWeight: contentType === 'call-to-action' ? '600' : '400',
            color: contentType === 'call-to-action' ? '#0f766e' : '#374151',
            lineHeight: '1.5',
            maxWidth: '600px'
          }
        }];
      }

      // Update the slide with new AI content
      setEditableSlides(prev => {
        const newSlides = prev.map((slide, idx) => {
          if (idx === currentSlide) {
            return {
              ...slide,
              elements: [...slide.elements, ...newElements]
            };
          }
          return slide;
        });
        
        addToHistory(newSlides);
        return newSlides;
      });

      addToast(`Added AI-generated ${contentType.replace('-', ' ')}!`, 'success');
      setShowAIModal(false);
      setAiPrompt('');
    } catch (error) {
      console.error('AI generation error:', error);
      addToast('Failed to generate AI content. Please try again.', 'error');
    }
  }, [currentSlideData, currentSlide, addToHistory, addToast]);
  return (
    <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col">
      {/* Mobile-Optimized Editor Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={`text-gray-600 hover:text-gray-800 ${isMobile ? 'min-h-[44px] min-w-[44px] p-2' : ''} touch-manipulation`}
              title="Close editor"
            >
              <ArrowRight className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} rotate-180 ${isMobile ? '' : 'mr-2'}`} />
              {!isMobile && <span>Back</span>}
            </Button>
            {!isMobile && <div className="h-6 w-px bg-gray-300"></div>}
            <h1 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 truncate`}>{presentationTitle}</h1>
            {!isMobile && <Badge className="bg-purple-100 text-purple-800">Editor Mode</Badge>}
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {!isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowToolbar(!showToolbar)}
                className="text-gray-600"
                title="Toggle toolbar"
              >
                {showToolbar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              className={`bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white ${isMobile ? 'min-h-[44px] px-4' : ''} touch-manipulation font-semibold`}
              title="Save changes"
            >
              <Save className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} ${isMobile ? '' : 'mr-2'}`} />
              {!isMobile && <span>Save Changes</span>}
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile/Desktop Toolbar */}
        <AnimatePresence>
          {(showToolbar || isMobile) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`border-t border-gray-200 ${isMobile ? 'p-2' : 'p-3'} bg-gray-50`}
            >
              {isMobile ? (
                /* Mobile Toolbar Layout */
                <div className="space-y-3">
                  {/* Action buttons row */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={addTextElement}
                      className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] touch-manipulation"
                      title="Add text element"
                    >
                      <Type className="h-5 w-5 mr-2" />
                      Add Text
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-green-600 hover:bg-green-700 text-white min-h-[44px] touch-manipulation"
                      title="Add image"
                    >
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Add Image
                    </Button>
                  </div>
                  
                  {/* Controls row */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={undo}
                        disabled={!canUndo}
                        className="bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50 min-h-[44px] min-w-[44px] touch-manipulation"
                        title="Undo"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={redo}
                        disabled={!canRedo}
                        className="bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50 min-h-[44px] min-w-[44px] touch-manipulation"
                        title="Redo"
                      >
                        <RotateCcw className="h-5 w-5 scale-x-[-1]" />
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => setShowGrid(!showGrid)}
                        className={`${showGrid ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'} text-white min-h-[44px] min-w-[44px] touch-manipulation`}
                        title="Toggle grid"
                      >
                        <MousePointer className="h-5 w-5" />
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => {
                          if (window.confirm('Clear all elements from this slide?')) {
                            const updatedSlides = [...editableSlides];
                            updatedSlides[currentSlide] = {
                              ...updatedSlides[currentSlide],
                              elements: updatedSlides[currentSlide].elements.filter(
                                (el: any) => el.id.startsWith('title-') || el.id.startsWith('content-')
                              )
                            };
                            setEditableSlides(updatedSlides);
                            setSelectedElement(null);
                            addToast('All custom elements cleared', 'success');
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white min-h-[44px] min-w-[44px] touch-manipulation"
                        title="Clear all elements"
                      >
                        <Trash className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    {/* Slide navigation */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                        disabled={currentSlide === 0}
                        className="min-h-[44px] min-w-[44px] touch-manipulation"
                        title="Previous slide"
                      >
                        <ArrowRight className="h-5 w-5 rotate-180" />
                      </Button>
                      
                      <span className="text-sm font-medium text-gray-700 px-2">
                        {currentSlide + 1}/{editableSlides.length}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSlide(Math.min(editableSlides.length - 1, currentSlide + 1))}
                        disabled={currentSlide === editableSlides.length - 1}
                        className="min-h-[44px] min-w-[44px] touch-manipulation"
                        title="Next slide"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Simplified Status indicators */}
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Tap to edit • Drag to move</span>
                    <div className="flex items-center space-x-2">
                      {isAutoSaving && (
                        <div className="flex items-center space-x-1 text-blue-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span>Saving...</span>
                        </div>
                      )}
                      <span>Saved: {lastSaved.toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                /* Desktop Toolbar Layout */
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      size="sm"
                      onClick={undo}
                      disabled={!canUndo}
                      className="bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50"
                      title="Undo (Ctrl+Z)"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Undo
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={redo}
                      disabled={!canRedo}
                      className="bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50"
                      title="Redo (Ctrl+Y)"
                    >
                      <RotateCcw className="h-4 w-4 mr-2 scale-x-[-1]" />
                      Redo
                    </Button>
                    
                    <div className="h-6 w-px bg-gray-300"></div>

                    <Button
                      size="sm"
                      onClick={addTextElement}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Type className="h-4 w-4 mr-2" />
                      Add Text
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    <div className="h-6 w-px bg-gray-300"></div>
                    
                    <Button
                      size="sm"
                      onClick={() => setShowGrid(!showGrid)}
                      className={`${showGrid ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
                    >
                      <MousePointer className="h-4 w-4 mr-2" />
                      Grid
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => setSnapToGrid(!snapToGrid)}
                      className={`${snapToGrid ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Snap
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear all elements from this slide?')) {
                          const updatedSlides = [...editableSlides];
                          updatedSlides[currentSlide] = {
                            ...updatedSlides[currentSlide],
                            elements: updatedSlides[currentSlide].elements.filter(
                              (el: any) => el.id.startsWith('title-') || el.id.startsWith('content-')
                            )
                          };
                          setEditableSlides(updatedSlides);
                          setSelectedElement(null);
                          addToast('All custom elements cleared from slide', 'success');
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      title="Clear all custom elements"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                    
                    <div className="h-6 w-px bg-gray-300"></div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Double-click to edit • Drag to move • Right-click for menu</span>
                      
                      {isAutoSaving && (
                        <div className="flex items-center space-x-1 text-blue-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span>Saving...</span>
                        </div>
                      )}
                      <span className="text-xs text-gray-500">
                        Last saved: {lastSaved.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      Slide {currentSlide + 1} of {editableSlides.length}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                      disabled={currentSlide === 0}
                    >
                      <ArrowRight className="h-4 w-4 rotate-180" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSlide(Math.min(editableSlides.length - 1, currentSlide + 1))}
                      disabled={currentSlide === editableSlides.length - 1}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    
                    <div className="h-6 w-px bg-gray-300 mx-2"></div>
                    
                    <Button
                      size="sm"
                      onClick={addNewSlide}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      title="Add new slide"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      New Slide
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => setShowAIModal(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      title="Generate AI content for current slide"
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      AI Generate
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Thumbnails - Mobile optimized with proper scrolling */}
        <div className={`${isMobile ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col`}>
          <div className={`${isMobile ? 'p-2' : 'p-4'} border-b border-gray-100`}>
            <div className="flex items-center justify-between">
              <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-700 ${isMobile ? 'text-center' : ''}`}>
                {isMobile ? 'Slides' : 'Slides'}
              </h3>
              {!isMobile && (
                <Button
                  size="sm"
                  onClick={addNewSlide}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white h-6 w-6 p-0 rounded flex items-center justify-center"
                  title="Add new slide"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {editableSlides.length} slide{editableSlides.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto slide-thumbnails-scroll">
            <div className={`${isMobile ? 'p-2 space-y-2' : 'p-4 space-y-3'} relative slide-container`}>
              {editableSlides.map((slide, index) => (
                <motion.div
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`
                    ${isMobile ? 'p-1' : 'p-3'} rounded-lg border-2 cursor-pointer transition-all duration-200 touch-manipulation
                    ${currentSlide === index 
                      ? 'border-purple-500 bg-purple-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                  whileHover={{ scale: isMobile ? 1.05 : 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  title={`Slide ${slide.slideNumber}: ${slide.elements.find((el: any) => el.id.startsWith('title-'))?.text || slide.title}`}
                >
                  <div className={`aspect-video bg-white border rounded border-gray-200 ${isMobile ? 'mb-1' : 'mb-2'} relative overflow-hidden`}>
                    <div className={`absolute ${isMobile ? 'inset-1' : 'inset-2'} text-xs`}>
                      <div className={`font-semibold text-gray-800 truncate ${isMobile ? 'text-[8px]' : 'text-[10px]'} leading-tight`}>
                        {isMobile 
                          ? slide.slideNumber
                          : (slide.elements.find((el: any) => el.id.startsWith('title-'))?.text || slide.title)
                        }
                      </div>
                      {!isMobile && (
                        <div className="text-gray-500 mt-1 text-[8px]">
                          {slide.elements.filter((el: any) => el.type === 'text' && el.text && el.text.trim()).length} elements
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-medium text-gray-700 ${isMobile ? 'text-center' : ''}`}>
                    {isMobile ? slide.slideNumber : `Slide ${slide.slideNumber}`}
                  </div>
                </motion.div>
              ))}
              
              {/* Add slide button for mobile */}
              {isMobile && (
                <motion.div
                  onClick={addNewSlide}
                  className="p-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-all duration-200 touch-manipulation flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Add new slide"
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Slide Canvas */}
        <div className={`flex-1 bg-gray-200 ${isMobile ? 'p-2' : 'p-8'} overflow-auto`}>
          <div 
            className="mx-auto"
            style={{ 
              width: isMobile ? '100%' : '800px', 
              height: isMobile ? '70vh' : '600px',
              maxWidth: isMobile ? '100%' : '800px'
            }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div 
                ref={canvasRef}
                className={`w-full h-full relative overflow-hidden rounded-lg shadow-xl bg-white ${isMobile ? 'touch-manipulation' : ''}`}
                style={{
                  border: selectedElement ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  touchAction: isMobile ? 'none' : 'auto', // Better mobile touch handling
                }}
                onClick={() => setSelectedElement(null)}
              >
                  {/* Grid Overlay */}
                  {showGrid && (
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-10"
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, #9ca3af 1px, transparent 1px),
                          linear-gradient(to bottom, #9ca3af 1px, transparent 1px)
                        `,
                        backgroundSize: `${gridSize}px ${gridSize}px`
                      }}
                    />
                  )}

                  <SortableContext items={currentSlideData?.elements?.map((el: any) => el.id) || []}>
                    <PresentationErrorBoundary>
                      {currentSlideData?.elements?.map((element: any) => (
                        element.type === 'text' ? (
                          <DraggableText
                            key={element.id}
                            id={element.id}
                            text={element.text}
                            style={element.style}
                            onUpdate={updateElement}
                            onDelete={deleteElement}
                            isSelected={selectedElement === element.id}
                            onSelect={setSelectedElement}
                            isMobile={isMobile}
                          />
                        ) : (
                          <DraggableImage
                            key={element.id}
                            id={element.id}
                            src={element.src}
                            style={element.style}
                            onUpdate={updateElement}
                            onDelete={deleteElement}
                            isSelected={selectedElement === element.id}
                            onSelect={setSelectedElement}
                            isMobile={isMobile}
                          />
                        )
                      ))}
                    </PresentationErrorBoundary>
                  </SortableContext>

                  {/* Enhanced Canvas Guidelines with smooth animations */}
                  <motion.div 
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, ...ANIMATION_CONFIG }}
                  >
                    {/* Center guidelines */}
                    <motion.div 
                      className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"
                      style={{ opacity: selectedElement ? 0.5 : 0.2 }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div 
                      className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-300 to-transparent"
                      style={{ opacity: selectedElement ? 0.5 : 0.2 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Grid overlay */}
                    <AnimatePresence>
                      {showGrid && (
                        <motion.div 
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `
                              linear-gradient(to right, rgba(229, 231, 235, 0.4) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(229, 231, 235, 0.4) 1px, transparent 1px)
                            `,
                            backgroundSize: `${gridSize}px ${gridSize}px`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={ANIMATION_CONFIG}
                        />
                      )}
                    </AnimatePresence>
                    
                    {/* Corner indicators with hover effects */}
                    <div className="absolute top-4 left-4 w-2 h-2 border-l-2 border-t-2 border-gray-300 transition-all duration-200 hover:border-blue-400 hover:scale-125"></div>
                    <div className="absolute top-4 right-4 w-2 h-2 border-r-2 border-t-2 border-gray-300 transition-all duration-200 hover:border-blue-400 hover:scale-125"></div>
                    <div className="absolute bottom-4 left-4 w-2 h-2 border-l-2 border-b-2 border-gray-300 transition-all duration-200 hover:border-blue-400 hover:scale-125"></div>
                    <div className="absolute bottom-4 right-4 w-2 h-2 border-r-2 border-b-2 border-gray-300 transition-all duration-200 hover:border-blue-400 hover:scale-125"></div>
                  </motion.div>
                  
                  {/* Slide transition overlay for smooth slide changes */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={SMOOTH_TRANSITION_CONFIG}
                    />
                  </AnimatePresence>
                </div>
            </DndContext>
          </div>
        </div>
      </div>

      {/* Floating Quick Actions Toolbar */}
      {selectedElement && !isMobile && (
        <motion.div
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[1000]"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-xl flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                className="h-8 w-8 p-0 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                title="Undo"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                className="h-8 w-8 p-0 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                title="Redo"
              >
                <RotateCcw className="h-4 w-4 scale-x-[-1]" />
              </Button>
            </div>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                onClick={addTextElement}
                className="h-8 px-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-xs"
                title="Add Text"
              >
                <Type className="h-4 w-4 mr-1" />
                Text
              </Button>
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 px-3 rounded-full bg-green-500 hover:bg-green-600 text-white text-xs"
                title="Add Image"
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                Image
              </Button>
            </div>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                className={`h-8 w-8 p-0 rounded-full ${showGrid ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-gray-900'}`}
                title="Toggle Grid"
              >
                <MousePointer className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="h-8 px-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
                title="Save"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <motion.div
          className="fixed bottom-6 right-6 z-[1000]"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative">
            <Button
              onClick={() => setShowMobileFAB(!showMobileFAB)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl touch-manipulation"
              size="lg"
              title="Editor actions"
            >
              {showMobileFAB ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            </Button>
            
            <AnimatePresence>
              {showMobileFAB && (
                <motion.div
                  className="absolute bottom-16 right-0 space-y-3"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Button
                    onClick={() => {
                      addTextElement();
                      setShowMobileFAB(false);
                    }}
                    className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg touch-manipulation"
                    title="Add text"
                  >
                    <Type className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowMobileFAB(false);
                    }}
                    className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg touch-manipulation"
                    title="Add image"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    onClick={() => {
                      undo();
                      setShowMobileFAB(false);
                    }}
                    disabled={!canUndo}
                    className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-700 text-white shadow-lg disabled:opacity-50 touch-manipulation"
                    title="Undo"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setShowGrid(!showGrid);
                      setShowMobileFAB(false);
                    }}
                    className={`w-12 h-12 rounded-full ${showGrid ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'} text-white shadow-lg touch-manipulation`}
                    title="Toggle grid"
                  >
                    <MousePointer className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* AI Content Generation Modal */}
      <AnimatePresence>
        {showAIModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4"
            onClick={() => setShowAIModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate AI Content</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={aiContentType}
                    onChange={(e) => setAiContentType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="bullet-points">Bullet Points</option>
                    <option value="paragraph">Paragraph</option>
                    <option value="call-to-action">Call-to-Action</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What should this content be about?
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., Benefits of our new product, Key project milestones, Next steps for the team..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be specific about the topic, audience, or key points you want to cover.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAIModal(false)}
                  className="text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (aiPrompt.trim()) {
                      generateAIContent(aiPrompt, aiContentType);
                    } else {
                      addToast('Please enter what you want to generate', 'error');
                    }
                  }}
                  disabled={!aiPrompt.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Content
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PresentationGenerator = ({ 
  currentRole, 
  inputMessage, 
  setInputMessage, 
  handleSendMessage, 
  isLoading, 
  messages, 
  copyMessage, 
  selectedProvider 
}: any) => {
  const [slideCount, setSlideCount] = useState(5);
  const [presentationTopic, setPresentationTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [includeImages, setIncludeImages] = useState(true);
  const [presentationStyle, setPresentationStyle] = useState('professional');
  const [generatedSlides, setGeneratedSlides] = useState<any[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPresentation, setShowPresentation] = useState(false);
  const [presentationTitle, setPresentationTitle] = useState('');

  const generatePresentation = async () => {
    const prompt = `Create a comprehensive ${slideCount}-slide presentation about "${presentationTopic}" for ${audience} in a ${presentationStyle} style.
    
    As a ${currentRole.name}, structure this presentation to be highly effective for your role's perspective.
    
    IMPORTANT: Return ONLY valid JSON in this EXACT format (no additional text before or after):

    {
      "title": "Presentation Title",
      "slides": [
        {
          "slideNumber": 1,
          "title": "Slide Title",
          "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
          "speakerNotes": "Detailed speaker notes for this slide",
          "imagePrompt": "Detailed description for DALL-E image generation",
          "layout": "title-slide"
        },
        {
          "slideNumber": 2,
          "title": "Another Slide Title",
          "content": ["Point 1", "Point 2", "Point 3"],
          "speakerNotes": "Speaker notes",
          "imagePrompt": "Image description",
          "layout": "content"
        }
      ]
    }
    
    Layout options: "title-slide", "content", "two-column", "image-focus"
    
    Include these slide types:
    1. Title slide with agenda
    2. Content slides with 3-5 bullet points each
    3. Visual/diagram slides
    4. Conclusion with call-to-action
    
    Make imagePrompt descriptions specific, professional, and suitable for business presentations. Each should be different and relevant to the slide content.
    
    Ensure the presentation is engaging, actionable, and tailored to the ${currentRole.name} perspective.
    
    Return ONLY the JSON object, no explanatory text.`;
    
    setInputMessage(prompt);
    await handleSendMessage();
  };

  const generateSlideImages = async (slides: any[]) => {
    if (!includeImages || slides.length === 0) {
      console.log('Image generation skipped - includeImages:', includeImages, 'slides length:', slides.length);
      return slides;
    }
    
    console.log('Starting image generation for', slides.length, 'slides');
    setIsGeneratingImages(true);
    const updatedSlides = [...slides];
    
    for (let i = 0; i < slides.length; i++) {
      setCurrentImageIndex(i + 1);
      const slide = slides[i];
      
      console.log(`Generating image for slide ${i + 1}:`, slide.title);
      
      try {
        const imagePrompt = `Professional business presentation slide: ${slide.imagePrompt}. Modern, clean design with ${presentationStyle} style. High quality, suitable for corporate presentation. 16:9 aspect ratio.`;
        
        console.log('Sending image generation request with prompt:', imagePrompt);
        
        const imageResponse = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: imagePrompt,
            provider: 'openai'
          })
        });
        
        console.log('Image API response status:', imageResponse.status);
        
        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          console.log('Image generated successfully for slide', i + 1, ':', imageData.imageUrl);
          updatedSlides[i] = {
            ...slide,
            imageUrl: imageData.imageUrl
          };
        } else {
          const errorText = await imageResponse.text();
          console.error(`Failed to generate image for slide ${i + 1}:`, imageResponse.status, errorText);
        }
      } catch (error) {
        console.error(`Failed to generate image for slide ${i + 1}:`, error);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsGeneratingImages(false);
    setCurrentImageIndex(0);
    console.log('Image generation completed. Updated slides:', updatedSlides);
    return updatedSlides;
  };

  const exportToPDF = async () => {
    if (generatedSlides.length === 0) return;
    
    // Create a new window with the presentation
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const slideHTML = generatedSlides.map((slide, index) => `
      <div class="slide" style="
        width: 210mm;
        height: 148mm;
        padding: 20mm;
        margin-bottom: 10mm;
        background: white;
        border: 1px solid #ddd;
        page-break-after: always;
        font-family: 'Arial', sans-serif;
        position: relative;
        box-sizing: border-box;
      ">
        <div style="display: flex; height: 100%; ${slide.layout === 'two-column' ? 'flex-direction: row;' : 'flex-direction: column;'}">
          ${slide.layout === 'title-slide' ? `
            <div style="text-align: center; display: flex; flex-direction: column; justify-content: center; height: 100%;">
              <h1 style="font-size: 36px; color: #059669; margin-bottom: 20px;">${slide.title}</h1>
              <div style="font-size: 18px; color: #666;">
                ${slide.content.map((item: string) => `<p style="margin: 10px 0;">${item}</p>`).join('')}
              </div>
            </div>
          ` : `
            <div style="${slide.layout === 'two-column' ? 'flex: 1; padding-right: 20px;' : 'flex: 1;'}">
              <h2 style="font-size: 28px; color: #059669; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">${slide.title}</h2>
              <ul style="font-size: 16px; line-height: 1.6; color: #374151;">
                ${slide.content.map((item: string) => `<li style="margin-bottom: 10px;">${item}</li>`).join('')}
              </ul>
            </div>
            ${slide.imageUrl ? `
              <div style="${slide.layout === 'two-column' ? 'flex: 1;' : 'margin-top: 20px;'} text-align: center;">
                <img src="${slide.imageUrl}" style="max-width: 100%; max-height: ${slide.layout === 'two-column' ? '300px' : '200px'}; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
              </div>
            ` : ''}
          `}
        </div>
        <div style="position: absolute; bottom: 10mm; right: 20mm; font-size: 12px; color: #9ca3af;">
          Slide ${slide.slideNumber} of ${generatedSlides.length}
        </div>
      </div>
    `).join('');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${presentationTitle || presentationTopic} - Presentation</title>
          <style>
            @media print {
              body { margin: 0; }
              .slide { page-break-after: always; }
            }
            body { margin: 0; padding: 20px; background: #f5f5f5; }
          </style>
        </head>
        <body>
          ${slideHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  };

  // Parse generated presentation from AI response
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'ai' && (lastMessage.content.includes('"slides"') || lastMessage.content.includes('"title"'))) {
        try {
          // Try multiple approaches to extract JSON
          let presentationData = null;
          
          // Method 1: Look for complete JSON object with proper braces
          const jsonMatch = lastMessage.content.match(/\{(?:[^{}]|{[^{}]*})*\}/);
          if (jsonMatch) {
            try {
              presentationData = JSON.parse(jsonMatch[0]);
            } catch (e) {
              console.log('Method 1 failed, trying method 2');
            }
          }
          
          // Method 2: Look for JSON between code blocks
          if (!presentationData) {
            const codeBlockMatch = lastMessage.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (codeBlockMatch) {
              try {
                presentationData = JSON.parse(codeBlockMatch[1]);
              } catch (e) {
                console.log('Method 2 failed, trying method 3');
              }
            }
          }
          
          // Method 3: Extract everything between first { and last }
          if (!presentationData) {
            const firstBrace = lastMessage.content.indexOf('{');
            const lastBrace = lastMessage.content.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              try {
                const jsonStr = lastMessage.content.substring(firstBrace, lastBrace + 1);
                presentationData = JSON.parse(jsonStr);
              } catch (e) {
                console.log('Method 3 failed');
              }
            }
          }
          
          // If we successfully parsed the data and it has slides
          if (presentationData && presentationData.slides && Array.isArray(presentationData.slides)) {
            console.log('Successfully parsed presentation data:', presentationData);
            setGeneratedSlides(presentationData.slides);
            setPresentationTitle(presentationData.title || presentationTopic);
            
            // Generate images if requested
            if (includeImages) {
              console.log('Starting image generation for slides...');
              generateSlideImages(presentationData.slides).then((updatedSlides) => {
                console.log('Image generation completed, updating slides:', updatedSlides);
                setGeneratedSlides(updatedSlides);
              }).catch((error) => {
                console.error('Image generation failed:', error);
              });
            }
          } else {
            console.log('No valid presentation data found in response');
          }
        } catch (error) {
          console.error('Failed to parse presentation data:', error);
          console.log('Raw message content:', lastMessage.content);
        }
      }
    }
  }, [messages, includeImages, presentationTopic]);

  // Show presentation view if slides are generated and user wants to present
  if (showPresentation && generatedSlides.length > 0) {
    return (
      <SlidePresentation
        slides={generatedSlides}
        onClose={() => setShowPresentation(false)}
        presentationTitle={presentationTitle}
        onExportPDF={exportToPDF}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
          AI Presentation Generator
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          Generate professional presentations tailored to your {currentRole.name} role
        </p>
      </div>
      
      {/* Mobile-Optimized Form Layout */}
      <div className="space-y-4">
        {/* Step 1: Basic Information */}
        <div className="bg-white rounded-lg p-4 border-2 border-teal-100 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-bold mr-3">1</div>
            <h4 className="font-semibold text-gray-900">Basic Information</h4>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic" className="text-sm font-medium text-gray-700 mb-1 block">
                Presentation Topic *
              </Label>
              <Input
                id="topic"
                value={presentationTopic}
                onChange={(e) => setPresentationTopic(e.target.value)}
                placeholder="Sprint Planning Best Practices"
                className="h-12 text-base text-gray-900 bg-white border-gray-300 placeholder:text-gray-400 focus:border-teal-500 focus:ring-teal-500 px-4"
              />
            </div>
            
            <div>
              <Label htmlFor="audience" className="text-sm font-medium text-gray-700 mb-1 block">
                Target Audience *
              </Label>
              <Input
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Development teams"
                className="h-12 text-base text-gray-900 bg-white border-gray-300 placeholder:text-gray-400 focus:border-teal-500 focus:ring-teal-500 px-4"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Presentation Settings */}
        <div className="bg-white rounded-lg p-4 border-2 border-emerald-100 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mr-3">2</div>
            <h4 className="font-semibold text-gray-900">Presentation Settings</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="slideCount" className="text-sm font-medium text-gray-700 mb-1 block">
                Number of Slides
              </Label>
              <Select value={slideCount.toString()} onValueChange={(value) => setSlideCount(parseInt(value))}>
                <SelectTrigger className="min-h-[48px] text-base text-gray-900 bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 z-50">
                  {[3, 5, 7, 10, 15].map(count => (
                    <SelectItem key={count} value={count.toString()} className="text-gray-900 min-h-[44px] px-4 py-3">
                      {count} slides
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="style" className="text-sm font-medium text-gray-700 mb-1 block">
                Presentation Style
              </Label>
              <Select value={presentationStyle} onValueChange={setPresentationStyle}>
                <SelectTrigger className="min-h-[48px] text-base text-gray-900 bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 z-50">
                  <SelectItem value="professional" className="text-gray-900 min-h-[44px] px-4 py-3">Professional</SelectItem>
                  <SelectItem value="creative" className="text-gray-900 min-h-[44px] px-4 py-3">Creative</SelectItem>
                  <SelectItem value="minimalist" className="text-gray-900 min-h-[44px] px-4 py-3">Minimalist</SelectItem>
                  <SelectItem value="engaging" className="text-gray-900 min-h-[44px] px-4 py-3">Engaging</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Step 3: Additional Options */}
        <div className="bg-white rounded-lg p-4 border-2 border-blue-100 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mr-3">3</div>
            <h4 className="font-semibold text-gray-900">Additional Options</h4>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              id="includeImages"
              checked={includeImages}
              onChange={(e) => setIncludeImages(e.target.checked)}
              className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <Label htmlFor="includeImages" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
              Generate DALL-E images for each slide
            </Label>
          </div>
        </div>
      </div>

      {/* Mobile Scroll Indicator */}
      <div className="block sm:hidden text-center py-3">
        <div className="inline-flex items-center space-x-2 text-gray-500 text-xs">
          <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7" />
          </svg>
          <span>Scroll down to generate</span>
          <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Field Validation Message - Separate Section */}
      {(!presentationTopic || !audience) && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mb-4">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium text-orange-800">
              Please fill in both required fields above to continue
            </span>
          </div>
        </div>
      )}

      {/* Generate Button - Improved Layout */}
      <div className="pt-2 pb-6 sm:pb-0">
        <Button 
          onClick={generatePresentation}
          disabled={!presentationTopic || !audience || isLoading}
          className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-base font-semibold h-14 shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:scale-100 disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-3" />
              Generating Your Presentation...
            </>
          ) : (
            <>
              <Presentation className="h-5 w-5 mr-3" />
              Generate {slideCount}-Slide Presentation
            </>
          )}
        </Button>
        
        {/* Success indicator */}
        {presentationTopic && audience && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center space-x-2 text-green-600 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Ready to generate presentation</span>
            </div>
          </div>
        )}
      </div>

      {/* Existing content continues below... */}
      {/* Results Section */}
      {generatedSlides.length > 0 && (
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full">
          <Button 
            onClick={() => setShowPresentation(true)}
            className="bg-teal-600 hover:bg-teal-700 text-sm sm:text-base min-h-[44px] flex-1"
          >
            <Presentation className="h-4 w-4 mr-2" />
            Present Slides
          </Button>
          <Button 
            onClick={exportToPDF}
            variant="outline"
            className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-sm sm:text-base min-h-[44px] flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      )}
      
      {isGeneratingImages && (
        <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
            <span className="text-sm font-medium text-teal-800">
              Generating images for slide {currentImageIndex} of {slideCount}...
            </span>
          </div>
          <div className="mt-2 w-full bg-teal-100 rounded-full h-2">
            <div 
              className="bg-teal-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentImageIndex / slideCount) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Enhanced Slide Preview - Mobile Optimized */}
      {generatedSlides.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <h3 className="text-lg font-semibold">Presentation Preview</h3>
            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 text-sm">
              {generatedSlides.length} slides ready
            </Badge>
          </div>
          <div className="space-y-4 max-w-full overflow-hidden">
            {generatedSlides.slice(0, 3).map((slide, index) => (
              <Card key={index} className="p-4 border-l-4 border-teal-500 w-full shadow-sm">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-2 space-y-2 sm:space-y-0">
                  <h4 className="font-semibold text-base sm:text-lg break-words">Slide {slide.slideNumber}: {slide.title}</h4>
                  <Badge variant="outline" className="ml-0 sm:ml-2 flex-shrink-0 text-xs sm:text-sm">{slide.layout}</Badge>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <ul className="space-y-1 text-sm">
                      {slide.content.slice(0, 3).map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          <span className="break-words text-xs sm:text-sm">{item}</span>
                        </li>
                      ))}
                      {slide.content.length > 3 && (
                        <li className="text-gray-500 text-xs">...and {slide.content.length - 3} more points</li>
                      )}
                    </ul>
                  </div>
                  {slide.imageUrl && (
                    <div className="text-center">
                      <img 
                        src={slide.imageUrl} 
                        alt={`Slide ${slide.slideNumber}`}
                        className="max-w-full h-24 sm:h-32 object-cover rounded border mx-auto"
                      />
                    </div>
                  )}
                  {!slide.imageUrl && includeImages && (
                    <div className="text-center">
                      <div className="w-full h-24 sm:h-32 bg-gray-100 rounded border flex items-center justify-center">
                        <div className="text-gray-500 text-sm">
                          <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                          Image generating...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {generatedSlides.length > 3 && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm sm:text-base">...and {generatedSlides.length - 3} more slides</p>
                <Button 
                  onClick={() => setShowPresentation(true)}
                  variant="outline"
                  className="mt-2 text-sm sm:text-base"
                >
                  View All Slides
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ScenarioSimulator = ({ 
  currentRole, 
  inputMessage, 
  setInputMessage, 
  handleSendMessage, 
  isLoading, 
  messages, 
  copyMessage, 
  selectedProvider 
}: any) => {
  const [person1Role, setPerson1Role] = useState('Scrum Master');
  const [person2Role, setPerson2Role] = useState('Product Owner');
  const [scenarioContext, setScenarioContext] = useState('');
  const [person1Context, setPerson1Context] = useState('');
  const [person2Context, setPerson2Context] = useState('');

  const startScenario = async () => {
    const prompt = `Create a realistic Agile scenario simulation between a ${person1Role} and a ${person2Role}.
    
    Scenario Context: ${scenarioContext}
    
    ${person1Role} Context: ${person1Context}
    ${person2Role} Context: ${person2Context}
    
    Generate a dialogue with:
    1. Initial situation setup
    2. 3-4 exchanges between both roles
    3. Challenges that arise
    4. Resolution approach
    5. Learning outcomes
    
    Format as a realistic conversation with clear speaker labels and include decision points where the user can choose different paths.`;
    
    setInputMessage(prompt);
    handleSendMessage();
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
          AI Scenario Simulator
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          Practice real-world Agile scenarios with AI-powered role-playing
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <h4 className="font-semibold text-emerald-800 mb-4 text-base sm:text-lg">Person 1</h4>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Role</Label>
              {/* Mobile: Use native select */}
              <div className="block md:hidden relative">
                <select
                  value={person1Role}
                  onChange={(e) => setPerson1Role(e.target.value)}
                  className="w-full min-h-[44px] text-base px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none mt-1"
                >
                  <option value="Scrum Master">Scrum Master</option>
                  <option value="Product Owner">Product Owner</option>
                  <option value="Developer">Developer</option>
                  <option value="Stakeholder">Stakeholder</option>
                  <option value="Team Lead">Team Lead</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none mt-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Desktop: Use Radix UI Select */}
              <div className="hidden md:block">
                <Select value={person1Role} onValueChange={setPerson1Role}>
                  <SelectTrigger className="touch-manipulation min-h-[44px] text-base mt-1 text-gray-900 bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent 
                    className="z-[50] max-h-[300px] overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-lg"
                    position="popper"
                    sideOffset={4}
                    align="start"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                  >
                    <div className="max-h-[250px] overflow-y-auto">
                      <SelectItem value="Scrum Master" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-emerald-50 data-[state=checked]:bg-emerald-100 text-gray-900">Scrum Master</SelectItem>
                      <SelectItem value="Product Owner" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-emerald-50 data-[state=checked]:bg-emerald-100 text-gray-900">Product Owner</SelectItem>
                      <SelectItem value="Developer" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-emerald-50 data-[state=checked]:bg-emerald-100 text-gray-900">Developer</SelectItem>
                      <SelectItem value="Stakeholder" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-emerald-50 data-[state=checked]:bg-emerald-100 text-gray-900">Stakeholder</SelectItem>
                      <SelectItem value="Team Lead" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-emerald-50 data-[state=checked]:bg-emerald-100 text-gray-900">Team Lead</SelectItem>
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Context & Goals</Label>
              <Textarea
                value={person1Context}
                onChange={(e) => setPerson1Context(e.target.value)}
                placeholder="What is this person's perspective, goals, and concerns?"
                className="mt-1 text-sm sm:text-base min-h-[80px] text-gray-900 bg-white border-gray-300 placeholder:text-gray-500"
                rows={3}
              />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <h4 className="font-semibold text-teal-800 mb-4 text-base sm:text-lg">Person 2</h4>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Role</Label>
              {/* Mobile: Use native select */}
              <div className="block md:hidden relative">
                <select
                  value={person2Role}
                  onChange={(e) => setPerson2Role(e.target.value)}
                  className="w-full min-h-[44px] text-base px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none mt-1"
                >
                  <option value="Scrum Master">Scrum Master</option>
                  <option value="Product Owner">Product Owner</option>
                  <option value="Developer">Developer</option>
                  <option value="Stakeholder">Stakeholder</option>
                  <option value="Team Lead">Team Lead</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none mt-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Desktop: Use Radix UI Select */}
              <div className="hidden md:block">
                <Select value={person2Role} onValueChange={setPerson2Role}>
                  <SelectTrigger className="touch-manipulation min-h-[44px] text-base mt-1 text-gray-900 bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent 
                    className="z-[50] max-h-[300px] overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-lg"
                    position="popper"
                    sideOffset={4}
                    align="start"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                  >
                    <div className="max-h-[250px] overflow-y-auto">
                      <SelectItem value="Scrum Master" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-teal-50 data-[state=checked]:bg-teal-100 text-gray-900">Scrum Master</SelectItem>
                      <SelectItem value="Product Owner" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-teal-50 data-[state=checked]:bg-teal-100 text-gray-900">Product Owner</SelectItem>
                      <SelectItem value="Developer" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-teal-50 data-[state=checked]:bg-teal-100 text-gray-900">Developer</SelectItem>
                      <SelectItem value="Stakeholder" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-teal-50 data-[state=checked]:bg-teal-100 text-gray-900">Stakeholder</SelectItem>
                      <SelectItem value="Team Lead" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-teal-50 data-[state=checked]:bg-teal-100 text-gray-900">Team Lead</SelectItem>
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Context & Goals</Label>
              <Textarea
                value={person2Context}
                onChange={(e) => setPerson2Context(e.target.value)}
                placeholder="What is this person's perspective, goals, and concerns?"
                className="mt-1 text-gray-900 bg-white border-gray-300 placeholder:text-gray-500"
                rows={3}
              />
            </div>
          </div>
        </Card>
      </div>

      <div>
        <Label className="text-sm font-medium">Scenario Context</Label>
        <Textarea
          value={scenarioContext}
          onChange={(e) => setScenarioContext(e.target.value)}
          placeholder="Describe the situation, challenge, or meeting context..."
          className="mt-1 text-gray-900 bg-white border-gray-300 placeholder:text-gray-500"
          rows={3}
        />
      </div>

      <Button 
        onClick={startScenario}
        disabled={!scenarioContext || !person1Context || !person2Context || isLoading}
        className="w-full bg-gradient-to-r from-green-600 to-blue-600"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />}
        Start Scenario Simulation
      </Button>
    </div>
  );
};
const RoleBasedAdvisor = ({ 
  currentRole, 
  inputMessage, 
  setInputMessage, 
  handleSendMessage, 
  isLoading, 
  messages, 
  copyMessage, 
  selectedProvider 
}: any) => {
  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [specificSituation, setSpecificSituation] = useState('');

  const challenges = {
    'scrum-master': [
      'Team not following Scrum practices',
      'Stakeholder interference in sprints',
      'Team members missing ceremonies',
      'Difficulty removing impediments',
      'Conflict resolution within team'
    ],
    'product-owner': [
      'Unclear product vision',
      'Stakeholder alignment issues',
      'Backlog prioritization challenges',
      'User story writing difficulties',
      'Managing technical debt'
    ],
    'developer': [
      'Code quality concerns',
      'Sprint commitment issues',
      'Technical debt management',
      'Cross-functional collaboration',
      'Estimation accuracy'
    ],
    'agile-coach': [
      'Organizational resistance to change',
      'Scaling Agile practices',
      'Team maturity assessment',
      'Leadership buy-in',
      'Cultural transformation'
    ]
  };

  const getGuidedAdvice = async () => {
    const prompt = `As an expert ${currentRole.name}, provide guided advice for this situation:
    
    Challenge: ${selectedChallenge}
    Experience Level: ${experienceLevel}
    Specific Situation: ${specificSituation}
    
    Please provide:
    1. Root cause analysis questions to ask
    2. Step-by-step action plan
    3. Potential pitfalls to avoid
    4. Success metrics to track
    5. Follow-up questions for deeper insight
    
    Make this interactive by asking me clarifying questions about my specific context.`;
    
    setInputMessage(prompt);
    handleSendMessage();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Common Challenge</Label>
          {/* Mobile: Use native select */}
          <div className="block md:hidden relative">
            <select
              value={selectedChallenge}
              onChange={(e) => setSelectedChallenge(e.target.value)}
              className="w-full min-h-[44px] text-base px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none mt-1"
            >
              <option value="">Select a challenge...</option>
              {challenges[currentRole.name.toLowerCase().replace(' ', '-') as keyof typeof challenges]?.map((challenge, idx) => (
                <option key={idx} value={challenge}>{challenge}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Desktop: Use Radix UI Select */}
          <div className="hidden md:block">
            <Select value={selectedChallenge} onValueChange={setSelectedChallenge}>
              <SelectTrigger className="touch-manipulation min-h-[44px] text-base">
                <SelectValue placeholder="Select a challenge..." />
              </SelectTrigger>
              <SelectContent 
                className="z-[50] max-h-[300px] overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-lg"
                position="popper"
                sideOffset={4}
                align="start"
                onCloseAutoFocus={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
              >
                <div className="max-h-[250px] overflow-y-auto">
                  {challenges[currentRole.name.toLowerCase().replace(' ', '-') as keyof typeof challenges]?.map((challenge, idx) => (
                    <SelectItem key={idx} value={challenge} className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-orange-50 data-[state=checked]:bg-orange-100">{challenge}</SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Experience Level</Label>
          {/* Mobile: Use native select */}
          <div className="block md:hidden relative">
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full min-h-[44px] text-base px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none mt-1"
            >
              <option value="">Select experience...</option>
              <option value="beginner">Beginner (0-1 years)</option>
              <option value="intermediate">Intermediate (1-3 years)</option>
              <option value="advanced">Advanced (3+ years)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Desktop: Use Radix UI Select */}
          <div className="hidden md:block">
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger className="touch-manipulation min-h-[44px] text-base text-gray-900 bg-white border-gray-300">
                <SelectValue placeholder="Select experience..." />
              </SelectTrigger>
              <SelectContent 
                className="z-[50] max-h-[300px] overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-lg"
                position="popper"
                sideOffset={4}
                align="start"
                onCloseAutoFocus={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
              >
                <div className="max-h-[250px] overflow-y-auto">
                  <SelectItem value="beginner" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-orange-50 data-[state=checked]:bg-orange-100 text-gray-900">Beginner (0-1 years)</SelectItem>
                  <SelectItem value="intermediate" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-orange-50 data-[state=checked]:bg-orange-100 text-gray-900">Intermediate (1-3 years)</SelectItem>
                  <SelectItem value="advanced" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-orange-50 data-[state=checked]:bg-orange-100 text-gray-900">Advanced (3+ years)</SelectItem>
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Describe Your Specific Situation</Label>
        <Textarea
          value={specificSituation}
          onChange={(e) => setSpecificSituation(e.target.value)}
          placeholder="Provide context about your team, organization, and specific challenges..."
          className="mt-1 text-gray-900 bg-white border-gray-300 placeholder:text-gray-500"
          rows={4}
        />
      </div>

      <Button 
        onClick={getGuidedAdvice}
        disabled={!selectedChallenge || !experienceLevel || !specificSituation || isLoading}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
        Get Personalized Advice
      </Button>
    </div>
  );
};

// COMPLETELY SELF-CONTAINED INPUT COMPONENT - MANAGES ITS OWN STATE
const SelfContainedChatInput = React.memo(React.forwardRef<
  HTMLTextAreaElement,
  {
    initialValue?: string;
    onSubmit: (value: string) => void;
    placeholder: string;
    disabled: boolean;
    className?: string;
  }
>(({ initialValue = '', onSubmit, placeholder, disabled, className }, ref) => {
  // Internal state - completely isolated from parent
  const [internalValue, setInternalValue] = React.useState(initialValue);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  // Only update internal value when initialValue changes from parent (like clearing after send)
  React.useEffect(() => {
    if (initialValue !== internalValue && initialValue === '') {
      setInternalValue('');
    }
  }, [initialValue]);

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    setInternalValue(e.target.value);
  }, []);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      if (internalValue.trim()) {
        onSubmit(internalValue.trim());
        setInternalValue(''); // Clear internal state after submit
      }
    }
  }, [internalValue, onSubmit]);

  const handleSubmit = React.useCallback(() => {
    if (internalValue.trim()) {
      onSubmit(internalValue.trim());
      setInternalValue(''); // Clear internal state after submit
    }
  }, [internalValue, onSubmit]);

  // Expose submit function to parent via ref
  React.useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    blur: () => textareaRef.current?.blur(),
    submit: handleSubmit,
    clear: () => setInternalValue(''),
    getValue: () => internalValue,
    hasValue: () => internalValue.trim().length > 0
  } as any), [handleSubmit, internalValue]);

  return (
    <textarea
      ref={textareaRef}
      value={internalValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full resize-none outline-none border border-gray-300 rounded-md p-3 text-sm leading-5 bg-white text-gray-900 min-h-[50px] max-h-[150px] font-sans transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 touch-manipulation"
      autoComplete="off"
      spellCheck="false"
      autoCorrect="off"
      autoCapitalize="off"
      data-self-contained-input="true"
    />
  );
}));

SelfContainedChatInput.displayName = 'SelfContainedChatInput';



export default function SynergizeAgile() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('scrum-master');
  const [selectedMode, setSelectedMode] = useState<string>('scenario');
  const [selectedProvider, setSelectedProvider] = useState<keyof typeof AI_PROVIDERS>('anthropic');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullChatView, setIsFullChatView] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputMessageRef = useRef<HTMLTextAreaElement>(null);
  // Mobile scroll indicator state
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  // Unlimited chat; counters only for potential analytics
  const [responseCount, setResponseCount] = useState(0);
  const [maxResponses, setMaxResponses] = useState<number>(Number.POSITIVE_INFINITY);
  const [userLimits, setUserLimits] = useState({
    maxConversations: Number.POSITIVE_INFINITY,
    currentConversations: 0,
    isSubscribed: true
  });

  // Personalization
  const {
    onboardingData,
    hasCompletedOnboarding,
    showOnboardingModal,
    loading: personalizationLoading,
    completeOnboarding,
    dismissOnboarding,
    getAIContext
  } = usePersonalization();
  // Enable direct deep-linking to full chat via URL params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const modeParam = params.get('mode');
    if (view === 'chat' && !isFullChatView) {
      setIsFullChatView(true);
    }
    // Default to scenario simulator on initial load if no mode specified
    if (!modeParam) {
      setSelectedMode('scenario');
    }
    if (modeParam && ['chat','presentation','scenario','advisor'].includes(modeParam)) {
      setSelectedMode(modeParam);
    }
  }, []);



  // No subscription checks; simply record that we allow unlimited for logged-in users
  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        setUserLimits({ maxConversations: Number.POSITIVE_INFINITY, currentConversations: 0, isSubscribed: !!session?.user });
        setMaxResponses(Number.POSITIVE_INFINITY);
      } catch {
        setMaxResponses(Number.POSITIVE_INFINITY);
      }
    };
    init();
  }, []);

  // Check for mobile device and speech recognition support
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const startVoiceInput = () => {
    if (recognitionRef.current && speechSupported) {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const scrollToBottom = (force = false) => {
    const container = chatContainerRef.current;
    if (!container) {
      // Fallback for main interface
      const scrollContainer = messagesEndRef.current?.closest('.overflow-y-auto');
      if (scrollContainer) {
        // For mobile, always scroll to bottom to mimic ChatGPT behavior
        if (isMobile || force) {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          });
        } else {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
          if (isNearBottom) {
            scrollContainer.scrollTo({
              top: scrollContainer.scrollHeight,
              behavior: 'smooth'
            });
          }
        }
      }
      return;
    }

    // Always scroll to bottom - fix the issue with scrolling to top
    requestAnimationFrame(() => {
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: isMobile || force ? 'smooth' : 'auto'
        });
      }
    });
  };

  // ChatGPT-style auto-scroll: always scroll to bottom on mobile, smart scroll on desktop
  useEffect(() => {
    if (messages.length > 0 && hasInitialized) {
      const lastMessage = messages[messages.length - 1];
      
      // Always scroll when user sends a message
      if (lastMessage.type === 'user') {
        // Multiple timeouts to ensure DOM updates
        setTimeout(() => scrollToBottom(true), 50);
        setTimeout(() => scrollToBottom(true), 200);
      }
      // For AI messages: always scroll to bottom for consistency
      else if (lastMessage.type === 'ai' && lastMessage.id !== 'welcome') {
        // Always scroll to bottom for both mobile and desktop for consistency
        setTimeout(() => scrollToBottom(true), 100);
        setTimeout(() => scrollToBottom(true), 300);
        setTimeout(() => scrollToBottom(true), 600); // Extra timeout for presentations
      }
    }
  }, [messages, hasInitialized]);

  // Initialize with a single welcome message only once
  useEffect(() => {
    if (!hasInitialized) {
      const role = AGILE_ROLES[selectedRole as keyof typeof AGILE_ROLES];
      const mode = INTERACTION_MODES[selectedMode as keyof typeof INTERACTION_MODES];
      
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'ai',
        content: `Hello! I'm your ${role.name} AI assistant in ${mode.name} mode. ${mode.description}. How can I help you with your Agile journey today?`,
        timestamp: new Date(),
        mode: selectedMode,
        role: selectedRole,
        provider: selectedProvider
      };
      
      setMessages([welcomeMessage]);
      setHasInitialized(true);
    }
  }, [hasInitialized, selectedRole, selectedMode, selectedProvider]);

  // Reset chat when role or mode changes (after initialization) - but don't scroll
  useEffect(() => {
    if (hasInitialized) {
      const role = AGILE_ROLES[selectedRole as keyof typeof AGILE_ROLES];
      const mode = INTERACTION_MODES[selectedMode as keyof typeof INTERACTION_MODES];
      
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'ai',
        content: `Hello! I'm your ${role.name} AI assistant in ${mode.name} mode. ${mode.description}. How can I help you with your Agile journey today?`,
        timestamp: new Date(),
        mode: selectedMode,
        role: selectedRole,
        provider: selectedProvider
      };
      
      setMessages([welcomeMessage]);
      // Explicitly prevent any scrolling when changing configurations
    }
  }, [selectedRole, selectedMode, selectedProvider, hasInitialized]);

  // Simplified mobile UI handling - only lock body scroll for full chat view
  useEffect(() => {
    if (isMobile && isFullChatView) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
      
      return () => {
        // Restore body scroll and position
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isFullChatView, isMobile]);

  // Check if there are more messages below (mobile scroll indicator) - with throttling
  useEffect(() => {
    if (!isMobile || !chatContainerRef.current) return;

    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const container = chatContainerRef.current;
          if (!container) return;
          
          const { scrollTop, scrollHeight, clientHeight } = container;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 150; // Increased threshold
          setShowScrollIndicator(!isNearBottom && messages.length > 2);
          ticking = false;
        });
        ticking = true;
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Check initial state
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isMobile, messages.length]);

  const handleSendMessage = async (messageContent?: string) => {
    const messageToSend = messageContent || inputMessage;
    if (!messageToSend.trim() && files.length === 0) return;

    // Require sign-in to use chat
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = `/login?redirect=${encodeURIComponent('/synergize?view=chat')}`;
        return;
      }
    } catch {}

    // Switch to full chat view after first message
    if (!isFullChatView) {
      setIsFullChatView(true);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date(),
      mode: selectedMode,
      role: selectedRole,
      provider: selectedProvider
    };

    setMessages(prev => [...prev, userMessage]);
    // Clear the parent inputMessage state to sync with self-contained input
    setInputMessage('');
    setIsLoading(true);

    try {
      const role = AGILE_ROLES[selectedRole as keyof typeof AGILE_ROLES];
      const mode = INTERACTION_MODES[selectedMode as keyof typeof INTERACTION_MODES];
      const provider = AI_PROVIDERS[selectedProvider];

      // Enhanced prompt based on role and mode with personalization
      const personalizationContext = getAIContext();
      let systemPrompt = `You are an expert Agile AI assistant specialized in ${role.name} responsibilities. 
      Current mode: ${mode.name} - ${mode.description}
      
      Role context: ${role.description}
      Key capabilities: ${role.capabilities.join(', ')}
      
      ${personalizationContext}
      
      Based on the user's role as ${role.name} and the current mode (${mode.name}), provide specific, actionable advice.
      
      Important guidelines:
      - Keep responses clear and actionable
      - Use bullet points for complex information
      - Provide practical examples when helpful
      - If asked about technical topics outside your expertise, politely redirect to your core areas
      - Be encouraging and supportive while maintaining professionalism
      ${personalizationContext ? '- Use the user profile context to personalize your advice and examples' : ''}`;

      if (selectedMode === 'presentation') {
        systemPrompt += ` Generate presentation content with clear slides, talking points, and visual suggestions.`;
      } else if (selectedMode === 'scenario') {
        systemPrompt += ` Create realistic scenarios with challenges, decision points, and learning outcomes.`;
      } else if (selectedMode === 'advisor') {
        systemPrompt += ` Provide personalized advice with specific actions, best practices, and potential pitfalls to avoid.`;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: messageToSend }
          ],
          provider: selectedProvider,
          attachments: files.map(file => ({
            name: file.name,
            type: file.type,
            size: file.size
          }))
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response Error:', response.status, errorText);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.content && !data.response) {
        console.error('Invalid API response:', data);
        throw new Error('Invalid response format from API');
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.content || data.response,
        timestamp: new Date(),
        mode: selectedMode,
        role: selectedRole,
        provider: selectedProvider
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Increment response count (no limits enforced)
      setResponseCount(prev => prev + 1);
      
    } catch (error) {
      console.error('Chat Error:', error);
      
      let errorContent = 'I apologize, but I encountered an issue. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorContent = isMobile 
            ? 'Connection issue. Please check your network and try again.'
            : 'Unable to connect to the AI service. Please check your internet connection and try again.';
        } else if (error.message.includes('API request failed')) {
          errorContent = isMobile
            ? `${selectedProvider} service unavailable. Try switching providers or try again later.`
            : `There was an issue with the ${selectedProvider} service. Please try switching to a different AI provider or try again later.`;
        } else if (error.message.includes('Invalid response format')) {
          errorContent = isMobile
            ? 'Received an unexpected response. Please try again.'
            : 'Received an unexpected response from the AI service. Please try again or contact support if the issue persists.';
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: errorContent,
        timestamp: new Date(),
        mode: selectedMode,
        role: selectedRole,
        provider: selectedProvider
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setFiles([]); // Clear files after sending
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const clearChat = () => {
    setMessages([]);
    setFiles([]);
    setHasInitialized(false);
  };

  const updateMessage = useCallback((messageId: string, newContent: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: newContent }
        : msg
    ));
  }, []);

  // Handle URL parameters for transcript data from record meeting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const transcript = urlParams.get('transcript');
      const title = urlParams.get('title');
      const type = urlParams.get('type');
      const mode = urlParams.get('mode') || 'advisor'; // Default to advisor if no mode specified
      
      if (transcript) {
        console.log('Transcript URL parameters detected:', { transcript: transcript.length, title, type, mode });
        
        // Auto-switch to full chat view and set the appropriate mode
        setIsFullChatView(true);
        setSelectedMode('advisor');
        
        let prompt = '';
        
        if (mode === 'presentation') {
          // Create presentation generation prompt
          prompt = `🎯 **PRESENTATION CREATION REQUEST**

I need you to create a professional presentation from this meeting transcript. You MUST respond with a valid JSON object that can be parsed and displayed as slides.

**Meeting Details:**
- Title: ${title || 'Meeting Recording'}
- Type: ${type || 'team-meeting'}

**Meeting Transcript:**
${transcript}

**IMPORTANT: Please respond with ONLY the JSON object in this exact format:**

{
  "title": "Presentation Title Based on Meeting",
  "subtitle": "Brief description of the meeting outcome",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Meeting Overview",
      "layout": "title-slide",
      "content": ["Meeting title", "Date and participants", "Key objectives"]
    },
    {
      "slideNumber": 2,
      "title": "Agenda",
      "layout": "content",
      "content": ["Topic 1", "Topic 2", "Topic 3"]
    },
    {
      "slideNumber": 3,
      "title": "Key Discussion Points",
      "layout": "content", 
      "content": ["Main discussion point 1", "Main discussion point 2", "Main discussion point 3"]
    },
    {
      "slideNumber": 4,
      "title": "Decisions Made",
      "layout": "content",
      "content": ["Decision 1", "Decision 2", "Decision 3"]
    },
    {
      "slideNumber": 5,
      "title": "Action Items",
      "layout": "content",
      "content": ["Action item 1 - Owner", "Action item 2 - Owner", "Action item 3 - Owner"]
    },
    {
      "slideNumber": 6,
      "title": "Next Steps",
      "layout": "content",
      "content": ["Next step 1", "Next step 2", "Follow-up meeting date"]
    }
  ]
}
Create 6-8 slides total based on the meeting content. Focus on the most important information that would be valuable for stakeholders. Make sure all content is professional and well-structured.
DO NOT include any additional text, explanations, or markdown formatting - respond with ONLY the JSON object.`;
        }

        // Clear messages first to start fresh
        setMessages([]);
        
        // Store the prompt to send after component is fully loaded
        const sendPrompt = async () => {
          console.log(`Sending ${mode} creation prompt...`);
          console.log('Selected mode set to advisor');
          console.log('Prompt preview:', prompt.substring(0, 200) + '...');
          console.log('Full chat view active:', isFullChatView);
          
          // Call handleSendMessage directly with the prompt
          const messageToSend = prompt;
          if (!messageToSend.trim()) return;

          // Create user message
          const userMessage = {
            id: Date.now().toString(),
            type: 'user' as const,
            content: messageToSend,
            timestamp: new Date(),
            mode: 'advisor',
            role: selectedRole,
            provider: selectedProvider
          };

          setMessages(prev => [...prev, userMessage]);
          setIsLoading(true);

          try {
            const role = AGILE_ROLES[selectedRole as keyof typeof AGILE_ROLES];
            const currentMode = INTERACTION_MODES['advisor' as keyof typeof INTERACTION_MODES];
            const provider = AI_PROVIDERS[selectedProvider];

            // Enhanced prompt based on role and mode
            let systemPrompt = `You are an expert Agile AI assistant specialized in ${role.name} responsibilities. 
            Current mode: ${currentMode.name} - ${currentMode.description}
            
            Role context: ${role.description}
            Key capabilities: ${role.capabilities.join(', ')}
            
            Based on the user's role as ${role.name} and the current mode (${currentMode.name}), provide specific, actionable advice.
            
            Important guidelines:
            - Keep responses clear and actionable
            - Use bullet points for complex information
            - Provide practical examples when helpful
            - If asked about technical topics outside your expertise, politely redirect to your core areas
            - Be encouraging and supportive while maintaining professionalism`;

            if (false) {
              systemPrompt += ` Generate presentation content with clear slides, talking points, and visual suggestions.`;
            } else {
              systemPrompt += ` Provide personalized advice with specific actions, best practices, and potential pitfalls to avoid.`;
            }

            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: messageToSend }
                ],
                provider: selectedProvider
              }),
            });

            if (!response.ok) {
              throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            
            const aiMessage = {
              id: (Date.now() + 1).toString(),
              type: 'ai' as const,
              content: data.content || data.response,
              timestamp: new Date(),
              mode: 'advisor',
              role: selectedRole,
              provider: selectedProvider
            };

            setMessages(prev => [...prev, aiMessage]);
            
          } catch (error) {
            console.error('Chat Error:', error);
            
            const errorMessage = {
              id: (Date.now() + 1).toString(),
              type: 'ai' as const,
              content: 'I apologize, but I encountered an issue processing your meeting transcript. Please try again.',
              timestamp: new Date(),
              mode: 'advisor',
              role: selectedRole,
              provider: selectedProvider
            };
            setMessages(prev => [...prev, errorMessage]);
          } finally {
            setIsLoading(false);
          }
        };
        
        // Automatically send the request with a delay to ensure everything is loaded
        const timer = setTimeout(sendPrompt, 2000);
        
        // Clear the URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        return () => clearTimeout(timer);
      }
    }
  }, []); // Remove handleSendMessage dependency

  // Type-safe handler for provider selection with scroll prevention
  const handleProviderChange = useCallback((value: string) => {
    if (value === 'anthropic' || value === 'openai' || value === 'google') {
      // Prevent any scrolling during provider change
      const currentScrollPosition = window.pageYOffset;
      setSelectedProvider(value);
      // Restore scroll position after state update
      setTimeout(() => {
        window.scrollTo(0, currentScrollPosition);
      }, 0);
    }
  }, []);

  // Role change handler with scroll prevention
  const handleRoleChange = useCallback((value: string) => {
    const currentScrollPosition = window.pageYOffset;
    setSelectedRole(value);
    setTimeout(() => {
      window.scrollTo(0, currentScrollPosition);
    }, 0);
  }, []);

  // Mode change handler with scroll prevention
  const handleModeChange = useCallback((value: string) => {
    const currentScrollPosition = window.pageYOffset;
    setSelectedMode(value);
    setTimeout(() => {
      window.scrollTo(0, currentScrollPosition);
    }, 0);
  }, []);

  // Stable input change handler to prevent focus loss
  const handleInputChange = useCallback((value: string) => {
    setInputMessage(value);
  }, []);

  // Stable key down handler to prevent focus loss
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Stable placeholder and className to prevent re-renders
  const stablePlaceholder = useMemo(() => {
    return isMobile ? "Ask your AI assistant..." : "Ask your assistant anything...";
  }, [isMobile]);

  const stableMainPlaceholder = useMemo(() => {
    return selectedMode === 'scenario'
      ? (isMobile ? "Describe a scenario to simulate..." : "Describe the scenario you want to simulate...")
      : (isMobile ? "Ask your AI assistant..." : "Ask your assistant anything about Agile...");
  }, [isMobile, selectedMode]);

  const stableClassName = useMemo(() => {
    return `min-h-[50px] max-h-[150px] resize-none pr-12 text-gray-900 bg-white border-gray-300 placeholder:text-gray-500`;
  }, []);

  const stableMainClassName = useMemo(() => {
    return `min-h-[48px] max-h-[120px] resize-none pr-12 text-gray-900 bg-white border-gray-300 placeholder:text-gray-500 ${isMobile ? 'text-base touch-manipulation' : ''}`;
  }, [isMobile]);

  const stableDisabled = useMemo(() => responseCount >= maxResponses, [responseCount]);

  const currentRole = AGILE_ROLES[selectedRole as keyof typeof AGILE_ROLES];
  const currentMode = INTERACTION_MODES[selectedMode as keyof typeof INTERACTION_MODES];
  const currentProvider = AI_PROVIDERS[selectedProvider];

  // Enhanced Presentation Display Component for Chat Messages
  const PresentationDisplay = ({ messageContent, messageId, onUpdateMessage }: { messageContent: string; messageId?: string; onUpdateMessage?: (id: string, newContent: string) => void }) => {
    const [parsedPresentation, setParsedPresentation] = useState<any>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showFullPresentation, setShowFullPresentation] = useState(false);
    const [showEditablePresentation, setShowEditablePresentation] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
      try {
        console.log('PresentationDisplay: Attempting to parse message content');
        console.log('Content preview:', messageContent.substring(0, 200));
        
        // Try multiple approaches to extract JSON
        let presentationData = null;
        
        // Method 1: Look for complete JSON object with proper braces (improved regex)
        const jsonMatch = messageContent.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          try {
            presentationData = JSON.parse(jsonMatch[0]);
            console.log('Method 1 succeeded - found JSON object');
          } catch (e) {
            console.log('Method 1 failed, trying method 2', e);
          }
        }
        
        // Method 2: Look for JSON between code blocks
        if (!presentationData) {
          const codeBlockMatch = messageContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
          if (codeBlockMatch) {
            try {
              presentationData = JSON.parse(codeBlockMatch[1]);
              console.log('Method 2 succeeded - found JSON in code block');
            } catch (e) {
              console.log('Method 2 failed, trying method 3', e);
            }
          }
        }
        
        // Method 3: Extract everything between first { and last } (more robust)
        if (!presentationData) {
          const firstBrace = messageContent.indexOf('{');
          const lastBrace = messageContent.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            try {
              const jsonStr = messageContent.substring(firstBrace, lastBrace + 1);
              presentationData = JSON.parse(jsonStr);
              console.log('Method 3 succeeded - extracted JSON from braces');
            } catch (e) {
              console.log('Method 3 failed', e);
            }
          }
        }
        
        // Method 4: Try to clean up the content and parse again
        if (!presentationData) {
          try {
            // Remove any markdown formatting and try again
            const cleaned = messageContent
              .replace(/```json\s*/g, '')
              .replace(/```\s*/g, '')
              .replace(/^\s*\*\*[^*]+\*\*\s*/gm, '') // Remove markdown headers
              .trim();
            
            const cleanedMatch = cleaned.match(/\{[\s\S]*\}/);
            if (cleanedMatch) {
              presentationData = JSON.parse(cleanedMatch[0]);
              console.log('Method 4 succeeded - cleaned and parsed JSON');
            }
          } catch (e) {
            console.log('Method 4 failed', e);
          }
        }
        
        if (presentationData && presentationData.slides && Array.isArray(presentationData.slides)) {
          console.log('Successfully parsed presentation with', presentationData.slides.length, 'slides');
          setParsedPresentation(presentationData);
        } else {
          console.log('No valid presentation data found or missing slides array');
          if (presentationData) {
            console.log('Presentation data structure:', Object.keys(presentationData));
          }
        }
      } catch (error) {
        console.error('Failed to parse presentation:', error);
      }
    }, [messageContent]);

    const handleSlideChange = (direction: 'next' | 'prev') => {
      if (isAnimating) return;
      setIsAnimating(true);
      
      if (direction === 'next' && currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else if (direction === 'prev' && currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      }
      
      setTimeout(() => setIsAnimating(false), 300);
    };

    if (!parsedPresentation) {
      return (
        <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
              <Presentation className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-orange-800">
                Presentation Processing...
              </p>
              <p className="text-xs text-orange-600">
                Generated content couldn't be parsed. Please try again.
              </p>
            </div>
          </div>
        </div>
      );
    }

    const slides = parsedPresentation.slides || [];
    const currentSlideData = slides[currentSlide];

    if (showEditablePresentation) {
      return (
        <PresentationErrorBoundary>
          <CleanSlideEditor
            slides={slides}
            onClose={() => setShowEditablePresentation(false)}
            presentationTitle={parsedPresentation.title}
            onSave={(updatedSlides) => {
              console.log('PresentationDisplay onSave called with updatedSlides:', updatedSlides);
              
              // Update the presentation data locally
              const updatedPresentation = {
                ...parsedPresentation,
                slides: updatedSlides
              };
              
              console.log('Updated presentation object:', updatedPresentation);
              setParsedPresentation(updatedPresentation);
              
              // Persist changes back to the original message content
              if (messageId && onUpdateMessage) {
                const updatedContent = `**${updatedPresentation.title}**\n\n\`\`\`json\n${JSON.stringify(updatedPresentation, null, 2)}\n\`\`\``;
                console.log('Updating message content for message ID:', messageId);
                console.log('New message content length:', updatedContent.length);
                onUpdateMessage(messageId, updatedContent);
              } else {
                console.warn('Cannot persist changes - missing messageId or onUpdateMessage');
              }
              
              setShowEditablePresentation(false);
            }}
          />
        </PresentationErrorBoundary>
      );
    }

    if (showFullPresentation) {
      return (
        <SlidePresentation
          slides={slides}
          onClose={() => setShowFullPresentation(false)}
          presentationTitle={parsedPresentation.title}
          onExportPDF={() => {
            // Export PDF functionality here
            console.log('Export PDF functionality would go here');
          }}
        />
      );
    }
    return (
      <div className="bg-white rounded-2xl border-2 border-teal-200 shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl hover:scale-[1.01]">
        {/* Enhanced Header with Animation */}
        <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 text-white p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Presentation className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white leading-tight">
                      {parsedPresentation.title}
                    </h4>
                    <p className="text-teal-100 text-sm font-medium">
                      Professional Presentation
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
                    <span className="text-teal-100">{slides.length} slides</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse delay-100"></div>
                    <span className="text-teal-100">Interactive</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1 font-medium">
                  Slide {currentSlide + 1}
                </Badge>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-white to-emerald-200 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Enhanced Slide Preview with Animation */}
        {currentSlideData && (
          <div className="p-6">
            {/* Modern Slide Content Area */}
            <div className={`relative rounded-xl border-2 border-gray-100 mb-6 min-h-[320px] overflow-hidden transition-all duration-300 ${isAnimating ? 'opacity-50 transform translate-x-2' : 'opacity-100 transform translate-x-0'}`}
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
                `
              }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-200/30 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-200/30 to-transparent rounded-full transform -translate-x-12 translate-y-12"></div>
              </div>
              
              <div className="relative z-10 p-6">
                {/* Modern Slide Header */}
                {currentSlideData.layout === 'title-slide' ? (
                  <div className="text-center py-8">
                    <div className="inline-block">
                      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-lg mb-6">
                        <h5 className="text-3xl font-bold leading-tight">
                          {currentSlideData.title}
                        </h5>
                      </div>
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-md border border-teal-100">
                        <div className="space-y-3">
                          {currentSlideData.content?.slice(0, 3).map((item: string, idx: number) => (
                            <div key={idx} className="text-lg text-gray-700 font-medium">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Content Slide Header */}
                    <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl p-4 mb-6 shadow-lg">
                      <h5 className="text-2xl font-bold leading-tight">
                        {currentSlideData.title}
                      </h5>
                      <div className="flex items-center space-x-3 mt-2">
                        <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
                          {currentSlideData.layout || 'Standard'}
                        </Badge>
                        <span className="text-teal-100 text-sm">
                          Slide {currentSlideData.slideNumber}
                        </span>
                      </div>
                    </div>
                    
                    {/* Modern Content Display */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100">
                      <div className="space-y-4">
                        {currentSlideData.content?.slice(0, 4).map((item: string, idx: number) => (
                          <div key={idx} className="flex items-start group">
                            <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg mt-1 mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">▶</span>
                            </div>
                            <span className="text-base text-gray-800 leading-relaxed font-medium flex-1">
                              {item}
                            </span>
                          </div>
                        ))}
                        
                        {currentSlideData.content?.length > 4 && (
                          <div className="ml-10 mt-4">
                            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 px-4 py-2 rounded-lg inline-block">
                              <span className="text-sm text-teal-700 font-medium">
                                +{currentSlideData.content.length - 4} more points in presentation
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
                
                {/* Speaker Notes Preview */}
                {currentSlideData.speakerNotes && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h6 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Speaker Notes
                    </h6>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      {currentSlideData.speakerNotes.substring(0, 120)}
                      {currentSlideData.speakerNotes.length > 120 && '...'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
              {/* Navigation Controls */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSlideChange('prev')}
                  disabled={currentSlide === 0 || isAnimating}
                  className="border-2 border-teal-300 text-teal-700 hover:bg-teal-50 disabled:opacity-50 transition-all duration-200 hover:scale-105 px-4 py-2"
                >
                  <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
                  Previous
                </Button>
                
                {/* Slide Indicators */}
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-100 rounded-xl">
                  <span className="text-sm font-bold text-gray-700">
                    {currentSlide + 1} / {slides.length}
                  </span>
                  <div className="flex space-x-1.5">
                    {slides.slice(0, 8).map((_slide: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => !isAnimating && setCurrentSlide(index)}
                        disabled={isAnimating}
                        className={`w-3 h-3 rounded-full transition-all duration-200 hover:scale-125 ${
                          currentSlide === index 
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-lg scale-125' 
                            : 'bg-gray-300 hover:bg-teal-300'
                        }`}
                      />
                    ))}
                    {slides.length > 8 && (
                      <span className="text-xs text-gray-400 ml-2">+{slides.length - 8}</span>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSlideChange('next')}
                  disabled={currentSlide === slides.length - 1 || isAnimating}
                  className="border-2 border-teal-300 text-teal-700 hover:bg-teal-50 disabled:opacity-50 transition-all duration-200 hover:scale-105 px-4 py-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Button
                size="sm"
                onClick={() => setShowFullPresentation(true)}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 py-3"
              >
                <Presentation className="h-4 w-4 mr-2" />
                Present Mode
              </Button>
              
              <Button
                size="sm"
                onClick={() => setShowEditablePresentation(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 py-3"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Slides
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // PDF Export functionality
                  const exportToPDF = () => {
                    const slides = parsedPresentation.slides || [];
                    if (slides.length === 0) return;
                    
                    // Create a new window with the presentation
                    const printWindow = window.open('', '_blank');
                    if (!printWindow) return;
                    
                    const slideHTML = slides.map((slide: any, index: number) => {
                      console.log(`Generating PDF for slide ${index + 1}:`, {
                        hasElements: !!(slide.elements && slide.elements.length > 0),
                        elementsCount: slide.elements?.length || 0,
                        hasImageUrl: !!slide.imageUrl,
                        hasImageElements: !!(slide.imageElements && slide.imageElements.length > 0),
                        imageElementsCount: slide.imageElements?.length || 0
                      });
                      
                      // Check if we have custom elements (from editor)
                      const hasCustomElements = slide.elements && slide.elements.length > 0;
                      
                      if (hasCustomElements) {
                        // Generate PDF using custom element positioning
                        const textElements = slide.elements.filter((el: any) => el.type === 'text');
                        const imageElements = slide.elements.filter((el: any) => el.type === 'image');
                        
                        const elementsHTML = [
                          ...textElements.map((el: any) => `
                            <div style="
                              position: absolute;
                              top: ${(el.style?.top || 0) * 0.75}px;
                              left: ${(el.style?.left || 0) * 0.75}px;
                              font-size: ${el.style?.fontSize || '16px'};
                              font-weight: ${el.style?.fontWeight || 'normal'};
                              color: ${el.style?.color || '#000000'};
                              max-width: 400px;
                              word-wrap: break-word;
                            ">
                              ${el.text || ''}
                            </div>
                          `),
                          ...imageElements.map((el: any) => `
                            <img 
                              src="${el.src || ''}" 
                              style="
                                position: absolute;
                                top: ${(el.style?.top || 0) * 0.75}px;
                                left: ${(el.style?.left || 0) * 0.75}px;
                                width: ${el.style?.width || '200px'};
                                height: ${el.style?.height || 'auto'};
                                max-width: 300px;
                                max-height: 200px;
                                object-fit: contain;
                                border-radius: 8px;
                                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                              " 
                            />
                          `)
                        ].join('');
                        
                        return `
                          <div class="slide" style="
                            width: 210mm;
                            height: 148mm;
                            padding: 20mm;
                            margin-bottom: 10mm;
                            background: white;
                            border: 1px solid #ddd;
                            page-break-after: always;
                            font-family: 'Arial', sans-serif;
                            position: relative;
                            box-sizing: border-box;
                          ">
                            <div style="position: relative; width: 100%; height: 100%;">
                              ${elementsHTML}
                            </div>
                            <div style="position: absolute; bottom: 10mm; right: 20mm; font-size: 12px; color: #9ca3af;">
                              Slide ${slide.slideNumber || index + 1} of ${slides.length}
                            </div>
                          </div>
                        `;
                      } else {
                        // Use traditional layout for non-custom slides
                        return `
                          <div class="slide" style="
                            width: 210mm;
                            height: 148mm;
                            padding: 20mm;
                            margin-bottom: 10mm;
                            background: white;
                            border: 1px solid #ddd;
                            page-break-after: always;
                            font-family: 'Arial', sans-serif;
                            position: relative;
                            box-sizing: border-box;
                          ">
                            <div style="display: flex; height: 100%; ${slide.layout === 'two-column' ? 'flex-direction: row;' : 'flex-direction: column;'}">
                              ${slide.layout === 'title-slide' ? `
                                <div style="text-align: center; display: flex; flex-direction: column; justify-content: center; height: 100%;">
                                  <h1 style="font-size: 36px; color: #059669; margin-bottom: 20px;">${slide.title}</h1>
                                  <div style="font-size: 18px; color: #666;">
                                    ${slide.content.map((item: string) => `<p style="margin: 10px 0;">${item}</p>`).join('')}
                                  </div>
                                </div>
                              ` : `
                                <div style="${slide.layout === 'two-column' ? 'flex: 1; padding-right: 20px;' : 'flex: 1;'}">
                                  <h2 style="font-size: 28px; color: #059669; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">${slide.title}</h2>
                                  <ul style="font-size: 16px; line-height: 1.6; color: #374151;">
                                    ${slide.content.map((item: string) => `<li style="margin-bottom: 10px;">${item}</li>`).join('')}
                                  </ul>
                                </div>
                                ${slide.imageUrl || (slide.imageElements && slide.imageElements.length > 0) ? `
                                  <div style="${slide.layout === 'two-column' ? 'flex: 1;' : 'margin-top: 20px;'} text-align: center;">
                                    <img src="${slide.imageUrl || (slide.imageElements && slide.imageElements[0] ? slide.imageElements[0].src : '')}" 
                                         style="max-width: 100%; max-height: ${slide.layout === 'two-column' ? '300px' : '250px'}; 
                                                border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); 
                                                border: 2px solid rgba(255,255,255,0.8);" 
                                         alt="Slide ${slide.slideNumber} Image" />
                                    ${slide.imageElements && slide.imageElements.length > 1 ? `
                                      <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                                        ${slide.imageElements.slice(1, 4).map((img: any) => `
                                          <img src="${img.src}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" alt="Additional image" />
                                        `).join('')}
                                        ${slide.imageElements.length > 4 ? `<div style="font-size: 12px; color: #666; align-self: center;">+${slide.imageElements.length - 4} more</div>` : ''}
                                      </div>
                                    ` : ''}
                                  </div>
                                ` : ''}
                              `}
                            </div>
                            <div style="position: absolute; bottom: 10mm; right: 20mm; font-size: 12px; color: #9ca3af;">
                              Slide ${slide.slideNumber || index + 1} of ${slides.length}
                            </div>
                          </div>
                        `;
                      }
                    }).join('');
                    
                    printWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <title>${parsedPresentation.title} - Presentation</title>
                          <style>
                            @media print {
                              body { margin: 0; }
                              .slide { page-break-after: always; }
                            }
                            body { margin: 0; padding: 20px; background: #f5f5f5; }
                          </style>
                        </head>
                        <body>
                          ${slideHTML}
                        </body>
                      </html>
                    `);
                    
                    printWindow.document.close();
                    printWindow.focus();
                    
                    // Trigger print dialog
                    setTimeout(() => {
                      printWindow.print();
                    }, 1000);
                  };
                  
                  exportToPDF();
                }}
                className="border-2 border-cyan-300 text-cyan-700 hover:bg-cyan-50 font-semibold transition-all duration-200 hover:scale-105 py-3"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // JSON Export functionality
                  const exportData = {
                    ...parsedPresentation,
                    exportedAt: new Date().toISOString(),
                    version: '1.0'
                  };
                  
                  // Create downloadable file
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                    type: 'application/json'
                  });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${parsedPresentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold transition-all duration-200 hover:scale-105 py-3"
              >
                <Copy className="h-4 w-4 mr-2" />
                Save JSON
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };
  // Full Chat View Component
  const FullChatView = () => (
    <div className="h-[90vh] md:h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-30 w-80 h-full bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 ease-in-out`} data-sidebar-container="true">
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/" className="hover:opacity-80 transition-opacity">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 hover:text-teal-600 transition-colors">Synergies4</h2>
                </Link>
                <h3 className="text-base font-medium text-gray-700">AI Assistant</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-1">{currentMode.description}</p>
          </div>

          {/* Controls */}
          <div 
            className="flex-1 p-6 space-y-6 overflow-y-auto overscroll-contain"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
              touchAction: 'manipulation'
            }}
          >
            {/* Role Selection */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Your Role</Label>
              
              {/* Mobile: Use native select */}
              <div className="block md:hidden relative">
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full min-h-[44px] text-base px-4 py-3 bg-teal-600 border border-teal-500 text-white rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 appearance-none pr-10 font-medium"
                  style={{
                    color: 'white',
                    backgroundColor: '#0d9488',
                    borderColor: '#14b8a6'
                  }}
                >
                  {Object.entries(AGILE_ROLES).map(([key, role]) => (
                    <option 
                      key={key} 
                      value={key} 
                      className="bg-teal-600 text-black font-medium"
                      style={{ 
                        backgroundColor: '#0d9488', 
                        color: '#000000'
                      }}
                    >
                      {role.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Desktop: Use Radix UI Select */}
              <div className="hidden md:block">
                <Select value={selectedRole} onValueChange={handleRoleChange}>
                  <SelectTrigger className="w-full bg-teal-600 border-teal-500 text-white focus:border-teal-400 focus:ring-teal-400 hover:bg-teal-700 [&>svg]:text-white">
                    <SelectValue className="text-white" />
                  </SelectTrigger>
                  <SelectContent className="bg-teal-600 border border-teal-500 shadow-lg z-50">
                    {Object.entries(AGILE_ROLES).map(([key, role]) => (
                      <SelectItem key={key} value={key} className="text-white hover:bg-teal-700 focus:bg-teal-700 data-[highlighted]:bg-teal-700 data-[state=checked]:bg-teal-800">
                        <div className="flex items-center">
                          <span className="mr-2 text-white">{role.icon}</span>
                          <span className="text-white">{role.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">{currentRole.description}</p>
            </div>

            {/* Mode Selection */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Interaction Mode</Label>
              
              {/* Mobile: Use native select */}
              <div className="block md:hidden relative">
                <select
                  value={selectedMode}
                  onChange={(e) => handleModeChange(e.target.value)}
                  className="w-full min-h-[44px] text-base px-4 py-3 bg-emerald-600 border border-emerald-500 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 appearance-none pr-10 font-medium"
                  style={{
                    color: 'white',
                    backgroundColor: '#059669',
                    borderColor: '#10b981'
                  }}
                >
                  {Object.entries(INTERACTION_MODES).map(([key, mode]) => (
                    <option 
                      key={key} 
                      value={key} 
                      className="bg-emerald-600 text-black font-medium"
                      style={{ 
                        backgroundColor: '#059669', 
                        color: '#000000'
                      }}
                    >
                      {mode.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Desktop: Use Radix UI Select */}
              <div className="hidden md:block">
                <Select value={selectedMode} onValueChange={handleModeChange}>
                  <SelectTrigger className="w-full bg-emerald-600 border-emerald-500 text-white focus:border-emerald-400 focus:ring-emerald-400 hover:bg-emerald-700 [&>svg]:text-white">
                    <SelectValue className="text-white" />
                  </SelectTrigger>
                  <SelectContent className="bg-emerald-600 border border-emerald-500 shadow-lg z-50">
                    {Object.entries(INTERACTION_MODES).map(([key, mode]) => (
                      <SelectItem key={key} value={key} className="text-white hover:bg-emerald-700 focus:bg-emerald-700 data-[highlighted]:bg-emerald-700 data-[state=checked]:bg-emerald-800">
                        <div className="flex items-center">
                          <span className="mr-2 text-white">{mode.icon}</span>
                          <span className="text-white">{mode.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* AI Provider */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">AI Provider</Label>
              
              {/* Mobile: Use native select */}
              <div className="block md:hidden relative">
                <select
                  value={selectedProvider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full min-h-[44px] text-base px-4 py-3 bg-teal-600 border border-teal-500 text-white rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 appearance-none pr-10 font-medium"
                  style={{
                    color: 'white',
                    backgroundColor: '#0d9488',
                    borderColor: '#14b8a6'
                  }}
                >
                  {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                    <option 
                      key={key} 
                      value={key} 
                      className="bg-teal-600 text-black font-medium"
                      style={{ 
                        backgroundColor: '#0d9488', 
                        color: '#000000'
                      }}
                    >
                      {provider.name} ({provider.badge})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Desktop: Use Radix UI Select */}
              <div className="hidden md:block">
                <Select value={selectedProvider} onValueChange={handleProviderChange}>
                  <SelectTrigger className="w-full bg-teal-600 border-teal-500 text-white focus:border-teal-400 focus:ring-teal-400 hover:bg-teal-700 [&>svg]:text-white">
                    <SelectValue className="text-white" />
                  </SelectTrigger>
                  <SelectContent className="bg-teal-600 border border-teal-500 shadow-lg z-50">
                    {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                      <SelectItem key={key} value={key} className="text-white hover:bg-teal-700 focus:bg-teal-700 data-[highlighted]:bg-teal-700 data-[state=checked]:bg-teal-800">
                        <div className="flex items-center">
                          <span className="mr-2 text-white">{provider.icon}</span>
                          <span className="text-white">{provider.name}</span>
                          <span className="ml-auto text-xs text-teal-100">({provider.badge})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  className="w-full justify-start bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Chat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullChatView(false)}
                  className="w-full justify-start bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  Back to Setup
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden touch-manipulation"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSidebarOpen(false);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSidebarOpen(false);
          }}
        />
      )}

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col min-h-0 relative`}>
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${currentRole.color} flex items-center justify-center text-white`}>
                {currentRole.icon}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {currentRole.name} Assistant
                </h1>
                <p className="text-sm text-gray-500">{currentMode.name}</p>
              </div>
            </div>
            
            <Badge className={currentProvider.badgeColor}>
              {currentProvider.badge}
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <div 
          className={`flex-1 overflow-y-auto p-6 space-y-6 overscroll-contain ${isMobile ? 'pb-32' : ''}`}
          ref={chatContainerRef}
          data-chat-container="true"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            touchAction: 'manipulation'
          }}
        >
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${currentRole.color} flex items-center justify-center mx-auto mb-4`}>
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Welcome to your {currentRole.name} Assistant
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                I'm here to help you with {currentMode.description.toLowerCase()}. How can I assist you today?
              </p>
              {isMobile && (
                <div className="mt-4 text-xs text-gray-500 bg-gray-100 rounded-lg p-3 mx-auto max-w-xs">
                  💡 Swipe up and down in this area to scroll through messages
                </div>
              )}
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-teal-600 text-white' : 'bg-white border'} rounded-2xl p-4 shadow-sm`}>
                <div className="flex items-start space-x-3">
                  {message.type === 'ai' && (
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${currentRole.color} flex items-center justify-center flex-shrink-0`}>
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {/* Check if message contains presentation JSON */}
                    {message.type === 'ai' && (
                      (message.content.includes('"slides"') && message.content.includes('"slideNumber"')) ||
                      (message.content.includes('"slides"') && message.content.includes('"title"')) ||
                      (message.content.includes('{') && message.content.includes('"slides":') && message.content.includes('[')) ||
                      (message.content.includes('slideNumber') && message.content.includes('content')) ||
                      (message.content.match(/\{\s*"title"[\s\S]*"slides"[\s\S]*\[/))
                    ) ? (
                      <div className="space-y-4">
                        <p className="text-sm text-green-600 font-medium">
                          ✅ Presentation generated successfully!
                        </p>
                        <PresentationDisplay 
                          messageContent={message.content} 
                          messageId={message.id}
                          onUpdateMessage={updateMessage}
                        />
                      </div>
                    ) : (
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${message.type === 'user' ? 'text-white' : 'text-gray-900'}`}>
                        {message.content}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs ${message.type === 'user' ? 'text-teal-100' : 'text-gray-500'}`}>
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.type === 'ai' && message.provider && (
                          <Badge className={`text-xs ${AI_PROVIDERS[message.provider].badgeColor} border-0`}>
                            {AI_PROVIDERS[message.provider].icon}
                            <span className="ml-1">{AI_PROVIDERS[message.provider].badge}</span>
                          </Badge>
                        )}
                      </div>
                      {message.type === 'ai' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMessage(message.content)}
                          className="h-6 w-6 p-0 hover:bg-gray-100"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border rounded-2xl p-4 shadow-sm max-w-[80%]">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${currentRole.color} flex items-center justify-center`}>
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Mobile Scroll Indicator */}
        {isMobile && showScrollIndicator && (
          <div className="fixed bottom-28 right-4 z-40">
            <Button
              variant="default"
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-full shadow-lg touch-manipulation min-h-[48px] min-w-[48px]"
              onClick={() => {
                if (chatContainerRef.current) {
                  chatContainerRef.current.scrollTo({
                    top: chatContainerRef.current.scrollHeight,
                    behavior: 'smooth'
                  });
                }
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </Button>
          </div>
        )}

        {/* Input Area */}
        <div className={`bg-white border-t border-gray-200 p-4`}>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {files.map((file, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded-lg p-2 border border-gray-300">
                  <FileText className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700 truncate max-w-[150px]">
                    {file.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0 ml-2 hover:bg-gray-200"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Specialized Mode Input - Only show for non-chat modes */}
          {selectedMode !== 'chat' && (
            <div className="mb-12 p-8 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {selectedMode === 'presentation' && ''}
                {selectedMode === 'scenario' && 'Scenario Simulator'}
                {selectedMode === 'advisor' && 'Role-Based Advisor'}
              </h3>
              
              {selectedMode === 'scenario' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Person 1 Configuration */}
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <h4 className="font-semibold text-emerald-800 mb-3">Person 1</h4>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Role</Label>
                          <select className="mt-1 w-full min-h-[40px] text-sm px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                            <option value="Scrum Master">Scrum Master</option>
                            <option value="Product Owner">Product Owner</option>
                            <option value="Developer">Developer</option>
                            <option value="Stakeholder">Stakeholder</option>
                            <option value="Team Lead">Team Lead</option>
                            <option value="Agile Coach">Agile Coach</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Context & Goals</Label>
                          <Textarea
                            placeholder="What is this person's perspective, goals, and concerns?"
                            className="mt-1 text-sm bg-white border-gray-300 text-gray-900"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Person 2 Configuration */}
                    <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                      <h4 className="font-semibold text-teal-800 mb-3">Person 2</h4>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Role</Label>
                          <select className="mt-1 w-full min-h-[40px] text-sm px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="Product Owner">Product Owner</option>
                            <option value="Scrum Master">Scrum Master</option>
                            <option value="Developer">Developer</option>
                            <option value="Stakeholder">Stakeholder</option>
                            <option value="Team Lead">Team Lead</option>
                            <option value="Agile Coach">Agile Coach</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Context & Goals</Label>
                          <Textarea
                            placeholder="What is this person's perspective, goals, and concerns?"
                            className="mt-1 text-sm bg-white border-gray-300 text-gray-900"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scenario Context */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Scenario Context</Label>
                    <Textarea
                      placeholder="Describe the situation, challenge, or meeting context that these two people will navigate together..."
                      className="mt-1 bg-white border-gray-300 text-gray-900"
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={() => {
                      const person1Role = document.querySelector('select:nth-of-type(1)') as HTMLSelectElement;
                      const person1Context = document.querySelector('textarea:nth-of-type(1)') as HTMLTextAreaElement;
                      const person2Role = document.querySelector('select:nth-of-type(2)') as HTMLSelectElement;
                      const person2Context = document.querySelector('textarea:nth-of-type(2)') as HTMLTextAreaElement;
                      const scenarioContext = document.querySelector('textarea:nth-of-type(3)') as HTMLTextAreaElement;
                      
                      if (person1Context?.value && person2Context?.value && scenarioContext?.value) {
                        const prompt = `Create a realistic Agile scenario simulation between a ${person1Role.value} and a ${person2Role.value}.
Scenario Context: ${scenarioContext.value}
${person1Role.value} Context: ${person1Context.value}
${person2Role.value} Context: ${person2Context.value}
Generate a dialogue with:
1. Initial situation setup
2. 3-4 exchanges between both roles
3. Challenges that arise
4. Resolution approach
5. Learning outcomes

Format as a realistic conversation with clear speaker labels and include decision points where I can choose different paths.`;
                        
                        setInputMessage(prompt);
                        handleSendMessage();
                      }
                    }}
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start Scenario Simulation
                  </Button>
                </div>
              )}
              
              {selectedMode === 'advisor' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Challenge or Question</Label>
                    <Textarea
                      placeholder="Describe your challenge or ask a question..."
                      className="mt-1 bg-white border-gray-300 text-gray-900"
                      rows={3}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          const question = (e.target as HTMLTextAreaElement).value;
                          setInputMessage(question);
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                      if (textarea?.value) {
                        setInputMessage(textarea.value);
                        handleSendMessage();
                      }
                    }}
                    disabled={isLoading}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Get Advice
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className={`flex items-end space-x-2 ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className={`flex-shrink-0 bg-white border-gray-300 text-gray-900 hover:bg-gray-50 ${isMobile ? 'min-h-[48px] min-w-[48px] p-0' : ''}`}
              disabled={false}
            >
              <Upload className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
            </Button>

            {speechSupported && (
              <Button
                variant="outline"
                size="sm"
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                className={`flex-shrink-0 ${isListening ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'} ${isMobile ? 'min-h-[48px] min-w-[48px] p-0' : ''}`}
                disabled={false}
              >
                {isListening ? 
                  <MicOff className={`animate-pulse ${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} /> : 
                  <Mic className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                }
              </Button>
            )}

            <div className="flex-1 relative">
              <SelfContainedChatInput
                initialValue={inputMessage}
                onSubmit={handleSendMessage}
                placeholder={stablePlaceholder}
                disabled={stableDisabled}
                className={stableClassName}
                ref={inputMessageRef}
              />
            </div>

            <Button
              onClick={() => {
                // Use the input ref to submit if available, otherwise fallback to handleSendMessage
                if (inputMessageRef.current && (inputMessageRef.current as any).hasValue?.()) {
                  (inputMessageRef.current as any).submit?.();
                } else if (files.length > 0) {
                  handleSendMessage('');
                }
              }}
              disabled={isLoading}
              className={`flex-shrink-0 ${isMobile ? 'min-h-[48px] px-4' : 'min-h-[50px] px-6'} bg-gradient-to-r ${currentRole.color} hover:opacity-90 transition-opacity touch-manipulation`}
            >
              {isLoading ? (
                <Loader2 className={`animate-spin ${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
              ) : (
                <Send className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
              )}
            </Button>
          </div>


        </div>
      </div>
    </div>
  );

  if (isFullChatView) {
    return <FullChatView />;
  }

  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        badge={{
          icon: <Zap className="w-4 h-4" />,
          text: "Agile Training AI"
        }}
        title="Master Agile with"
        highlightText="AI-Powered Learning"
        description="Your personalized Agile training assistant. Get role-specific guidance, generate presentations, simulate scenarios, and accelerate your Scrum mastery with AI."
        primaryCTA={{
          text: "Start Using Our Scenario Simulator",
          href: "#agile-assistant"
        }}
        secondaryCTA={{
          text: "Learn More",
          href: "#features",
          icon: <ArrowRight className="w-4 h-4" />
        }}
        backgroundVariant="gradient"
        customColors={{
          background: "bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50",
          accent: "bg-gradient-to-br from-cyan-400/20 to-teal-400/25",
          particles: "bg-gradient-to-r from-cyan-400 to-teal-400"
        }}
      />

      {/* Meeting Recording feature temporarily disabled */}

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-slate-50 via-gray-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-200">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Comprehensive Agile Training Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From micro-learning activities to complex scenario simulations, master every aspect of Agile methodology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {Object.entries(INTERACTION_MODES).map(([key, mode]) => (
              <Card key={key} className="text-center hover:shadow-xl transition-all duration-300 group border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:scale-105">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600 group-hover:scale-110 transition-transform duration-300">
                    {mode.icon}
                  </div>
                  <CardTitle className="text-xl text-gray-900 group-hover:text-teal-600 transition-colors">
                    {mode.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {mode.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Agile Roles Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">
              <Users className="w-4 h-4 mr-2" />
              Role-Based Training
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Specialized Training for Every Agile Role
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get personalized guidance based on your specific role in the Agile ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(AGILE_ROLES).map(([key, role]) => (
              <Card key={key} className="text-center hover:shadow-xl transition-all duration-300 group border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:scale-105">
                <CardHeader>
                  <div className={`w-16 h-16 bg-gradient-to-br ${role.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform duration-300`}>
                    {role.icon}
                  </div>
                  <CardTitle className="text-xl text-gray-900 group-hover:text-teal-600 transition-colors">
                    {role.name}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    {role.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {role.capabilities.map((capability, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0" />
                        <span>{capability}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Interface */}
      <section id="agile-assistant" className="py-6 md:py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto min-h-[95vh] md:min-h-[100vh] flex flex-col">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                AI Assistant
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Get instant answers to your Agile questions with personalized, role-specific guidance
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-visible">
              {/* Role Selection */}
              <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-center text-lg">Select Your Agile Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Mobile: Use native select */}
                    <div className="block md:hidden relative">
                      <select
                        value={selectedRole}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="w-full min-h-[44px] text-base px-4 py-3 bg-teal-600 border border-teal-500 text-white rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 appearance-none pr-10"
                      >
                        {Object.entries(AGILE_ROLES).map(([key, role]) => (
                          <option key={key} value={key} className="bg-teal-600 text-white">
                            {role.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Desktop: Use Radix UI Select */}
                    <div className="hidden md:block">
                      <Select value={selectedRole} onValueChange={handleRoleChange}>
                        <SelectTrigger className="w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent touch-manipulation min-h-[44px] text-base text-gray-900 bg-white border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent 
                          className="z-[50] max-h-[300px] overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-lg"
                          position="popper"
                          sideOffset={4}
                          align="start"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                          onEscapeKeyDown={(e) => e.preventDefault()}
                        >
                          <div className="max-h-[250px] overflow-y-auto">
                            {Object.entries(AGILE_ROLES).map(([key, role]) => (
                              <SelectItem 
                                key={key} 
                                value={key} 
                                className="focus:bg-teal-50 cursor-pointer min-h-[44px] px-4 py-3 data-[highlighted]:bg-teal-50 data-[state=checked]:bg-teal-100 text-gray-900"
                              >
                                <div className="flex items-center w-full">
                                  <span className="flex-shrink-0">{role.icon}</span>
                                  <span className="ml-2 flex-1 text-left">{role.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <p className="text-sm text-gray-600">{currentRole.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Mode Selection */}
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-center text-lg">Choose Interaction Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Mobile: Use native select */}
                    <div className="block md:hidden relative">
                      <select
                        value={selectedMode}
                        onChange={(e) => handleModeChange(e.target.value)}
                        className="w-full min-h-[44px] text-base px-4 py-3 bg-emerald-600 border border-emerald-500 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 appearance-none pr-10"
                      >
                        {Object.entries(INTERACTION_MODES).map(([key, mode]) => (
                          <option key={key} value={key} className="bg-emerald-600 text-white">
                            {mode.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Desktop: Use Radix UI Select */}
                    <div className="hidden md:block">
                      <Select value={selectedMode} onValueChange={handleModeChange}>
                        <SelectTrigger className="w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent touch-manipulation min-h-[44px] text-base text-gray-900 bg-white border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent 
                          className="z-[50] max-h-[300px] overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-lg"
                          position="popper"
                          sideOffset={4}
                          align="start"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                          onEscapeKeyDown={(e) => e.preventDefault()}
                        >
                          <div className="max-h-[250px] overflow-y-auto">
                            {Object.entries(INTERACTION_MODES).map(([key, mode]) => (
                              <SelectItem 
                                key={key} 
                                value={key} 
                                className="focus:bg-teal-50 cursor-pointer min-h-[44px] px-4 py-3 data-[highlighted]:bg-teal-50 data-[state=checked]:bg-teal-100 text-gray-900"
                              >
                                <div className="flex items-center w-full">
                                  <span className="flex-shrink-0">{mode.icon}</span>
                                  <span className="ml-2 flex-1 text-left">{mode.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <p className="text-sm text-gray-600">{currentMode.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* AI Provider Selection */}
              <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-center text-lg">Select AI Provider</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Mobile: Use native select */}
                    <div className="block md:hidden relative">
                      <select
                        value={selectedProvider}
                        onChange={(e) => handleProviderChange(e.target.value)}
                        className="w-full min-h-[44px] text-base px-4 py-3 bg-teal-600 border border-teal-500 text-white rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 appearance-none pr-10"
                      >
                        {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                          <option key={key} value={key} className="bg-teal-600 text-white">
                            {provider.name} ({provider.badge})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Desktop: Use Radix UI Select */}
                    <div className="hidden md:block">
                      <Select value={selectedProvider} onValueChange={handleProviderChange}>
                        <SelectTrigger className="w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent touch-manipulation min-h-[44px] text-base text-gray-900 bg-white border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent 
                          className="z-[50] max-h-[300px] overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-lg"
                          position="popper"
                          sideOffset={4}
                          align="start"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                          onEscapeKeyDown={(e) => e.preventDefault()}
                        >
                          <div className="max-h-[250px] overflow-y-auto">
                            {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                              <SelectItem 
                                key={key} 
                                value={key} 
                                className="focus:bg-teal-50 cursor-pointer min-h-[44px] px-4 py-3 data-[highlighted]:bg-teal-50 data-[state=checked]:bg-teal-100 text-gray-900"
                              >
                                <div className="flex items-center w-full">
                                  <span className="flex-shrink-0">{provider.icon}</span>
                                  <span className="ml-2 flex-1 text-left">{provider.name}</span>
                                  <span className="ml-1 text-xs text-gray-500 flex-shrink-0">({provider.badge})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <p className="text-sm text-gray-600">Powered by {currentProvider.badge}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Mobile-First Chat Interface */}
            <div className="mt-6">
              <Card className={`flex flex-col border-0 shadow-xl relative`}>
                <CardHeader className={`bg-gradient-to-r ${currentRole.color} text-white rounded-t-lg flex-shrink-0 ${isMobile ? 'p-4' : 'p-6'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`${isMobile ? 'w-8 h-8' : 'w-6 h-6'} flex items-center justify-center`}>
                        {currentRole.icon}
                      </div>
                      <div>
                        <CardTitle className={`${isMobile ? 'text-xl' : 'text-lg'} font-bold`}>{currentRole.name} Assistant</CardTitle>
                        <p className={`${isMobile ? 'text-base' : 'text-sm'} opacity-90`}>{currentMode.name}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearChat}
                      className={`text-white hover:bg-white/20 ${isMobile ? 'min-h-[44px] min-w-[44px]' : ''} touch-manipulation`}
                      title="Clear chat"
                    >
                      <Trash2 className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                  {/* Messages area only for Chat mode */}
                  {selectedMode === 'chat' && (
                    <div 
                      className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'} space-y-4 bg-gray-50 min-h-0 overscroll-contain`}
                      data-chat-container="true"
                      style={{
                        WebkitOverflowScrolling: 'touch',
                        scrollBehavior: 'smooth',
                        touchAction: 'pan-y pinch-zoom',
                        overscrollBehavior: 'contain'
                      }}
                    >
                      {messages.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className={`w-16 h-16 bg-gradient-to-r ${currentRole.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                              <Bot className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {currentRole.name} Assistant
                            </h3>
                            <p className="text-gray-600 max-w-sm">
                              Ready to help with {currentMode.description.toLowerCase()}. Start by typing your question below.
                            </p>
                          </div>
                        </div>
                      )}
                      {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} ${isMobile ? 'px-1' : ''}`}>
                          <div className={`${isMobile ? 'max-w-[85%]' : 'max-w-[80%]'} rounded-lg ${isMobile ? 'p-3' : 'p-4'} break-words shadow-sm ${message.type === 'user' ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white' : 'bg-white border border-gray-200'}`}>
                            <div className="flex items-start space-x-3">
                              {message.type === 'ai' && (
                                <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${currentRole.color} flex items-center justify-center flex-shrink-0 mt-1`}>
                                  <Bot className="h-3 w-3 text-white" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                {message.type === 'ai' && message.content.includes('"slides"') && message.content.includes('"slideNumber"') && (message.content.includes('"title"') || message.content.includes('"layout"')) ? (
                                  <div className="space-y-4">
                                    <p className="text-sm text-green-600 font-medium">✅ Presentation generated successfully!</p>
                                    <PresentationDisplay messageContent={message.content} messageId={message.id} onUpdateMessage={updateMessage} />
                                  </div>
                                ) : (
                                  <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${message.type === 'user' ? 'text-white' : 'text-gray-900'}`}>{message.content}</p>
                                )}
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-xs ${message.type === 'user' ? 'text-teal-100' : 'text-gray-500'}`}>{message.timestamp.toLocaleTimeString()}</span>
                                    {message.type === 'ai' && message.provider && (
                                      <Badge className={`text-xs ${AI_PROVIDERS[message.provider].badgeColor} border-0`}>
                                        {AI_PROVIDERS[message.provider].icon}
                                        <span className="ml-1">{AI_PROVIDERS[message.provider].badge}</span>
                                      </Badge>
                                    )}
                                  </div>
                                  {message.type === 'ai' && (
                                    <Button variant="ghost" size="sm" onClick={() => copyMessage(message.content)} className="h-6 w-6 p-0 hover:bg-gray-100 flex-shrink-0">
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white border shadow-sm rounded-lg p-4 max-w-[80%]">
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${currentRole.color} flex items-center justify-center`}>
                                <Bot className="h-3 w-3 text-white" />
                              </div>
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}

                  {/* Specialized Mode Interface */}
                  <div className="border-t bg-white p-4 relative">
                    {selectedMode === 'presentation' && (
                      <PresentationGenerator
                        currentRole={currentRole}
                        inputMessage={inputMessage}
                        setInputMessage={setInputMessage}
                        handleSendMessage={handleSendMessage}
                        isLoading={isLoading}
                        messages={messages}
                        copyMessage={copyMessage}
                        selectedProvider={selectedProvider}
                      />
                    )}
                    

                    {selectedMode === 'scenario' && (
                      <ScenarioSimulator
                        currentRole={currentRole}
                        inputMessage={inputMessage}
                        setInputMessage={setInputMessage}
                        handleSendMessage={handleSendMessage}
                        isLoading={isLoading}
                        messages={messages}
                        copyMessage={copyMessage}
                        selectedProvider={selectedProvider}
                      />
                    )}
                    
                    {selectedMode === 'advisor' && (
                      <RoleBasedAdvisor
                        currentRole={currentRole}
                        inputMessage={inputMessage}
                        setInputMessage={setInputMessage}
                        handleSendMessage={handleSendMessage}
                        isLoading={isLoading}
                        messages={messages}
                        copyMessage={copyMessage}
                        selectedProvider={selectedProvider}
                      />
                    )}
                    

                    {selectedMode === 'chat' && (
                      <div className="space-y-4">
                        {/* File Upload Area for Chat Mode */}
                        {files.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {files.map((file, index) => (
                              <div key={index} className="flex items-center bg-gray-100 rounded-lg p-2 border">
                                <FileText className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-700 truncate max-w-[150px]">
                                  {file.name}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="h-6 w-6 p-0 ml-2 hover:bg-gray-100"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Enhanced Mobile Chat Input */}
                        <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'space-x-2'}`}>
                          {/* Mobile: Action buttons row */}
                          {isMobile && (
                            <div className="flex space-x-2 justify-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 min-h-[48px] touch-manipulation bg-white border-gray-300 hover:bg-gray-50"
                                title="Upload file"
                                disabled={false}
                              >
                                <Upload className="h-5 w-5 mr-2" />
                                <span className="text-sm font-medium">Upload</span>
                              </Button>
                              
                              {speechSupported && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                                  className={`flex-1 min-h-[48px] touch-manipulation ${
                                    isListening ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-gray-300 hover:bg-gray-50'
                                  }`}
                                  title={isListening ? "Stop voice input" : "Start voice input"}
                                  disabled={false}
                                >
                                  {isListening ? 
                                    <MicOff className="animate-pulse h-5 w-5 mr-2" /> : 
                                    <Mic className="h-5 w-5 mr-2" />
                                  }
                                  <span className="text-sm font-medium">
                                    {isListening ? 'Stop' : 'Voice'}
                                  </span>
                                </Button>
                              )}
                            </div>
                          )}
                          
                          {/* Desktop: Inline buttons */}
                          {!isMobile && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-shrink-0 min-h-[44px] min-w-[44px] touch-manipulation"
                                title="Upload file"
                                disabled={false}
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                              
                              {speechSupported && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                                  className={`flex-shrink-0 min-h-[44px] min-w-[44px] touch-manipulation ${
                                    isListening ? 'bg-red-50 border-red-300 text-red-600' : ''
                                  }`}
                                  title={isListening ? "Stop voice input" : "Start voice input"}
                                  disabled={false}
                                >
                                  {isListening ? 
                                    <MicOff className="animate-pulse h-4 w-4" /> : 
                                    <Mic className="h-4 w-4" />
                                  }
                                </Button>
                              )}
                            </>
                          )}
                          
                          {/* Input area with send button */}
                          <div className={`flex ${isMobile ? 'space-x-2' : 'flex-1'} relative`}>
                            <div className="flex-1 relative">
                              <SelfContainedChatInput
                                initialValue={inputMessage}
                                onSubmit={handleSendMessage}
                                placeholder={stableMainPlaceholder}
                                disabled={stableDisabled}
                                className={`${stableMainClassName} ${isMobile ? 'min-h-[52px] text-base' : ''}`}
                                ref={inputMessageRef}
                              />
                              
                              {/* Voice feedback indicator */}
                              {isListening && (
                                <div className={`absolute ${isMobile ? 'top-4 right-4' : 'top-2 right-14'} flex items-center space-x-1 text-red-600 bg-white rounded-full px-2 py-1 shadow-sm`}>
                                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                                  <span className={`${isMobile ? 'text-sm' : 'text-xs'} font-medium`}>Listening...</span>
                                </div>
                              )}
                            </div>
                            
                            <Button
                              onClick={() => {
                                // Use the input ref to submit if available, otherwise fallback to handleSendMessage
                                if (inputMessageRef.current && (inputMessageRef.current as any).hasValue?.()) {
                                  (inputMessageRef.current as any).submit?.();
                                } else if (files.length > 0) {
                                  handleSendMessage('');
                                }
                              }}
                              disabled={isLoading}
                              className={`flex-shrink-0 ${isMobile ? 'min-h-[52px] min-w-[52px]' : 'min-h-[50px] px-6'} bg-gradient-to-r ${currentRole.color} hover:opacity-90 transition-all duration-200 touch-manipulation shadow-lg hover:shadow-xl`}
                              title="Send message"
                            >
                              {isLoading ? (
                                <Loader2 className={`animate-spin ${isMobile ? 'h-6 w-6' : 'h-4 w-4'}`} />
                              ) : (
                                <Send className={`${isMobile ? 'h-6 w-6' : 'h-4 w-4'}`} />
                              )}
                            </Button>
                          </div>
                        </div>
                        

                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </section>
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onComplete={completeOnboarding}
        onDismiss={dismissOnboarding}
      />
    </PageLayout>
  );
} 