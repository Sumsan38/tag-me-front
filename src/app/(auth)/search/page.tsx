'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import Spinner from '@/components/common/Spinner';
import SearchResultCard from '@/components/search/SearchResultCard';
import TagInput from '@/components/tag/TagInput';
import { useSearch, useSearchAutocomplete } from '@/hooks/useSearch';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { getErrorMessage } from '@/api/error';
import type { SearchType } from '@/types/search';

// ---------------------------------------------------------------------------
// 탭 정의
// ---------------------------------------------------------------------------

/**
 * 탭 라벨과 백엔드 enum 값을 분리한다.
 * 백엔드 SearchType은 대문자 enum이므로 라벨 매핑을 통해 한글 UI를 보여준다.
 */
const TABS: ReadonlyArray<{ value: SearchType; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'DIARY', label: '일기' },
  { value: 'FEED', label: '피드' },
];

const AUTOCOMPLETE_DEBOUNCE_MS = 300;
const AUTOCOMPLETE_LIMIT = 8;

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

/**
 * `yyyy-MM-dd`(date input 값)를 백엔드가 기대하는 ISO-8601 Instant로 변환한다.
 *
 * 단순히 `T00:00:00Z`/`T23:59:59Z`를 붙이면 사용자의 로컬 자정과 UTC 자정이 어긋나
 * 검색 윈도우가 시간대만큼 비뚤어진다(예: KST 사용자가 5/5을 선택하면 실제로는
 * 5/5 09:00 ~ 5/6 08:59:59 KST를 검색하게 됨). 따라서 사용자가 선택한 날짜의
 * **로컬 자정/말단**을 Date로 만든 뒤 toISOString()으로 UTC Instant로 변환한다.
 *
 * end=true일 때 23:59:59.999로 매핑하여 마지막 ms가 누락되지 않도록 한다.
 * 비어있으면 undefined 반환.
 */
