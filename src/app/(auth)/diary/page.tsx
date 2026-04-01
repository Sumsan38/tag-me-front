'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { MOOD_EMOJIS, MOOD_LABELS } from '@/constants/diary';

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
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  // 패널 상태
  const [panel, setPanel] = useState<DesktopPanel>(null);

  const { data, isLoading } = useMonthlyDiaries(year, month);

  // ---- 월 이동: 선택 초기화만 하고, 데이터 로드 후 자동 선택 ----
  function goToPrevMonth() {
    setPanel(null);
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else { setMonth((m) => m - 1); }
  }

  function goToNextMonth() {
    setPanel(null);
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else { setMonth((m) => m + 1); }
  }

  // ---- 월 데이터 로드 후 첫 번째 일기 자동 선택 ----
  useEffect(() => {
    if (isLoading || !data) return;
    if (panel !== null) return;
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
      ? MOOD_EMOJIS[Math.round(data.averageMood) - 1] ?? MOOD_EMOJIS[2]
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

  // ---- 생성 성공 핸들러 ----
  const handleCreated = useCallback((diaryId: number) => {
    setPanel({ mode: 'view', diaryId });
  }, []);

  // ---- 일기 쓰기 핸들러 ----
  const handleWriteClick = useCallback(() => {
    setPanel({ mode: 'create' });
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

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
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
      <div className="flex items-center justify-center gap-5 py-4">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
          aria-label="이전 달"
        >
          <ChevronLeft size={20} className="text-gray-400" />
        </button>
        <span className="text-sm font-semibold text-gray-800 tracking-tight min-w-[100px] text-center">
          {year}년 {month}월
        </span>
        <button
          type="button"
          onClick={goToNextMonth}
          className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
          aria-label="다음 달"
        >
          <ChevronRight size={20} className="text-gray-400" />
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
                const isToday = isSameDay(day, now);
                const isSelected = selectedDateStr === dateStr;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => {
                      if (!isCurrentMonth) return;
                      handleDateClick(dateStr, entry);
                    }}
                    className={`relative flex flex-col items-center justify-center rounded-lg py-1.5 text-xs transition-colors
                      ${!isCurrentMonth ? 'text-gray-200' : 'text-gray-600 cursor-pointer hover:bg-gray-50'}
                      ${isToday ? 'ring-1 ring-indigo-300' : ''}
                      ${isSelected ? 'bg-indigo-50 ring-1 ring-indigo-300' : ''}
                    `}
                  >
                    <span className={`text-[11px] leading-none ${isToday ? 'font-bold text-indigo-500' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {entry && isCurrentMonth && (
                      <span className="text-[10px] mt-0.5 leading-none">
                        {MOOD_EMOJIS[(entry.mood || 3) - 1]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 감정 범례 */}
            <div className="mt-3 pt-3 border-t border-gray-50">
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
            <DiaryPanel diaryId={panel.diaryId} onClose={handlePanelClose} />
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
              <p className="text-sm text-gray-400">달력에서 날짜를 선택하거나</p>
              <button
                type="button"
                onClick={() => setPanel({ mode: 'create' })}
                className="text-sm font-medium text-indigo-500 hover:text-indigo-600"
              >
                새 일기를 작성해보세요
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Write Button */}
      <button
        type="button"
        onClick={handleWriteClick}
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-[14px] bg-gray-800 text-white shadow-lg hover:bg-gray-700 transition-colors"
        aria-label="일기 쓰기"
      >
        <Plus size={22} strokeWidth={1.5} />
      </button>
    </div>
  );
}
