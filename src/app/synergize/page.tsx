'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Send,
  Bot,
  User as UserIcon,
  MessageSquare,
  Menu,
  X,
  Sparkles,
  Brain,
  Zap,
  RefreshCw,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  FileText,
  Presentation,
  Settings,
  Palette
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  provider?: 'anthropic' | 'openai' | 'google';
  attachments?: FileAttachment[];
  imageUrl?: string;
}

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

type AIProvider = 'anthropic' | 'openai' | 'google';

const providerConfig = {
  anthropic: {
    name: 'Claude',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    icon: '🧠'
  },
  openai: {
    name: 'GPT',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    icon: '⚡'
  },
  google: {
    name: 'Gemini',
    color: 'from-blue-500 to-purple-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: '✨'
  }
};

// Simplified animations for better mobile performance
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" }
};

const messageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export default function SynergizePage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('anthropic');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current && chatContainerRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm your AI learning assistant. How can I help you today?`,
      timestamp: new Date(),
      provider: selectedProvider
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const attachment: FileAttachment = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      };
      setAttachments(prev => [...prev, attachment]);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && attachments.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      attachments: [...attachments]
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setAttachments([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          provider: selectedProvider,
          history: messages.slice(-10),
          attachments: attachments.map(att => ({
            name: att.name,
            type: att.type,
            size: att.size
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        provider: selectedProvider,
        imageUrl: data.imageUrl
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again later.',
        timestamp: new Date(),
        provider: selectedProvider
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage();
    }
  };

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const clearChat = () => {
    const welcomeMessage: Message = {
      id: 'welcome-new',
      role: 'assistant',
      content: `Hi! I'm your AI learning assistant. How can I help you today?`,
      timestamp: new Date(),
      provider: selectedProvider
    };
    setMessages([welcomeMessage]);
  };

  const generateImage = async (prompt: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          provider: selectedProvider
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const imageMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `I've generated an image based on your prompt: "${prompt}"`,
          timestamp: new Date(),
          provider: selectedProvider,
          imageUrl: data.imageUrl
        };
        setMessages(prev => [...prev, imageMessage]);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Countdown Banner */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 md:py-3 flex-shrink-0"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center">
            <p className="text-xs md:text-sm">
              🚀 Expand your potential through learning. Offering earlybirds a discount of $295.00.
            </p>
            <div className="flex gap-1 md:gap-2">
              {['00 Days', '00 Hours', '00 Minutes', '00 Seconds'].map((time, index) => (
                <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30 text-xs px-1 py-0">
                  {time}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.nav 
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm flex-shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link href="/" className="flex items-center">
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Synergies4
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {['About Us', 'Courses', 'Coaching', 'Consulting', 'Industry Insight'].map((item) => (
                <Link 
                  key={item}
                  href={
                    item === 'About Us' ? '/about-us' :
                    item === 'Courses' ? '/courses' :
                    item === 'Coaching' ? '/coaching' : 
                    item === 'Consulting' ? '/consulting' : 
                    item === 'Industry Insight' ? '/industry-insight' :
                    `/${item.toLowerCase().replace(' ', '-')}`
                  } 
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  {item}
                </Link>
              ))}
              
              <Button 
                asChild 
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <Link href="/synergize">
                  <Brain className="w-4 h-4 mr-1" />
                  Synergize
                </Link>
              </Button>
              
              <Button 
                asChild 
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                <Link href="/contact">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Contact
                </Link>
              </Button>
            </div>
            
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                <UserAvatar />
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden border-t bg-white/95 backdrop-blur-md overflow-hidden"
              >
                <div className="px-4 py-4 space-y-3">
                  {['About Us', 'Courses', 'Coaching', 'Consulting', 'Industry Insight'].map((item) => (
                    <Link
                      key={item}
                      href={
                        item === 'About Us' ? '/about-us' :
                        item === 'Courses' ? '/courses' :
                        item === 'Coaching' ? '/coaching' : 
                        item === 'Consulting' ? '/consulting' : 
                        item === 'Industry Insight' ? '/industry-insight' :
                        `/${item.toLowerCase().replace(' ', '-')}`
                      }
                      className="block text-gray-600 hover:text-blue-600 transition-colors font-medium py-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  ))}
                  
                  <div className="pt-2 space-y-2">
                    <Button 
                      asChild 
                      size="sm"
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      <Link href="/synergize" onClick={() => setMobileMenuOpen(false)}>
                        <Brain className="w-4 h-4 mr-2" />
                        Synergize
                      </Link>
                    </Button>
                    
                    <Button 
                      asChild 
                      size="sm"
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    >
                      <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Us
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="pt-2 border-t space-y-2">
                    {user ? (
                      <UserAvatar />
                    ) : (
                      <div className="space-y-2">
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                            Login
                          </Link>
                        </Button>
                        <Button size="sm" className="w-full" asChild>
                          <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                            Sign Up
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section - Simplified for mobile */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 md:py-12 flex-shrink-0">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-3 md:mb-4 bg-blue-100 text-blue-700">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            AI-Powered Learning Assistant
          </Badge>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Synergize
            </span>
          </h1>
          <p className="text-sm md:text-lg text-gray-600 mb-4 md:mb-6 max-w-2xl mx-auto leading-relaxed">
            Your AI learning companion. Get instant answers and personalized guidance.
          </p>
        </div>
      </section>

      {/* Chat Interface - Mobile Optimized */}
      <section className="flex-1 bg-gray-50 flex flex-col min-h-0">
        <div className="container mx-auto px-2 md:px-4 max-w-4xl flex-1 flex flex-col py-2 md:py-4 min-h-0">
          <Card className="flex-1 flex flex-col shadow-lg min-h-0 max-h-full">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg md:text-xl">
                  <Bot className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-600" />
                  <span className="hidden sm:inline">AI Learning Assistant</span>
                  <span className="sm:hidden">AI Assistant</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {/* Provider Selection */}
                  <Select value={selectedProvider} onValueChange={(value: AIProvider) => setSelectedProvider(value)}>
                    <SelectTrigger className="w-20 md:w-32 h-8 md:h-10 text-xs md:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anthropic">
                        <div className="flex items-center">
                          <span className="mr-1 md:mr-2">🧠</span>
                          <span className="hidden md:inline">Claude</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="openai">
                        <div className="flex items-center">
                          <span className="mr-1 md:mr-2">⚡</span>
                          <span className="hidden md:inline">GPT</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="google">
                        <div className="flex items-center">
                          <span className="mr-1 md:mr-2">✨</span>
                          <span className="hidden md:inline">Gemini</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearChat}
                    className="h-8 md:h-10 px-2 md:px-3"
                  >
                    <RefreshCw className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
                    <span className="hidden md:inline">Clear</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
              {/* Messages */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3 md:space-y-4"
                style={{ 
                  height: 'calc(100vh - 500px)',
                  minHeight: '300px',
                  maxHeight: 'calc(100vh - 400px)'
                }}
              >
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[90%] md:max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : message.provider 
                              ? `bg-gradient-to-r ${providerConfig[message.provider].color} text-white`
                              : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        }`}>
                          {message.role === 'user' ? (
                            <UserIcon className="w-3 h-3 md:w-4 md:h-4" />
                          ) : (
                            <Bot className="w-3 h-3 md:w-4 md:h-4" />
                          )}
                        </div>
                        <div className={`rounded-lg p-2 md:p-3 relative ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : message.provider
                              ? `${providerConfig[message.provider].bgColor} border shadow-sm`
                              : 'bg-white border shadow-sm'
                        }`}>
                          {/* Message Content */}
                          <div className="whitespace-pre-wrap text-sm leading-relaxed break-words overflow-wrap-anywhere">
                            {message.content}
                          </div>
                          
                          {/* File Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment) => (
                                <div key={attachment.id} className="flex items-center space-x-2 text-xs bg-gray-100 rounded p-2">
                                  <FileText className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate flex-1 min-w-0">{attachment.name}</span>
                                  <span className="text-gray-500 flex-shrink-0 text-xs">({formatFileSize(attachment.size)})</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Generated Image */}
                          {message.imageUrl && (
                            <div className="mt-2">
                              <img 
                                src={message.imageUrl} 
                                alt="Generated image" 
                                className="max-w-full h-auto rounded-lg shadow-sm"
                              />
                            </div>
                          )}
                          
                          {/* Provider Badge for Assistant Messages */}
                          {message.role === 'assistant' && message.provider && (
                            <div className="absolute bottom-1 right-1">
                              <Badge 
                                className={`text-xs px-1 py-0 ${providerConfig[message.provider].textColor} ${providerConfig[message.provider].bgColor} border-0`}
                              >
                                {providerConfig[message.provider].icon} <span className="hidden md:inline">{providerConfig[message.provider].name}</span>
                              </Badge>
                            </div>
                          )}
                          
                          {/* Copy Button for Assistant Messages */}
                          {message.role === 'assistant' && (
                            <div className="flex items-center justify-end mt-2 pt-2 border-t border-gray-100">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyMessage(message.content, message.id)}
                                className="h-6 px-2 text-xs"
                              >
                                {copiedMessageId === message.id ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-2 max-w-[85%]">
                      <div className={`flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r ${providerConfig[selectedProvider].color} text-white flex items-center justify-center`}>
                        <Bot className="w-3 h-3 md:w-4 md:h-4" />
                      </div>
                      <div className={`${providerConfig[selectedProvider].bgColor} border shadow-sm rounded-lg p-2 md:p-3`}>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* File Attachments Preview */}
              {attachments.length > 0 && (
                <div className="border-t p-2 bg-gray-50 flex-shrink-0">
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center space-x-2 bg-white rounded-lg p-2 border text-sm max-w-xs">
                        <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="truncate flex-1 min-w-0 text-xs">{attachment.name}</span>
                        <span className="text-gray-400 text-xs flex-shrink-0">({formatFileSize(attachment.size)})</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(attachment.id)}
                          className="h-4 w-4 p-0 text-gray-400 hover:text-red-500 flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Input */}
              <div className="border-t p-2 md:p-4 bg-white flex-shrink-0">
                <div className="flex space-x-2">
                  {/* File Upload Button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 h-10 w-10 p-0"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  
                  {/* Image Generation Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const prompt = window.prompt('Enter image description:');
                      if (prompt) generateImage(prompt);
                    }}
                    className="flex-shrink-0 h-10 w-10 p-0"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  
                  <Textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 min-h-[40px] max-h-32 resize-none text-sm"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={(!inputMessage.trim() && attachments.length === 0) || isLoading}
                    className={`bg-gradient-to-r ${providerConfig[selectedProvider].color} hover:opacity-90 flex-shrink-0 h-10 w-10 p-0`}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer - Simplified for mobile */}
      <footer className="bg-gray-900 text-white py-8 md:py-16 flex-shrink-0">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
            <div>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 block">
                Synergies4
              </span>
              <p className="text-gray-400 mb-4 text-sm">
                AI-powered learning tailored uniquely to you and your organization.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Courses</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Agile & Scrum</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Product Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Leadership</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Analysis</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/about-us" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/coaching" className="hover:text-white transition-colors">Coaching</Link></li>
                <li><Link href="/consulting" className="hover:text-white transition-colors">Consulting</Link></li>
              </ul>
              
              <div className="mt-4">
                <Button 
                  asChild 
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white w-full"
                >
                  <Link href="/contact">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <Separator className="bg-gray-800 mb-6 md:mb-8" />

          <div className="text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Synergies4 LLC. All rights reserved.</p>
            <p className="mt-2 text-xs">
              Synergies4™, PocketCoachAI™, Adaptive Content Pods™ are trademarks of Synergies4 LLC.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
} 