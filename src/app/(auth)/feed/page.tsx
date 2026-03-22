'use client';

import { Home } from 'lucide-react';

export default function FeedPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <Home size={48} className="text-muted" />
      <h1 className="text-lg font-bold text-text">피드</h1>
      <p className="text-sm text-sub">피드 기능은 곧 구현됩니다.</p>
    </div>
  );
}
