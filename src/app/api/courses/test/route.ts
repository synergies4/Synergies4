import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Test 1: Check if courses table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('courses')
      .select('id')
      .limit(1);
    
    if (tableError) {
      return NextResponse.json({ 
        error: 'Table check failed', 
        details: tableError 
      }, { status: 500 });
    }
    
    // Test 2: Count all courses
    const { count: totalCourses, error: countError } = await supabase
      .from('courses')
      .select('*', { count: 'exact' });
    
    if (countError) {
      return NextResponse.json({ 
        error: 'Count failed', 
        details: countError 
      }, { status: 500 });
    }
    
    // Test 3: Get published courses
    const { data: publishedCourses, error: publishedError } = await supabase
      .from('courses')
      .select('id, title, status')
      .eq('status', 'PUBLISHED')
      .limit(5);
    
    if (publishedError) {
      return NextResponse.json({ 
        error: 'Published courses query failed', 
        details: publishedError 
      }, { status: 500 });
    }
    
    // Test 4: Get all courses (for admin view)
    const { data: allCourses, error: allError } = await supabase
      .from('courses')
      .select('id, title, status, category')
      .limit(5);
    
    return NextResponse.json({
      success: true,
      tableExists: true,
      totalCourses: totalCourses || 0,
      publishedCourses: publishedCourses || [],
      allCourses: allError ? 'Error: ' + allError.message : (allCourses || []),
      publishedCount: publishedCourses?.length || 0
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error 
    }, { status: 500 });
  }
}
