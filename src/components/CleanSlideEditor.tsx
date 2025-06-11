'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowRight, 
  Type, 
  ImageIcon, 
  Trash, 
  Save,
  Bold,
  Italic,
  Palette,
  Plus,
  Minus,
  Edit3,
  X,
  ChevronUp,
  Smartphone,
  Square,
  Circle,
  Copy,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  RotateCw,
  Grid,
  Move,
  Lock,
  Unlock,
  Zap,
  FileText,
  Shapes,
  PlusCircle,
  ChevronDown,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  Target,
  Mouse
} from 'lucide-react';

// Toast hook
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

// Debounce hook
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

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

// History management hook
const useHistory = (initialState: any) => {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const pushToHistory = useCallback((newState: any) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);
  
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);
  
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);
  
  return { 
    currentState: history[currentIndex], 
    pushToHistory, 
    undo, 
    redo, 
    canUndo: currentIndex > 0, 
    canRedo: currentIndex < history.length - 1 
  };
};

// Helper function to get mobile-appropriate styles
const getMobileStyles = (isMobile: boolean, baseStyles: any) => {
  if (!isMobile) return baseStyles;
  
  // Ensure positioning is within mobile viewport
  const safeLeft = Math.max(10, Math.min(baseStyles.left || 20, window.innerWidth - 100));
  const safeTop = Math.max(20, Math.min(baseStyles.top || 50, 800)); // Keep within reasonable bounds
  
  return {
    ...baseStyles,
    fontSize: baseStyles.fontSize ? `${Math.max(parseInt(baseStyles.fontSize) * 0.8, 12)}px` : baseStyles.fontSize,
    maxWidth: 'calc(100vw - 40px)',
    width: baseStyles.width && typeof baseStyles.width === 'string' && baseStyles.width.includes('calc') 
      ? baseStyles.width 
      : 'auto',
    left: safeLeft,
    top: safeTop,
  };
};

interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'container';
  text?: string;
  src?: string;
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  style: {
    top: number;
    left: number;
    fontSize?: string;
    fontWeight?: string;
    fontStyle?: string;
    textAlign?: string;
    color?: string;
    backgroundColor?: string;
    width?: string;
    height?: string;
    maxWidth?: string;
    lineHeight?: string;
    borderRadius?: string;
    border?: string;
    boxShadow?: string;
    opacity?: number;
    rotation?: number;
    zIndex?: number;
  };
  locked?: boolean;
  visible?: boolean;
}

interface Slide {
  slideNumber: number;
  title: string;
  content: string[];
  layout?: string;
  elements: SlideElement[];
  imageUrl?: string;
  imageElements?: any[];
  customElements?: any[];
  backgroundColor?: string;
  backgroundImage?: string;
}

interface CleanSlideEditorProps {
  slides: Slide[];
  onClose: () => void;
  presentationTitle: string;
  onSave: (slides: Slide[]) => void;
}

// Slide templates
const slideTemplates = [
  {
    name: 'Title Slide',
    elements: [
      {
        id: 'title-template',
        type: 'text' as const,
        text: 'Presentation Title',
        style: {
          top: 200,
          left: 50,
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center' as const,
          width: '700px',
          zIndex: 1
        },
        visible: true
      },
      {
        id: 'subtitle-template',
        type: 'text' as const,
        text: 'Subtitle or description',
        style: {
          top: 300,
          left: 50,
          fontSize: '24px',
          color: '#6b7280',
          textAlign: 'center' as const,
          width: '700px',
          zIndex: 1
        },
        visible: true
      }
    ]
  },
  {
    name: 'Content Slide',
    elements: [
      {
        id: 'header-template',
        type: 'text' as const,
        text: 'Section Title',
        style: {
          top: 50,
          left: 50,
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#1f2937',
          width: '700px',
          zIndex: 1
        },
        visible: true
      },
      {
        id: 'content-template',
        type: 'text' as const,
        text: '• Bullet point one\n• Bullet point two\n• Bullet point three',
        style: {
          top: 150,
          left: 50,
          fontSize: '20px',
          color: '#374151',
          lineHeight: '1.6',
          width: '350px',
          zIndex: 1
        },
        visible: true
      }
    ]
  },
  {
    name: 'Image + Text',
    elements: [
      {
        id: 'title-template',
        type: 'text' as const,
        text: 'Title',
        style: {
          top: 50,
          left: 50,
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1f2937',
          width: '350px',
          zIndex: 1
        },
        visible: true
      },
      {
        id: 'content-template',
        type: 'text' as const,
        text: 'Description text goes here. This layout is perfect for combining visual content with descriptive text.',
        style: {
          top: 150,
          left: 50,
          fontSize: '18px',
          color: '#374151',
          lineHeight: '1.5',
          width: '350px',
          zIndex: 1
        },
        visible: true
      },
      {
        id: 'placeholder-template',
        type: 'shape' as const,
        shapeType: 'rectangle' as const,
        style: {
          top: 100,
          left: 450,
          width: '300px',
          height: '200px',
          backgroundColor: '#f3f4f6',
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          zIndex: 1
        },
        visible: true
      }
    ]
  }
];

