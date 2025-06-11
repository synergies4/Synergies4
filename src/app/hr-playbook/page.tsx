'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageLayout from '@/components/shared/PageLayout';
import { 
  ArrowRight, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Target,
  BookOpen,
  Brain,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  Award,
  ChevronRight,
  Download,
  Play,
  MessageSquare
} from 'lucide-react';

export default function HRPlaybook() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    {
      id: 'assessment',
      title: 'HR Readiness Assessment',
      description: 'Evaluate your organization\'s readiness for agentic AI workforce integration',
      icon: Target,
      href: '/hr-playbook/assessment',
      color: 'from-blue-500 to-cyan-400',
      stats: '15 minutes'
    },
    {
      id: 'framework',
      title: 'Strategic Framework',
      description: 'ASSESS → ARCHITECT → ACTIVATE → ACCELERATE methodology',
      icon: Brain,
      href: '/hr-playbook/framework',
      color: 'from-purple-500 to-pink-400',
      stats: '4 phases'
    },
    {
      id: 'roles',
      title: 'New HR Roles',
      description: 'Agent Enablement Officer, Work Chart Designer, and more',
      icon: Users,
      href: '/hr-playbook/roles',
      color: 'from-green-500 to-emerald-400',
      stats: '5 new roles'
    },
    {
      id: 'implementation',
      title: '30-Day Sprint Guide',
      description: 'Quick-start implementation with checklists and templates',
      icon: Zap,
      href: '/hr-playbook/implementation',
      color: 'from-orange-500 to-red-400',
      stats: '30 days'
    },
    {
      id: 'risks',
      title: 'Risk Management',
      description: 'Identify and mitigate risks in AI workforce transformation',
      icon: Shield,
      href: '/hr-playbook/risks',
      color: 'from-red-500 to-pink-400',
      stats: '12 risk factors'
    },
    {
      id: 'resources',
      title: 'Tools & Templates',
      description: 'Downloadable resources, checklists, and communication templates',
      icon: Download,
      href: '/hr-playbook/resources',
      color: 'from-teal-500 to-blue-400',
      stats: '20+ templates'
    }
  ];

  const keyStats = [
    { label: 'Executives planning AI workforce integration', value: '50%', icon: TrendingUp },
    { label: 'May reduce headcount with AI', value: '33%', icon: Users },
    { label: 'Gen Z preferring human interaction', value: '75%', icon: MessageSquare },
    { label: 'Critical success factor', value: 'Change Management', icon: CheckCircle }
  ];

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="mb-8">
                <Badge className="bg-white/10 text-white border-white/20 mb-6 text-sm font-medium">
                  <Brain className="w-4 h-4 mr-2" />
                  2024 Strategic Guide
                </Badge>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  HR Playbook for the{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Agentic Workforce
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8">
                  Transform from traditional people operations to hybrid workforce architecture. 
                  Lead the change management moment of the decade.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/hr-playbook/assessment">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
                    <Target className="w-5 h-5 mr-2" />
                    Take Readiness Assessment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-8 py-4 text-lg font-semibold backdrop-blur-sm">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Schedule Consultation
                  </Button>
                </Link>
              </div>

              <div className="text-sm text-blue-200">
                <Clock className="w-4 h-4 inline mr-2" />
                15-minute read • For HR Leaders & CHROs • Actionable Framework
              </div>
            </div>
          </div>
        </section>

        {/* Key Statistics */}
        <section className="py-16 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                The Reality of AI Workforce Integration
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {keyStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="text-center border-2 border-gray-200 hover:border-blue-300 transition-colors duration-300">
                      <CardContent className="p-6">
                        <Icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                        <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                        <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Executive Summary */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="bg-blue-100 text-blue-800 mb-4">
                  Executive Summary
                </Badge>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  The Change-Management Moment of the Decade
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed">
                  Agentic AI is reframing how work gets done, but humans—especially HR—remain critical for successful integration. 
                  This isn't just a tech rollout; it's a trust and transformation challenge.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-800 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      The Reality
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-700">
                      Organizations are moving toward "zero-FTE" departments, with AI agents functioning as digital colleagues rather than just tools.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="text-yellow-800 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      The Challenge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-yellow-700">
                      HR must evolve from traditional people operations to become architects of hybrid workforces—managing both human and agentic capacity.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800 flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      The Opportunity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-700">
                      Early-adopting HR leaders can position themselves as transformation champions, not technology laggards.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">
                    "HR is the pressure point: it must shift from traditional people ops to hybrid workforce architects—owning both culture and change management."
                  </h3>
                  <p className="text-blue-200">
                    The organizations that get this right will capture early-mover advantages in talent attraction, retention, and organizational agility.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Playbook Sections */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Your Complete Transformation Toolkit
                </h2>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                  Everything you need to lead your organization through the agentic AI workforce transformation, 
                  from assessment to implementation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <Link key={section.id} href={section.href}>
                      <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-gray-200 hover:border-blue-300 group">
                        <CardHeader>
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${section.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {section.title}
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            {section.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              {section.stats}
                            </Badge>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Lead the Transformation?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Don't let your organization fall behind in the agentic AI revolution. 
                Partner with Synergies4AI to position HR as the architect of your hybrid workforce.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Target className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                    <h3 className="text-lg font-semibold mb-2">Schedule Assessment</h3>
                    <p className="text-blue-100 text-sm">Get your HR readiness score in 30 minutes</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    <h3 className="text-lg font-semibold mb-2">Join Workshop</h3>
                    <p className="text-blue-100 text-sm">HR as Architect of the Hybrid Workforce</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                    <h3 className="text-lg font-semibold mb-2">Start Sprint</h3>
                    <p className="text-blue-100 text-sm">30-day implementation with our experts</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/hr-playbook/assessment">
                  <Button className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl">
                    <Play className="w-5 h-5 mr-2" />
                    Start Free Assessment
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Schedule Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
} 