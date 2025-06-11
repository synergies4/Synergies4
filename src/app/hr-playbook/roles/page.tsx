'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageLayout from '@/components/shared/PageLayout';
import { 
  ArrowLeft,
  Users, 
  Brain,
  Target,
  Shield,
  TrendingUp,
  CheckCircle,
  MessageSquare,
  BarChart3,
  UserCheck,
  Workflow
} from 'lucide-react';

const newHRRoles = [
  {
    id: 'agent_enablement_officer',
    title: 'Agent Enablement Officer',
    subtitle: 'AI-Human Collaboration Specialist',
    description: 'Oversees AI-human collaboration optimization, ensuring seamless integration between digital agents and human teams.',
    icon: Brain,
    color: 'from-blue-500 to-cyan-400',
    priority: 'Critical',
    keyResponsibilities: [
      'Design AI-human collaboration workflows',
      'Monitor agent performance and optimization',
      'Facilitate human-AI team dynamics',
      'Develop agent training frameworks',
      'Resolve collaboration conflicts',
      'Establish agent performance KPIs'
    ],
    requiredSkills: [
      'AI/ML understanding',
      'Process optimization',
      'Change management',
      'Data analysis',
      'Communication facilitation'
    ],
    impact: 'Directly responsible for 40-60% productivity gains',
    careerPath: 'HR Business Partner → Agent Enablement Officer → Chief People & Technology Officer'
  },
  {
    id: 'work_chart_designer',
    title: 'Work Chart Designer',
    subtitle: 'Hybrid Workforce Architect',
    description: 'Maps tasks and processes to optimal human-AI combinations, designing the future of work structure.',
    icon: Workflow,
    color: 'from-purple-500 to-pink-400',
    priority: 'Critical',
    keyResponsibilities: [
      'Map work processes to human vs AI capabilities',
      'Design optimal human-AI task distribution',
      'Create dynamic workforce allocation models',
      'Develop capacity planning for hybrid teams',
      'Optimize workflow efficiency'
    ],
    requiredSkills: [
      'Workforce planning',
      'Process mapping',
      'Systems thinking',
      'Data modeling',
      'Strategic planning'
    ],
    impact: '3x faster adaptation to changing business needs',
    careerPath: 'Workforce Analyst → Work Chart Designer → Director of Workforce Architecture'
  },
  {
    id: 'hybrid_culture_curator',
    title: 'Hybrid Culture Curator',
    subtitle: 'Human-AI Culture Champion',
    description: 'Maintains organizational culture in a mixed human-AI environment, ensuring values remain central.',
    icon: Users,
    color: 'from-green-500 to-emerald-400',
    priority: 'High',
    keyResponsibilities: [
      'Preserve human values in AI environment',
      'Develop inclusive human-AI culture',
      'Create engagement strategies',
      'Monitor cultural health metrics',
      'Facilitate human connection'
    ],
    requiredSkills: [
      'Organizational psychology',
      'Culture development',
      'Employee engagement',
      'Ethics alignment',
      'Community building'
    ],
    impact: 'Maintains 85%+ satisfaction vs 45% industry average',
    careerPath: 'Culture Specialist → Hybrid Culture Curator → Chief Culture Officer'
  }
];

export default function NewHRRoles() {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <Badge className="bg-white/10 text-white border-white/20 mb-6">
                <Users className="w-4 h-4 mr-2" />
                New HR Roles for the Agentic Workforce
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Redefining HR for the{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Hybrid Future
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8">
                From org charts to work charts: discover the new roles that will position 
                HR as architects of hybrid workforce success.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/hr-playbook/assessment">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg font-semibold">
                    <Target className="w-5 h-5 mr-2" />
                    Assess Your Readiness
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-8 py-4 text-lg font-semibold backdrop-blur-sm">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Discuss Implementation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Traditional vs New Approach */}
        <section className="py-16 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                The Fundamental Shift in HR
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
                  <CardHeader>
                    <CardTitle className="text-red-800">Traditional HR Approach</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-red-700">
                      <li>• Focus on human headcount and org charts</li>
                      <li>• Reactive to technology implementations</li>
                      <li>• Traditional role definitions</li>
                      <li>• Change management as afterthought</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardHeader>
                    <CardTitle className="text-green-800">Agentic-Ready HR Approach</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-green-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        Hybrid workforce architecture
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        Proactive transformation leadership
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        New roles: Agent Enablement, Work Chart Design
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        Change management as core competency
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* New Roles Overview */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Essential New HR Roles
                </h2>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                  These roles transform HR from support function to strategic architect of 
                  the hybrid workforce, ensuring successful AI integration.
                </p>
              </div>

              <div className="space-y-8">
                {newHRRoles.map((role, index) => {
                  const Icon = role.icon;
                  return (
                    <Card key={role.id} className="overflow-hidden border-2 hover:border-blue-300 transition-colors">
                      <div className="grid grid-cols-1 lg:grid-cols-3">
                        {/* Role Header */}
                        <div className={`bg-gradient-to-br ${role.color} p-8 text-white`}>
                          <div className="flex items-center mb-4">
                            <Icon className="w-8 h-8 mr-3" />
                            <Badge className="bg-white/20 text-white">
                              {role.priority} Priority
                            </Badge>
                          </div>
                          
                          <h3 className="text-2xl font-bold mb-2">{role.title}</h3>
                          <p className="text-white/90 font-medium mb-4">{role.subtitle}</p>
                          <p className="text-white/80 text-sm">{role.description}</p>
                        </div>

                        {/* Role Details */}
                        <div className="lg:col-span-2 p-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                <Target className="w-5 h-5 mr-2 text-blue-600" />
                                Key Responsibilities
                              </h4>
                              <ul className="space-y-2">
                                {role.keyResponsibilities.map((responsibility, i) => (
                                  <li key={i} className="text-sm text-gray-700">
                                    • {responsibility}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                <UserCheck className="w-5 h-5 mr-2 text-green-600" />
                                Required Skills
                              </h4>
                              <div className="flex flex-wrap gap-2 mb-6">
                                {role.requiredSkills.map((skill, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <h5 className="font-semibold text-gray-900 text-sm mb-2">Expected Impact</h5>
                                  <p className="text-sm text-gray-700">{role.impact}</p>
                                </div>
                                
                                <div>
                                  <h5 className="font-semibold text-gray-900 text-sm mb-2">Career Path</h5>
                                  <p className="text-sm text-gray-700">{role.careerPath}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Build Your Future HR Team?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Don't wait for the transformation to happen to you. Lead it with the right roles and structure.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Target className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                    <h3 className="text-lg font-semibold mb-2">Assessment First</h3>
                    <p className="text-blue-100 text-sm mb-4">
                      Understand your current readiness for these new roles
                    </p>
                    <Link href="/hr-playbook/assessment">
                      <Button className="bg-white text-blue-900 hover:bg-gray-100">
                        Take Assessment
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    <h3 className="text-lg font-semibold mb-2">Expert Guidance</h3>
                    <p className="text-blue-100 text-sm mb-4">
                      Get personalized implementation roadmap
                    </p>
                    <Link href="/contact">
                      <Button variant="outline" className="border-white text-white hover:bg-white/10">
                        Schedule Consultation
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              <Link href="/hr-playbook">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to HR Playbook
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
} 