'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function AuthDebugger() {
  const { user, userProfile, loading, isLoggingOut, isAdmin, canAccessAdmin } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="font-bold mb-2">🔍 Auth Debug</div>
      <div>User: {user ? '✅' : '❌'}</div>
      <div>Email: {user?.email || 'N/A'}</div>
      <div>Profile: {userProfile ? '✅' : '❌'}</div>
      <div>Loading: {loading ? '🔄' : '✅'}</div>
      <div>Logging Out: {isLoggingOut ? '🔄' : '✅'}</div>
      <div>Admin: {isAdmin ? '👑' : '❌'}</div>
      <div>Can Access Admin: {canAccessAdmin ? '✅' : '❌'}</div>
    </div>
  );
}
