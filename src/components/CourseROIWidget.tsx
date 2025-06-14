'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator,
  TrendingUp,
  DollarSign,
  Clock,
  Target,
  ArrowRight,
  Sparkles,
  BarChart3,
  User,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface CourseROIWidgetProps {
  courseId: string;
  courseTitle: string;
  courseCost: number;
  courseDuration: string;
  courseSkills: string[];
  className?: string;
}

interface QuickROIData {
  estimated_salary_increase: number;
  roi_percentage_1yr: number;
  roi_percentage_3yr: number;
  fit_score: number;
  confidence_score: number;
  timeline_to_impact: string;
  key_benefits: string[];
}

export default function CourseROIWidget({ 
  courseId, 
  courseTitle, 
  courseCost, 
  courseDuration, 
  courseSkills,
  className = ''
}: CourseROIWidgetProps) {
  const { user } = useAuth();
  const [roiData, setRoiData] = useState<QuickROIData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    // Check if user has a profile for ROI calculation
    // In production, this would check the user's saved profile
    if (user) {
      setHasProfile(true);
      calculateQuickROI();
    }
  }, [user, courseId]);

  const calculateQuickROI = async () => {
    setIsLoading(true);
    
    // Simulate API call for quick ROI calculation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock ROI calculation - in production this would use real user profile data
    const mockROIData: QuickROIData = {
      estimated_salary_increase: Math.floor(Math.random() * 20000) + 10000,
      roi_percentage_1yr: Math.floor((Math.random() * 200) + 100),
      roi_percentage_3yr: Math.floor((Math.random() * 500) + 300),
      fit_score: Math.floor(Math.random() * 25) + 75,
      confidence_score: Math.floor(Math.random() * 15) + 85,
      timeline_to_impact: Math.random() > 0.5 ? '3-6 months' : '6-12 months',
      key_benefits: [
        'Accelerated career progression',
        'Enhanced industry expertise',
        'Increased earning potential',
        'Stronger leadership skills'
      ]
    };
    
    setRoiData(mockROIData);
    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!user) {
    return (
      <Card className={`border-2 border-teal-200 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-teal-700">
            <Calculator className="w-5 h-5" />
            <span>Personalized ROI Calculator</span>
          </CardTitle>
          <CardDescription>
            See how this course could impact your career and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="font-semibold mb-2">Sign in to see your personalized ROI</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Get tailored salary projections and career impact analysis based on your profile
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
              <Link href="/roi-engine">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                  Try ROI Engine
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasProfile) {
    return (
      <Card className={`border-2 border-orange-200 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-700">
            <AlertCircle className="w-5 h-5" />
            <span>Complete Your Profile</span>
          </CardTitle>
          <CardDescription>
            Build your career profile to get personalized ROI calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4 text-sm">
              Take 2 minutes to set up your profile and unlock personalized ROI projections for this course
            </p>
            <Link href="/roi-engine">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Target className="w-4 h-4 mr-2" />
                Complete Profile & Calculate ROI
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 border-green-200 bg-gradient-to-br from-green-50 to-teal-50 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-green-700">
            <Calculator className="w-5 h-5" />
            <span>Your ROI Projection</span>
          </CardTitle>
          {roiData && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {roiData.fit_score}% Match
              </Badge>
              <Badge variant="outline">
                {roiData.confidence_score}% Confidence
              </Badge>
            </div>
          )}
        </div>
        <CardDescription>
          Personalized financial and career impact analysis for this course
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Calculating your personalized ROI...</p>
          </div>
        ) : roiData ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Estimated Salary Increase</span>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(roiData.estimated_salary_increase)}
                </div>
                <div className="text-xs text-gray-500">Annual increase</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">1-Year ROI</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {roiData.roi_percentage_1yr}%
                </div>
                <div className="text-xs text-gray-500">Return on investment</div>
              </div>
            </div>

            {/* ROI Timeline */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-gray-600" />
                ROI Over Time
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Year 1</span>
                  <span className="font-bold text-green-600">{roiData.roi_percentage_1yr}%</span>
                </div>
                <Progress value={Math.min(roiData.roi_percentage_1yr, 500) / 5} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Year 3</span>
                  <span className="font-bold text-blue-600">{roiData.roi_percentage_3yr}%</span>
                </div>
                <Progress value={Math.min(roiData.roi_percentage_3yr, 1000) / 10} className="h-2" />
              </div>
            </div>

            {/* Timeline to Impact */}
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Timeline to Impact:</span>
              <span className="font-semibold text-gray-900">{roiData.timeline_to_impact}</span>
            </div>

            {/* Key Benefits */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2 text-gray-600" />
                Key Career Benefits
              </h4>
              <ul className="space-y-2">
                {roiData.key_benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/roi-engine" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  See Full ROI Analysis
                </Button>
              </Link>
              <Button className="bg-teal-600 hover:bg-teal-700 flex-1">
                <ArrowRight className="w-4 h-4 mr-2" />
                Enroll Now
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">Unable to calculate ROI at this time</p>
            <Button onClick={calculateQuickROI} variant="outline">
              <Calculator className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 