'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Shield } from 'lucide-react';

export function UserAvatar() {
  const { user, userProfile, signOut } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const getInitials = (name: string | null | undefined) => {
    if (!name) return user.email?.charAt(0).toUpperCase() || 'U';
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    console.log('UserAvatar: Starting sign out...');
    
    // Call signOut (which is now non-blocking)
    signOut();
    
    console.log('UserAvatar: Sign out initiated, redirecting...');
    
    // Small delay to show the loading state, then redirect
    setTimeout(() => {
      setIsLoading(false);
      router.push('/');
    }, 500);
  };

  const handleDashboard = () => {
    console.log('UserAvatar: userProfile:', userProfile);
    console.log('UserAvatar: userProfile.role:', userProfile?.role);
    
    if (userProfile?.role === 'ADMIN') {
      console.log('UserAvatar: Redirecting to admin dashboard');
      router.push('/admin');
    } else {
      console.log('UserAvatar: Redirecting to user dashboard');
      router.push('/dashboard');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={userProfile?.name || user.email} />
            <AvatarFallback className="bg-blue-600 text-white">
              {getInitials(userProfile?.name || user.user_metadata?.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userProfile?.name || user.user_metadata?.name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDashboard}>
          {userProfile?.role === 'ADMIN' ? (
            <>
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </>
          ) : (
            <>
              <User className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 