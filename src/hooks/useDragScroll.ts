import { useRef, useCallback } from 'react';

/** 드래그 스크롤 훅. direction으로 수평/수직을 선택한다 (기본값: horizontal). */
export function useDragScroll(direction: 'horizontal' | 'vertical' = 'horizontal') {
  const ref = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef(0);
  const scrollStart = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    isDragging.current = true;
    if (direction === 'horizontal') {
      startPos.current = e.pageX - ref.current.offsetLeft;
      scrollStart.current = ref.current.scrollLeft;
    } else {
      startPos.current = e.pageY - ref.current.offsetTop;
      scrollStart.current = ref.current.scrollTop;
    }
    ref.current.style.cursor = 'grabbing';
    ref.current.style.userSelect = 'none';
  }, [direction]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !ref.current) return;
    e.preventDefault();
    if (direction === 'horizontal') {
      const x = e.pageX - ref.current.offsetLeft;
      ref.current.scrollLeft = scrollStart.current - (x - startPos.current);
    } else {
      const y = e.pageY - ref.current.offsetTop;
      ref.current.scrollTop = scrollStart.current - (y - startPos.current);
    }
  }, [direction]);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    if (!ref.current) return;
    ref.current.style.cursor = '';
    ref.current.style.userSelect = '';
  }, []);

  return { ref, onMouseDown, onMouseMove, onMouseUp, onMouseLeave: onMouseUp };
}
