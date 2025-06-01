'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Brain
} from 'lucide-react';

// Provider configurations
const PROVIDERS = {
  anthropic: {
    name: 'Claude',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    badge: 'Anthropic',
    badgeColor: 'bg-orange-100 text-orange-800'
  },
  openai: {
    name: 'GPT',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    badge: 'OpenAI',
    badgeColor: 'bg-green-100 text-green-800'
  },
  google: {
    name: 'Gemini',
    color: 'from-blue-500 to-purple-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    badge: 'Google',
    badgeColor: 'bg-blue-100 text-blue-800'
  }
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: keyof typeof PROVIDERS;
  timestamp: Date;
}

interface FileUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
}

export default function SynergizeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<keyof typeof PROVIDERS>('anthropic');
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    
    uploadedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile: FileUpload = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          content: e.target?.result as string
        };
        setFiles(prev => [...prev, newFile]);
      };
      reader.readAsText(file);
    });
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const sendMessage = async () => {
    if (!input.trim() && files.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          provider: selectedProvider,
          files: files.map(f => ({ name: f.name, content: f.content }))
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        provider: selectedProvider,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setFiles([]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        provider: selectedProvider,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateImage = async () => {
    if (!imagePrompt.trim()) return;

    setIsGeneratingImage(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt })
      });

      if (!response.ok) throw new Error('Failed to generate image');

      const data = await response.json();
      
      const imageMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Generated image for: "${imagePrompt}"\n\n![Generated Image](${data.imageUrl})`,
        provider: 'openai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, imageMessage]);
      setImagePrompt('');
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const clearChat = () => {
    setMessages([]);
    setFiles([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      sendMessage();
    }
  };

  const provider = PROVIDERS[selectedProvider];

  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        badge={{
          icon: <Brain className="w-4 h-4" />,
          text: "AI Assistant"
        }}
        title="Meet"
        highlightText="Synergize AI"
        description="Your intelligent learning companion powered by multiple AI providers. Get instant help with courses, ask questions, and generate content."
        primaryCTA={{
          text: "Start Chatting",
          href: "#chat"
        }}
        secondaryCTA={{
          text: "Learn More",
          href: "#features"
        }}
        backgroundVariant="gradient"
      />

      {/* Chat Interface */}
      <section id="chat" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Provider Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Choose Your AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(PROVIDERS).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedProvider(key as keyof typeof PROVIDERS)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedProvider === key
                          ? `border-current bg-gradient-to-r ${config.color} text-white`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold">{config.name}</div>
                        <div className="text-sm opacity-75">{config.badge}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Container */}
            <Card className="h-[600px] flex flex-col">
              <CardHeader className={`${provider.bgColor} border-b`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${provider.color} flex items-center justify-center`}>
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${provider.textColor}`}>
                        {provider.name} Assistant
                      </h3>
                      <p className="text-sm text-gray-600">
                        Powered by {provider.badge}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearChat}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${provider.color} flex items-center justify-center mx-auto mb-4`}>
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Hi! I'm your AI learning assistant.
                    </h3>
                    <p className="text-gray-600">
                      How can I help you today?
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${PROVIDERS[message.provider || selectedProvider].color} flex items-center justify-center flex-shrink-0`}>
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                      <div
                        className={`p-3 rounded-lg break-words ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.role === 'assistant' && message.provider && (
                          <div className="mt-2 flex items-center justify-between">
                            <Badge className={PROVIDERS[message.provider].badgeColor}>
                              {PROVIDERS[message.provider].badge}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyMessage(message.content)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${provider.color} flex items-center justify-center flex-shrink-0`}>
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* File Attachments */}
              {files.length > 0 && (
                <div className="border-t p-4">
                  <div className="flex flex-wrap gap-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="truncate max-w-32">{file.name}</span>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 min-h-[40px] max-h-32 resize-none"
                    rows={1}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || (!input.trim() && files.length === 0)}
                    className={`flex-shrink-0 bg-gradient-to-r ${provider.color} hover:opacity-90`}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Image Generation */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Generate Images with DALL-E 3
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    className="flex-1"
                  />
                  <Button
                    onClick={generateImage}
                    disabled={isGeneratingImage || !imagePrompt.trim()}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
                  >
                    {isGeneratingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful AI Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the full potential of AI-powered learning assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Multiple AI Providers
                </h3>
                <p className="text-gray-600">
                  Choose from Claude, GPT, and Gemini for different perspectives and capabilities.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  File Upload Support
                </h3>
                <p className="text-gray-600">
                  Upload documents, images, and files for AI analysis and assistance.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Image Generation
                </h3>
                <p className="text-gray-600">
                  Create stunning images with DALL-E 3 for presentations and projects.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PageLayout>
  );
} 