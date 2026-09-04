'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/infrastructure/http/session-storage';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getAccessToken() ? '/dashboard' : '/login');
  }, [router]);

  return null;
}
