'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WifiOff, RefreshCw, Home, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-8 h-8 text-gray-400" />
          </div>
          <CardTitle className="text-2xl text-gray-900">You're Offline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            It looks like you're not connected to the internet. Some features may not be available, but you can still access your cached content.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleRefresh}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <div className="flex space-x-2">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/courses">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Courses
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Available Offline:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Recently viewed courses</li>
              <li>• Downloaded learning materials</li>
              <li>• Your dashboard</li>
              <li>• AI assistant (limited)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 