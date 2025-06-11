'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import PageLayout from '@/components/shared/PageLayout';
// Dynamic import for client-side PDF generation
import { 
  ArrowLeft,
  CheckCircle, 
  AlertTriangle,
  Target,
  TrendingUp,
  Brain,
  Shield,
  Award,
  MessageSquare,
  FileText,
  Download,
  Calendar,
  Share2
} from 'lucide-react';

interface ResultsData {
  overallPercentage: number;
  categoryScores: Record<string, { score: number; maxScore: number; percentage: number }>;
  readinessLevel: string;
  contactInfo: {
    name: string;
    company: string;
  };
}

// Loading component for Suspense fallback
function ResultsLoading() {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Loading Your Results...
              </h1>
              <p className="text-gray-600">
                Please wait while we retrieve your assessment results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

// Component that uses useSearchParams - needs to be wrapped in Suspense
function ResultsContent() {
  const searchParams = useSearchParams();
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);

  useEffect(() => {
    // Try to get results from URL params (encoded)
    const encodedResults = searchParams.get('data');
    if (encodedResults) {
      try {
        const decodedResults = JSON.parse(atob(encodedResults));
        setResultsData(decodedResults);
      } catch (error) {
        console.error('Error decoding results:', error);
      }
    } else {
      // Try to get from localStorage as fallback
      const storedResults = localStorage.getItem('hrAssessmentResults');
      if (storedResults) {
        try {
          setResultsData(JSON.parse(storedResults));
        } catch (error) {
          console.error('Error parsing stored results:', error);
        }
      }
    }
  }, [searchParams]);

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

    Object.entries(categoryScores).forEach(([category, scores]: [string, any]) => {
      if (scores.percentage < 70) {
        if (category === 'Change Management') {
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
        } else if (category === 'HR Capability') {
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
        } else if (category === 'Risk Management' && scores.percentage < 60) {
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
      }
    });

    return recommendations;
  };

  const shareResults = async () => {
    if (!resultsData) return;
    
    const shareUrl = window.location.href;
    const shareText = `I just completed the HR Readiness Assessment and scored ${resultsData.overallPercentage}% (${resultsData.readinessLevel} Readiness) for AI workforce integration!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'HR Readiness Assessment Results',
          text: shareText,
          url: shareUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        alert('Results copied to clipboard!');
      } catch (error) {
        console.log('Error copying to clipboard:', error);
      }
    }
  };

  const downloadPDFReport = async () => {
    if (!resultsData) {
      console.error('No results data available for PDF generation');
      return;
    }
    
    try {
      console.log('Starting PDF generation...', resultsData);
      
      // Simple test first
      const testPDF = async () => {
        const jsPDF = (await import('jspdf')).default;
        const doc = new jsPDF();
        doc.text('Test PDF Generation', 10, 10);
        doc.text('HR Assessment Results', 10, 20);
        doc.text(`Score: ${resultsData.overallPercentage}%`, 10, 30);
        doc.save('test-assessment-report.pdf');
        console.log('Simple PDF test completed');
      };
      
      // Try simple test first
      await testPDF();
      
      // If simple test works, try full PDF
      setTimeout(async () => {
        try {
          const { generateAssessmentPDF } = await import('@/lib/pdfGenerator');
          
          const recommendations = getRecommendations(resultsData.overallPercentage, resultsData.categoryScores);
          
          const pdfData = {
            overallPercentage: resultsData.overallPercentage,
            categoryScores: resultsData.categoryScores,
            readinessLevel: resultsData.readinessLevel,
            contactInfo: resultsData.contactInfo,
            recommendations: recommendations
          };
          
          console.log('PDF data prepared:', pdfData);
          generateAssessmentPDF(pdfData);
          console.log('Full PDF generation completed');
        } catch (fullPdfError) {
          console.error('Full PDF generation failed:', fullPdfError);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Sorry, there was an error generating the PDF report. Please try again.');
    }
  };

  if (!resultsData) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  No Assessment Results Found
                </h1>
                <p className="text-gray-600 mb-6">
                  We couldn't find your assessment results. Please take the assessment to see your results.
                </p>
                <Link href="/hr-playbook/assessment">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Take Assessment
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  const readinessInfo = getReadinessLevel(resultsData.overallPercentage);
  const recommendations = getRecommendations(resultsData.overallPercentage, resultsData.categoryScores);
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
                {resultsData.contactInfo.name ? `${resultsData.contactInfo.name}'s` : 'Your'} HR Readiness Results
              </h1>
              
              <div className="text-6xl font-bold mb-2">
                <span className={`${
                  readinessInfo.color === 'green' ? 'text-green-600' :
                  readinessInfo.color === 'blue' ? 'text-blue-600' :
                  readinessInfo.color === 'yellow' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {resultsData.overallPercentage}%
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

              {resultsData.contactInfo.company && (
                <p className="text-gray-600 mt-2">{resultsData.contactInfo.company}</p>
              )}

              <Button
                variant="outline"
                onClick={shareResults}
                className="mt-4 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Results
              </Button>
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
                  {Object.entries(resultsData.categoryScores).map(([category, scores]) => (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">{category}</span>
                        <span className="text-sm text-gray-600">{scores.score}/{scores.maxScore} points</span>
                      </div>
                      <Progress value={scores.percentage} className="h-3" />
                      <div className="text-right text-sm text-gray-600 mt-1">{scores.percentage}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {recommendations.length > 0 && (
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
            )}

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
                  <Button 
                    variant="outline" 
                    onClick={downloadPDFReport}
                    className="w-full mt-4 border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center space-x-4">
              <Link href="/hr-playbook/assessment">
                <Button variant="outline">
                  Retake Assessment
                </Button>
              </Link>
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

// Main component with Suspense wrapper
export default function AssessmentResults() {
  return (
    <Suspense fallback={<ResultsLoading />}>
      <ResultsContent />
    </Suspense>
  );
} 