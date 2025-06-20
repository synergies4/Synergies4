'use client';

import React, { useState } from 'react';
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
          <div className="inline-flex items-center gap-4 mb-6 p-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60">
            <div className="relative">
              <Sparkles className="h-16 w-16 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Resume Customizer
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">AI-Powered</Badge>
                <Badge className="bg-blue-100 text-blue-800 font-semibold border border-blue-200">Free Tool</Badge>
                <Badge className="bg-purple-100 text-purple-800 font-semibold border border-purple-200">Public Access</Badge>
              </div>
            </div>
          </div>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto font-medium">
            Transform your career with AI-powered resume optimization and interview preparation
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/60">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1 relative">
                  {index < steps.length - 1 && (
                    <div className="absolute top-6 left-1/2 w-full h-0.5 transform translate-x-1/2 z-0">
                      <div className={`h-full transition-all duration-500 ${
                        isCompleted ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gray-200'
                      }`} />
                    </div>
                  )}
                  
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 shadow-md relative z-10 ${
                    isCompleted ? 'bg-emerald-500 text-white shadow-emerald-200' : 
                    isCurrent ? 'bg-blue-500 text-white shadow-blue-200' : 
                    'bg-white text-gray-400 shadow-gray-100 border-2 border-gray-200'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  
                  <span className={`text-sm font-semibold text-center transition-colors duration-300 ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-3 bg-gray-200 rounded-full shadow-inner" />
        </div>

        <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/60">
          <CardContent className="p-8">
            {currentStep === 0 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl mb-6 shadow-lg">
                    <Upload className="h-10 w-10 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Upload Your Resume</h2>
                  <p className="text-gray-600 text-lg">Upload your current resume to get started with AI optimization</p>
                </div>

                <div className="max-w-md mx-auto">
                  <Label htmlFor="resume-upload" className="block">
                    <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 hover:border-blue-500 transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:from-blue-100/50 hover:to-indigo-100/50">
                      <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <p className="text-gray-700 text-center font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500 text-center mt-2">PDF, DOCX, or TXT files supported</p>
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
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 shadow-md">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-emerald-600" />
                        <div>
                          <p className="font-semibold text-emerald-800">{resumeData.filename}</p>
                          <p className="text-sm text-emerald-600">Resume uploaded successfully!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <Button 
                    onClick={nextStep} 
                    disabled={!resumeData.content || loading}
                    className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
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
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl mb-6 shadow-lg">
                    <FileText className="h-10 w-10 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Add Job Description</h2>
                  <p className="text-gray-600 text-lg">Paste the job listing you are targeting for AI analysis</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="job_title" className="text-base font-semibold text-gray-800 mb-2 block">Job Title *</Label>
                    <Input
                      id="job_title"
                      value={jobData.job_title}
                      onChange={(e) => setJobData(prev => ({ ...prev, job_title: e.target.value }))}
                      placeholder="e.g., Senior Software Engineer"
                      className="h-12 text-base border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company_name" className="text-base font-semibold text-gray-800 mb-2 block">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={jobData.company_name}
                      onChange={(e) => setJobData(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="e.g., Google, Microsoft"
                      className="h-12 text-base border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="job_description" className="text-base font-semibold text-gray-800 mb-2 block">Job Description *</Label>
                    <Textarea
                      id="job_description"
                      value={jobData.job_description}
                      onChange={(e) => setJobData(prev => ({ ...prev, job_description: e.target.value }))}
                      placeholder="Paste the complete job description here including requirements, responsibilities, and qualifications..."
                      className="min-h-[200px] text-base border-2 border-gray-300 focus:border-purple-500 rounded-lg resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep} className="px-6 py-3 text-base font-medium">
                    ← Back
                  </Button>
                  <Button 
                    onClick={nextStep}
                    disabled={!jobData.job_title || !jobData.company_name || !jobData.job_description}
                    className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Analyze Job Fit
                    <Target className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep > 1 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl mb-6 shadow-lg">
                  {React.createElement(steps[currentStep].icon, { className: "h-10 w-10 text-indigo-600" })}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {steps[currentStep].title}
                </h2>
                <p className="text-gray-600 text-lg mb-8">This step is coming soon!</p>
                <div className="flex justify-center gap-4">
                  <Button onClick={prevStep} variant="outline" className="px-6 py-3 text-base font-medium">
                    ← Back
                  </Button>
                  {currentStep < steps.length - 1 && (
                    <Button onClick={nextStep} className="px-6 py-3 text-base font-medium">
                      Continue →
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