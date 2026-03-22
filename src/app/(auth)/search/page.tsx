'use client';

import { Search } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <Search size={48} className="text-muted" />
      <h1 className="text-lg font-bold text-text">검색</h1>
      <p className="text-sm text-sub">검색 기능은 곧 구현됩니다.</p>
    </div>
  );
}
