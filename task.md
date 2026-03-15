# Tag-Me Frontend — 개발 Task 체크리스트

> 기준 문서: `DevDock.md` / `CLAUDE.md`
> 프레임워크: Next.js (App Router, `src/app/`)
> 언어: TypeScript (strict mode)
> 스타일링: TailwindCSS
> 마인드맵: D3.js

---

## Phase 1 — 프로젝트 초기 설정 및 환경 구축 (1~2주)

### 1주차 — 프로젝트 골격 생성

- [x] **Next.js 프로젝트 생성**: `npx create-next-app@latest --typescript --tailwind --app --src-dir` 실행
- [x] **디렉터리 구조 설계 및 생성**:
  ```
  src/
  ├── app/                    ← App Router 페이지
  │   ├── (guest)/            ← 로그인, 회원가입, OAuth 콜백
  │   ├── (public)/           ← 공개 피드, 공개 프로필, 트렌딩, 공개 상세
  │   ├── (auth)/             ← 인증 필요 메인 레이아웃 그룹
  │   │   ├── diary/          ← 개인 일기장
  │   │   ├── mindmap/        ← 마인드맵
  │   │   ├── search/         ← 통합 검색
  │   │   ├── notifications/  ← 알림
  │   │   ├── mypage/         ← 마이페이지, 설정, 월간 리포트
  │   │   └── social/         ← 태그 친구 등 인증 기능
  │   └── layout.tsx          ← 루트 레이아웃
  ├── components/             ← 재사용 UI 컴포넌트
  │   ├── common/             ← 버튼, 모달, 카드, 아바타 등
  │   ├── diary/              ← 일기 관련 컴포넌트
  │   ├── feed/               ← 피드 관련 컴포넌트
  │   ├── tag/                ← 태그 입력, 자동완성 컴포넌트
  │   ├── mindmap/            ← D3.js 마인드맵 컴포넌트
  │   └── layout/             ← 헤더, 사이드바, 바텀 네비게이션
  ├── hooks/                  ← 커스텀 React 훅
  ├── api/                    ← API 클라이언트 (도메인별 분리)
  ├── types/                  ← TypeScript 타입 정의 (도메인별)
  ├── utils/                  ← 유틸리티 함수
  ├── stores/                 ← 전역 상태 관리
  └── styles/                 ← 글로벌 스타일, TailwindCSS 설정
  ```
- [x] **패키지 의존성 설치**:
  - 상태관리: `zustand` 또는 `jotai`
  - API 통신: `@tanstack/react-query`, `axios`
  - D3.js: `d3`, `@types/d3`
  - 날짜: `date-fns`
  - 아이콘: `lucide-react`
  - 폼: `react-hook-form`, `zod` (유효성 검증)
  - 이미지 크롭: `react-image-crop` 또는 `cropperjs`
  - 에러 트래킹: `@sentry/nextjs`
- [x] **TailwindCSS 커스텀 설정** (`tailwind.config.ts`):
  - 디자인 토큰 정의: 색상 팔레트 (primary, secondary, accent), 폰트 크기, 간격
  - 태그 출처별 색상 정의: `diary` (진한 파란), `post` (진한 초록), `like` (연한 분홍/반투명), `comment` (연한 노랑/반투명)
- [x] **`next/font` 설정**: 한국어 폰트 사전 로드 (Pretendard 또는 Noto Sans KR)
- [x] **ESLint + Prettier 설정**: `.eslintrc.json`, `.prettierrc` 작성
- [x] **환경 변수 파일 설정**: `.env.local` (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SENTRY_DSN 등), `.env.example` 작성

### 2주차 — 공통 모듈 및 API 인프라

- [x] **계정/권한/라우팅 정책 반영**:
  - Guest / User / Admin 권한 차이에 맞춘 라우트 접근 정책 확정
  - 공개 라우트와 인증 라우트 URL 매핑을 `DevDock.md` 기준으로 고정
- [ ] **태그 입력 정책 반영**:
  - 입력값과 표시값 분리 원칙 반영
  - `#` prefix 표시 규칙, 공백 정리, 중복 태그 방지 규칙 문서화
- [ ] **Axios 인스턴스 생성** (`api/client.ts`):
  - Base URL: `process.env.NEXT_PUBLIC_API_URL`
  - Request Interceptor: Authorization 헤더에 Access Token 자동 첨부
  - Response Interceptor: 401 응답 시 Refresh Token으로 자동 갱신 후 원래 요청 재시도
  - Envelope 응답 자동 파싱: `response.data.data` 추출
- [ ] **API 에러 핸들링 유틸** (`api/error.ts`):
  - 도메인별 에러 코드 매핑 (DIARY_001 → "일기를 찾을 수 없습니다")
  - toast 알림 연동
