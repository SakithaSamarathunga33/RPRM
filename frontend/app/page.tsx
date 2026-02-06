'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (localStorage.getItem('demo_mode') === 'true') {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);
  return null;
}
