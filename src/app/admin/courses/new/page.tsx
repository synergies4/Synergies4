'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/shared/PageLayout';
import { 
  ArrowLeft,
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  BookOpen,
  Clock,
  Users,
  DollarSign,
  Target,
  Award,
  Loader2,
  X,
  Edit,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Video,
  Link as LinkIcon,
  FileText,
  CheckCircle,
  Eye,
  Sparkles,
  Brain,
  Lightbulb,
  Copy,
  Image as ImageIcon,
  Play,
  TrendingUp,
  Tag
} from 'lucide-react';

interface ModuleContent {
  id: string;
  type: 'video' | 'link' | 'document' | 'text';
  title: string;
  content: string; // URL for video/link/document, text content for text
  description?: string;
  order: number;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  contents: ModuleContent[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  points: number;
}

interface CourseFormData {
  title: string;
  description: string;
  shortDesc: string;
  category: string;
  level: string;
  price: string;
  duration: string;
  status: string;
  image: string;
  featured: boolean;
  course_type: string; // New field for course type
  max_participants: string; // New field for in-person courses
  location: string; // New field for in-person courses
  instructor_name: string; // New field for in-person courses
  materials_included: string; // New field for in-person courses
  prerequisites: string; // New field for in-person courses
  modules: CourseModule[];
  quiz?: Quiz;
}

export default function CreateCourse() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newModule, setNewModule] = useState({ title: '', description: '' });
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [newContent, setNewContent] = useState({
    type: 'video' as 'video' | 'link' | 'document' | 'text',
    title: '',
    content: '',
    description: ''
  });
  
  // AI Assistant State
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiMode, setAiMode] = useState<'title' | 'description' | 'shortDesc' | 'category' | 'modules' | 'quiz' | 'content' | 'pricing' | 'marketing' | 'imageIdeas'>('description');
  const [aiContext, setAiContext] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [moduleAiSuggestions, setModuleAiSuggestions] = useState<{[key: string]: any}>({});
  const [showModuleAI, setShowModuleAI] = useState<{[key: string]: boolean}>({});

  // Define AI mode type
  type AiModeType = 'title' | 'description' | 'shortDesc' | 'category' | 'modules' | 'quiz' | 'content' | 'pricing' | 'marketing' | 'imageIdeas';

  // Memoized AI mode options for performance
  const aiModeOptions = useMemo(() => [
    { mode: 'title' as AiModeType, icon: Sparkles, label: 'Title Ideas', shortLabel: 'Title' },
    { mode: 'description' as AiModeType, icon: FileText, label: 'Description', shortLabel: 'Description' },
    { mode: 'shortDesc' as AiModeType, icon: FileText, label: 'Short Description', shortLabel: 'Short Desc' },
    { mode: 'category' as AiModeType, icon: Tag, label: 'Category', shortLabel: 'Category' },
    { mode: 'modules' as AiModeType, icon: BookOpen, label: 'Modules', shortLabel: 'Modules' },
    { mode: 'quiz' as AiModeType, icon: HelpCircle, label: 'Quiz', shortLabel: 'Quiz' },
    { mode: 'content' as AiModeType, icon: Lightbulb, label: 'Content Ideas', shortLabel: 'Content' },
    { mode: 'pricing' as AiModeType, icon: DollarSign, label: 'Pricing', shortLabel: 'Pricing' },
    { mode: 'marketing' as AiModeType, icon: TrendingUp, label: 'Marketing', shortLabel: 'Marketing' },
    { mode: 'imageIdeas' as AiModeType, icon: ImageIcon, label: 'Image Ideas', shortLabel: 'Images' }
  ], []);

  // Memoized AI mode descriptions
  const aiModeDescriptions = useMemo((): Record<AiModeType, { title: string; description: string }> => ({
    title: {
      title: 'Generate Course Title Ideas',
      description: 'Get 5 compelling, SEO-friendly course title suggestions based on your category and level.'
    },
    description: {
      title: 'Generate Course Description',
      description: 'Create a comprehensive course description with learning objectives and benefits.'
    },
    shortDesc: {
      title: 'Generate Short Description',
      description: 'Create a concise, engaging short description perfect for course cards and previews.'
    },
    category: {
      title: 'Suggest Course Category',
      description: 'Get AI recommendations for the most appropriate course category based on your title and content.'
    },
    modules: {
      title: 'Generate Module Structure',
      description: 'Generate a complete module structure with titles, descriptions, and learning objectives.'
    },
    quiz: {
      title: 'Generate Quiz Questions',
      description: 'Create quiz questions with multiple choice, true/false, and short answer formats.'
    },
    content: {
      title: 'Generate Content Ideas',
      description: 'Get specific ideas for videos, exercises, projects, and reading materials.'
    },
    pricing: {
      title: 'Get Pricing Recommendations',
      description: 'Receive market-based pricing recommendations with justification.'
    },
    marketing: {
      title: 'Create Marketing Copy',
      description: 'Generate taglines, selling points, and social media content.'
    },
    imageIdeas: {
      title: 'Get Image Suggestions',
      description: 'Get suggestions for course thumbnails, diagrams, and visual content.'
    }
  }), []);

  // Optimized AI mode change handler
  const handleAiModeChange = useCallback((mode: AiModeType) => {
    setAiMode(mode);
    setAiError(''); // Clear any previous errors
  }, []);

  // Enhanced error handling for AI operations
  const handleAiError = useCallback((error: unknown, operation: string) => {
    console.error(`AI ${operation} Error:`, error);
    const errorMessage = error instanceof Error ? error.message : `Failed to ${operation.toLowerCase()}. Please try again.`;
    setAiError(errorMessage);
    
    // Auto-clear error after 5 seconds
    setTimeout(() => setAiError(''), 5000);
  }, []);

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    shortDesc: '',
    category: '',
    level: '',
    price: '',
    duration: '',
    status: 'DRAFT',
    image: '',
    featured: false,
    course_type: 'digital', // New field for course type
    max_participants: '', // New field for in-person courses
    location: '', // New field for in-person courses
    instructor_name: '', // New field for in-person courses
    materials_included: '', // New field for in-person courses
    prerequisites: '', // New field for in-person courses
    modules: []
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || userProfile?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
  }, [user, userProfile, authLoading, router]);

  // Prevent body scroll when AI modal is open
  useEffect(() => {
    if (showAIAssistant) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [showAIAssistant]);

  const handleInputChange = (field: keyof CourseFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addModule = () => {
    if (newModule.title.trim()) {
      const module: CourseModule = {
        id: Date.now().toString(),
        title: newModule.title,
        description: newModule.description,
        order: formData.modules.length + 1,
        contents: []
      };
      setFormData(prev => ({
        ...prev,
        modules: [...prev.modules, module]
      }));
      setNewModule({ title: '', description: '' });
    }
  };

  const removeModule = (moduleId: string) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== moduleId)
    }));
  };

  const addContentToModule = (moduleId: string) => {
    if (newContent.title.trim() && newContent.content.trim()) {
      const content: ModuleContent = {
        id: Date.now().toString(),
        type: newContent.type,
        title: newContent.title,
        content: newContent.content,
        description: newContent.description,
        order: 1
      };

      setFormData(prev => ({
        ...prev,
        modules: prev.modules.map(module => {
          if (module.id === moduleId) {
            const newContents = [...module.contents, content];
            // Update order for all contents
            newContents.forEach((c, index) => {
              c.order = index + 1;
            });
            return { ...module, contents: newContents };
          }
          return module;
        })
      }));

      setNewContent({
        type: 'video',
        title: '',
        content: '',
        description: ''
      });
      setEditingModule(null);
    }
  };

  const removeContentFromModule = (moduleId: string, contentId: string) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            contents: module.contents.filter(content => content.id !== contentId)
          };
        }
        return module;
      })
    }));
  };

  const addQuiz = () => {
    const quiz: Quiz = {
      id: Date.now().toString(),
      title: 'Course Quiz',
      description: 'Test your knowledge',
      questions: []
    };
    setFormData(prev => ({ ...prev, quiz }));
  };

  const addQuizQuestion = () => {
    if (!formData.quiz) return;

    const question: QuizQuestion = {
      id: Date.now().toString(),
      question_text: '',
      question_type: 'MULTIPLE_CHOICE',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: '',
      points: 1
    };

    setFormData(prev => ({
      ...prev,
      quiz: prev.quiz ? {
        ...prev.quiz,
        questions: [...prev.quiz.questions, question]
      } : undefined
    }));
  };

  const updateQuizQuestion = (questionId: string, field: string, value: any) => {
    if (!formData.quiz) return;

    setFormData(prev => ({
      ...prev,
      quiz: prev.quiz ? {
        ...prev.quiz,
        questions: prev.quiz.questions.map(q => 
          q.id === questionId ? { ...q, [field]: value } : q
        )
      } : undefined
    }));
  };

  const removeQuizQuestion = (questionId: string) => {
    if (!formData.quiz) return;

    setFormData(prev => ({
      ...prev,
      quiz: prev.quiz ? {
        ...prev.quiz,
        questions: prev.quiz.questions.filter(q => q.id !== questionId)
      } : undefined
    }));
  };

  // AI Assistant Functions
  const generateAISuggestions = async () => {
    if (!formData.title && aiMode !== 'title') {
      setAiError('Please enter a course title first');
      return;
    }

    setAiLoading(true);
    setAiError('');
    setAiSuggestions('');
    
    try {
      let prompt = '';
      
      switch (aiMode) {
        case 'title':
          prompt = `Generate 5 compelling course titles for a ${formData.category || 'general'} course at ${formData.level || 'beginner'} level. Context: ${aiContext}. Make them engaging and SEO-friendly.`;
          break;
        case 'description':
          prompt = `Create a comprehensive course description for "${formData.title}" - a ${formData.category} course for ${formData.level} level students. Include learning objectives, what students will gain, and why they should take this course. Context: ${aiContext}`;
          break;
        case 'shortDesc':
          prompt = `Create a concise, engaging short description (150-200 characters) for the course "${formData.title}" - a ${formData.category} course. This will be used for course cards and previews. Make it compelling and highlight the key benefit. Context: ${aiContext}`;
          break;
        case 'category':
          prompt = `Based on the course title "${formData.title}" and this context: ${aiContext}, suggest the most appropriate category from these options: Agile & Scrum, Leadership, Product Management, Mental Fitness, Technology, Business. Provide the top 3 category recommendations with brief explanations for why each would be suitable.`;
          break;
        case 'modules':
          prompt = `Create a detailed module structure for the course "${formData.title}" (${formData.category}, ${formData.level} level). Include 6-8 modules with titles, descriptions, and learning objectives. Format as JSON with this structure:
          {
            "modules": [
              {
                "title": "Module Title",
                "description": "Module description",
                "learningObjectives": ["Objective 1", "Objective 2"],
                "estimatedDuration": "2 hours"
              }
            ]
          }
          Context: ${aiContext}`;
          break;
        case 'quiz':
          prompt = `Generate 10 quiz questions for the course "${formData.title}" (${formData.category}, ${formData.level} level). Include multiple choice, true/false, and short answer questions. 
          
          IMPORTANT: Return ONLY valid JSON in this EXACT format (no additional text before or after):

          {
            "questions": [
              {
                "question": "What is the core principle of Agile methodology?",
                "type": "MULTIPLE_CHOICE",
                "options": ["Embrace change", "Follow rigid plans", "Avoid feedback", "Focus only on documentation"],
                "correctAnswer": "Embrace change",
                "explanation": "Agile methodology emphasizes embracing change over following a rigid plan",
                "points": 5
              },
              {
                "question": "Scrum sprints are typically 2-4 weeks long",
                "type": "TRUE_FALSE", 
                "options": ["True", "False"],
                "correctAnswer": "True",
                "explanation": "Standard Scrum sprints are indeed 2-4 weeks in duration",
                "points": 3
              }
            ]
          }

          Generate questions that test understanding of key concepts. Use these exact field names: "question", "type", "options", "correctAnswer", "explanation", "points".
          Question types: "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"
          Context: ${aiContext}

          Return ONLY the JSON object, no explanatory text.`;
          break;
        case 'content':
          prompt = `Suggest specific content ideas for the course "${formData.title}" including:
          1. Video topics and scripts
          2. Interactive exercises
          3. Real-world projects
          4. Reading materials
          5. Practical assignments
          6. Case studies
          Context: ${aiContext}`;
          break;
        case 'pricing':
          prompt = `Suggest appropriate pricing for the course "${formData.title}" (${formData.category}, ${formData.level} level). Consider market rates, course value, target audience, and competition. Provide 3 pricing options with justification.`;
          break;
        case 'marketing':
          prompt = `Create marketing copy for the course "${formData.title}" including:
          1. Compelling tagline
          2. Key selling points
          3. Target audience description
          4. Social media posts
          5. Email marketing subject lines
          Context: ${aiContext}`;
          break;
        default:
          prompt = `Provide suggestions for improving the course "${formData.title}" in the ${formData.category} category.`;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are an expert course creation assistant. Provide detailed, actionable suggestions for online course development.' },
            { role: 'user', content: prompt }
          ],
          provider: 'anthropic'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const suggestions = data.content || data.response;
      
      if (!suggestions) {
        throw new Error('No suggestions received from AI');
      }
      
      setAiSuggestions(suggestions);
    } catch (error) {
      handleAiError(error, 'generate suggestions');
    } finally {
      setAiLoading(false);
    }
  };

  const generateModuleContent = async (moduleId: string, contentType: 'video' | 'text' | 'exercise' | 'image') => {
    const module = formData.modules.find(m => m.id === moduleId);
    if (!module) return;

    setAiLoading(true);
    try {
      let prompt = '';
      
      switch (contentType) {
        case 'video':
          prompt = `Create a detailed video script for the module "${module.title}" in the course "${formData.title}". Include:
          1. Video title and description
          2. Detailed script with timestamps
          3. Key points to emphasize
          4. Visual suggestions
          5. Recommended video length
          6. Equipment/setup recommendations`;
          break;
        case 'text':
          prompt = `Create comprehensive text content for the module "${module.title}" in the course "${formData.title}". Include:
          1. Detailed explanations
          2. Examples and case studies
          3. Key takeaways
          4. Action items
          5. Further reading suggestions`;
          break;
        case 'exercise':
          prompt = `Design interactive exercises for the module "${module.title}" in the course "${formData.title}". Include:
          1. Hands-on activities
          2. Practice problems
          3. Real-world scenarios
          4. Group exercises
          5. Self-assessment tools`;
          break;
        case 'image':
          prompt = `Suggest visual content for the module "${module.title}" in the course "${formData.title}". Include:
          1. Infographic ideas
          2. Diagram suggestions
          3. Image prompts for AI generation
          4. Chart and graph recommendations
          5. Visual metaphors and illustrations`;
          break;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are an expert instructional designer. Create detailed, engaging educational content.' },
            { role: 'user', content: prompt }
          ],
          provider: 'anthropic'
        }),
      });

      if (!response.ok) throw new Error('Failed to generate content');
      
      const data = await response.json();
      setModuleAiSuggestions(prev => ({
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          [contentType]: data.content || data.response
        }
      }));
    } catch (error) {
      console.error('Content Generation Error:', error);
      alert('Failed to generate content suggestions. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const generateImagePrompt = async (description: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are an expert at creating detailed image prompts for AI image generation. Create specific, detailed prompts that will generate high-quality educational images.' },
            { role: 'user', content: `Create a detailed image generation prompt for: ${description}. Make it specific, include style, composition, colors, and educational context.` }
          ],
          provider: 'anthropic'
        }),
      });

      if (!response.ok) throw new Error('Failed to generate image prompt');
      
      const data = await response.json();
      return data.content || data.response;
    } catch (error) {
      console.error('Image Prompt Generation Error:', error);
      return description;
    }
  };

  const generateCourseImage = async () => {
    if (!formData.title) {
      alert('Please enter a course title first');
      return;
    }

    setAiLoading(true);
    try {
      // First generate a detailed prompt
      const imagePrompt = await generateImagePrompt(`Professional course thumbnail for "${formData.title}" - ${formData.category} course`);
      
      // Then generate the image
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          provider: 'openai'
        }),
      });

      if (!response.ok) throw new Error('Failed to generate image');
      
      const data = await response.json();
      if (data.imageUrl) {
        handleInputChange('image', data.imageUrl);
        alert('Course image generated successfully!');
      }
    } catch (error) {
      console.error('Image Generation Error:', error);
      alert('Failed to generate course image. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestion = (field: string) => {
    if (!aiSuggestions) return;
    
    switch (field) {
      case 'description':
        handleInputChange('description', aiSuggestions);
        break;
      case 'shortDesc':
        // Extract first paragraph or first 200 characters for short description
        const shortDesc = aiSuggestions.split('\n')[0].substring(0, 200) + '...';
        handleInputChange('shortDesc', shortDesc);
        break;
      case 'title':
        // If multiple titles are suggested, use the first one
        const titles = aiSuggestions.split('\n').filter(line => line.trim());
        if (titles.length > 0) {
          handleInputChange('title', titles[0].replace(/^\d+\.\s*/, ''));
        }
        break;
      case 'category':
        // Extract the first suggested category (assuming AI provides recommendations)
        const suggestions = aiSuggestions.toLowerCase();
        if (suggestions.includes('agile') || suggestions.includes('scrum')) {
          handleInputChange('category', 'agile');
        } else if (suggestions.includes('leadership')) {
          handleInputChange('category', 'leadership');
        } else if (suggestions.includes('product')) {
          handleInputChange('category', 'product');
        } else if (suggestions.includes('mental fitness') || suggestions.includes('mental-fitness')) {
          handleInputChange('category', 'mental-fitness');
        } else if (suggestions.includes('technology')) {
          handleInputChange('category', 'technology');
        } else if (suggestions.includes('business')) {
          handleInputChange('category', 'business');
        }
        break;
      case 'modules':
        try {
          // Try multiple approaches to extract JSON
          let moduleData = null;
          
          // Method 1: Try direct parsing first
          try {
            moduleData = JSON.parse(aiSuggestions);
          } catch (e) {
            // Method 2: Look for JSON between code blocks
            const codeBlockMatch = aiSuggestions.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (codeBlockMatch) {
              try {
                moduleData = JSON.parse(codeBlockMatch[1]);
              } catch (e2) {
                // Method 3: Extract everything between first { and last }
                const firstBrace = aiSuggestions.indexOf('{');
                const lastBrace = aiSuggestions.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                  const jsonStr = aiSuggestions.substring(firstBrace, lastBrace + 1);
                  moduleData = JSON.parse(jsonStr);
                }
              }
            }
          }
          
          if (moduleData && moduleData.modules && Array.isArray(moduleData.modules)) {
            const newModules = moduleData.modules.map((mod: any, index: number) => ({
              id: Date.now().toString() + index,
              title: mod.title || mod.name || mod.moduleName || `Module ${index + 1}`,
              description: mod.description || mod.desc || mod.summary || '',
              order: index + 1,
              contents: []
            }));
            
            // Validate that we have valid modules
            if (newModules.length > 0 && newModules[0].title) {
              setFormData(prev => ({ ...prev, modules: newModules }));
              setShowAIAssistant(false);
              return;
            } else {
              throw new Error('No valid modules found in the parsed data');
            }
          } else {
            throw new Error('Invalid JSON structure - expected "modules" array');
          }
        } catch (error) {
          console.error('Failed to parse module data:', error);
          console.log('Raw AI suggestions:', aiSuggestions);
          
          // Provide more helpful error message
          const errorMessage = error instanceof Error 
            ? `Failed to parse module data: ${error.message}. Please copy and paste manually.`
            : 'Failed to apply module suggestions. Please copy and paste manually.';
          
          alert(errorMessage);
        }
        break;
      case 'quiz':
        try {
          // Try multiple approaches to extract JSON
          let quizData = null;
          
          // Method 1: Try direct parsing first
          try {
            quizData = JSON.parse(aiSuggestions);
          } catch (e) {
            // Method 2: Look for JSON between code blocks
            const codeBlockMatch = aiSuggestions.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (codeBlockMatch) {
              try {
                quizData = JSON.parse(codeBlockMatch[1]);
              } catch (e2) {
                // Method 3: Extract everything between first { and last }
                const firstBrace = aiSuggestions.indexOf('{');
                const lastBrace = aiSuggestions.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                  const jsonStr = aiSuggestions.substring(firstBrace, lastBrace + 1);
                  quizData = JSON.parse(jsonStr);
                }
              }
            }
          }
          
          if (quizData && quizData.questions && Array.isArray(quizData.questions)) {
            const newQuiz = {
              id: Date.now().toString(),
              title: `${formData.title} Quiz`,
              description: 'Test your knowledge',
              questions: quizData.questions.map((q: any, index: number) => ({
                id: Date.now().toString() + index,
                // Handle multiple possible field name variations
                question_text: q.question || q.question_text || q.questionText || '',
                question_type: q.type || q.question_type || q.questionType || 'MULTIPLE_CHOICE',
                options: q.options || q.choices || q.answers || [],
                correct_answer: q.correctAnswer || q.correct_answer || q.answer || q.solution || '',
                explanation: q.explanation || q.rationale || q.reasoning || '',
                points: q.points || q.score || 5
              }))
            };
            
            // Validate that we have valid questions
            if (newQuiz.questions.length > 0 && newQuiz.questions[0].question_text) {
              setFormData(prev => ({ ...prev, quiz: newQuiz }));
              setShowAIAssistant(false);
              return;
            } else {
              throw new Error('No valid questions found in the parsed data');
            }
          } else {
            throw new Error('Invalid JSON structure - expected "questions" array');
          }
        } catch (error) {
          console.error('Failed to parse quiz data:', error);
          console.log('Raw AI suggestions:', aiSuggestions);
          
          // Provide more helpful error message
          const errorMessage = error instanceof Error 
            ? `Failed to parse quiz data: ${error.message}. Please copy and paste manually.`
            : 'Failed to apply quiz suggestions. Please copy and paste manually.';
          
          alert(errorMessage);
        }
        break;
    }
    
    setShowAIAssistant(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSubmit = async (status: string) => {
    setLoading(true);
    try {
      // Get the current session for authentication
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('You must be logged in to create a course');
        return;
      }

      const courseData = {
        title: formData.title,
        description: formData.description,
        shortDesc: formData.shortDesc,
        category: formData.category,
        level: formData.level,
        price: formData.price ? parseFloat(formData.price) : null,
        duration: formData.duration,
        status: status,
        image: formData.image || null,
        featured: formData.featured
      };
      
      // Create course via API with authentication header
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create course');
      }

      const course = await response.json();
      console.log('Course created:', course);

      // Create modules and their contents
      if (formData.modules.length > 0) {
        for (const module of formData.modules) {
          try {
            const moduleResponse = await fetch(`/api/courses/${course.id}/modules`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                title: module.title,
                description: module.description,
                order: module.order,
                contents: module.contents
              }),
            });

            if (!moduleResponse.ok) {
              console.error('Failed to create module:', module.title);
            } else {
              console.log('Module created:', module.title);
            }
          } catch (moduleError) {
            console.error('Error creating module:', moduleError);
          }
        }
      }

      // Create quiz if exists
      if (formData.quiz && formData.quiz.questions.length > 0) {
        try {
          const quizResponse = await fetch(`/api/courses/${course.id}/quiz`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              questions: formData.quiz.questions
            }),
          });

          if (!quizResponse.ok) {
            const errorData = await quizResponse.json();
            console.error('Failed to create quiz:', errorData.message);
          } else {
            console.log('Quiz created successfully');
          }
        } catch (quizError) {
          console.error('Error creating quiz:', quizError);
        }
      }
      
      // Redirect to admin dashboard
      router.push('/admin');
    } catch (error) {
      console.error('Error creating course:', error);
      alert(`Error creating course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Course title, description, and category' },
    { number: 2, title: 'Details', description: 'Pricing, level, and duration' },
    { number: 3, title: 'Content', description: 'Modules and course structure' },
    { number: 4, title: 'Quiz', description: 'Optional course quiz' },
    { number: 5, title: 'Review', description: 'Review and publish' }
  ];

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'link': return <LinkIcon className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || userProfile?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You need admin privileges to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageLayout>
      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {/* Mobile-Optimized Progress Steps */}
        <div className="mb-6 sm:mb-8">
          {/* Mobile: Horizontal Scrollable Steps */}
          <div className="block sm:hidden">
            <div className="flex items-center space-x-4 overflow-x-auto pb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-shrink-0">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm ${
                    currentStep >= step.number 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step.number ? <CheckCircle className="w-4 h-4" /> : step.number}
                  </div>
                  <div className="ml-2 min-w-0">
                    <p className={`text-xs font-medium truncate ${
                      currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-3 ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Full Steps Display */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Steps */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="title" className="text-sm font-medium">Course Title *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAiMode('title');
                          setShowAIAssistant(true);
                        }}
                        className="text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Suggest
                      </Button>
                    </div>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter course title"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="course_type" className="text-sm font-medium">Course Type *</Label>
                    </div>
                    <Select value={formData.course_type} onValueChange={(value) => handleInputChange('course_type', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select course type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital">Digital Course (Online)</SelectItem>
                        <SelectItem value="in_person">In-Person Course</SelectItem>
                        <SelectItem value="hybrid">Hybrid (Digital + In-Person)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Digital courses include modules and quizzes. In-person courses focus on scheduling and logistics.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAiMode('category');
                          setShowAIAssistant(true);
                        }}
                        className="text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Suggest
                      </Button>
                    </div>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agile">Agile & Scrum</SelectItem>
                        <SelectItem value="leadership">Leadership</SelectItem>
                        <SelectItem value="product">Product Management</SelectItem>
                        <SelectItem value="mental-fitness">Mental Fitness</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description" className="text-sm font-medium">Course Description *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAiMode('description');
                        setShowAIAssistant(true);
                      }}
                      className="text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Generate
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what students will learn in this course"
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shortDesc" className="text-sm font-medium">Short Description</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAiMode('shortDesc');
                        setShowAIAssistant(true);
                      }}
                      className="text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Generate
                    </Button>
                  </div>
                  <Textarea
                    id="shortDesc"
                    value={formData.shortDesc}
                    onChange={(e) => handleInputChange('shortDesc', e.target.value)}
                    placeholder="Brief description for course cards"
                    className="mt-2"
                    rows={2}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="image" className="text-sm font-medium">Course Image URL</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateCourseImage}
                        disabled={aiLoading}
                        className="text-xs"
                      >
                        {aiLoading ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <ImageIcon className="w-3 h-3 mr-1" />
                        )}
                        AI Generate
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAiMode('imageIdeas');
                          setShowAIAssistant(true);
                        }}
                        className="text-xs"
                      >
                        <Lightbulb className="w-3 h-3 mr-1" />
                        Ideas
                      </Button>
                    </div>
                  </div>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="Enter image URL or generate with AI"
                    className="mt-2"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img 
                        src={formData.image} 
                        alt="Course preview" 
                        className="w-32 h-20 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="level" className="text-sm font-medium">Level *</Label>
                    <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration" className="text-sm font-medium">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="e.g., 4 weeks, 20 hours"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-sm font-medium">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      className="mt-2"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="image" className="text-sm font-medium">Course Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="featured" className="text-sm font-medium">Featured Course</Label>
                </div>

                {/* Conditional fields for in-person courses */}
                {(formData.course_type === 'in_person' || formData.course_type === 'hybrid') && (
                  <div className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div>
                      <h4 className="text-lg font-semibold text-amber-800 mb-4">In-Person Course Details</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="max_participants" className="text-sm font-medium">Max Participants</Label>
                        <Input
                          id="max_participants"
                          type="number"
                          value={formData.max_participants}
                          onChange={(e) => handleInputChange('max_participants', e.target.value)}
                          placeholder="e.g., 20"
                          className="mt-2"
                          min="1"
                          max="100"
                        />
                        <p className="text-xs text-gray-500 mt-1">Maximum number of participants for this course</p>
                      </div>

                      <div>
                        <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="e.g., Conference Room A, Sydney Office"
                          className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">Where the course will be conducted</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="instructor_name" className="text-sm font-medium">Instructor Name</Label>
                        <Input
                          id="instructor_name"
                          value={formData.instructor_name}
                          onChange={(e) => handleInputChange('instructor_name', e.target.value)}
                          placeholder="e.g., Dr. Sarah Johnson"
                          className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">Name of the course instructor</p>
                      </div>

                      <div>
                        <Label htmlFor="prerequisites" className="text-sm font-medium">Prerequisites</Label>
                        <Input
                          id="prerequisites"
                          value={formData.prerequisites}
                          onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                          placeholder="e.g., Basic project management knowledge"
                          className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">Any prerequisites for participants</p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="materials_included" className="text-sm font-medium">Materials Included</Label>
                      <Textarea
                        id="materials_included"
                        value={formData.materials_included}
                        onChange={(e) => handleInputChange('materials_included', e.target.value)}
                        placeholder="e.g., Workbook, certificate, refreshments, laptop (if needed)"
                        className="mt-2"
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">List all materials and resources included with the course</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Modules */}
            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-lg font-semibold">Course Modules</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setAiMode('modules');
                        setShowAIAssistant(true);
                      }}
                      className="text-sm"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Generate Modules
                    </Button>
                    <Button onClick={addModule} className="text-sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Module
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.modules.map((module, index) => (
                    <Card key={module.id}>
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <CardTitle className="text-base">Module {index + 1}</CardTitle>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowModuleAI(prev => ({
                                ...prev,
                                [module.id]: !prev[module.id]
                              }))}
                              className="text-xs"
                            >
                              <Brain className="w-3 h-3 mr-1" />
                              AI Assist
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeModule(module.id)}
                              className="text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Module Title</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => generateModuleContent(module.id, 'text')}
                              disabled={aiLoading}
                              className="text-xs"
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Suggest
                            </Button>
                          </div>
                          <Input
                            value={module.title}
                            onChange={(e) => {
                              const updatedModules = formData.modules.map(m =>
                                m.id === module.id ? { ...m, title: e.target.value } : m
                              );
                              setFormData(prev => ({ ...prev, modules: updatedModules }));
                            }}
                            placeholder="Enter module title"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Module Description</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => generateModuleContent(module.id, 'text')}
                              disabled={aiLoading}
                              className="text-xs"
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Generate
                            </Button>
                          </div>
                          <Textarea
                            value={module.description}
                            onChange={(e) => {
                              const updatedModules = formData.modules.map(m =>
                                m.id === module.id ? { ...m, description: e.target.value } : m
                              );
                              setFormData(prev => ({ ...prev, modules: updatedModules }));
                            }}
                            placeholder="Describe what this module covers"
                            className="mt-2"
                            rows={3}
                          />
                        </div>

                        {/* AI Assistant Panel for Module */}
                        {showModuleAI[module.id] && (
                          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm text-purple-800">AI Content Assistant</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generateModuleContent(module.id, 'video')}
                                  disabled={aiLoading}
                                  className="text-xs"
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  Video Script
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generateModuleContent(module.id, 'text')}
                                  disabled={aiLoading}
                                  className="text-xs"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Text Content
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generateModuleContent(module.id, 'exercise')}
                                  disabled={aiLoading}
                                  className="text-xs"
                                >
                                  <Target className="w-3 h-3 mr-1" />
                                  Exercises
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generateModuleContent(module.id, 'image')}
                                  disabled={aiLoading}
                                  className="text-xs"
                                >
                                  <ImageIcon className="w-3 h-3 mr-1" />
                                  Visuals
                                </Button>
                              </div>

                              {/* Display AI Suggestions for this module */}
                              {moduleAiSuggestions[module.id] && (
                                <div className="space-y-2">
                                  {Object.entries(moduleAiSuggestions[module.id]).map(([type, content]) => (
                                    <div key={type} className="bg-white rounded p-3 border">
                                      <div className="flex items-center justify-between mb-2">
                                        <h5 className="text-sm font-medium capitalize">{type} Suggestions</h5>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => copyToClipboard(content as string)}
                                          className="text-xs"
                                        >
                                          <Copy className="w-3 h-3 mr-1" />
                                          Copy
                                        </Button>
                                      </div>
                                      <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                                        <pre className="whitespace-pre-wrap">{content as string}</pre>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Module Content */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-sm font-medium">Module Content</Label>
                            <span className="text-xs text-gray-500">{module.contents.length} items</span>
                          </div>
                          
                          {module.contents.map((content, contentIndex) => (
                            <div key={content.id} className="flex items-center justify-between p-3 bg-gray-50 rounded mb-2">
                              <div className="flex items-center space-x-3">
                                {getContentIcon(content.type)}
                                <div>
                                  <p className="text-sm font-medium">{content.title}</p>
                                  <p className="text-xs text-gray-500">{content.type}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeContentFromModule(module.id, content.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        {editingModule === module.id ? (
                          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-sm font-medium">Content Type</Label>
                                <Select 
                                  value={newContent.type} 
                                  onValueChange={(value) => setNewContent(prev => ({ ...prev, type: value as any }))}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="text">Text Content</SelectItem>
                                    <SelectItem value="document">Document</SelectItem>
                                    <SelectItem value="link">External Link</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Content Title</Label>
                                <Input
                                  value={newContent.title}
                                  onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                                  placeholder="Enter content title"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">
                                {newContent.type === 'text' ? 'Content' : 'URL'}
                              </Label>
                              {newContent.type === 'text' ? (
                                <Textarea
                                  value={newContent.content}
                                  onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
                                  placeholder="Enter text content"
                                  className="mt-2"
                                  rows={4}
                                />
                              ) : (
                                <Input
                                  value={newContent.content}
                                  onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
                                  placeholder="Enter URL"
                                  className="mt-2"
                                />
                              )}
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Description (Optional)</Label>
                              <Textarea
                                value={newContent.description}
                                onChange={(e) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter content description"
                                className="mt-2"
                                rows={2}
                              />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button onClick={() => addContentToModule(module.id)} className="flex-1 sm:flex-none">
                                Add Content
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setEditingModule(null)}
                                className="flex-1 sm:flex-none"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => setEditingModule(module.id)}
                            className="w-full sm:w-auto"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Content
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Quiz */}
            {currentStep === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-lg font-semibold">Course Quiz (Optional)</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAiMode('quiz');
                      setShowAIAssistant(true);
                    }}
                    className="text-sm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Generate Quiz
                  </Button>
                </div>

                {!formData.quiz ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium mb-2">No Quiz Added</h4>
                      <p className="text-gray-600 mb-4">Add a quiz to test your students' knowledge</p>
                      <Button onClick={addQuiz}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Quiz
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Quiz Questions</CardTitle>
                        <CardDescription>
                          Add questions to test student understanding
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={addQuizQuestion} className="w-full sm:w-auto mb-4">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Question
                        </Button>

                        {formData.quiz.questions.map((question, index) => (
                          <Card key={question.id} className="mb-4">
                            <CardHeader className="pb-3">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <CardTitle className="text-sm">Question {index + 1}</CardTitle>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeQuizQuestion(question.id)}
                                  className="self-start sm:self-auto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Question Text</Label>
                                <Textarea
                                  value={question.question_text}
                                  onChange={(e) => updateQuizQuestion(question.id, 'question_text', e.target.value)}
                                  placeholder="Enter your question"
                                  className="mt-2"
                                  rows={3}
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Question Type</Label>
                                  <Select 
                                    value={question.question_type} 
                                    onValueChange={(value) => updateQuizQuestion(question.id, 'question_type', value)}
                                  >
                                    <SelectTrigger className="mt-2">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                      <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                                      <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Points</Label>
                                  <Input
                                    type="number"
                                    value={question.points}
                                    onChange={(e) => updateQuizQuestion(question.id, 'points', parseInt(e.target.value) || 1)}
                                    className="mt-2"
                                    min="1"
                                  />
                                </div>
                              </div>

                              {question.question_type === 'MULTIPLE_CHOICE' && (
                                <div>
                                  <Label className="text-sm font-medium">Answer Options</Label>
                                  <div className="space-y-2 mt-2">
                                    {question.options.map((option, optionIndex) => (
                                      <Input
                                        key={optionIndex}
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [...question.options];
                                          newOptions[optionIndex] = e.target.value;
                                          updateQuizQuestion(question.id, 'options', newOptions);
                                        }}
                                        placeholder={`Option ${optionIndex + 1}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                <Label className="text-sm font-medium">Correct Answer</Label>
                                <Input
                                  value={question.correct_answer}
                                  onChange={(e) => updateQuizQuestion(question.id, 'correct_answer', e.target.value)}
                                  placeholder="Enter the correct answer"
                                  className="mt-2"
                                />
                              </div>

                              <div>
                                <Label className="text-sm font-medium">Explanation (Optional)</Label>
                                <Textarea
                                  value={question.explanation || ''}
                                  onChange={(e) => updateQuizQuestion(question.id, 'explanation', e.target.value)}
                                  placeholder="Explain why this is the correct answer"
                                  className="mt-2"
                                  rows={2}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Review & Publish</h3>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Course Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Title</Label>
                          <p className="font-medium">{formData.title || 'Not set'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Category</Label>
                          <p className="font-medium">{formData.category || 'Not set'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Level</Label>
                          <p className="font-medium">{formData.level || 'Not set'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Price</Label>
                          <p className="font-medium">{formData.price ? `$${formData.price}` : 'Free'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Duration</Label>
                          <p className="font-medium">{formData.duration || 'Not set'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Status</Label>
                          <Badge variant={formData.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                            {formData.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Description</Label>
                        <p className="text-sm mt-1">{formData.description || 'No description provided'}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Modules</Label>
                        <p className="text-sm mt-1">{formData.modules.length} modules created</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Quiz</Label>
                        <p className="text-sm mt-1">
                          {formData.quiz ? `${formData.quiz.questions.length} questions` : 'No quiz added'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                      onClick={() => handleSubmit('DRAFT')}
                      disabled={loading}
                      variant="outline"
                      className="flex-1"
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save as Draft
                    </Button>
                    <Button
                      onClick={() => handleSubmit('PUBLISHED')}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                      Publish Course
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile-Optimized Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex-1 sm:flex-none"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          
          <Button
            onClick={nextStep}
            disabled={currentStep === steps.length}
            className="flex-1 sm:flex-none"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* AI Assistant Floating Button */}
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
          <Button
            onClick={() => setShowAIAssistant(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full w-12 h-12 sm:w-14 sm:h-14 p-0 group"
            size="lg"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-200" />
            <span className="sr-only">Open AI Assistant</span>
          </Button>
        </div>
      </main>

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Brain className="w-6 h-6" />
                  <div>
                    <CardTitle>AI Course Assistant</CardTitle>
                    <CardDescription className="text-teal-100">
                      Get AI-powered suggestions for your course content
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIAssistant(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Mobile Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* AI Mode Selection - Mobile */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">What would you like help with?</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {aiModeOptions.map(({ mode, icon: Icon, label }) => (
                        <Button
                          key={mode}
                          variant={aiMode === mode ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleAiModeChange(mode)}
                          className="flex flex-col items-center p-3 h-auto"
                        >
                          <Icon className="w-4 h-4 mb-1" />
                          <span className="text-xs text-center">{label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Mode Description */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
                    <h4 className="font-medium mb-2 text-blue-800 text-sm">
                      {aiModeDescriptions[aiMode]?.title}
                    </h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      {aiModeDescriptions[aiMode]?.description}
                    </p>
                  </div>

                  {/* Context Input */}
                  <div>
                    <Label htmlFor="aiContext-mobile" className="text-sm font-medium block mb-2">
                      Additional Context <span className="text-gray-500 text-xs">(Optional)</span>
                    </Label>
                    <Textarea
                      id="aiContext-mobile"
                      value={aiContext}
                      onChange={(e) => setAiContext(e.target.value)}
                      placeholder="Provide any additional context about your course..."
                      className="resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Course Info */}
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <h4 className="font-medium mb-3 text-sm flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Current Course Info
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Title:</span> 
                        <span className="text-right max-w-[60%] truncate">{formData.title || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Category:</span> 
                        <span>{formData.category || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Level:</span> 
                        <span>{formData.level || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Modules:</span> 
                        <span>{formData.modules.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Warning Message */}
                  {!formData.title && aiMode !== 'title' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <HelpCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-yellow-800">
                          Please enter a course title first to get AI suggestions.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Generate Button */}
                  <Button
                    onClick={generateAISuggestions}
                    disabled={aiLoading || (!formData.title && aiMode !== 'title')}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 min-h-[48px] text-base font-medium"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>

                  {/* Error Display */}
                  {aiError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-red-800 font-medium">Error</p>
                          <p className="text-xs text-red-700">{aiError}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAiError('')}
                          className="text-red-600 hover:text-red-700 p-1 h-auto"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* AI Suggestions */}
                  {aiSuggestions && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm flex items-center">
                          <Brain className="w-4 h-4 mr-2 text-purple-600" />
                          AI Suggestions
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(aiSuggestions)}
                          className="min-h-[36px] text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      
                      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                        <div className="max-h-48 overflow-y-auto p-3" style={{ WebkitOverflowScrolling: 'touch' }}>
                          <pre className="whitespace-pre-wrap text-xs leading-relaxed">{aiSuggestions}</pre>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {aiMode === 'description' && (
                          <div className="space-y-2">
                            <Button
                              onClick={() => applyAISuggestion('description')}
                              size="sm"
                              className="w-full min-h-[44px]"
                            >
                              Apply to Description
                            </Button>
                            <Button
                              onClick={() => applyAISuggestion('shortDesc')}
                              variant="outline"
                              size="sm"
                              className="w-full min-h-[44px]"
                            >
                              Apply to Short Description
                            </Button>
                          </div>
                        )}

                        {aiMode === 'title' && (
                          <Button
                            onClick={() => applyAISuggestion('title')}
                            size="sm"
                            className="w-full min-h-[44px]"
                          >
                            Apply First Title
                          </Button>
                        )}

                        {aiMode === 'modules' && (
                          <Button
                            onClick={() => applyAISuggestion('modules')}
                            size="sm"
                            className="w-full min-h-[44px]"
                          >
                            Apply Module Structure
                          </Button>
                        )}

                        {aiMode === 'quiz' && (
                          <Button
                            onClick={() => applyAISuggestion('quiz')}
                            size="sm"
                            className="w-full min-h-[44px]"
                          >
                            Apply Quiz Questions
                          </Button>
                        )}

                        {(aiMode === 'content' || aiMode === 'pricing' || aiMode === 'marketing' || aiMode === 'imageIdeas') && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                              <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-amber-800">
                                Copy the suggestions above and use them as reference for your course content.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Add some padding at bottom for scroll */}
                  <div className="pb-4"></div>
                </div>
              </CardContent>
            </div>

            {/* Mobile Footer */}
            <div className="border-t p-4 bg-white flex-shrink-0">
              <Button
                onClick={() => setShowAIAssistant(false)}
                variant="outline"
                className="w-full min-h-[44px]"
              >
                Close Assistant
              </Button>
            </div>
          </Card>

          {/* Desktop: Centered modal with proper scrolling */}
          <div className="hidden sm:block w-full max-w-4xl h-[90vh] flex flex-col">
            <Card className="flex flex-col h-full overflow-hidden">
              {/* Desktop Header - Fixed */}
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">AI Course Assistant</CardTitle>
                      <CardDescription className="text-purple-100">
                        Get AI-powered suggestions for your course content
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAIAssistant(false)}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>

              {/* Desktop Content - Scrollable */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* AI Mode Selection - Desktop */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">What would you like help with?</Label>
                      <div className="grid grid-cols-4 gap-3">
                        {aiModeOptions.map(({ mode, icon: Icon, label }) => (
                          <Button
                            key={mode}
                            variant={aiMode === mode ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleAiModeChange(mode)}
                            className="flex flex-col items-center p-4 h-auto"
                          >
                            <Icon className="w-5 h-5 mb-2" />
                            <span className="text-xs text-center">{label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Mode Description */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium mb-2 text-blue-800">
                        {aiModeDescriptions[aiMode]?.title}
                      </h4>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        {aiModeDescriptions[aiMode]?.description}
                      </p>
                    </div>

                    {/* Context Input */}
                    <div>
                      <Label htmlFor="aiContext-desktop" className="text-sm font-medium block mb-2">
                        Additional Context <span className="text-gray-500 text-xs">(Optional)</span>
                      </Label>
                      <Textarea
                        id="aiContext-desktop"
                        value={aiContext}
                        onChange={(e) => setAiContext(e.target.value)}
                        placeholder="Provide any additional context about your course, target audience, specific requirements, etc."
                        className="resize-none"
                        rows={3}
                      />
                    </div>

                    {/* Course Info */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h4 className="font-medium mb-3 flex items-center">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Current Course Info
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 font-medium">Title:</span> 
                          <div className="mt-1">{formData.title || 'Not set'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">Category:</span> 
                          <div className="mt-1">{formData.category || 'Not set'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">Level:</span> 
                          <div className="mt-1">{formData.level || 'Not set'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">Modules:</span> 
                          <div className="mt-1">{formData.modules.length}</div>
                        </div>
                      </div>
                    </div>

                    {/* Warning Message */}
                    {!formData.title && aiMode !== 'title' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <HelpCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-yellow-800">
                            Please enter a course title first to get AI suggestions.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Generate Button */}
                    <Button
                      onClick={generateAISuggestions}
                      disabled={aiLoading || (!formData.title && aiMode !== 'title')}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 min-h-[48px] text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating Suggestions...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate AI Suggestions
                        </>
                      )}
                    </Button>

                    {/* Error Display */}
                    {aiError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-red-800 font-medium">Error</p>
                            <p className="text-sm text-red-700">{aiError}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAiError('')}
                            className="text-red-600 hover:text-red-700 p-1 h-auto"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* AI Suggestions */}
                    {aiSuggestions && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium flex items-center">
                            <Brain className="w-4 h-4 mr-2 text-purple-600" />
                            AI Suggestions
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(aiSuggestions)}
                            className="text-xs"
                          >
                            <Copy className="w-3 h-3 mr-2" />
                            Copy
                          </Button>
                        </div>
                        
                        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                          <div className="max-h-60 overflow-y-auto p-4 overscroll-contain">
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed">{aiSuggestions}</pre>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="space-y-2">
                          {aiMode === 'description' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => applyAISuggestion('description')}
                                size="sm"
                                className="flex-1"
                              >
                                Apply to Description
                              </Button>
                              <Button
                                onClick={() => applyAISuggestion('shortDesc')}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                Apply to Short Description
                              </Button>
                            </div>
                          )}

                          {aiMode === 'title' && (
                            <Button
                              onClick={() => applyAISuggestion('title')}
                              size="sm"
                              className="w-full"
                            >
                              Apply First Title
                            </Button>
                          )}

                          {aiMode === 'modules' && (
                            <Button
                              onClick={() => applyAISuggestion('modules')}
                              size="sm"
                              className="w-full"
                            >
                              Apply Module Structure
                            </Button>
                          )}

                          {aiMode === 'quiz' && (
                            <Button
                              onClick={() => applyAISuggestion('quiz')}
                              size="sm"
                              className="w-full"
                            >
                              Apply Quiz Questions
                            </Button>
                          )}

                          {(aiMode === 'content' || aiMode === 'pricing' || aiMode === 'marketing' || aiMode === 'imageIdeas') && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <div className="flex items-start space-x-2">
                                <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-amber-800">
                                  Copy the suggestions above and use them as reference for your course content.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Add padding at bottom for better scrolling */}
                    <div className="pb-6"></div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>

          {/* Loading Overlay */}
          {aiLoading && (
            <div className="absolute inset-0 bg-gray-800/20 flex items-center justify-center z-10">
              <div className="text-white text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Generating image...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
} 