- [ ] **React Query 설정** (`providers/QueryProvider.tsx`):
  - `QueryClientProvider` 래퍼 컴포넌트
  - 기본 staleTime, cacheTime 설정
  - 에러 바운더리 연동
- [ ] **인증 상태 관리** (`stores/authStore.ts`):
  - Access Token 메모리 저장 (Zustand)
  - 로그인/로그아웃 액션
  - 인증 여부 확인 함수
  - provider 정보 및 탈퇴 후 캐시 초기화 흐름 고려
- [ ] **공통 타입 정의** (`types/common.ts`):
  ```typescript
  interface ApiResponse<T> { success: boolean; data: T; error?: ErrorResponse; timestamp: string; }
  interface CursorPage<T> { content: T[]; nextCursor: string | null; hasNext: boolean; }
  interface OffsetPage<T> { content: T[]; totalElements: number; totalPages: number; page: number; }
  ```
- [ ] **검색/추천/공유 계약 타입 반영**:
  - highlight 필드, 추천 결과 정렬 근거, 공유 리포트 식별자 타입 정의
- [ ] **도메인별 타입 정의 파일 생성**:
  - `types/auth.ts` — User, LoginRequest, RegisterRequest, TokenResponse
  - `types/diary.ts` — Diary, CreateDiaryRequest, DiaryListFilter
  - `types/feed.ts` — Post, Comment, Like, CreatePostRequest
  - `types/tag.ts` — Tag, TagAutoCompleteResponse
  - `types/mindmap.ts` — MindmapNode, MindmapEdge, MindmapData
  - `types/search.ts` — SearchResult, SearchFilter
  - `types/social.ts` — Circle, Challenge, Follow
  - `types/notification.ts` — Notification, NotificationType
- [ ] **공통 UI 컴포넌트 기본 구현**:
  - `Button` (primary, secondary, outline, danger 변형)
  - `Input` (텍스트, 비밀번호, 검색)
  - `Modal` (오버레이 + 컨텐츠)
  - `Card` (기본 카드 레이아웃)
  - `Avatar` (유저 프로필 이미지)
  - `Badge` (태그 뱃지, 알림 뱃지)
  - `Spinner` / `Skeleton` (로딩 상태)
  - `Toast` (성공/에러/정보 알림)
- [ ] **레이아웃 컴포넌트 구현**:
  - `Header` — 로고, 검색바, 알림 아이콘, 프로필 메뉴
  - `BottomNavigation` — 홈(피드), 일기, 마인드맵, 알림, 프로필 (모바일 대응)
  - `Sidebar` — 데스크탑 네비게이션
  - `AuthLayout` — 로그인/회원가입 전용 레이아웃
  - `MainLayout` — 인증 후 메인 레이아웃 (Header + Sidebar/BottomNav + Content)
- [ ] **라우트 그룹 및 렌더링 전략 확정**:
  - 공개 라우트: `/feed`, `/users/[id]`, `/trending`, `/challenges/[id]`, `/circles/[id]`
  - 인증 라우트: `/diary`, `/mindmap`, `/search`, `/notifications`, `/mypage`
  - SSR/CSR/ISR 정책을 `DevDock.md` 기준으로 경로별 명시

---

## Phase 2 — 핵심 기능 개발 (3~6주)

### 3주차 — 인증 페이지 (Identity 도메인)

**API 클라이언트**
- [ ] `api/auth.ts` 작성:
  - `register(email, password, nickname)` → POST `/api/v1/auth/register`
  - `login(email, password)` → POST `/api/v1/auth/login`
  - `refreshToken()` → POST `/api/v1/auth/refresh`
  - `logout()` → POST `/api/v1/auth/logout`
  - `googleOAuthUrl()` → GET `/api/v1/auth/oauth/google`
  - `kakaoOAuthUrl()` → GET `/api/v1/auth/oauth/kakao`

**React Query 훅**
- [ ] `hooks/useAuth.ts` 작성:
  - `useRegister()` — mutation, 성공 시 자동 로그인 + 홈으로 리다이렉트
  - `useLogin()` — mutation, Access Token 저장 + 홈으로 리다이렉트
  - `useLogout()` — mutation, 토큰 클리어 + 로그인 페이지로 리다이렉트
  - `useCurrentUser()` — query, 현재 로그인한 유저 정보
  - provider 연결/충돌 에러 코드 처리

**페이지 구현 (CSR)**
- [ ] **회원가입 페이지** (`src/app/(guest)/register/page.tsx`):
  - 이메일, 비밀번호, 비밀번호 확인, 닉네임 입력 폼
  - `react-hook-form` + `zod`로 클라이언트 유효성 검증
  - 비밀번호 강도 표시 (8자 이상, 영문+숫자+특수문자)
  - 소셜 로그인 버튼 (Google, Kakao)
  - 이미 계정이 있으면 로그인 페이지 링크
