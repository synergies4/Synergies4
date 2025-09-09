'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import PageLayout from '@/components/shared/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';

interface EnrollmentItem {
  id: string;
  status: string;
  progress_percentage: number;
  course: {
    id: string;
    title: string;
    category: string;
    level: string;
    short_desc?: string;
  };
}

export default function MyCoursesPage() {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          window.location.href = '/login?redirect=/courses/my';
          return;
        }

        const res = await fetch('/api/enrollments?page=1&per_page=100', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setEnrollments(data.enrollments || []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading your courses...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Courses</h1>

        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">You have no active enrollments yet.</p>
              <Button asChild className="mt-4">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {enrollments.map((e) => (
              <Card key={e.id} className="hover:shadow-lg transition">
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle>{e.course.title}</CardTitle>
                    <CardDescription>{e.course.short_desc || ''}</CardDescription>
                  </div>
                  <Badge>{e.status}</Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Progress: {e.progress_percentage || 0}%
                  </div>
                  <Button asChild>
                    <Link href={`/learn/${toSlug(e.course.title)}`}>
                      Continue <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}