export default function CleanSlideEditor({ 
  slides, 
  onClose, 
  presentationTitle, 
  onSave 
}: CleanSlideEditorProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Initialize slides with elements and history
  const initialSlides = slides.map(slide => {
    if (slide.elements && slide.elements.length > 0) {
      return slide;
    }

    const elements: SlideElement[] = [];
    
    // Add title
    elements.push({
      id: `title-${slide.slideNumber}`,
      type: 'text',
      text: slide.title,
      style: {
        top: 40,
        left: 20,
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#1f2937',
        maxWidth: 'calc(100vw - 60px)',
        lineHeight: '1.3',
        zIndex: 1
      },
      visible: true
    });

    // Add content
    slide.content.forEach((contentItem, idx) => {
      elements.push({
        id: `content-${slide.slideNumber}-${idx}`,
        type: 'text',
        text: contentItem,
        style: {
          top: 120 + (idx * 40),
          left: 20,
          fontSize: '16px',
          fontWeight: '400',
          color: '#374151',
          maxWidth: 'calc(100vw - 60px)',
          lineHeight: '1.5',
          zIndex: 1
        },
        visible: true
      });
    });

    // Add image if exists
    if (slide.imageUrl) {
      elements.push({
        id: `image-${slide.slideNumber}`,
        type: 'image',
        src: slide.imageUrl,
        style: {
          top: 300,
          left: 20,
          width: 'calc(100vw - 80px)',
          height: 'auto',
          zIndex: 1
        },
        visible: true
      });
    }

    return { ...slide, elements };
  });

  const { 
    currentState: editableSlides, 
    pushToHistory, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory(initialSlides);
  
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [showMobileToolbar, setShowMobileToolbar] = useState(false);
  const [toolbarTimeout, setToolbarTimeout] = useState<NodeJS.Timeout | null>(null);
  const [persistentSelection, setPersistentSelection] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [gridVisible, setGridVisible] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);
  
  // Stable mobile toolbar management
  const showMobileToolbarStable = useCallback((show: boolean) => {
    if (toolbarTimeout) {
      clearTimeout(toolbarTimeout);
    }
    
    if (show) {
      setShowMobileToolbar(true);
    } else {
      // Small delay before hiding to prevent accidental flickers
      const timeout = setTimeout(() => {
        setShowMobileToolbar(false);
      }, 100);
      setToolbarTimeout(timeout);
    }
  }, [toolbarTimeout]);
  
  // Improved drag system
  const [dragState, setDragState] = useState<{
    elementId: string;
    startX: number;
    startY: number;
    elementStartX: number;
    elementStartY: number;
    hasMoved: boolean;
  } | null>(null);
  
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const isMobile = useIsMobile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, addToast } = useToast();

  // Auto-save
  const debouncedSlides = useDebounce(editableSlides, 1000);
  
  useEffect(() => {
    if (debouncedSlides !== editableSlides && editableSlides.length > 0) {
      setIsAutoSaving(true);
      setTimeout(() => {
        setIsAutoSaving(false);
        setLastSaved(new Date());
      }, 300);
    }
  }, [debouncedSlides, editableSlides]);

  const currentSlideData = useMemo(() => editableSlides[currentSlide], [editableSlides, currentSlide]);
  
  // Get selected element data
  const selectedElementData = useMemo(() => {
    if (!selectedElement || !currentSlideData) return null;
    return currentSlideData.elements.find((el: SlideElement) => el.id === selectedElement);
  }, [selectedElement, currentSlideData]);

  // Update slides with history
  const updateSlides = useCallback((newSlides: Slide[]) => {
    pushToHistory(newSlides);
  }, [pushToHistory]);

  // Update element
  const updateElement = useCallback((id: string, updates: Partial<SlideElement>) => {
    const newSlides = editableSlides.map((slide: Slide, idx: number) => {
      if (idx === currentSlide) {
        return {
          ...slide,
          elements: slide.elements.map(element => 
            element.id === id ? { ...element, ...updates } : element
          )
        };
      }
      return slide;
    });
    updateSlides(newSlides);
  }, [currentSlide, editableSlides, updateSlides]);

  // Add new slide
  const addNewSlide = useCallback((templateIndex?: number) => {
    const template = templateIndex !== undefined ? slideTemplates[templateIndex] : null;
    const newSlideNumber = editableSlides.length + 1;
    
    const newSlide: Slide = {
      slideNumber: newSlideNumber,
      title: `Slide ${newSlideNumber}`,
      content: [],
      elements: template ? template.elements.map((el): SlideElement => ({
        ...el,
        id: `${el.id}-${newSlideNumber}`,
        visible: true
      })) : [{
        id: `title-${newSlideNumber}`,
        type: 'text',
        text: `Slide ${newSlideNumber} Title`,
        style: {
          top: 100,
          left: 50,
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1f2937',
          width: '700px',
          zIndex: 1
        },
        visible: true
      }]
    };
    
    const newSlides = [...editableSlides, newSlide];
    updateSlides(newSlides);
    setCurrentSlide(newSlides.length - 1);
    addToast(`New slide added${template ? ` from ${template.name} template` : ''}`, 'success');
  }, [editableSlides, updateSlides, addToast]);

  // Duplicate slide
  const duplicateSlide = useCallback((slideIndex: number) => {
    const slideToClone = editableSlides[slideIndex];
    const newSlideNumber = editableSlides.length + 1;
    
    const newSlide: Slide = {
      ...slideToClone,
      slideNumber: newSlideNumber,
      title: `${slideToClone.title} (Copy)`,
      elements: slideToClone.elements.map((el: SlideElement): SlideElement => ({
        ...el,
        id: `${el.id}-copy-${newSlideNumber}`
      }))
    };
    
    const newSlides = [...editableSlides];
    newSlides.splice(slideIndex + 1, 0, newSlide);
    updateSlides(newSlides);
    setCurrentSlide(slideIndex + 1);
    addToast('Slide duplicated', 'success');
  }, [editableSlides, updateSlides, addToast]);

  // Delete slide
  const deleteSlide = useCallback((slideIndex: number) => {
    if (editableSlides.length <= 1) {
      addToast('Cannot delete the last slide', 'error');
      return;
    }
    
    const newSlides = editableSlides.filter((_: Slide, idx: number) => idx !== slideIndex);
    updateSlides(newSlides);
    
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(newSlides.length - 1);
    } else if (currentSlide > slideIndex) {
      setCurrentSlide(currentSlide - 1);
    }
    
    addToast('Slide deleted', 'info');
  }, [editableSlides, currentSlide, updateSlides, addToast]);

  // AI Content Generation
  const generateAIContent = useCallback(async (prompt: string, elementType: 'text' | 'title' | 'bullets') => {
    setGeneratingContent(true);
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Generate ${elementType} content: ${prompt}`,
          type: elementType 
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate content');
      
      const data = await response.json();
      
      // Add the generated content as a new text element
      const newElement: SlideElement = {
        id: `ai-${elementType}-${Date.now()}`,
        type: 'text',
        text: data.content,
        style: {
          top: 150 + (currentSlideData?.elements.length || 0) * 60,
          left: 50,
          fontSize: elementType === 'title' ? '28px' : '18px',
          fontWeight: elementType === 'title' ? 'bold' : '400',
          color: '#374151',
          width: '600px',
          lineHeight: '1.5',
          zIndex: (currentSlideData?.elements.length || 0) + 1
        },
        visible: true
      };
      
      const newSlides = editableSlides.map((slide: Slide, idx: number) => {
        if (idx === currentSlide) {
          return {
            ...slide,
            elements: [...slide.elements, newElement]
          };
        }
        return slide;
      });
      
      updateSlides(newSlides);
      setSelectedElement(newElement.id);
      addToast('AI content generated!', 'success');
      
    } catch (error) {
      addToast('Failed to generate content', 'error');
    } finally {
      setGeneratingContent(false);
    }
  }, [currentSlide, currentSlideData, editableSlides, updateSlides, addToast]);

  // Formatting functions
  const updateTextStyle = useCallback((styleUpdates: Partial<SlideElement['style']>) => {
    if (!selectedElement || !selectedElementData) return;
    updateElement(selectedElement, {
      style: {
        ...selectedElementData.style,
        ...styleUpdates
      }
    });
  }, [selectedElement, selectedElementData, updateElement]);

  const increaseFontSize = useCallback(() => {
    if (!selectedElementData?.style.fontSize) return;
    const currentSize = parseInt(selectedElementData.style.fontSize);
    updateTextStyle({ fontSize: `${Math.min(currentSize + (isMobile ? 4 : 2), 72)}px` });
  }, [selectedElementData, updateTextStyle, isMobile]);

  const decreaseFontSize = useCallback(() => {
    if (!selectedElementData?.style.fontSize) return;
    const currentSize = parseInt(selectedElementData.style.fontSize);
    updateTextStyle({ fontSize: `${Math.max(currentSize - (isMobile ? 4 : 2), 8)}px` });
  }, [selectedElementData, updateTextStyle, isMobile]);

  const toggleBold = useCallback(() => {
    const currentWeight = selectedElementData?.style.fontWeight || '400';
    const newWeight = currentWeight === 'bold' || currentWeight === '700' ? '400' : 'bold';
    updateTextStyle({ fontWeight: newWeight });
  }, [selectedElementData, updateTextStyle]);

  const toggleItalic = useCallback(() => {
    const currentStyle = selectedElementData?.style.fontStyle || 'normal';
    const newStyle = currentStyle === 'italic' ? 'normal' : 'italic';
    updateTextStyle({ fontStyle: newStyle });
  }, [selectedElementData, updateTextStyle]);

  // Alignment functions
  const setTextAlign = useCallback((align: 'left' | 'center' | 'right') => {
    updateTextStyle({ textAlign: align });
  }, [updateTextStyle]);

  // Layer functions
  const bringToFront = useCallback(() => {
    if (!selectedElementData) return;
    const maxZ = Math.max(...(currentSlideData?.elements.map((el: SlideElement) => el.style.zIndex || 0) || [0]));
    updateTextStyle({ zIndex: maxZ + 1 });
  }, [selectedElementData, currentSlideData, updateTextStyle]);

  const sendToBack = useCallback(() => {
    if (!selectedElementData) return;
    const minZ = Math.min(...(currentSlideData?.elements.map((el: SlideElement) => el.style.zIndex || 0) || [0]));
    updateTextStyle({ zIndex: Math.max(0, minZ - 1) });
  }, [selectedElementData, currentSlideData, updateTextStyle]);

  // Add shape element
  const addShapeElement = useCallback((shapeType: 'rectangle' | 'circle' | 'triangle') => {
    const newElement: SlideElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType,
      style: {
        top: isMobile ? 150 : 200,
        left: isMobile ? 20 : 200,
        width: '150px',
        height: '100px',
        backgroundColor: '#3b82f6',
        borderRadius: shapeType === 'circle' ? '50%' : '8px',
        zIndex: (currentSlideData?.elements.length || 0) + 1
      },
      visible: true
    };

    const newSlides = editableSlides.map((slide: Slide, idx: number) => {
      if (idx === currentSlide) {
        return {
          ...slide,
          elements: [...slide.elements, newElement]
        };
      }
      return slide;
    });
    
    updateSlides(newSlides);
    setSelectedElement(newElement.id);
    addToast('Shape added', 'success');
  }, [currentSlide, currentSlideData, editableSlides, updateSlides, addToast, isMobile]);

  // Add text element
  const addTextElement = useCallback(() => {
    const newElement: SlideElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'Tap to edit',
      style: {
        top: isMobile ? 150 : 300,
        left: isMobile ? 20 : 300,
        fontSize: isMobile ? '16px' : '18px',
        fontWeight: '400',
        color: '#374151',
        maxWidth: isMobile ? 'calc(100% - 40px)' : '200px',
        zIndex: (currentSlideData?.elements.length || 0) + 1
      },
      visible: true
    };

    const newSlides = editableSlides.map((slide: Slide, idx: number) => {
      if (idx === currentSlide) {
        return {
          ...slide,
          elements: [...slide.elements, newElement]
        };
      }
      return slide;
    });
    
    updateSlides(newSlides);
    setSelectedElement(newElement.id);
    if (isMobile) {
      showMobileToolbarStable(true);
    }
    addToast('Text added', 'success');
  }, [currentSlide, currentSlideData, editableSlides, updateSlides, addToast, isMobile, showMobileToolbarStable]);

  // Add image
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image too large. Max 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const newElement: SlideElement = {
        id: `image-${Date.now()}`,
        type: 'image',
        src: e.target?.result as string,
        style: {
          top: isMobile ? 200 : 200,
          left: isMobile ? 20 : 400,
          width: isMobile ? 'calc(50% - 30px)' : '200px',
          height: 'auto',
          zIndex: (currentSlideData?.elements.length || 0) + 1
        },
        visible: true
      };

      const newSlides = editableSlides.map((slide: Slide, idx: number) => {
        if (idx === currentSlide) {
          return {
            ...slide,
            elements: [...slide.elements, newElement]
          };
        }
        return slide;
      });
      
      updateSlides(newSlides);
      setSelectedElement(newElement.id);
      addToast('Image added', 'success');
    };
    
    reader.readAsDataURL(file);
  }, [currentSlide, currentSlideData, editableSlides, updateSlides, addToast, isMobile]);

  // Delete element
  const deleteElement = useCallback((id: string) => {
    const newSlides = editableSlides.map((slide: Slide, idx: number) => {
      if (idx === currentSlide) {
        return {
          ...slide,
          elements: slide.elements.filter(element => element.id !== id)
        };
      }
      return slide;
    });
    updateSlides(newSlides);
    setSelectedElement(null);
    setEditingElement(null);
    showMobileToolbarStable(false);
    addToast('Element deleted', 'info');
  }, [currentSlide, editableSlides, updateSlides, addToast, showMobileToolbarStable]);

  // Duplicate element
  const duplicateElement = useCallback((id: string) => {
    const elementToCopy = currentSlideData?.elements.find((el: SlideElement) => el.id === id);
    if (!elementToCopy) return;

    const newElement: SlideElement = {
      ...elementToCopy,
      id: `${elementToCopy.id}-copy-${Date.now()}`,
      style: {
        ...elementToCopy.style,
        top: elementToCopy.style.top + 20,
        left: elementToCopy.style.left + 20,
        zIndex: (currentSlideData?.elements.length || 0) + 1
      }
    };

    const newSlides = editableSlides.map((slide: Slide, idx: number) => {
      if (idx === currentSlide) {
        return {
          ...slide,
          elements: [...slide.elements, newElement]
        };
      }
      return slide;
    });
    
    updateSlides(newSlides);
    setSelectedElement(newElement.id);
    addToast('Element duplicated', 'success');
  }, [currentSlide, currentSlideData, editableSlides, updateSlides, addToast]);

  // Toggle element visibility
  const toggleElementVisibility = useCallback((id: string) => {
    updateElement(id, { visible: !currentSlideData?.elements.find((el: SlideElement) => el.id === id)?.visible });
  }, [updateElement, currentSlideData]);

  // Lock/unlock element
  const toggleElementLock = useCallback((id: string) => {
    updateElement(id, { locked: !currentSlideData?.elements.find((el: SlideElement) => el.id === id)?.locked });
  }, [updateElement, currentSlideData]);

  // Save
  const handleSave = useCallback(() => {
    try {
      onSave(editableSlides);
      addToast('Saved successfully!', 'success');
    } catch (error) {
      addToast('Failed to save', 'error');
    }
  }, [editableSlides, onSave, addToast]);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    const prevState = undo();
    if (prevState) {
      setSelectedElement(null);
      setEditingElement(null);
      addToast('Undone', 'info');
    }
  }, [undo, addToast]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setSelectedElement(null);
      setEditingElement(null);
      addToast('Redone', 'info');
    }
  }, [redo, addToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElement) {
        deleteElement(selectedElement);
      }
      if (e.key === 'Escape') {
        setSelectedElement(null);
        setEditingElement(null);
        showMobileToolbarStable(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedElement) {
        e.preventDefault();
        duplicateElement(selectedElement);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, deleteElement, handleSave, handleUndo, handleRedo, duplicateElement, showMobileToolbarStable]);

  // Improved mouse/touch handlers
  const handlePointerDown = useCallback((e: React.PointerEvent, elementId: string) => {
    e.stopPropagation();
    const element = currentSlideData?.elements.find((el: SlideElement) => el.id === elementId);
    if (!element || element.locked) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const canvasRect = e.currentTarget.closest('.slide-canvas')?.getBoundingClientRect();
    if (!canvasRect) return;

    setDragState({
      elementId,
      startX: e.clientX,
      startY: e.clientY,
      elementStartX: element.style.left,
      elementStartY: element.style.top,
      hasMoved: false
    });

    // Select element immediately only if not already selected
    if (selectedElement !== elementId) {
      setSelectedElement(elementId);
      setPersistentSelection(true); // Make selection persistent on pointer down
      if (isMobile && element.type === 'text') {
        showMobileToolbarStable(true);
      }
    }
  }, [currentSlideData, isMobile, selectedElement, showMobileToolbarStable]);

  // Global pointer move handler with grid snapping
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState) return;

      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      
      // Check if we've moved enough to consider it a drag (larger threshold for touch)
      const threshold = isMobile ? 15 : 8;
      if (!dragState.hasMoved && (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold)) {
        setDragState(prev => prev ? { ...prev, hasMoved: true } : null);
      }

      if (dragState.hasMoved) {
        let newX = Math.max(0, dragState.elementStartX + deltaX);
        let newY = Math.max(0, dragState.elementStartY + deltaY);

        // Grid snapping
        if (snapToGrid) {
          const gridSize = 20;
          newX = Math.round(newX / gridSize) * gridSize;
          newY = Math.round(newY / gridSize) * gridSize;
        }

        updateElement(dragState.elementId, {
          style: {
            ...currentSlideData?.elements.find((el: SlideElement) => el.id === dragState.elementId)?.style,
            left: newX,
            top: newY
          }
        });
      }
    };

    const handlePointerUp = () => {
      setDragState(null);
    };

    if (dragState) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, updateElement, currentSlideData, isMobile, snapToGrid]);

  // Handle element clicks (separate from drag)
  const handleElementClick = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    
    // Only handle click if we didn't drag
    if (dragState?.hasMoved) return;

    // Get the element data for the clicked element
    const clickedElement = currentSlideData?.elements.find((el: SlideElement) => el.id === elementId);
    if (clickedElement?.locked) return;

    if (selectedElement === elementId) {
      // Second click - enter edit mode for text
      if (clickedElement?.type === 'text' && !editingElement) {
        setEditingElement(elementId);
        setPersistentSelection(true); // Keep selection persistent
        if (isMobile) {
          showMobileToolbarStable(false); // Hide toolbar while editing
        }
      }
    } else {
      // First click - select element and make selection persistent
      setSelectedElement(elementId);
      setEditingElement(null);
      setPersistentSelection(true); // Enable persistent selection
      
      // Always show mobile toolbar for text elements, don't toggle
      if (isMobile && clickedElement?.type === 'text') {
        showMobileToolbarStable(true);
      }
    }
  }, [selectedElement, editingElement, dragState, isMobile, currentSlideData, showMobileToolbarStable]);

  // AI Content Generation Panel
  const AIContentPanel = () => {
    const [prompt, setPrompt] = useState('');
    const [contentType, setContentType] = useState<'text' | 'title' | 'bullets'>('text');

    return (
      <div className="bg-white border-l border-gray-200 w-80 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Zap className="h-4 w-4 mr-2 text-purple-600" />
            AI Content
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Type
            </label>
            <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="text">Paragraph</SelectItem>
                <SelectItem value="bullets">Bullet Points</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe what you want
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Benefits of remote work for productivity"
              className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none"
              rows={3}
            />
          </div>

          <Button
            onClick={() => generateAIContent(prompt, contentType)}
            disabled={!prompt.trim() || generatingContent}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {generatingContent ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Layers Panel
  const LayersPanel = () => {
    if (!showLayers) return null;

    const sortedElements = [...(currentSlideData?.elements || [])].sort((a, b) => 
      (b.style.zIndex || 0) - (a.style.zIndex || 0)
    );

    return (
      <div className="bg-white border-l border-gray-200 w-64 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Layers className="h-4 w-4 mr-2" />
            Layers
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLayers(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {sortedElements.map((element, index) => (
            <div
              key={element.id}
              onClick={() => setSelectedElement(element.id)}
              className={`
                p-3 rounded-md border cursor-pointer transition-all flex items-center justify-between
                ${selectedElement === element.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  {element.type === 'text' && <Type className="h-3 w-3 text-gray-500" />}
                  {element.type === 'image' && <ImageIcon className="h-3 w-3 text-gray-500" />}
                  {element.type === 'shape' && <Square className="h-3 w-3 text-gray-500" />}
                </div>
                <span className="text-xs font-medium text-gray-700 truncate">
                  {element.type === 'text' 
                    ? (element.text?.substring(0, 20) + (element.text && element.text.length > 20 ? '...' : ''))
                    : `${element.type} ${index + 1}`
                  }
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleElementVisibility(element.id);
                  }}
                  className="w-6 h-6 p-0"
                >
                  {element.visible !== false ? 
                    <Eye className="h-3 w-3" /> : 
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  }
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleElementLock(element.id);
                  }}
                  className="w-6 h-6 p-0"
                >
                  {element.locked ? 
                    <Lock className="h-3 w-3 text-red-500" /> : 
                    <Unlock className="h-3 w-3" />
                  }
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Templates Panel
  const TemplatesPanel = () => {
    if (!showTemplates) return null;

    return (
      <div className="bg-white border-l border-gray-200 w-80 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Slide</h4>
            <div className="grid grid-cols-1 gap-2">
              {slideTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => addNewSlide(index)}
                  className="justify-start h-auto p-3"
                >
                  <div className="text-left">
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {template.elements.length} elements
                    </div>
                  </div>
                </Button>
              ))}
              
              <Button
                variant="outline"
                onClick={() => addNewSlide()}
                className="justify-start h-auto p-3 border-dashed"
              >
                <div className="text-left">
                  <div className="font-medium text-sm">Blank Slide</div>
                  <div className="text-xs text-gray-500 mt-1">Start from scratch</div>
                </div>
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">AI Content</h4>
            <Button
              onClick={() => setShowTemplates(false)}
              variant="outline"
              className="w-full justify-start"
            >
              <Zap className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Mobile Formatting Toolbar Component
  const MobileToolbar = () => {
    if (!isMobile || !selectedElementData || selectedElementData.type !== 'text' || !showMobileToolbar) {
      return null;
    }

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-[60] p-4 max-h-[50vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Edit3 className="h-4 w-4 mr-2" />
            Format Text
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => showMobileToolbarStable(false)}
            className="p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Font Size */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Size:</span>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={decreaseFontSize}
                className="w-10 h-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-mono min-w-[4rem] text-center">
                {selectedElementData.style.fontSize || '18px'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={increaseFontSize}
                className="w-10 h-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bold & Italic Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Style:</span>
            <div className="flex space-x-2">
              <Button
                variant={selectedElementData.style.fontWeight === 'bold' || selectedElementData.style.fontWeight === '700' ? 'default' : 'outline'}
                onClick={toggleBold}
                className="w-12 h-10"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant={selectedElementData.style.fontStyle === 'italic' ? 'default' : 'outline'}
                onClick={toggleItalic}
                className="w-12 h-10"
              >
                <Italic className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Text Alignment */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Align:</span>
            <div className="flex space-x-2">
              <Button
                variant={selectedElementData.style.textAlign === 'left' ? 'default' : 'outline'}
                onClick={() => setTextAlign('left')}
                className="w-10 h-10"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={selectedElementData.style.textAlign === 'center' ? 'default' : 'outline'}
                onClick={() => setTextAlign('center')}
                className="w-10 h-10"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant={selectedElementData.style.textAlign === 'right' ? 'default' : 'outline'}
                onClick={() => setTextAlign('right')}
                className="w-10 h-10"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <span className="text-sm font-medium text-gray-700 mb-2 block">Color:</span>
            <div className="grid grid-cols-6 gap-2">
              {['#374151', '#dc2626', '#059669', '#2563eb', '#7c3aed', '#ea580c'].map(color => (
                <button
                  key={color}
                  onClick={() => updateTextStyle({ color })}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    selectedElementData.style.color === color 
                      ? 'border-gray-900 ring-2 ring-gray-300 scale-105' 
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <Button
              onClick={() => {
                setEditingElement(selectedElement);
                showMobileToolbarStable(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white h-12"
            >
              <Type className="h-4 w-4 mr-2" />
              Edit Text
            </Button>
            <Button
              onClick={() => selectedElement && duplicateElement(selectedElement)}
              variant="outline"
              className="border-green-300 text-green-600 hover:bg-green-50 h-12"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              onClick={() => selectedElement && deleteElement(selectedElement)}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 h-12"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className={`flex items-center justify-between ${isMobile ? 'p-2' : 'p-4'}`}>
          {/* Left section */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "sm"}
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowRight className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} rotate-180 mr-1`} />
              {!isMobile && "Back"}
            </Button>
            {!isMobile && <div className="h-6 w-px bg-gray-300"></div>}
            <h1 className={`${isMobile ? 'text-xs' : 'text-lg'} font-semibold text-gray-900 truncate max-w-[120px]`}>
              {isMobile ? presentationTitle.substring(0, 15) + (presentationTitle.length > 15 ? '...' : '') : presentationTitle}
            </h1>
          </div>

          {/* Center section - Undo/Redo */}
          {!isMobile && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Shift+Z)"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Right section */}
          <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
            {/* Add Elements Dropdown */}
            {!isMobile && (
              <div className="relative">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
                {/* Add dropdown menu implementation here */}
              </div>
            )}

            {/* Mobile Add Buttons */}
            {isMobile && (
              <>
                <Button
                  size="sm"
                  onClick={addTextElement}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Type className="h-3 w-3" />
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <ImageIcon className="h-3 w-3" />
                </Button>

                <Button
                  size="sm"
                  onClick={() => addShapeElement('rectangle')}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Square className="h-3 w-3" />
                </Button>
              </>
            )}

            {/* Panel Toggles */}
            {!isMobile && (
              <>
                <Button
                  variant={showTemplates ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setShowTemplates(!showTemplates);
                    setShowLayers(false);
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Templates
                </Button>
                
                <Button
                  variant={showLayers ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setShowLayers(!showLayers);
                    setShowTemplates(false);
                  }}
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Layers
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGridVisible(!gridVisible)}
                  title="Toggle Grid"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {!isMobile && <div className="h-6 w-px bg-gray-300"></div>}
            
            <Button
              size={isMobile ? "sm" : "sm"}
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Save className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${!isMobile ? 'mr-2' : ''}`} />
              {!isMobile && "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Formatting Panel */}
      {!isMobile && selectedElementData?.type === 'text' && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Format Text:</span>
              
              {/* Font size controls */}
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={decreaseFontSize}
                  className="w-8 h-8 p-0"
                  title="Decrease font size"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-mono min-w-[3rem] text-center">
                  {selectedElementData.style.fontSize || '18px'}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={increaseFontSize}
                  className="w-8 h-8 p-0"
                  title="Increase font size"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Bold & Italic toggle */}
              <Button
                size="sm"
                variant={selectedElementData.style.fontWeight === 'bold' || selectedElementData.style.fontWeight === '700' ? 'default' : 'outline'}
                onClick={toggleBold}
                className="w-8 h-8 p-0"
                title="Toggle bold"
              >
                <Bold className="h-3 w-3" />
              </Button>

              <Button
                size="sm"
                variant={selectedElementData.style.fontStyle === 'italic' ? 'default' : 'outline'}
                onClick={toggleItalic}
                className="w-8 h-8 p-0"
                title="Toggle italic"
              >
                <Italic className="h-3 w-3" />
              </Button>

              {/* Text Alignment */}
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant={selectedElementData.style.textAlign === 'left' ? 'default' : 'outline'}
                  onClick={() => setTextAlign('left')}
                  className="w-8 h-8 p-0"
                >
                  <AlignLeft className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedElementData.style.textAlign === 'center' ? 'default' : 'outline'}
                  onClick={() => setTextAlign('center')}
                  className="w-8 h-8 p-0"
                >
                  <AlignCenter className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedElementData.style.textAlign === 'right' ? 'default' : 'outline'}
                  onClick={() => setTextAlign('right')}
                  className="w-8 h-8 p-0"
                >
                  <AlignRight className="h-3 w-3" />
                </Button>
              </div>

              {/* Color picker */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Color:</span>
                <div className="flex space-x-1">
                  {['#374151', '#dc2626', '#059669', '#2563eb', '#7c3aed', '#ea580c'].map(color => (
                    <button
                      key={color}
                      onClick={() => updateTextStyle({ color })}
                      className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                        selectedElementData.style.color === color 
                          ? 'border-gray-900 ring-2 ring-gray-300' 
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Change color to ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Layering controls */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={bringToFront}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
                title="Bring to front"
              >
                <Layers className="h-3 w-3 mr-1" />
                Front
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={sendToBack}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
                title="Send to back"
              >
                <Layers className="h-3 w-3 mr-1" />
                Back
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => selectedElement && duplicateElement(selectedElement)}
                className="text-green-600 border-green-300 hover:bg-green-50"
                title="Duplicate (Ctrl+D)"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => selectedElement && deleteElement(selectedElement)}
                className="text-red-600 border-red-300 hover:bg-red-50"
                title="Delete"
              >
                <Trash className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 ${isMobile ? 'flex-col overflow-auto' : 'overflow-hidden'}`}>
        {/* Slide Navigation - IMPROVED WITH PROPER SCROLLING */}
        {!isMobile && (
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Slide Panel Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Slides</h3>
                <span className="text-xs text-gray-500">{currentSlide + 1}/{editableSlides.length}</span>
              </div>
              
              <Button
                onClick={() => addNewSlide()}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Slide
              </Button>
            </div>
            
            {/* Scrollable Slide List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {editableSlides.map((slide: Slide, index: number) => (
                <div key={slide.slideNumber} className="relative group">
                  <div
                    onClick={() => setCurrentSlide(index)}
                    className={`
                      p-3 rounded-lg border cursor-pointer transition-all relative
                      ${currentSlide === index 
                        ? 'border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-200' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                  >
                    {/* Slide Preview */}
                    <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center text-xs text-gray-500 relative overflow-hidden">
                      <span className="absolute top-1 left-1 text-[10px] font-mono">{slide.slideNumber}</span>
                      {/* Mini preview of slide content */}
                      <div className="w-full h-full flex flex-col justify-center px-2">
                        {slide.elements.slice(0, 3).map((el, idx) => (
                          <div 
                            key={el.id} 
                            className={`text-[8px] truncate mb-1 ${el.type === 'text' ? 'text-gray-700' : 'text-gray-400'}`}
                          >
                            {el.type === 'text' ? el.text?.substring(0, 30) : `[${el.type}]`}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-xs font-medium text-gray-700 truncate">
                      {slide.elements.find((el: SlideElement) => el.id.startsWith('title-'))?.text || slide.title}
                    </div>
                    
                    {/* Element count */}
                    <div className="text-[10px] text-gray-500 mt-1">
                      {slide.elements.length} elements
                    </div>
                  </div>
                  
                  {/* Slide Actions - Show on hover */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateSlide(index);
                      }}
                      className="w-6 h-6 p-0 bg-white shadow-sm hover:bg-gray-50"
                      title="Duplicate slide"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    
                    {editableSlides.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSlide(index);
                        }}
                        className="w-6 h-6 p-0 bg-white shadow-sm hover:bg-red-50 text-red-600"
                        title="Delete slide"
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation buttons - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className="flex-1"
                >
                  <ArrowRight className="h-4 w-4 rotate-180 mr-1" />
                  Prev
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlide(Math.min(editableSlides.length - 1, currentSlide + 1))}
                  disabled={currentSlide === editableSlides.length - 1}
                  className="flex-1"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className={`flex-1 ${isMobile ? 'h-0' : 'p-8'} ${isMobile ? 'overflow-auto' : 'overflow-auto'}`}>
          <div className={`${isMobile ? 'w-full min-h-full p-4' : 'mx-auto'}`} style={!isMobile ? { 
            width: '800px', 
            height: '600px',
            maxWidth: '800px'
          } : { minHeight: 'calc(100vh - 140px)' }}>
            <div 
              className={`slide-canvas w-full ${isMobile ? 'min-h-full' : 'h-full'} bg-white ${isMobile ? 'rounded-lg shadow' : 'rounded-lg shadow-lg'} border ${isMobile ? 'border-gray-200' : 'border-2 border-gray-200'} relative`}
              style={isMobile ? { 
                minHeight: '600px',
                paddingBottom: '120px' // Extra space for floating elements
              } : {}}
              onClick={(e) => {
                // Only deselect if clicking on empty canvas area AND selection is not persistent
                if (e.target === e.currentTarget) {
                  // Don't deselect if we have persistent selection
                  if (persistentSelection) {
                    return;
                  }
                  
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const clickY = e.clientY - rect.top;
                  
                  // Don't deselect if clicking near top (where desktop toolbar is) or bottom (where mobile toolbar is)
                  const isNearToolbar = clickY < 100 || clickY > rect.height - 150;
                  
                  if (!isNearToolbar) {
                    setSelectedElement(null);
                    setEditingElement(null);
                    setPersistentSelection(false);
                    showMobileToolbarStable(false);
                  }
                }
              }}
              onDoubleClick={(e) => {
                // Double click to clear persistent selection
                if (e.target === e.currentTarget) {
                  setSelectedElement(null);
                  setEditingElement(null);
                  setPersistentSelection(false);
                  showMobileToolbarStable(false);
                }
              }}
            >
              {/* Grid - lighter on mobile */}
              {gridVisible && (
                <div 
                  className={`absolute inset-0 pointer-events-none ${isMobile ? 'opacity-20' : 'opacity-30'}`}
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                      linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                />
              )}

              {/* Elements */}
              {currentSlideData?.elements
                .filter((element: SlideElement) => element.visible !== false)
                .sort((a: SlideElement, b: SlideElement) => (a.style.zIndex || 0) - (b.style.zIndex || 0))
                .map((element: SlideElement) => {
                const elementStyles = getMobileStyles(isMobile, element.style);
                return (
                <div
                  key={element.id}
                  className={`absolute select-none transition-all ${
                    selectedElement === element.id 
                      ? 'ring-2 ring-blue-500 ring-opacity-70 cursor-move' 
                      : 'hover:ring-1 hover:ring-gray-300 cursor-pointer'
                  } ${isMobile ? 'touch-manipulation' : ''} ${
                    element.locked ? 'cursor-not-allowed opacity-75' : ''
                  }`}
                  style={{
                    ...elementStyles,
                    minHeight: isMobile ? '44px' : 'auto', // Touch target size
                    minWidth: isMobile ? '44px' : 'auto',
                    opacity: element.style.opacity ?? 1,
                    transform: element.style.rotation ? `rotate(${element.style.rotation}deg)` : undefined,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, element.id)}
                  onClick={(e) => handleElementClick(e, element.id)}
                >
                  {element.type === 'text' ? (
                    editingElement === element.id ? (
                      <textarea
                        value={element.text || ''}
                        onChange={(e) => updateElement(element.id, { text: e.target.value })}
                        onBlur={() => {
                          setEditingElement(null);
                          if (isMobile) showMobileToolbarStable(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setEditingElement(null);
                            if (isMobile) showMobileToolbarStable(true);
                          }
                        }}
                        autoFocus
                        className={`w-full h-full resize-none border-2 border-blue-400 outline-none bg-white bg-opacity-95 rounded ${isMobile ? 'p-3 text-base' : 'p-2'}`}
                        style={{
                          fontSize: elementStyles.fontSize,
                          fontWeight: elementStyles.fontWeight,
                          fontStyle: elementStyles.fontStyle,
                          color: elementStyles.color,
                          lineHeight: elementStyles.lineHeight,
                          textAlign: elementStyles.textAlign as any,
                        }}
                        placeholder="Type your text here..."
                      />
                    ) : (
                      <div 
                        className={`whitespace-pre-wrap break-words ${isMobile ? 'p-3' : 'p-2'}`}
                        style={{
                          textAlign: elementStyles.textAlign as any,
                          fontStyle: elementStyles.fontStyle,
                        }}
                      >
                        {element.text}
                      </div>
                    )
                  ) : element.type === 'image' ? (
                    <img
                      src={element.src}
                      alt="Slide element"
                      className="w-full h-auto object-contain"
                      draggable={false}
                    />
                  ) : element.type === 'shape' ? (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundColor: elementStyles.backgroundColor,
                        borderRadius: elementStyles.borderRadius,
                        border: elementStyles.border,
                        boxShadow: elementStyles.boxShadow,
                      }}
                    />
                  ) : null}

                  {/* Element locked indicator */}
                  {element.locked && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <Lock className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>
                );
              })}

              {/* Instructions */}
              {editingElement && (
                <div className={`absolute ${isMobile ? 'top-2 left-2 text-xs' : 'top-4 right-4 text-sm'} bg-green-600 text-white px-3 py-1 rounded z-50`}>
                  Editing • {isMobile ? 'Tap outside to finish' : 'Click outside to finish'}
                </div>
              )}
              
              {selectedElement && !editingElement && (
                <div className={`absolute ${isMobile ? 'top-2 left-2 text-xs' : 'top-4 right-4 text-sm'} bg-blue-600 text-white px-3 py-1 rounded z-50`}>
                  Selected • {isMobile ? 'Tap again to edit • Double-tap canvas to deselect' : 'Click again to edit • Double-click canvas to deselect'}
                </div>
              )}
              
              {!selectedElement && !editingElement && (
                <div className={`absolute ${isMobile ? 'top-2 left-2 text-xs' : 'top-4 right-4 text-sm'} bg-gray-600 text-white px-3 py-1 rounded opacity-75 z-50`}>
                  {isMobile ? 'Tap an element to select' : 'Click an element to select'}
                </div>
              )}
            </div>
          </div>

          {/* Mobile slide navigation */}
          {isMobile && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center space-x-4 bg-white rounded-full shadow-lg px-4 py-2 z-[50] border border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className="w-8 h-8 p-0"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
              </Button>
              
              <span className="text-xs font-medium text-gray-700 px-2 whitespace-nowrap">
                {currentSlide + 1} / {editableSlides.length}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentSlide(Math.min(editableSlides.length - 1, currentSlide + 1))}
                disabled={currentSlide === editableSlides.length - 1}
                className="w-8 h-8 p-0"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Status */}
          {!isMobile && (
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span>Slide {currentSlide + 1} of {editableSlides.length}</span>
                {isAutoSaving && (
                  <div className="flex items-center space-x-1 text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Saving...</span>
                  </div>
                )}
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Side Panels */}
        {showTemplates && <TemplatesPanel />}
        {showLayers && <LayersPanel />}
      </div>

      {/* Mobile Formatting Toolbar (slides up from bottom) */}
      <MobileToolbar />

      {/* Mobile FAB for selected element */}
      {isMobile && selectedElement && !showMobileToolbar && selectedElementData?.type === 'text' && (
        <Button
          onClick={() => showMobileToolbarStable(true)}
          className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-[50]"
        >
          <Edit3 className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Mobile action FABs */}
      {isMobile && selectedElement && !showMobileToolbar && (
        <>
          <Button
            onClick={() => selectedElement && duplicateElement(selectedElement)}
            className="fixed bottom-20 left-4 w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 shadow-lg z-[50]"
          >
            <Copy className="h-4 w-4 text-white" />
          </Button>
          
          <Button
            onClick={() => selectedElement && deleteElement(selectedElement)}
            variant="outline"
            className="fixed bottom-36 right-4 w-12 h-12 rounded-full border-red-300 bg-white text-red-600 hover:bg-red-50 shadow-lg z-[50]"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Mobile Add New Slide FAB */}
      {isMobile && (
        <Button
          onClick={() => addNewSlide()}
          className="fixed bottom-36 left-4 w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg z-[50]"
        >
          <PlusCircle className="h-4 w-4 text-white" />
        </Button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Toast notifications */}
      <div className={`fixed ${isMobile ? 'bottom-20 right-4' : 'bottom-4 right-4'} z-40 space-y-2`}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3 rounded-lg shadow-lg text-white transition-all ${
              toast.type === 'success' ? 'bg-green-600' :
              toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
} 