- [ ] **로그인 페이지** (`src/app/(guest)/login/page.tsx`):
  - 이메일, 비밀번호 입력 폼
  - "로그인 상태 유지" 체크박스
  - 소셜 로그인 버튼 (Google, Kakao)
  - 회원가입 페이지 링크
- [ ] **OAuth 콜백 페이지** (`src/app/(guest)/oauth/callback/page.tsx`):
  - URL 쿼리 파라미터에서 authorization code 추출
  - 백엔드 콜백 API 호출 → JWT 수신 → 메인 페이지 리다이렉트
  - 에러 시 로그인 페이지로 리다이렉트 + 에러 메시지
  - provider 연결 충돌/미승인 상태 예외 UI
- [ ] **인증 가드 미들웨어** (`middleware.ts`):
  - 인증 필요 경로 접근 시 Access Token 없으면 로그인 페이지로 리다이렉트
  - 인증 불필요 경로 (로그인, 회원가입)에서 이미 로그인 시 홈으로 리다이렉트
  - 공개 라우트(`/feed`, `/users/[id]`, `/trending`, `/challenges/[id]`, `/circles/[id]`)는 인증 없이 접근 가능하도록 예외 처리

### 4주차 — 일기 기능 (Diary 도메인)

**API + 훅**
- [ ] `api/diary.ts` 작성:
  - `createDiary(data)` → POST `/api/v1/diaries`
  - `getDiaries(filter)` → GET `/api/v1/diaries` (Cursor 페이지네이션)
  - `getDiary(id)` → GET `/api/v1/diaries/{id}`
  - `updateDiary(id, data)` → PUT `/api/v1/diaries/{id}`
  - `deleteDiary(id)` → DELETE `/api/v1/diaries/{id}`
  - `getRecommendedFeeds(diaryId)` → GET `/api/v1/diaries/{id}/recommended-feeds`
  - `getRetrospect()` → GET `/api/v1/diaries/retrospect`
- [ ] `hooks/useDiary.ts` 작성:
  - `useCreateDiary()` — mutation, 낙관적 업데이트 (일기 목록에 즉시 추가)
  - `useDiaries(filter)` — infinite query, Cursor 페이지네이션
  - `useDiary(id)` — query
  - `useUpdateDiary()` — mutation
  - `useDeleteDiary()` — mutation
  - `useRecommendedFeeds(diaryId)` — query (일기 저장 후 활성화)
  - `useRetrospect()` — query

**태그 입력 컴포넌트 (공통)**
- [ ] **`TagInput` 컴포넌트** (`components/tag/TagInput.tsx`):
  - `#` 입력 시 자동완성 드롭다운 표시
  - 백엔드 `GET /api/v1/tags/autocomplete?q=` 호출 (debounce 300ms)
  - 태그 선택 또는 Enter 시 태그 칩으로 추가
  - 태그 칩 삭제 (X 버튼)
  - 최대 10개 제한, 초과 시 입력 비활성화
  - 중복 태그 방지
  - canonical 저장 전 UI 표시값 정규화(`#` 표시, 공백 제거) 반영
- [ ] `hooks/useTagAutocomplete.ts`: debounce + React Query 자동완성 훅

**페이지 구현 (CSR — 인증 필요)**
- [ ] **일기 작성 페이지** (`src/app/(auth)/diary/write/page.tsx`):
  - 제목 입력 (필수)
  - 본문 입력 (textarea, 자동 높이 조절)
  - 감정 선택 (1~5 이모지 선택 UI)
  - `TagInput` 컴포넌트로 태그 추가
  - 저장 버튼 → 성공 시 "이런 이야기도 있어요" 추천 피드 섹션 표시
- [ ] **일기 목록 페이지** (`src/app/(auth)/diary/page.tsx`):
  - 캘린더 뷰 / 리스트 뷰 전환
  - 날짜 필터 (date picker)
  - 태그 필터 (태그 칩 클릭으로 필터링)
  - 무한 스크롤 (Cursor 페이지네이션)
  - 일기 카드: 제목, 본문 미리보기 (2줄), 태그 칩 목록, 감정 이모지, 작성일
- [ ] **일기 상세 페이지** (`src/app/(auth)/diary/[id]/page.tsx`):
  - 제목, 본문 전체, 태그, 감정, 작성일
  - 수정/삭제 버튼
  - "이런 이야기도 있어요" 추천 피드 섹션 (하단)
- [ ] **일기 수정 페이지** (`src/app/(auth)/diary/[id]/edit/page.tsx`):
  - 기존 일기 데이터 프리필
  - 태그 추가/제거 가능
  - 저장 시 `updateDiary` 호출
