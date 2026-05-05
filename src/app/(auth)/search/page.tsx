'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

import Spinner from '@/components/common/Spinner';
import SearchResultCard from '@/components/search/SearchResultCard';
import { useSearch, useSearchAutocomplete } from '@/hooks/useSearch';
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
  // 입력 중 상태
  const [input, setInput] = useState('');
  // 실제 검색 트리거 키워드 (엔터/제안 클릭 시 input → submitted 복사)
  const [submitted, setSubmitted] = useState('');
  const [activeType, setActiveType] = useState<SearchType>('ALL');

  // 기간 필터 (yyyy-MM-dd, date input 값)
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // 자동완성 디바운싱
  const [debouncedInput, setDebouncedInput] = useState('');
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedInput(input);
    }, AUTOCOMPLETE_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [input]);

  // 자동완성 드롭다운 표시 여부 (포커스 + 입력 존재 시).
  // blur가 발생해도 relatedTarget이 자동완성 컨테이너 내부면 닫지 않는다 — setTimeout
  // 트릭을 쓰지 않으므로 unmount 시 누수가 발생하지 않는다.
  const [isInputFocused, setIsInputFocused] = useState(false);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const showAutocomplete = isInputFocused && debouncedInput.trim().length > 0;

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
    }),
    [submitted, activeType, fromDate, toDate],
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
    commitSearch(name);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* ── 검색바 ───────────────────────────────────────── */}
      <form onSubmit={handleSubmit} role="search">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <Search size={16} aria-hidden="true" />
          </span>
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={handleSearchBlur}
            placeholder="검색어를 입력하세요"
            aria-label="검색어"
            className="w-full rounded-full border border-border bg-surface py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
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
                autocompleteQuery.data.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    role="option"
                    aria-selected="false"
                    onClick={() => handleSelectSuggestion(item.name)}
                    className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-[#FAFAF8]"
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

        <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          aria-expanded={filterOpen}
          aria-controls="search-filter-panel"
          className="ml-auto self-center text-xs text-sub hover:text-foreground"
        >
          {filterOpen ? '필터 닫기' : '필터 열기'}
        </button>
      </div>

      {/* ── 필터 패널 (기간만 1차 구현, 태그/작성자는 후속) ── */}
      {filterOpen && (
        <div
          id="search-filter-panel"
          className="mt-3 rounded-lg border border-border bg-surface p-3 text-xs"
        >
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5">
              <span className="text-sub">시작일</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
              />
            </label>
            <span className="text-muted" aria-hidden="true">~</span>
            <label className="flex items-center gap-1.5">
              <span className="text-sub">종료일</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
              />
            </label>
            {(fromDate || toDate) && (
              <button
                type="button"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
                className="ml-auto text-xs text-sub hover:text-foreground"
              >
                기간 초기화
              </button>
            )}
          </div>
          <p className="mt-2 text-[11px] text-muted">
            태그·작성자 필터는 후속 업데이트로 추가됩니다.
          </p>
        </div>
      )}

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
