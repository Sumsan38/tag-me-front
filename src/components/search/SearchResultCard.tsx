'use client';

import Link from 'next/link';
import { BookOpen, MessageSquare } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

import Badge from '@/components/common/Badge';
import { ROUTES } from '@/constants/routes';
import type { SearchResult } from '@/types/search';
import { renderHighlightedFragment } from '@/utils/highlight';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SearchResultCardProps {
  result: SearchResult;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * 통합 검색 결과 카드.
 *
 * - 타입 아이콘으로 일기/피드를 구분한다.
 * - title은 FEED일 때 null이므로 본문 발췌의 첫 줄을 fallback으로 사용한다.
 * - highlights[]는 `<em>` 마크업을 포함한 HTML 조각이므로 renderHighlightedFragment로 안전 렌더한다.
 *   일치 발췌가 없을 때만 contentSnippet(평문)을 노출한다 — 두 데이터의 의미가 중복되기 때문.
 * - 클릭 시 타입에 따라 일기 상세 / 피드 상세로 이동한다.
 */
export default function SearchResultCard({ result }: SearchResultCardProps) {
  const isDiary = result.type === 'DIARY';

  const href = isDiary
    ? ROUTES.DIARY_DETAIL(String(result.id))
    : ROUTES.FEED_DETAIL(String(result.id));

  const fallbackTitle = isDiary ? '제목 없는 일기' : '제목 없는 게시글';
  const titleText = result.title?.trim() || fallbackTitle;

  const relativeTime = formatDistanceToNow(parseISO(result.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  const Icon = isDiary ? BookOpen : MessageSquare;
  const typeLabel = isDiary ? '일기' : '피드';

  return (
    <Link
      href={href}
      className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-[#FAFAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {/* Header: type + 작성일 */}
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <Icon size={14} aria-hidden="true" />
        <span className="font-medium">{typeLabel}</span>
        <span aria-hidden="true">·</span>
        <span>{relativeTime}</span>
      </div>

      {/* Title */}
      <h3 className="mt-1.5 text-sm font-semibold text-foreground line-clamp-1">
        {titleText}
      </h3>

      {/* 본문 발췌 (또는 하이라이팅 조각) */}
      {result.highlights.length > 0 ? (
        <ul className="mt-1 space-y-0.5">
          {result.highlights.map((fragment, idx) => (
            <li
              key={idx}
              className="text-xs text-sub line-clamp-2 leading-relaxed"
            >
              {renderHighlightedFragment(fragment)}
            </li>
          ))}
        </ul>
      ) : (
        result.contentSnippet && (
          <p className="mt-1 text-xs text-sub line-clamp-2 leading-relaxed">
            {result.contentSnippet}
          </p>
        )
      )}

      {/* 태그. Badge tag variant가 # prefix와 팔레트 색상을 자동 적용한다. */}
      {result.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1" role="list">
          {result.tags.map((tag, index) => (
            <Badge key={tag} variant="tag" label={tag} idx={index} sm />
          ))}
        </div>
      )}
    </Link>
  );
}
