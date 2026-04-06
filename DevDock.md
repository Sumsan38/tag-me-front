# 태그 기반 소셜 일기 플랫폼 개발 기획서

> 작성일: 2026년 3월  
> 버전: v1.0 (일기 완성 후 태그 기반 피드 추천 기능 추가)

---

## 1. 프로젝트 개요

### 1.1 서비스 개요

**태그 기반 소셜 일기 플랫폼**은 사용자가 일상의 감정·경험·생각을 태그로 기록하고, 이를 마인드맵으로 시각화하며, 비슷한 관심사를 가진 사람들과 연결되는 웹 서비스입니다.

### 1.2 핵심 가치

- **기록**: 일기 작성뿐 아니라 좋아요·댓글 등 소셜 인터랙션도 태그 데이터로 축적되어 부담 없이 마인드맵을 형성할 수 있다.
- **시각화**: 쌓인 태그를 마인드맵으로 보여줘 자신의 삶의 패턴을 발견하게 한다.
- **연결**: 비슷한 태그를 가진 사용자를 추천해 자연스러운 커뮤니티를 형성한다.

### 1.3 리텐션 설계 방향

사용자가 오래 머무는 서비스를 만들기 위해 다음 3단계 루프를 기능 설계의 중심에 둔다.

```
기록할 이유 제공          기록한 보람 제공            함께하는 재미 제공
(프롬프트 / 스트릭)  →   (회고 카드 / 월간 리포트)  →  (챌린지 / 태그 친구)
        └─────────────────────────────────────────────┘
                         재방문 & 장기 사용
```

| 이탈 구간 | 원인 | 대응 전략 |
|-----------|------|-----------|
| Day 1~3 | 기록 습관 미형성 | 스트릭, 오늘의 태그 프롬프트, **좋아요·댓글만으로도 마인드맵 형성 가능** |
| Day 7~14 | 흥미 감소, 소속감 부재 | 챌린지, 익명 공감 피드, 태그 친구 |
| Day 30+ | 콘텐츠 반복, 피드백 없음 | 회고 카드, 월간 리포트, Lock-in 심화 |

### 1.4 타겟 사용자

- 꾸준히 일기를 쓰고 싶지만 부담감을 느끼는 사람
- 자신의 생각과 감정의 흐름을 정리하고 싶은 사람
- 비슷한 관심사를 가진 사람들과 가볍게 연결되길 원하는 사람

---

## 2. 기능 요구사항

### 2.1 Private 기능 — 개인 일기장

| 기능 | 설명 |
|------|------|
| 일기 작성 | 텍스트 형식의 일기 작성, 날짜 자동 기록 |
| 태그 입력 | 일기마다 태그 추가 가능, 자동완성 제공 |
| 태그 메타데이터 | 태그별 입력 날짜, 연결된 태그 목록 관리 |
| 일기 목록/조회 | 날짜 및 태그 기준 필터링 |
| **🔥 스트릭 & 습관 트래커** | 연속 기록 일수 시각화, 끊기면 복귀 푸시 알림 발송 |
| **📅 오늘의 태그 프롬프트** | 매일 태그 1개를 제안해 기록 시작 장벽 제거 |
| **🗓️ 회고 카드 — "1년 전 오늘"** | 과거 같은 날 기록을 카드 형태로 알림, 기록이 쌓일수록 가치 상승 |

### 2.2 Public 기능 — 소셜 피드

| 기능 | 설명 |
|------|------|
| 게시글 작성 | 텍스트(몇 줄) + 이미지(복수) 형식 |
| 태그 입력 | 게시글별 태그 추가, 자동완성 제공 |
| 피드 조회 | 팔로우 기반 / 전체 공개 피드 |
| 좋아요 | 게시글 좋아요 시 **해당 게시글의 태그가 내 마인드맵에 자동 기록** |
| 댓글 | 댓글 작성 시 **해당 게시글의 태그가 내 마인드맵에 자동 기록** |
| **✍️ 일기 완성 후 피드 추천** | 일기 작성 완료 시 작성한 태그와 일치하는 공개 게시글을 즉시 추천 ("오늘 #여행 을 기록했어요 — 비슷한 이야기를 나눈 사람들") |
| **💬 태그 기반 익명 공감 피드** | 동일 태그를 기록한 사람 수 표시 ("오늘 #번아웃을 기록한 사람이 47명") |
| **📊 월간 리포트 카드** | 월말 TOP 태그·활동 통계를 인포그래픽으로 생성, SNS 공유 기능 포함 |

> **설계 원칙**: 좋아요·댓글로 수집된 태그는 `interaction_source = 'like' | 'comment'`로 구분 저장한다. 마인드맵에서는 직접 작성한 태그와 시각적으로 구별(색상·투명도 차등)하여 출처를 확인할 수 있게 한다.

> **일기 완성 후 피드 추천 설계**
> - 트리거: 일기 저장 완료(`DiaryCreatedEvent`) 시 해당 일기의 태그 목록을 추출
> - 쿼리: `tags[]` 중 하나 이상 일치하는 공개 게시글을 Elasticsearch에서 조회, 최신순 + 태그 일치 수 내림차순 정렬
> - 응답: 최대 10개 게시글 카드 (제목, 태그, 작성자 닉네임, 일치 태그 하이라이팅)
> - 캐시: 동일 태그 조합 추천 결과를 Redis에 10분 캐싱 (`feed:recommend:{tagHash}`)
> - UX: 일기 저장 완료 화면 하단에 "이런 이야기도 있어요" 섹션으로 노출, 피드 이동은 선택 사항

### 2.3 태그 시스템

