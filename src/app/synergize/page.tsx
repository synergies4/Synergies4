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

// Specialized interface components for different modes
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

  const generatePresentation = async () => {
    const imagePrompt = includeImages ? 
      `\n\nFor each slide, also generate a detailed image description that I can use to create visuals. Make the image descriptions specific, professional, and relevant to the content.` : '';
    
    const prompt = `Create a comprehensive ${slideCount}-slide presentation about "${presentationTopic}" for ${audience} in a ${presentationStyle} style.
    
    As a ${currentRole.name}, structure this presentation to be highly effective for your role's perspective.
    
    For each slide, provide:
    1. **Slide Number & Title**
    2. **Main Content** (3-5 key bullet points)
    3. **Speaker Notes** (detailed talking points)
    4. **Visual Elements** (charts, diagrams, or layout suggestions)
    ${imagePrompt}
    5. **Transition Notes** (how to move to next slide)
    
    Format the presentation with clear slide breaks using "--- SLIDE X ---" headers.
    
    Include:
    - Opening hook and agenda
    - Clear learning objectives
    - Interactive elements or discussion points
    - Strong conclusion with call-to-action
    - Q&A preparation notes
    
    Make this presentation engaging, actionable, and tailored to the ${currentRole.name} perspective.`;
    
    setInputMessage(prompt);
    await handleSendMessage();
    
    // If images are requested, generate them after the presentation
    if (includeImages) {
      setTimeout(async () => {
        try {
          const imagePrompt = `Professional presentation slide image for "${presentationTopic}" - modern, clean design with ${presentationStyle} style, suitable for ${audience}`;
          
          const imageResponse = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: imagePrompt,
              provider: 'openai'
            })
          });
          
          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            const imageMessage = `🎨 **Generated Presentation Visual**\n\n![Presentation Image](${imageData.imageUrl})\n\n*You can use this as inspiration for your slide visuals or as a template image.*`;
            
            // Add image message to chat
            const aiMessage = {
              id: (Date.now() + Math.random()).toString(),
              type: 'ai' as const,
              content: imageMessage,
              timestamp: new Date(),
              mode: 'presentation',
              role: currentRole.name,
              provider: selectedProvider
            };
            
            // This would need to be passed down as a prop to update messages
            // For now, we'll just log it
            console.log('Generated image:', imageData.imageUrl);
          }
        } catch (error) {
          console.error('Failed to generate presentation image:', error);
        }
      }, 2000);
    }
  };

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
      
      <div className="flex items-center space-x-2 px-4">
        <input
          type="checkbox"
          id="includeImages"
          checked={includeImages}
          onChange={(e) => setIncludeImages(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="includeImages" className="text-sm">
          Generate visual elements and sample images
        </Label>
      </div>
      
      <Button 
        onClick={generatePresentation}
        disabled={!presentationTopic || !audience || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Presentation className="h-4 w-4 mr-2" />}
        Generate {slideCount}-Slide Presentation
      </Button>
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
              <Select value={person1Role} onValueChange={setPerson1Role}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scrum Master">Scrum Master</SelectItem>
                  <SelectItem value="Product Owner">Product Owner</SelectItem>
                  <SelectItem value="Developer">Developer</SelectItem>
                  <SelectItem value="Stakeholder">Stakeholder</SelectItem>
                  <SelectItem value="Team Lead">Team Lead</SelectItem>
                </SelectContent>
              </Select>
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
              <Select value={person2Role} onValueChange={setPerson2Role}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scrum Master">Scrum Master</SelectItem>
                  <SelectItem value="Product Owner">Product Owner</SelectItem>
                  <SelectItem value="Developer">Developer</SelectItem>
                  <SelectItem value="Stakeholder">Stakeholder</SelectItem>
                  <SelectItem value="Team Lead">Team Lead</SelectItem>
                </SelectContent>
              </Select>
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
          <Select value={selectedChallenge} onValueChange={setSelectedChallenge}>
            <SelectTrigger>
              <SelectValue placeholder="Select a challenge..." />
            </SelectTrigger>
            <SelectContent>
              {challenges[currentRole.name.toLowerCase().replace(' ', '-') as keyof typeof challenges]?.map((challenge, idx) => (
                <SelectItem key={idx} value={challenge}>{challenge}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium">Experience Level</Label>
          <Select value={experienceLevel} onValueChange={setExperienceLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select experience..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
              <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
              <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
            </SelectContent>
          </Select>
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

  // Only scroll to bottom when new AI messages are added (not user messages)
  useEffect(() => {
    if (messages.length > 0 && hasInitialized) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'ai') {
        scrollToBottom();
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

  // Reset chat when role or mode changes (after initialization)
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
    }
  }, [selectedRole, selectedMode, selectedProvider, hasInitialized]);

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

  // Type-safe handler for provider selection
  const handleProviderChange = (value: string) => {
    if (value === 'anthropic' || value === 'openai' || value === 'google') {
      setSelectedProvider(value);
    }
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
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-xl">Configure Your Training Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select AI Provider
                    </label>
                    <Select value={selectedProvider} onValueChange={handleProviderChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center">
                              {provider.icon}
                              <span className="ml-2">{provider.name}</span>
                              <span className="ml-1 text-xs text-gray-500">({provider.badge})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-600 mt-1">Powered by {currentProvider.badge}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="h-[600px] flex flex-col border-0 shadow-xl">
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

              <CardContent className="flex-1 flex flex-col p-0 min-h-0">
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

                {/* Specialized Mode Interface */}
                <div className="border-t bg-white p-4 flex-shrink-0">
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