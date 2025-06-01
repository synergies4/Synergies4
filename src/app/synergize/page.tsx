'use client';

import { useState, useRef, useEffect } from 'react';
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
  Download
} from 'lucide-react';

// Agile roles and their specific capabilities
const AGILE_ROLES = {
  'scrum-master': {
    name: 'Scrum Master',
    color: 'from-blue-500 to-blue-600',
    icon: <Users className="w-5 h-5" />,
    description: 'Facilitate team processes and remove impediments',
    capabilities: ['Team Facilitation', 'Impediment Removal', 'Process Coaching', 'Metrics Analysis']
  },
  'product-owner': {
    name: 'Product Owner',
    color: 'from-green-500 to-green-600',
    icon: <Target className="w-5 h-5" />,
    description: 'Maximize product value and manage backlog',
    capabilities: ['Backlog Management', 'Stakeholder Communication', 'Value Prioritization', 'User Story Creation']
  },
  'developer': {
    name: 'Developer',
    color: 'from-purple-500 to-purple-600',
    icon: <Settings className="w-5 h-5" />,
    description: 'Build high-quality product increments',
    capabilities: ['Sprint Planning', 'Code Quality', 'Technical Debt Management', 'Cross-functional Collaboration']
  },
  'agile-coach': {
    name: 'Agile Coach',
    color: 'from-orange-500 to-orange-600',
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

// AI Provider configurations
const AI_PROVIDERS = {
  anthropic: {
    name: 'Claude',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    badge: 'Anthropic',
    badgeColor: 'bg-orange-100 text-orange-800',
    icon: <Brain className="w-4 h-4" />
  },
  openai: {
    name: 'GPT',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    badge: 'OpenAI',
    badgeColor: 'bg-green-100 text-green-800',
    icon: <Zap className="w-4 h-4" />
  },
  google: {
    name: 'Gemini',
    color: 'from-blue-500 to-purple-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    badge: 'Google',
    badgeColor: 'bg-blue-100 text-blue-800',
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

// Slide Presentation Component - replaces chat interface for presentation mode
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
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative'}`}>
      {/* Presentation Header */}
      {!isFullscreen && (
        <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-gray-700"
            >
              <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
              Back to Generator
            </Button>
            <h2 className="text-lg font-semibold">{presentationTitle}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
              className="text-white hover:bg-gray-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              {showNotes ? 'Hide' : 'Show'} Notes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-gray-700"
            >
              <Presentation className="h-4 w-4 mr-2" />
              Present
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportPDF}
              className="text-white hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      )}

      <div className={`flex ${isFullscreen ? 'h-screen' : 'h-[600px]'}`}>
        {/* Slide Thumbnails */}
        {!isFullscreen && (
          <div className="w-64 bg-gray-100 border-r overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Slides ({slides.length})</h3>
              <div className="space-y-2">
                {slides.map((slideItem, index) => (
                  <div
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`p-3 rounded cursor-pointer transition-all ${
                      currentSlide === index 
                        ? 'bg-blue-100 border-2 border-blue-500' 
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      Slide {slideItem.slideNumber}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {slideItem.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {slideItem.layout}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Slide Display */}
        <div className="flex-1 flex flex-col">
          {/* Slide Content */}
          <div className={`flex-1 bg-white flex items-center justify-center p-8 ${isFullscreen ? 'text-white bg-gray-900' : ''}`}>
            <div className="w-full max-w-4xl">
              {slide.layout === 'title-slide' ? (
                <div className="text-center">
                  <h1 className={`text-4xl md:text-6xl font-bold mb-8 ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
                    {slide.title}
                  </h1>
                  <div className="space-y-4">
                    {slide.content.map((item: string, idx: number) => (
                      <p key={idx} className={`text-xl md:text-2xl ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={`${slide.layout === 'two-column' ? 'grid grid-cols-2 gap-8' : ''}`}>
                  <div className={slide.layout === 'two-column' ? '' : 'mb-8'}>
                    <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${isFullscreen ? 'text-white' : 'text-gray-900'} border-b-2 ${isFullscreen ? 'border-gray-600' : 'border-gray-200'} pb-4`}>
                      {slide.title}
                    </h2>
                    <ul className="space-y-4">
                      {slide.content.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className={`w-3 h-3 rounded-full mt-2 mr-4 flex-shrink-0 ${isFullscreen ? 'bg-blue-400' : 'bg-blue-500'}`}></span>
                          <span className={`text-lg md:text-xl ${isFullscreen ? 'text-gray-200' : 'text-gray-700'}`}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {slide.imageUrl && (
                    <div className="flex items-center justify-center">
                      <img 
                        src={slide.imageUrl} 
                        alt={`Slide ${slide.slideNumber}`}
                        className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className={`flex items-center justify-between p-4 ${isFullscreen ? 'bg-gray-800 text-white' : 'bg-gray-50 border-t'}`}>
            <Button
              variant={isFullscreen ? "ghost" : "outline"}
              size="sm"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={isFullscreen ? "text-white hover:bg-gray-700" : ""}
            >
              <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-4">
              <span className={`text-sm ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                {currentSlide + 1} of {slides.length}
              </span>
              <div className="flex space-x-1">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentSlide === index 
                        ? (isFullscreen ? 'bg-blue-400' : 'bg-blue-500')
                        : (isFullscreen ? 'bg-gray-600' : 'bg-gray-300')
                    }`}
                  />
                ))}
              </div>
            </div>

            <Button
              variant={isFullscreen ? "ghost" : "outline"}
              size="sm"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className={isFullscreen ? "text-white hover:bg-gray-700" : ""}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Speaker Notes Panel */}
        {showNotes && !isFullscreen && slide.speakerNotes && (
          <div className="w-80 bg-yellow-50 border-l p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Speaker Notes</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {slide.speakerNotes}
            </p>
          </div>
        )}
      </div>

      {/* Fullscreen Exit Hint */}
      {isFullscreen && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
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
              <h1 style="font-size: 36px; color: #1e40af; margin-bottom: 20px;">${slide.title}</h1>
              <div style="font-size: 18px; color: #666;">
                ${slide.content.map((item: string) => `<p style="margin: 10px 0;">${item}</p>`).join('')}
              </div>
            </div>
          ` : `
            <div style="${slide.layout === 'two-column' ? 'flex: 1; padding-right: 20px;' : 'flex: 1;'}">
              <h2 style="font-size: 28px; color: #1e40af; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">${slide.title}</h2>
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div>
          <Label htmlFor="topic" className="text-sm font-medium">Presentation Topic</Label>
          <Input
            id="topic"
            value={presentationTopic}
            onChange={(e) => setPresentationTopic(e.target.value)}
            placeholder="e.g., Sprint Planning Best Practices"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="audience" className="text-sm font-medium">Target Audience</Label>
          <Input
            id="audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g., Development Team"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="slides" className="text-sm font-medium">Number of Slides</Label>
          <Input
            id="slides"
            type="number"
            value={slideCount}
            onChange={(e) => setSlideCount(parseInt(e.target.value) || 5)}
            min="3"
            max="20"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="style" className="text-sm font-medium">Presentation Style</Label>
          <Select value={presentationStyle} onValueChange={setPresentationStyle}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="includeImages"
            checked={includeImages}
            onChange={(e) => setIncludeImages(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="includeImages" className="text-sm">
            Generate DALL-E images for each slide
          </Label>
        </div>
        
        {generatedSlides.length > 0 && (
          <div className="flex space-x-2">
            <Button 
              onClick={() => setShowPresentation(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Presentation className="h-4 w-4 mr-2" />
              Present Slides
            </Button>
            <Button 
              onClick={exportToPDF}
              variant="outline"
              className="bg-green-50 hover:bg-green-100 border-green-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        )}
      </div>
      
      {isGeneratingImages && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Generating images for slide {currentImageIndex} of {slideCount}...</span>
          </div>
        </div>
      )}
      
      <Button 
        onClick={generatePresentation}
        disabled={!presentationTopic || !audience || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Presentation className="h-4 w-4 mr-2" />}
        Generate {slideCount}-Slide Presentation
      </Button>
      
      {/* Slide Preview */}
      {generatedSlides.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Presentation Preview</h3>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {generatedSlides.length} slides ready
            </Badge>
          </div>
          <div className="space-y-4 max-w-full overflow-hidden">
            {generatedSlides.slice(0, 3).map((slide, index) => (
              <Card key={index} className="p-4 border-l-4 border-blue-500 w-full">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-lg break-words">Slide {slide.slideNumber}: {slide.title}</h4>
                  <Badge variant="outline" className="ml-2 flex-shrink-0">{slide.layout}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <ul className="space-y-1 text-sm">
                      {slide.content.slice(0, 3).map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          <span className="break-words">{item}</span>
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
                        className="max-w-full h-32 object-cover rounded border mx-auto"
                      />
                    </div>
                  )}
                  {!slide.imageUrl && includeImages && (
                    <div className="text-center">
                      <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                        <div className="text-gray-500 text-sm">
                          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
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
                <p className="text-gray-600">...and {generatedSlides.length - 3} more slides</p>
                <Button 
                  onClick={() => setShowPresentation(true)}
                  variant="outline"
                  className="mt-2"
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-green-50">
          <h4 className="font-semibold text-green-800 mb-3">Person 1</h4>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Role</Label>
              {/* Mobile: Use native select */}
              <div className="block md:hidden relative">
                <select
                  value={person1Role}
                  onChange={(e) => setPerson1Role(e.target.value)}
                  className="w-full min-h-[44px] text-base px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none mt-1"
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
                  <SelectTrigger className="touch-manipulation min-h-[44px] text-base">
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
                      <SelectItem value="Scrum Master" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-green-50 data-[state=checked]:bg-green-100">Scrum Master</SelectItem>
                      <SelectItem value="Product Owner" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-green-50 data-[state=checked]:bg-green-100">Product Owner</SelectItem>
                      <SelectItem value="Developer" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-green-50 data-[state=checked]:bg-green-100">Developer</SelectItem>
                      <SelectItem value="Stakeholder" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-green-50 data-[state=checked]:bg-green-100">Stakeholder</SelectItem>
                      <SelectItem value="Team Lead" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-green-50 data-[state=checked]:bg-green-100">Team Lead</SelectItem>
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Context & Goals</Label>
              <Textarea
                value={person1Context}
                onChange={(e) => setPerson1Context(e.target.value)}
                placeholder="What is this person's perspective, goals, and concerns?"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-blue-50">
          <h4 className="font-semibold text-blue-800 mb-3">Person 2</h4>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Role</Label>
              {/* Mobile: Use native select */}
              <div className="block md:hidden relative">
                <select
                  value={person2Role}
                  onChange={(e) => setPerson2Role(e.target.value)}
                  className="w-full min-h-[44px] text-base px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none mt-1"
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
                  <SelectTrigger className="touch-manipulation min-h-[44px] text-base">
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
                      <SelectItem value="Scrum Master" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-blue-50 data-[state=checked]:bg-blue-100">Scrum Master</SelectItem>
                      <SelectItem value="Product Owner" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-blue-50 data-[state=checked]:bg-blue-100">Product Owner</SelectItem>
                      <SelectItem value="Developer" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-blue-50 data-[state=checked]:bg-blue-100">Developer</SelectItem>
                      <SelectItem value="Stakeholder" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-blue-50 data-[state=checked]:bg-blue-100">Stakeholder</SelectItem>
                      <SelectItem value="Team Lead" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-blue-50 data-[state=checked]:bg-blue-100">Team Lead</SelectItem>
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
                className="mt-1"
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
          className="mt-1"
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
              <SelectTrigger className="touch-manipulation min-h-[44px] text-base">
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
                  <SelectItem value="beginner" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-orange-50 data-[state=checked]:bg-orange-100">Beginner (0-1 years)</SelectItem>
                  <SelectItem value="intermediate" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-orange-50 data-[state=checked]:bg-orange-100">Intermediate (1-3 years)</SelectItem>
                  <SelectItem value="advanced" className="min-h-[44px] px-4 py-3 data-[highlighted]:bg-orange-50 data-[state=checked]:bg-orange-100">Advanced (3+ years)</SelectItem>
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
          className="mt-1"
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

export default function SynergizeAgile() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('scrum-master');
  const [selectedMode, setSelectedMode] = useState<string>('chat');
  const [selectedProvider, setSelectedProvider] = useState<keyof typeof AI_PROVIDERS>('anthropic');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  // Only scroll to bottom when new AI messages are added (not user messages or config changes)
  useEffect(() => {
    if (messages.length > 0 && hasInitialized) {
      const lastMessage = messages[messages.length - 1];
      // Only scroll for new AI messages, not for config changes or welcome messages
      if (lastMessage.type === 'ai' && lastMessage.id !== 'welcome' && !lastMessage.content.includes('"slides"')) {
        // Add a small delay to ensure the message is rendered before scrolling
        setTimeout(() => {
          scrollToBottom();
        }, 100);
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

  // Prevent page scroll when dropdowns are interacted with
  useEffect(() => {
    const preventScroll = (e: Event) => {
      // Check if the event target is within a dropdown
      const target = e.target as HTMLElement;
      if (target && (
        target.closest('[role="combobox"]') || 
        target.closest('[data-radix-select-trigger]') ||
        target.closest('[data-radix-select-content]') ||
        target.closest('.select-trigger') ||
        target.closest('.select-content')
      )) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Add event listeners for mobile touch events
    document.addEventListener('touchstart', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && files.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      mode: selectedMode,
      role: selectedRole,
      provider: selectedProvider
    };

    setMessages(prev => [...prev, userMessage]);
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
      
      Based on the user's role as ${role.name} and the current mode (${mode.name}), provide specific, actionable advice.`;

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
            { role: 'user', content: inputMessage }
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
    } catch (error) {
      console.error('Chat Error:', error);
      
      let errorContent = 'Sorry, I encountered an error. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorContent = 'Unable to connect to the AI service. Please check your internet connection and try again.';
        } else if (error.message.includes('API request failed')) {
          errorContent = `There was an issue with the ${selectedProvider} service. Please try switching to a different AI provider or try again later.`;
        } else if (error.message.includes('Invalid response format')) {
          errorContent = 'Received an unexpected response from the AI service. Please try again or contact support if the issue persists.';
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

  // Type-safe handler for provider selection with scroll prevention
  const handleProviderChange = (value: string) => {
    if (value === 'anthropic' || value === 'openai' || value === 'google') {
      // Prevent any scrolling during provider change
      const currentScrollPosition = window.pageYOffset;
      setSelectedProvider(value);
      // Restore scroll position after state update
      setTimeout(() => {
        window.scrollTo(0, currentScrollPosition);
      }, 0);
    }
  };

  // Role change handler with scroll prevention
  const handleRoleChange = (value: string) => {
    const currentScrollPosition = window.pageYOffset;
    setSelectedRole(value);
    setTimeout(() => {
      window.scrollTo(0, currentScrollPosition);
    }, 0);
  };

  // Mode change handler with scroll prevention
  const handleModeChange = (value: string) => {
    const currentScrollPosition = window.pageYOffset;
    setSelectedMode(value);
    setTimeout(() => {
      window.scrollTo(0, currentScrollPosition);
    }, 0);
  };

  const currentRole = AGILE_ROLES[selectedRole as keyof typeof AGILE_ROLES];
  const currentMode = INTERACTION_MODES[selectedMode as keyof typeof INTERACTION_MODES];
  const currentProvider = AI_PROVIDERS[selectedProvider];

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
      />

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
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
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    {mode.icon}
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
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
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">
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
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
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
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
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
      <section id="agile-assistant" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                <Brain className="w-4 h-4 mr-2" />
                AI Assistant
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Your Personal Agile Training Assistant
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Select your role and interaction mode to get started with personalized Agile training
              </p>
            </div>

            {/* Configuration Panel */}
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg relative">
              <CardHeader>
                <CardTitle className="text-center text-xl">Configure Your Training Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Your Agile Role
                    </label>
                    <div className="relative">
                      {/* Mobile: Use native select */}
                      <div className="block md:hidden">
                        <select
                          value={selectedRole}
                          onChange={(e) => handleRoleChange(e.target.value)}
                          className="w-full min-h-[44px] text-base px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          {Object.entries(AGILE_ROLES).map(([key, role]) => (
                            <option key={key} value={key}>
                              {role.name}
                            </option>
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
                        <Select value={selectedRole} onValueChange={handleRoleChange}>
                          <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation min-h-[44px] text-base">
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
                                  className="focus:bg-blue-50 cursor-pointer min-h-[44px] px-4 py-3 data-[highlighted]:bg-blue-50 data-[state=checked]:bg-blue-100"
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
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{currentRole.description}</p>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose Interaction Mode
                    </label>
                    <div className="relative">
                      {/* Mobile: Use native select */}
                      <div className="block md:hidden">
                        <select
                          value={selectedMode}
                          onChange={(e) => handleModeChange(e.target.value)}
                          className="w-full min-h-[44px] text-base px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          {Object.entries(INTERACTION_MODES).map(([key, mode]) => (
                            <option key={key} value={key}>
                              {mode.name}
                            </option>
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
                        <Select value={selectedMode} onValueChange={handleModeChange}>
                          <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation min-h-[44px] text-base">
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
                                  className="focus:bg-blue-50 cursor-pointer min-h-[44px] px-4 py-3 data-[highlighted]:bg-blue-50 data-[state=checked]:bg-blue-100"
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
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{currentMode.description}</p>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select AI Provider
                    </label>
                    <div className="relative">
                      {/* Mobile: Use native select */}
                      <div className="block md:hidden">
                        <select
                          value={selectedProvider}
                          onChange={(e) => handleProviderChange(e.target.value)}
                          className="w-full min-h-[44px] text-base px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                            <option key={key} value={key}>
                              {provider.name} ({provider.badge})
                            </option>
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
                        <Select value={selectedProvider} onValueChange={handleProviderChange}>
                          <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation min-h-[44px] text-base">
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
                                  className="focus:bg-blue-50 cursor-pointer min-h-[44px] px-4 py-3 data-[highlighted]:bg-blue-50 data-[state=checked]:bg-blue-100"
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
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Powered by {currentProvider.badge}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="h-[600px] flex flex-col border-0 shadow-xl overflow-hidden relative">
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
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
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
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border shadow-sm'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === 'ai' && (
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${currentRole.color} flex items-center justify-center flex-shrink-0 mt-1`}>
                              <Bot className="h-3 w-3 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                              {message.content}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                  {message.timestamp.toLocaleTimeString()}
                                </span>
                                {message.type === 'ai' && message.provider && (
                                  <Badge className={AI_PROVIDERS[message.provider].badgeColor}>
                                    {AI_PROVIDERS[message.provider].badge}
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
                          className="flex-shrink-0"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Textarea
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder={`Ask your ${currentRole.name} assistant anything about Agile...`}
                          className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={isLoading || (!inputMessage.trim() && files.length === 0)}
                          className={`flex-shrink-0 bg-gradient-to-r ${currentRole.color} hover:opacity-90`}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

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
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
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
              className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => document.getElementById('agile-assistant')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Training Now
              <Zap className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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