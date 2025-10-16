'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, Github, Chrome, Sparkles, Zap, Brain, Star, Users, TrendingUp, Award } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get redirect URL on client side only
  useEffect(() => {
    if (mounted) {
      const searchParams = new URLSearchParams(window.location.search);
      setRedirectUrl(searchParams.get('redirect'));
    }
  }, [mounted]);

  // Redirect if already logged in
  useEffect(() => {
    console.log('🔄 Login - Auth state changed:', { user: !!user, userProfile: !!userProfile, loading });
    
    if (!loading && user && userProfile) {
      console.log('🔄 Login - User authenticated, redirecting...');
      
      // Check for pending course purchase
      const pendingCourseSlug = typeof window !== 'undefined' ? localStorage.getItem('pendingCourseSlug') : null;
      
      if (pendingCourseSlug) {
        console.log('🔄 Login - Found pending course, redirecting to:', pendingCourseSlug);
        localStorage.removeItem('pendingCourseSlug');
        localStorage.removeItem('pendingCourseId');
        window.location.href = `/courses/${pendingCourseSlug}`;
      } else if (redirectUrl) {
        console.log('🔄 Login - Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
      } else if (userProfile.role === 'ADMIN') {
        console.log('🔄 Login - Redirecting admin to /admin');
        window.location.href = '/admin';
      } else {
        console.log('🔄 Login - Redirecting user to /dashboard');
        window.location.href = '/dashboard';
      }
    }
  }, [user, userProfile, loading, redirectUrl]);

  // Don't render anything until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        // The AuthContext will handle the redirect automatically
        // when the user state updates
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('🚀 handleGoogleSignIn called');
    
    try {
      console.log('Starting Google sign-in...');
      const supabase = createClient();
      console.log('✅ Supabase client created');
      
      // Log the current origin
      console.log('Current origin:', window.location.origin);
      
      // Log environment variables (without sensitive data)
      console.log('Supabase URL from env:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      const redirectTo = `${window.location.origin}/dashboard`;
      console.log('Redirect URL will be:', redirectTo);
      
      console.log('🔄 Calling supabase.auth.signInWithOAuth...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      console.log('📊 OAuth response data:', data);
      console.log('📊 OAuth response error:', error);
      
      if (error) {
        console.error('❌ Google OAuth error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status
        });
        setError(`Google sign-in failed: ${error.message}`);
      } else {
        console.log('✅ Google OAuth initiated successfully');
        console.log('Response data:', data);
      }
    } catch (error) {
      console.error('💥 Catch block - Google sign-in error:', error);
      console.error('Error type:', typeof error);
      if (error && typeof error === 'object' && 'constructor' in error) {
        console.error('Error constructor:', (error as any).constructor.name);
      }
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      setError('An error occurred with Google sign in.');
    }
  };

  // Show loading if auth is loading, or user exists but no profile yet
  if (loading || (user && !userProfile)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <p className="text-gray-700 text-lg font-medium">
            {loading ? 'Checking your session...' : 'Loading your experience...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <div className="max-w-md">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Synergies4</h1>
                <p className="text-gray-600 text-sm">AI-Powered Learning Platform</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Accelerate Your <span className="text-blue-600">Agile Journey</span> with AI
            </h2>
            
            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              Join thousands of professionals mastering Agile methodologies through personalized, AI-driven learning experiences.
            </p>

            {/* Feature Stats */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900 font-semibold">10,000+</span>
                </div>
                <p className="text-gray-600 text-sm">Active Learners</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span className="text-gray-900 font-semibold">95%</span>
                </div>
                <p className="text-gray-600 text-sm">Success Rate</p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                <Star className="w-3 h-3 mr-1" />
                4.9/5 Rating
              </Badge>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                Industry Leading
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-block">
                <Image
                  src="/s4.png"
                  alt="Synergies4"
                  width={320}
                  height={80}
                  className="w-40 mx-auto"
                />
              </Link>
            </div>

            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
              <CardHeader className="space-y-1 text-center pb-6">
                <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Welcome back
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Sign in to continue your learning journey
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium text-gray-700">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500 transition-colors bg-white text-gray-900 placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-medium text-gray-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-12 h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500 transition-colors bg-white text-gray-900 placeholder:text-gray-500"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    <div className="text-right">
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-base transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Sign in
                      </>
                    )}
                  </Button>
                </form>

                {/* OAuth options temporarily disabled */}
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-2">
                <div className="text-sm text-center text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href="/signup"
                    className="font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    Sign up for free
                  </Link>
                </div>
                <div className="flex items-center justify-center">
                  <Link 
                    href="/" 
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" />
                    Back to home
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 