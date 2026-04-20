'use client';

import { BookOpen, FileText, Heart, MessageCircle, HeartHandshake } from 'lucide-react';
import type { PrimarySource } from './MindmapVisualization';
import { SOURCE_STYLES } from './MindmapVisualization';

export type SourceFilterValue = 'all' | PrimarySource;

interface Props {
  value: SourceFilterValue;
  onChange: (value: SourceFilterValue) => void;
}

const FILTERS: {
  value: SourceFilterValue;
  label: string;
  icon?: React.ReactNode;
  style?: { fg: string; bg: string };
}[] = [
  { value: 'all', label: '전체' },
  {
    value: 'DIARY',
    label: '일기',
    icon: <BookOpen size={13} />,
    style: { fg: SOURCE_STYLES.DIARY.stroke, bg: '#EFF6FF' },
  },
  {
    value: 'FEED',
    label: '게시글',
    icon: <FileText size={13} />,
    style: { fg: SOURCE_STYLES.FEED.stroke, bg: '#F0FDF4' },
  },
  {
    value: 'LIKE',
    label: '좋아요',
    icon: <Heart size={13} />,
    style: { fg: SOURCE_STYLES.LIKE.stroke, bg: '#FFF1F2' },
  },
  {
    value: 'COMMENT',
    label: '댓글',
    icon: <MessageCircle size={13} />,
    style: { fg: SOURCE_STYLES.COMMENT.stroke, bg: '#FFFBEB' },
  },
  {
    value: 'COMMENT_LIKE',
    label: '댓글좋아요',
    icon: <HeartHandshake size={13} />,
    style: { fg: SOURCE_STYLES.COMMENT_LIKE.stroke, bg: '#F5F3FF' },
  },
];

export default function SourceFilter({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {FILTERS.map((f) => {
        const isActive = value === f.value;
        const style = f.style;
        return (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            className={[
              'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
              isActive
                ? 'shadow-sm scale-[1.03]'
                : 'bg-surface text-sub border-border hover:border-muted hover:text-text',
            ].join(' ')}
            style={
              isActive && style
                ? { backgroundColor: style.bg, color: style.fg, borderColor: style.fg + '55' }
                : isActive
                  ? { backgroundColor: '#1A1A18', color: '#fff', borderColor: '#1A1A18' }
                  : {}
            }
          >
            {f.icon && <span className="flex-shrink-0">{f.icon}</span>}
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
