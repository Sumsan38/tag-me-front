'use client';

import { CircleDot } from 'lucide-react';

export default function MindmapPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <CircleDot size={48} className="text-muted" />
      <h1 className="text-lg font-bold text-text">마인드맵</h1>
      <p className="text-sm text-sub">마인드맵 기능은 곧 구현됩니다.</p>
    </div>
  );
}
