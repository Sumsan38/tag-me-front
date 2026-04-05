---
name: tag-me-commit-push
description: 변경된 파일을 커밋하고 push한 뒤, task.md가 있으면 다음 작업 목록을 보여주는 스킬. 사용자가 "커밋해", "commit", "push해", "커밋하고 푸시해", "변경사항 올려", "commit and push", "커밋 푸시" 등을 말할 때 이 스킬을 사용한다. /commit 슬래시 커밋과 다르게, 이 스킬은 push까지 자동으로 진행하고 task.md 후속 보고까지 포함한다.
---

# Tag Me Commit & Push

변경된 파일을 커밋하고 push한 뒤, 다음 작업 목록을 보여주는 워크플로우 스킬.

## 실행 흐름

### 1단계: 상태 확인

아래 명령을 **병렬로** 실행한다:
- `git status` — 변경/추가/삭제된 파일 파악
- `git diff --stat` — 변경 범위 확인
- `git log --oneline -5` — 최근 커밋 메시지 스타일 확인

변경 사항이 없으면 "커밋할 변경 사항이 없습니다."라고 알리고 종료한다.

### 2단계: 스테이징

변경된 파일을 개별 지정하여 `git add`한다. 단, 아래 파일은 **반드시 제외**한다:
- `.claude/settings.local.json`

제외 대상은 `git add` 목록에서 빼는 방식으로 처리한다. `.gitignore`에 의존하지 않는다.

민감 파일(`.env`, credentials 등)이 포함되어 있으면 사용자에게 경고하고 확인을 받는다.

### 3단계: 커밋 메시지 생성

staged diff를 분석해서 커밋 메시지를 자동 생성한다.

규칙:
- **Conventional Commits** 형식: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:` 등
- 한국어 본문 (제목은 영문 prefix + 한국어 설명)
- 변경의 "무엇"보다 "왜"에 초점
- 여러 관심사가 섞여 있으면 가장 큰 변경의 유형을 사용하고 본문에 나머지를 나열
- 끝에 반드시 `Co-Authored-By` 추가

메시지 형식:
```
{type}: {한국어 요약}

{상세 설명 (필요 시)}

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

커밋 메시지는 **HEREDOC**으로 전달한다:
```bash
git commit -m "$(cat <<'EOF'
메시지 내용

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

### 4단계: Push

현재 브랜치를 origin에 push한다:
```bash
git push origin {현재브랜치}
```

push 실패 시 원인을 진단하고 사용자에게 보고한다. `--force`는 절대 사용하지 않는다.

### 5단계: 다음 작업 보고

`task.md` 파일이 존재하면:
1. 파일을 읽는다
2. 체크되지 않은 항목(`- [ ]`) 중 **현재 진행 중인 섹션**의 다음 작업 후보를 보여준다
3. 사용자에게 다음 작업을 선택하도록 안내한다

`task.md`가 없으면 이 단계를 건너뛴다.
