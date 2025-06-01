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
  Globe
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

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  mode?: string;
  role?: string;
}

export default function SynergizeAgile() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('scrum-master');
  const [selectedMode, setSelectedMode] = useState<string>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message on role/mode change
  useEffect(() => {
    const role = AGILE_ROLES[selectedRole as keyof typeof AGILE_ROLES];
    const mode = INTERACTION_MODES[selectedMode as keyof typeof INTERACTION_MODES];
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: `Hello! I'm your ${role.name} AI assistant in ${mode.name} mode. ${mode.description}. How can I help you with your Agile journey today?`,
      timestamp: new Date(),
      mode: selectedMode,
      role: selectedRole
    };
    
    setMessages([welcomeMessage]);
  }, [selectedRole, selectedMode]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && files.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      mode: selectedMode,
      role: selectedRole
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const role = AGILE_ROLES[selectedRole as keyof typeof AGILE_ROLES];
      const mode = INTERACTION_MODES[selectedMode as keyof typeof INTERACTION_MODES];

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
          provider: 'anthropic' // Use Claude for Agile expertise
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.content,
        timestamp: new Date(),
        mode: selectedMode,
        role: selectedRole
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        mode: selectedMode,
        role: selectedRole
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
  };

  const currentRole = AGILE_ROLES[selectedRole as keyof typeof AGILE_ROLES];
  const currentMode = INTERACTION_MODES[selectedMode as keyof typeof INTERACTION_MODES];

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
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-xl">Configure Your Training Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Your Agile Role
                    </label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(AGILE_ROLES).map(([key, role]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center">
                              {role.icon}
                              <span className="ml-2">{role.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-600 mt-1">{currentRole.description}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose Interaction Mode
                    </label>
                    <Select value={selectedMode} onValueChange={setSelectedMode}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(INTERACTION_MODES).map(([key, mode]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center">
                              {mode.icon}
                              <span className="ml-2">{mode.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-600 mt-1">{currentMode.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="h-[600px] flex flex-col border-0 shadow-xl">
              <CardHeader className={`bg-gradient-to-r ${currentRole.color} text-white rounded-t-lg`}>
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

              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
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
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-xs ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                {message.timestamp.toLocaleTimeString()}
                              </span>
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

                {/* File Upload Area */}
                {files.length > 0 && (
                  <div className="border-t bg-gray-50 p-4">
                    <div className="flex flex-wrap gap-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center bg-white rounded-lg p-2 border">
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
                  </div>
                )}

                {/* Input Area */}
                <div className="border-t bg-white p-4">
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
                      className="flex-1 min-h-[60px] resize-none"
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
              <a href="/courses">
                Explore Courses
                <BookOpen className="h-5 w-5 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
} 