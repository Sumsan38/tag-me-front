import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useTagAutocomplete, useRelatedTags, tagKeys } from '@/hooks/useTagAutocomplete';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockTagApi = vi.hoisted(() => ({
  autocomplete: vi.fn(),
  getRelatedTags: vi.fn(),
}));

vi.mock('@/api/tag', () => mockTagApi);

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
    queryClient,
  };
}

// ---------------------------------------------------------------------------
// 테스트
// ---------------------------------------------------------------------------

describe('useTagAutocomplete hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---- tagKeys ----
  describe('tagKeys', () => {
    it('autocomplete 키에 query를 포함한다', () => {
      expect(tagKeys.autocomplete('산책')).toEqual(['tag', 'autocomplete', '산책']);
    });

    it('related 키에 tagId를 포함한다', () => {
      expect(tagKeys.related(5)).toEqual(['tag', 'related', 5]);
    });
  });

  // ---- useTagAutocomplete ----
  describe('useTagAutocomplete', () => {
    it('query가 있으면 자동완성 API를 호출한다', async () => {
      const suggestions = [
        { tagId: 1, displayName: '산책', canonical: '산책' },
      ];
      mockTagApi.autocomplete.mockResolvedValueOnce(suggestions);
      const { wrapper } = createWrapper();

      const { result } = renderHook(
        () => useTagAutocomplete('산책'),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(suggestions);
      expect(mockTagApi.autocomplete).toHaveBeenCalledWith('산책');
    });

    it('빈 문자열이면 API를 호출하지 않는다', () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(
        () => useTagAutocomplete(''),
        { wrapper },
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockTagApi.autocomplete).not.toHaveBeenCalled();
    });

    it('공백만 있는 문자열이면 API를 호출하지 않는다', () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(
        () => useTagAutocomplete('   '),
        { wrapper },
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // ---- useRelatedTags ----
  describe('useRelatedTags', () => {
    it('tagId가 있으면 연관 태그를 조회한다', async () => {
      const related = [
        { tagId: 2, displayName: '한강', canonical: '한강', coOccurrenceCount: 3 },
      ];
      mockTagApi.getRelatedTags.mockResolvedValueOnce(related);
      const { wrapper } = createWrapper();

      const { result } = renderHook(
        () => useRelatedTags(1),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(related);
    });

    it('tagId가 null이면 쿼리를 실행하지 않는다', () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(
        () => useRelatedTags(null),
        { wrapper },
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockTagApi.getRelatedTags).not.toHaveBeenCalled();
    });
  });
});
