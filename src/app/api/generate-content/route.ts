import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, type, context } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // For now, let's provide template-based content generation
    // In a real implementation, you would integrate with OpenAI or similar
    let generatedContent = '';

    if (type === 'course_content') {
      if (context.field === 'description') {
        generatedContent = generateCourseDescription(context);
      } else if (context.field === 'shortDesc') {
        generatedContent = generateShortDescription(context);
      }
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      content: generatedContent,
      success: true
    });

  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

function generateCourseDescription(context: any): string {
  const { title, category, level } = context;
  
  const templates = {
    'agile': {
      'BEGINNER': `This comprehensive ${title} course introduces you to the fundamentals of Agile methodologies and Scrum framework. Perfect for newcomers to Agile practices, this course covers essential concepts including sprint planning, daily standups, retrospectives, and continuous improvement.

**What You'll Learn:**
• Core Agile principles and values
• Scrum roles, events, and artifacts
• Sprint planning and execution
• User story writing and estimation
• Team collaboration techniques
• Basic project management in Agile environments

**Target Audience:**
This course is ideal for project managers, team members, and anyone looking to understand Agile practices. No prior experience with Agile methodologies is required.

**Key Benefits:**
• Gain practical skills in Agile project management
• Learn to facilitate effective team meetings
• Understand how to deliver value iteratively
• Prepare for entry-level Agile roles
• Certificate of completion included`,

      'INTERMEDIATE': `Advance your Agile expertise with this ${title} course designed for professionals with basic Agile knowledge. Dive deeper into advanced Scrum practices, scaling frameworks, and leadership techniques in Agile environments.

**What You'll Learn:**
• Advanced Scrum Master techniques
• Scaling Agile with frameworks like SAFe and LeSS
• Conflict resolution and team dynamics
• Metrics and KPIs for Agile teams
• Advanced facilitation techniques
• Organizational change management

**Target Audience:**
Ideal for Scrum Masters, Product Owners, and team leads with 6+ months of Agile experience looking to deepen their expertise.

**Key Benefits:**
• Master advanced Agile facilitation skills
• Learn to coach teams effectively
• Understand enterprise Agile scaling
• Enhance career prospects in Agile roles
• Industry-recognized certification included`,

      'ADVANCED': `Master the art of ${title} with this expert-level course covering advanced Agile coaching, organizational transformation, and enterprise-scale implementations. Perfect for senior practitioners and change agents.

**What You'll Learn:**
• Agile coaching and mentoring strategies
• Enterprise transformation planning
• Advanced metrics and analytics
• Custom framework development
• Cross-functional team optimization
• Executive stakeholder management

**Target Audience:**
Senior Agile practitioners, coaches, and consultants with 2+ years of experience leading Agile transformations.

**Key Benefits:**
• Become an expert Agile coach
• Lead organizational transformations
• Command premium consulting rates
• Build high-performing organizations
• Expert-level certification and recognition`
    },
    'leadership': {
      'BEGINNER': `Develop essential leadership skills with this ${title} course designed for emerging leaders and individual contributors ready to take the next step. Learn foundational leadership principles and practical techniques for leading teams effectively.

**What You'll Learn:**
• Core leadership principles and styles
• Effective communication techniques
• Team building and motivation
• Decision-making frameworks
• Conflict resolution basics
• Performance management fundamentals

**Target Audience:**
New managers, team leads, and high-potential individual contributors preparing for leadership roles.

**Key Benefits:**
• Build confidence in leadership situations
• Learn to inspire and motivate others
• Develop authentic leadership style
• Improve team performance
• Career advancement preparation`,

      'INTERMEDIATE': `Enhance your leadership effectiveness with this ${title} course focusing on advanced management techniques, strategic thinking, and organizational impact. Perfect for experienced managers looking to excel.

**What You'll Learn:**
• Strategic leadership and vision setting
• Advanced team dynamics and psychology
• Change management and innovation
• Emotional intelligence and empathy
• Cross-functional collaboration
• Results-driven performance management

**Target Audience:**
Managers with 1-3 years of experience seeking to enhance their leadership impact and effectiveness.

**Key Benefits:**
• Strengthen strategic thinking abilities
• Master advanced people management
• Drive organizational change
• Build high-performing teams
• Executive readiness development`,

      'ADVANCED': `Transform into an executive leader with this ${title} course covering advanced organizational leadership, cultural transformation, and C-suite capabilities. Designed for senior leaders and executives.

**What You'll Learn:**
• Executive presence and influence
• Organizational culture design
• Board-level communication
• Mergers and acquisitions leadership
• Global team management
• Crisis leadership and resilience

**Target Audience:**
Senior leaders, directors, and executives with 5+ years of management experience.

**Key Benefits:**
• Develop executive-level presence
• Lead enterprise transformations
• Master C-suite communication
• Build lasting organizational impact
• Executive coaching certification`
    },
    'product': {
      'BEGINNER': `Launch your product management career with this ${title} course covering fundamental product strategy, user research, and development lifecycle management. Perfect for aspiring product managers.

**What You'll Learn:**
• Product management fundamentals
• User research and validation
• Market analysis and competitive research
• Roadmap planning and prioritization
• Agile product development
• Basic analytics and metrics

**Target Audience:**
Aspiring product managers, business analysts, and professionals transitioning into product roles.

**Key Benefits:**
• Understand the complete product lifecycle
• Learn user-centered design thinking
• Master prioritization frameworks
• Build data-driven decision skills
• Prepare for product management roles`,

      'INTERMEDIATE': `Advance your product management skills with this ${title} course focusing on advanced strategy, growth metrics, and cross-functional leadership. Ideal for product managers with experience.

**What You'll Learn:**
• Advanced product strategy development
• Growth hacking and optimization
• A/B testing and experimentation
• Stakeholder management
• Product-market fit assessment
• Revenue and business model optimization

**Target Audience:**
Product managers with 1-2 years of experience looking to advance their skills and impact.

**Key Benefits:**
• Master advanced product strategies
• Drive measurable business growth
• Lead cross-functional initiatives
• Optimize product-market fit
• Senior product manager readiness`,

      'ADVANCED': `Master strategic product leadership with this ${title} course covering portfolio management, organizational strategy, and executive product leadership. For senior product professionals.

**What You'll Learn:**
• Product portfolio strategy
• Platform and ecosystem design
• Executive stakeholder management
• Product organization scaling
• Innovation and disruption strategies
• M&A product integration

**Target Audience:**
Senior product managers, directors, and VPs with 3+ years of experience leading product organizations.

**Key Benefits:**
• Lead product organizations effectively
• Drive company-wide innovation
• Master executive communication
• Build scalable product systems
• Executive product leadership certification`
    }
  };

  const categoryTemplates = templates[category as keyof typeof templates];
  if (categoryTemplates) {
    const levelTemplate = categoryTemplates[level as keyof typeof categoryTemplates];
    if (levelTemplate) {
      return levelTemplate;
    }
  }

  // Fallback generic template
  return `This ${level.toLowerCase()}-level ${category} course "${title}" provides comprehensive training designed to advance your professional skills and knowledge.

**What You'll Learn:**
• Core concepts and principles in ${category}
• Practical applications and real-world scenarios
• Industry best practices and methodologies
• Hands-on exercises and case studies
• Professional networking opportunities

**Target Audience:**
This course is designed for professionals at the ${level.toLowerCase()} level looking to enhance their expertise in ${category}.

**Key Benefits:**
• Advance your career in ${category}
• Gain practical, applicable skills
• Network with industry professionals
• Receive a certificate of completion
• Access to course materials and resources

Join us for this comprehensive learning experience that will transform your understanding and application of ${category} principles.`;
}

