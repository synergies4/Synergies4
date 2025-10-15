'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/shared/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users, BookOpen, Calendar, DollarSign } from 'lucide-react';

interface Enrollment {
  id: string;
  status: string;
  payment_status: string;
  payment_amount: number;
  enrolled_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    price: number;
  };
}

interface CourseEnrollmentSummary {
  course_id: string;
  course_title: string;
  course_price: number;
  total_enrollments: number;
  total_revenue: number;
  enrollments: Enrollment[];
}

export default function AdminEnrollmentsPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<CourseEnrollmentSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || !userProfile || userProfile.role !== 'ADMIN') {
      window.location.href = '/dashboard';
      return;
    }

    loadEnrollments();
  }, [user, userProfile, authLoading]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = (await import('@/lib/supabase/client')).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/admin/enrollments', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch enrollments');
      }

      const data = await response.json();
      setEnrollments(data.enrollments || []);
    } catch (err) {
      console.error('Error loading enrollments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'ACTIVE': 'default',
      'COMPLETED': 'secondary',
      'CANCELLED': 'destructive',
      'PAUSED': 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      'PAID': 'default',
      'PENDING': 'secondary',
      'FAILED': 'destructive',
      'REFUNDED': 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
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

  if (error) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadEnrollments}>Retry</Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Enrollments</h1>
            <p className="text-gray-600">View all enrollments across all courses</p>
          </div>
          <Button onClick={loadEnrollments} variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No enrollments found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {enrollments.map((courseSummary) => (
              <Card key={courseSummary.course_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{courseSummary.course_title}</CardTitle>
                      <p className="text-gray-600 mt-1">
                        {courseSummary.total_enrollments} enrollment{courseSummary.total_enrollments !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(courseSummary.total_revenue)}
                      </div>
                      <p className="text-sm text-gray-500">Total Revenue</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-semibold">Student</th>
                          <th className="text-left py-3 px-2 font-semibold">Email</th>
                          <th className="text-left py-3 px-2 font-semibold">Status</th>
                          <th className="text-left py-3 px-2 font-semibold">Payment</th>
                          <th className="text-left py-3 px-2 font-semibold">Amount</th>
                          <th className="text-left py-3 px-2 font-semibold">Enrolled</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseSummary.enrollments.map((enrollment) => (
                          <tr key={enrollment.id} className="border-b last:border-b-0">
                            <td className="py-3 px-2">
                              <div className="font-medium">{enrollment.user.name}</div>
                            </td>
                            <td className="py-3 px-2 text-gray-600">
                              {enrollment.user.email}
                            </td>
                            <td className="py-3 px-2">
                              {getStatusBadge(enrollment.status)}
                            </td>
                            <td className="py-3 px-2">
                              {getPaymentStatusBadge(enrollment.payment_status)}
                            </td>
                            <td className="py-3 px-2 font-medium">
                              {formatPrice(enrollment.payment_amount)}
                            </td>
                            <td className="py-3 px-2 text-gray-600">
                              {formatDate(enrollment.enrolled_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
