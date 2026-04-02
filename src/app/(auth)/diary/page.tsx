'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
} from 'date-fns';

import DiaryPanel from '@/components/diary/DiaryPanel';
import DiaryCreatePanel from '@/components/diary/DiaryCreatePanel';
import { useMonthlyDiaries } from '@/hooks/useDiary';
import { MOOD_EMOJIS, MOOD_LABELS, MOOD_DEFAULT_INDEX, YEAR_MIN, YEAR_MAX, MONTH_LABELS } from '@/constants/diary';

// ---------------------------------------------------------------------------
// 상수
// ---------------------------------------------------------------------------

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

// ---------------------------------------------------------------------------
// 패널 상태 타입
// ---------------------------------------------------------------------------

type DesktopPanel =
  | { mode: 'view'; diaryId: number }
  | { mode: 'create'; date?: string }
  | { mode: 'empty'; date: string }
  | null;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DiaryListPage() {
  // 오늘 날짜를 안정적으로 캐싱 (자정 넘기 전까지 동일 참조)
  const today = useMemo(() => new Date(), []);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // 패널 상태
  const [panel, setPanel] = useState<DesktopPanel>(null);
  // 삭제 직후 auto-select를 1회 억제하기 위한 플래그
  const suppressAutoSelect = useRef(false);
  const yearPickerRef = useRef<HTMLDivElement>(null);
  const monthPickerRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useMonthlyDiaries(year, month);

  // ---- 드롭다운 외부 클릭 시 닫기 ----
  useEffect(() => {
    if (!showYearPicker && !showMonthPicker) return;
    function handleClickOutside(e: MouseEvent) {
      if (showYearPicker && yearPickerRef.current && !yearPickerRef.current.contains(e.target as Node)) {
        setShowYearPicker(false);
      }
      if (showMonthPicker && monthPickerRef.current && !monthPickerRef.current.contains(e.target as Node)) {
        setShowMonthPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showYearPicker, showMonthPicker]);

  // ---- 년도 드롭다운 열릴 때 현재 년도로 스크롤 ----
  useEffect(() => {
    if (showYearPicker && yearListRef.current) {
      const selected = yearListRef.current.querySelector('[aria-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: 'center' });
      }
    }
  }, [showYearPicker]);

  // ---- 년도 이동 ----
  const goToPrevYear = useCallback(() => {
    setPanel(null);
    setYear((y) => y - 1);
  }, []);

  const goToNextYear = useCallback(() => {
    setPanel(null);
    setYear((y) => y + 1);
  }, []);

  // ---- 월 이동: 선택 초기화만 하고, 데이터 로드 후 자동 선택 ----
  const goToPrevMonth = useCallback(() => {
    setPanel(null);
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else { setMonth((m) => m - 1); }
  }, [month]);

  const goToNextMonth = useCallback(() => {
    setPanel(null);
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else { setMonth((m) => m + 1); }
  }, [month]);

  // ---- 년도 선택 ----
  const handleYearSelect = useCallback((selectedYear: number) => {
    setPanel(null);
    setYear(selectedYear);
    setShowYearPicker(false);
  }, []);

  // ---- 월 선택 ----
  const handleMonthSelect = useCallback((selectedMonth: number) => {
    setPanel(null);
    setMonth(selectedMonth);
    setShowMonthPicker(false);
  }, []);

  // ---- 월 데이터 로드 후 첫 번째 일기 자동 선택 ----
  useEffect(() => {
    if (isLoading || !data) return;
    if (panel !== null) return;
    if (suppressAutoSelect.current) {
      suppressAutoSelect.current = false;
      return;
    }
    if (data.diaries.length > 0) {
      setPanel({ mode: 'view', diaryId: data.diaries[0].id });
    }
  }, [isLoading, data, panel]);

  // ---- 캘린더 날짜 그리드 ----
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(monthStart);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [year, month]);

  // ---- 날짜별 일기 매핑 ----
  const diaryByDate = useMemo(() => {
    const map = new Map<string, { mood: number; id: number }>();
    if (data?.diaries) {
      for (const d of data.diaries) {
        map.set(d.date, { mood: d.mood, id: d.id });
      }
    }
    return map;
  }, [data]);

  // ---- 평균 기분 ----
  const averageMoodEmoji =
    data && data.averageMood > 0
      ? MOOD_EMOJIS[Math.round(data.averageMood) - 1] ?? MOOD_EMOJIS[MOOD_DEFAULT_INDEX]
      : null;

  // ---- 날짜 클릭 핸들러 ----
  const handleDateClick = useCallback(
    (dateStr: string, entry: { mood: number; id: number } | undefined) => {
      if (entry) {
        setPanel({ mode: 'view', diaryId: entry.id });
      } else {
        setPanel({ mode: 'empty', date: dateStr });
      }
    },
    [],
  );

  // ---- 패널 닫기 ----
  const handlePanelClose = useCallback(() => {
    setPanel(null);
  }, []);

  // ---- 삭제 후 패널 닫기 (auto-select 억제) ----
  const handleDeleted = useCallback(() => {
    suppressAutoSelect.current = true;
    setPanel(null);
  }, []);

  // ---- 생성 성공 핸들러 ----
  const handleCreated = useCallback((diaryId: number) => {
    setPanel({ mode: 'view', diaryId });
  }, []);


  // 현재 선택된 날짜 (달력 하이라이트용)
  const selectedDateStr = useMemo(() => {
    if (panel?.mode === 'empty') return panel.date;
    if (panel?.mode === 'view' && data?.diaries) {
      const found = data.diaries.find((d) => d.id === panel.diaryId);
      return found?.date ?? null;
    }
    return null;
  }, [panel, data]);

  // ---- 년도 목록 ----
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = YEAR_MAX; y >= YEAR_MIN; y--) {
      years.push(y);
    }
    return years;
  }, []);

  return (
    <div className="min-h-full bg-[#FAFAF8]">
      {/* Header */}
      <header className="bg-white px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">일기</h1>
          {averageMoodEmoji && data && (
            <div className="flex items-center gap-1.5">
              <span className="text-base">{averageMoodEmoji}</span>
              <span className="text-xs text-gray-400">
                평균 기분 {data.averageMood.toFixed(1)}점
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Month Selector */}
      <div className="flex items-center justify-center gap-2 py-4">
        <button
          type="button"
          onClick={goToPrevYear}
          className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
          aria-label="이전 년도"
        >
          <ChevronsLeft size={20} className="text-gray-400" />
        </button>
        <button
          type="button"
          onClick={goToPrevMonth}
          className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
          aria-label="이전 달"
        >
          <ChevronLeft size={20} className="text-gray-400" />
        </button>

        <div className="flex items-center gap-0.5 text-sm font-semibold text-gray-800 tracking-tight text-center">
          {/* 년도 선택 */}
          <div className="relative" ref={yearPickerRef}>
            <button
              type="button"
              onClick={() => { setShowYearPicker((prev) => !prev); setShowMonthPicker(false); }}
              className="hover:text-indigo-600 hover:bg-indigo-50 px-1.5 py-0.5 rounded-md transition-colors"
              aria-label="년도 선택"
              aria-expanded={showYearPicker}
              aria-haspopup="listbox"
            >
              {year}년
            </button>

            {showYearPicker && (
              <div
                ref={yearListRef}
                role="listbox"
                aria-label="년도 선택"
                className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-20 max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg py-1 min-w-[80px]"
              >
                {yearOptions.map((y) => (
                  <button
                    key={y}
                    type="button"
                    role="option"
                    aria-selected={y === year}
                    onClick={() => handleYearSelect(y)}
                    className={`w-full px-3 py-1.5 text-sm text-center transition-colors ${
                      y === year
                        ? 'bg-indigo-50 text-indigo-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 월 선택 */}
          <div className="relative" ref={monthPickerRef}>
            <button
              type="button"
              onClick={() => { setShowMonthPicker((prev) => !prev); setShowYearPicker(false); }}
              className="hover:text-indigo-600 hover:bg-indigo-50 px-1.5 py-0.5 rounded-md transition-colors"
              aria-label="월 선택"
              aria-expanded={showMonthPicker}
              aria-haspopup="listbox"
            >
              {month}월
            </button>

            {showMonthPicker && (
              <div
                role="listbox"
                aria-label="월 선택"
                className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-20 rounded-lg border border-gray-200 bg-white shadow-lg py-1 min-w-[64px]"
              >
                {MONTH_LABELS.map((label, idx) => {
                  const m = idx + 1;
                  return (
                    <button
                      key={m}
                      type="button"
                      role="option"
                      aria-selected={m === month}
                      onClick={() => handleMonthSelect(m)}
                      className={`w-full px-3 py-1.5 text-sm text-center transition-colors ${
                        m === month
                          ? 'bg-indigo-50 text-indigo-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={goToNextMonth}
          className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
          aria-label="다음 달"
        >
          <ChevronRight size={20} className="text-gray-400" />
        </button>
        <button
          type="button"
          onClick={goToNextYear}
          className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
          aria-label="다음 년도"
        >
          <ChevronsRight size={20} className="text-gray-400" />
        </button>
      </div>

      {/* 반응형: 데스크톱 = 달력 + 작업 패널 / 모바일 = 달력 + 목록 */}
      <div className="px-4 pb-24 lg:flex lg:gap-6 lg:px-6">
        {/* Calendar */}
        <div className="mb-4 lg:mb-0 lg:w-[340px] lg:flex-shrink-0">
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-[11px] font-medium text-gray-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const entry = diaryByDate.get(dateStr);
                const isCurrentMonth = isSameMonth(day, new Date(year, month - 1));
                const isToday = isSameDay(day, today);
                const isSelected = selectedDateStr === dateStr;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => {
                      if (!isCurrentMonth) return;
                      handleDateClick(dateStr, entry);
                    }}
                    disabled={!isCurrentMonth}
                    aria-label={format(day, 'yyyy년 M월 d일')}
                    aria-current={isToday ? 'date' : undefined}
                    className={`relative flex flex-col items-center justify-center rounded-lg py-1.5 text-xs transition-colors
                      ${!isCurrentMonth ? 'text-gray-200 cursor-default' : 'text-gray-600 cursor-pointer hover:bg-gray-50'}
                      ${isSelected ? 'bg-indigo-50 ring-1 ring-indigo-400' : ''}
                    `}
                  >
                    <span className={`text-[11px] leading-none ${isToday && !isSelected ? 'font-bold text-indigo-500' : ''} ${isSelected ? 'font-bold text-indigo-600' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {entry && isCurrentMonth ? (
                      <span className="text-[10px] mt-0.5 leading-none">
                        {MOOD_EMOJIS[(entry.mood || 3) - 1]}
                      </span>
                    ) : isToday && isCurrentMonth ? (
                      <span className="mt-0.5 h-1 w-1 rounded-full bg-indigo-400" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* 감정 범례 */}
            <div className="mt-3 pt-3 border-t border-gray-50" role="note" aria-label="감정 범례">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {MOOD_EMOJIS.map((emoji, idx) => (
                  <div key={idx} className="flex items-center gap-0.5">
                    <span className="text-[10px]">{emoji}</span>
                    <span className="text-[10px] text-gray-400">
                      {MOOD_LABELS[idx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* 우측 패널 (모바일에서는 달력 아래로) */}
        <div className="flex-1 min-w-0">
          {panel?.mode === 'create' ? (
            <DiaryCreatePanel
              defaultDate={panel.date}
              onCreated={handleCreated}
              onCancel={handlePanelClose}
            />
          ) : panel?.mode === 'view' ? (
            <DiaryPanel diaryId={panel.diaryId} onClose={handlePanelClose} onDeleted={handleDeleted} />
          ) : panel?.mode === 'empty' ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center rounded-xl border border-gray-100 bg-white">
              <p className="text-3xl">📝</p>
              <p className="text-sm text-gray-500">
                {panel.date.replace(/-/g, '. ')}
              </p>
              <p className="text-sm text-gray-400">이 날에 작성한 일기가 없어요</p>
              <button
                type="button"
                onClick={() => setPanel({ mode: 'create', date: panel.date })}
                className="mt-2 text-sm font-medium text-indigo-500 hover:text-indigo-600"
              >
                일기 쓰러 가기
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center rounded-xl border border-dashed border-gray-200 bg-white">
              <p className="text-3xl">📖</p>
              <p className="text-sm text-gray-400">달력에서 날짜를 선택해 주세요</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
