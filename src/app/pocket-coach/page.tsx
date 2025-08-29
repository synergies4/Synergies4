'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PocketCoachPage() {
  const router = useRouter();

  useEffect(() => {
    // Temporary redirect while Pocket Coach is shelved
    router.replace('/synergize?view=chat');
  }, [router]);

  return null;
}