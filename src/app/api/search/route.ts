import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  content?: string;
  type: 'course' | 'blog_post' | 'page' | 'user';
  url: string;
  category?: string;
  tags?: string[];
  image?: string;
  author?: string;
  created_at: string;
  relevance_score: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // Filter by type
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        results: [],
        total: 0,
        query: query || '',
        suggestions: ['Try searching for "agile", "scrum", "leadership", "courses"']
      });
    }

    const supabase = await createClient();
    const searchTerm = query.trim().toLowerCase();
    const searchWords = searchTerm.split(' ').filter(word => word.length > 2);

    let allResults: SearchResult[] = [];

    // Search courses
    if (!type || type === 'course') {
      try {
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,short_desc.ilike.%${searchTerm}%`)
          .eq('status', 'PUBLISHED')
          .limit(limit);

        if (coursesError) {
          console.error('Courses search error:', coursesError);
        } else if (courses) {
          const courseResults: SearchResult[] = courses.map(course => ({
            id: course.id,
            title: course.title,
            description: course.short_desc || course.description,
            type: 'course' as const,
            url: `/courses/${course.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`,
            category: course.category,
            image: course.image,
            created_at: course.created_at,
            relevance_score: calculateRelevance(searchTerm, searchWords, course.title, course.description)
          }));
          allResults.push(...courseResults);
        }
      } catch (error) {
        console.error('Error searching courses:', error);
      }
    }

    // Search blog posts
    if (!type || type === 'blog_post') {
      try {
        const { data: posts, error: postsError } = await supabase
          .from('blog_posts')
          .select('*')
          .or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
          .eq('status', 'PUBLISHED')
          .limit(limit);

        if (postsError) {
          console.error('Blog posts search error:', postsError);
        } else if (posts) {
          const postResults: SearchResult[] = posts.map(post => ({
            id: post.id,
            title: post.title,
            description: post.excerpt,
            content: post.content?.substring(0, 200) + '...',
            type: 'blog_post' as const,
            url: `/industry-insight/${post.slug}`,
            category: post.category,
            tags: post.tags,
            image: post.featured_image,
            author: post.author_name,
            created_at: post.created_at,
            relevance_score: calculateRelevance(searchTerm, searchWords, post.title, post.excerpt + ' ' + post.content)
          }));
          allResults.push(...postResults);
        }
      } catch (error) {
        console.error('Error searching blog posts:', error);
      }
    }

    // Search users (for admin/internal use)
    if (type === 'user') {
      try {
        const { data: users, error: usersError } = await supabase
          .from('user_profiles')
          .select('*')
          .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
          .limit(limit);

        if (usersError) {
          console.error('Users search error:', usersError);
        } else if (users) {
          const userResults: SearchResult[] = users.map(user => ({
            id: user.id,
            title: `${user.first_name} ${user.last_name}`,
            description: user.email,
            type: 'user' as const,
            url: `/admin/users/${user.id}`,
            created_at: user.created_at,
            relevance_score: calculateRelevance(searchTerm, searchWords, `${user.first_name} ${user.last_name}`, user.email)
          }));
          allResults.push(...userResults);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      }
    }

    // Add static page results for common searches
    if (!type || type === 'page') {
      const staticPages = getStaticPageResults(searchTerm, searchWords);
      allResults.push(...staticPages);
    }

    // Filter by category if specified
    if (category && category !== 'all') {
      allResults = allResults.filter(result => 
        result.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Sort by relevance score
    allResults.sort((a, b) => b.relevance_score - a.relevance_score);

    // Apply pagination
    const paginatedResults = allResults.slice(offset, offset + limit);
    const total = allResults.length;

    // Generate search suggestions
    const suggestions = generateSearchSuggestions(searchTerm, allResults);

    return NextResponse.json({
      results: paginatedResults,
      total,
      query: searchTerm,
      suggestions,
      categories: getAvailableCategories(allResults),
      types: getAvailableTypes(allResults)
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        error: 'Search service temporarily unavailable',
        results: [],
        total: 0,
        query: '',
        suggestions: []
      },
      { status: 500 }
    );
  }
}

function calculateRelevance(searchTerm: string, searchWords: string[], title: string, content: string): number {
  let score = 0;
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  
  // Exact title match gets highest score
  if (titleLower.includes(searchTerm)) {
    score += 100;
  }
  
  // Title word matches
  searchWords.forEach(word => {
    if (titleLower.includes(word)) {
      score += 50;
    }
  });
  
  // Content matches
  if (contentLower.includes(searchTerm)) {
    score += 25;
  }
  
  searchWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    const matches = (contentLower.match(regex) || []).length;
    score += matches * 5;
  });
  
  return score;
}

function getStaticPageResults(searchTerm: string, searchWords: string[]): SearchResult[] {
  const staticPages = [
    {
      id: 'home',
      title: 'Home - Synergies4',
      description: 'Professional development and training company specializing in business strategy, leadership, and technology.',
      url: '/',
      keywords: ['home', 'synergies4', 'training', 'professional development', 'leadership', 'business strategy']
    },
    {
      id: 'about',
      title: 'About Us - Our Story',
      description: 'Learn about Synergies4\'s mission, values, and commitment to professional excellence.',
      url: '/about-us',
      keywords: ['about', 'company', 'mission', 'values', 'team', 'story']
    },
    {
      id: 'courses',
      title: 'Course Directory',
      description: 'Browse our comprehensive collection of professional training courses and certification programs.',
      url: '/courses',
      keywords: ['courses', 'training', 'certification', 'learning', 'programs', 'education']
    },
    {
      id: 'coaching',
      title: 'Professional Coaching Services',
      description: 'One-on-one coaching services for leadership development and career advancement.',
      url: '/coaching',
      keywords: ['coaching', 'mentoring', 'leadership', 'career', 'development', 'one-on-one']
    },
    {
      id: 'consulting',
      title: 'Business Consulting',
      description: 'Strategic consulting services to help organizations optimize performance and achieve goals.',
      url: '/consulting',
      keywords: ['consulting', 'strategy', 'business', 'optimization', 'organizational', 'performance']
    },
    {
      id: 'synergize',
      title: 'Synergize AI Assistant',
      description: 'AI-powered learning companion for Agile training and professional development.',
      url: '/synergize',
      keywords: ['ai', 'assistant', 'agile', 'scrum', 'artificial intelligence', 'learning companion']
    },
    {
      id: 'contact',
      title: 'Contact Us',
      description: 'Get in touch with our team for inquiries about courses, coaching, or consulting services.',
      url: '/contact',
      keywords: ['contact', 'support', 'inquiries', 'help', 'get in touch', 'customer service']
    }
  ];

  return staticPages
    .filter(page => {
      const searchableText = (page.title + ' ' + page.description + ' ' + page.keywords.join(' ')).toLowerCase();
      return searchableText.includes(searchTerm) || 
             searchWords.some(word => searchableText.includes(word));
    })
    .map(page => ({
      id: page.id,
      title: page.title,
      description: page.description,
      type: 'page' as const,
      url: page.url,
      created_at: new Date().toISOString(),
      relevance_score: calculateRelevance(searchTerm, searchWords, page.title, page.description + ' ' + page.keywords.join(' '))
    }));
}

function generateSearchSuggestions(searchTerm: string, results: SearchResult[]): string[] {
  const suggestions: string[] = [];
  
  // Add common search terms
  const commonTerms = [
    'agile training',
    'scrum master certification',
    'leadership development',
    'product management',
    'business strategy',
    'project management',
    'digital transformation',
    'team coaching'
  ];
  
  // Find related terms
  commonTerms.forEach(term => {
    if (term.toLowerCase().includes(searchTerm.toLowerCase()) && term !== searchTerm) {
      suggestions.push(term);
    }
  });
  
  // Add category-based suggestions
  const categories = [...new Set(results.map(r => r.category).filter(Boolean))];
  categories.forEach(category => {
    if (category && suggestions.length < 5) {
      suggestions.push(`${searchTerm} in ${category}`);
    }
  });
  
  return suggestions.slice(0, 5);
}

function getAvailableCategories(results: SearchResult[]): string[] {
  return [...new Set(results.map(r => r.category).filter((category): category is string => Boolean(category)))];
}

function getAvailableTypes(results: SearchResult[]): string[] {
  return [...new Set(results.map(r => r.type))];
} 