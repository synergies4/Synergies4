import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseAuthRedirectOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function useAuthRedirect({
  requireAuth = true,
  requireAdmin = false,
  redirectTo = '/'
}: UseAuthRedirectOptions = {}) {
  const { user, userProfile, loading: authLoading, isAdmin, canAccessAdmin } = useAuth();

  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) return;

    // Check if user is authenticated
    if (requireAuth && !user) {
      console.log('useAuthRedirect - No user, redirecting to:', redirectTo);
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return;
    }

    // Check if user has admin access (if required)
    if (requireAdmin && (!canAccessAdmin || !isAdmin)) {
      console.log('useAuthRedirect - User cannot access admin, redirecting to:', redirectTo);
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return;
    }
  }, [user, userProfile, authLoading, isAdmin, canAccessAdmin, requireAuth, requireAdmin, redirectTo]);

  return {
    user,
    userProfile,
    authLoading,
    isAdmin,
    canAccessAdmin,
    isAuthenticated: !!user,
    canAccess: requireAuth ? (authLoading ? false : !!user) : true,
    canAccessAdminArea: requireAdmin ? (authLoading ? false : (!!user && canAccessAdmin)) : true
  };
}
