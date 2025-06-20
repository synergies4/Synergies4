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
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f1f5f9" fill-opacity="0.4"%3E%3Ccircle cx="7" cy="7" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
      <div className="relative z-10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-4 mb-6 p-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
              <div className="relative">
                <Sparkles className="h-16 w-16 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-600 bg-clip-text text-transparent">
                  Resume Customizer
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-emerald-100 text-emerald-700 font-semibold">AI-Powered</Badge>
                  <Badge className="bg-blue-100 text-blue-700 font-semibold">Free Tool</Badge>
                  <Badge className="bg-purple-100 text-purple-700 font-semibold">Public Access</Badge>
                </div>
              </div>
            </div>
            <p className="text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Transform your career with our AI-powered resume optimization, personalized cover letters, 
              and comprehensive interview preparation toolkit
            </p>
          </div>

          {/* Enhanced Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div key={step.id} className="flex flex-col items-center relative">
                    {/* Connection Line */}
                    {index < steps.length - 1 && (
                      <div className={`absolute top-6 left-full w-full h-1 ${
                        isCompleted ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gray-200'
                      } transition-all duration-500`} 
                      style={{ width: 'calc(100% + 2rem)' }} />
                    )}
                    
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 shadow-lg relative ${
                      isCompleted ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-emerald-200' : 
                      isCurrent ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200 scale-110' : 
                      'bg-white text-gray-400 shadow-gray-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-8 w-8" />
                      ) : (
                        <Icon className="h-8 w-8" />
                      )}
                      
                      {isCurrent && (
                        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 opacity-20 animate-pulse" />
                      )}
                    </div>
                    <span className={`text-sm font-semibold transition-colors duration-300 text-center max-w-24 ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
            <Progress 
              value={(currentStep / (steps.length - 1)) * 100} 
              className="h-3 bg-gray-200 rounded-full shadow-inner"
            />
          </div>

          {/* Enhanced Step Content Card */}
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 h-2"></div>
            <CardContent className="p-12">
              {/* Step 0: Upload Resume */}
              {currentStep === 0 && (
                <div className="space-y-10">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl mb-6 shadow-lg">
                      <Upload className="h-12 w-12 text-blue-600" />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Upload Your Resume</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Start your career transformation by uploading your current resume. 
                      Our AI will analyze and optimize it for your target role.
                    </p>
                  </div>

                  <div className="max-w-2xl mx-auto">
                    <Label htmlFor="resume-upload" className="block">
                      <div className="relative group cursor-pointer">
                        <div className="border-3 border-dashed border-blue-300 rounded-2xl p-12 hover:border-blue-500 transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 group-hover:shadow-xl">
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                              <Upload className="h-10 w-10 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Drop your resume here</h3>
                            <p className="text-gray-600 mb-4">or click to browse and select a file</p>
                            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>PDF</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>DOCX</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>TXT</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Animated border */}
                          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 opacity-20 animate-pulse"></div>
                          </div>
                        </div>
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
                    <div className="max-w-2xl mx-auto animate-fade-in-up">
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-emerald-800 text-lg">{resumeData.filename}</p>
                            <p className="text-emerald-600">Resume uploaded successfully! Ready to analyze.</p>
                          </div>
                          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-center space-y-6">
                    <Button 
                      onClick={nextStep} 
                      disabled={!resumeData.content || loading}
                      className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          Continue to Job Description
                          <TrendingUp className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                    
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      Your resume will be securely processed and stored in your profile for future use
                    </p>
                  </div>
                </div>
              )}

              {/* Step 1: Job Description */}
              {currentStep === 1 && (
                <div className="space-y-10">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl mb-6 shadow-lg">
                      <FileText className="h-12 w-12 text-purple-600" />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Target Job Description</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Paste the job listing you're applying for. Our AI will analyze it to perfectly tailor your resume.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Job Details Form */}
                    <div className="space-y-6 bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg border border-gray-100">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                        <Building className="h-6 w-6 text-blue-600" />
                        Job Details
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="job_title" className="text-sm font-semibold text-gray-700 mb-2 block">
                            Job Title *
                          </Label>
                          <Input
                            id="job_title"
                            value={jobApplication.job_title}
                            onChange={(e) => setJobApplication(prev => ({ ...prev, job_title: e.target.value }))}
                            placeholder="e.g., Senior Software Engineer"
                            className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                          />
                        </div>

                        <div>
                          <Label htmlFor="company_name" className="text-sm font-semibold text-gray-700 mb-2 block">
                            Company Name *
                          </Label>
                          <Input
                            id="company_name"
                            value={jobApplication.company_name}
                            onChange={(e) => setJobApplication(prev => ({ ...prev, company_name: e.target.value }))}
                            placeholder="e.g., Google, Microsoft, etc."
                            className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                          />
                        </div>

                        <div>
                          <Label htmlFor="job_location" className="text-sm font-semibold text-gray-700 mb-2 block">
                            Location
                          </Label>
                          <Input
                            id="job_location"
                            value={jobApplication.job_location}
                            onChange={(e) => setJobApplication(prev => ({ ...prev, job_location: e.target.value }))}
                            placeholder="e.g., San Francisco, CA or Remote"
                            className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                          />
                        </div>

                        <div>
                          <Label htmlFor="employment_type" className="text-sm font-semibold text-gray-700 mb-2 block">
                            Employment Type
                          </Label>
                          <Select 
                            value={jobApplication.employment_type} 
                            onValueChange={(value) => setJobApplication(prev => ({ ...prev, employment_type: value }))}
                          >
                            <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                              <SelectValue placeholder="Select employment type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="full-time">Full-time</SelectItem>
                              <SelectItem value="part-time">Part-time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Job Description */}
                    <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg border border-blue-100">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                        <Target className="h-6 w-6 text-purple-600" />
                        Job Description *
                      </h3>
                      
                      <Textarea
                        value={jobApplication.job_description}
                        onChange={(e) => setJobApplication(prev => ({ ...prev, job_description: e.target.value }))}
                        placeholder="Paste the full job description here including requirements, responsibilities, and qualifications..."
                        className="h-80 text-base border-2 border-gray-200 focus:border-purple-500 rounded-xl resize-none"
                      />
                      
                      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-start gap-3">
                          <Brain className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-blue-800">AI Tip</p>
                            <p className="text-sm text-blue-700 mt-1">
                              Include the complete job posting for best results. The more details you provide, 
                              the better our AI can tailor your resume to match the role.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-6">
                    <div className="flex items-center justify-center gap-4">
                      <Button 
                        onClick={prevStep}
                        variant="outline"
                        className="px-8 py-3 text-base font-semibold border-2 hover:bg-gray-50"
                      >
                        ← Back
                      </Button>
                      <Button 
                        onClick={analyzeJobFit}
                        disabled={!jobApplication.job_title || !jobApplication.company_name || !jobApplication.job_description || loading}
                        className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                      >
                        {loading ? (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Analyzing Fit...
                          </div>
                        ) : (
                          <>
                            Analyze Job Fit
                            <Target className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </div>
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
                        disabled={loading}
                        size="lg"
                      >
                        {loading ? 'Generating...' : 'Generate Tailored Resume'}
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
                        disabled={loading}
                        size="lg"
                      >
                        {loading ? 'Generating...' : 'Generate Cover Letter'}
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
                        disabled={loading}
                        size="lg"
                      >
                        {loading ? 'Generating...' : 'Generate Interview Questions'}
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Career Goals Survey</h3>
                <p className="text-gray-600 mb-8">
                  Help us understand your career aspirations to provide better recommendations.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                      What are your short-term career goals? (Select all that apply)
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'Get promoted',
                        'Switch companies',
                        'Learn new skills',
                        'Increase salary',
                        'Work remotely',
                        'Lead a team'
                      ].map((goal) => (
                        <label key={goal} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={careerGoals.short_term_goals.includes(goal)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCareerGoals(prev => ({
                                  ...prev,
                                  short_term_goals: [...prev.short_term_goals, goal]
                                }));
                              } else {
                                setCareerGoals(prev => ({
                                  ...prev,
                                  short_term_goals: prev.short_term_goals.filter(g => g !== goal)
                                }));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{goal}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setShowCareerGoalsSurvey(false)}
                  >
                    Skip for now
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCareerGoalsSurvey(false);
                      toast.success('Career goals saved!');
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Save Goals
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 