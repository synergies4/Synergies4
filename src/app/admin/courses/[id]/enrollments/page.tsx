'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import PageLayout from '@/components/shared/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Users, Loader2, Search, Download, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface EnrollmentRow {
  id: string;
  status: string;
  progress_percentage: number;
  enrolled_at: string;
  completed_at?: string;
  certificate_issued: boolean;
  payment_status: string;
  payment_amount: number;
  user: { 
    id: string; 
    email: string; 
    name?: string;
    role?: string;
    created_at?: string;
  };
  course: {
    id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    duration: string;
    price: number;
  };
}

export default function AdminCourseEnrollments({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || userProfile?.role !== 'ADMIN') {
      router.push(`/login?redirect=/admin/courses/${id}/enrollments`);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          window.location.href = '/login?redirect=' + encodeURIComponent(`/admin/courses/${id}/enrollments`);
          return;
        }

        // fetch course for title
        const courseRes = await fetch(`/api/courses?id=${id}`);
        if (courseRes.ok) {
          const c = await courseRes.json();
          setCourseTitle(c.courses?.[0]?.title || 'Course');
        }

        const res = await fetch(`/api/enrollments?course_id=${id}&page=1&per_page=500`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const rows: EnrollmentRow[] = (data.enrollments || []).map((e: {
            id: string;
            status: string;
            progress_percentage: number;
            enrolled_at: string;
            completed_at?: string;
            certificate_issued: boolean;
            payment_status: string;
            payment_amount: number;
            user?: {
              id: string;
              email: string;
              name?: string;
              role?: string;
              created_at?: string;
            };
            course?: {
              id: string;
              title: string;
              description: string;
              category: string;
              level: string;
              duration: string;
              price: number;
            };
          }) => ({
            id: e.id,
            status: e.status,
            progress_percentage: e.progress_percentage || 0,
            enrolled_at: e.enrolled_at,
            completed_at: e.completed_at,
            certificate_issued: e.certificate_issued || false,
            payment_status: e.payment_status,
            payment_amount: e.payment_amount || 0,
            user: {
              id: e.user?.id,
              email: e.user?.email,
              name: e.user?.name,
              role: e.user?.role,
              created_at: e.user?.created_at,
            },
            course: e.course || {
              id: id,
              title: courseTitle,
              description: '',
              category: '',
              level: '',
              duration: '',
              price: 0,
            },
          }));
          setEnrollments(rows);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user, userProfile, authLoading, router, courseTitle]);

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter enrollments
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = 
      enrollment.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || enrollment.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPayment = paymentFilter === 'all' || enrollment.payment_status.toLowerCase() === paymentFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Export functionality
  const exportToCSV = async () => {
    if (filteredEnrollments.length === 0) {
      return;
    }
    
    setExporting(true);
    try {
      const csvData = filteredEnrollments.map(enrollment => ({
        'Student Name': enrollment.user.name || 'No name',
        'Email': enrollment.user.email,
        'Status': enrollment.status,
        'Progress (%)': enrollment.progress_percentage,
        'Payment Status': enrollment.payment_status,
        'Amount Paid': enrollment.payment_amount,
        'Enrolled Date': formatDate(enrollment.enrolled_at),
        'Completed Date': enrollment.completed_at ? formatDate(enrollment.completed_at) : 'Not completed',
        'Certificate Issued': enrollment.certificate_issued ? 'Yes' : 'No',
        'User ID': enrollment.user.id,
        'Enrollment ID': enrollment.id,
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${courseTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_enrollments.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading enrollments...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-teal-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-teal-700 bg-clip-text text-transparent">
                    Course Enrollments
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">{courseTitle}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Button 
                  onClick={exportToCSV}
                  disabled={exporting || filteredEnrollments.length === 0}
                  variant="outline" 
                  className="bg-white/80 border-teal-200 hover:bg-teal-50 text-sm"
                >
                  {exporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Export CSV
                </Button>
                <Button asChild variant="outline" className="bg-white/80 border-teal-200 hover:bg-teal-50 text-sm">
                  <Link href={`/admin/courses/${id}`}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Edit Course
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-white/80 border-teal-200 hover:bg-teal-50 text-sm">
                  <Link href="/admin/courses">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Courses
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Total Enrollments</CardTitle>
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-3xl font-bold text-gray-900">{enrollments.length}</div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Students enrolled</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-3xl font-bold text-gray-900">
                  {enrollments.filter(e => e.status === 'COMPLETED').length}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Finished course</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Active</CardTitle>
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-3xl font-bold text-gray-900">
                  {enrollments.filter(e => e.status === 'ACTIVE').length}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Currently learning</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-3xl font-bold text-gray-900">
                  {formatCurrency(enrollments.reduce((sum, e) => sum + e.payment_amount, 0))}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Total earned</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 border-teal-200 focus:border-teal-400"
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-white/80 border-teal-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-white/80 border-teal-200">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Enrollments List */}
          {filteredEnrollments.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {enrollments.length === 0 ? 'No enrollments yet' : 'No matching enrollments'}
                </h3>
                <p className="text-gray-600">
                  {enrollments.length === 0 
                    ? 'No students have enrolled in this course yet.' 
                    : 'Try adjusting your search or filters.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEnrollments.map((enrollment) => (
                <Card key={enrollment.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {enrollment.user.name?.charAt(0).toUpperCase() || enrollment.user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{enrollment.user.name || 'No name'}</h3>
                          <p className="text-sm text-gray-600">{enrollment.user.email}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              Enrolled: {formatDate(enrollment.enrolled_at)}
                            </span>
                            {enrollment.user.role && (
                              <span className="text-xs text-gray-500">
                                Role: {enrollment.user.role}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {enrollment.progress_percentage}%
                          </div>
                          <div className="text-xs text-gray-500">Progress</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(enrollment.payment_amount)}
                          </div>
                          <div className="text-xs text-gray-500">Paid</div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs ${getStatusColor(enrollment.status)}`}>
                              {enrollment.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs ${getPaymentStatusColor(enrollment.payment_status)}`}>
                              {enrollment.payment_status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Course Progress</span>
                        <span>{enrollment.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${enrollment.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Additional Details */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Certificate:</span>
                          <span className="ml-2 font-medium">
                            {enrollment.certificate_issued ? 'Issued' : 'Not issued'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Completed:</span>
                          <span className="ml-2 font-medium">
                            {enrollment.completed_at ? formatDate(enrollment.completed_at) : 'Not completed'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">User ID:</span>
                          <span className="ml-2 font-medium text-xs font-mono">
                            {enrollment.user.id}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Enrollment ID:</span>
                          <span className="ml-2 font-medium text-xs font-mono">
                            {enrollment.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </PageLayout>
  );
}


