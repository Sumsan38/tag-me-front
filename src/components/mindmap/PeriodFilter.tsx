'use client';

import { useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  format, parse,
  addDays, subDays, addWeeks, subWeeks,
  addMonths, subMonths, addYears, subYears,
  startOfWeek, endOfWeek,
} from 'date-fns';
import { ko } from 'date-fns/locale';

export type PeriodType = 'day' | 'week' | 'month' | 'year' | 'custom';

export interface CustomRange {
  from: Date;
  to: Date;
}

interface Props {
  periodType: PeriodType;
  baseDate: Date;
  onPeriodTypeChange: (type: PeriodType) => void;
  onBaseDateChange: (date: Date) => void;
  customRange?: CustomRange;
  onCustomRangeChange?: (range: CustomRange) => void;
}

const TABS: { value: PeriodType; label: string }[] = [
  { value: 'day',    label: '일' },
  { value: 'week',   label: '주' },
  { value: 'month',  label: '월' },
  { value: 'year',   label: '년' },
  { value: 'custom', label: '사용자 지정' },
];

function parseLocalDate(value: string): Date {
  return parse(value, 'yyyy-MM-dd', new Date());
}

function prevDate(periodType: PeriodType, date: Date): Date {
  if (periodType === 'day')   return subDays(date, 1);
  if (periodType === 'week')  return subWeeks(date, 1);
  if (periodType === 'month') return subMonths(date, 1);
  return subYears(date, 1);
}

function nextDate(periodType: PeriodType, date: Date): Date {
  if (periodType === 'day')   return addDays(date, 1);
  if (periodType === 'week')  return addWeeks(date, 1);
  if (periodType === 'month') return addMonths(date, 1);
  return addYears(date, 1);
}

function openPicker(ref: React.RefObject<HTMLInputElement | null>) {
  const el = ref.current;
  if (!el) return;
  if ('showPicker' in el) {
    (el as HTMLInputElement & { showPicker: () => void }).showPicker();
  } else {
    el.click();
  }
}

