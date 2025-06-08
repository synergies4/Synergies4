'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
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
  Smartphone
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
  type: 'text' | 'image';
  text?: string;
  src?: string;
  style: {
    top: number;
    left: number;
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    width?: string;
    height?: string;
    maxWidth?: string;
    lineHeight?: string;
  };
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
}

interface CleanSlideEditorProps {
  slides: Slide[];
  onClose: () => void;
  presentationTitle: string;
  onSave: (slides: Slide[]) => void;
}

export default function CleanSlideEditor({ 
  slides, 
  onClose, 
  presentationTitle, 
  onSave 
}: CleanSlideEditorProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Initialize slides with elements
  const [editableSlides, setEditableSlides] = useState<Slide[]>(() => slides.map(slide => {
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
        lineHeight: '1.3'
      }
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
          lineHeight: '1.5'
        }
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
          height: 'auto'
        }
      });
    }

    return { ...slide, elements };
  }));

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [showMobileToolbar, setShowMobileToolbar] = useState(false);
  
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
    return currentSlideData.elements.find(el => el.id === selectedElement);
  }, [selectedElement, currentSlideData]);

  // Update element
  const updateElement = useCallback((id: string, updates: Partial<SlideElement>) => {
    setEditableSlides(prev => prev.map((slide, idx) => {
      if (idx === currentSlide) {
        return {
          ...slide,
          elements: slide.elements.map(element => 
            element.id === id ? { ...element, ...updates } : element
          )
        };
      }
      return slide;
    }));
  }, [currentSlide]);

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
        maxWidth: isMobile ? 'calc(100% - 40px)' : '200px'
      }
    };

    setEditableSlides(prev => prev.map((slide, idx) => {
      if (idx === currentSlide) {
        return {
          ...slide,
          elements: [...slide.elements, newElement]
        };
      }
      return slide;
    }));
    
    setSelectedElement(newElement.id);
    if (isMobile) {
      setShowMobileToolbar(true);
    }
    addToast('Text added', 'success');
  }, [currentSlide, addToast, isMobile]);

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
          height: 'auto'
        }
      };

      setEditableSlides(prev => prev.map((slide, idx) => {
        if (idx === currentSlide) {
          return {
            ...slide,
            elements: [...slide.elements, newElement]
          };
        }
        return slide;
      }));
      
      setSelectedElement(newElement.id);
      addToast('Image added', 'success');
    };
    
    reader.readAsDataURL(file);
  }, [currentSlide, addToast, isMobile]);

  // Delete element
  const deleteElement = useCallback((id: string) => {
    setEditableSlides(prev => prev.map((slide, idx) => {
      if (idx === currentSlide) {
        return {
          ...slide,
          elements: slide.elements.filter(element => element.id !== id)
        };
      }
      return slide;
    }));
    setSelectedElement(null);
    setEditingElement(null);
    setShowMobileToolbar(false);
    addToast('Element deleted', 'info');
  }, [currentSlide, addToast]);

  // Save
  const handleSave = useCallback(() => {
    try {
      onSave(editableSlides);
      addToast('Saved successfully!', 'success');
    } catch (error) {
      addToast('Failed to save', 'error');
    }
  }, [editableSlides, onSave, addToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElement) {
        deleteElement(selectedElement);
      }
      if (e.key === 'Escape') {
        setSelectedElement(null);
        setEditingElement(null);
        setShowMobileToolbar(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, deleteElement, handleSave]);

  // Improved mouse/touch handlers
  const handlePointerDown = useCallback((e: React.PointerEvent, elementId: string) => {
    e.stopPropagation();
    const element = currentSlideData?.elements.find(el => el.id === elementId);
    if (!element) return;

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

    // Select element immediately
    setSelectedElement(elementId);
    if (isMobile && element.type === 'text') {
      setShowMobileToolbar(true);
    }
  }, [currentSlideData, isMobile]);

  // Global pointer move handler
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
        const newX = Math.max(0, dragState.elementStartX + deltaX);
        const newY = Math.max(0, dragState.elementStartY + deltaY);

        updateElement(dragState.elementId, {
          style: {
            ...currentSlideData?.elements.find(el => el.id === dragState.elementId)?.style,
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
  }, [dragState, updateElement, currentSlideData, isMobile]);

  // Handle element clicks (separate from drag)
  const handleElementClick = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    
    // Only handle click if we didn't drag
    if (dragState?.hasMoved) return;

    // Get the element data for the clicked element
    const clickedElement = currentSlideData?.elements.find(el => el.id === elementId);

    if (selectedElement === elementId) {
      // Second click - enter edit mode for text
      if (clickedElement?.type === 'text') {
        setEditingElement(elementId);
        if (isMobile) {
          setShowMobileToolbar(false); // Hide toolbar while editing
        }
      }
    } else {
      // First click - select element
      setSelectedElement(elementId);
      setEditingElement(null);
      if (isMobile && clickedElement?.type === 'text') {
        setShowMobileToolbar(true);
      }
    }
  }, [selectedElement, dragState, isMobile, currentSlideData]);

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
            onClick={() => setShowMobileToolbar(false)}
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

          {/* Bold Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Bold:</span>
            <Button
              variant={selectedElementData.style.fontWeight === 'bold' || selectedElementData.style.fontWeight === '700' ? 'default' : 'outline'}
              onClick={toggleBold}
              className="w-12 h-10"
            >
              <Bold className="h-4 w-4" />
            </Button>
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
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={() => {
                setEditingElement(selectedElement);
                setShowMobileToolbar(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white h-12"
            >
              <Type className="h-4 w-4 mr-2" />
              Edit Text
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

          {/* Right section */}
          <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-3'}`}>
            <Button
              size={isMobile ? "sm" : "sm"}
              onClick={addTextElement}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Type className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${!isMobile ? 'mr-2' : ''}`} />
              {!isMobile && "Text"}
            </Button>
            
            <Button
              size={isMobile ? "sm" : "sm"}
              onClick={() => fileInputRef.current?.click()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <ImageIcon className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${!isMobile ? 'mr-2' : ''}`} />
              {!isMobile && "Image"}
            </Button>

            {selectedElement && !isMobile && (
              <Button
                size="sm"
                onClick={() => deleteElement(selectedElement)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash className="h-4 w-4" />
              </Button>
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

              {/* Bold toggle */}
              <Button
                size="sm"
                variant={selectedElementData.style.fontWeight === 'bold' || selectedElementData.style.fontWeight === '700' ? 'default' : 'outline'}
                onClick={toggleBold}
                className="w-8 h-8 p-0"
                title="Toggle bold"
              >
                <Bold className="h-3 w-3" />
              </Button>

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

            {/* Quick actions */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingElement(selectedElement)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Type className="h-3 w-3 mr-1" />
                Edit Text
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => selectedElement && deleteElement(selectedElement)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 flex ${isMobile ? 'flex-col overflow-auto' : 'overflow-hidden'}`}>
        {/* Slide Navigation - Hidden on mobile, collapsible */}
        {!isMobile && (
          <div className="w-64 bg-white border-r border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Slides</h3>
              <span className="text-xs text-gray-500">{currentSlide + 1}/{editableSlides.length}</span>
            </div>
            
            <div className="space-y-3">
              {editableSlides.map((slide, index) => (
                <div
                  key={slide.slideNumber}
                  onClick={() => setCurrentSlide(index)}
                  className={`
                    p-3 rounded-lg border cursor-pointer transition-all
                    ${currentSlide === index 
                      ? 'border-blue-500 bg-blue-50 shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center text-xs text-gray-500">
                    {slide.slideNumber}
                  </div>
                  <div className="text-xs font-medium text-gray-700 truncate">
                    {slide.elements.find(el => el.id.startsWith('title-'))?.text || slide.title}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className="flex-1"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlide(Math.min(editableSlides.length - 1, currentSlide + 1))}
                  disabled={currentSlide === editableSlides.length - 1}
                  className="flex-1"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className={`flex-1 ${isMobile ? 'p-0' : 'p-8'} ${isMobile ? 'overflow-visible' : 'overflow-auto'}`}>
          <div className={`${isMobile ? 'w-full h-full' : 'mx-auto'}`} style={!isMobile ? { 
            width: '800px', 
            height: '600px',
            maxWidth: '800px'
          } : {}}>
            <div 
              className={`slide-canvas ${isMobile ? 'w-full min-h-screen' : 'w-full h-full'} bg-white ${isMobile ? '' : 'rounded-lg shadow-lg'} ${isMobile ? 'border-0' : 'border-2 border-gray-200'} relative ${isMobile ? '' : 'overflow-hidden'}`}
              style={isMobile ? { 
                minHeight: 'calc(100vh - 80px)', // Account for header
                paddingBottom: '100px' // Space for FABs and mobile navigation
              } : {}}
              onClick={() => {
                setSelectedElement(null);
                setEditingElement(null);
                setShowMobileToolbar(false);
              }}
            >
              {/* Grid - lighter on mobile */}
              <div 
                className={`absolute inset-0 pointer-events-none ${isMobile ? 'opacity-2' : 'opacity-5'}`}
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #000 1px, transparent 1px),
                    linear-gradient(to bottom, #000 1px, transparent 1px)
                  `,
                  backgroundSize: isMobile ? '15px 15px' : '20px 20px'
                }}
              />

              {/* Elements */}
              {currentSlideData?.elements.map((element) => {
                const elementStyles = getMobileStyles(isMobile, element.style);
                return (
                <div
                  key={element.id}
                  className={`absolute select-none transition-all ${
                    selectedElement === element.id 
                      ? 'ring-2 ring-blue-500 ring-opacity-70 cursor-move' 
                      : 'hover:ring-1 hover:ring-gray-300 cursor-pointer'
                  } ${isMobile ? 'touch-manipulation' : ''}`}
                  style={{
                    ...elementStyles,
                    minHeight: isMobile ? '44px' : 'auto', // Touch target size
                    minWidth: isMobile ? '44px' : 'auto',
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
                          if (isMobile) setShowMobileToolbar(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setEditingElement(null);
                            if (isMobile) setShowMobileToolbar(true);
                          }
                        }}
                        autoFocus
                        className={`w-full h-full resize-none border-2 border-blue-400 outline-none bg-white bg-opacity-95 rounded ${isMobile ? 'p-3 text-base' : 'p-2'}`}
                        style={{
                          fontSize: elementStyles.fontSize,
                          fontWeight: elementStyles.fontWeight,
                          color: elementStyles.color,
                          lineHeight: elementStyles.lineHeight,
                        }}
                        placeholder="Type your text here..."
                      />
                    ) : (
                      <div className={`whitespace-pre-wrap break-words ${isMobile ? 'p-3' : 'p-2'}`}>{element.text}</div>
                    )
                  ) : element.type === 'image' ? (
                    <img
                      src={element.src}
                      alt="Slide element"
                      className="w-full h-auto object-contain"
                      draggable={false}
                    />
                  ) : null}
                </div>
                );
              })}

              {/* Instructions */}
              {editingElement && (
                <div className={`absolute ${isMobile ? 'top-2 left-2 text-xs' : 'top-4 right-4 text-sm'} bg-green-600 text-white px-3 py-1 rounded`}>
                  Editing • {isMobile ? 'Tap outside to finish' : 'Click outside to finish'}
                </div>
              )}
              
              {selectedElement && !editingElement && (
                <div className={`absolute ${isMobile ? 'top-2 left-2 text-xs' : 'top-4 right-4 text-sm'} bg-blue-600 text-white px-3 py-1 rounded`}>
                  Selected • {isMobile ? 'Tap again to edit • Drag to move' : 'Click again to edit • Drag to move'}
                </div>
              )}
              
              {!selectedElement && !editingElement && (
                <div className={`absolute ${isMobile ? 'top-2 left-2 text-xs' : 'top-4 right-4 text-sm'} bg-gray-600 text-white px-3 py-1 rounded opacity-75`}>
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
      </div>

      {/* Mobile Formatting Toolbar (slides up from bottom) */}
      <MobileToolbar />

      {/* Mobile FAB for selected element */}
      {isMobile && selectedElement && !showMobileToolbar && selectedElementData?.type === 'text' && (
        <Button
          onClick={() => setShowMobileToolbar(true)}
          className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-[50]"
        >
          <Edit3 className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Mobile delete FAB */}
      {isMobile && selectedElement && !showMobileToolbar && (
        <Button
          onClick={() => deleteElement(selectedElement)}
          variant="outline"
          className="fixed bottom-20 left-4 w-12 h-12 rounded-full border-red-300 bg-white text-red-600 hover:bg-red-50 shadow-lg z-[50]"
        >
          <Trash className="h-4 w-4" />
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