'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageLayout from '@/components/shared/PageLayout';
import { 
  Settings,
  Shield,
  Home,
  Save,
  Mail,
  Globe,
  Database,
  Key,
  Bell,
  Users,
  DollarSign,
  Palette,
  Code,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface PlatformSettings {
  site_name: string;
  site_description: string;
  site_url: string;
  contact_email: string;
  support_email: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  email_verification_required: boolean;
  max_file_size_mb: number;
  allowed_file_types: string[];
  default_user_role: string;
  course_approval_required: boolean;
  payment_enabled: boolean;
  stripe_public_key: string;
  stripe_secret_key: string;
  email_provider: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  ai_provider: string;
  openai_api_key: string;
  anthropic_api_key: string;
  theme_primary_color: string;
  theme_secondary_color: string;
  custom_css: string;
  analytics_enabled: boolean;
  google_analytics_id: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

export default function AdminSettings() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<PlatformSettings>({
    site_name: 'Synergies4',
    site_description: 'AI-powered learning platform for professional development',
    site_url: 'https://synergies4ai.com',
    contact_email: 'contact@synergies4ai.com',
    support_email: 'support@synergies4ai.com',
    maintenance_mode: false,
    registration_enabled: true,
    email_verification_required: true,
    max_file_size_mb: 10,
    allowed_file_types: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'mp4', 'mov'],
    default_user_role: 'USER',
    course_approval_required: false,
    payment_enabled: true,
    stripe_public_key: '',
    stripe_secret_key: '',
    email_provider: 'smtp',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    ai_provider: 'anthropic',
    openai_api_key: '',
    anthropic_api_key: '',
    theme_primary_color: '#2563eb',
    theme_secondary_color: '#7c3aed',
    custom_css: '',
    analytics_enabled: true,
    google_analytics_id: '',
    seo_title: 'Synergies4 - AI-Powered Learning Platform',
    seo_description: 'Transform your professional development with AI-powered courses, coaching, and consulting.',
    seo_keywords: 'AI learning, professional development, agile, scrum, leadership, product management'
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || userProfile?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    loadSettings();
  }, [user, userProfile, authLoading, router]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Try to load settings from database
      const { data: settingsData, error } = await supabase
        .from('platform_settings')
        .select('*')
        .single();

      if (error) {
        console.warn('Settings not found in database, using defaults:', error.message);
        // Use default settings if none exist
      } else if (settingsData) {
        setSettings(prev => ({ ...prev, ...settingsData }));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const supabase = createClient();
      
      // Save settings to database
      const { error } = await supabase
        .from('platform_settings')
        .upsert(settings, { onConflict: 'id' });

      if (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings. Please try again.');
      } else {
        alert('Settings saved successfully!');
      }
      
      setSaving(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof PlatformSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const testEmailConnection = async () => {
    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: settings.email_provider,
          smtp_host: settings.smtp_host,
          smtp_port: settings.smtp_port,
          smtp_username: settings.smtp_username,
          smtp_password: settings.smtp_password
        })
      });

      if (response.ok) {
        alert('Email connection test successful!');
      } else {
        alert('Email connection test failed. Please check your settings.');
      }
    } catch (error) {
      alert('Email connection test failed. Please check your settings.');
    }
  };

  const testAIConnection = async () => {
    try {
      const response = await fetch('/api/admin/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: settings.ai_provider,
          openai_api_key: settings.openai_api_key,
          anthropic_api_key: settings.anthropic_api_key
        })
      });

      if (response.ok) {
        alert('AI connection test successful!');
      } else {
        alert('AI connection test failed. Please check your API keys.');
      }
    } catch (error) {
      alert('AI connection test failed. Please check your API keys.');
    }
  };

  if (authLoading || loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user || userProfile?.role !== 'ADMIN') {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Access Denied</CardTitle>
              <CardDescription className="text-center">
                You need admin privileges to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <Settings className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
                  <p className="text-gray-600">Configure your platform settings and preferences</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={saveSettings}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    View Site
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Site Information
                  </CardTitle>
                  <CardDescription>
                    Basic information about your platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="site_name">Site Name</Label>
                      <Input
                        id="site_name"
                        value={settings.site_name}
                        onChange={(e) => updateSetting('site_name', e.target.value)}
                        placeholder="Your site name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="site_url">Site URL</Label>
                      <Input
                        id="site_url"
                        value={settings.site_url}
                        onChange={(e) => updateSetting('site_url', e.target.value)}
                        placeholder="https://yoursite.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="site_description">Site Description</Label>
                    <Textarea
                      id="site_description"
                      value={settings.site_description}
                      onChange={(e) => updateSetting('site_description', e.target.value)}
                      placeholder="Describe your platform"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_email">Contact Email</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={settings.contact_email}
                        onChange={(e) => updateSetting('contact_email', e.target.value)}
                        placeholder="contact@yoursite.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="support_email">Support Email</Label>
                      <Input
                        id="support_email"
                        type="email"
                        value={settings.support_email}
                        onChange={(e) => updateSetting('support_email', e.target.value)}
                        placeholder="support@yoursite.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Platform Settings
                  </CardTitle>
                  <CardDescription>
                    Control platform behavior and features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-gray-500">
                        Temporarily disable the site for maintenance
                      </p>
                    </div>
                    <Switch
                      checked={settings.maintenance_mode}
                      onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>User Registration</Label>
                      <p className="text-sm text-gray-500">
                        Allow new users to register
                      </p>
                    </div>
                    <Switch
                      checked={settings.registration_enabled}
                      onCheckedChange={(checked) => updateSetting('registration_enabled', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Verification Required</Label>
                      <p className="text-sm text-gray-500">
                        Require email verification for new accounts
                      </p>
                    </div>
                    <Switch
                      checked={settings.email_verification_required}
                      onCheckedChange={(checked) => updateSetting('email_verification_required', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max_file_size">Max File Size (MB)</Label>
                      <Input
                        id="max_file_size"
                        type="number"
                        value={settings.max_file_size_mb}
                        onChange={(e) => updateSetting('max_file_size_mb', parseInt(e.target.value))}
                        min="1"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="default_role">Default User Role</Label>
                      <Select 
                        value={settings.default_user_role} 
                        onValueChange={(value) => updateSetting('default_user_role', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">Student</SelectItem>
                          <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Settings */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Configure user-related settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Course Approval Required</Label>
                      <p className="text-sm text-gray-500">
                        Require admin approval for new courses
                      </p>
                    </div>
                    <Switch
                      checked={settings.course_approval_required}
                      onCheckedChange={(checked) => updateSetting('course_approval_required', checked)}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="allowed_file_types">Allowed File Types</Label>
                    <Input
                      id="allowed_file_types"
                      value={settings.allowed_file_types.join(', ')}
                      onChange={(e) => updateSetting('allowed_file_types', e.target.value.split(', ').map(s => s.trim()))}
                      placeholder="jpg, png, pdf, mp4"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Comma-separated list of allowed file extensions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Settings */}
            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Payment Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure payment processing settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Payments</Label>
                      <p className="text-sm text-gray-500">
                        Allow paid courses and subscriptions
                      </p>
                    </div>
                    <Switch
                      checked={settings.payment_enabled}
                      onCheckedChange={(checked) => updateSetting('payment_enabled', checked)}
                    />
                  </div>

                  {settings.payment_enabled && (
                    <>
                      <Separator />
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Stripe Configuration</h4>
                        
                        <div>
                          <Label htmlFor="stripe_public_key">Stripe Publishable Key</Label>
                          <Input
                            id="stripe_public_key"
                            value={settings.stripe_public_key}
                            onChange={(e) => updateSetting('stripe_public_key', e.target.value)}
                            placeholder="pk_test_..."
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="stripe_secret_key">Stripe Secret Key</Label>
                          <Input
                            id="stripe_secret_key"
                            type="password"
                            value={settings.stripe_secret_key}
                            onChange={(e) => updateSetting('stripe_secret_key', e.target.value)}
                            placeholder="sk_test_..."
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Settings */}
            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Email Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure email delivery settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email_provider">Email Provider</Label>
                    <Select 
                      value={settings.email_provider} 
                      onValueChange={(value) => updateSetting('email_provider', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smtp">SMTP</SelectItem>
                        <SelectItem value="sendgrid">SendGrid</SelectItem>
                        <SelectItem value="mailgun">Mailgun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {settings.email_provider === 'smtp' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="smtp_host">SMTP Host</Label>
                          <Input
                            id="smtp_host"
                            value={settings.smtp_host}
                            onChange={(e) => updateSetting('smtp_host', e.target.value)}
                            placeholder="smtp.gmail.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="smtp_port">SMTP Port</Label>
                          <Input
                            id="smtp_port"
                            type="number"
                            value={settings.smtp_port}
                            onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
                            placeholder="587"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="smtp_username">SMTP Username</Label>
                          <Input
                            id="smtp_username"
                            value={settings.smtp_username}
                            onChange={(e) => updateSetting('smtp_username', e.target.value)}
                            placeholder="your-email@gmail.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="smtp_password">SMTP Password</Label>
                          <Input
                            id="smtp_password"
                            type="password"
                            value={settings.smtp_password}
                            onChange={(e) => updateSetting('smtp_password', e.target.value)}
                            placeholder="your-app-password"
                          />
                        </div>
                      </div>

                      <Button onClick={testEmailConnection} variant="outline">
                        Test Email Connection
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Settings */}
            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    AI Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure AI providers and API keys
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="ai_provider">Primary AI Provider</Label>
                    <Select 
                      value={settings.ai_provider} 
                      onValueChange={(value) => updateSetting('ai_provider', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                        <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="openai_api_key">OpenAI API Key</Label>
                    <Input
                      id="openai_api_key"
                      type="password"
                      value={settings.openai_api_key}
                      onChange={(e) => updateSetting('openai_api_key', e.target.value)}
                      placeholder="sk-..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="anthropic_api_key">Anthropic API Key</Label>
                    <Input
                      id="anthropic_api_key"
                      type="password"
                      value={settings.anthropic_api_key}
                      onChange={(e) => updateSetting('anthropic_api_key', e.target.value)}
                      placeholder="sk-ant-..."
                    />
                  </div>

                  <Button onClick={testAIConnection} variant="outline">
                    Test AI Connection
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="w-5 h-5 mr-2" />
                    Theme & Appearance
                  </CardTitle>
                  <CardDescription>
                    Customize the look and feel of your platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="theme_primary_color">Primary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="theme_primary_color"
                          type="color"
                          value={settings.theme_primary_color}
                          onChange={(e) => updateSetting('theme_primary_color', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          value={settings.theme_primary_color}
                          onChange={(e) => updateSetting('theme_primary_color', e.target.value)}
                          placeholder="#2563eb"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="theme_secondary_color">Secondary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="theme_secondary_color"
                          type="color"
                          value={settings.theme_secondary_color}
                          onChange={(e) => updateSetting('theme_secondary_color', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          value={settings.theme_secondary_color}
                          onChange={(e) => updateSetting('theme_secondary_color', e.target.value)}
                          placeholder="#7c3aed"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="custom_css">Custom CSS</Label>
                    <Textarea
                      id="custom_css"
                      value={settings.custom_css}
                      onChange={(e) => updateSetting('custom_css', e.target.value)}
                      placeholder="/* Add your custom CSS here */"
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Add custom CSS to override default styles
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Settings */}
            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    SEO & Analytics
                  </CardTitle>
                  <CardDescription>
                    Optimize your platform for search engines
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seo_title">SEO Title</Label>
                    <Input
                      id="seo_title"
                      value={settings.seo_title}
                      onChange={(e) => updateSetting('seo_title', e.target.value)}
                      placeholder="Your Platform - Tagline"
                    />
                  </div>

                  <div>
                    <Label htmlFor="seo_description">SEO Description</Label>
                    <Textarea
                      id="seo_description"
                      value={settings.seo_description}
                      onChange={(e) => updateSetting('seo_description', e.target.value)}
                      placeholder="Describe your platform for search engines"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="seo_keywords">SEO Keywords</Label>
                    <Input
                      id="seo_keywords"
                      value={settings.seo_keywords}
                      onChange={(e) => updateSetting('seo_keywords', e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Google Analytics</Label>
                      <p className="text-sm text-gray-500">
                        Enable Google Analytics tracking
                      </p>
                    </div>
                    <Switch
                      checked={settings.analytics_enabled}
                      onCheckedChange={(checked) => updateSetting('analytics_enabled', checked)}
                    />
                  </div>

                  {settings.analytics_enabled && (
                    <div>
                      <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                      <Input
                        id="google_analytics_id"
                        value={settings.google_analytics_id}
                        onChange={(e) => updateSetting('google_analytics_id', e.target.value)}
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageLayout>
  );
} 