'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  role: 'USER' | 'ADMIN' | 'INSTRUCTOR';
  created_at: string;
  updated_at: string;
  is_admin?: boolean;
  is_instructor?: boolean;
  can_access_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isLoggingOut: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isInstructor: boolean;
  canAccessAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isLoggingOut: false,
  signOut: async () => {},
  isAdmin: false,
  isInstructor: false,
  canAccessAdmin: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

async function fetchUserData(supabase: any, user: User): Promise<UserProfile | null> {
  try {
    console.log('Fetching user data for:', user.email);
    
    // Get the session token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.warn('No session token available');
      return null;
    }

    // Fetch user data from our API endpoint with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('Failed to fetch user data:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
  } catch (fetchError) {
    console.error('Error fetching user data (timeout or network error):', fetchError);
    clearTimeout(timeoutId);
    return null;
  }
    console.log('User data from API:', data);

    if (data.success && data.user) {
      const userData = data.user;
      console.log('✅ API user data received:', userData);
      console.log('✅ Using name from API:', userData.name);
      return {
        id: userData.id,
        user_id: userData.auth_user_id,
        name: userData.name,
        role: userData.role,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        is_admin: userData.is_admin,
        is_instructor: userData.is_instructor,
        can_access_admin: userData.can_access_admin,
      };
    }

    console.warn('No user data in response');
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

