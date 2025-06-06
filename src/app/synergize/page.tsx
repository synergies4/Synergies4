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
import { 
  Send, 
  Copy, 
  Trash2, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Loader2,
  Bot,
  User,
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
  TrendingUp,
  Award,
  Globe,
  Download,
  Mic,
  MicOff,
  X,
  Menu,
  Square,
  Pause,
  RotateCcw
} from 'lucide-react';

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
  'presentation': {
    name: 'Presentation Generator',
    icon: <Presentation className="w-5 h-5" />,
    description: 'Create role-specific presentations and training materials'
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
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900' : 'relative'}`}>
      {/* Enhanced Presentation Header - Mobile Optimized */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-slate-900 text-white space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-slate-700 flex-shrink-0"
            >
              <ArrowRight className="h-4 w-4 rotate-180 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Generator</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <h2 className="text-base sm:text-lg font-semibold truncate">{presentationTitle}</h2>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto overflow-x-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
              className="text-white hover:bg-slate-700 flex-shrink-0 text-xs sm:text-sm"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">{showNotes ? 'Hide' : 'Show'} Notes</span>
              <span className="sm:hidden">Notes</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-slate-700 flex-shrink-0 text-xs sm:text-sm"
            >
              <Presentation className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Present</span>
              <span className="sm:hidden">Full</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportPDF}
              className="text-white hover:bg-slate-700 flex-shrink-0 text-xs sm:text-sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </div>
      )}

      <div className={`flex flex-col lg:flex-row ${isFullscreen ? 'h-screen' : 'h-[500px] sm:h-[600px]'}`}>
        {/* Mobile-First Slide Thumbnails */}
        {!isFullscreen && (
          <div className="w-full lg:w-64 bg-gray-100 border-b lg:border-r lg:border-b-0 max-h-32 lg:max-h-none overflow-y-auto">
            <div className="p-2 lg:p-4">
              <h3 className="text-xs lg:text-sm font-semibold text-gray-700 mb-2 lg:mb-3">
                Slides ({slides.length})
              </h3>
              <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-x-visible">
                {slides.map((slideItem, index) => (
                  <div
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`flex-shrink-0 lg:flex-shrink p-2 lg:p-3 rounded cursor-pointer transition-all ${
                      currentSlide === index 
                        ? 'bg-teal-100 border-2 border-teal-500' 
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    } min-w-[120px] lg:min-w-0`}
                  >
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      Slide {slideItem.slideNumber}
                    </div>
                    <div className="text-xs lg:text-sm font-semibold text-gray-900 truncate">
                      {slideItem.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 hidden lg:block">
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
                  {slide.imageUrl && (
                    <div className="flex items-center justify-center mt-4 lg:mt-0">
                      <img 
                        src={slide.imageUrl} 
                        alt={`Slide ${slide.slideNumber}`}
                        className="max-w-full max-h-48 sm:max-h-64 lg:max-h-96 object-contain rounded-lg shadow-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Navigation Controls - Mobile Optimized */}
          <div className={`flex items-center justify-between p-3 sm:p-4 ${isFullscreen ? 'bg-slate-800 text-white' : 'bg-gray-50 border-t'}`}>
            <Button
              variant={isFullscreen ? "ghost" : "outline"}
              size="sm"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`${isFullscreen ? "text-white hover:bg-slate-700" : ""} flex-shrink-0`}
            >
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 rotate-180 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Prev</span>
            </Button>

            <div className="flex items-center space-x-2 sm:space-x-4 mx-2 sm:mx-4">
              <span className={`text-xs sm:text-sm ${isFullscreen ? 'text-gray-300' : 'text-gray-600'} whitespace-nowrap`}>
                {currentSlide + 1} of {slides.length}
              </span>
              <div className="flex space-x-1 max-w-[120px] sm:max-w-none overflow-hidden">
                {slides.slice(0, 8).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all flex-shrink-0 ${
                      currentSlide === index 
                        ? (isFullscreen ? 'bg-teal-400' : 'bg-teal-500')
                        : (isFullscreen ? 'bg-slate-600' : 'bg-gray-300')
                    }`}
                  />
                ))}
                {slides.length > 8 && (
                  <span className={`text-xs ${isFullscreen ? 'text-gray-400' : 'text-gray-500'}`}>...</span>
                )}
              </div>
            </div>

            <Button
              variant={isFullscreen ? "ghost" : "outline"}
              size="sm"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className={`${isFullscreen ? "text-white hover:bg-slate-700" : ""} flex-shrink-0`}
            >
              <span className="text-xs sm:text-sm">Next</span>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
            </Button>
          </div>
        </div>

        {/* Enhanced Speaker Notes Panel - Mobile Optimized */}
        {showNotes && !isFullscreen && slide.speakerNotes && (
          <div className="w-full lg:w-80 bg-amber-50 border-t lg:border-l lg:border-t-0 p-3 sm:p-4 max-h-48 lg:max-h-none overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Speaker Notes</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {slide.speakerNotes}
            </p>
          </div>
        )}
      </div>

      {/* Fullscreen Exit Hint */}
      {isFullscreen && (
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gray-900/80 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm">
          Press ESC to exit fullscreen
        </div>
      )}
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
  const [selectedMode, setSelectedMode] = useState<string>('chat');
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
  // Response counter for session limit
  const [responseCount, setResponseCount] = useState(0);
  const maxResponses = 3;



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

    // For mobile in full chat view, always scroll to bottom like ChatGPT
    if (isMobile || force) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      // Only auto-scroll if user is near bottom, unless forced
      if (isNearBottom) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  // ChatGPT-style auto-scroll: always scroll to bottom on mobile, smart scroll on desktop
  useEffect(() => {
    if (messages.length > 0 && hasInitialized) {
      const lastMessage = messages[messages.length - 1];
      
      // Always scroll when user sends a message
      if (lastMessage.type === 'user') {
        setTimeout(() => scrollToBottom(true), 50);
      }
      // For AI messages: always scroll on mobile, smart scroll on desktop
      else if (lastMessage.type === 'ai' && lastMessage.id !== 'welcome') {
        if (isMobile) {
          // Mobile: always scroll to bottom like ChatGPT
          setTimeout(() => scrollToBottom(true), 100);
        } else {
          // Desktop: only scroll if near bottom
          setTimeout(() => scrollToBottom(false), 100);
        }
      }
    }
  }, [messages, hasInitialized, isMobile]);

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

    // Check if we've reached the response limit
    if (responseCount >= maxResponses) {
      return; // Don't allow more messages
    }

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

      // Enhanced prompt based on role and mode
      let systemPrompt = `You are an expert Agile AI assistant specialized in ${role.name} responsibilities. 
      Current mode: ${mode.name} - ${mode.description}
      
      Role context: ${role.description}
      Key capabilities: ${role.capabilities.join(', ')}
      
      Based on the user's role as ${role.name} and the current mode (${mode.name}), provide specific, actionable advice.
      
      Important guidelines:
      - Keep responses clear and actionable
      - Use bullet points for complex information
      - Provide practical examples when helpful
      - If asked about technical topics outside your expertise, politely redirect to your core areas
      - Be encouraging and supportive while maintaining professionalism`;

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
      
      // Increment response count
      const newCount = responseCount + 1;
      setResponseCount(newCount);
      
      // If we've reached the limit, add the "Get in Touch" message (without S4 branding)
      if (newCount >= maxResponses) {
        setTimeout(() => {
          const limitMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: 'ai',
            content: "🎯 **You've reached your session limit!**\n\nWant to continue your Agile learning journey with unlimited access? Our premium plans offer:\n\n• **Unlimited AI conversations**\n• **Advanced presentation tools**\n• **Priority support**\n• **Custom training scenarios**\n\nReady to unlock your full potential?",
            timestamp: new Date(),
            mode: selectedMode,
            role: selectedRole,
            provider: selectedProvider
          };
          setMessages(prev => [...prev, limitMessage]);
          // Force scroll to show the limit message
          setTimeout(() => scrollToBottom(true), 100);
        }, 800);
      }
      
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
        setSelectedMode(mode === 'presentation' ? 'presentation' : 'advisor');
        
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
        } else {
          // Create course creation prompt
          prompt = `🎯 **COURSE CREATION REQUEST**

I need you to create a comprehensive training course from this meeting transcript. Please analyze the content and create structured learning materials.

**Meeting Details:**
- Title: ${title || 'Meeting Recording'}
- Type: ${type || 'team-meeting'}

**Meeting Transcript:**
${transcript}

**Please create a complete training course that includes:**

## 1. Course Overview
- Course title and description
- Learning objectives
- Target audience
- Duration estimate

## 2. Learning Modules
Break down the content into clear modules based on the main topics discussed

## 3. Practical Exercises
Create hands-on activities based on the decisions made and problems solved in the meeting

## 4. Assessment Materials
- Knowledge check questions
- Practical assessments
- Success criteria

## 5. Implementation Guide
- Step-by-step action items
- Best practices identified
- Common pitfalls to avoid

## 6. Supporting Materials
- Templates mentioned or discussed
- Checklists for key processes
- Reference materials

Please structure this as a ready-to-deliver training course that someone could use to teach others about the topics, methodologies, and decisions covered in this meeting.`;
        }

        // Clear messages first to start fresh
        setMessages([]);
        
        // Store the prompt to send after component is fully loaded
        const sendPrompt = async () => {
          console.log(`Sending ${mode} creation prompt...`);
          console.log('Selected mode set to:', mode === 'presentation' ? 'presentation' : 'advisor');
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
            mode: mode === 'presentation' ? 'presentation' : 'advisor',
            role: selectedRole,
            provider: selectedProvider
          };

          setMessages(prev => [...prev, userMessage]);
          setIsLoading(true);

          try {
            const role = AGILE_ROLES[selectedRole as keyof typeof AGILE_ROLES];
            const currentMode = INTERACTION_MODES[mode === 'presentation' ? 'presentation' : 'advisor' as keyof typeof INTERACTION_MODES];
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

            if (mode === 'presentation') {
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
              mode: mode === 'presentation' ? 'presentation' : 'advisor',
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
              mode: mode === 'presentation' ? 'presentation' : 'advisor',
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
    return isMobile ? "Ask your AI assistant..." : "Ask your assistant anything about Agile...";
  }, [isMobile]);

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

  // Presentation Display Component for Chat Messages
  const PresentationDisplay = ({ messageContent }: { messageContent: string }) => {
    const [parsedPresentation, setParsedPresentation] = useState<any>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showFullPresentation, setShowFullPresentation] = useState(false);

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

    if (!parsedPresentation) {
      return (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700">
            Presentation generated but couldn't be parsed. Please try again.
          </p>
        </div>
      );
    }

    const slides = parsedPresentation.slides || [];
    const currentSlideData = slides[currentSlide];

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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">
            {parsedPresentation.title}
          </h4>
          <Badge variant="outline" className="text-xs">
            {slides.length} slides
          </Badge>
        </div>

        {/* Slide Preview */}
        {currentSlideData && (
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">
                Slide {currentSlideData.slideNumber}: {currentSlideData.title}
              </h5>
              <Badge variant="outline" className="text-xs">
                {currentSlideData.layout}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {currentSlideData.content?.slice(0, 3).map((item: string, idx: number) => (
                <div key={idx} className="flex items-start">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
              {currentSlideData.content?.length > 3 && (
                <p className="text-xs text-gray-500 ml-5">
                  ...and {currentSlideData.content.length - 3} more points
                </p>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className="text-xs"
                >
                  <ArrowRight className="h-3 w-3 rotate-180 mr-1" />
                  Prev
                </Button>
                <span className="text-xs text-gray-500">
                  {currentSlide + 1} of {slides.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                  disabled={currentSlide === slides.length - 1}
                  className="text-xs"
                >
                  Next
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullPresentation(true)}
                className="text-xs"
              >
                <Presentation className="h-3 w-3 mr-1" />
                View Full
              </Button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => setShowFullPresentation(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
          >
            <Presentation className="h-3 w-3 mr-1" />
            Present Slides
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const jsonStr = JSON.stringify(parsedPresentation, null, 2);
              navigator.clipboard.writeText(jsonStr);
            }}
            className="text-xs"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy JSON
          </Button>
        </div>
      </div>
    );
  };



  // Full Chat View Component
  const FullChatView = () => (
    <div className="h-screen flex bg-gray-50">
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
                      message.content.includes('"slides"') && 
                      message.content.includes('"slideNumber"') && 
                      (message.content.includes('"title"') || message.content.includes('"layout"'))
                    ) ? (
                      <div className="space-y-4">
                        <p className="text-sm text-green-600 font-medium">
                          ✅ Presentation generated successfully!
                        </p>
                        <PresentationDisplay messageContent={message.content} />
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

          {/* Session Limit Banner */}
          {responseCount >= maxResponses && (
            <div className="mx-auto max-w-md p-6 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl shadow-lg text-center text-white my-4">
              <div className="mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Session Complete!</h3>
                <p className="text-sm opacity-90">
                  Ready to continue your Agile learning journey?
                </p>
              </div>
              <Button 
                className="w-full bg-white text-emerald-600 hover:bg-gray-100 font-semibold rounded-xl shadow-lg transition-all hover:scale-105"
                asChild
              >
                <a href="/contact" target="_blank" rel="noopener noreferrer">
                  Get Unlimited Access
                </a>
              </Button>
            </div>
          )}

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
        <div className={`bg-white border-t border-gray-200 ${isMobile ? 'fixed bottom-0 left-0 right-0 z-50 shadow-lg touch-manipulation p-4 safe-area-inset-bottom' : 'p-4'}`}>
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
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {selectedMode === 'presentation' && 'Presentation Generator'}
                {selectedMode === 'scenario' && 'Scenario Simulator'}
                {selectedMode === 'advisor' && 'Role-Based Advisor'}
              </h3>
              
              {selectedMode === 'presentation' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Topic</Label>
                      <Input
                        placeholder="Enter presentation topic"
                        className="mt-1 bg-white border-gray-300 text-gray-900"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const topic = (e.target as HTMLInputElement).value;
                            setInputMessage(`Create a presentation about: ${topic}`);
                            handleSendMessage();
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Audience</Label>
                      <Input
                        placeholder="Target audience"
                        className="mt-1 bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setInputMessage('Generate a presentation with the details provided above');
                      handleSendMessage();
                    }}
                    disabled={isLoading}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Presentation className="h-4 w-4 mr-2" />
                    Generate Presentation
                  </Button>
                </div>
              )}
              
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
          text: "Start Training",
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

      {/* Record Meeting Section */}
      <section className="py-16 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-6 py-3 bg-red-100 rounded-full border border-red-200 mb-8">
              <Mic className="w-5 h-5 text-red-600 mr-3" />
              <span className="text-red-700 font-medium">Meeting Recording</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Record & Transform Your Meetings
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Capture live meetings, generate AI transcripts, and instantly create training content from your discussions
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold shadow-2xl hover:shadow-red-500/25 transition-all hover:scale-105 border-0 group"
                asChild
              >
                <Link href="/record-meeting">
                  <Mic className="w-6 h-6 mr-3" />
                  Start Recording Session
                </Link>
              </Button>
              
              <div className="text-gray-500 text-sm">
                Professional meeting capture & AI analysis
              </div>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 shadow-lg">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Recording</h3>
                <p className="text-gray-600 text-sm">Capture meetings up to 2 hours with professional-grade audio quality and real-time processing.</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Transcription</h3>
                <p className="text-gray-600 text-sm">Generate accurate transcripts with speaker identification and automatic formatting.</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 shadow-lg">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Creation</h3>
                <p className="text-gray-600 text-sm">Transform meeting insights into structured training content and learning modules.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
      <section id="agile-assistant" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                AI Assistant
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Get instant answers to your Agile questions with personalized, role-specific guidance
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            {/* Chat Interface */}
            <div className="mt-6">
              <Card className="h-[500px] flex flex-col border-0 shadow-xl overflow-hidden relative">
                <CardHeader className={`bg-gradient-to-r ${currentRole.color} text-white rounded-t-lg flex-shrink-0`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {currentRole.icon}
                      <div>
                        <CardTitle className="text-lg">{currentRole.name} Assistant</CardTitle>
                        <p className="text-sm opacity-90">{currentMode.name}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearChat}
                      className="text-white hover:bg-white/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
                  {/* Messages */}
                  <div 
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0 overscroll-contain"
                    data-chat-container="true"
                    style={{
                      WebkitOverflowScrolling: 'touch',
                      scrollBehavior: 'smooth',
                      touchAction: 'manipulation'
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
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 break-words ${
                            message.type === 'user'
                              ? 'bg-teal-600 text-white'
                              : 'bg-white border shadow-sm'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {message.type === 'ai' && (
                              <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${currentRole.color} flex items-center justify-center flex-shrink-0 mt-1`}>
                                <Bot className="h-3 w-3 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                                                          {/* Check if message contains presentation JSON */}
                            {message.type === 'ai' && (
                              message.content.includes('"slides"') && 
                              message.content.includes('"slideNumber"') && 
                              (message.content.includes('"title"') || message.content.includes('"layout"'))
                            ) ? (
                              <div className="space-y-4">
                                <p className="text-sm text-green-600 font-medium">
                                  ✅ Presentation generated successfully!
                                </p>
                                <PresentationDisplay messageContent={message.content} />
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
                                    className="h-6 w-6 p-0 hover:bg-gray-100 flex-shrink-0"
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
                    
                    {/* Session Limit Banner */}
                    {responseCount >= maxResponses && (
                      <div className="mx-auto max-w-xs p-4 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl shadow-lg text-center text-white my-4">
                        <div className="mb-3">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Zap className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-base font-bold mb-1">Session Complete!</h3>
                          <p className="text-xs opacity-90">
                            Ready to continue learning?
                          </p>
                        </div>
                        <Button 
                          className="w-full bg-white text-emerald-600 hover:bg-gray-100 font-semibold rounded-lg shadow-lg transition-all hover:scale-105 text-sm py-2"
                          asChild
                        >
                          <a href="/contact" target="_blank" rel="noopener noreferrer">
                            Get Unlimited Access
                          </a>
                        </Button>
                      </div>
                    )}
                    
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

                  {/* Specialized Mode Interface */}
                  <div className="border-t bg-white p-4 flex-shrink-0 max-h-[300px] overflow-y-auto relative">
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
                        
                        {/* Chat Input */}
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex-shrink-0 ${isMobile ? 'min-h-[48px] min-w-[48px]' : 'min-h-[44px] min-w-[44px]'} touch-manipulation`}
                            title="Upload file"
                            disabled={false}
                          >
                            <Upload className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                          </Button>
                          
                          {speechSupported && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={isListening ? stopVoiceInput : startVoiceInput}
                              className={`flex-shrink-0 ${isMobile ? 'min-h-[48px] min-w-[48px]' : 'min-h-[44px] min-w-[44px]'} touch-manipulation ${
                                isListening ? 'bg-red-50 border-red-300 text-red-600' : ''
                              }`}
                              title={isListening ? "Stop voice input" : "Start voice input"}
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
                              placeholder={stableMainPlaceholder}
                              disabled={stableDisabled}
                              className={stableMainClassName}
                              ref={inputMessageRef}
                            />
                            
                            {/* Voice feedback indicator */}
                            {isListening && (
                              <div className={`absolute ${isMobile ? 'top-3 right-16' : 'top-2 right-14'} flex items-center space-x-1 text-red-600`}>
                                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                                <span className="text-xs">Listening...</span>
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
                            className={`flex-shrink-0 ${isMobile ? 'min-h-[48px] px-4' : 'min-h-[50px] px-6'} bg-gradient-to-r ${currentRole.color} hover:opacity-90 transition-opacity touch-manipulation`}
                            title="Send message"
                          >
                            {isLoading ? (
                              <Loader2 className={`animate-spin ${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                            ) : (
                              <Send className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                            )}
                          </Button>
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Master Agile with AI?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of professionals who are accelerating their Agile journey with our AI-powered training platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-white text-teal-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => document.getElementById('agile-assistant')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Training Now
              <Zap className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-2 border-white text-gray-900 bg-white hover:bg-white hover:text-teal-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href="/courses">
                Explore Courses
                <BookOpen className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
} 