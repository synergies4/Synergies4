'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator,
  TrendingUp,
  Target,
  DollarSign,
  Clock,
  User,
  Upload,
  Brain,
  Award,
  Zap,
  BarChart3,
  PieChart,
  ArrowRight,
  Check,
  Star,
  Briefcase,
  GraduationCap,
  Building,
  Users,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  experience_level: string;
  current_role: string;
  target_role: string;
  industry: string;
  current_salary?: number;
  target_salary?: number;
  skills: string[];
  goals: string[];
  learning_style: string;
  time_commitment: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  cost: number;
  skills: string[];
  outcomes: string[];
  difficulty: string;
  format: string;
  prerequisites: string[];
}

interface ROIProjection {
  course_id: string;
  course_title: string;
  fit_score: number;
  salary_increase: {
    year_1: number;
    year_3: number;
    year_5: number;
    lifetime: number;
  };
  roi_percentage: {
    year_1: number;
    year_3: number;
    year_5: number;
    lifetime: number;
  };
  personalized_benefits: string[];
  timeline_to_impact: string;
  confidence_score: number;
}

// Mock data - in production this would come from your API
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'AI Strategy for Leaders',
    description: 'Comprehensive course on implementing AI strategies in business',
    duration: '8 weeks',
    cost: 2499,
    skills: ['AI Strategy', 'Leadership', 'Digital Transformation'],
    outcomes: ['AI Implementation', 'Team Leadership', 'Strategic Planning'],
    difficulty: 'Advanced',
    format: 'Online + Live Sessions',
    prerequisites: ['Management Experience', 'Basic Tech Understanding']
  },
  {
    id: '2',
    title: 'Data-Driven Decision Making',
    description: 'Learn to make strategic decisions using data analytics',
    duration: '6 weeks',
    cost: 1799,
    skills: ['Data Analysis', 'Decision Making', 'Business Intelligence'],
    outcomes: ['Data Literacy', 'Strategic Thinking', 'Analytics'],
    difficulty: 'Intermediate',
    format: 'Self-paced Online',
    prerequisites: ['Basic Excel Skills']
  },
  {
    id: '3',
    title: 'Agile Leadership Certification',
    description: 'Master agile methodologies and lead high-performing teams',
    duration: '4 weeks',
    cost: 1299,
    skills: ['Agile Methodology', 'Team Leadership', 'Project Management'],
    outcomes: ['Agile Certification', 'Team Performance', 'Project Delivery'],
    difficulty: 'Intermediate',
    format: 'Hybrid',
    prerequisites: ['Team Leadership Experience']
  }
];

