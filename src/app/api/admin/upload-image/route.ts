import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = (formData.get('userId') as string) || 'public';

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `course-images/${userId}/${fileName}`;

    const { error } = await supabase.storage.from('synergies4').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) {
      return NextResponse.json({ message: `Upload failed: ${error.message}` }, { status: 500 });
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/synergies4/${filePath}`;
    return NextResponse.json({ url: publicUrl, path: filePath }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Internal error' }, { status: 500 });
  }
}


