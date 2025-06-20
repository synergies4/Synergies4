'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Target, 
  Brain, 
  MessageCircle, 
  Video,
  Sparkles,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function ResumeCustomizer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState({ filename: '', content: '' });
  const [jobData, setJobData] = useState({
    job_title: '',
    company_name: '',
    job_description: ''
  });

  const steps = [
    { id: 'upload', title: 'Upload Resume', icon: Upload },
    { id: 'job', title: 'Job Description', icon: FileText },
    { id: 'analysis', title: 'Analysis', icon: Target },
    { id: 'customize', title: 'Customize', icon: Brain },
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
          content: result.content
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <Sparkles className="h-12 w-12 text-blue-600" />
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                Resume Customizer
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-emerald-100 text-emerald-700">AI-Powered</Badge>
                <Badge className="bg-blue-100 text-blue-700">Free Tool</Badge>
              </div>
            </div>
          </div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Transform your career with AI-powered resume optimization and interview preparation
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-md">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 ${
                    isCompleted ? 'bg-emerald-500 text-white' : 
                    isCurrent ? 'bg-blue-500 text-white' : 
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
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
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
        </div>

        <Card className="shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            {currentStep === 0 && (
              <div className="space-y-8">
                <div className="text-center">
                  <Upload className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
                  <p className="text-gray-600">Upload your current resume to get started</p>
                </div>

                <div className="max-w-md mx-auto">
                  <Label htmlFor="resume-upload" className="block">
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 hover:border-blue-500 transition-colors cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-center">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-400 text-center mt-2">PDF, DOCX, or TXT files</p>
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
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="font-medium text-emerald-800">{resumeData.filename}</p>
                          <p className="text-sm text-emerald-600">Resume uploaded successfully</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <Button 
                    onClick={nextStep} 
                    disabled={!resumeData.content || loading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {loading ? 'Processing...' : (
                      <>
                        Continue to Job Description
                        <TrendingUp className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Add Job Description</h2>
                  <p className="text-gray-600">Paste the job listing you are targeting</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      value={jobData.job_title}
                      onChange={(e) => setJobData(prev => ({ ...prev, job_title: e.target.value }))}
                      placeholder="e.g., Senior Software Engineer"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={jobData.company_name}
                      onChange={(e) => setJobData(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="e.g., Google, Microsoft"
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="job_description">Job Description</Label>
                    <Textarea
                      id="job_description"
                      value={jobData.job_description}
                      onChange={(e) => setJobData(prev => ({ ...prev, job_description: e.target.value }))}
                      placeholder="Paste the complete job description here..."
                      className="mt-2 min-h-[200px]"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button 
                    onClick={nextStep}
                    disabled={!jobData.job_title || !jobData.company_name || !jobData.job_description}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Analyze Job Fit
                    <Target className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep > 1 && (
              <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Step {currentStep + 1} - {steps[currentStep].title}
                </h2>
                <p className="text-gray-600 mb-8">This step is coming soon!</p>
                <div className="flex justify-center gap-4">
                  <Button onClick={prevStep} variant="outline">
                    Back
                  </Button>
                  {currentStep < steps.length - 1 && (
                    <Button onClick={nextStep}>
                      Continue
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 