'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminFloatingButton() {
  const { user, isAdmin, canAccessAdmin, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  // Only show the button if user is logged in and has admin access
  useEffect(() => {
    if (!loading && user && canAccessAdmin) {
      // Small delay to ensure smooth appearance
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [user, canAccessAdmin, loading]);

  // Don't render anything if user is not admin or not logged in
  if (loading || !user || !canAccessAdmin) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-20 right-4 z-50 transition-all duration-500 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <Button
        asChild
        size="lg"
        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 rounded-full px-6 py-3 h-auto"
      >
        <Link href="/admin">
          <Shield className="w-5 h-5 mr-2" />
          Go to Admin
        </Link>
      </Button>
    </div>
  );
}
