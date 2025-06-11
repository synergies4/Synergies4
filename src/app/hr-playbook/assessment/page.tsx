'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PageLayout from '@/components/shared/PageLayout';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle, 
  AlertTriangle,
  Target,
  Clock,
  TrendingUp,
  Users,
  Brain,
  Shield,
  Zap,
  Award,
  MessageSquare,
  FileText,
  Download,
  Calendar
} from 'lucide-react';

interface Question {
  id: string;
  text: string;
  category: string;
  options: {
    text: string;
    points: number;
    description?: string;
  }[];
}

interface Assessment {
  currentStep: number;
  answers: Record<string, number>;
  contactInfo: {
    name: string;
    email: string;
    company: string;
    role: string;
    notes: string;
  };
}

const questions: Question[] = [
  // Change Management Readiness
  {
    id: 'change_management_experience',
    text: 'How would you rate your organization\'s change management maturity?',
    category: 'Change Management',
    options: [
      { text: 'Beginner - We struggle with change initiatives', points: 1 },
      { text: 'Developing - We have some frameworks but inconsistent execution', points: 2 },
      { text: 'Competent - We have established processes and moderate success', points: 3 },
      { text: 'Advanced - We excel at change management and adaptation', points: 4 }
    ]
  },
  {
    id: 'leadership_alignment',
    text: 'How aligned is your leadership team on AI workforce integration?',
    category: 'Change Management',
    options: [
      { text: 'Not aligned - Mixed opinions and resistance', points: 1 },
      { text: 'Somewhat aligned - General agreement but unclear vision', points: 2 },
      { text: 'Well aligned - Clear vision with minor concerns', points: 3 },
      { text: 'Fully aligned - United vision and strong commitment', points: 4 }
    ]
  },
  {
    id: 'employee_sentiment',
    text: 'What is the general employee sentiment toward AI in your organization?',
    category: 'Change Management',
    options: [
      { text: 'Highly resistant - Fear and skepticism dominate', points: 1 },
      { text: 'Cautiously concerned - Open but worried about job security', points: 2 },
      { text: 'Cautiously optimistic - Interested but need reassurance', points: 3 },
      { text: 'Enthusiastic - Excited about AI collaboration opportunities', points: 4 }
    ]
  },

  // HR Capability
  {
    id: 'hr_tech_adoption',
    text: 'How would you rate HR\'s technology adoption capabilities?',
    category: 'HR Capability',
    options: [
      { text: 'Lagging - We struggle with new technology implementations', points: 1 },
      { text: 'Catching up - We adopt technology but slowly', points: 2 },
      { text: 'Competitive - We keep pace with industry standards', points: 3 },
      { text: 'Leading - We\'re early adopters and innovation drivers', points: 4 }
    ]
  },
  {
    id: 'workforce_planning',
    text: 'How advanced is your workforce planning and analytics?',
    category: 'HR Capability',
    options: [
      { text: 'Basic - Mainly headcount and basic metrics', points: 1 },
      { text: 'Developing - Some analytics but limited predictive capability', points: 2 },
      { text: 'Advanced - Good analytics with workforce modeling', points: 3 },
      { text: 'Sophisticated - Predictive analytics and scenario planning', points: 4 }
    ]
  },
  {
    id: 'skills_assessment',
    text: 'How well do you understand the skills needed for AI collaboration?',
    category: 'HR Capability',
    options: [
      { text: 'Unclear - We haven\'t assessed AI collaboration skills needs', points: 1 },
      { text: 'Basic understanding - We have general ideas but lack detail', points: 2 },
      { text: 'Good understanding - We\'ve mapped most critical skills', points: 3 },
      { text: 'Comprehensive - We have detailed skills frameworks for AI integration', points: 4 }
    ]
  },

  // Organizational Readiness
  {
    id: 'current_ai_usage',
    text: 'What is your organization\'s current level of AI implementation?',
    category: 'Organizational Readiness',
    options: [
      { text: 'No AI - We haven\'t implemented AI solutions', points: 1 },
      { text: 'Pilot stage - We\'re testing AI in limited areas', points: 2 },
      { text: 'Partial deployment - AI is used in several departments', points: 3 },
      { text: 'Advanced deployment - AI is integrated across multiple functions', points: 4 }
    ]
  },
  {
    id: 'governance_frameworks',
    text: 'Do you have governance frameworks for AI deployment?',
    category: 'Organizational Readiness',
    options: [
      { text: 'None - No formal AI governance in place', points: 1 },
      { text: 'Basic - Some informal guidelines and policies', points: 2 },
      { text: 'Developing - Formal framework in development', points: 3 },
      { text: 'Mature - Comprehensive AI governance and ethics framework', points: 4 }
    ]
  },
  {
    id: 'data_infrastructure',
    text: 'How would you rate your organization\'s data infrastructure readiness?',
    category: 'Organizational Readiness',
    options: [
      { text: 'Poor - Data is siloed and difficult to access', points: 1 },
      { text: 'Fair - Some integration but significant gaps', points: 2 },
      { text: 'Good - Well-integrated with minor limitations', points: 3 },
      { text: 'Excellent - Robust, accessible, and AI-ready data infrastructure', points: 4 }
    ]
  },

  // Risk Management
  {
    id: 'risk_identification',
    text: 'How well has your organization identified AI workforce integration risks?',
    category: 'Risk Management',
    options: [
      { text: 'Not assessed - We haven\'t systematically reviewed risks', points: 1 },
      { text: 'Basic assessment - We\'ve identified some obvious risks', points: 2 },
      { text: 'Thorough assessment - We\'ve mapped most potential risks', points: 3 },
      { text: 'Comprehensive - We have detailed risk frameworks and mitigation plans', points: 4 }
    ]
  },
  {
    id: 'change_resistance',
    text: 'How prepared are you to handle change resistance?',
    category: 'Risk Management',
    options: [
      { text: 'Unprepared - We expect significant resistance with no plan', points: 1 },
      { text: 'Basic plan - We have general strategies but limited specifics', points: 2 },
      { text: 'Good preparation - We have specific resistance management plans', points: 3 },
      { text: 'Excellent preparation - We have proven change strategies and engagement plans', points: 4 }
    ]
  },
  {
    id: 'compliance_considerations',
    text: 'How well do you understand compliance implications of AI workforce integration?',
    category: 'Risk Management',
    options: [
      { text: 'Unclear - We haven\'t considered compliance implications', points: 1 },
      { text: 'Basic awareness - We know there are issues but lack detail', points: 2 },
      { text: 'Good understanding - We\'ve identified most compliance requirements', points: 3 },
      { text: 'Comprehensive - We have detailed compliance frameworks and legal guidance', points: 4 }
    ]
  }
];