export default function PeriodFilter({
  periodType, baseDate,
  onPeriodTypeChange, onBaseDateChange,
  customRange, onCustomRangeChange,
}: Props) {
  const dayInputRef  = useRef<HTMLInputElement>(null);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef   = useRef<HTMLInputElement>(null);

  // 최신 콜백을 ref로 유지 (stale closure 방지)
  const onBaseDateChangeRef    = useRef(onBaseDateChange);
  const onCustomRangeChangeRef = useRef(onCustomRangeChange);
  const customRangeRef         = useRef(customRange);
  onBaseDateChangeRef.current    = onBaseDateChange;
  onCustomRangeChangeRef.current = onCustomRangeChange;
  customRangeRef.current         = customRange;

  // ref callback — input이 DOM에 마운트/언마운트될 때마다 이벤트 리스너 등록/해제
  const setDayRef = useCallback((el: HTMLInputElement | null) => {
    if (dayInputRef.current) {
      (dayInputRef.current as HTMLInputElement & { _changeHandler?: () => void })
        ._changeHandler && dayInputRef.current.removeEventListener(
          'change',
          (dayInputRef.current as HTMLInputElement & { _changeHandler?: () => void })._changeHandler!,
        );
    }
    (dayInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
    if (!el) return;
    const handler = () => {
      if (el.value) onBaseDateChangeRef.current(parseLocalDate(el.value));
    };
    (el as HTMLInputElement & { _changeHandler?: () => void })._changeHandler = handler;
    el.addEventListener('change', handler);
  }, []);

  const setFromRef = useCallback((el: HTMLInputElement | null) => {
    if (fromInputRef.current) {
      const h = (fromInputRef.current as HTMLInputElement & { _changeHandler?: () => void })._changeHandler;
      if (h) fromInputRef.current.removeEventListener('change', h);
    }
    (fromInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
    if (!el) return;
    const handler = () => {
      if (!el.value || !onCustomRangeChangeRef.current) return;
      const from = parseLocalDate(el.value);
      const to = customRangeRef.current?.to ?? from;
      onCustomRangeChangeRef.current({ from, to: from > to ? from : to });
    };
    (el as HTMLInputElement & { _changeHandler?: () => void })._changeHandler = handler;
    el.addEventListener('change', handler);
  }, []);

  const setToRef = useCallback((el: HTMLInputElement | null) => {
    if (toInputRef.current) {
      const h = (toInputRef.current as HTMLInputElement & { _changeHandler?: () => void })._changeHandler;
      if (h) toInputRef.current.removeEventListener('change', h);
    }
    (toInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
    if (!el) return;
    const handler = () => {
      if (!el.value || !onCustomRangeChangeRef.current) return;
      const to = parseLocalDate(el.value);
      onCustomRangeChangeRef.current({ from: customRangeRef.current?.from ?? to, to });
    };
    (el as HTMLInputElement & { _changeHandler?: () => void })._changeHandler = handler;
    el.addEventListener('change', handler);
  }, []);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const showNav = periodType !== 'custom';
  const isFuture = showNav && nextDate(periodType, baseDate) > today;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* 기간 타입 탭 */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onPeriodTypeChange(tab.value)}
            className={[
              'px-3 py-1.5 text-sm font-medium transition-colors',
              periodType === tab.value
                ? 'bg-text text-white'
                : 'bg-surface text-sub hover:bg-border',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 날짜 표시 / 네비게이션 */}
      <div className="flex items-center gap-1">
        {showNav && (
          <button
            onClick={() => onBaseDateChange(prevDate(periodType, baseDate))}
            className="w-7 h-7 flex items-center justify-center rounded-md text-sub hover:bg-border transition-colors"
            aria-label="이전 기간"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {/* 일: 버튼 클릭 → showPicker() */}
        {periodType === 'day' && (
          <>
            <button
              type="button"
              onClick={() => openPicker(dayInputRef)}
              className="flex items-center gap-1.5 text-sm font-semibold text-text px-2 py-1 rounded-md hover:bg-border transition-colors cursor-pointer select-none"
            >
              <Calendar size={13} className="text-muted flex-shrink-0" />
              {format(baseDate, 'yyyy.MM.dd (E)', { locale: ko })}
            </button>
            <input
              ref={setDayRef}
              type="date"
              className="sr-only"
              defaultValue={format(baseDate, 'yyyy-MM-dd')}
              max={todayStr}
            />
          </>
        )}

        {/* 주: MM.dd(요일) ~ MM.dd(요일) 단축 표시 */}
        {periodType === 'week' && (
          <span className="text-sm font-semibold text-text select-none px-1 whitespace-nowrap">
            {format(startOfWeek(baseDate, { weekStartsOn: 1 }), 'MM.dd(E)', { locale: ko })}
            {' ~ '}
            {format(endOfWeek(baseDate, { weekStartsOn: 1 }), 'MM.dd(E)', { locale: ko })}
          </span>
        )}

        {/* 월 */}
        {periodType === 'month' && (
          <span className="text-sm font-semibold text-text min-w-[100px] text-center select-none">
            {format(baseDate, 'yyyy년 MM월', { locale: ko })}
          </span>
        )}

        {/* 년 */}
        {periodType === 'year' && (
          <span className="text-sm font-semibold text-text min-w-[60px] text-center select-none">
            {format(baseDate, 'yyyy년', { locale: ko })}
          </span>
        )}

        {/* 사용자 지정: 시작일 ~ 종료일 각각 달력 */}
        {periodType === 'custom' && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => openPicker(fromInputRef)}
              className="flex items-center gap-1 text-sm font-semibold text-text px-2 py-1 rounded-md hover:bg-border transition-colors cursor-pointer select-none"
            >
              <Calendar size={13} className="text-muted flex-shrink-0" />
              <span>{customRange ? format(customRange.from, 'yyyy.MM.dd') : '시작일'}</span>
            </button>
            <input
              ref={setFromRef}
              type="date"
              className="sr-only"
              defaultValue={customRange ? format(customRange.from, 'yyyy-MM-dd') : ''}
              max={customRange ? format(customRange.to, 'yyyy-MM-dd') : todayStr}
            />

            <span className="text-muted text-sm">~</span>

            <button
              type="button"
              onClick={() => openPicker(toInputRef)}
              className="flex items-center gap-1 text-sm font-semibold text-text px-2 py-1 rounded-md hover:bg-border transition-colors cursor-pointer select-none"
            >
              <span>{customRange ? format(customRange.to, 'yyyy.MM.dd') : '종료일'}</span>
            </button>
            <input
              ref={setToRef}
              type="date"
              className="sr-only"
              defaultValue={customRange ? format(customRange.to, 'yyyy-MM-dd') : ''}
              min={customRange ? format(customRange.from, 'yyyy-MM-dd') : ''}
              max={todayStr}
            />
          </div>
        )}

        {showNav && (
          <button
            onClick={() => !isFuture && onBaseDateChange(nextDate(periodType, baseDate))}
            disabled={isFuture}
            className="w-7 h-7 flex items-center justify-center rounded-md text-sub hover:bg-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="다음 기간"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
