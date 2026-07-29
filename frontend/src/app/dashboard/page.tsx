'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/meetings');
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <p className="text-gray-600">Redirection…</p>
    </div>
  );
}
