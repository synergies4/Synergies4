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

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

const messageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 }
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
  const [showProviderSettings, setShowProviderSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    // Scroll to bottom within the messages container
    if (messagesEndRef.current) {
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
      content: `Hello! I'm your AI learning companion. I'm here to help you with questions about business, technology, leadership, and professional development. I can also help you generate images, create presentations, and analyze documents. How can I assist you today?`,
      timestamp: new Date(),
      provider: selectedProvider
    };
    setMessages([welcomeMessage]);
  }, []);

  // Temporarily disabled auto-scroll to prevent page jumping
  // useEffect(() => {
  //   if (messages.length > 1) {
  //     // Small delay to ensure the message is rendered before scrolling
  //     setTimeout(() => {
  //       scrollToBottom();
  //     }, 100);
  //   }
  // }, [messages]);

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
      const formData = new FormData();
      formData.append('message', inputMessage.trim());
      formData.append('provider', selectedProvider);
      formData.append('history', JSON.stringify(messages.slice(-10)));
      
      // Add file attachments
      attachments.forEach((attachment, index) => {
        // In a real implementation, you'd upload the actual file
        formData.append(`attachment_${index}`, attachment.name);
      });

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
        imageUrl: data.imageUrl // For generated images
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
      content: `Hello! I'm your AI learning companion. I'm here to help you with questions about business, technology, leadership, and professional development. I can also help you generate images, create presentations, and analyze documents. How can I assist you today?`,
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
    <main className="min-h-screen">
      {/* Countdown Banner */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-sm md:text-base"
            >
              🚀 Expand your potential through learning. Offering earlybirds a discount of $295.00.
            </motion.p>
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {['00 Days', '00 Hours', '00 Minutes', '00 Seconds'].map((time, index) => (
                <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                  {time}
                </Badge>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.nav 
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link href="/" className="flex items-center">
                <motion.span 
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.02,
                    textShadow: "0 0 8px rgba(59, 130, 246, 0.5)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  Synergies4
                </motion.span>
              </Link>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['About Us', 'Courses', 'Coaching', 'Consulting', 'Industry Insight'].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                >
                  <Link 
                    href={
                      item === 'About Us' ? '/about-us' :
                      item === 'Courses' ? '/courses' :
                      item === 'Coaching' ? '/coaching' : 
                      item === 'Consulting' ? '/consulting' : 
                      item === 'Industry Insight' ? '/industry-insight' :
                      `/${item.toLowerCase().replace(' ', '-')}`
                    } 
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
              
              {/* Synergize Button */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button 
                    asChild 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                  >
                    <Link href="/synergize">
                      {/* Subtle shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                      <span className="relative z-10 flex items-center">
                        <Brain className="w-4 h-4 mr-2" />
                        Synergize
                      </span>
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
              
              {/* Contact Button */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button 
                    asChild 
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                  >
                    <Link href="/contact">
                      {/* Subtle shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                      <span className="relative z-10 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact
                      </span>
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
            
            {/* Desktop Auth */}
            <motion.div 
              className="hidden md:flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {user ? (
                <UserAvatar />
              ) : (
                <>
                  <Button variant="ghost" asChild className="hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 transition-colors">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </motion.div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
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
                transition={{ duration: 0.3 }}
                className="md:hidden border-t bg-white/95 backdrop-blur-md overflow-hidden"
              >
                <div className="px-4 py-4 space-y-4">
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
                      className="block text-gray-600 hover:text-blue-600 transition-colors font-medium py-2 text-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  ))}
                  
                  {/* Mobile Buttons */}
                  <div className="pt-2 space-y-3">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Button 
                        asChild 
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group text-lg py-3"
                      >
                        <Link href="/synergize" onClick={() => setMobileMenuOpen(false)}>
                          <span className="relative z-10 flex items-center justify-center">
                            <Brain className="w-4 h-4 mr-2" />
                            Synergize
                          </span>
                        </Link>
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Button 
                        asChild 
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group text-lg py-3"
                      >
                        <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                          <span className="relative z-10 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Contact Us
                          </span>
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                  
                  {/* Mobile Auth */}
                  <div className="pt-4 border-t space-y-3">
                    {user ? (
                      <div className="flex items-center space-x-2">
                        <UserAvatar />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button variant="ghost" className="w-full justify-start text-lg py-3" asChild>
                          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                            Login
                          </Link>
                        </Button>
                        <Button className="w-full text-lg py-3" asChild>
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 md:py-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating particles */}
          <div className="hidden md:block">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-40"
                style={{
                  left: `${(i * 7) % 100}%`,
                  top: `${(i * 11) % 100}%`,
                }}
                animate={{
                  y: [0, -50, 0],
                  x: [0, (i % 2 === 0 ? 15 : -15), 0],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 4 + (i % 3),
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <Badge className="mb-4 md:mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Learning Assistant
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Synergize
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-600 mb-4 md:mb-6 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            Your intelligent learning companion powered by advanced AI. Get instant answers, personalized guidance, and expert insights on business, technology, and professional development.
          </motion.p>
        </div>
      </section>

      {/* Chat Interface */}
      <section className="py-8 bg-gray-50 min-h-[calc(100vh-400px)]">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-[600px] flex flex-col shadow-xl">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl">
                    <Bot className="w-6 h-6 mr-2 text-blue-600" />
                    AI Learning Assistant
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {/* Provider Selection */}
                    <Select value={selectedProvider} onValueChange={(value: AIProvider) => setSelectedProvider(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anthropic">
                          <div className="flex items-center">
                            <span className="mr-2">🧠</span>
                            Claude
                          </div>
                        </SelectItem>
                        <SelectItem value="openai">
                          <div className="flex items-center">
                            <span className="mr-2">⚡</span>
                            GPT
                          </div>
                        </SelectItem>
                        <SelectItem value="google">
                          <div className="flex items-center">
                            <span className="mr-2">✨</span>
                            Gemini
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearChat}
                      className="flex items-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear Chat
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        variants={messageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start space-x-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            message.role === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : message.provider 
                                ? `bg-gradient-to-r ${providerConfig[message.provider].color} text-white`
                                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                          }`}>
                            {message.role === 'user' ? (
                              <UserIcon className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </div>
                          <div className={`rounded-lg p-3 relative break-words ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : message.provider
                                ? `${providerConfig[message.provider].bgColor} border shadow-sm`
                                : 'bg-white border shadow-sm'
                          }`}>
                            {/* Message Content */}
                            <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                              {message.content}
                            </div>
                            
                            {/* File Attachments */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((attachment) => (
                                  <div key={attachment.id} className="flex items-center space-x-2 text-xs bg-gray-100 rounded p-2">
                                    <FileText className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate flex-1 min-w-0">{attachment.name}</span>
                                    <span className="text-gray-500 flex-shrink-0">({formatFileSize(attachment.size)})</span>
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
                                  {providerConfig[message.provider].icon} {providerConfig[message.provider].name}
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
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-start space-x-2 max-w-[85%]">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${providerConfig[selectedProvider].color} text-white flex items-center justify-center`}>
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className={`${providerConfig[selectedProvider].bgColor} border shadow-sm rounded-lg p-3`}>
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
                          <span className="truncate flex-1 min-w-0">{attachment.name}</span>
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
                <div className="border-t p-4 bg-white flex-shrink-0">
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
                      className="flex-shrink-0"
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
                      className="flex-shrink-0"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    
                    <Textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about business, technology, or professional development..."
                      className="flex-1 min-h-[44px] max-h-32 resize-none"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={(!inputMessage.trim() && attachments.length === 0) || isLoading}
                      className={`bg-gradient-to-r ${providerConfig[selectedProvider].color} hover:opacity-90 flex-shrink-0`}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="bg-gray-900 text-white py-16"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.span 
                className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 block"
              >
                Synergies4
              </motion.span>
              <p className="text-gray-400 mb-4">
                AI-powered learning tailored uniquely to you and your organization.
              </p>
              <div className="flex space-x-4">
                {['Facebook', 'Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                  <a key={social} href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">{social}</span>
                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                  </a>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold mb-4">Courses</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Agile & Scrum</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Product Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Leadership</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Analysis</a></li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about-us" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/coaching" className="hover:text-white transition-colors">Coaching</Link></li>
                <li><Link href="/consulting" className="hover:text-white transition-colors">Consulting</Link></li>
              </ul>
              
              {/* Distinctive Contact Button in Footer */}
              <div className="mt-6">
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button 
                    asChild 
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group w-full"
                  >
                    <Link href="/contact">
                      {/* Subtle shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                      <span className="relative z-10 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Us
                      </span>
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </motion.div>
          </div>

          <Separator className="bg-gray-800 mb-8" />

          <motion.div 
            className="text-center text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <p>&copy; {new Date().getFullYear()} Synergies4 LLC. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Synergies4™, PocketCoachAI™, Adaptive Content Pods™ are trademarks of Synergies4 LLC.
            </p>
          </motion.div>
        </div>
      </motion.footer>
    </main>
  );
} 