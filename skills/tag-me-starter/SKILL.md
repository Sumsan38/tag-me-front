---
name: tag-me-starter
description: Use this skill whenever starting a new work session on the tag-me project. Triggers when the user says things like "작업 시작", "start work", "다음 작업", "뭐 할까", or opens a conversation expecting to begin development. Also use when the user asks what to work on next, wants to pick a task, or resumes after a break. This skill orchestrates the full development workflow — from task selection through implementation, review, and commit.
---

# Tag-Me 작업 시작 스킬

tag-me 프로젝트의 개발 세션을 시작하고 작업 흐름 전체를 안내하는 스킬이다.

## 1단계: 프로젝트 감지

현재 작업 디렉토리의 경로를 확인해서 어느 프로젝트인지 파악한다.

- 경로에 `tag-me/tag-me`가 포함되면 → **백엔드** (Spring Boot, Java)
- 경로에 `tag-me-front`가 포함되면 → **프론트엔드** (Next.js, TypeScript)
- 둘 다 아니면 → 사용자에게 백엔드/프론트엔드 중 어느 쪽을 작업할지 물어본다

## 2단계: 코드 스타일 숙지 (백엔드 한정)

백엔드 작업이라면, 구현에 들어가기 전에 반드시 `code-style.md`를 읽는다. 이 파일에 코딩 컨벤션, 아키텍처 패턴, 공통 인프라 사용법, 테스트 작성법이 정리되어 있다. 새 코드는 이 가이드의 패턴을 그대로 따라야 한다.

## 3단계: 작업 선택

`task.md`를 읽어서 현재 진행 상황을 파악한다.

- 체크되지 않은(`- [ ]`) 항목 중 다음으로 진행할 작업 후보를 사용자에게 보여준다
- **어떤 작업을 할지 사용자가 직접 선택**하도록 한다 — 임의로 결정하지 않는다
- 사용자가 작업을 선택하면 해당 작업의 범위와 구현 계획을 간략히 설명한다

## 4단계: 작업 실행

선택된 작업을 적절한 에이전트에게 위임한다. 프로젝트에 이미 전문화된 스킬들이 있으므로 작업 성격에 맞게 활용한다:

| 작업 성격 | 활용할 스킬/에이전트 |
|-----------|---------------------|
| 도메인 모델링 (Aggregate, VO, Event) | `tag-me-domain-developer` |
| Application Service, Port 구현 | `tag-me-service-developer` |
| Persistence/Cache/Search Adapter | `tag-me-adapter-developer` |
| REST Controller, API 통합 | `tag-me-api-integration` |
| 테스트 작성 | `tag-me-test-writer` |
| 프론트 페이지 개발 | `tag-me-page-developer` |
| 프론트 컴포넌트 개발 | `tag-me-component-developer` |

작업 규모가 크면 하위 단계로 나누어 순차적으로 진행한다.

## 5단계: 수정 파일 목록 보고

에이전트가 작업을 완료하면, 사용자가 검증할 수 있도록 **수정/생성/삭제된 파일 목록**을 정리해서 보여준다.

형식 예시:
```
수정된 파일:
- src/main/java/.../domain/Tag.java (신규)
- src/main/java/.../application/service/DefaultTagService.java (수정)
- src/test/java/.../domain/TagTest.java (신규)
```

## 6단계: 사용자 검증

사용자에게 결과물을 확인해달라고 요청한다. 사용자가 수정을 요청하면 반영한다.

## 7단계: 코드 리뷰

사용자 검증이 완료되면 코드 리뷰를 진행한다:

- 백엔드: `tag-me-backend-reviewer` 스킬 활용
- 프론트엔드: `tag-me-frontend-reviewer` 스킬 활용

리뷰에서 발견된 문제점을 수정하고, 수정 내역을 사용자에게 다시 보여준다.

## 8단계: 커밋 & PR 제안

코드 리뷰 반영이 완료되면:

1. 사용자에게 커밋할 준비가 되었는지 확인한다
2. 커밋 완료 후, PR을 만들 적절한 시점이라고 판단되면 (기능 단위가 완성되었거나, 여러 커밋이 쌓였을 때) 사용자에게 PR 생성을 제안한다
3. PR은 `main` 브랜치를 base로 생성한다

## 9단계: 다음 작업

한 작업이 끝나면 다시 3단계로 돌아가서 다음 작업을 물어본다.

---

## 핵심 원칙

- **사용자가 결정권을 갖는다** — 작업 선택, 검증, 커밋, PR 모두 사용자 확인 후 진행
- **작업 전에 항상 물어본다** — 다음 작업이 뭔지 임의로 시작하지 않는다
- **투명하게 보고한다** — 변경된 파일, 리뷰 결과를 빠짐없이 공유한다