async function getOrCreateUserProfile(supabase: any, user: User): Promise<UserProfile | null> {
  try {
    console.log('Getting profile for user:', user.id);
    
    // First, try to fetch user data from our API
    const userData = await fetchUserData(supabase, user);
    if (userData) {
      console.log('✅ Using API user data:', userData);
      return userData;
    }
    console.log('❌ API user data not available, trying fallback...');

    // Fallback: try to get existing user from users table (which has the role)
    const { data: userDataFromDB, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (userDataFromDB && !userError) {
      console.log('Found existing user from DB:', userDataFromDB);
      return {
        id: userDataFromDB.id,
        user_id: userDataFromDB.id,
        name: userDataFromDB.name || user.email?.split('@')[0] || 'User',
        role: userDataFromDB.role,
        created_at: userDataFromDB.created_at,
        updated_at: userDataFromDB.updated_at,
        is_admin: userDataFromDB.role === 'ADMIN',
        is_instructor: userDataFromDB.role === 'INSTRUCTOR',
        can_access_admin: userDataFromDB.role === 'ADMIN' || userDataFromDB.role === 'INSTRUCTOR',
      };
    }

    // If no user exists, create one
    if (userError?.code === 'PGRST116' || userError?.message?.includes('No rows found')) {
      console.log('No user found, creating new one for user:', user.id);
      
      // Check if user is admin
      const isAdmin = user.email === 'admin@synergies4.com' || user.email === 'paul@antimatterai.com';
      
      const newUser = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        role: isAdmin ? 'ADMIN' as const : 'USER' as const
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (createError) {
        console.warn('Could not create user in database:', createError.message);
        // Return a default profile instead of null
        return {
          id: 'temp-' + user.id,
          user_id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          role: isAdmin ? 'ADMIN' as const : 'USER' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_admin: isAdmin,
          is_instructor: false,
          can_access_admin: isAdmin,
        };
      }

      console.log('Created new user:', createdUser);
      return {
        id: createdUser.id,
        user_id: createdUser.id,
        name: createdUser.name,
        role: createdUser.role,
        created_at: createdUser.created_at,
        updated_at: createdUser.updated_at,
        is_admin: createdUser.role === 'ADMIN',
        is_instructor: createdUser.role === 'INSTRUCTOR',
        can_access_admin: createdUser.role === 'ADMIN' || createdUser.role === 'INSTRUCTOR',
      };
    }

    console.warn('Database not available, using temporary profile:', userError?.message);
    
    // Check if user is admin
    const isAdmin = user.email === 'admin@synergies4.com' || user.email === 'paul@antimatterai.com';
    
    // Return a default profile instead of null
    return {
      id: 'temp-' + user.id,
      user_id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      role: isAdmin ? 'ADMIN' as const : 'USER' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_admin: isAdmin,
      is_instructor: false,
      can_access_admin: isAdmin,
    };
  } catch (error) {
    console.warn('Profile creation failed, using temporary profile:', error);
    
    // Check if user is admin
    const isAdmin = user.email === 'admin@synergies4.com' || user.email === 'paul@antimatterai.com';
    
    // Return a default profile instead of null
    return {
      id: 'temp-' + user.id,
      user_id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      role: isAdmin ? 'ADMIN' as const : 'USER' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_admin: isAdmin,
      is_instructor: false,
      can_access_admin: isAdmin,
    };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔄 AuthContext - Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('🔄 AuthContext - Initial session:', session?.user?.email, 'Error:', error);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('🔄 AuthContext - User found, getting profile...');
          // Get user profile with timeout
          try {
            const profilePromise = getOrCreateUserProfile(supabase, session.user);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
            );
            
            const profile = await Promise.race([profilePromise, timeoutPromise]);
            console.log('🔄 AuthContext - Final user profile:', profile);
            setUserProfile(profile);
          } catch (profileError) {
            console.error('🔄 AuthContext - Profile fetch failed:', profileError);
            // Set a default profile to prevent infinite loading
            setUserProfile({
              id: session.user.id,
              user_id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              role: 'USER',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_admin: false,
              is_instructor: false,
              can_access_admin: false,
            });
          }
        } else {
          console.log('🔄 AuthContext - No user found in session');
        }
        
        setLoading(false);
        console.log('🔄 AuthContext - Initial session loading complete');
      } catch (error) {
        console.error('🔄 AuthContext - Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Fallback timeout to ensure loading is set to false
    const fallbackTimeout = setTimeout(() => {
      console.log('🔄 AuthContext - Fallback timeout reached, setting loading to false');
      setLoading(false);
    }, 10000); // 10 second fallback

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthContext - Auth state change:', event, session?.user?.email);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('🔄 AuthContext - User authenticated, getting profile...');
          // Get user profile with timeout
          try {
            const profilePromise = getOrCreateUserProfile(supabase, session.user);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
            );
            
            const profile = await Promise.race([profilePromise, timeoutPromise]);
            setUserProfile(profile);
          } catch (profileError) {
            console.error('🔄 AuthContext - Profile fetch failed:', profileError);
            // Set a default profile to prevent infinite loading
            setUserProfile({
              id: session.user.id,
              user_id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              role: 'USER',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_admin: false,
              is_instructor: false,
              can_access_admin: false,
            });
          }
        } else {
          console.log('🔄 AuthContext - User signed out, clearing profile');
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('Starting sign out process...');
    
    // Set logging out state immediately
    setIsLoggingOut(true);
    
    try {
      // Clear local state first to prevent any further API calls
      setUser(null);
      setUserProfile(null);
      console.log('Local state cleared');
      
      // Sign out from Supabase
      const supabase = createClient();
      await supabase.auth.signOut();
      console.log('Supabase sign out successful');
      
      // Use router.push for cleaner navigation (if available)
      // Otherwise fall back to window.location
      if (typeof window !== 'undefined') {
        // Small delay to ensure state is cleared
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }
      
    } catch (error) {
      console.log('Supabase sign out error:', error);
      // Even if there's an error, ensure we redirect
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    
    console.log('Sign out complete');
  };

  // Computed values for easier access
  const isAdmin = userProfile?.is_admin || userProfile?.role === 'ADMIN' || false;
  const isInstructor = userProfile?.is_instructor || userProfile?.role === 'INSTRUCTOR' || false;
  const canAccessAdmin = userProfile?.can_access_admin || isAdmin || isInstructor || false;

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      isLoggingOut, 
      signOut, 
      isAdmin, 
      isInstructor, 
      canAccessAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
} 