- [ ] **일기 카드 컴포넌트** (`components/diary/DiaryCard.tsx`): 리스트 뷰에서 사용
- [ ] **추천 피드 섹션 컴포넌트** (`components/diary/RecommendedFeeds.tsx`):
  - 일기 저장 완료 후 노출
  - 최대 10개 게시글 카드 (제목, 태그, 작성자 닉네임)
  - 일치 태그 하이라이팅 (색상 강조)
  - 카드 클릭 시 피드 상세로 이동
  - 태그 일치 수 우선 정렬 결과를 UI에 그대로 반영

### 5주차 — 태그 자동완성 + 검색 (Tag + Search 도메인)

**API + 훅**
- [ ] `api/tag.ts` 작성:
  - `autocomplete(query)` → GET `/api/v1/tags/autocomplete?q=`
  - `getRelatedTags(tagId)` → GET `/api/v1/tags/{id}/related`
  - `getTrending()` → GET `/api/v1/tags/trending`
  - `getDailyPrompt()` → GET `/api/v1/tags/daily-prompt`
- [ ] `api/search.ts` 작성:
  - `search(params)` → GET `/api/v1/search` (q, type, from, to, tags)
  - `searchAutocomplete(query)` → GET `/api/v1/search/autocomplete?q=`
- [ ] `hooks/useSearch.ts` 작성:
  - `useSearch(params)` — infinite query
  - `useSearchAutocomplete(query)` — query (debounce 300ms)

**페이지 구현**
- [ ] **통합 검색 페이지** (`src/app/(main)/search/page.tsx`):
  - 검색바 (입력 중 자동완성 드롭다운)
  - 탭: 전체 / 일기(Private) / 피드(Public)
  - 필터 패널: 기간 선택 (date range picker), 태그 필터, 작성자 필터
  - 검색 결과 카드 목록 (무한 스크롤)
  - 검색 결과 카드에 **일치 키워드 하이라이팅** (백엔드 highlight 데이터 활용)
  - 결과 없을 때 빈 상태 UI
  - 인증 사용자용 CSR 페이지로 유지하되, 공개 SEO 대상 경로와 혼동되지 않도록 그룹 분리
  - score 동점 시 최신순으로 정렬된 결과를 클라이언트에서 재정렬하지 않음
- [ ] **검색 결과 카드 컴포넌트** (`components/search/SearchResultCard.tsx`):
  - 타입 아이콘 (일기/피드 구분)
  - 제목 (하이라이팅), 본문 미리보기 (하이라이팅), 태그 칩, 작성일
  - 클릭 시 해당 일기/피드 상세로 이동

### 6주차 — 소셜 피드 기본 (Feed 도메인)

**API + 훅**
- [ ] `api/feed.ts` 작성:
  - `createPost(data)` → POST `/api/v1/posts`
  - `getPosts(cursor)` → GET `/api/v1/posts` (전체 공개)
  - `getFollowingPosts(cursor)` → GET `/api/v1/posts/following`
  - `getPost(id)` → GET `/api/v1/posts/{id}`
  - `deletePost(id)` → DELETE `/api/v1/posts/{id}`
  - `likePost(id)` → POST `/api/v1/posts/{id}/likes`
  - `unlikePost(id)` → DELETE `/api/v1/posts/{id}/likes`
  - `getComments(postId, cursor)` → GET `/api/v1/posts/{id}/comments`
  - `createComment(postId, content)` → POST `/api/v1/posts/{id}/comments`
  - `deleteComment(postId, commentId)` → DELETE `/api/v1/posts/{postId}/comments/{commentId}`
- [ ] `hooks/useFeed.ts` 작성:
  - `usePosts()` — infinite query (전체 공개)
  - `useFollowingPosts()` — infinite query
  - `usePost(id)` — query
  - `useCreatePost()` — mutation
  - `useLikePost()` — mutation, **낙관적 업데이트** (좋아요 수 즉시 증가, UI 즉시 반영)
  - `useUnlikePost()` — mutation, 낙관적 업데이트
  - `useComments(postId)` — infinite query
  - `useCreateComment()` — mutation
  - `useDeleteComment()` — mutation

**페이지 구현 (SSR — 공개 피드)**
- [ ] **피드 메인 페이지** (`src/app/(public)/feed/page.tsx`):
  - 탭: 전체 / 팔로잉
  - 무한 스크롤 피드
  - 게시글 작성 진입 버튼 (플로팅 버튼)
- [ ] **게시글 작성 페이지** (`src/app/(auth)/feed/write/page.tsx`):
  - 본문 입력 (텍스트, 몇 줄)
  - 이미지 업로드 (최대 10장, 드래그앤드롭 지원):
    - `next/image` 미리보기
    - S3 Pre-signed URL로 직접 업로드
    - 업로드 진행률 표시
  - `TagInput` 컴포넌트로 태그 추가
  - 공개/비공개 토글
