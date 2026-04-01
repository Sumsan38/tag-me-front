import { describe, it, expect, vi, beforeEach } from 'vitest';
import { autocomplete, getRelatedTags } from '@/api/tag';

// ---------------------------------------------------------------------------
// apiClient mock
// ---------------------------------------------------------------------------

const mockGet = vi.fn();

vi.mock('@/api/client', () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
  },
  ApiError: class extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
    }
  },
  isApiError: (e: unknown) => e instanceof Error && 'code' in e,
}));

// ---------------------------------------------------------------------------
// 테스트
// ---------------------------------------------------------------------------

describe('api/tag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('autocomplete', () => {
    it('GET /api/v1/tags/autocomplete?q= 으로 검색한다', async () => {
      const mockResults = [
        { tagId: 1, displayName: '산책', canonical: '산책' },
        { tagId: 2, displayName: '산책로', canonical: '산책로' },
      ];
      mockGet.mockResolvedValueOnce({ data: mockResults });

      const result = await autocomplete('산책');

      expect(mockGet).toHaveBeenCalledWith('/api/v1/tags/autocomplete', {
        params: { q: '산책' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].displayName).toBe('산책');
    });

    it('영문 검색어도 정상 동작한다', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });

      await autocomplete('travel');

      expect(mockGet).toHaveBeenCalledWith('/api/v1/tags/autocomplete', {
        params: { q: 'travel' },
      });
    });
  });

  describe('getRelatedTags', () => {
    it('GET /api/v1/tags/{id}/related 로 연관 태그를 조회한다', async () => {
      const mockResults = [
        { tagId: 2, displayName: '한강', canonical: '한강', coOccurrenceCount: 5 },
      ];
      mockGet.mockResolvedValueOnce({ data: mockResults });

      const result = await getRelatedTags(1);

      expect(mockGet).toHaveBeenCalledWith('/api/v1/tags/1/related');
      expect(result).toHaveLength(1);
      expect(result[0].coOccurrenceCount).toBe(5);
    });
  });
});
