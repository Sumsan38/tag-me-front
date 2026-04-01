'use client';

import { format, parseISO } from 'date-fns';
import type { DiaryResponse } from '@/types/diary';
import { MOOD_EMOJIS } from '@/constants/diary';
import { TAG_PALETTE_CLASSES } from '@/constants/tag';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DiaryCardProps {
  diary: DiaryResponse;
  onClick?: () => void;
}

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

function formatDiaryDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'yyyy. MM. dd  EEE').toUpperCase();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DiaryCard({ diary, onClick }: DiaryCardProps) {
  const moodEmoji = MOOD_EMOJIS[(diary.mood || 1) - 1] ?? MOOD_EMOJIS[2];

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="cursor-pointer rounded-xl border border-gray-100 bg-white
        p-[14px_16px] transition-colors hover:border-gray-200"
    >
      {/* 상단: 날짜 + 감정 */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {formatDiaryDate(diary.date)}
        </span>
        <span className="text-base">{moodEmoji}</span>
      </div>

      {/* 제목 */}
      <h3 className="mb-1.5 text-sm font-semibold tracking-tight text-gray-900">
        {diary.title}
      </h3>

      {/* 본문 미리보기 */}
      <p className="mb-2.5 text-sm leading-relaxed text-gray-500 line-clamp-2">
        {diary.content}
      </p>

      {/* 태그 칩 */}
      {diary.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {diary.tags.map((tag, index) => {
            const palette = TAG_PALETTE_CLASSES[index % TAG_PALETTE_CLASSES.length];
            return (
              <span
                key={tag.id}
                className={`rounded-md px-2 py-0.5 text-xs font-medium ${palette.bg} ${palette.fg}`}
              >
                #{tag.name}
              </span>
            );
          })}
        </div>
      )}
    </article>
  );
}
