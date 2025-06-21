'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Plus, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  Download,
  Sparkles,
  BarChart3,
  Save,
  Flag,
  Zap,
  Trophy,
  Rocket,
  Brain,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';
import PageLayout from '@/components/shared/PageLayout';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'career' | 'learning' | 'personal' | 'financial';
  priority: 'low' | 'medium' | 'high';
  targetDate: string;
  milestones: Milestone[];
  progress: number;
  status: 'planning' | 'active' | 'completed' | 'paused';
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

const goalCategories = [
  { id: 'career', label: 'Career Growth', icon: TrendingUp, color: 'blue' },
  { id: 'learning', label: 'Learning & Skills', icon: Brain, color: 'green' },
  { id: 'personal', label: 'Personal Development', icon: Heart, color: 'purple' },
  { id: 'financial', label: 'Financial Goals', icon: Trophy, color: 'orange' }
];

const goalTemplates = [
  {
    category: 'career',
    title: 'Get Promoted to Senior Role',
    description: 'Advance to a senior position with increased responsibilities and leadership opportunities',
    milestones: [
      'Complete leadership training course',
      'Lead a cross-functional project',
      'Obtain relevant certification',
      'Have promotion discussion with manager'
    ]
  },
  {
    category: 'learning',
    title: 'Master AI & Machine Learning',
    description: 'Develop expertise in artificial intelligence and machine learning technologies',
    milestones: [
      'Complete online ML course',
      'Build 3 AI projects',
      'Obtain AI certification',
      'Contribute to open source AI project'
    ]
  }
];

export default function GoalSetting() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeView, setActiveView] = useState<'overview' | 'create' | 'templates'>('overview');
  const [animateIn, setAnimateIn] = useState(false);

  React.useEffect(() => {
    setAnimateIn(true);
  }, []);

  const createGoalFromTemplate = (template: any) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: template.title,
      description: template.description,
      category: template.category,
      priority: 'medium',
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      milestones: template.milestones.map((title: string, index: number) => ({
        id: `${Date.now()}-${index}`,
        title,
        completed: false,
        dueDate: new Date(Date.now() + (index + 1) * 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })),
      progress: 0,
      status: 'planning'
    };

    setGoals(prev => [...prev, newGoal]);
    setActiveView('overview');
    toast.success('Goal created successfully!');
  };

  const exportGoalPlan = () => {
    const content = `GOAL SETTING PLAN
Generated on ${new Date().toLocaleDateString()}

OVERVIEW
========
Total Goals: ${goals.length}
Active Goals: ${goals.filter(g => g.status === 'active').length}
Completed Goals: ${goals.filter(g => g.status === 'completed').length}

GOALS BREAKDOWN
===============

${goals.map(goal => `
📋 ${goal.title}
Category: ${goalCategories.find(c => c.id === goal.category)?.label}
Target Date: ${goal.targetDate}
Progress: ${goal.progress}%
Status: ${goal.status}

Description:
${goal.description}

Milestones:
${goal.milestones.map(m => `${m.completed ? '✅' : '⏳'} ${m.title} (Due: ${m.dueDate})`).join('\n')}

---
`).join('')}

This goal plan was created using Synergies4 Goal Setting Tool.
Visit synergies4ai.com for more career development resources.
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `My_Goal_Plan_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Goal plan exported successfully!');
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className={`text-center transform transition-all duration-1000 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Target className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                Goal Setting Studio
              </h1>
              <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
                Transform your aspirations into actionable plans with our AI-powered goal setting platform. 
                Create, track, and achieve your career and personal objectives.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setActiveView('templates')}
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg shadow-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start with Templates
                </Button>
                <Button
                  onClick={() => setActiveView('create')}
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Custom Goal
                </Button>
              </div>
            </div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Navigation Tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="flex space-x-1 bg-white/70 backdrop-blur-sm p-1 rounded-xl border">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeView === 'overview'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveView('templates')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeView === 'templates'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
                }`}
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Templates
              </button>
              <button
                onClick={() => setActiveView('create')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeView === 'create'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Create Goal
              </button>
            </div>

            {goals.length > 0 && (
              <Button onClick={exportGoalPlan} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Export Plan
              </Button>
            )}
          </div>

          {/* Overview Tab */}
          {activeView === 'overview' && (
            <div className="space-y-8">
              {goals.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No Goals Yet</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Start your journey by creating your first goal or choosing from our proven templates.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => setActiveView('templates')} className="bg-indigo-600 hover:bg-indigo-700">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Browse Templates
                    </Button>
                    <Button onClick={() => setActiveView('create')} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Custom Goal
                    </Button>
                  </div>
                </div>
              ) : (
                <div>Goals content here</div>
              )}
            </div>
          )}

          {/* Templates Tab */}
          {activeView === 'templates' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Goal Templates</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Get started quickly with our proven goal templates designed by career experts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goalTemplates.map((template, index) => {
                  const categoryInfo = goalCategories.find(c => c.id === template.category);
                  const CategoryIcon = categoryInfo?.icon || Target;
                  
                  return (
                    <Card 
                      key={index}
                      className="overflow-hidden transition-all duration-500 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
                      onClick={() => createGoalFromTemplate(template)}
                    >
                      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <CategoryIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{template.title}</CardTitle>
                            <p className="text-sm opacity-90">{categoryInfo?.label}</p>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6">
                        <p className="text-gray-600 mb-4">{template.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <h4 className="font-semibold text-gray-900 text-sm">Included Milestones:</h4>
                          {template.milestones.map((milestone: string, idx: number) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                              <span className="text-sm text-gray-700">{milestone}</span>
                            </div>
                          ))}
                        </div>
                        
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Use This Template
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Create Goal Tab */}
          {activeView === 'create' && (
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <CardTitle className="text-2xl flex items-center">
                    <Plus className="w-6 h-6 mr-3" />
                    Create Custom Goal
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Goal Title</label>
                      <Input 
                        placeholder="Enter your goal title..."
                        className="text-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <Textarea 
                        placeholder="Describe your goal in detail..."
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex space-x-4 pt-6">
                      <Button 
                        onClick={() => setActiveView('overview')}
                        variant="outline" 
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => {
                          toast.success('Goal created successfully!');
                          setActiveView('overview');
                        }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Create Goal
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
