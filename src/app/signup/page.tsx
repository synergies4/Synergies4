'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Mail, 
  Lock,
  User,
  ArrowLeft,
  Github,
  Chrome,
  CheckCircle,
  Sparkles,
  Zap,
  Star,
  Users,
  TrendingUp,
  Award,
  Shield,
  Rocket,
  Brain
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
    console.log('🔄 Signup - Auth state changed:', { user: !!user, userProfile: !!userProfile, loading });
    
    if (!loading && user && userProfile) {
      console.log('🔄 Signup - User authenticated, redirecting...');
      
      if (redirectUrl) {
        console.log('🔄 Signup - Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
      } else if (userProfile.role === 'ADMIN') {
        console.log('🔄 Signup - Redirecting admin to /admin');
        window.location.href = '/admin';
      } else {
        console.log('🔄 Signup - Redirecting user to /dashboard');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      setSuccess(true);
      setTimeout(() => {
        if (redirectUrl) {
          router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        } else {
          router.push('/login');
        }
      }, 3000);
    } catch (error) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    console.log('🚀 handleGoogleSignUp called');
    
    try {
      console.log('Starting Google sign-up...');
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
        setError(`Google sign-up failed: ${error.message}`);
      } else {
        console.log('✅ Google OAuth initiated successfully');
        console.log('Response data:', data);
      }
    } catch (error) {
      console.error('💥 Catch block - Google sign-up error:', error);
      console.error('Error type:', typeof error);
      if (error && typeof error === 'object' && 'constructor' in error) {
        console.error('Error constructor:', (error as any).constructor.name);
      }
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      setError('An error occurred with Google sign up.');
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-32 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl text-center">
              <CardContent className="pt-8 pb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                  Welcome Aboard!
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Your account has been successfully created. Please check your email to verify your account, then you can start your AI-powered learning journey.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Rocket className="w-4 h-4" />
                  <span>Redirecting to sign in...</span>
                </div>
              </CardContent>
            </Card>
          </div>
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
              Transform Your Career with <span className="text-blue-600">AI-Driven</span> Learning
            </h2>
            
            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              Join the next generation of Agile professionals. Get personalized training, expert guidance, and industry-recognized certifications.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-gray-700">Personalized AI-powered learning paths</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-gray-700">Expert mentorship and guidance</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-gray-700">Industry-recognized certifications</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-gray-700">30-day money-back guarantee</span>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                <Shield className="w-3 h-3 mr-1" />
                Secure & Trusted
              </Badge>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <Brain className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-block">
                <Image
                  src="/Minimalist Consulting Firm Logo 'Synergies4'.png"
                  alt="Synergies4"
                  width={320}
                  height={80}
                  className="h-16 w-auto mx-auto"
                />
              </Link>
            </div>

            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
              <CardHeader className="space-y-1 text-center pb-6">
                <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Create your account
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Start your AI-powered learning journey today
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-medium text-gray-700">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500 transition-colors bg-white text-gray-900 placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium text-gray-700">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleChange}
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
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="font-medium text-gray-700">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10 pr-12 h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500 transition-colors bg-white text-gray-900 placeholder:text-gray-500"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
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
                        Creating account...
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 h-5 w-5" />
                        Create account
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-gray-500 font-medium">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-12 border-gray-200 hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02]"
                  onClick={handleGoogleSignUp}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="text-xs text-center text-gray-500 bg-gray-50 p-3 rounded-lg">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="text-teal-600 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</Link>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-2">
                <div className="text-sm text-center text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    Sign in
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