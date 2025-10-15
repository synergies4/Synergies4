import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get ONLY essential user data from users table
    // This is a lightweight query for AuthContext
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, auth_user_id, email, name, role, created_at, updated_at')
      .eq('auth_user_id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      
      // If user doesn't exist in database, create them
      if (userError.code === 'PGRST116') {
        const isAdmin = user.email === 'admin@synergies4.com';
        
        const newUser = {
          auth_user_id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          role: isAdmin ? 'ADMIN' : 'USER'
        };

        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert([newUser])
          .select('id, auth_user_id, email, name, role, created_at, updated_at')
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          return NextResponse.json(
            { message: 'Error creating user' },
            { status: 500 }
          );
        }

        return NextResponse.json({ 
          user: {
            id: createdUser.id,
            auth_user_id: createdUser.auth_user_id,
            email: createdUser.email,
            name: createdUser.name,
            role: createdUser.role,
            created_at: createdUser.created_at,
            updated_at: createdUser.updated_at,
            is_admin: createdUser.role === 'ADMIN',
            is_instructor: createdUser.role === 'INSTRUCTOR',
            can_access_admin: createdUser.role === 'ADMIN' || createdUser.role === 'INSTRUCTOR'
          },
          success: true 
        });
      }

      return NextResponse.json(
        { message: 'Error fetching user data' },
        { status: 500 }
      );
    }

    if (!userData) {
      return NextResponse.json(
        { message: 'User not found in database' },
        { status: 404 }
      );
    }

    // Return lightweight user data
    const userResponse = {
      id: userData.id,
      auth_user_id: userData.auth_user_id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      is_admin: userData.role === 'ADMIN',
      is_instructor: userData.role === 'INSTRUCTOR',
      can_access_admin: userData.role === 'ADMIN' || userData.role === 'INSTRUCTOR'
    };

    return NextResponse.json({ 
      user: userResponse,
      success: true 
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