function toInstant(date: string, end = false): string | undefined {
  if (!date) return undefined;
  const [yearStr, monthStr, dayStr] = date.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return undefined;
  }
  const local = end
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);
  return local.toISOString();
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 입력 중 상태 — URL 파라미터로 초기값 복원
  const [input, setInput] = useState(() => searchParams.get('q') ?? '');
  // 실제 검색 트리거 키워드 (엔터/제안 클릭 시 input → submitted 복사)
  const [submitted, setSubmitted] = useState(() => searchParams.get('q') ?? '');
  const [activeType, setActiveType] = useState<SearchType>(() => {
    const t = searchParams.get('type');
    return (t === 'DIARY' || t === 'FEED' ? t : 'ALL') as SearchType;
  });

  // 기간 필터 (yyyy-MM-dd, date input 값)
  const [fromDate, setFromDate] = useState(() => searchParams.get('from') ?? '');
  const [toDate, setToDate] = useState(() => searchParams.get('to') ?? '');
  // 태그 필터 (URL 파라미터 복원 포함)
  const [filterTags, setFilterTags] = useState<string[]>(() => {
    const tagsParam = searchParams.get('tags');
    return tagsParam ? tagsParam.split(',').filter(Boolean) : [];
  });


  // 검색 상태를 URL에 동기화 — 뒤로가기 시 상태 복원을 위해 replace 사용
  useEffect(() => {
    const params = new URLSearchParams();
    if (submitted) params.set('q', submitted);
    if (activeType !== 'ALL') params.set('type', activeType);
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    if (filterTags.length > 0) params.set('tags', filterTags.join(','));
    const qs = params.toString();
    router.replace(`/search${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [submitted, activeType, fromDate, toDate, filterTags, router]);

  // 자동완성 디바운싱
  const debouncedInput = useDebouncedValue(input, AUTOCOMPLETE_DEBOUNCE_MS);

  // 자동완성 드롭다운 표시 여부 (포커스 + 입력 존재 시).
  // blur가 발생해도 relatedTarget이 자동완성 컨테이너 내부면 닫지 않는다 — setTimeout
  // 트릭을 쓰지 않으므로 unmount 시 누수가 발생하지 않는다.
  const [isInputFocused, setIsInputFocused] = useState(false);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const showAutocomplete = isInputFocused && debouncedInput.trim().length > 0;

  // 키보드 내비게이션 인덱스
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // debouncedInput이 바뀌면 하이라이트 초기화
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [debouncedInput]);

  function handleSearchBlur(e: React.FocusEvent<HTMLInputElement>) {
    const next = e.relatedTarget;
    if (next && autocompleteContainerRef.current?.contains(next)) {
      return;
    }
    setIsInputFocused(false);
  }

  const autocompleteQuery = useSearchAutocomplete(
    showAutocomplete ? debouncedInput : '',
    AUTOCOMPLETE_LIMIT,
  );

  // 검색 결과
  const filter = useMemo(
    () => ({
      q: submitted,
      type: activeType,
      from: toInstant(fromDate, false),
      to: toInstant(toDate, true),
      tags: filterTags.length > 0 ? filterTags : undefined,
    }),
    [submitted, activeType, fromDate, toDate, filterTags],
  );
  const searchQuery = useSearch(filter);

  const items = searchQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const totalLoaded = items.length;

  // ---- 무한 스크롤 ----
  const sentinelRef = useRef<HTMLDivElement>(null);
  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        searchQuery.hasNextPage &&
        !searchQuery.isFetchingNextPage
      ) {
        searchQuery.fetchNextPage();
      }
    },
    [searchQuery],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '200px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  // ---- 핸들러 ----
  function commitSearch(keyword: string) {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    setSubmitted(trimmed);
    setIsInputFocused(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    commitSearch(input);
  }

  function handleClear() {
    setInput('');
    setSubmitted('');
  }

  function handleSelectSuggestion(name: string) {
    setInput(name);
    setHighlightedIndex(-1);
    commitSearch(name);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* ── 필터 바 (항상 표시) ─────────────────────────── */}
      <div className="mb-4 overflow-hidden rounded-lg border border-border bg-surface text-xs">
        {/* 날짜 행 */}
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="shrink-0 text-sub">날짜</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
          />
          <span className="text-muted" aria-hidden="true">~</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
          />
          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={() => { setFromDate(''); setToDate(''); }}
              aria-label="기간 초기화"
              className="ml-auto text-muted hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>
        {/* 구분선 */}
        <div className="border-t border-border" />
        {/* 태그 행 */}
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="shrink-0 text-sub">태그</span>
          <div className="flex-1">
            <TagInput
              tags={filterTags}
              onChange={setFilterTags}
              placeholder="태그 필터"
              maxTags={5}
              id="search-tag-filter"
            />
          </div>
        </div>
      </div>

      {/* ── 검색바 ───────────────────────────────────────── */}
      <form onSubmit={handleSubmit} role="search">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <Search size={16} aria-hidden="true" />
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={handleSearchBlur}
            onKeyDown={(e) => {
              const suggestions = autocompleteQuery.data ?? [];
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (showAutocomplete && suggestions.length > 0) {
                  setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
                }
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIndex((prev) => Math.max(prev - 1, -1));
              } else if (e.key === 'Escape') {
                setIsInputFocused(false);
                setHighlightedIndex(-1);
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (showAutocomplete && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                  handleSelectSuggestion(suggestions[highlightedIndex].name);
                } else {
                  commitSearch(input);
                }
              }
            }}
            placeholder="검색어를 입력하세요"
            aria-label="검색어"
            aria-activedescendant={
              showAutocomplete && highlightedIndex >= 0
                ? `autocomplete-item-${highlightedIndex}`
                : undefined
            }
            className="w-full rounded-full border border-border bg-surface py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button type="submit" className="sr-only" tabIndex={-1}>검색</button>
          {input.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="검색어 지우기"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-border"
            >
              <X size={14} />
            </button>
          )}

          {/* 자동완성 드롭다운. ref로 연결해 blur 시 컨테이너 내부 포커스 이동을 인식한다. */}
          {showAutocomplete && (
            <div
              ref={autocompleteContainerRef}
              role="listbox"
              aria-label="검색어 추천"
              className="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-auto rounded-lg border border-border bg-surface shadow-lg"
            >
              {autocompleteQuery.isLoading ? (
                <div className="flex items-center justify-center py-3">
                  <Spinner size="sm" />
                </div>
              ) : autocompleteQuery.data && autocompleteQuery.data.length > 0 ? (
                autocompleteQuery.data.map((item, index) => (
                  <button
                    key={`${item.name}-${index}`}
                    id={`autocomplete-item-${index}`}
                    type="button"
                    role="option"
                    aria-selected={highlightedIndex === index}
                    onClick={() => handleSelectSuggestion(item.name)}
                    className={[
                      'block w-full px-3 py-2 text-left text-sm text-foreground',
                      highlightedIndex === index ? 'bg-[#FAFAF8]' : 'hover:bg-[#FAFAF8]',
                    ].join(' ')}
                  >
                    {item.name}
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-muted">추천 검색어가 없습니다</p>
              )}
            </div>
          )}
        </div>
      </form>

      {/* ── 탭 ───────────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="검색 대상"
        className="mt-4 flex gap-1 border-b border-border"
      >
        {TABS.map((t) => {
          const tabId = `search-tab-${t.value}`;
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              id={tabId}
              aria-selected={activeType === t.value}
              aria-controls="search-results-panel"
              onClick={() => setActiveType(t.value)}
              className={[
                'relative px-3 py-2 text-sm font-medium transition-colors',
                activeType === t.value ? 'text-foreground' : 'text-muted hover:text-sub',
              ].join(' ')}
            >
              {t.label}
              {activeType === t.value && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-foreground"
                />
              )}
            </button>
          );
        })}

      </div>


      {/* ── 결과 영역 ─────────────────────────────────────── */}
      {/*
        활성 탭의 tabpanel 역할. 각 탭의 aria-controls가 이 id를 참조한다.
        aria-live는 결과 카드 전체가 아니라 별도의 sr-only 상태 메시지에만 적용해
        스크린 리더 노이즈를 줄인다.
      */}
      <section
        id="search-results-panel"
        role="tabpanel"
        aria-labelledby={`search-tab-${activeType}`}
        className="mt-4 flex flex-col gap-2"
      >
        {/* 상태 변화 알림 (스크린 리더 전용). 카드 추가는 announce하지 않는다. */}
        <p role="status" aria-live="polite" className="sr-only">
          {!submitted
            ? '검색어 입력 대기'
            : searchQuery.isLoading
              ? '검색 결과를 불러오는 중'
              : searchQuery.isError
                ? '검색 결과를 불러오지 못했습니다'
                : totalLoaded === 0
                  ? '검색 결과가 없습니다'
                  : `검색 결과 ${totalLoaded}건`}
        </p>

        {/* 검색어 미입력 안내 */}
        {!submitted && (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <Search size={36} className="text-muted" aria-hidden="true" />
            <p className="text-sm text-sub">검색어를 입력해 주세요.</p>
            <p className="text-xs text-muted">
              일기(본인 전용)와 공개 피드를 함께 검색합니다.
            </p>
          </div>
        )}

        {/* 로딩 */}
        {submitted && searchQuery.isLoading && (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        )}

        {/* 에러 */}
        {submitted && searchQuery.isError && (
          <div className="rounded-lg border border-error-border bg-error-bg p-3 text-xs text-error">
            {getErrorMessage(searchQuery.error)}
          </div>
        )}

        {/* 결과 */}
        {submitted && !searchQuery.isLoading && items.map((result) => (
          <SearchResultCard
            key={`${result.type}-${result.id}`}
            result={result}
            query={submitted}
          />
        ))}

        {/* 빈 결과 */}
        {submitted && !searchQuery.isLoading && totalLoaded === 0 && !searchQuery.isError && (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-3xl" aria-hidden="true">🔍</p>
            <p className="text-sm text-sub">검색 결과가 없습니다</p>
            <p className="text-xs text-muted">다른 키워드나 필터를 사용해 보세요.</p>
          </div>
        )}

        {/* 추가 페이지 로딩 */}
        {searchQuery.isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        )}

        {/* 무한 스크롤 sentinel */}
        <div ref={sentinelRef} className="h-1" />
      </section>
    </div>
  );
}