export default function ROIEnginePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    experience_level: '',
    current_role: '',
    target_role: '',
    industry: '',
    current_salary: undefined,
    target_salary: undefined,
    skills: [],
    goals: [],
    learning_style: '',
    time_commitment: ''
  });
  const [resumeText, setResumeText] = useState('');
  const [roiProjections, setRoiProjections] = useState<ROIProjection[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    // Check if profile is complete
    const isComplete = userProfile.experience_level && 
                      userProfile.current_role && 
                      userProfile.target_role && 
                      userProfile.industry &&
                      userProfile.current_salary &&
                      userProfile.learning_style;
    setProfileComplete(!!isComplete);
  }, [userProfile]);

  const handleProfileUpdate = (field: keyof UserProfile, value: any) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateROI = async () => {
    setIsCalculating(true);
    
    // Simulate API call - in production this would be a real AI-powered calculation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock ROI calculations based on user profile
    const mockProjections: ROIProjection[] = mockCourses.map(course => {
      const baseSalaryIncrease = userProfile.current_salary 
        ? userProfile.current_salary * 0.15 
        : 15000;
      
      const fitScore = Math.floor(Math.random() * 30) + 70; // 70-100
      const confidenceScore = Math.floor(Math.random() * 20) + 80; // 80-100
      
      return {
        course_id: course.id,
        course_title: course.title,
        fit_score: fitScore,
        salary_increase: {
          year_1: Math.floor(baseSalaryIncrease * 0.7),
          year_3: Math.floor(baseSalaryIncrease * 1.2),
          year_5: Math.floor(baseSalaryIncrease * 1.8),
          lifetime: Math.floor(baseSalaryIncrease * 12)
        },
        roi_percentage: {
          year_1: Math.floor((baseSalaryIncrease * 0.7 / course.cost) * 100),
          year_3: Math.floor((baseSalaryIncrease * 1.2 * 3 / course.cost) * 100),
          year_5: Math.floor((baseSalaryIncrease * 1.8 * 5 / course.cost) * 100),
          lifetime: Math.floor((baseSalaryIncrease * 12 / course.cost) * 100)
        },
        personalized_benefits: [
          `Advance to ${userProfile.target_role} role faster`,
          `Increase expertise in ${userProfile.industry} industry`,
          `Build leadership capabilities for your career goals`,
          `Gain competitive advantage in current market`
        ],
        timeline_to_impact: fitScore > 85 ? '3-6 months' : '6-12 months',
        confidence_score: confidenceScore
      };
    });

    // Sort by fit score
    mockProjections.sort((a, b) => b.fit_score - a.fit_score);
    
    setRoiProjections(mockProjections);
    setIsCalculating(false);
    setActiveTab('results');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
              <Calculator className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Personalized Course ROI & Value Engine
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get tailored course recommendations with precise ROI projections based on your unique career profile and goals.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Profile Setup</span>
              </TabsTrigger>
              <TabsTrigger value="calculate" disabled={!profileComplete} className="flex items-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span>Calculate ROI</span>
              </TabsTrigger>
              <TabsTrigger value="results" disabled={roiProjections.length === 0} className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Your Results</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Setup Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Build Your Career Profile</span>
                  </CardTitle>
                  <CardDescription>
                    Tell us about your background and goals to get personalized ROI calculations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Resume Upload Section */}
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 transition-colors">
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Upload Resume or Paste LinkedIn Profile</h3>
                      <p className="text-gray-600 mb-4">We'll automatically extract your experience and skills</p>
                      <div className="space-y-4">
                        <Button variant="outline" className="w-full">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Resume (PDF/Word)
                        </Button>
                        <div className="text-sm text-gray-500">OR</div>
                        <Textarea
                          placeholder="Paste your LinkedIn profile summary or resume text here..."
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Manual Profile Form */}
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="experience">Experience Level</Label>
                        <Select value={userProfile.experience_level} onValueChange={(value) => handleProfileUpdate('experience_level', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                            <SelectItem value="mid">Mid Level (3-7 years)</SelectItem>
                            <SelectItem value="senior">Senior Level (8-15 years)</SelectItem>
                            <SelectItem value="executive">Executive Level (15+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="current-role">Current Role</Label>
                        <Input
                          id="current-role"
                          placeholder="e.g., Marketing Manager"
                          value={userProfile.current_role}
                          onChange={(e) => handleProfileUpdate('current_role', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="target-role">Target Role</Label>
                        <Input
                          id="target-role"
                          placeholder="e.g., Senior Marketing Director"
                          value={userProfile.target_role}
                          onChange={(e) => handleProfileUpdate('target_role', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="industry">Industry</Label>
                        <Select value={userProfile.industry} onValueChange={(value) => handleProfileUpdate('industry', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="consulting">Consulting</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="current-salary">Current Annual Salary (USD)</Label>
                        <Input
                          id="current-salary"
                          type="number"
                          placeholder="e.g., 85000"
                          value={userProfile.current_salary || ''}
                          onChange={(e) => handleProfileUpdate('current_salary', parseInt(e.target.value) || undefined)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="target-salary">Target Annual Salary (USD)</Label>
                        <Input
                          id="target-salary"
                          type="number"
                          placeholder="e.g., 120000"
                          value={userProfile.target_salary || ''}
                          onChange={(e) => handleProfileUpdate('target_salary', parseInt(e.target.value) || undefined)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="learning-style">Preferred Learning Style</Label>
                        <Select value={userProfile.learning_style} onValueChange={(value) => handleProfileUpdate('learning_style', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="How do you learn best?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="self-paced">Self-paced Online</SelectItem>
                            <SelectItem value="live-sessions">Live Sessions</SelectItem>
                            <SelectItem value="hybrid">Hybrid (Online + Live)</SelectItem>
                            <SelectItem value="cohort">Cohort-based</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="time-commitment">Time Commitment</Label>
                        <Select value={userProfile.time_commitment} onValueChange={(value) => handleProfileUpdate('time_commitment', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="How much time can you dedicate?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2-4">2-4 hours per week</SelectItem>
                            <SelectItem value="5-10">5-10 hours per week</SelectItem>
                            <SelectItem value="10-15">10-15 hours per week</SelectItem>
                            <SelectItem value="15+">15+ hours per week</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    {profileComplete ? (
                      <Button onClick={() => setActiveTab('calculate')} size="lg" className="bg-teal-600 hover:bg-teal-700">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Continue to ROI Calculator
                      </Button>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Complete your profile to proceed</p>
                        <Progress value={Object.values(userProfile).filter(Boolean).length / 6 * 100} className="w-64" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calculate ROI Tab */}
            <TabsContent value="calculate" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="w-5 h-5" />
                    <span>Generate Your Personalized ROI Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Our AI engine will analyze your profile against our course catalog to provide personalized ROI projections.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-24 h-24 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Brain className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-4">Ready to Calculate Your ROI</h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                      Based on your profile, we'll analyze {mockCourses.length} courses in our catalog to identify the highest-ROI opportunities for your career growth.
                    </p>
                    
                    {/* Profile Summary */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-2xl mx-auto">
                      <h4 className="font-semibold mb-3">Your Profile Summary:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Current Role:</span>
                          <div className="font-medium">{userProfile.current_role}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Target Role:</span>
                          <div className="font-medium">{userProfile.target_role}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Industry:</span>
                          <div className="font-medium capitalize">{userProfile.industry}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Experience:</span>
                          <div className="font-medium capitalize">{userProfile.experience_level}</div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={calculateROI}
                      disabled={isCalculating}
                      size="lg"
                      className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-4"
                    >
                      {isCalculating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing Courses...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Calculate My ROI
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Personalized ROI Analysis</h2>
                <p className="text-gray-600">Courses ranked by fit and ROI potential for your career goals</p>
              </div>

              <div className="space-y-6">
                {roiProjections.map((projection, index) => (
                  <Card key={projection.course_id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                              #{index + 1} Best Fit
                            </Badge>
                            <Badge variant="outline">
                              {projection.fit_score}% Match
                            </Badge>
                            <Badge variant="outline">
                              {projection.confidence_score}% Confidence
                            </Badge>
                          </div>
                          <CardTitle className="text-xl mb-1">{projection.course_title}</CardTitle>
                          <CardDescription>
                            Timeline to Impact: {projection.timeline_to_impact}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {projection.roi_percentage.year_1}% ROI
                          </div>
                          <div className="text-sm text-gray-500">Year 1</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* ROI Projections */}
                        <div className="lg:col-span-2">
                          <h4 className="font-semibold mb-3 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Salary Increase Projections
                          </h4>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-green-50 p-3 rounded-lg">
                              <div className="text-lg font-bold text-green-700">
                                {formatCurrency(projection.salary_increase.year_1)}
                              </div>
                              <div className="text-sm text-green-600">Year 1</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="text-lg font-bold text-blue-700">
                                {formatCurrency(projection.salary_increase.year_3)}
                              </div>
                              <div className="text-sm text-blue-600">Year 3</div>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg">
                              <div className="text-lg font-bold text-purple-700">
                                {formatCurrency(projection.salary_increase.year_5)}
                              </div>
                              <div className="text-sm text-purple-600">Year 5</div>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg">
                              <div className="text-lg font-bold text-orange-700">
                                {formatCurrency(projection.salary_increase.lifetime)}
                              </div>
                              <div className="text-sm text-orange-600">Lifetime</div>
                            </div>
                          </div>

                          <h4 className="font-semibold mb-3 flex items-center">
                            <Target className="w-4 h-4 mr-2" />
                            Personalized Benefits
                          </h4>
                          <ul className="space-y-2">
                            {projection.personalized_benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* ROI Chart Placeholder */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold mb-3 flex items-center">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            ROI Over Time
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Year 1</span>
                              <span className="font-bold text-green-600">{projection.roi_percentage.year_1}%</span>
                            </div>
                            <Progress value={Math.min(projection.roi_percentage.year_1, 500) / 5} className="h-2" />
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Year 3</span>
                              <span className="font-bold text-blue-600">{projection.roi_percentage.year_3}%</span>
                            </div>
                            <Progress value={Math.min(projection.roi_percentage.year_3, 1000) / 10} className="h-2" />
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Year 5</span>
                              <span className="font-bold text-purple-600">{projection.roi_percentage.year_5}%</span>
                            </div>
                            <Progress value={Math.min(projection.roi_percentage.year_5, 1500) / 15} className="h-2" />
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <Link href={`/courses/${projection.course_id}`}>
                              <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700">
                                View Course Details
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button variant="outline" onClick={() => setActiveTab('profile')} size="lg">
                  <User className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
                <Button size="lg" className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
                  <Star className="w-4 h-4 mr-2" />
                  Save Results & Get Started
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 