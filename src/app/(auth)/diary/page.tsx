'use client';

import { BookOpen } from 'lucide-react';

export default function DiaryPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <BookOpen size={48} className="text-muted" />
      <h1 className="text-lg font-bold text-text">일기</h1>
      <p className="text-sm text-sub">일기 기능은 곧 구현됩니다.</p>
    </div>
  );
}
