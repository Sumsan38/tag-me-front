import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CommentItem from '@/components/feed/CommentItem';
import type { CommentResponse } from '@/types/feed';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// next/image — jsdom 환경에서 렌더링 불가이므로 단순 img로 대체
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const mockLikeComment = { mutate: vi.fn(), isPending: false };
const mockUnlikeComment = { mutate: vi.fn(), isPending: false };
const mockDeleteComment = { mutate: vi.fn(), isPending: false };
const mockCreateReply = { mutate: vi.fn(), isPending: false };

vi.mock('@/hooks/useFeed', () => ({
  useLikeComment: () => mockLikeComment,
  useUnlikeComment: () => mockUnlikeComment,
  useDeleteComment: () => mockDeleteComment,
  useCreateReply: () => mockCreateReply,
}));

// authStore는 각 테스트에서 제어할 수 있도록 가변 변수로 관리
let mockIsAuthenticated = true;
let mockCurrentUserId: number | null = 1;

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (s: { user: { id: number } | null; accessToken: string | null }) => unknown) => {
    const fakeState = {
      user: mockCurrentUserId !== null ? { id: mockCurrentUserId } : null,
      accessToken: mockIsAuthenticated ? 'token' : null,
    };
    return selector(fakeState);
  },
  selectIsAuthenticated: (state: { accessToken: string | null }) => state.accessToken !== null,
}));

// ---------------------------------------------------------------------------
// 테스트 데이터
// ---------------------------------------------------------------------------

const BASE_COMMENT: CommentResponse = {
  id: 10,
  userId: 2,
  authorNickname: '작성자',
  content: '댓글 내용입니다',
  createdAt: '2026-04-01T10:00:00.000Z',
  parentId: null,
  likeCount: 3,
  likedByMe: false,
  replyCount: 0,
};

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

function renderComment(
  overrides: Partial<CommentResponse> = {},
  props: { isReply?: boolean; renderReplies?: (id: number) => React.ReactNode } = {},
) {
  const comment = { ...BASE_COMMENT, ...overrides };
  return render(
    <CommentItem feedId={1} comment={comment} {...props} />,
  );
}

// ---------------------------------------------------------------------------
// 테스트
// ---------------------------------------------------------------------------

