'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import PageLayout from '@/components/shared/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Loader2 } from 'lucide-react';

interface EnrollmentRow {
  id: string;
  status: string;
  progress_percentage: number;
  user: { id: string; email: string; name?: string };
}

export default function AdminCourseEnrollments({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [courseTitle, setCourseTitle] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          window.location.href = '/login?redirect=' + encodeURIComponent(`/admin/courses/${id}/enrollments`);
          return;
        }

        // basic auth guard by calling an admin-only endpoint if available later

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
          const rows: EnrollmentRow[] = (data.enrollments || []).map((e: any) => ({
            id: e.id,
            status: e.status,
            progress_percentage: e.progress_percentage || 0,
            user: {
              id: e.user?.id,
              email: e.user?.email,
              name: e.user?.name,
            },
          }));
          setEnrollments(rows);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
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
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Enrollments</h1>
            <p className="text-gray-600">{courseTitle}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/courses">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
            </Link>
          </Button>
        </div>

        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No enrollments yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((e) => (
              <Card key={e.id}>
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{e.user.name || e.user.email}</CardTitle>
                    <CardDescription>{e.user.email}</CardDescription>
                  </div>
                  <Badge>{e.status}</Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Progress: {e.progress_percentage}%</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}