export default function HRAssessment() {
  const [assessment, setAssessment] = useState<Assessment>({
    currentStep: 0,
    answers: {},
    contactInfo: {
      name: '',
      email: '',
      company: '',
      role: '',
      notes: ''
    }
  });

  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = questions.length + 2; // Questions + contact info + results
  const progress = ((assessment.currentStep + 1) / totalSteps) * 100;

  const handleAnswer = (questionId: string, points: number) => {
    setAssessment(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: points
      }
    }));
  };

  const nextStep = () => {
    if (assessment.currentStep < questions.length) {
      setAssessment(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1
      }));
    } else if (assessment.currentStep === questions.length) {
      // Contact info step
      setAssessment(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1
      }));
      setShowResults(true);
    }
  };

  const prevStep = () => {
    if (assessment.currentStep > 0) {
      setAssessment(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }));
    }
  };

  const updateContactInfo = (field: keyof Assessment['contactInfo'], value: string) => {
    setAssessment(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));
  };

  const calculateResults = () => {
    const categories = ['Change Management', 'HR Capability', 'Organizational Readiness', 'Risk Management'];
    const categoryScores: Record<string, { score: number; maxScore: number }> = {};

    categories.forEach(category => {
      const categoryQuestions = questions.filter(q => q.category === category);
      const categoryPoints = categoryQuestions.reduce((sum, q) => sum + (assessment.answers[q.id] || 0), 0);
      const maxPoints = categoryQuestions.length * 4;
      
      categoryScores[category] = {
        score: categoryPoints,
        maxScore: maxPoints
      };
    });

    const totalScore = Object.values(categoryScores).reduce((sum, cat) => sum + cat.score, 0);
    const maxTotalScore = Object.values(categoryScores).reduce((sum, cat) => sum + cat.maxScore, 0);
    const overallPercentage = Math.round((totalScore / maxTotalScore) * 100);

    return { categoryScores, totalScore, maxTotalScore, overallPercentage };
  };

  const getReadinessLevel = (percentage: number) => {
    if (percentage >= 85) return { level: 'Advanced', color: 'green', icon: Award };
    if (percentage >= 70) return { level: 'Ready', color: 'blue', icon: CheckCircle };
    if (percentage >= 55) return { level: 'Developing', color: 'yellow', icon: TrendingUp };
    return { level: 'Beginning', color: 'red', icon: AlertTriangle };
  };

  const getRecommendations = (percentage: number, categoryScores: any) => {
    const recommendations = [];

    if (percentage < 55) {
      recommendations.push({
        title: 'Foundation Building Required',
        description: 'Your organization needs comprehensive preparation before AI workforce integration.',
        actions: [
          'Conduct leadership alignment workshops',
          'Develop change management capabilities',
          'Assess current technology infrastructure',
          'Create AI governance framework'
        ],
        priority: 'High'
      });
    }

    if (categoryScores['Change Management'].score / categoryScores['Change Management'].maxScore < 0.7) {
      recommendations.push({
        title: 'Strengthen Change Management',
        description: 'Build robust change management capabilities to ensure successful AI adoption.',
        actions: [
          'Train change champions',
          'Develop communication strategies',
          'Create employee engagement programs',
          'Establish feedback mechanisms'
        ],
        priority: 'High'
      });
    }

    if (categoryScores['HR Capability'].score / categoryScores['HR Capability'].maxScore < 0.7) {
      recommendations.push({
        title: 'Enhance HR Capabilities',
        description: 'Upgrade HR skills and systems to manage hybrid workforce effectively.',
        actions: [
          'Invest in HR technology platforms',
          'Develop workforce analytics capabilities',
          'Train on AI collaboration skills',
          'Create new role definitions'
        ],
        priority: 'Medium'
      });
    }

    if (categoryScores['Risk Management'].score / categoryScores['Risk Management'].maxScore < 0.6) {
      recommendations.push({
        title: 'Address Risk Management Gaps',
        description: 'Strengthen risk identification and mitigation strategies.',
        actions: [
          'Conduct comprehensive risk assessment',
          'Develop contingency plans',
          'Ensure compliance readiness',
          'Create monitoring systems'
        ],
        priority: 'High'
      });
    }

    return recommendations;
  };

  const submitAssessment = async () => {
    setIsSubmitting(true);
    
    // Here you would typically send the data to your backend
    try {
      const results = calculateResults();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you'd send this data to your CRM/lead management system
      console.log('Assessment submitted:', {
        contactInfo: assessment.contactInfo,
        results: results,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questions[assessment.currentStep];
  const isQuestionStep = assessment.currentStep < questions.length;
  const isContactStep = assessment.currentStep === questions.length;
  const isResultsStep = assessment.currentStep > questions.length;

  const canProceed = () => {
    if (isQuestionStep) {
      return assessment.answers[currentQuestion.id] !== undefined;
    }
    if (isContactStep) {
      return assessment.contactInfo.name && assessment.contactInfo.email && assessment.contactInfo.company;
    }
    return true;
  };

  if (showResults) {
    const results = calculateResults();
    const readinessInfo = getReadinessLevel(results.overallPercentage);
    const recommendations = getRecommendations(results.overallPercentage, results.categoryScores);
    const ReadinessIcon = readinessInfo.icon;

    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Results Header */}
              <div className="text-center mb-12">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${
                  readinessInfo.color === 'green' ? 'from-green-500 to-emerald-500' :
                  readinessInfo.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                  readinessInfo.color === 'yellow' ? 'from-yellow-500 to-orange-500' :
                  'from-red-500 to-pink-500'
                } mb-6 mx-auto`}>
                  <ReadinessIcon className="w-10 h-10 text-white" />
                </div>
                
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Your HR Readiness Assessment Results
                </h1>
                
                <div className="text-6xl font-bold mb-2">
                  <span className={`${
                    readinessInfo.color === 'green' ? 'text-green-600' :
                    readinessInfo.color === 'blue' ? 'text-blue-600' :
                    readinessInfo.color === 'yellow' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {results.overallPercentage}%
                  </span>
                </div>
                
                <Badge className={`text-lg px-4 py-2 ${
                  readinessInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                  readinessInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                  readinessInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {readinessInfo.level} Readiness
                </Badge>
              </div>

              {/* Category Breakdown */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Detailed Category Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(results.categoryScores).map(([category, scores]) => {
                      const percentage = Math.round((scores.score / scores.maxScore) * 100);
                      return (
                        <div key={category}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-900">{category}</span>
                            <span className="text-sm text-gray-600">{scores.score}/{scores.maxScore} points</span>
                          </div>
                          <Progress value={percentage} className="h-3" />
                          <div className="text-right text-sm text-gray-600 mt-1">{percentage}%</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    Personalized Recommendations
                  </CardTitle>
                  <CardDescription>
                    Based on your assessment, here are the key areas to focus on for successful AI workforce integration.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {recommendations.map((rec, index) => (
                      <div key={index} className={`p-6 rounded-lg border-l-4 ${
                        rec.priority === 'High' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-gray-900">{rec.title}</h4>
                          <Badge variant={rec.priority === 'High' ? 'destructive' : 'default'}>
                            {rec.priority} Priority
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-4">{rec.description}</p>
                        <div className="space-y-2">
                          <p className="font-semibold text-gray-900">Recommended Actions:</p>
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {rec.actions.map((action, i) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Schedule Expert Consultation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-800 mb-4">
                      Get personalized guidance from our HR transformation experts. We'll help you create a 
                      customized roadmap based on your assessment results.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-blue-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        30-minute strategy session
                      </div>
                      <div className="flex items-center text-sm text-blue-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Customized transformation roadmap
                      </div>
                      <div className="flex items-center text-sm text-blue-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Expert recommendations
                      </div>
                    </div>
                    <Link href="/contact">
                      <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-900 flex items-center">
                      <Download className="w-5 h-5 mr-2" />
                      Download Your Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-800 mb-4">
                      Get a comprehensive PDF report with your results, recommendations, and action items 
                      to share with your leadership team.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Detailed assessment results
                      </div>
                      <div className="flex items-center text-sm text-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Executive summary
                      </div>
                      <div className="flex items-center text-sm text-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Action plan template
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4 border-green-600 text-green-600 hover:bg-green-50">
                      <FileText className="w-4 h-4 mr-2" />
                      Download Report
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 text-center">
                <Link href="/hr-playbook">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to HR Playbook
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                HR Readiness Assessment
              </h1>
              <p className="text-xl text-gray-700 mb-6">
                Evaluate your organization's readiness for agentic AI workforce integration
              </p>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-medium text-gray-700">
                    {assessment.currentStep + 1} of {totalSteps}
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              <Badge className="bg-blue-100 text-blue-800">
                <Clock className="w-4 h-4 mr-2" />
                15 minutes
              </Badge>
            </div>

            {/* Question Step */}
            {isQuestionStep && (
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      {currentQuestion.category}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Question {assessment.currentStep + 1} of {questions.length}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mt-4">
                    {currentQuestion.text}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(currentQuestion.id, option.points)}
                        className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                          assessment.answers[currentQuestion.id] === option.points
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                            assessment.answers[currentQuestion.id] === option.points
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {assessment.answers[currentQuestion.id] === option.points && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">{option.text}</span>
                        </div>
                        {option.description && (
                          <p className="mt-2 ml-7 text-sm text-gray-600">{option.description}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Info Step */}
            {isContactStep && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Get Your Personalized Results
                  </CardTitle>
                  <CardDescription>
                    Please provide your contact information to receive your detailed assessment report and personalized recommendations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={assessment.contactInfo.name}
                        onChange={(e) => updateContactInfo('name', e.target.value)}
                        placeholder="Your full name"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={assessment.contactInfo.email}
                        onChange={(e) => updateContactInfo('email', e.target.value)}
                        placeholder="your.email@company.com"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        value={assessment.contactInfo.company}
                        onChange={(e) => updateContactInfo('company', e.target.value)}
                        placeholder="Your company name"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={assessment.contactInfo.role}
                        onChange={(e) => updateContactInfo('role', e.target.value)}
                        placeholder="e.g., CHRO, HR Director"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label htmlFor="notes">Additional Context (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={assessment.contactInfo.notes}
                      onChange={(e) => updateContactInfo('notes', e.target.value)}
                      placeholder="Any specific challenges or goals you'd like us to know about..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Privacy Commitment</h4>
                        <p className="text-sm text-blue-800">
                          Your information is secure and will only be used to provide your assessment results and relevant 
                          resources. We respect your privacy and won't spam you.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={assessment.currentStep === 0}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button
                onClick={isContactStep ? submitAssessment : nextStep}
                disabled={!canProceed() || isSubmitting}
                className="flex items-center bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : isContactStep ? (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Get My Results
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 