describe('CommentItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = true;
    mockCurrentUserId = 1;
  });

  // ---- 답글 달기 버튼 ----
  describe('답글 달기 버튼', () => {
    it('로그인 상태이고 isReply=false이면 "답글 달기" 버튼을 표시한다', () => {
      mockIsAuthenticated = true;
      renderComment({}, { isReply: false });

      expect(screen.getByText('답글 달기')).toBeInTheDocument();
    });

    it('isReply=true이면 "답글 달기" 버튼을 표시하지 않는다', () => {
      mockIsAuthenticated = true;
      renderComment({}, { isReply: true });

      expect(screen.queryByText('답글 달기')).not.toBeInTheDocument();
    });

    it('비로그인 상태이면 "답글 달기" 버튼을 표시하지 않는다', () => {
      mockIsAuthenticated = false;
      renderComment({}, { isReply: false });

      expect(screen.queryByText('답글 달기')).not.toBeInTheDocument();
    });

    it('"답글 달기" 클릭 시 답글 입력창이 열린다', () => {
      mockIsAuthenticated = true;
      renderComment({}, { isReply: false });

      fireEvent.click(screen.getByText('답글 달기'));

      expect(screen.getByPlaceholderText('답글을 입력하세요')).toBeInTheDocument();
    });
  });

  // ---- 대댓글 N개 보기 버튼 ----
  describe('대댓글 N개 보기 버튼', () => {
    it('replyCount > 0이고 isReply=false이면 "대댓글 N개 보기" 버튼을 표시한다', () => {
      renderComment({ replyCount: 3 }, { isReply: false });

      expect(screen.getByText('대댓글 3개 보기')).toBeInTheDocument();
    });

    it('replyCount가 0이면 "대댓글 N개 보기" 버튼을 표시하지 않는다', () => {
      renderComment({ replyCount: 0 }, { isReply: false });

      expect(screen.queryByText(/대댓글.*개 보기/)).not.toBeInTheDocument();
    });

    it('isReply=true이면 replyCount > 0이어도 버튼을 표시하지 않는다', () => {
      renderComment({ replyCount: 5 }, { isReply: true });

      expect(screen.queryByText(/대댓글.*개 보기/)).not.toBeInTheDocument();
    });

    it('"대댓글 N개 보기" 클릭 시 renderReplies가 호출된다', () => {
      const renderReplies = vi.fn().mockReturnValue(<div>대댓글 목록</div>);
      renderComment({ replyCount: 2 }, { isReply: false, renderReplies });

      fireEvent.click(screen.getByText('대댓글 2개 보기'));

      expect(renderReplies).toHaveBeenCalledWith(BASE_COMMENT.id);
      expect(screen.getByText('대댓글 목록')).toBeInTheDocument();
    });

    it('대댓글이 열린 상태에서 다시 클릭하면 "대댓글 숨기기"로 변경된다', () => {
      const renderReplies = vi.fn().mockReturnValue(<div>대댓글</div>);
      renderComment({ replyCount: 1 }, { isReply: false, renderReplies });

      const btn = screen.getByText('대댓글 1개 보기');
      fireEvent.click(btn);

      expect(screen.getByText('대댓글 숨기기')).toBeInTheDocument();
    });
  });

  // ---- 삭제 버튼 ----
  describe('삭제 버튼', () => {
    it('currentUserId === comment.userId이면 삭제 버튼을 표시한다', () => {
      mockCurrentUserId = 2; // BASE_COMMENT.userId = 2
      renderComment();

      expect(screen.getByLabelText('댓글 삭제')).toBeInTheDocument();
    });

    it('currentUserId !== comment.userId이면 삭제 버튼을 표시하지 않는다', () => {
      mockCurrentUserId = 99; // 다른 사용자
      renderComment();

      expect(screen.queryByLabelText('댓글 삭제')).not.toBeInTheDocument();
    });

    it('비로그인(currentUserId=null)이면 삭제 버튼을 표시하지 않는다', () => {
      mockCurrentUserId = null;
      renderComment();

      expect(screen.queryByLabelText('댓글 삭제')).not.toBeInTheDocument();
    });

    it('삭제 버튼 클릭 시 useDeleteComment.mutate를 호출한다', () => {
      mockCurrentUserId = 2;
      renderComment();

      fireEvent.click(screen.getByLabelText('댓글 삭제'));

      expect(mockDeleteComment.mutate).toHaveBeenCalledWith({
        feedId: 1,
        commentId: 10,
        parentId: undefined,
      });
    });

    it('대댓글 삭제 시 parentId를 전달한다', () => {
      mockCurrentUserId = 2;
      renderComment({ parentId: 5 }, { isReply: true });

      fireEvent.click(screen.getByLabelText('댓글 삭제'));

      expect(mockDeleteComment.mutate).toHaveBeenCalledWith({
        feedId: 1,
        commentId: 10,
        parentId: 5,
      });
    });
  });

  // ---- 좋아요 버튼 ----
  describe('좋아요 버튼', () => {
    it('좋아요 상태가 아닐 때 useLikeComment.mutate를 호출한다', () => {
      mockIsAuthenticated = true;
      renderComment({ likedByMe: false });

      fireEvent.click(screen.getByLabelText('좋아요'));

      expect(mockLikeComment.mutate).toHaveBeenCalledWith({
        feedId: 1,
        commentId: 10,
        parentId: undefined,
      });
      expect(mockUnlikeComment.mutate).not.toHaveBeenCalled();
    });

    it('좋아요 상태일 때 useUnlikeComment.mutate를 호출한다', () => {
      mockIsAuthenticated = true;
      renderComment({ likedByMe: true });

      fireEvent.click(screen.getByLabelText('좋아요 취소'));

      expect(mockUnlikeComment.mutate).toHaveBeenCalledWith({
        feedId: 1,
        commentId: 10,
        parentId: undefined,
      });
      expect(mockLikeComment.mutate).not.toHaveBeenCalled();
    });

    it('대댓글 좋아요 클릭 시 parentId를 전달한다', () => {
      mockIsAuthenticated = true;
      renderComment({ likedByMe: false, parentId: 5 }, { isReply: true });

      fireEvent.click(screen.getByLabelText('좋아요'));

      expect(mockLikeComment.mutate).toHaveBeenCalledWith({
        feedId: 1,
        commentId: 10,
        parentId: 5,
      });
    });

    it('비로그인 상태에서 좋아요 클릭 시 mutate를 호출하지 않는다', () => {
      mockIsAuthenticated = false;
      renderComment({ likedByMe: false });

      // disabled 상태이므로 클릭해도 반응하지 않아야 한다
      const likeBtn = screen.getByLabelText('좋아요');
      fireEvent.click(likeBtn);

      expect(mockLikeComment.mutate).not.toHaveBeenCalled();
    });

    it('likeCount > 0이면 좋아요 수를 표시한다', () => {
      renderComment({ likeCount: 7 });

      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('likeCount === 0이면 좋아요 수를 표시하지 않는다', () => {
      renderComment({ likeCount: 0 });

      // 숫자 "0"이 렌더링되지 않아야 한다
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  // ---- 삭제된 댓글(소프트 삭제) ----
  describe('삭제된 댓글', () => {
    it('isDeleted=true이면 "삭제된 댓글입니다." 안내 문구를 표시한다', () => {
      renderComment({ isDeleted: true, content: '' });

      expect(screen.getByText('삭제된 댓글입니다.')).toBeInTheDocument();
    });

    it('isDeleted가 undefined이고 content가 빈 문자열이면 삭제 상태로 처리한다', () => {
      // 백엔드가 isDeleted 필드를 누락한 케이스에 대한 폴백.
      renderComment({ content: '' });

      expect(screen.getByText('삭제된 댓글입니다.')).toBeInTheDocument();
    });

    it('삭제된 댓글에는 본문 텍스트를 표시하지 않는다', () => {
      // 백엔드가 isDeleted=true와 함께 잔여 content를 내려보내도 노출하면 안 된다.
      renderComment({ isDeleted: true, content: '원래 내용' });

      expect(screen.queryByText('원래 내용')).not.toBeInTheDocument();
    });

    it('삭제된 댓글에는 좋아요 버튼을 표시하지 않는다', () => {
      mockIsAuthenticated = true;
      renderComment({ isDeleted: true, content: '' });

      expect(screen.queryByLabelText('좋아요')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('좋아요 취소')).not.toBeInTheDocument();
    });

    it('삭제된 댓글에는 "답글 달기" 버튼을 표시하지 않는다', () => {
      mockIsAuthenticated = true;
      renderComment({ isDeleted: true, content: '' }, { isReply: false });

      expect(screen.queryByText('답글 달기')).not.toBeInTheDocument();
    });

    it('본인이 작성한 삭제된 댓글에도 삭제 버튼을 다시 표시하지 않는다', () => {
      mockCurrentUserId = 2; // BASE_COMMENT.userId = 2
      renderComment({ isDeleted: true, content: '' });

      expect(screen.queryByLabelText('댓글 삭제')).not.toBeInTheDocument();
    });

    it('부모가 삭제된 상태에서도 replyCount > 0이면 대댓글 토글을 표시한다', () => {
      // 부모 삭제 시에도 자식 대댓글은 정상 노출되어야 한다는 명세.
      renderComment(
        { isDeleted: true, content: '', replyCount: 2 },
        { isReply: false },
      );

      expect(screen.getByText('대댓글 2개 보기')).toBeInTheDocument();
    });

    it('대댓글 토글을 누르면 부모가 삭제됐어도 renderReplies가 호출된다', () => {
      const renderReplies = vi.fn().mockReturnValue(<div>대댓글 목록</div>);
      renderComment(
        { isDeleted: true, content: '', replyCount: 1 },
        { isReply: false, renderReplies },
      );

      fireEvent.click(screen.getByText('대댓글 1개 보기'));

      expect(renderReplies).toHaveBeenCalledWith(BASE_COMMENT.id);
      expect(screen.getByText('대댓글 목록')).toBeInTheDocument();
    });
  });

  // ---- 기본 렌더링 ----
  describe('기본 렌더링', () => {
    it('댓글 내용을 표시한다', () => {
      renderComment();

      expect(screen.getByText('댓글 내용입니다')).toBeInTheDocument();
    });

    it('작성자 닉네임을 표시한다', () => {
      renderComment();

      expect(screen.getByText('작성자')).toBeInTheDocument();
    });

    it('authorNickname이 빈 문자열이면 "탈퇴한 사용자"를 표시한다', () => {
      renderComment({ authorNickname: '' });

      expect(screen.getByText('탈퇴한 사용자')).toBeInTheDocument();
    });
  });
});
