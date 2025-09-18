import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🚀 Signup API called');
  
  try {
    const body = await request.json();
    console.log('📝 Request body received:', { email: body.email, name: body.name, hasPassword: !!body.password });
    
    const { email, password, name } = body;

    // Validate required fields
    if (!email || !password || !name) {
      console.log('❌ Missing required fields:', { email: !!email, password: !!password, name: !!name });
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // For now, just return success to test if the API route is working
    console.log('✅ Basic validation passed');
    
    return NextResponse.json(
      { 
        message: 'Account creation validation passed. Supabase integration temporarily disabled for testing.',
        user: {
          email: email,
          name: name
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Signup API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { error: `API error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 