| 기능 | 설명 |
|------|------|
| 자동완성 | 기존에 입력한 태그를 기반으로 자동완성 제안 |
| 태그 메타데이터 | 입력 날짜, 연결된 태그, 연결된 게시글/일기 목록 |
| 써클(Circle) 생성 | **복수의 태그 집합**으로 써클(소그룹) 생성 가능 (예: #러닝 + #새벽 + #건강으로 "새벽 러너" 써클) |
| 써클 활동 기록 | 써클별 태그 및 활동 이력 저장 |
| **🏆 태그 기반 챌린지** | **복수의 태그 집합**으로 N일 챌린지 생성, 참여자 피드 공유 및 완주 뱃지 지급 (예: #운동 + #식단으로 "30일 건강 챌린지") |

### 2.4 마인드맵 페이지

마인드맵은 직접 작성한 태그뿐 아니라 **소셜 인터랙션(좋아요·댓글)에서 수집된 태그까지 통합**하여 표시한다. 일기를 전혀 쓰지 않아도 피드 활동만으로 마인드맵이 형성되어 진입 부담을 낮춘다.

마인드맵은 두 가지 데이터로 구성된다. **노드**(태그 자체)는 `diary_tags` · `feed_tags` · `user_tag_interactions`를 UNION하여 내가 사용하거나 인터랙션한 태그 목록을 조회한다. **엣지**(태그 간 연결)는 `tag_co_occurrences`에서 태그 쌍의 출현 횟수를 집계하여 가중치와 출처를 함께 반환한다.

| 기능 | 설명 |
|------|------|
| 태그 시각화 | 주별 / 월별 / 연도별 입력 태그를 마인드맵으로 표시 |
| **태그 출처 시각화** | 직접 작성 태그(진한 색) vs 좋아요·댓글 태그(연한 색·아이콘 구분). 노드 색상은 `user_tag_interactions.source` 및 `diary_tags` / `feed_tags` 출처로 결정, 엣지 스타일은 `tag_co_occurrences.source_type`으로 결정 |
| 태그 클릭 | 해당 태그가 포함된 일기(`diary_tags`)·게시글(`feed_tags`)·인터랙션(`user_tag_interactions`) 목록 노출, 출처별 탭 구분 |
| 기간 필터 | 주 / 월 / 연도 단위 전환 (`tag_co_occurrences.occurred_at` 범위 쿼리) |
| **출처 필터** | 전체 / 직접 작성 / 좋아요 / 댓글 별도 필터링 (`tag_co_occurrences.source_type` WHERE 조건) |

### 2.5 사용자 추천 & 연결

| 기능 | 설명 |
|------|------|
| 유사 사용자 추천 | 공통 태그 수를 기반으로 비슷한 유저 추천 |
| 추천 알고리즘 | 태그 빈도 + 최근 활동 가중치 적용 |
| **🤝 1:1 태그 친구 매칭** | 동일 태그로 꾸준히 기록 중인 유저와 1:1 매칭, 짧은 응원 메시지 교환 가능 |

### 2.6 통합 검색

일기(Private)와 소셜 피드(Public) 모두 **제목 + 본문 + 태그를 동시에 검색**할 수 있는 통합 검색 기능을 제공한다. 검색 엔진은 Elasticsearch를 활용하며, 기존 태그 자동완성 인프라를 공유한다.

| 기능 | 설명 |
|------|------|
| 일기 통합 검색 | 내 일기의 제목·본문·태그를 동시에 검색, 본인만 조회 가능 |
| 피드 통합 검색 | 공개 게시글의 제목·본문·태그를 동시에 검색 |
| 복합 쿼리 처리 | 제목/본문/태그 각 필드에 가중치를 부여해 관련도 순 정렬 |
| 태그 하이라이팅 | 검색 결과에서 일치하는 키워드 강조 표시 |
| 검색 필터 | 기간, 태그, 작성자 등 조건 조합 필터 |
| 검색어 자동완성 | 검색창 입력 중 태그·제목 자동완성 제안 |

**Elasticsearch 인덱스 설계 방향**

```
[diary 인덱스]                    [feed 인덱스]
- title        (weight: 1)       - content      (weight: 1)
- content      (weight: 1)       - tags[]       (weight: 2)
- tags[]       (weight: 2)       - is_public    (공개 여부 필터)
- user_id      (private 필터)    - created_at   (기간 필터)
- created_at   (기간 필터)
※ Feed에는 title 필드 없음. Diary title은 content와 동일 가중치(×1)로 검색에 포함.
```

### 2.6.1 검색/추천 정렬 규칙

검색과 추천은 모두 Elasticsearch 기반이지만, 사용자 기대 일관성을 위해 정렬 우선순위를 명시적으로 고정한다.

| 대상 | 1순위 | 2순위 | 3순위 | 비고 |
|------|------|------|------|------|
| 통합 검색 | 텍스트 관련도(score) | 최신성(`created_at DESC`) | 인기 지표(좋아요/댓글 수) | score 동점 시 최신순 우선 |
| 태그 자동완성 | prefix 정확도 | 사용 빈도 | 최근 사용 시점 | 동일 prefix면 자주 쓰는 태그 우선 |
| 일기 완성 후 피드 추천 | 태그 일치 수 | 최신성(`created_at DESC`) | 인기 지표(좋아요 수) | 최대 10개 반환 |
| 연관 태그 추천 | 공출현 횟수 | 최근성 | 태그 전체 사용 빈도 | 동일 공출현 수면 최근 활동 우선 |

### 2.6.2 태그 정규화 규칙

태그는 자동완성, 검색, 추천, 집계의 기준 키이므로 입력값과 저장값을 분리해 일관되게 정규화한다.

| 항목 | 규칙 |
|------|------|
| 입력 허용 문자 | 한글, 영문, 숫자, 공백, 밑줄(`_`), 하이픈(`-`) |
| 저장 전 정규화 | 앞뒤 공백 제거, 연속 공백 1칸 축소, 영문 소문자화 |
| `#` prefix | 사용자 입력에는 선택 사항, 저장 시 canonical 값에는 제거하고 표시 시 붙인다 |
| 특수문자 처리 | `#`, `_`, `-`를 제외한 특수문자는 제거 |
| 최대 길이 | 30자 |
| 최소 길이 | 1자 |
| 중복 처리 | 같은 요청 내 중복 태그는 1개만 유지 |
| 표시값(display) | 원본 대소문자를 유지한 정규화 문자열 (DB `display_name` 컬럼에 저장) |
| 저장값(canonical) | 검색/집계/중복 체크에 사용하는 소문자 정규화 값 (DB `name` 컬럼에 저장) |

예시:
- 입력 `# 여행 ` → canonical `여행`, display `여행`
- 입력 ` Burn Out ` → canonical `burn out`, display `Burn Out`
- 입력 `러닝!!!` → canonical `러닝`, display `러닝`
- 입력 `React` → canonical `react`, display `React`

### 2.7 기능 우선순위 요약

| 우선순위 | 기능 | 개발 난이도 | 리텐션 임팩트 |
|--------|------|-----------|------------|
| ⭐⭐⭐ 1차 | 스트릭 & 습관 트래커 | 낮음 | 매우 높음 |
| ⭐⭐⭐ 1차 | 오늘의 태그 프롬프트 | 낮음 | 높음 |
| ⭐⭐⭐ 1차 | 회고 카드 ("1년 전 오늘") | 낮음 | 매우 높음 |
| ⭐⭐⭐ 1차 | 통합 검색 (제목+본문+태그) | 중간 | 높음 |
| ⭐⭐⭐ 1차 | **일기 완성 후 피드 추천** | 중간 | 높음 (소셜 유입 유도) |
| ⭐⭐ 2차 | 태그 기반 챌린지 | 중간 | 높음 |
| ⭐⭐ 2차 | 월간 리포트 카드 | 중간 | 높음 (바이럴) |
| ⭐ 3차 | 태그 기반 익명 공감 피드 | 중간 | 중간 |
| ⭐ 3차 | 1:1 태그 친구 매칭 | 높음 | 높음 |

### 2.8 인증/계정 정책

Identity 구현의 해석 차이를 줄이기 위해 계정 정책을 아래와 같이 고정한다.

| 항목 | 정책 |
|------|------|
| 가입 방식 | 이메일/비밀번호 가입 + Google OAuth + Kakao OAuth 지원 |
| 계정 식별 기준 | 이메일을 기본 식별자로 사용 |
| 소셜 최초 로그인 | 해당 provider에서 이메일 제공 시 기존 이메일 계정과 연결 가능 |
| 소셜 계정 연결 | 동일 이메일이 이미 존재하면 새 계정을 만들지 않고 기존 계정에 provider 연결 |
| provider 미제공 이메일 | 임시 식별자로 가입하지 않고 추가 사용자 확인 절차 필요 |
| 닉네임 초기값 | 소셜 기본 프로필명 사용, 중복 시 난수 suffix 부여 |
| 비밀번호 정책 | 이메일 가입 계정만 비밀번호 보유, 소셜 전용 계정은 비밀번호 없음 |
| 비밀번호 변경 | 현재 비밀번호 검증 후 새 비밀번호로 변경. 소셜 전용 계정은 비밀번호 변경 불가 (`PASSWORD_NOT_SUPPORTED` 에러) |
| 비밀번호 재설정 (찾기) | 가입 이메일로 재설정 토큰 발송 → 토큰 검증 후 새 비밀번호 설정. 토큰은 Redis 저장 (TTL 30분, 1회 사용 후 즉시 삭제). 소셜 전용 계정은 재설정 불가 |
| 로그아웃 | Access Token 블랙리스트 처리 + Refresh Token 삭제 |
| 회원 탈퇴 | soft delete (`is_deleted=true`, `deleted_at` 기록) → Refresh Token 삭제 + Access Token 블랙리스트 등록 → `UserWithdrawnEvent` 발행. 비밀번호 확인 필수 (소셜 전용 계정은 비밀번호 없이 탈퇴 가능) |
| 탈퇴 시 데이터 처리 | 개인 일기 즉시 삭제, 공개 게시글 익명화, PII(이메일·전화번호) 물리 삭제, 관련 Redis 키 정리 — 각 도메인의 `UserWithdrawnEvent` 리스너에서 처리 |
| 재가입 정책 | 탈퇴 후 동일 이메일 재가입 30일 유예 후 허용 (`deleted_at` + 30일 기준). 유예 기간 내 가입 시도 시 `WITHDRAWAL_COOLDOWN` 에러 |
| 탈퇴 후 소셜 재인증 | 유예 기간 중 소셜 재로그인 시 계정 복구 미지원 (초기 버전). 동일 이메일 신규 가입 차단과 동일 정책 적용 |

### 2.9 권한 정책

역할은 단순하게 시작하되, 리소스별 접근 범위를 명확히 정의한다.

| 역할 | 설명 |
|------|------|
| Guest | 비로그인 사용자 |
| User | 일반 로그인 사용자 |
| Admin | 운영/제재/고객지원 목적의 관리자 |

| 리소스 | Guest | User | Admin |
|------|------|------|------|
| 공개 피드 조회 | 가능 | 가능 | 가능 |
| 공개 프로필 조회 | 가능 | 가능 | 가능 |
| 개인 일기 조회/수정/삭제 | 불가 | 본인만 가능 | 정책상 제한적 접근 |
| 게시글 작성/수정/삭제 | 불가 | 본인만 가능 | 제재 목적 접근 가능 |
| 댓글/좋아요 | 불가 | 가능 | 가능 |
| 알림 조회/읽음 처리 | 불가 | 본인만 가능 | 제한적 접근 |
| 회원 탈퇴 | 불가 | 본인만 가능 | 대행 처리 가능 |
| 신고/차단 처리 | 불가 | 본인 신고 가능 | 전체 처리 가능 |

### 2.10 알림 정책

알림은 인앱 알림과 배치 기반 알림을 분리하고, 중복 발송 방지 기준을 갖는다.

| 항목 | 정책 |
|------|------|
| 채널 | 인앱 알림 기본, 푸시 알림은 추후 FCM 연동 |
| 생성 방식 | 실시간 이벤트 기반 + 배치 생성형(스트릭, 회고, 트렌딩) 병행 |
| 중복 방지 키 | `userId + type + referenceId + date` 조합 |
| 읽음 처리 | 인앱 알림 개별 읽음 + 미읽음 개수 제공 |
| 실패 재시도 | 배치 알림은 재시도 가능, 실시간 알림은 로그 적재 후 후속 복구 |
| 보존 기간 | 기본 90일, 이후 soft delete 또는 archive 정책 적용 |

### 2.11 데이터 보존/삭제 정책

운영과 개인정보 처리 일관성을 위해 데이터별 보존 기준을 둔다.

| 데이터 | 기본 정책 |
|------|------|
| 개인 일기 | 사용자 탈퇴 시 즉시 삭제 |
| 공개 게시글 | 탈퇴 시 익명화 후 유지 |
| 댓글/좋아요 | 탈퇴 또는 삭제 이벤트에 따라 익명화 또는 soft delete |
| 알림 | 90일 보관 후 정리 |
| 업로드 이미지 | 게시글/프로필 참조 해제 후 정리 배치 대상 |
| 월간 리포트 이미지 | 공유 중인 경우 유지, 공유 해제 또는 만료 시 삭제 가능 |
| 태그 상호작용 데이터 | 통계 목적 최소 범위 유지, 탈퇴 시 개인 식별 가능 정보 제거 또는 정리 |
| 응원 메시지 | 신고/분쟁 대응 기간 고려해 제한 보관 후 삭제 |

### 2.12 태그 친구 안전 정책

1:1 태그 친구 기능은 소규모 메시징 성격이 있으므로 안전 정책을 명시한다.

| 항목 | 정책 |
|------|------|
| 매칭 수락 방식 | 초기 버전은 상호 조건 충족 시 자동 매칭, 이후 수락형 전환 검토 |
| 차단 | 사용자는 상대를 차단할 수 있으며, 차단 시 기존 매칭 해제 |
| 신고 | 메시지/상대 사용자 신고 기능 제공 |
| 메시지 제한 | 텍스트만 허용, 100자 제한 |
| 만료 | 일정 기간 상호작용이 없으면 매칭 자동 종료 가능 |
| 재매칭 | 차단 관계가 아니고 기존 매칭 종료 후 조건 충족 시 가능 |

---

## 3. 기술 스택 및 아키텍처

### 3.1 기술 스택 요약

| 영역 | 기술 |
|------|------|
| **Frontend** | Next.js (React), TypeScript, TailwindCSS |
| **Backend** | Java 17, Spring Boot 3, Spring Security, Spring Data JPA + MyBatis (DDD + 헥사고날 아키텍처) |
| **주 데이터베이스** | PostgreSQL 16 (AWS RDS) — Write DB (Primary) + Read DB (Read Replica) |
| **캐시 / 세션** | Redis 7 (AWS ElastiCache) |
| **검색 / 자동완성** | Elasticsearch 8 (AWS OpenSearch 또는 자체 구축) |
| **파일 스토리지** | AWS S3 + CloudFront (CDN) |
| **컨테이너 오케스트레이션** | Kubernetes (AWS EKS) |
| **컨테이너 이미지** | Docker + AWS ECR |
| **CI/CD** | GitHub Actions |
| **모니터링** | Prometheus + Grafana, Sentry |
| **마인드맵 시각화** | D3.js |

---

### 3.2 기술별 활용 명세

#### 3.2.1 Next.js (Frontend)

Next.js를 단순 React 래퍼가 아닌 렌더링 전략을 기능별로 나눠 성능을 최적화한다.

| 활용 전략 | 적용 화면 | 이유 |
|-----------|-----------|------|
| **SSR** (서버사이드 렌더링) | 공개 피드, 사용자 프로필 | SEO 노출 및 초기 로딩 속도 |
| **CSR** (클라이언트 렌더링) | 개인 일기장, 마인드맵 | 인증 필요 페이지, 인터랙티브 시각화 |
| **ISR** (증분 정적 재생성) | 트렌딩 태그 페이지 | 1시간 단위 갱신, 서버 부하 최소화 |
| **API Routes** | 이미지 리사이징 프록시 | S3 Pre-signed URL 발급 중계 |

추가 활용 포인트로 `next/image`로 이미지 자동 최적화(WebP 변환, lazy loading)를 적용하고, `next/font`로 폰트 사전 로드를 처리한다.

---

#### 3.2.2 Spring Boot (Backend)

백엔드는 **DDD(Domain-Driven Design)** 와 **헥사고날 아키텍처(Ports & Adapters)** 를 기반으로 설계한다. 비즈니스 도메인 로직을 외부 기술(DB, Redis, ES, HTTP)로부터 완전히 분리하여 테스트 용이성과 장기 유지보수성을 확보하는 것이 목표다.

**헥사고날 아키텍처 레이어 구조**

```
┌─────────────────────────────────────────────────────┐
│                   Adapters (외부)                     │
│                                                       │
│  [Inbound]                      [Outbound]            │
│  - REST Controller              - JPA Repository      │
│  - Spring Batch Job             - RedisTemplate       │
│  - Spring Event Listener        - ES Repository       │
│                                 - S3 Client           │
│                                 - OAuth Client        │
└──────────────┬──────────────────────────┬────────────┘
               │  Ports (인터페이스)        │
               ▼                           ▼
┌──────────────────────────────────────────────────────┐
│              Application Layer (Use Cases)            │
│  - DefaultDiaryService   - DefaultTagService   - DefaultFeedService        │
│  - DefaultMindmapService - DefaultSearchService - DefaultChallengeService  │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│                  Domain Layer (순수 Java)              │
│                                                       │
│  [Aggregates]         [Value Objects]   [Domain Events]│
│  - Diary              - Tag             - DiaryCreated │
│  - Feed               - TagSet          - LikeAdded    │
│  - User               - Streak          - CommentAdded │
│  - Circle             - MindmapNode                   │
│  - Challenge                                          │
└──────────────────────────────────────────────────────┘
```

**DDD 도메인 경계 (Bounded Context)**

| Bounded Context | 책임 | 주요 Aggregate |
|----------------|------|---------------|
| **Identity** | 회원가입, 로그인, 인증 | `User` |
| **Diary** | 개인 일기 CRUD, 태그 기록 | `Diary`, `DiaryTag` |
| **Feed** | 공개 게시글, 좋아요, 댓글 | `Feed`, `Like`, `Comment` |
| **Tag** | 태그 메타데이터, 자동완성, 연관 태그 | `Tag`, `TagCoOccurrence` |
| **Mindmap** | 태그 집계, 마인드맵 시각화 데이터 | `MindmapSnapshot` |
| **Social** | 써클, 챌린지, 팔로우, 유저 추천 | `Circle`, `CircleTag`, `Challenge`, `ChallengeTag` |
| **Notification** | 스트릭 알림, 회고 카드, 트렌딩 알림 | `Notification` |

**전체 프로젝트 패키지 구조 (MSA 분리를 고려한 도메인별 모듈 구성)**

추후 MSA로 전환 시 각 도메인 패키지를 독립 서비스로 분리할 수 있도록, 현재 모놀리식 구조에서도 도메인 간 직접 의존을 금지하고 패키지를 완전히 격리한다. 도메인 간 통신은 도메인 이벤트(`ApplicationEvent`) 또는 Port 인터페이스를 통해서만 허용한다.

```
com.tagdiary/
│
├── identity/                        ← 회원가입 / 로그인 / 인증
│   ├── domain/
│   │   ├── User.java                   ← Aggregate Root
│   │   ├── UserEmail.java              ← Value Object
│   │   └── event/
│   │       └── UserRegisteredEvent.java
│   ├── application/
│   │   ├── port/
│   │   │   ├── in/
│   │   │   │   ├── RegisterUserUseCase.java
│   │   │   │   └── LoginUseCase.java
│   │   │   └── out/
│   │   │       ├── SaveUserPort.java
│   │   │       └── LoadUserPort.java
│   │   └── service/
│   │       └── DefaultUserService.java
│   └── adapter/
│       ├── in/web/
│       │   └── AuthController.java
│       └── out/persistence/
│           ├── UserJpaRepository.java
│           └── UserPersistenceAdapter.java
│
├── diary/                           ← 개인 일기 CRUD / 태그 기록
│   ├── domain/
│   │   ├── Diary.java                  ← Aggregate Root
│   │   ├── DiaryTag.java               ← Entity
│   │   ├── DiaryContent.java           ← Value Object
│   │   └── event/
│   │       └── DiaryCreatedEvent.java
│   ├── application/
│   │   ├── port/
│   │   │   ├── in/
│   │   │   │   ├── CreateDiaryUseCase.java
│   │   │   │   ├── UpdateDiaryUseCase.java
│   │   │   │   └── DeleteDiaryUseCase.java
│   │   │   └── out/
│   │   │       ├── SaveDiaryPort.java
│   │   │       └── LoadDiaryPort.java
│   │   └── service/
│   │       └── DefaultDiaryService.java
│   └── adapter/
│       ├── in/web/
│       │   └── DiaryController.java
│       └── out/persistence/
│           ├── DiaryJpaRepository.java
│           └── DiaryPersistenceAdapter.java
│
├── feed/                            ← 공개 게시글 / 좋아요 / 댓글
│   ├── domain/
│   │   ├── Feed.java                   ← Aggregate Root
│   │   ├── Comment.java                ← Entity
│   │   ├── Like.java                   ← Entity
│   │   └── event/
│   │       ├── LikeAddedEvent.java
│   │       ├── CommentAddedEvent.java
│   │       └── CommentDeletedEvent.java
│   ├── application/
│   │   ├── port/
│   │   │   ├── in/
│   │   │   │   ├── CreateFeedUseCase.java
│   │   │   │   ├── LikeFeedUseCase.java
│   │   │   │   └── AddCommentUseCase.java
│   │   │   └── out/
│   │   │       ├── SaveFeedPort.java
│   │   │       └── LoadFeedPort.java
│   │   └── service/
│   │       ├── DefaultFeedService.java
│   │       ├── DefaultLikeService.java
│   │       └── DefaultCommentService.java
│   └── adapter/
│       ├── in/web/
│       │   └── FeedController.java
│       └── out/persistence/
│           ├── FeedJpaRepository.java
│           └── FeedPersistenceAdapter.java
│
├── tag/                             ← 태그 메타데이터 / 자동완성 / 연관 태그
│   ├── domain/
│   │   ├── Tag.java                    ← Aggregate Root
│   │   ├── TagCoOccurrence.java        ← Entity
│   │   └── TagName.java                ← Value Object
│   ├── application/
│   │   ├── port/
│   │   │   ├── in/
│   │   │   │   ├── AutoCompleteTagUseCase.java
│   │   │   │   └── GetRelatedTagsUseCase.java
│   │   │   └── out/
│   │   │       ├── SaveTagPort.java
│   │   │       ├── LoadTagPort.java
│   │   │       └── SearchTagPort.java  ← ES Outbound Port
│   │   └── service/
│   │       └── DefaultTagService.java
│   └── adapter/
│       ├── in/web/
│       │   └── TagController.java
│       └── out/
│           ├── persistence/
│           │   ├── TagJpaRepository.java
│           │   └── TagPersistenceAdapter.java
│           └── search/
│               └── TagElasticsearchAdapter.java
│
├── mindmap/                         ← 태그 집계 / 마인드맵 시각화
│   ├── domain/
│   │   ├── MindmapSnapshot.java        ← Aggregate Root
│   │   ├── MindmapNode.java            ← Value Object
│   │   └── MindmapEdge.java            ← Value Object
│   ├── application/
│   │   ├── port/
│   │   │   ├── in/
│   │   │   │   └── GetMindmapUseCase.java
│   │   │   └── out/
│   │   │       ├── LoadTagInteractionPort.java
│   │   │       └── CacheMindmapPort.java ← Redis Outbound Port
│   │   └── service/
│   │       └── DefaultMindmapService.java
│   └── adapter/
│       ├── in/web/
│       │   └── MindmapController.java
│       └── out/
│           ├── persistence/
│           │   └── MindmapPersistenceAdapter.java
│           └── cache/
│               └── MindmapRedisAdapter.java
│
├── social/                          ← 써클 / 챌린지 / 팔로우 / 유저 추천
│   ├── domain/
│   │   ├── Circle.java                 ← Aggregate Root
│   │   ├── Challenge.java              ← Aggregate Root
│   │   ├── Follow.java                 ← Entity
│   │   └── event/
│   │       └── ChallengeCompletedEvent.java
│   ├── application/
│   │   ├── port/
│   │   │   ├── in/
│   │   │   │   ├── CreateCircleUseCase.java
│   │   │   │   ├── JoinChallengeUseCase.java
│   │   │   │   └── RecommendUserUseCase.java
│   │   │   └── out/
│   │   │       ├── SaveCirclePort.java
│   │   │       └── LoadSimilarUserPort.java
│   │   └── service/
│   │       ├── DefaultCircleService.java
│   │       ├── DefaultChallengeService.java
│   │       └── DefaultUserRecommendService.java
│   └── adapter/
│       ├── in/web/
│       │   └── SocialController.java
│       └── out/persistence/
│           └── SocialPersistenceAdapter.java
│
├── notification/                    ← 스트릭 알림 / 회고 카드 / 트렌딩 알림
│   ├── domain/
│   │   ├── Notification.java           ← Aggregate Root
│   │   └── NotificationType.java       ← Enum (STREAK / RETROSPECT / TRENDING)
│   ├── application/
│   │   ├── port/
│   │   │   ├── in/
│   │   │   │   └── SendNotificationUseCase.java
│   │   │   └── out/
│   │   │       └── PushNotificationPort.java
│   │   └── service/
│   │       └── DefaultNotificationService.java
│   └── adapter/
│       ├── in/
│       │   └── batch/
│       │       └── StreakBatchAdapter.java  ← Spring Batch Inbound
│       └── out/
│           └── push/
│               └── FcmPushAdapter.java
│
└── search/                          ← 통합 검색 (일기 + 피드 + 태그)
    ├── domain/
    │   └── SearchResult.java           ← Value Object
    ├── application/
    │   ├── port/
    │   │   ├── in/
    │   │   │   └── SearchUseCase.java
    │   │   └── out/
    │   │       └── SearchPort.java      ← ES Outbound Port
    │   └── service/
    │       └── DefaultSearchService.java
    └── adapter/
        ├── in/web/
        │   └── SearchController.java
        └── out/search/
            └── ElasticsearchSearchAdapter.java
```

> **MSA 전환 원칙**: 각 도메인 패키지는 독립적으로 컴파일·빌드 가능한 구조를 유지한다. 도메인 간 직접 클래스 참조를 금지하고, 이벤트 또는 Port 인터페이스로만 소통한다. 추후 분리 시 `identity/`, `diary/`, `feed/` 등 각 패키지를 별도 Spring Boot 프로젝트로 추출하고, `ApplicationEvent`를 Kafka 메시지로 전환하는 방식으로 MSA를 완성한다.

**Spring 모듈별 활용**

| 모듈 | 활용 내용 |
|------|-----------|
| **Spring Security** | JWT 필터 체인 구성, OAuth 2.0 소셜 로그인, 메서드 수준 `@PreAuthorize` |
| **Spring Data JPA** | Outbound Adapter 구현, Write DB(Primary) 및 Read DB(Replica) 모두 접근 가능. QueryDSL로 복잡한 태그 집계 쿼리 타입 안전하게 작성 |
| **MyBatis** | 복잡한 조회 전용 쿼리(통계·리포트·마인드맵 집계 등)에 활용. `AbstractRoutingDataSource` 기반 라우팅으로 **Read DB(Replica)에만 접근**하도록 제한 |
| **AbstractRoutingDataSource** | 요청 컨텍스트(읽기/쓰기)에 따라 DataSource를 동적으로 분기. JPA는 write/read 모두 허용, MyBatis는 read 전용 DataSource로 고정 라우팅 |
| **Spring Data Redis** | RedisTemplate / `@Cacheable` 어노테이션으로 캐시 Outbound Adapter 구성 |
| **Spring Data Elasticsearch** | ES 인덱스 매핑, 일기·피드 멀티 필드 검색 쿼리 빌더 |
| **Spring Batch** | 월간 리포트 생성, 트렌딩 태그 집계, 스트릭 만료 처리 등 배치 Inbound Adapter |
| **Spring Events** | 도메인 이벤트(`LikeAdded`) 발행 → `user_tag_interactions` 비동기 기록 |
| **Actuator + Micrometer** | `/actuator/prometheus` 엔드포인트로 Prometheus 메트릭 노출 |

> **Spring Batch 활용 상세**: 매일 자정 스트릭 계산 Job, 매시간 트렌딩 태그 집계 Job, 매월 말 리포트 카드 생성 Job을 Kubernetes CronJob으로 스케줄링한다.

> **DataSource 라우팅 상세**
>
> ```
> [요청 흐름]
>
> JPA (Outbound Adapter)
>   ├── @Transactional(readOnly = false)  →  Write DataSource (Primary)
>   └── @Transactional(readOnly = true)   →  Read DataSource (Replica)
>
> MyBatis (Outbound Adapter)
>   └── 항상 Read DataSource (Replica) 고정
>       — 복잡한 집계·통계·리포트 조회 전용
> ```
>
> `AbstractRoutingDataSource`를 구현한 `RoutingDataSource` 빈을 정의하고, `TransactionSynchronizationManager.isCurrentTransactionReadOnly()` 값을 키로 삼아 DataSource를 분기한다. MyBatis용 `SqlSessionFactory`는 Read DataSource를 직접 주입받아 라우팅 없이 Replica에 고정한다.

---

#### 3.2.3 PostgreSQL

Write DB(Primary)와 Read DB(Read Replica) 2개를 운영하며, 접근 방식에 따라 역할을 명확히 분리한다.

| 활용 포인트 | 상세 |
|------------|------|
| **Write/Read DB 분리** | Primary(Write)는 INSERT·UPDATE·DELETE 전용, Read Replica는 SELECT 전용으로 트래픽 분산 |
| **JPA 접근 범위** | Write DB와 Read DB 모두 접근 가능. `@Transactional(readOnly = true)` 시 Read DB로 자동 라우팅 |
| **MyBatis 접근 범위** | Read DB(Replica)에만 접근하도록 제한. 복잡한 집계·통계·리포트 조회 쿼리 전용으로 활용 |
| **JSONB 컬럼** | 마인드맵 노드·엣지 스냅샷 저장 (월별 캐싱용) |
| **재귀 CTE** | `tag_co_occurrences` 테이블을 순회해 마인드맵 연결 깊이 탐색 |
| **부분 인덱스** | `WHERE is_deleted = false` 조건부 인덱스로 소프트 삭제 성능 유지 |
| **pg_trgm 확장** | Elasticsearch 도입 전 초기 단계 태그 유사어 검색 보조 |
| **파티셔닝** | `user_tag_interactions` 테이블을 `created_at` 기준 월별 파티션 — 데이터 증가에 대비 |

---

#### 3.2.4 Redis

| 용도 | 자료구조 | Key 패턴 | TTL |
|------|---------|----------|-----|
| Refresh Token 저장 | String | `auth:refresh:{userId}` | 7일 |
| Access Token 블랙리스트 | String | `auth:blacklist:{jti}` | 잔여 유효시간 |
| OAuth state (CSRF 방지) | String | `auth:oauth:state:{state}` | 5분 |
| 비밀번호 재설정 토큰 | String | `auth:password-reset:{token}` | 30분 |
| 일별 태그 사용 횟수 | Sorted Set | `tag:daily:{yyyy-MM-dd}` | 자정 만료 |
| 유저별 오늘 기록 태그 | Hash | `user:tag:daily:{userId}:{date}` | 24시간 |
| 실시간 트렌딩 태그 | Sorted Set | `tag:trending:hourly` | 1시간 |
| 마인드맵 집계 캐시 | String (JSON) | `mindmap:{userId}:{yyyy-MM}` | 1시간 |
| 자동완성 앞단 캐시 | String (JSON) | `autocomplete:{prefix}` | 10분 |
| 챌린지 참여자 수 | String | `challenge:{id}:count` | 챌린지 종료일 |
| 스트릭 카운터 | String | `streak:{userId}` | 자정 체크 |
| **게시글 좋아요 수 캐시** | String | `feed:likes:{feedId}` | **캐시 미스 시 DB 동기화** |
| **일기 완성 후 피드 추천 캐시** | String (JSON) | `feed:recommend:{tagHash}` | **10분** |

> **운영 전략**: ElastiCache Redis Cluster 모드 비활성화(단일 샤드)로 시작 → DAU 5,000 이상 시 Cluster 모드 전환. `maxmemory-policy`는 `allkeys-lru` 설정으로 메모리 초과 시 LRU 방식 자동 퇴거.

---

#### 3.2.5 Elasticsearch

| 활용 포인트 | 상세 |
|------------|------|
| **멀티 필드 가중치 검색** | 제목(×3), 태그(×2), 본문(×1) 필드 부스팅으로 관련도 순 정렬 |
| **한국어 형태소 분석** | `nori` 플러그인 적용 — "여행가고싶다" → "여행", "가다" 분리 검색 |
| **태그 자동완성** | `edge_ngram` 토크나이저로 접두어 기반 자동완성 (`#여` → `#여행`, `#여름`) |
| **하이라이팅** | `highlight` API로 검색어 일치 구간 강조 반환 |
| **Percolator** | 트렌딩 태그 알림: 사전 정의 쿼리를 등록해두고 새 문서 색인 시 매칭 알림 발송 |
| **데이터 동기화** | PostgreSQL 변경분을 Spring Event → ES 색인 파이프라인으로 준실시간 동기화 |

---

#### 3.2.6 AWS S3 + CloudFront

| 활용 포인트 | 상세 |
|------------|------|
| **Pre-signed URL 업로드** | 클라이언트가 서버를 경유하지 않고 S3에 직접 업로드 (서버 부하 제거) |
| **버킷 구조 분리** | `{userId}/{yyyy/MM/dd}/{uuid}.webp` 경로로 유저별 격리 저장 |
| **이미지 변환** | 업로드 후 Lambda@Edge로 WebP 변환 및 썸네일(400px) 자동 생성 |
| **CloudFront 캐싱** | 이미지 CDN 엣지 캐싱으로 글로벌 응답속도 개선, S3 직접 노출 차단 |
| **월간 리포트 카드** | 생성된 인포그래픽 이미지를 S3에 저장 후 CloudFront URL로 공유 |

---

#### 3.2.7 Kubernetes (AWS EKS)

이 프로젝트에서 Kubernetes를 직접 경험하는 것을 목표로 한다. 초기에는 단순한 구성으로 시작해 점진적으로 고급 기능을 적용한다.

**단계별 도입 전략**

```
Phase 1~2 (초기 개발)    Phase 3~5 (기능 확장)     Phase 6~7 (운영 안정화)
─────────────────────    ──────────────────────    ───────────────────────
로컬: Docker Compose  →  EKS 클러스터 구축       →  HPA / 오토스케일링
(개발 환경 통일)          기본 Deployment 배포       Ingress + TLS 적용
                          ConfigMap / Secret 관리     CronJob 배치 스케줄링
                          Namespace 환경 분리         PodDisruptionBudget
                          (dev / staging / prod)      무중단 Rolling Update
```

**핵심 K8s 리소스 활용 계획**

| 리소스 | 활용 내용 |
|--------|-----------|
| **Deployment** | Spring Boot API 서버 배포, `replicas: 2` 이상으로 고가용성 확보 |
| **HorizontalPodAutoscaler** | CPU 70% 초과 시 Pod 자동 스케일 아웃 (최소 2 ~ 최대 10) |
| **CronJob** | 스트릭 계산(자정), 트렌딩 집계(매시간), 월간 리포트(월말) 배치 스케줄링 |
| **ConfigMap** | 환경별 애플리케이션 설정 분리 (dev / staging / prod) |
| **Secret** | DB 비밀번호, JWT 시크릿, S3 키 등 민감 정보 관리 (AWS Secrets Manager 연동) |
| **Ingress (ALB)** | AWS Load Balancer Controller로 ALB Ingress 구성, TLS 종료 |
| **Namespace** | `dev` / `staging` / `prod` 네임스페이스로 환경 격리 |
| **PodDisruptionBudget** | 배포 중 최소 1개 Pod 항상 유지 — 무중단 배포 보장 |
| **Liveness / Readiness Probe** | `/actuator/health` 엔드포인트로 Pod 헬스체크 |

**로컬 개발 환경 (Docker Compose)**

EKS 구성 전 로컬에서 전체 스택을 통일된 환경으로 실행한다.

```yaml
# docker-compose.yml 구성 서비스
services:
  api:        # Spring Boot
  postgres:   # PostgreSQL 16
  redis:      # Redis 7
  elasticsearch: # ES 8 + nori 플러그인
  kibana:     # ES 데이터 확인용
```

---

#### 3.2.8 GitHub Actions (CI/CD)

```
┌─────────────────────────────────────────────────────────┐
│                    CI/CD 파이프라인                        │
├──────────────┬──────────────────┬───────────────────────┤
│  PR 생성 시   │  main 브랜치 머지  │    배포 후             │
├──────────────┼──────────────────┼───────────────────────┤
│ 단위 테스트   │ Docker 이미지 빌드 │ Smoke Test 자동 실행  │
│ 통합 테스트   │ ECR 푸시          │ Sentry 릴리즈 등록    │
│ 커버리지 체크 │ EKS Rolling Update│ 15분 에러율 감시      │
│ 코드 스타일   │ Slack 배포 알림   │ 임계 초과 시 Rollback │
└──────────────┴──────────────────┴───────────────────────┘
```

| Job | 주요 스텝 |
|-----|-----------|
| **test** | Testcontainers로 PostgreSQL·Redis·ES 실제 구동 후 통합 테스트 |
| **build** | Gradle 빌드 → Docker 멀티스테이지 빌드 (JDK 빌드 → JRE 런타임 이미지 분리) |
| **deploy-staging** | `develop` 브랜치 머지 시 staging 네임스페이스 자동 배포 |
| **deploy-prod** | `main` 브랜치 머지 시 prod 네임스페이스 Rolling Update |
| **rollback** | 에러율 임계 초과 시 이전 이미지 태그로 자동 `kubectl rollout undo` |

---

#### 3.2.9 Prometheus + Grafana (모니터링)

Spring Boot Actuator의 `/actuator/prometheus` 엔드포인트를 Prometheus가 수집하고, Grafana 대시보드로 시각화한다.

| 모니터링 항목 | 메트릭 | 알람 조건 |
|-------------|--------|-----------|
| API 응답시간 | `http_server_requests_seconds` | P95 > 500ms |
| 에러율 | `http_server_requests_errors_total` | 5분간 5% 초과 |
| JVM 메모리 | `jvm_memory_used_bytes` | Heap 85% 초과 |
| DB 커넥션 풀 | `hikaricp_connections_active` | 80% 이상 점유 |
| Redis 히트율 | `redis_keyspace_hits/misses` | 히트율 70% 미만 |
| Pod 수 | `kube_deployment_status_replicas` | 목표 수 미달 시 |

> Grafana 알람은 Slack 채널로 연동해 실시간 이상 감지.

---

### 3.3 시스템 아키텍처 (개요)

```
[사용자 브라우저]
      │
      ▼
[Next.js Frontend (Vercel 또는 S3+CloudFront)]
      │
      ▼
[AWS CloudFront / ALB Ingress]
      │
      ▼
┌─────────────────────────────────┐
│     AWS EKS Cluster             │
│  ┌──────────────────────────┐   │
│  │  Spring Boot API Pods    │   │
│  │  (Deployment × 2~10)     │   │
│  │  HPA 오토스케일링 적용    │   │
│  └──────────┬───────────────┘   │
│             │                   │
│  ┌──────────▼───────────────┐   │
│  │  Spring Batch CronJob    │   │
│  │  (스트릭/트렌딩/리포트)   │   │
│  └──────────────────────────┘   │
└──────────┬──────────────────────┘
           │
   ┌───────┼──────────────┐
   ▼       ▼              ▼
[AWS RDS]              [ElastiCache]  [Elasticsearch]
(PostgreSQL)           (Redis)        (nori 형태소 분석)
(Write DB: Primary  ←  JPA write)    (태그 자동완성/
(Read DB:  Replica  ←  JPA read      통합 검색)
                        MyBatis 전용)
                               │
                    [AWS S3 + CloudFront]
                    (이미지 / 리포트 카드 CDN)

─────────────────────────────────────────
CI/CD (GitHub Actions)
─────────────────────────────────────────
PR       → 테스트 → 커버리지 체크
main 머지 → ECR 푸시 → EKS Rolling Update
배포 후   → Smoke Test → 에러율 감시 → 자동 Rollback
```

### 3.3 핵심 데이터 모델 (ERD 요약)

---

**[users]** — 사용자 계정

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| email | VARCHAR | AES-256 암호화 |
| nickname | VARCHAR | |
| profile_image | VARCHAR | CloudFront URL |
| streak_count | INT | 현재 연속 기록 일수 |
| last_active_at | TIMESTAMP | 스트릭 계산 기준 |
| created_at | TIMESTAMP | |
| is_deleted | BOOLEAN | 소프트 삭제 |
| deleted_at | TIMESTAMP | 탈퇴 일시 (재가입 30일 유예 판별 기준) |

---

**[tags]** — 태그 원장 (전역 고유)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| name | VARCHAR UNIQUE | canonical 소문자 정규화 값 (중복 체크/검색/집계 기준) |
| display_name | VARCHAR | 사용자 입력 원본 대소문자 표기 보존 (UI 표시용) |
| created_at | TIMESTAMP | |

---

**[diaries]** — 개인 일기

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| user_id | BIGINT FK → users | |
| title | VARCHAR | |
| content | TEXT | JPA AttributeConverter를 통한 AES-256 암/복호화 |
| mood | SMALLINT | 1~5 감정 단계 |
| is_deleted | BOOLEAN | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

**[diary_tags]** — 일기 ↔ 태그 N:N

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| diary_id | BIGINT FK → diaries | |
| tag_id | BIGINT FK → tags | |
| created_at | TIMESTAMP | |

---

**[feeds]** — 공개 소셜 게시글

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| user_id | BIGINT FK → users | |
| content | TEXT | |
| is_public | BOOLEAN | |
| is_deleted | BOOLEAN | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

**[feed_tags]** — 게시글 ↔ 태그 N:N

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| feed_id | BIGINT FK → feeds | |
| tag_id | BIGINT FK → tags | |
| created_at | TIMESTAMP | |

---

**[tag_co_occurrences]** — 태그 공동 출현 이력

동일 컨텍스트(일기 1건 또는 게시글 1건)에서 함께 등장한 태그 쌍을 **이벤트 단위**로 기록한다. 집계 숫자를 저장하는 대신 raw 이벤트를 쌓고 마인드맵 조회 시 GROUP BY로 집계하여 기간 필터·유저 필터를 모두 지원한다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| user_id | BIGINT FK → users | 기록한 주체 |
| tag_id_a | BIGINT FK → tags | 태그 쌍 (a < b 정렬로 중복 방지) |
| tag_id_b | BIGINT FK → tags | |
| source_type | ENUM | `'diary'` \| `'feed'` \| `'like'` \| `'comment'` |
| source_id | BIGINT | diary_id 또는 feed_id |
| occurred_at | DATE | 공동 출현 날짜 (기간 필터 기준) |
| is_deleted | BOOLEAN | 태그 제거 시 소프트 삭제 |
| created_at | TIMESTAMP | |

> **태그 쌍 생성 파이프라인 — 출처별 상세**
>
> | 출처 | 트리거 | 태그 목록 소스 | 삽입 주체 |
> |------|--------|--------------|---------|
> | `diary` | `DiaryCreatedEvent` | 이벤트 payload의 태그 목록 (user_tag_interactions 삽입과 동시 처리) | DiaryService |
> | `feed` | `FeedCreatedEvent` | 이벤트 payload의 태그 목록 | FeedService |
> | `like` | `LikeAddedEvent` | 이벤트 payload의 태그 목록 (feed_tags에서 조회 후 payload에 포함) | FeedService |
> | `comment` | `CommentAddedEvent` | 이벤트 payload의 태그 목록 | FeedService |
>
> `user_tag_interactions` 삽입과 `tag_co_occurrences` 쌍 생성은 **동일 이벤트 핸들러에서 순서대로 처리**한다. 태그 목록을 이벤트 payload에 담아 전달하면 두 번의 DB 조회 없이 처리 가능하다.
>
> **태그 수정 처리 (`DiaryUpdatedEvent` / `FeedUpdatedEvent`)**
>
> 수정 이벤트 payload에는 `addedTags[]`(새로 추가된 태그)와 `removedTags[]`(제거된 태그)를 포함한다.
>
> - **태그 추가 시**: `addedTags`와 기존 태그 목록의 쌍을 새로 삽입. `user_tag_interactions`에 추가된 태그 행 삽입
> - **태그 제거 시**: `tag_co_occurrences`에서 `source_id = diaryId/feedId AND (tag_id_a = removedTagId OR tag_id_b = removedTagId)` 조건으로 `is_deleted = true`. `user_tag_interactions`에서 `source_id = diaryId/feedId AND tag_id = removedTagId` 행 `is_deleted = true`
>
> **마인드맵 집계 예시**: `SELECT tag_id_a, tag_id_b, COUNT(*) as weight, source_type FROM tag_co_occurrences WHERE user_id = ? AND occurred_at BETWEEN ? AND ? AND is_deleted = false GROUP BY tag_id_a, tag_id_b, source_type`
>
> **출처 필터 예시**: `WHERE source_type = 'like'` 추가 시 좋아요에서 발생한 엣지만 표시

---

**[user_tag_interactions]** — 사용자 태그 이력 통합 (모든 출처)

사용자가 태그를 접한 모든 경로를 단일 테이블에 기록한다. 일기·게시글 직접 작성뿐 아니라 좋아요·댓글 인터랙션까지 포함하여 마인드맵 노드 집계, 태그 클릭 상세, 출처 필터를 단일 쿼리로 처리할 수 있다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| user_id | BIGINT FK → users | 태그를 접한 주체 |
| tag_id | BIGINT FK → tags | |
| source_type | ENUM | `'diary'` \| `'feed'` \| `'like'` \| `'comment'` |
| source_id | BIGINT | source_type에 따라 diary_id 또는 feed_id |
| occurred_at | DATE | 발생 날짜 (기간 필터 기준) |
| is_deleted | BOOLEAN | 좋아요 취소·댓글 삭제·일기 삭제 시 소프트 삭제 |
| created_at | TIMESTAMP | |

> **삽입 트리거별 상세**
>
> | source_type | 트리거 이벤트 | source_id | 비고 |
> |-------------|-------------|-----------|------|
> | `diary` | `DiaryCreatedEvent` | diary_id | 일기 태그 각 1행 |
> | `feed` | `FeedCreatedEvent` | feed_id | 게시글 태그 각 1행. user_id = 작성자 |
> | `like` | `LikeAddedEvent` | post_id | 해당 게시글의 태그 수만큼 행 삽입. user_id = 좋아요 누른 사람 |
> | `comment` | `CommentAddedEvent` | post_id | 해당 게시글의 태그 수만큼 행 삽입. user_id = 댓글 작성자 |
>
> **소프트 삭제 / 수정 처리 정책**
>
> | 케이스 | 처리 방식 |
> |--------|---------|
> | 좋아요 취소 | `source_type='like' AND source_id=feedId AND user_id=userId` 행 → `is_deleted=true` |
> | 댓글 삭제 (`CommentDeletedEvent`) | `source_type='comment' AND source_id=feedId AND user_id=userId AND created_at=commentCreatedAt` 행 → `is_deleted=true`. `tag_co_occurrences`도 동일 조건으로 소프트 삭제 |
> | 일기 삭제 | `source_type='diary' AND source_id=diaryId` 행 → `is_deleted=true` |
> | 일기 수정 — 태그 제거 | `source_type='diary' AND source_id=diaryId AND tag_id=removedTagId` 행 → `is_deleted=true` |
> | 일기 수정 — 태그 추가 | 추가된 태그 행 신규 삽입 (`DiaryUpdatedEvent.addedTags` 기준) |
> | 게시글 삭제 | `source_type='feed' AND source_id=feedId` 행 → `is_deleted=true` |
> | 게시글 수정 — 태그 제거 | `source_type='feed' AND source_id=feedId AND tag_id=removedTagId` 행 → `is_deleted=true` |
> | 게시글 수정 — 태그 추가 | 추가된 태그 행 신규 삽입 (`FeedUpdatedEvent.addedTags` 기준) |
>
> **primarySource 결정 규칙 (애플리케이션 레이어)**
>
> `primarySource`는 DB 컬럼이 아니라 노드 쿼리 결과(`diary_count`, `feed_count`, `like_count`, `comment_count`)를 기반으로 응답 생성 시점에 계산하는 파생값이다.
> 결정 기준: count가 가장 높은 source_type을 채택. 동점 시 `diary > feed > comment > like` 우선순위를 따른다.

---

**[follows]** — 팔로우 관계

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| follower_id | BIGINT FK → users | |
| following_id | BIGINT FK → users | |
| created_at | TIMESTAMP | |

---

**[likes]** — 게시글 좋아요 *(DB 테이블 + Redis 카운터 병행)*

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| user_id | BIGINT FK → users | |
| feed_id | BIGINT FK → feeds | |
| created_at | TIMESTAMP | |

> **좋아요 저장 방식 선택 근거 — DB 테이블 + Redis 카운터 병행**
>
> 순수 Redis 단독 관리도 검토했으나 아래 이유로 DB 테이블을 기본으로 채택하고 Redis를 카운터 캐시로 보조 활용한다.
>
> - **마인드맵 정합성**: 좋아요 이력이 `user_tag_interactions` 생성의 트리거 소스다. Redis 장애 시 유실되면 마인드맵 데이터 정합성이 깨진다.
> - **중복 방지 & 취소**: "내가 이 게시글에 좋아요를 눌렀는지" 여부는 유저별 상태를 영속적으로 보존해야 한다. Redis SET으로도 구현 가능하나 RDB의 UK 제약이 더 안전하다.
> - **이력 추적**: 월간 리포트, 회고 카드에서 특정 기간의 좋아요 이력이 필요하다.
>
> **Redis 역할**: `feed:likes:{feedId}` String 키에 좋아요 수를 캐싱해 피드 목록 조회 시 DB 집계 쿼리를 대체한다. 좋아요/취소 시 DB 저장과 동시에 `INCR` / `DECR`로 카운터를 갱신한다. 캐시 미스 시 DB에서 `COUNT(*)` 후 Redis에 적재한다.

---

**[comments]** — 게시글 댓글

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| user_id | BIGINT FK → users | |
| feed_id | BIGINT FK → feeds | |
| content | TEXT | |
| is_deleted | BOOLEAN | |
| created_at | TIMESTAMP | |

---

**[circles]** — 써클 (복수 태그 집합으로 구성) *(기존 단일 tag_id FK 제거)*

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| name | VARCHAR | 써클 이름 |
| created_by | BIGINT FK → users | |
| is_deleted | BOOLEAN | |
| created_at | TIMESTAMP | |

---

**[circle_tags]** — 써클 ↔ 태그 N:N *(신규)*

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| circle_id | BIGINT FK → circles | |
| tag_id | BIGINT FK → tags | |
| created_at | TIMESTAMP | |

---

**[circle_members]** — 써클 멤버십

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| circle_id | BIGINT FK → circles | |
| user_id | BIGINT FK → users | |
| joined_at | TIMESTAMP | |

---

**[challenges]** — 태그 챌린지 *(복수 태그 집합으로 구성, challenge_tags로 관리)*

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| title | VARCHAR | |
| description | TEXT | |
| start_date | DATE | |
| end_date | DATE | |
| created_by | BIGINT FK → users | |
| is_deleted | BOOLEAN | |
| created_at | TIMESTAMP | |

---

**[challenge_tags]** — 챌린지 ↔ 태그 N:N *(신규)*

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| challenge_id | BIGINT FK → challenges | |
| tag_id | BIGINT FK → tags | |
| created_at | TIMESTAMP | |

---

**[challenge_participants]** — 챌린지 참여자

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| challenge_id | BIGINT FK → challenges | |
| user_id | BIGINT FK → users | |
| completed_at | TIMESTAMP | NULL이면 진행 중 |
| joined_at | TIMESTAMP | |

---

---

**[notifications]** — 알림

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | |
| user_id | BIGINT FK → users | 수신자 |
| type | ENUM | `'STREAK'` \| `'RETROSPECT'` \| `'TRENDING'` |
| payload | JSONB | 알림별 가변 데이터 |
| is_read | BOOLEAN | |
| created_at | TIMESTAMP | |

---

> **설계 원칙**
> - 모든 테이블에 `is_deleted` 소프트 삭제 적용 — 회고 카드·마인드맵 데이터 무결성 보장
> - `tag_co_occurrences`는 집계 숫자가 아닌 **raw 이벤트**를 쌓는다. 마인드맵 기간 필터(주/월/연)와 출처 필터(일기/게시글/좋아요/댓글) 모두 `WHERE` 절로 처리 가능하다
> - 태그 쌍은 항상 `tag_id_a < tag_id_b` 순서로 정렬 삽입해 (A,B)와 (B,A) 중복을 방지한다
> - **`user_tag_interactions`는 모든 출처(diary/feed/like/comment)의 태그 단건 이력을 통합 저장**한다. 마인드맵 노드 집계(`GROUP BY tag_id`)와 태그 클릭 상세 탭을 단일 테이블 쿼리로 처리할 수 있다. `tag_co_occurrences`는 태그 쌍 관계(엣지 가중치·출처 필터)를 담당하며 두 테이블은 항상 동일 이벤트에서 함께 기록된다
> - `circles`와 `challenges` 모두 단일 태그가 아닌 `circle_tags` / `challenge_tags`를 통한 **복수 태그 집합**으로 정의된다
> - `likes`는 DB 테이블로 영속 저장하고, Redis `feed:likes:{feedId}`로 카운터를 캐싱한다. 좋아요/취소 시 DB와 Redis를 동시에 갱신하며, 캐시 미스 시 DB에서 COUNT 후 Redis에 적재한다
> - `users.last_active_at` 기준으로 스트릭 계산 및 푸시 알림 트리거

### 3.5 API 설계 원칙

| 항목 | 방침 |
|------|------|
| 스타일 | RESTful API, URI는 명사·복수형 사용 (`/api/v1/diaries`) |
| 버전 관리 | URI 버전 prefix (`/api/v1/`, `/api/v2/`) — 하위 호환 보장 |
| 인증 | Access Token (15분) + Refresh Token (7일), Redis 블랙리스트 관리 |
| 응답 형식 | 통일된 Envelope 구조 `{ success, data, error, timestamp }` |
| 에러 코드 | 도메인별 커스텀 에러 코드 정의 (예: `DIARY_001`, `TAG_002`) |
| 페이지네이션 | Cursor 기반 (피드·검색) / Offset 기반 (관리용) 혼용 |
| 문서화 | Swagger(OpenAPI 3.0) 자동 생성, 개발·스테이징 환경 노출 |

---

## 4. 보안 설계

### 4.1 인증 & 인가

| 항목 | 방침 |
|------|------|
| 비밀번호 | BCrypt 해싱 (cost factor 12 이상) |
| JWT | Access Token 15분, Refresh Token 7일 (HttpOnly Cookie 저장) |
| 소셜 로그인 | OAuth 2.0 (Google, Kakao) — CSRF state 파라미터 필수 |
| 권한 제어 | Spring Security + 메서드 수준 `@PreAuthorize` 적용 |
| 비밀번호 변경 | 현재 비밀번호 검증 필수, 변경 후 기존 Refresh Token 무효화 |
| 비밀번호 재설정 | UUID 토큰 기반, Redis TTL 30분, 1회 사용 후 삭제. 토큰 brute-force 방지를 위해 요청 Rate Limiting 적용 |
| 회원 탈퇴 | soft delete + 30일 유예 → `UserWithdrawnEvent`로 도메인별 데이터 정리 위임 |
| 일기 접근 | 본인 소유 확인 미들웨어 — 타인 일기 URL 직접 접근 차단 |

### 4.2 개인정보 보호

| 항목 | 방침 |
|------|------|
| 개인정보처리방침 | 서비스 오픈 전 법무 검토 및 약관 페이지 구현 필수 |
| 민감 데이터 암호화 | 이메일·전화번호 등 PII 컬럼 AES-256 암호화 저장 |
| 일기 본문 암호화 | 일기 content 컬럼은 JPA `AttributeConverter`를 통해 AES-256 암/복호화 처리 (Adapter Layer 책임, Domain Layer는 평문 유지) |
| 익명 공감 피드 | 집계 수치만 노출, 개별 사용자 식별 불가 설계 |
| 데이터 삭제 | 회원 탈퇴 시 개인 일기 즉시 삭제, 공개 게시글 익명화 처리 |
| GDPR / 개인정보보호법 | 동의 기반 수집, 열람·수정·삭제 요청 대응 API 구현 |

### 4.3 인프라 보안

| 항목 | 방침 |
|------|------|
| VPC 격리 | RDS, ElastiCache, Elasticsearch는 Private Subnet에만 배치, EKS Worker Node도 Private Subnet 배치 |
| 보안 그룹 | 최소 권한 원칙, API 서버 → DB 단방향 허용 |
| 시크릿 관리 | AWS Secrets Manager 또는 Parameter Store (코드에 credentials 하드코딩 금지) |
| HTTPS 강제 | ALB 수준 HTTP → HTTPS 리다이렉트, TLS 1.2 이상 |
| 이미지 업로드 | S3 Pre-signed URL 방식 — 서버를 경유하지 않고 클라이언트 직접 업로드 |
| Rate Limiting | API Gateway 또는 Spring 레벨에서 IP당 요청 수 제한 |

---

## 5. 비기능 요구사항

### 5.1 성능 목표

| 항목 | 목표치 |
|------|--------|
| API 응답 시간 | 일반 조회 P95 < 200ms, 검색 P95 < 500ms |
| 동시 접속자 | 초기 목표 1,000 DAU, 아키텍처는 10,000 DAU 대응 가능하게 설계 |
| 이미지 업로드 | 단일 이미지 최대 10MB, 게시글당 최대 10장 |
| 가용성 목표 | 99.9% (월 다운타임 약 43분 이내) |

### 5.2 확장성

- API 서버: Stateless 설계 → EKS HorizontalPodAutoscaler로 CPU 기준 자동 스케일 아웃
- DB: Read Replica 분리 (조회 트래픽 분산)
- Elasticsearch: 샤드 수 초기 설계 시 확장 여유 확보
- 이벤트 기반 처리: 월간 리포트·알림 등 비동기 작업은 추후 SQS + Lambda 분리 고려
- 쿠버네티스 CronJob: 배치 작업을 Pod 단위로 격리 실행해 API 서버 영향 없이 운영

### 5.3 모니터링 & 로깅

| 항목 | 도구 |
|------|------|
| 애플리케이션 로그 | EKS → CloudWatch Container Insights 수집 |
| 메트릭 수집 | Prometheus (kube-prometheus-stack Helm 차트로 EKS 내 배포) |
| 메트릭 시각화 | Grafana (API 응답시간, JVM, Redis 히트율, Pod 수 등 대시보드) |
| 에러 트래킹 | Sentry (프론트엔드 + 백엔드 동시) |
| 알람 | Grafana AlertManager → Slack 채널 연동 |
| 배포 후 이상 감지 | 배포 후 15분간 에러율 자동 감시, 임계 초과 시 `kubectl rollout undo` 자동 실행 |

---

## 6. 테스트 전략

### 6.1 레이어별 테스트 원칙

헥사고날 아키텍처의 레이어 특성에 맞게 테스트 방식을 레이어별로 명확히 구분한다. **DB가 필요한 모든 테스트는 H2 인메모리 DB를 사용**하여 외부 인프라 없이 빠르게 실행한다.

| 레이어 | 테스트 방식 | 도구 | DB |
|--------|------------|------|----|
| **Domain (Entity / Value Object)** | 테스트 케이스만 작성 (순수 단위 테스트) | JUnit 5 | 불필요 |
| **Repository (Outbound Adapter)** | `@SpringBootTest` 통합 테스트 | Spring Boot Test | **H2 인메모리** |
| **Service (Application)** | `@SpringBootTest` 통합 테스트 | Spring Boot Test | **H2 인메모리** |
| **Controller (Inbound Adapter)** | `@SpringBootTest` 통합 테스트 | Spring Boot Test, MockMvc | **H2 인메모리** |
| **E2E** | 시나리오 테스트 | Playwright 또는 Cypress | 스테이징 환경 |
| **성능** | 부하 테스트 | k6 또는 nGrinder | 스테이징 환경 |
| **보안** | 취약점 스캔 | OWASP ZAP | 스테이징 환경 |

### 6.2 레이어별 테스트 작성 상세

**Domain Layer — 테스트 케이스만 작성**

Domain 객체는 외부 의존성이 없는 순수 Java이므로 Spring Context 없이 빠르게 실행한다. 비즈니스 규칙(불변식, 상태 전이)을 테스트 케이스로 명세한다.

```java
// 예: Diary 도메인 단위 테스트
class DiaryTest {
    @Test
    void 태그는_최대_10개까지_추가할_수_있다() { ... }

    @Test
    void 삭제된_일기는_수정할_수_없다() { ... }

    @Test
    void 태그_추가시_DiaryCreatedEvent가_발행된다() { ... }
}
```

**Repository / Service / Controller Layer — `@SpringBootTest` + H2 인메모리 DB**

Repository 계층부터는 Spring Context 전체를 로딩하여 실제 빈 의존성과 JPA 동작을 검증한다. DB는 **H2 인메모리**를 사용해 외부 인프라 없이 CI 환경에서도 빠르게 실행한다. `application-test.yml`에 H2 설정을 분리하고, `@ActiveProfiles("test")`로 활성화한다.

```java
// 예: DiaryRepository 통합 테스트
@SpringBootTest
@ActiveProfiles("test")  // application-test.yml → H2 사용
class DiaryPersistenceAdapterTest {

    @Autowired
    private DiaryPersistenceAdapter diaryPersistenceAdapter;

    @Test
    void 일기를_저장하고_ID로_조회할_수_있다() { ... }

    @Test
    void 태그로_일기_목록을_필터링할_수_있다() { ... }
}

// 예: DefaultDiaryService 통합 테스트
@SpringBootTest
@ActiveProfiles("test")
class DefaultDiaryServiceTest {

    @Autowired
    private DefaultDiaryService defaultDiaryService;

    @Test
    void 일기_작성시_태그가_함께_저장된다() { ... }

    @Test
    void 일기_작성시_스트릭_카운터가_증가한다() { ... }
}
```

```yaml
# application-test.yml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;MODE=PostgreSQL;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
    database-platform: org.hibernate.dialect.H2Dialect
  redis:
    host: localhost   # 테스트 시 EmbeddedRedis 또는 Mock 처리
```

### 6.3 공통 테스트 설정 (`IntegrationTestSupport`)

모든 `@SpringBootTest` 테스트가 공통으로 상속하는 추상 클래스를 정의한다. H2 프로파일 활성화와 공통 설정을 한 곳에서 관리한다.

```java
@SpringBootTest
@ActiveProfiles("test")
@Transactional  // 각 테스트 후 롤백으로 DB 상태 초기화
public abstract class IntegrationTestSupport {
    // 공통 픽스처, 헬퍼 메서드 등 정의
    // Redis, ES 연동이 필요한 테스트는 해당 빈을 @MockBean으로 대체
}

// 사용 예시
class DefaultDiaryServiceTest extends IntegrationTestSupport {

    @Autowired DefaultDiaryService defaultDiaryService;

    @MockBean TagElasticsearchAdapter tagElasticsearchAdapter; // ES는 Mock 처리

    @Test
    void 일기_작성시_태그가_저장된다() { ... }
}
```

### 6.4 CI 파이프라인 연동

> PR 머지 전 GitHub Actions에서 전체 테스트 자동 실행. 단위 테스트 → 통합 테스트 순으로 실행하며, 비즈니스 로직 커버리지 **70% 미달 시 머지 차단**.

---

## 7. 일정 및 마일스톤

### 전체 일정: 약 6개월

| 단계 | 기간 | 주요 목표 |
|------|------|-----------|
| **Phase 1** — 설계 | 1~2주 | DB 스키마 설계, UI/UX 와이어프레임, API 설계, 보안 설계 검토, **Docker Compose 로컬 환경 구축** |
| **Phase 2** — 핵심 기능 개발 | 3~5주 | 회원가입/로그인, 일기 CRUD, 태그 시스템, 자동완성, **Elasticsearch 인덱싱** |
| **Phase 3** — 소셜 기능 + 통합 검색 | 6~10주 | 공개 피드, 좋아요/댓글, **통합 검색 (Feed 데이터 기반)**, 이미지 업로드 (S3), 써클 기능, **EKS 클러스터 구축 및 기본 배포** |
| **Phase 4** — 마인드맵 & 추천 | 11~14주 | 마인드맵 시각화, 기간 필터, 유사 유저 추천 알고리즘 |
| **Phase 5** — 리텐션 기능 (1차) | 15~18주 | 스트릭, 오늘의 태그 프롬프트, 회고 카드, 태그 챌린지, 월간 리포트 |
| **Phase 6** — 리텐션 기능 (2차) + QA | 19~22주 | 익명 공감 피드, 1:1 태그 친구, E2E 테스트, 성능 테스트, 보안 점검 (OWASP ZAP) |
| **Phase 7** — 안정화 & 베타 오픈 | 23~24주 | 성능 최적화, 모니터링 구축, 베타 오픈, 지표 측정 시작 |

### 주요 마일스톤

- **M1** (2주차): 설계 완료 및 개발 환경 구축 (Docker Compose 전체 스택 로컬 실행 확인)
- **M2** (5주차): 핵심 기능(일기 + 태그 + ES 인덱싱) 동작 확인
- **M2.5** (8주차): 소셜 피드 + 통합 검색 동작 확인
- **M3** (14주차): 소셜 기능 완성 + 마인드맵 통합 완료
- **M4** (18주차): 리텐션 1차 기능 완료 (스트릭, 회고 카드, 챌린지)
- **M5** (22주차): 전체 기능 QA 완료, 보안 점검 통과
- **M6** (24주차): 베타 서비스 오픈 및 핵심 지표 측정 시작

---

## 8. 주별 개발 체크리스트

### Phase 1 — 설계 및 환경 구축 (1~2주)

**1주차**
- [ ] Git 저장소 생성 및 브랜치 전략 수립 (`main` / `develop` / `feature/*`)
- [ ] 프로젝트 기본 구조 생성 (Spring Boot 3 + Java 17 초기화)
- [ ] 도메인별 패키지 골격 생성 (8개 Bounded Context 디렉터리)
- [ ] `application-local.yml` / `application-test.yml` / `application-prod.yml` 분리
- [ ] H2 인메모리 DB 테스트 환경 설정 (`application-test.yml` 작성)
- [ ] Docker Compose 작성 (PostgreSQL, Redis, Elasticsearch, Kibana)
- [ ] Docker Compose `docker-compose up` 전체 스택 로컬 실행 확인

**2주차**
- [ ] PostgreSQL ERD 설계 완료 및 DDL 스크립트 작성
- [ ] Flyway 또는 Liquibase 마이그레이션 도구 설정
- [ ] **`AbstractRoutingDataSource` 기반 `RoutingDataSource` 구현** (Write/Read DB 분기)
- [ ] **JPA용 `DataSource` 설정** — `@Transactional(readOnly)` 값으로 Write/Read 자동 라우팅
- [ ] **MyBatis용 `SqlSessionFactory` 설정** — Read DataSource 직접 주입, Replica 고정
- [ ] Elasticsearch 인덱스 매핑 설계 (`diary`, `feed` 인덱스)
- [ ] API 문서화 기반 설정 (Swagger / OpenAPI 3.0)
- [ ] GitHub Actions CI 파이프라인 기본 구성 (빌드 + 테스트 자동화)
- [ ] 공통 응답 Envelope 구조 구현 (`ApiResponse<T>`)
- [ ] 공통 예외 처리 구조 구현 (`GlobalExceptionHandler`, 도메인별 에러 코드)

---

### Phase 2 — 핵심 기능 개발 (3~5주)

**3주차 — Identity 도메인**
- [ ] `User` Aggregate, `UserEmail` Value Object 구현 + 도메인 테스트 케이스 작성
- [ ] 회원가입 API (`POST /api/v1/auth/register`) 구현
- [ ] 이메일/비밀번호 로그인 API (`POST /api/v1/auth/login`) 구현
- [ ] JWT Access Token (15분) + Refresh Token (7일) 발급 구현
- [ ] Refresh Token Redis 저장 (`auth:refresh:{userId}`) 구현
- [ ] `DefaultUserService` 통합 테스트 작성 (`@SpringBootTest` + H2)
- [ ] Spring Security 필터 체인 구성 (JWT 검증 필터)

**4주차 — Identity 도메인 완성 + Diary 도메인 시작**
- [ ] OAuth 2.0 소셜 로그인 구현 (Google)
- [ ] OAuth state CSRF 방지 Redis 저장 구현
- [ ] Access Token 블랙리스트 로그아웃 구현
- [ ] 비밀번호 변경 API (`PUT /api/v1/auth/password`) 구현 — 현재 비밀번호 검증 + 새 비밀번호 설정
- [ ] 비밀번호 재설정 요청 API (`POST /api/v1/auth/password-reset`) 구현 — 이메일로 재설정 토큰 발송
- [ ] 비밀번호 재설정 확인 API (`POST /api/v1/auth/password-reset/confirm`) 구현 — 토큰 검증 + 새 비밀번호 설정
- [ ] 비밀번호 재설정 토큰 Redis 저장 (`auth:password-reset:{token}`, TTL 30분) 구현
- [ ] 회원 탈퇴 API (`DELETE /api/v1/users/me`) 구현 — soft delete + 토큰 무효화 + `UserWithdrawnEvent` 발행
- [ ] 탈퇴 후 30일 재가입 차단 로직 구현
- [ ] `Diary` Aggregate, `DiaryContent` Value Object 구현 + 도메인 테스트 케이스 작성
- [ ] 일기 CRUD API 구현 (`POST/GET/PUT/DELETE /api/v1/diaries`)
- [ ] 일기 소유자 검증 미들웨어 구현 (타인 일기 접근 차단)
- [ ] `DiaryPersistenceAdapter` 통합 테스트 작성 (H2)

**5주차 — Tag 도메인 + Elasticsearch 연동**
- [ ] `Tag` Aggregate, `TagCoOccurrence` Entity 구현 + 도메인 테스트 케이스 작성
- [ ] 태그 자동완성 API (`GET /api/v1/tags/autocomplete?q=`) 구현
- [ ] Elasticsearch `nori` 형태소 분석기 설정
- [ ] `edge_ngram` 토크나이저 기반 자동완성 인덱스 매핑 구현
- [ ] `TagElasticsearchAdapter` 구현 (ES Outbound Port)
- [ ] 일기 작성 시 태그 ES 색인 연동 구현
- [ ] `DefaultTagService` 통합 테스트 작성 (H2 + ES MockBean)

---

### Phase 3 — 소셜 기능 + 통합 검색 (6~10주)

> **순서 변경 (2026-04-01)**: Search 도메인(통합 검색 · 피드 추천)이 Feed 도메인(Feed/Like/Comment)에 의존하므로, Feed를 먼저 구현한 뒤 Search를 진행한다.

**6주차 — Feed 도메인**
- [ ] `Feed` Aggregate, `Comment` / `Like` Entity 구현 + 도메인 테스트 케이스 작성
- [ ] 게시글 작성/조회/삭제 API 구현 (`POST/GET/DELETE /api/v1/feeds`)
- [ ] 팔로우 기반 피드 조회 API (Cursor 페이지네이션) 구현
- [ ] 전체 공개 피드 조회 API 구현
- [ ] `DefaultFeedService` 통합 테스트 작성 (H2)

**7주차 — 좋아요 / 댓글 + 인터랙션 태그 기록**
- [ ] 좋아요 API (`POST/DELETE /api/v1/feeds/{id}/likes`) 구현
- [ ] 댓글 API (`POST/GET/DELETE /api/v1/feeds/{id}/comments`) 구현
- [ ] `LikeAddedEvent` / `CommentAddedEvent` / `CommentDeletedEvent` 도메인 이벤트 구현
- [ ] `CommentDeletedEvent` 리스너 → `user_tag_interactions` / `tag_co_occurrences` 소프트 삭제 구현
- [ ] 이벤트 리스너 → `user_tag_interactions` 비동기 저장 구현
- [ ] 좋아요·댓글 태그가 마인드맵용 데이터로 기록되는지 통합 테스트 작성
- [ ] 댓글 삭제 시 `user_tag_interactions` / `tag_co_occurrences` 소프트 삭제 통합 테스트 작성

**8주차 — Search 도메인 + 통합 검색 + 피드 추천**
- [ ] 통합 검색 API (`GET /api/v1/search?q=`) 구현
- [ ] `title(×1) / tags(×2) / content(×1)` 필드 가중치 쿼리 구현 (diary), `content(×1) / tags(×2)` (feed)
- [ ] 검색 결과 하이라이팅 구현
- [ ] 기간·태그 검색 필터 구현
- [ ] `DefaultSearchService` 통합 테스트 작성 (H2 + ES MockBean)
- [ ] 일기 완성 후 피드 추천 API (`GET /api/v1/diaries/{id}/recommended-feeds`) 구현
- [ ] 추천 결과 Redis 캐싱 구현 (`feed:recommend:{tagHash}`, TTL 10분)
- [ ] 추천 API 통합 테스트 작성 (H2 + ES MockBean)
- [ ] Swagger API 문서 최신화

**9주차 — 이미지 업로드 + S3 연동**
- [ ] AWS S3 버킷 생성 및 IAM 정책 설정
- [ ] Pre-signed URL 발급 API (`GET /api/v1/files/presigned-url`) 구현
- [ ] 클라이언트 S3 직접 업로드 흐름 검증
- [ ] CloudFront 배포 설정 및 이미지 URL 변환 구현
- [ ] 업로드 이미지 URL을 게시글에 연결하는 API 구현

**10주차 — Social 도메인 + EKS 클러스터 초기 구축**
- [ ] 써클 생성/조회 API 구현
- [ ] 팔로우/언팔로우 API 구현
- [ ] **AWS EKS 클러스터 생성** (`eksctl create cluster`)
- [ ] **Spring Boot Docker 이미지 빌드 + ECR 푸시** 확인
- [ ] **EKS에 Deployment / Service / Ingress 기본 배포** 확인
- [ ] **ConfigMap / Secret 리소스 생성** (DB URL, JWT 시크릿 등)

---

### Phase 4 — 마인드맵 & 추천 (11~14주)

**11주차 — Mindmap 도메인**
- [ ] `MindmapSnapshot` Aggregate, `MindmapNode` / `MindmapEdge` Value Object 구현
- [ ] `diary_tags` + `feed_tags` + `user_tag_interactions` UNION 집계 쿼리 구현
- [ ] 마인드맵 월별 조회 API (`GET /api/v1/mindmap?period=2026-03`) 구현
- [ ] Redis 마인드맵 캐시 구현 (`mindmap:{userId}:{yyyy-MM}`, TTL 1시간)
- [ ] `DefaultMindmapService` 통합 테스트 작성 (H2 + Redis MockBean)

**12주차 — 마인드맵 시각화 + 출처 필터**
- [ ] 마인드맵 태그 출처 구분 API 응답 구현 (`source: write|like|comment`)
- [ ] 주별 / 월별 / 연도별 기간 필터 API 구현
- [ ] 출처 필터 API 쿼리 파라미터 구현 (`?source=like`)
- [ ] D3.js 마인드맵 프론트엔드 기본 렌더링 구현
- [ ] 태그 클릭 시 관련 일기·게시글 목록 조회 API 연동

**13주차 — 사용자 추천**
- [ ] 공통 태그 기반 유사 유저 추천 쿼리 구현
- [ ] 태그 빈도 + 최근 활동 가중치 추천 알고리즘 구현
- [ ] 유저 추천 API (`GET /api/v1/users/recommendations`) 구현
- [ ] Redis 트렌딩 태그 Sorted Set 집계 구현 (`tag:trending:hourly`)
- [ ] 트렌딩 태그 조회 API 구현

**14주차 — EKS 심화 + Namespace 환경 분리**
- [ ] **dev / staging / prod Namespace 생성 및 분리**
- [ ] **GitHub Actions → staging 자동 배포 파이프라인 구축**
- [ ] **HorizontalPodAutoscaler 설정** (CPU 70% → 스케일 아웃)
- [ ] **Liveness / Readiness Probe 설정** (`/actuator/health`)
- [ ] **PodDisruptionBudget 설정** (최소 1 Pod 보장)

---

### Phase 5 — 리텐션 기능 1차 (15~18주)

**15주차 — 스트릭 & 프롬프트**
- [ ] 스트릭 카운터 Redis 구현 (`streak:{userId}`)
- [ ] 매일 자정 스트릭 계산 Spring Batch Job 구현
- [ ] 스트릭 조회 API (`GET /api/v1/users/streak`) 구현
- [ ] 오늘의 태그 프롬프트 API 구현 (랜덤 태그 1개 제안)
- [ ] **Kubernetes CronJob으로 스트릭 Batch 스케줄링** 등록

**16주차 — 회고 카드**
- [ ] "1년 전 오늘" 일기 조회 API 구현
- [ ] 회고 카드 알림 Notification 도메인 구현
- [ ] `NotificationType.RETROSPECT` 이벤트 처리 구현
- [ ] Notification 저장 및 조회 API 구현

**17주차 — 태그 챌린지**
- [ ] `Challenge` Aggregate 구현 + 도메인 테스트 케이스 작성
- [ ] 챌린지 생성/참여/완료 API 구현
- [ ] 챌린지 참여자 수 Redis 카운터 구현 (`challenge:{id}:count`)
- [ ] 챌린지 완주 뱃지 지급 로직 구현
- [ ] `DefaultChallengeService` 통합 테스트 작성 (H2)

**18주차 — 월간 리포트 카드**
- [ ] 월말 TOP 태그 집계 Spring Batch Job 구현
- [ ] 리포트 카드 인포그래픽 데이터 생성 API 구현
- [ ] 생성된 리포트 이미지 S3 저장 및 CloudFront URL 반환 구현
- [ ] **Kubernetes CronJob으로 월간 리포트 Batch 스케줄링** 등록
- [ ] SNS 공유용 OG 메타태그 구현

---

### Phase 6 — 리텐션 기능 2차 + QA (19~22주)

**19주차 — 익명 공감 피드**
- [ ] 일별 태그 사용 횟수 Redis Sorted Set 집계 구현 (`tag:daily:{date}`)
- [ ] 익명 공감 피드 API 구현 ("오늘 #번아웃을 기록한 사람 N명")
- [ ] 익명 공감 피드 개인 식별 불가 설계 검증

**20주차 — 1:1 태그 친구 매칭**
- [ ] 동일 태그 꾸준 기록 유저 매칭 알고리즘 구현
- [ ] 1:1 매칭 API 구현 (`POST /api/v1/social/tag-friends`)
- [ ] 응원 메시지 전송 API 구현 (텍스트만, 제한적 소통)

**21주차 — E2E 테스트 + 성능 테스트**
- [ ] Playwright E2E 시나리오 작성 (가입 → 일기 작성 → 검색 → 피드)
- [ ] k6 부하 테스트 스크립트 작성
- [ ] API 응답시간 P95 목표치 검증 (일반 < 200ms, 검색 < 500ms)
- [ ] DB 쿼리 N+1 문제 점검 및 최적화

**22주차 — 보안 점검 + Prometheus / Grafana 구축**
- [ ] OWASP ZAP 보안 스캔 실행 및 취약점 수정
- [ ] **kube-prometheus-stack Helm 차트 EKS 배포**
- [ ] **Grafana 대시보드 구성** (API 응답시간, JVM, Redis 히트율, Pod 수)
- [ ] **Grafana AlertManager → Slack 알람 연동**
- [ ] Sentry 프론트엔드 + 백엔드 연동

---

### Phase 7 — 안정화 & 베타 오픈 (23~24주)

**23주차 — 성능 최적화 + prod 배포 파이프라인**
- [ ] PostgreSQL Read Replica 설정 및 Write/Read DB 라우팅 동작 검증
- [ ] MyBatis Mapper가 Read DB(Replica)에만 접근하는지 통합 테스트로 검증
- [ ] Redis 캐시 히트율 모니터링 및 TTL 튜닝
- [ ] Elasticsearch 샤드 설정 최적화
- [ ] **GitHub Actions → prod Namespace 배포 파이프라인 구축**
- [ ] **배포 후 Smoke Test + 자동 Rollback 파이프라인 구성**
- [ ] 전체 API Swagger 문서 최종 정리

**24주차 — 베타 오픈**
- [ ] 개인정보처리방침 / 이용약관 페이지 구현
- [ ] 베타 사용자 모집 및 초대 링크 발송
- [ ] DAU / D7 리텐션 / 스트릭 유지율 지표 측정 시작
- [ ] 베타 피드백 수집 채널 (Slack 또는 인앱 피드백) 구축
- [ ] 첫 번째 회고 및 백로그 정리

---

## 9. 핵심 지표 (KPI)

베타 오픈 후 아래 지표를 우선 측정하고, 4주 단위로 리뷰한다.

| 지표 | 설명 | 초기 목표 (베타 4주차) |
|------|------|----------------------|
| DAU / MAU | 일간·월간 활성 사용자 수 | DAU/MAU 비율 20% 이상 |
| D1 / D7 / D30 리텐션 | 가입 후 1·7·30일 재방문율 | D7 > 30%, D30 > 15% |
| 일기 작성 전환율 | 가입 후 첫 일기 작성 비율 | 60% 이상 |
| 평균 기록 빈도 | 활성 유저의 주당 평균 기록 횟수 | 3회 이상 |
| 스트릭 유지율 | 7일 이상 스트릭 유지 유저 비율 | 활성 유저의 25% |
| 검색 사용률 | 월간 검색 기능 사용 유저 비율 | 활성 유저의 40% |

---

## 10. 추후 검토 사항

- **AI 태그 자동 추천**: 일기 내용 분석 기반으로 태그 자동 제안
- **트렌딩 태그 알림**: 내 태그가 트렌딩 진입 시 푸시 알림
- **써클 내 실시간 채팅**: 소그룹 커뮤니케이션 강화
- **챌린지 리더보드**: 참여자 간 순위 및 활동 현황 공개
- **모바일 앱 (React Native)**: 스트릭·푸시 알림 효과 극대화를 위한 앱 확장
- **월간 리포트 고도화**: Spotify Wrapped 수준의 연간 리포트 제공
- **멀티 페르소나 (계정 전환)**: X(트위터)처럼 하나의 앱 로그인 세션에서 여러 계정을 등록하고 마이페이지에서 즉시 전환할 수 있는 기능. 서로 다른 관심사나 목적(예: 일상용·운동용·독서용)에 따라 계정을 분리 운영하고 싶은 사용자를 위해 지원 예정.

---

*본 기획서는 초안이며, 구체적인 스펙은 개발 진행에 따라 업데이트될 수 있습니다.*
