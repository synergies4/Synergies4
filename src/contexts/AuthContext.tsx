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
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

async function getOrCreateUserProfile(supabase: any, user: User): Promise<UserProfile | null> {
  try {
    console.log('Getting profile for user:', user.id);
    
    // First, try to get existing user from users table (which has the role)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userData && !userError) {
      console.log('Found existing user:', userData);
      return {
        id: userData.id,
        user_id: userData.id,
        name: userData.name || user.email?.split('@')[0] || 'User',
        role: userData.role,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      };
    }

    // If no user exists, create one
    if (userError?.code === 'PGRST116' || userError?.message?.includes('No rows found')) {
      console.log('No user found, creating new one for user:', user.id);
      
      // Temporary: Make paul@antimatterai.com an admin
      const isAdmin = user.email === 'paul@antimatterai.com';
      
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
          updated_at: new Date().toISOString()
        };
      }

      console.log('Created new user:', createdUser);
      return {
        id: createdUser.id,
        user_id: createdUser.id,
        name: createdUser.name,
        role: createdUser.role,
        created_at: createdUser.created_at,
        updated_at: createdUser.updated_at
      };
    }

    console.warn('Database not available, using temporary profile:', userError?.message);
    
    // Temporary: Make paul@antimatterai.com an admin
    const isAdmin = user.email === 'paul@antimatterai.com';
    
    // Return a default profile instead of null
    return {
      id: 'temp-' + user.id,
      user_id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      role: isAdmin ? 'ADMIN' as const : 'USER' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Profile creation failed, using temporary profile:', error);
    
    // Temporary: Make paul@antimatterai.com an admin
    const isAdmin = user.email === 'paul@antimatterai.com';
    
    // Return a default profile instead of null
    return {
      id: 'temp-' + user.id,
      user_id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      role: isAdmin ? 'ADMIN' as const : 'USER' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session:', session, 'Error:', error);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User email:', session.user.email);
          // Add timeout to profile creation
          const profilePromise = getOrCreateUserProfile(supabase, session.user);
          const timeoutPromise = new Promise<UserProfile>((resolve) => 
            setTimeout(() => {
              const isAdmin = session.user.email === 'paul@antimatterai.com';
              resolve({
                id: 'temp-' + session.user.id,
                user_id: session.user.id,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                role: isAdmin ? 'ADMIN' as const : 'USER' as const,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }, 3000)
          );
          
          const profile = await Promise.race([profilePromise, timeoutPromise]);
          console.log('Final user profile:', profile);
          setUserProfile(profile);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Add timeout to profile creation
          const profilePromise = getOrCreateUserProfile(supabase, session.user);
          const timeoutPromise = new Promise<UserProfile>((resolve) => 
            setTimeout(() => {
              const isAdmin = session.user.email === 'paul@antimatterai.com';
              resolve({
                id: 'temp-' + session.user.id,
                user_id: session.user.id,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                role: isAdmin ? 'ADMIN' as const : 'USER' as const,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }, 3000)
          );
          
          const profile = await Promise.race([profilePromise, timeoutPromise]);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    console.log('Starting sign out process...');
    
    // Clear local state immediately
    setUser(null);
    setUserProfile(null);
    console.log('Local state cleared');
    
    // Sign out from Supabase in the background (don't await)
    const supabase = createClient();
    supabase.auth.signOut().then(() => {
      console.log('Supabase sign out successful');
    }).catch((error) => {
      console.log('Supabase sign out error:', error);
    });
    
    console.log('Sign out complete');
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
} 