- [ ] **게시글 상세 페이지** (`src/app/(public)/feed/[id]/page.tsx`):
  - 본문, 이미지 갤러리 (스와이프), 태그, 작성자 프로필, 작성일
  - 좋아요 버튼 + 카운트 (하트 애니메이션)
  - 댓글 목록 + 댓글 입력
  - 삭제 버튼 (본인 게시글만)
- [ ] **피드 카드 컴포넌트** (`components/feed/FeedCard.tsx`):
  - 작성자 아바타 + 닉네임 + 작성 시간 (relative time: "3시간 전")
  - 본문 미리보기 (3줄, 더보기)
  - 이미지 썸네일 (1장이면 전체, 2장이면 2열, 3장 이상이면 그리드)
  - 태그 칩 목록
  - 좋아요/댓글 수 + 아이콘 버튼

**이미지 업로드 유틸**
- [ ] `utils/upload.ts` 작성:
  - `getPresignedUrl(fileName, contentType)` → Pre-signed URL 요청
  - `uploadToS3(presignedUrl, file, onProgress)` → PUT 직접 업로드 + 진행률 콜백
  - 파일 크기 검증 (10MB), Content-Type 검증 (image/*)
- [ ] `hooks/useImageUpload.ts`: 복수 이미지 업로드 관리 (순차/병렬), 업로드 상태 관리

---

## Phase 3 — 소셜 기능 완성 (7~10주)

### 7~8주차 — 피드 인터랙션 + 팔로우

- [ ] **좋아요 낙관적 업데이트 구현**:
  - 버튼 클릭 즉시 UI 반영 (하트 색상 변경 + 카운트 증가)
  - 서버 실패 시 자동 롤백
  - 연타 방지 (debounce)
- [ ] **댓글 컴포넌트** (`components/feed/CommentList.tsx`):
  - 댓글 목록 (무한 스크롤)
  - 댓글 카드: 아바타 + 닉네임 + 내용 + 시간 + 삭제 버튼(본인만)
  - 댓글 입력창 (하단 고정)
- [ ] **팔로우/언팔로우 기능**:
  - `api/social.ts`: `follow(userId)`, `unfollow(userId)`, `getFollowers(userId)`, `getFollowing(userId)`
  - `hooks/useFollow.ts`: `useFollow()`, `useUnfollow()` mutation
  - 프로필 페이지에 팔로우 버튼
- [ ] **사용자 프로필 페이지** (`src/app/(main)/profile/[id]/page.tsx`, SSR):
- [ ] **사용자 프로필 페이지** (`src/app/(public)/users/[id]/page.tsx`, SSR):
  - 프로필 이미지, 닉네임, 팔로워/팔로잉 수
  - 팔로우/언팔로우 버튼
  - 해당 유저의 공개 게시글 목록
  - 본인 프로필이면 수정 버튼
- [ ] **프로필 수정 페이지** (`src/app/(auth)/mypage/edit/page.tsx`):
  - 프로필 이미지 변경 (S3 업로드)
  - 닉네임 변경

### 9~10주차 — 써클 + 챌린지 UI

- [ ] `api/social.ts` 추가:
  - `createCircle(data)`, `getCircles()`, `joinCircle(id)`
  - `getChallenges()`, `getChallenge(id)`, `joinChallenge(id)`, `completeChallenge(id)`
  - `createChallenge(data)`
- [ ] **써클 페이지** (`src/app/(main)/social/circles/page.tsx`):
- [ ] **써클 페이지** (`src/app/(auth)/social/circles/page.tsx`):
  - 내 써클 목록 (태그 칩 포함)
  - 써클 생성 모달 (이름 + 태그 입력)
  - 써클 가입 버튼
- [ ] **챌린지 페이지** (`src/app/(main)/social/challenges/page.tsx`):
- [ ] **챌린지 페이지** (`src/app/(auth)/social/challenges/page.tsx`):
  - 진행 중 / 완료 탭
  - 챌린지 카드: 제목, 태그, 기간, 참여자 수, 진행률 바
  - 챌린지 생성 모달 (제목, 설명, 태그, 기간)
- [ ] **챌린지 상세 페이지** (`src/app/(public)/challenges/[id]/page.tsx`, SSR):
  - 챌린지 정보 (제목, 설명, 태그, 기간)
  - 참여자 목록 + 각 참여자 진행 상태
  - 참여/완료 버튼
- [ ] **써클 상세 페이지** (`src/app/(public)/circles/[id]/page.tsx`, SSR):
  - 써클 소개, 태그 집합, 멤버 수, 관련 활동 노출
  - 로그인 상태면 가입 CTA 노출

---

## Phase 4 — 마인드맵 & 추천 (11~14주)

### 11~12주차 — D3.js 마인드맵

**API + 훅**
- [ ] `api/mindmap.ts` 작성:
  - `getMindmap(period, periodType, source)` → GET `/api/v1/mindmap`
  - `getTagDetail(tagId, source)` → GET `/api/v1/mindmap/tags/{tagId}`
- [ ] `hooks/useMindmap.ts`: `useMindmap(params)` — query

**D3.js 마인드맵 컴포넌트**
- [ ] **`MindmapVisualization` 컴포넌트** (`components/mindmap/MindmapVisualization.tsx`):
  - Force-directed graph 레이아웃 (D3 force simulation)
  - **노드(태그)**: 원형 노드, 크기 = totalCount 비례, 텍스트 라벨
  - **노드 색상 — 태그 출처 시각화**:
    - `primarySource === 'diary'` → 진한 파란색
    - `primarySource === 'post'` → 진한 초록색
    - `primarySource === 'like'` → 연한 분홍색 + 하트 아이콘
    - `primarySource === 'comment'` → 연한 노란색 + 말풍선 아이콘
  - **엣지(태그 연결)**: 선 두께 = weight 비례
  - **엣지 스타일 — source_type별**:
    - `diary`/`post` → 실선
    - `like` → 점선
    - `comment` → 파선 (dash-dot)
  - 줌/팬 인터랙션 (D3 zoom behavior)
  - 노드 드래그 가능
  - 노드 hover 시 툴팁 (태그명, 출처별 count)
  - **노드 클릭 시 태그 상세 패널** 열기
- [ ] **기간 필터 컴포넌트** (`components/mindmap/PeriodFilter.tsx`):
  - 주 / 월 / 년 단위 전환 버튼
  - 이전/다음 기간 이동 화살표
  - 현재 선택된 기간 표시
- [ ] **출처 필터 컴포넌트** (`components/mindmap/SourceFilter.tsx`):
  - 전체 / 직접 작성 / 좋아요 / 댓글 필터 토글 버튼
  - 선택된 필터에 맞게 마인드맵 노드/엣지 필터링
- [ ] **태그 상세 패널 컴포넌트** (`components/mindmap/TagDetailPanel.tsx`):
  - 태그명 + 출처별 count (diary: N, post: N, like: N, comment: N)
  - 탭: 일기 / 게시글 / 좋아요 / 댓글
  - 각 탭에서 해당 태그가 포함된 콘텐츠 리스트
  - 리스트 항목 클릭 시 해당 콘텐츠로 이동

**마인드맵 페이지 (CSR — 인터랙티브 시각화)**
- [ ] **마인드맵 페이지** (`src/app/(main)/mindmap/page.tsx`):
- [ ] **마인드맵 페이지** (`src/app/(auth)/mindmap/page.tsx`):
  - `MindmapVisualization` + `PeriodFilter` + `SourceFilter` 조합
  - 우측 또는 하단에 `TagDetailPanel` (사이드 패널)
  - 태그 없을 때 빈 상태 UI ("일기를 쓰거나 피드에서 좋아요를 눌러보세요!")

### 13주차 — 사용자 추천 + 트렌딩 태그

- [ ] `api/social.ts` 추가:
  - `getRecommendedUsers()` → GET `/api/v1/users/recommendations`
- [ ] **유사 유저 추천 컴포넌트** (`components/social/UserRecommendation.tsx`):
  - 추천 유저 카드: 아바타, 닉네임, 공통 태그 목록, 팔로우 버튼
  - 피드 사이드바 또는 별도 페이지에 노출
- [ ] **트렌딩 태그 페이지** (`src/app/(public)/trending/page.tsx`, ISR — 1시간 갱신):
  - 상위 20개 트렌딩 태그 목록
  - 각 태그별 오늘 사용 횟수
  - 태그 클릭 시 해당 태그로 검색

### 14주차 — 리텐션 UI 준비

- [ ] **스트릭 위젯 컴포넌트** (`components/diary/StreakWidget.tsx`):
  - 불꽃 아이콘 + 연속 기록 일수 표시
  - 최근 7일 기록 현황 (잔디 히트맵 스타일 또는 원형 인디케이터)
  - 일기 목록 페이지 상단에 배치
- [ ] **오늘의 태그 프롬프트 컴포넌트** (`components/diary/DailyPrompt.tsx`):
  - "오늘의 태그: #산책" 카드 형태
  - "이 태그로 일기 쓰기" 버튼 → 일기 작성 페이지로 이동 (태그 미리 입력)
  - 일기 작성 페이지 상단 또는 홈 페이지에 노출

---

## Phase 5 — 리텐션 기능 1차 (15~18주)

### 15주차 — 스트릭 + 프롬프트 페이지 연동

- [ ] `api/user.ts` 작성:
  - `getStreak()` → GET `/api/v1/users/streak`
  - `getDailyPrompt()` → GET `/api/v1/tags/daily-prompt`
- [ ] `hooks/useStreak.ts`: `useStreak()` — query
- [ ] `hooks/useDailyPrompt.ts`: `useDailyPrompt()` — query
- [ ] 일기 목록 페이지에 `StreakWidget` + `DailyPrompt` 통합
- [ ] 스트릭 0일일 때 복귀 유도 UI ("다시 시작해보세요!")

### 16주차 — 회고 카드 + 알림

- [ ] **회고 카드 컴포넌트** (`components/diary/RetrospectCard.tsx`):
  - "1년 전 오늘 이런 기록을 남겼어요" 카드
  - 과거 일기 제목, 본문 미리보기, 태그, 감정
  - "자세히 보기" 버튼 → 해당 일기 상세로 이동
  - 일기 목록 페이지 또는 홈 페이지 상단에 노출
- [ ] **알림 페이지** (`src/app/(main)/notifications/page.tsx`):
- [ ] **알림 페이지** (`src/app/(auth)/notifications/page.tsx`):
  - 알림 목록 (무한 스크롤)
  - 알림 카드: 타입 아이콘 (스트릭/회고/트렌딩) + 메시지 + 시간 + 읽음 여부
  - 클릭 시 읽음 처리 + 관련 페이지 이동
  - 상단 미읽 알림 수 뱃지 (Header에 연동)
  - 중복 알림이 보이지 않도록 dedup 응답 가정 검증
- [ ] `api/notification.ts` 작성:
  - `getNotifications(cursor)` → GET `/api/v1/notifications`
  - `markAsRead(id)` → PATCH `/api/v1/notifications/{id}/read`
  - `getUnreadCount()` → GET `/api/v1/notifications/unread-count`
- [ ] `hooks/useNotification.ts` 작성

### 17주차 — 챌린지 상세 UI

- [ ] **챌린지 진행률 바 컴포넌트** (`components/social/ChallengeProgress.tsx`):
  - D-day 카운트다운
  - 참여자 진행률 게이지 바
  - 완주 시 뱃지 애니메이션
- [ ] **챌린지 피드** (`components/social/ChallengeFeed.tsx`):
  - 챌린지 참여자들의 관련 게시글 타임라인
  - 응원 메시지/댓글

### 18주차 — 월간 리포트 카드

- [ ] `api/report.ts` 작성:
  - `getMonthlyReport(month)` → GET `/api/v1/reports/monthly?month={yyyy-MM}`
- [ ] **월간 리포트 페이지** (`src/app/(main)/profile/report/page.tsx`):
- [ ] **월간 리포트 페이지** (`src/app/(auth)/mypage/report/page.tsx`):
  - 인포그래픽 레이아웃:
    - TOP 5 태그 바 차트
    - 총 일기 수, 게시글 수, 좋아요 수, 댓글 수
    - 가장 많이 느낀 감정 (이모지 + 비율)
    - 최장 스트릭 기록
  - "SNS에 공유하기" 버튼:
    - 리포트 영역을 이미지로 캡처 (html2canvas 또는 dom-to-image)
    - 캡처한 이미지 S3 업로드
    - 백엔드가 반환한 `reportId` 또는 `shareUrl`로 공유 링크 생성
    - 카카오톡/트위터/인스타 스토리 공유 링크
- [ ] **리포트 공유 페이지** (`src/app/reports/[id]/page.tsx`, SSR — OG 메타태그):
  - 공유 링크로 접근 시 리포트 인포그래픽 표시
  - OG 이미지, 제목, 설명 메타태그 설정
  - 백엔드 리포트 공유 계약(`reportId` 또는 `shareUrl`)과 동일한 식별자 규칙 사용

---

## Phase 6 — 리텐션 기능 2차 + QA (19~22주)

### 19주차 — 익명 공감 피드

- [ ] `api/feed.ts` 추가:
  - `getEmpathyFeed()` → GET `/api/v1/feed/empathy`
- [ ] **익명 공감 피드 컴포넌트** (`components/feed/EmpathyFeed.tsx`):
  - "오늘 #번아웃을 기록한 사람이 47명" 카드 형태
  - 내가 오늘 기록한 태그 목록 + 각 태그별 같은 태그를 기록한 사람 수
  - 태그 칩 + 사람 수 카운터 + 따뜻한 색감 배경
  - 피드 페이지 상단 또는 일기 작성 완료 후 노출

### 19.5주차 — 회원 탈퇴 플로우

- [ ] `api/user.ts` 추가:
  - `deleteAccount()` → DELETE `/api/v1/users/me`
- [ ] **회원 탈퇴 UI** (`src/app/(auth)/mypage/settings/page.tsx` 또는 설정 모달):
  - 탈퇴 전 확인 문구 및 되돌릴 수 없음 안내
  - 성공 시 Access Token 제거, `queryClient.clear()`, 로그인 페이지 리다이렉트
  - 탈퇴 후 공개 게시글은 익명화된다는 정책 문구 노출
  - 탈퇴 후 소셜 재로그인 정책 문구 노출

### 20주차 — 1:1 태그 친구

- [ ] `api/social.ts` 추가:
  - `requestTagFriend()`, `getTagFriends()`, `sendMessage(friendId, content)`, `getMessages(friendId)`
- [ ] **태그 친구 페이지** (`src/app/(main)/social/tag-friends/page.tsx`):
  - 매칭된 태그 친구 목록 (공통 태그 표시)
  - 새 매칭 요청 버튼
- [ ] **응원 메시지 채팅 UI** (`components/social/TagFriendChat.tsx`):
  - 간단한 메시지 목록 (텍스트만, 100자 제한)
  - 메시지 입력 + 전송
- [ ] **태그 친구 안전 UX**:
  - 차단/신고/대화 종료 UI
  - 차단된 상대 재노출 방지 처리

### 21주차 — E2E 테스트 + 접근성

- [ ] **Playwright E2E 테스트 시나리오 작성**:
  - 회원가입 → 로그인 → 일기 작성 (태그 자동완성 포함) → 검색 → 피드 좋아요 → 마인드맵 확인
  - 소셜 로그인 플로우 (mock)
  - 이미지 업로드 플로우
- [ ] **접근성(a11y) 점검**:
  - 키보드 네비게이션 확인 (모든 인터랙티브 요소 Tab 접근 가능)
  - ARIA 라벨 추가 (아이콘 버튼, 모달 등)
  - 색상 대비 확인 (WCAG AA 기준)
- [ ] **반응형 디자인 점검**: 모바일(375px), 태블릿(768px), 데스크탑(1280px) 3단계 브레이크포인트 확인

### 22주차 — Sentry + 성능 최적화

- [ ] **Sentry 프론트엔드 연동**: `@sentry/nextjs` 설정, 에러 바운더리 연동, 소스맵 업로드
- [ ] **Core Web Vitals 최적화**:
  - LCP: `next/image`로 이미지 lazy loading, 우선 이미지 `priority` 설정
  - FID: 무거운 연산 Web Worker 분리 (D3.js 초기 계산 등)
  - CLS: 이미지/폰트 크기 예약, Skeleton UI 적용
- [ ] **번들 사이즈 최적화**: `@next/bundle-analyzer`로 분석, 불필요한 의존성 제거, dynamic import 적용

---

## Phase 7 — 안정화 & 베타 오픈 (23~24주)

### 23주차 — 최종 점검

- [ ] **전체 페이지 동작 확인** (Happy Path):
  - 인증 플로우 (가입/로그인/OAuth/로그아웃)
  - 일기 CRUD + 태그 자동완성 + 검색 + 피드 + 마인드맵
  - 리텐션 기능 (스트릭/회고/챌린지/리포트)
  - 회원 탈퇴 후 캐시 초기화 및 로그인 전환
- [ ] **에러 핸들링 점검**: 네트워크 오류, 401 만료, 404 페이지, 500 서버 에러 시 사용자 친화적 UI
- [ ] **로딩 상태 점검**: 모든 데이터 로딩 구간에 Skeleton 또는 Spinner 적용 확인
- [ ] **SEO 메타데이터 확인**:
  - 공개 피드 페이지: `<title>`, `<meta description>`, OG 태그
  - 공개 프로필 / 챌린지 상세 / 써클 상세 / 트렌딩 페이지 메타데이터
  - 리포트 공유 페이지: OG 이미지
  - robots.txt, sitemap.xml

### 24주차 — 베타 오픈

- [ ] **개인정보처리방침 / 이용약관 페이지** (`src/app/terms/page.tsx`, `src/app/privacy/page.tsx`): 정적 페이지
- [ ] **온보딩 플로우 구현** (첫 로그인 사용자):
  - 서비스 소개 슬라이드 (3~4장)
  - 관심 태그 선택 (초기 태그 3개 이상 선택 유도)
  - "첫 일기 쓰러 가기" CTA
- [ ] **인앱 피드백 수집 위젯**: 간단한 피드백 폼 (페이지 우하단 플로팅 버튼)
- [ ] prod 빌드 및 배포 확인 (`next build && next start` 또는 Vercel 배포)
- [ ] Lighthouse 성능 점수 확인 (목표: Performance 90+, Accessibility 90+)

---

*각 태스크 완료 시 체크박스를 `[x]`로 변경하세요.*
