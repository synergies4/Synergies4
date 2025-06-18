'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  FileText, 
  Target, 
  Brain, 
  MessageCircle, 
  Download, 
  CheckCircle,
  AlertCircle,
  Building,
  User,
  TrendingUp,
  BookOpen,
  Video,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface JobApplication {
  id?: number;
  job_title: string;
  company_name: string;
  job_description: string;
  job_url?: string;
  job_location?: string;
  employment_type?: string;
  salary_range?: string;
  overall_fit_score?: number;
  skill_matches?: string[];
  skill_gaps?: string[];
  keyword_matches?: string[];
}

interface ResumeData {
  filename?: string;
  content?: string;
  file_url?: string;
}

interface CareerGoals {
  short_term_goals: string[];
  long_term_goals: string[];
  preferred_industries: string[];
  preferred_roles: string[];
  current_strengths: string[];
  areas_for_improvement: string[];
}

interface CompanyIntelligence {
  company_background: string;
  company_culture: string[];
  recent_news: string[];
  company_size: string;
  industry: string;
  values: string[];
}

export default function ResumeCustomizer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>({});
  const [jobApplication, setJobApplication] = useState<JobApplication>({
    job_title: '',
    company_name: '',
    job_description: '',
    job_url: '',
    job_location: '',
    employment_type: 'full-time',
    salary_range: ''
  });
  const [careerGoals, setCareerGoals] = useState<CareerGoals>({
    short_term_goals: [],
    long_term_goals: [],
    preferred_industries: [],
    preferred_roles: [],
    current_strengths: [],
    areas_for_improvement: []
  });
  const [companyIntelligence, setCompanyIntelligence] = useState<CompanyIntelligence | null>(null);
  const [fitAnalysis, setFitAnalysis] = useState<any>(null);
  const [tailoredResume, setTailoredResume] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [showCareerGoalsSurvey, setShowCareerGoalsSurvey] = useState(false);

  const steps = [
    { id: 'upload', title: 'Upload Resume', icon: Upload },
    { id: 'job', title: 'Add Job Description', icon: FileText },
    { id: 'analysis', title: 'Fit Analysis', icon: Target },
    { id: 'customize', title: 'Customize Resume', icon: Brain },
    { id: 'cover-letter', title: 'Cover Letter', icon: MessageCircle },
    { id: 'interview', title: 'Interview Prep', icon: Video }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.docx') && file.type !== 'text/plain') {
      toast.error('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/resume-customizer/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setResumeData({
          filename: file.name,
          content: result.content,
          file_url: result.file_url
        });
        toast.success('Resume uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  const analyzeJobFit = async () => {
    if (!resumeData.content || !jobApplication.job_description) {
      toast.error('Please upload resume and add job description first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/resume-customizer/analyze-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_content: resumeData.content,
          job_description: jobApplication.job_description,
          job_title: jobApplication.job_title,
          company_name: jobApplication.company_name
        })
      });

      if (response.ok) {
        const result = await response.json();
        setFitAnalysis(result.analysis);
        setJobApplication(prev => ({
          ...prev,
          overall_fit_score: result.analysis.overall_fit_score,
          skill_matches: result.analysis.skill_matches,
          skill_gaps: result.analysis.skill_gaps,
          keyword_matches: result.analysis.keyword_matches
        }));
        
        // Get company intelligence if company name is provided
        if (jobApplication.company_name) {
          fetchCompanyIntelligence(jobApplication.company_name);
        }
        
        setCurrentStep(2);
        toast.success('Fit analysis completed!');
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing fit:', error);
      toast.error('Failed to analyze job fit');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyIntelligence = async (companyName: string) => {
    try {
      const response = await fetch('/api/resume-customizer/company-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName })
      });

      if (response.ok) {
        const result = await response.json();
        setCompanyIntelligence(result.intelligence);
      }
    } catch (error) {
      console.error('Error fetching company intelligence:', error);
    }
  };

  const generateTailoredResume = async () => {
    if (!fitAnalysis) return;

    setLoading(true);
    try {
      const response = await fetch('/api/resume-customizer/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_resume: resumeData.content,
          job_description: jobApplication.job_description,
          fit_analysis: fitAnalysis,
          company_intelligence: companyIntelligence
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTailoredResume(result.tailored_resume);
        toast.success('Resume customized successfully!');
      } else {
        throw new Error('Tailoring failed');
      }
    } catch (error) {
      console.error('Error tailoring resume:', error);
      toast.error('Failed to customize resume');
    } finally {
      setLoading(false);
    }
  };

  const generateCoverLetter = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/resume-customizer/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_content: resumeData.content,
          job_description: jobApplication.job_description,
          job_title: jobApplication.job_title,
          company_name: jobApplication.company_name,
          company_intelligence: companyIntelligence,
          fit_analysis: fitAnalysis
        })
      });

      if (response.ok) {
        const result = await response.json();
        setCoverLetter(result.cover_letter);
        toast.success('Cover letter generated successfully!');
      } else {
        throw new Error('Cover letter generation failed');
      }
    } catch (error) {
      console.error('Error generating cover letter:', error);
      toast.error('Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const generateInterviewQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/resume-customizer/generate-interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_description: jobApplication.job_description,
          job_title: jobApplication.job_title,
          company_name: jobApplication.company_name,
          company_intelligence: companyIntelligence,
          resume_content: resumeData.content
        })
      });

      if (response.ok) {
        const result = await response.json();
        setInterviewQuestions(result.questions);
        toast.success('Interview questions generated!');
      } else {
        throw new Error('Question generation failed');
      }
    } catch (error) {
      console.error('Error generating interview questions:', error);
      toast.error('Failed to generate interview questions');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Resume Customizer</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered tool to tailor your resume, generate cover letters, and prepare for interviews
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted ? 'bg-green-500 text-white' : 
                    isCurrent ? 'bg-blue-500 text-white' : 
                    'bg-gray-200 text-gray-400'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`text-sm font-medium ${
                    isCurrent ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress 
            value={(currentStep / (steps.length - 1)) * 100} 
            className="h-2"
          />
        </div>

        {/* Step Content */}
        <Card className="shadow-xl">
          <CardContent className="p-8">
            {/* Step 0: Upload Resume */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Upload className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
                  <p className="text-gray-600">Upload your current resume to get started</p>
                </div>

                <div className="max-w-md mx-auto">
                  <Label htmlFor="resume-upload" className="block text-center">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition-colors cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-400 mt-2">PDF, DOCX, or TXT files supported</p>
                    </div>
                  </Label>
                  <Input
                    id="resume-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                </div>

                {resumeData.filename && (
                  <div className="max-w-md mx-auto">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">{resumeData.filename}</p>
                          <p className="text-sm text-green-600">Resume uploaded successfully</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <Button 
                    onClick={nextStep} 
                    disabled={!resumeData.content}
                    className="px-8 py-3"
                  >
                    Continue to Job Description
                  </Button>
                </div>
              </div>
            )}

            {/* Step 1: Job Description */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Job Description</h2>
                  <p className="text-gray-600">Paste the job listing you're targeting</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      value={jobApplication.job_title}
                      onChange={(e) => setJobApplication(prev => ({ ...prev, job_title: e.target.value }))}
                      placeholder="e.g., Senior Software Engineer"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={jobApplication.company_name}
                      onChange={(e) => setJobApplication(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="e.g., Google, Microsoft, etc."
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="job_location">Location</Label>
                    <Input
                      id="job_location"
                      value={jobApplication.job_location}
                      onChange={(e) => setJobApplication(prev => ({ ...prev, job_location: e.target.value }))}
                      placeholder="e.g., San Francisco, CA or Remote"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="employment_type">Employment Type</Label>
                    <Select 
                      value={jobApplication.employment_type} 
                      onValueChange={(value) => setJobApplication(prev => ({ ...prev, employment_type: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="job_description">Job Description</Label>
                  <Textarea
                    id="job_description"
                    value={jobApplication.job_description}
                    onChange={(e) => setJobApplication(prev => ({ ...prev, job_description: e.target.value }))}
                    placeholder="Paste the complete job description here..."
                    className="mt-2 min-h-[200px]"
                  />
                </div>

                <div>
                  <Label htmlFor="job_url">Job URL (Optional)</Label>
                  <Input
                    id="job_url"
                    value={jobApplication.job_url}
                    onChange={(e) => setJobApplication(prev => ({ ...prev, job_url: e.target.value }))}
                    placeholder="https://..."
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowCareerGoalsSurvey(true);
                    }}
                    variant="outline"
                    className="mr-4"
                  >
                    Take Career Goals Survey
                  </Button>
                  <Button 
                    onClick={analyzeJobFit}
                    disabled={!jobApplication.job_title || !jobApplication.job_description}
                    loading={loading}
                  >
                    Analyze Job Fit
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Fit Analysis */}
            {currentStep === 2 && fitAnalysis && (
              <div className="space-y-6">
                <div className="text-center">
                  <Target className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Fit Analysis</h2>
                  <p className="text-gray-600">See how well your resume matches the job requirements</p>
                </div>

                {/* Overall Score */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {fitAnalysis.overall_fit_score}%
                    </div>
                    <p className="text-lg font-medium text-gray-700">Overall Match Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Skill Matches */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        Matching Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {fitAnalysis.skill_matches?.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skill Gaps */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-600">
                        <AlertCircle className="h-5 w-5" />
                        Areas to Highlight
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {fitAnalysis.skill_gaps?.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Company Intelligence */}
                {companyIntelligence && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Company Intelligence
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Company Background</h4>
                        <p className="text-gray-600">{companyIntelligence.company_background}</p>
                      </div>
                      {companyIntelligence.company_culture.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Company Culture</h4>
                          <div className="flex flex-wrap gap-2">
                            {companyIntelligence.company_culture.map((culture, index) => (
                              <Badge key={index} variant="outline">{culture}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={nextStep}>
                    Customize Resume
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Customize Resume */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Your Resume</h2>
                  <p className="text-gray-600">AI-tailored resume optimized for this specific job</p>
                </div>

                {!tailoredResume ? (
                  <div className="text-center">
                    <Button 
                      onClick={generateTailoredResume}
                      loading={loading}
                      size="lg"
                    >
                      Generate Tailored Resume
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="bg-white border rounded-lg p-6 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">{tailoredResume}</pre>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download DOCX
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={nextStep} disabled={!tailoredResume}>
                    Generate Cover Letter
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Cover Letter */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Tailored Cover Letter</h2>
                  <p className="text-gray-600">Personalized cover letter matching the job and company</p>
                </div>

                {!coverLetter ? (
                  <div className="text-center">
                    <Button 
                      onClick={generateCoverLetter}
                      loading={loading}
                      size="lg"
                    >
                      Generate Cover Letter
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="bg-white border rounded-lg p-6 max-h-96 overflow-y-auto">
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: coverLetter.replace(/\n/g, '<br>') }}
                      />
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download DOCX
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={nextStep} disabled={!coverLetter}>
                    Interview Preparation
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Interview Preparation */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Video className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Preparation</h2>
                  <p className="text-gray-600">Practice with likely interview questions</p>
                </div>

                {interviewQuestions.length === 0 ? (
                  <div className="text-center">
                    <Button 
                      onClick={generateInterviewQuestions}
                      loading={loading}
                      size="lg"
                    >
                      Generate Interview Questions
                    </Button>
                  </div>
                ) : (
                  <Tabs defaultValue="behavioral" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
                      <TabsTrigger value="technical">Technical</TabsTrigger>
                      <TabsTrigger value="company">Company</TabsTrigger>
                      <TabsTrigger value="role">Role-Specific</TabsTrigger>
                    </TabsList>
                    
                    {['behavioral', 'technical', 'company', 'role'].map((type) => (
                      <TabsContent key={type} value={type} className="space-y-4">
                        {interviewQuestions
                          .filter(q => q.type === type)
                          .map((question, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <p className="font-medium mb-2">{question.question}</p>
                                {question.tips && (
                                  <p className="text-sm text-gray-600">
                                    <strong>Tip:</strong> {question.tips}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                      </TabsContent>
                    ))}
                  </Tabs>
                )}

                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => window.location.href = '/ai-interview-practice'}>
                    <Video className="h-4 w-4 mr-2" />
                    Practice with AI Interviewer
                  </Button>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={() => toast.success('Resume customization completed!')}>
                    Complete Process
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Career Goals Survey Modal */}
        {showCareerGoalsSurvey && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Career Goals Survey</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>What are your short-term career goals? (1-2 years)</Label>
                  <Textarea 
                    placeholder="e.g., Learn new technologies, get promoted, switch to management..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>What are your long-term career goals? (5+ years)</Label>
                  <Textarea 
                    placeholder="e.g., Become a CTO, start my own company, become a tech lead..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Preferred Industries</Label>
                  <Input 
                    placeholder="e.g., Tech, Healthcare, Finance, etc."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Current Strengths</Label>
                  <Textarea 
                    placeholder="e.g., Leadership, Problem-solving, Communication..."
                    className="mt-2"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setShowCareerGoalsSurvey(false)}>
                    Skip for Now
                  </Button>
                  <Button onClick={() => {
                    setShowCareerGoalsSurvey(false);
                    toast.success('Career goals saved!');
                  }}>
                    Save Goals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 