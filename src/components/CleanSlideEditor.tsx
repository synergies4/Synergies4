'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
  Minus
} from 'lucide-react';

// Simple toast hook
const useToast = () => {
  const [toasts, setToasts] = useState<Array<{id: string, message: string, type: 'success' | 'error' | 'info'}>>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
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
  const [editableSlides, setEditableSlides] = useState<Slide[]>(slides.map(slide => {
    // Initialize elements if they don't exist
    if (slide.elements && slide.elements.length > 0) {
      return slide;
    }

    const elements: SlideElement[] = [];
    
    // Add title element
    elements.push({
      id: `title-${slide.slideNumber}`,
      type: 'text',
      text: slide.title,
      style: {
        top: 80,
        left: 60,
        fontSize: '32px',
        fontWeight: '600',
        color: '#1f2937',
        maxWidth: '680px'
      }
    });

    // Add content elements
    slide.content.forEach((content, idx) => {
      elements.push({
        id: `content-${slide.slideNumber}-${idx}`,
        type: 'text',
        text: `• ${content}`,
        style: {
          top: 140 + (idx * 45),
          left: 80,
          fontSize: '18px',
          fontWeight: '400',
          color: '#374151',
          maxWidth: '640px',
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
          top: 200,
          left: 450,
          width: '200px',
          height: 'auto'
        }
      });
    }

    return { ...slide, elements };
  }));

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [dragData, setDragData] = useState<{
    id: string;
    startX: number;
    startY: number;
    elementX: number;
    elementY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

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
    updateTextStyle({ fontSize: `${Math.min(currentSize + 2, 72)}px` });
  }, [selectedElementData, updateTextStyle]);

  const decreaseFontSize = useCallback(() => {
    if (!selectedElementData?.style.fontSize) return;
    const currentSize = parseInt(selectedElementData.style.fontSize);
    updateTextStyle({ fontSize: `${Math.max(currentSize - 2, 8)}px` });
  }, [selectedElementData, updateTextStyle]);

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
      text: 'Click to edit',
      style: {
        top: 300,
        left: 300,
        fontSize: '18px',
        fontWeight: '400',
        color: '#374151',
        width: '200px'
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
    addToast('Text added', 'success');
  }, [currentSlide, addToast]);

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
          top: 200,
          left: 400,
          width: '200px',
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
  }, [currentSlide, addToast]);

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
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, deleteElement, handleSave]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = currentSlideData?.elements.find(el => el.id === elementId);
    if (!element) return;

    setDragData({
      id: elementId,
      startX: e.clientX,
      startY: e.clientY,
      elementX: element.style.left,
      elementY: element.style.top
    });
    setSelectedElement(elementId);
    setIsDragging(false);
  }, [currentSlideData]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragData) return;

      const deltaX = e.clientX - dragData.startX;
      const deltaY = e.clientY - dragData.startY;
      
      // If we've moved more than 5 pixels, consider it a drag
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setIsDragging(true);
      }

      const newX = Math.max(0, dragData.elementX + deltaX);
      const newY = Math.max(0, dragData.elementY + deltaY);

      updateElement(dragData.id, {
        style: {
          ...currentSlideData?.elements.find(el => el.id === dragData.id)?.style,
          left: newX,
          top: newY
        }
      });
    };

    const handleMouseUp = () => {
      setDragData(null);
      // Reset dragging after a short delay to allow click handler to check
      setTimeout(() => setIsDragging(false), 100);
    };

    if (dragData) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragData, updateElement, currentSlideData]);

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-lg font-semibold text-gray-900">{presentationTitle}</h1>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              onClick={addTextElement}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Type className="h-4 w-4 mr-2" />
              Text
            </Button>
            
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Image
            </Button>

            {selectedElement && (
              <Button
                size="sm"
                onClick={() => deleteElement(selectedElement)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Formatting Panel - appears when text element is selected */}
      {selectedElementData?.type === 'text' && (
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

      <div className="flex-1 flex overflow-hidden">
        {/* Slide Navigation */}
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

        {/* Canvas */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="mx-auto" style={{ width: '800px', height: '600px' }}>
            <div 
              className="w-full h-full bg-white rounded-lg shadow-lg border-2 border-gray-200 relative overflow-hidden"
              onClick={() => {
                setSelectedElement(null);
                setEditingElement(null);
              }}
            >
              {/* Grid */}
              <div 
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #000 1px, transparent 1px),
                    linear-gradient(to bottom, #000 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Elements */}
              {currentSlideData?.elements.map((element) => (
                <div
                  key={element.id}
                  className={`absolute cursor-pointer select-none transition-all ${
                    selectedElement === element.id 
                      ? 'ring-2 ring-blue-500 ring-opacity-70' 
                      : 'hover:ring-1 hover:ring-gray-300'
                  }`}
                  style={{
                    top: element.style.top,
                    left: element.style.left,
                    width: element.style.width,
                    height: element.style.height,
                    fontSize: element.style.fontSize,
                    fontWeight: element.style.fontWeight,
                    color: element.style.color,
                    maxWidth: element.style.maxWidth,
                    lineHeight: element.style.lineHeight,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, element.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Only handle clicks if we weren't dragging
                    if (!isDragging) {
                      if (selectedElement === element.id) {
                        if (element.type === 'text') {
                          setEditingElement(element.id);
                        }
                      } else {
                        setSelectedElement(element.id);
                        setEditingElement(null);
                      }
                    }
                  }}
                >
                  {element.type === 'text' ? (
                    editingElement === element.id ? (
                      <textarea
                        value={element.text || ''}
                        onChange={(e) => updateElement(element.id, { text: e.target.value })}
                        onBlur={() => setEditingElement(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setEditingElement(null);
                          }
                        }}
                        autoFocus
                        className="w-full h-full resize-none border-2 border-blue-400 outline-none bg-white bg-opacity-95 rounded p-2"
                        style={{
                          fontSize: element.style.fontSize,
                          fontWeight: element.style.fontWeight,
                          color: element.style.color,
                          lineHeight: element.style.lineHeight,
                        }}
                        placeholder="Type your text here..."
                      />
                    ) : (
                      <div className="whitespace-pre-wrap break-words p-2">{element.text}</div>
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
              ))}

              {/* Instructions */}
              {editingElement && (
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded text-sm">
                  Editing • Click outside to finish
                </div>
              )}
              
              {selectedElement && !editingElement && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded text-sm">
                  Selected • Click again to edit • Drag to move
                </div>
              )}
              
              {!selectedElement && !editingElement && (
                <div className="absolute top-4 right-4 bg-gray-600 text-white px-3 py-1 rounded text-sm opacity-75">
                  Click an element to select
                </div>
              )}
            </div>
          </div>

          {/* Status */}
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
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
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