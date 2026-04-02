import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TagInput from '@/components/tag/TagInput';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockAutocompleteData = [
  { tagId: 1, displayName: '산책', canonical: '산책' },
  { tagId: 2, displayName: '산책로', canonical: '산책로' },
];

let mockAutocompleteResult = { data: undefined as typeof mockAutocompleteData | undefined, isLoading: false };

vi.mock('@/hooks/useTagAutocomplete', () => ({
  useTagAutocomplete: () => mockAutocompleteResult,
}));

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

function getInput() {
  return screen.getByPlaceholderText('태그 추가 후 Enter') as HTMLInputElement;
}

// ---------------------------------------------------------------------------
// 테스트
// ---------------------------------------------------------------------------

describe('TagInput', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAutocompleteResult = { data: undefined, isLoading: false };
  });

  // ---- 기본 렌더링 ----
  describe('렌더링', () => {
    it('입력창과 카운터를 표시한다', () => {
      render(<TagInput tags={[]} onChange={onChange} />);
      expect(getInput()).toBeInTheDocument();
      expect(screen.getByText('0/10')).toBeInTheDocument();
    });

    it('기존 태그를 칩으로 표시한다', () => {
      render(<TagInput tags={['산책', '여행']} onChange={onChange} />);
      expect(screen.getByText('#산책')).toBeInTheDocument();
      expect(screen.getByText('#여행')).toBeInTheDocument();
      expect(screen.getByText('2/10')).toBeInTheDocument();
    });

    it('추천 태그 pill을 표시한다', () => {
      render(
        <TagInput
          tags={[]}
          onChange={onChange}
          suggestions={['일상', '감정']}
        />,
      );
      expect(screen.getByText('+ 일상')).toBeInTheDocument();
      expect(screen.getByText('+ 감정')).toBeInTheDocument();
    });

    it('이미 추가된 태그는 추천에서 제외한다', () => {
      render(
        <TagInput
          tags={['일상']}
          onChange={onChange}
          suggestions={['일상', '감정']}
        />,
      );
      expect(screen.queryByText('+ 일상')).not.toBeInTheDocument();
      expect(screen.getByText('+ 감정')).toBeInTheDocument();
    });
  });

  // ---- 태그 추가 ----
  describe('태그 추가', () => {
    it('Enter로 태그를 추가한다', () => {
      render(<TagInput tags={[]} onChange={onChange} />);
      const input = getInput();

      fireEvent.change(input, { target: { value: '산책' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith(['산책']);
    });

    it('# prefix를 제거하고 추가한다', () => {
      render(<TagInput tags={[]} onChange={onChange} />);
      const input = getInput();

      fireEvent.change(input, { target: { value: '#여행' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith(['여행']);
    });

    it('추천 태그 클릭으로 추가한다', () => {
      render(
        <TagInput
          tags={[]}
          onChange={onChange}
          suggestions={['일상', '감정']}
        />,
      );

      fireEvent.click(screen.getByText('+ 일상'));
      expect(onChange).toHaveBeenCalledWith(['일상']);
    });

    it('빈 입력은 무시한다', () => {
      render(<TagInput tags={[]} onChange={onChange} />);
      const input = getInput();

      fireEvent.change(input, { target: { value: '' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('공백만 있는 입력은 무시한다', () => {
      render(<TagInput tags={[]} onChange={onChange} />);
      const input = getInput();

      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ---- 중복 방지 ----
  describe('중복 방지', () => {
    it('이미 있는 태그는 추가하지 않는다', () => {
      render(<TagInput tags={['산책']} onChange={onChange} />);
      const input = getInput();

      fireEvent.change(input, { target: { value: '산책' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ---- 최대 개수 제한 ----
  describe('최대 개수 제한', () => {
    it('10개 도달 시 입력이 비활성화된다', () => {
      const tags = Array.from({ length: 10 }, (_, i) => `태그${i}`);
      render(<TagInput tags={tags} onChange={onChange} />);

      const input = screen.getByPlaceholderText(
        '태그를 더 추가할 수 없습니다',
      ) as HTMLInputElement;
      expect(input.disabled).toBe(true);
      expect(screen.getByText('10/10')).toBeInTheDocument();
    });

    it('10개 도달 시 추천 pill을 숨긴다', () => {
      const tags = Array.from({ length: 10 }, (_, i) => `태그${i}`);
      render(
        <TagInput
          tags={tags}
          onChange={onChange}
          suggestions={['일상']}
        />,
      );
      expect(screen.queryByText('+ 일상')).not.toBeInTheDocument();
    });

    it('maxTags 커스텀 값을 지원한다', () => {
      render(<TagInput tags={['a', 'b', 'c']} onChange={onChange} maxTags={3} />);

      const input = screen.getByPlaceholderText(
        '태그를 더 추가할 수 없습니다',
      ) as HTMLInputElement;
      expect(input.disabled).toBe(true);
      expect(screen.getByText('3/3')).toBeInTheDocument();
    });
  });

  // ---- 태그 삭제 ----
  describe('태그 삭제', () => {
    it('X 버튼으로 태그를 삭제한다', () => {
      render(<TagInput tags={['산책', '여행']} onChange={onChange} />);

      const removeButton = screen.getByLabelText('산책 태그 삭제');
      fireEvent.click(removeButton);

      expect(onChange).toHaveBeenCalledWith(['여행']);
    });
  });

  // ---- 키보드 ----
  describe('키보드', () => {
    it('Escape로 드롭다운을 닫는다', async () => {
      mockAutocompleteResult = { data: mockAutocompleteData, isLoading: false };

      render(<TagInput tags={[]} onChange={onChange} />);
      const input = getInput();

      // 디바운스 트리거를 위해 입력 후 대기
      fireEvent.change(input, { target: { value: '산' } });
      fireEvent.focus(input);

      // 드롭다운이 열릴 수 있도록 충분히 대기
      await act(async () => {
        await new Promise((r) => setTimeout(r, 350));
      });

      fireEvent.keyDown(input, { key: 'Escape' });

      // Escape 후 드롭다운 항목이 사라져야 함
      await waitFor(() => {
        expect(screen.queryByText('#산책')).not.toBeInTheDocument();
      });
    });
  });
});
