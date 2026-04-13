'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  urls: string[];
}

export default function ImageCarousel({ urls }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => {
    setCurrent((i) => (i === 0 ? urls.length - 1 : i - 1));
  }, [urls.length]);

  const next = useCallback(() => {
    setCurrent((i) => (i === urls.length - 1 ? 0 : i + 1));
  }, [urls.length]);

  if (urls.length === 0) return null;

  // 이미지 1장이면 캐러셀 불필요
  if (urls.length === 1) {
    return (
      <div className="rounded-2xl overflow-hidden border border-gray-100 mb-4 max-w-[320px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={urls[0]}
          alt="이미지 1"
          className="w-full object-cover max-h-[280px]"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="mb-4 max-w-[320px]">
      {/* 슬라이드 영역 */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-100">
        {/* 이미지 */}
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {urls.map((url, i) => (
            <div
              key={i}
              className="w-full shrink-0 overflow-hidden bg-gray-100"
              style={{ height: '240px' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`이미지 ${i + 1}`}
                className="w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>

        {/* 좌우 화살표 */}
        {current > 0 && (
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            aria-label="이전 이미지"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {current < urls.length - 1 && (
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            aria-label="다음 이미지"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* 인덱스 뱃지 (우측 상단) */}
        <span className="absolute top-2.5 right-3 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-semibold text-white tabular-nums">
          {current + 1} / {urls.length}
        </span>
      </div>

      {/* 점 인디케이터 */}
      <div className="flex justify-center gap-1.5 mt-2">
        {urls.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={[
              'rounded-full transition-all',
              i === current
                ? 'bg-gray-800 w-4 h-1.5'
                : 'bg-gray-300 w-1.5 h-1.5',
            ].join(' ')}
            aria-label={`이미지 ${i + 1}로 이동`}
          />
        ))}
      </div>
    </div>
  );
}