function generateShortDescription(context: any): string {
  const { title, category, level } = context;
  
  const shortTemplates = {
    'agile': {
      'BEGINNER': `Master the fundamentals of Agile and Scrum in this comprehensive ${title} course. Perfect for newcomers to Agile methodologies, learn essential practices for effective team collaboration and project delivery.`,
      'INTERMEDIATE': `Advance your Agile expertise with ${title}, covering advanced Scrum techniques, scaling frameworks, and leadership skills. Ideal for practitioners with basic Agile experience seeking deeper mastery.`,
      'ADVANCED': `Become an expert Agile coach with ${title}, mastering organizational transformation, enterprise scaling, and advanced coaching techniques. Designed for senior practitioners and change agents.`
    },
    'leadership': {
      'BEGINNER': `Develop essential leadership skills in ${title}, covering communication, team building, and decision-making. Perfect for emerging leaders and those preparing for management roles.`,
      'INTERMEDIATE': `Enhance your leadership effectiveness with ${title}, focusing on strategic thinking, advanced team dynamics, and organizational impact. Ideal for experienced managers seeking growth.`,
      'ADVANCED': `Transform into an executive leader with ${title}, covering organizational culture, strategic vision, and C-suite capabilities. Designed for senior leaders and executives.`
    },
    'product': {
      'BEGINNER': `Launch your product management career with ${title}, covering product strategy, user research, and development lifecycle. Perfect for aspiring product managers and career changers.`,
      'INTERMEDIATE': `Advance your product skills with ${title}, focusing on growth strategies, experimentation, and cross-functional leadership. Ideal for product managers with experience.`,
      'ADVANCED': `Master strategic product leadership with ${title}, covering portfolio management, organizational strategy, and executive product leadership. For senior product professionals.`
    }
  };

  const categoryTemplates = shortTemplates[category as keyof typeof shortTemplates];
  if (categoryTemplates) {
    const levelTemplate = categoryTemplates[level as keyof typeof categoryTemplates];
    if (levelTemplate) {
      return levelTemplate;
    }
  }

  // Fallback generic template
  return `${title} is a ${level.toLowerCase()}-level ${category} course designed to advance your professional skills. Learn essential concepts, practical applications, and industry best practices in this comprehensive training program.`;
} 