'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  X, 
  FileText, 
  BookOpen, 
  User, 
  Globe, 
  Loader2,
  ArrowRight,
  Clock,
  Star,
  Tag,
  Filter,
  Mic,
  MicOff
} from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  content?: string;
  type: 'course' | 'blog_post' | 'page' | 'user';
  url: string;
  category?: string;
  tags?: string[];
  image?: string;
  author?: string;
  created_at: string;
  relevance_score: number;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  suggestions: string[];
  categories: string[];
  types: string[];
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
  showFilters?: boolean;
}

export default function GlobalSearch({ 
  isOpen, 
  onClose, 
  placeholder = "Search courses, articles, pages...",
  showFilters = true 
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Check for speech recognition support
  useEffect(() => {
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
          setQuery(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      // Prevent body scroll when search is open
      const scrollY = document.documentElement.style.getPropertyValue('--scroll-y');
      const body = document.body;
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.overflow = 'hidden';
      body.style.width = '100%';
    } else {
      // Restore body scroll when search is closed
      const body = document.body;
      const scrollY = body.style.top;
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.overflow = '';
      body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup function to restore scroll
    return () => {
      const body = document.body;
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.overflow = '';
      body.style.width = '';
    };
  }, [isOpen]);

  // Store scroll position for scroll lock
  useEffect(() => {
    const updateScrollY = () => {
      document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
    };
    document.addEventListener('scroll', updateScrollY);
    updateScrollY();
    return () => document.removeEventListener('scroll', updateScrollY);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length > 1) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch();
      }, 300);
    } else {
      setResults([]);
      setSuggestions([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, selectedType, selectedCategory]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        limit: '10'
      });

      if (selectedType !== 'all') {
        params.append('type', selectedType);
      }

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/search?${params}`);
      const data: SearchResponse = await response.json();

      setResults(data.results);
      setSuggestions(data.suggestions);
      setCategories(['all', ...data.categories]);
      setTypes(['all', ...data.types]);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    onClose();
    setQuery('');
    setResults([]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const startVoiceSearch = () => {
    if (recognitionRef.current && speechSupported) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'blog_post':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'user':
        return <User className="w-4 h-4 text-purple-600" />;
      case 'page':
        return <Globe className="w-4 h-4 text-orange-600" />;
      default:
        return <Search className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'bg-blue-100 text-blue-800';
      case 'blog_post':
        return 'bg-green-100 text-green-800';
      case 'user':
        return 'bg-purple-100 text-purple-800';
      case 'page':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm">
      <div className="flex items-start justify-center min-h-screen pt-[5vh] sm:pt-[10vh] px-2 sm:px-4">
        <Card className="w-full max-w-3xl bg-white shadow-2xl border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {/* Search Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 sm:h-5 w-4 sm:w-5" />
                  <Input
                    ref={searchInputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="pl-10 sm:pl-12 pr-12 sm:pr-16 h-12 sm:h-14 text-base sm:text-lg border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-xl bg-white text-gray-900 placeholder:text-gray-500"
                  />
                  {speechSupported && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                      className={`absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-2 ${
                        isListening ? 'text-red-600 hover:text-red-700' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-12 sm:h-14 w-12 sm:w-14 rounded-xl flex-shrink-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Filters - Mobile Optimized */}
              {showFilters && (categories.length > 1 || types.length > 1) && (
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-4">
                  {types.length > 1 && (
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="flex-1 sm:flex-initial text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 min-w-0"
                      >
                        <option value="all">All Types</option>
                        <option value="course">Courses</option>
                        <option value="blog_post">Articles</option>
                        <option value="page">Pages</option>
                      </select>
                    </div>
                  )}

                  {categories.length > 1 && (
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex-1 sm:flex-initial text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 min-w-0"
                    >
                      <option value="all">All Categories</option>
                      {categories.filter(cat => cat !== 'all').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Voice feedback - Mobile Optimized */}
              {isListening && (
                <div className="mt-4 flex items-center space-x-2 text-red-600 bg-red-50 rounded-lg p-3 border border-red-200">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Listening for your voice...</span>
                  <div className="ml-auto text-xs text-red-500">Tap mic to stop</div>
                </div>
              )}

              {/* Mobile tip for voice search */}
              {speechSupported && !isListening && query.length === 0 && (
                <div className="mt-4 sm:hidden bg-teal-50 border border-teal-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-teal-700">
                    <Mic className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">Tip: Tap the microphone to search using your voice</span>
                  </div>
                </div>
              )}
            </div>

            {/* Search Results - Mobile Optimized */}
            <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-teal-600 mr-2" />
                  <span className="text-gray-600">Searching...</span>
                </div>
              )}

              {!loading && query.length > 1 && results.length === 0 && (
                <div className="text-center py-8 sm:py-12 px-4">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-500 text-sm sm:text-base">Try adjusting your search terms or filters</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="p-3 sm:p-4 space-y-2">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="group p-3 sm:p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200 active:bg-gray-100"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                          {getResultIcon(result.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900 truncate group-hover:text-teal-600 transition-colors text-sm sm:text-base">
                              {result.title}
                            </h4>
                            <Badge className={`text-xs w-fit ${getTypeBadgeColor(result.type)}`}>
                              {result.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {result.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                            {result.category && (
                              <div className="flex items-center space-x-1">
                                <Tag className="h-3 w-3" />
                                <span>{result.category}</span>
                              </div>
                            )}
                            {result.author && (
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{result.author}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(result.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-teal-600 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Suggestions - Mobile Optimized */}
              {suggestions.length > 0 && (
                <div className="border-t border-gray-100 p-3 sm:p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Suggestions</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-sm px-3 py-2 bg-gray-100 hover:bg-teal-100 hover:text-teal-700 rounded-full transition-colors active:bg-teal-200 text-gray-700"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Tips - Mobile Optimized */}
            {query.length === 0 && (
              <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Search Tips</h4>
                <div className="grid grid-cols-1 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="font-medium mb-2 text-gray-700">Popular searches:</p>
                    <div className="flex flex-wrap gap-2">
                      {['agile training', 'scrum master', 'leadership development'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium mb-1 text-gray-700">Search across:</p>
                    <ul className="space-y-1 text-xs text-gray-600">
                      <li>• Training courses</li>
                      <li>• Blog articles</li>
                      <li>• Site pages</li>
                    </ul>
                  </div>
                  {speechSupported && (
                    <div className="sm:hidden">
                      <p className="font-medium mb-1 text-gray-700">Voice search:</p>
                      <p className="text-xs text-gray-600">Tap the microphone icon to search using your voice</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 