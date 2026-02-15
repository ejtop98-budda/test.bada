// app/page.tsx

'use client';

import { Dashboard } from '@/components/Dashboard';

export default function Home() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="h-full w-full">
        <Dashboard />
      </div>
    </main>
  );
}
