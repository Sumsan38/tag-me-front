'use client';

import { BookOpen, FileText, Image, Heart, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { ContentResponse } from './types';

interface Props {
  item: ContentResponse;
  showTypeBadge?: boolean;
}

const TAG_COLORS = [
  { fg: '#5B5BD6', bg: '#EFEFFD' },
  { fg: '#C026D3', bg: '#FDF4FF' },
  { fg: '#0891B2', bg: '#ECFEFF' },
  { fg: '#059669', bg: '#ECFDF5' },
  { fg: '#EA580C', bg: '#FFF7ED' },
  { fg: '#7C3AED', bg: '#F5F3FF' },
];

function TagChip({ name, idx }: { name: string; idx: number }) {
  const { fg, bg } = TAG_COLORS[idx % TAG_COLORS.length];
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium"
      style={{ color: fg, backgroundColor: bg }}
    >
      #{name}
    </span>
  );
}

function formatDate(iso: string) {
  try {
    return format(new Date(iso), 'yyyy.MM.dd', { locale: ko });
  } catch {
    return iso;
  }
}

export default function ContentItemCard({ item, showTypeBadge = false }: Props) {
  const isDiary = item.type === 'DIARY';

  return (
    <button className="group w-full text-left px-4 py-3.5 hover:bg-[#FAFAF8] transition-colors border-b border-border last:border-0">
      <div className="flex items-start gap-2.5">
        {/* Type icon */}
        <div
          className="mt-0.5 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: isDiary ? '#EFF6FF' : '#F0FDF4',
            color: isDiary ? '#2563EB' : '#16A34A',
          }}
        >
          {isDiary ? <BookOpen size={12} /> : <FileText size={12} />}
        </div>

        <div className="flex-1 min-w-0">
          {/* Type badge (엣지 패널처럼 혼합 목록일 때) */}
          {showTypeBadge && (
            <span
              className="inline-block text-2xs font-semibold uppercase tracking-wider mb-1 px-1.5 py-0.5 rounded"
              style={{
                color: isDiary ? '#2563EB' : '#16A34A',
                backgroundColor: isDiary ? '#EFF6FF' : '#F0FDF4',
              }}
            >
              {isDiary ? '일기' : '게시글'}
            </span>
          )}

          {/* Snippet */}
          <p className="text-sm text-text line-clamp-2 leading-relaxed">
            {item.contentSnippet}
          </p>

          {/* Feed 전용: 이미지 인디케이터 + 좋아요 */}
          {!isDiary && item.imageUrls.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5 text-muted">
              <Image size={11} />
              <span className="text-2xs">{item.imageUrls.length}장</span>
              <span className="text-2xs mx-1">·</span>
              <Heart size={11} />
              <span className="text-2xs">{item.likeCount}</span>
            </div>
          )}
          {!isDiary && item.imageUrls.length === 0 && (
            <div className="flex items-center gap-1 mt-1.5 text-muted">
              <Heart size={11} />
              <span className="text-2xs">{item.likeCount}</span>
            </div>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.tags.slice(0, 4).map((tag, i) => (
                <TagChip key={tag} name={tag} idx={i} />
              ))}
              {item.tags.length > 4 && (
                <span className="text-2xs text-muted self-center">+{item.tags.length - 4}</span>
              )}
            </div>
          )}

          {/* Date */}
          <p className="text-2xs text-muted mt-1.5">
            {isDiary
              ? formatDate(item.diaryDateTime)
              : formatDate(item.createdAt)}
          </p>
        </div>

        <ExternalLink
          size={12}
          className="text-muted group-hover:text-sub transition-colors flex-shrink-0 mt-1"
        />
      </div>
    </button>
  );
}
