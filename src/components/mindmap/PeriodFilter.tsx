'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears } from 'date-fns';
import { ko } from 'date-fns/locale';

export type PeriodType = 'week' | 'month' | 'year';

interface Props {
  periodType: PeriodType;
  baseDate: Date;
  onPeriodTypeChange: (type: PeriodType) => void;
  onBaseDateChange: (date: Date) => void;
}

const TABS: { value: PeriodType; label: string }[] = [
  { value: 'week', label: '주' },
  { value: 'month', label: '월' },
  { value: 'year', label: '년' },
];

function formatLabel(periodType: PeriodType, date: Date): string {
  if (periodType === 'week') {
    return format(date, 'yyyy년 MM월 dd일 주간', { locale: ko });
  }
  if (periodType === 'month') {
    return format(date, 'yyyy년 MM월', { locale: ko });
  }
  return format(date, 'yyyy년', { locale: ko });
}

function prev(periodType: PeriodType, date: Date): Date {
  if (periodType === 'week') return subWeeks(date, 1);
  if (periodType === 'month') return subMonths(date, 1);
  return subYears(date, 1);
}

function next(periodType: PeriodType, date: Date): Date {
  if (periodType === 'week') return addWeeks(date, 1);
  if (periodType === 'month') return addMonths(date, 1);
  return addYears(date, 1);
}

export default function PeriodFilter({
  periodType,
  baseDate,
  onPeriodTypeChange,
  onBaseDateChange,
}: Props) {
  const isFuture = next(periodType, baseDate) > new Date();

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

      {/* 이전/다음 + 현재 기간 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onBaseDateChange(prev(periodType, baseDate))}
          className="w-7 h-7 flex items-center justify-center rounded-md text-sub hover:bg-border transition-colors"
          aria-label="이전 기간"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="text-sm font-semibold text-text min-w-[120px] text-center select-none">
          {formatLabel(periodType, baseDate)}
        </span>

        <button
          onClick={() => !isFuture && onBaseDateChange(next(periodType, baseDate))}
          disabled={isFuture}
          className="w-7 h-7 flex items-center justify-center rounded-md text-sub hover:bg-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="다음 기간"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
