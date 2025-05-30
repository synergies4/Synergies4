import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            category: true,
            level: true,
            duration: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    return NextResponse.json({ enrollments });
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 