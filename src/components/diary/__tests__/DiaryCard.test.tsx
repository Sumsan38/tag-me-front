import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DiaryCard from '@/components/diary/DiaryCard';
import type { DiaryResponse } from '@/types/diary';

// ---------------------------------------------------------------------------
// 테스트 데이터
// ---------------------------------------------------------------------------

const MOCK_DIARY: DiaryResponse = {
  id: 1,
  userId: 10,
  title: '한강 산책',
  content:
    '오늘 한강을 걸었다. 이어폰 없이 걸었더니 생각이 정리됐다. 침묵이 가끔은 제일 좋은 것 같다.',
  mood: 4,
  tags: [
    { id: 1, name: '한강' },
    { id: 2, name: '산책' },
    { id: 3, name: '혼자' },
  ],
  date: '2026-04-01',
  createdAt: '2026-04-01T10:00:00',
  updatedAt: '2026-04-01T10:00:00',
};

// ---------------------------------------------------------------------------
// 테스트
// ---------------------------------------------------------------------------

describe('DiaryCard', () => {
  it('제목을 렌더링한다', () => {
    render(<DiaryCard diary={MOCK_DIARY} />);
    expect(screen.getByText('한강 산책')).toBeInTheDocument();
  });

  it('본문 미리보기를 렌더링한다', () => {
    render(<DiaryCard diary={MOCK_DIARY} />);
    expect(screen.getByText(MOCK_DIARY.content)).toBeInTheDocument();
  });

  it('날짜를 포맷팅하여 표시한다', () => {
    render(<DiaryCard diary={MOCK_DIARY} />);
    // 2026-04-01은 수요일 → "2026. 04. 01  WED"
    expect(screen.getByText(/2026\. 04\. 01/)).toBeInTheDocument();
  });

  it('기분 이모지를 표시한다 (mood 4 → 😌)', () => {
    render(<DiaryCard diary={MOCK_DIARY} />);
    expect(screen.getByText('😌')).toBeInTheDocument();
  });

  it('태그를 # prefix와 함께 표시한다', () => {
    render(<DiaryCard diary={MOCK_DIARY} />);
    expect(screen.getByText('#한강')).toBeInTheDocument();
    expect(screen.getByText('#산책')).toBeInTheDocument();
    expect(screen.getByText('#혼자')).toBeInTheDocument();
  });

  it('태그가 없으면 태그 영역을 표시하지 않는다', () => {
    const diaryNoTags = { ...MOCK_DIARY, tags: [] };
    const { container } = render(<DiaryCard diary={diaryNoTags} />);
    // 태그 칩이 없어야 한다
    expect(container.querySelector('[class*="flex-wrap"]')).toBeNull();
  });

  it('클릭 시 onClick 핸들러를 호출한다', () => {
    const onClick = vi.fn();
    render(<DiaryCard diary={MOCK_DIARY} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Enter 키로 onClick 핸들러를 호출한다', () => {
    const onClick = vi.fn();
    render(<DiaryCard diary={MOCK_DIARY} onClick={onClick} />);

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Space 키로 onClick 핸들러를 호출한다', () => {
    const onClick = vi.fn();
    render(<DiaryCard diary={MOCK_DIARY} onClick={onClick} />);

    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('mood 범위 밖 값은 기본 이모지(😐)로 폴백한다', () => {
    const diary = { ...MOCK_DIARY, mood: 99 };
    render(<DiaryCard diary={diary} />);
    // mood 99 → MOODS[98] is undefined → fallback 😐
    expect(screen.getByText('😐')).toBeInTheDocument();
  });
});
