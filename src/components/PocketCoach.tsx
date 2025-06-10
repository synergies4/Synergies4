'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Send, MessageCircle, User, Bot, Loader, Lightbulb, Target, Clock, Sparkles, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { usePersonalization } from '@/hooks/usePersonalization';
import { useAuth } from '@/contexts/AuthContext';
import OnboardingModal from './OnboardingModal';
import Link from 'next/link';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface CoachingSession {
  id: number;
  messages: Message[];
  session_type: string;
  created_at: string;
  context_data?: any;
}

const QUICK_PROMPTS = [
  {
    icon: Target,
    title: "Daily Goals",
    prompt: "Help me prioritize my tasks for today. I'm feeling overwhelmed with my workload."
  },
  {
    icon: MessageCircle,
    title: "Team Issue",
    prompt: "I'm having a conflict with a team member. How should I approach this situation?"
  },
  {
    icon: Clock,
    title: "Time Management",
    prompt: "I'm struggling with time management. Can you give me some strategies?"
  },
  {
    icon: Lightbulb,
    title: "Problem Solving",
    prompt: "I need help solving a complex problem at work. Can you walk me through a framework?"
  }
];

export default function PocketCoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Authentication
  const { user, loading: authLoading } = useAuth();

  // Personalization
  const {
    hasCompletedOnboarding,
    showOnboardingModal,
    completeOnboarding,
    dismissOnboarding,
    getAIContext
  } = usePersonalization();

  useEffect(() => {
    if (user) {
      loadRecentSessions();
      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now(),
        role: 'assistant',
        content: `👋 Hello! I'm your personal AI coach. I'm here to help you navigate daily challenges, improve your skills, and achieve your goals.

What's on your mind today? You can ask me about:
• Leadership and team management
• Problem-solving strategies  
• Time management and productivity
• Communication and conflict resolution
• Goal setting and planning
• Or anything else you're dealing with!

How can I support you right now?`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadRecentSessions = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const response = await fetch('/api/pocket-coach', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/pocket-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: text,
          sessionId,
          context: {
            timestamp: new Date().toISOString(),
            messageCount: messages.length,
            personalizationContext: getAIContext()
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setSessionId(data.sessionId);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewSession = () => {
    setMessages([]);
    setSessionId(null);
    setInputValue('');
    
    const welcomeMessage: Message = {
      id: Date.now(),
      role: 'assistant',
      content: `👋 Starting a fresh conversation! I'm here to help you with whatever challenges you're facing today.

What would you like to work on?`,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Pocket Coach</h1>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader className="h-5 w-5 animate-spin text-gray-600" />
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Pocket Coach</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your personal AI coach is here to help you navigate daily challenges, develop skills, and achieve your goals. 
            Get instant, personalized guidance tailored to your role and situation.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <LogIn className="h-8 w-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">Sign in to access your coach</h2>
              <p className="text-gray-600">
                Please sign in to start a personalized coaching session and get tailored guidance for your specific needs.
              </p>
            </div>
            <div className="space-y-3">
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  Sign In
                </Button>
              </Link>
              <p className="text-sm text-gray-500">
                Don't have an account? <Link href="/signup" className="text-blue-600 hover:underline">Sign up here</Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">🚀 What you'll get with Pocket Coach</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="font-medium text-blue-800">Personalized Guidance</p>
                <p className="text-blue-700">Get advice tailored to your specific role, challenges, and goals.</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-blue-800">Instant Support</p>
                <p className="text-blue-700">24/7 availability whenever you need coaching support.</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-blue-800">Professional Development</p>
                <p className="text-blue-700">Improve leadership, communication, and problem-solving skills.</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-blue-800">Session History</p>
                <p className="text-blue-700">Access your previous conversations and track your progress.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Pocket Coach</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your personal AI coach is here to help you navigate daily challenges, develop skills, and achieve your goals. 
          Get instant, personalized guidance tailored to your role and situation.
        </p>
      </div>

      {/* Quick Prompts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_PROMPTS.map((prompt, index) => {
          const Icon = prompt.icon;
          return (
            <Card 
              key={index}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-gray-50 to-white border-gray-200"
              onClick={() => sendMessage(prompt.prompt)}
            >
              <CardContent className="p-4 text-center">
                <Icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">{prompt.title}</h3>
                <p className="text-sm text-gray-600">{prompt.prompt.substring(0, 50)}...</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chat Interface */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              AI Coach
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Online
              </Badge>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={startNewSession}
              className="text-gray-600 hover:text-gray-900"
            >
              New Session
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Messages */}
          <ScrollArea className="h-[500px] p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.role === 'user'
                          ? 'text-blue-100'
                          : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-600 text-white">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin text-gray-600" />
                      <span className="text-sm text-gray-600">Coach is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send • Your conversations are private and secure
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Coaching Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSessionId(session.id);
                    setMessages(session.messages || []);
                  }}
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      Session from {new Date(session.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {session.messages?.length || 0} messages
                    </div>
                  </div>
                  <Badge variant="outline">{session.session_type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">💡 Tips for Better Coaching Sessions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium text-yellow-800">Be Specific</p>
              <p className="text-yellow-700">Describe your exact situation and what outcome you want.</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-yellow-800">Provide Context</p>
              <p className="text-yellow-700">Share relevant background about your role and challenges.</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-yellow-800">Ask Follow-ups</p>
              <p className="text-yellow-700">Don't hesitate to ask for clarification or more details.</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-yellow-800">Take Action</p>
              <p className="text-yellow-700">Implement the suggestions and come back with updates.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onComplete={completeOnboarding}
        onDismiss={dismissOnboarding}
      />
    </div>
  );
} 