# Git 작업 컨벤션

이 문서는 프로젝트의 Git 워크플로우, 브랜치 전략, PR 규칙을 정의한다.

---

## 브랜치 전략 (Git Flow)

```
main ← develop ← feature/N-name
                ← fix/N-name
```

- `main`: 배포 가능한 안정 브랜치. develop에서 테스트 완료 후 PR로만 머지.
- `develop`: 개발 통합 브랜치. 모든 feature/fix 브랜치는 여기로 PR.
- `feature/N-name`: 기능 추가 브랜치. N = 이슈 번호. 예: `feature/14-login`
- `fix/N-name`: 버그 수정 브랜치. N = 이슈 번호. 예: `fix/7-crash-on-save`

---

## 워크플로우: 1이슈 → 1브랜치 → 1PR

모든 작업은 반드시 아래 흐름을 따른다.

### 1. 이슈 생성

```bash
gh issue create --title "feat: 기능 설명" --body "..." --label "enhancement"
```

- 중간 이상 규모의 작업 단위로 이슈를 생성한다.
- 이슈 본문에 투두(체크박스)를 포함한다.
- 하나의 목적만 담는다. 필요 시 하위 이슈를 생성한다.

### 2. 브랜치 생성

```bash
git checkout develop
git pull origin develop
git checkout -b feature/N-기능명
```

- develop에서 분기한다.
- 이슈 번호를 브랜치명에 포함한다.

### 3. 작업 + 커밋

- 커밋 메시지는 Udacity 컨벤션을 따른다.
- 본문에는 **어떻게보다 무엇을, 왜**를 설명한다.
- 한국어로 작성한다.

```
feat: 파일 탐색기 사이드바

FileTree, FileTreeItem 컴포넌트.
useFileSystem 훅으로 Tauri 파일 I/O 연동.
```

### 4. PR 생성 (gh CLI 사용)

**IMPORTANT: 로컬에서 `git merge`로 develop에 머지하지 않는다. 반드시 GitHub PR을 통해 머지한다.**

```bash
# 원격에 브랜치 push
git push -u origin feature/N-기능명

# PR 생성 (develop 브랜치로)
gh pr create --base develop --title "feat: 기능 설명" --body "$(cat <<'EOF'
## 요약
- 변경 사항 요약

## 관련 이슈
Closed #N

## 체크리스트
- [ ] 빌드 성공
- [ ] 테스트 통과
- [ ] 코드 리뷰 완료
EOF
)"
```

- PR 본문에 반드시 `Closed #이슈번호`를 기입한다.
- PR이 머지되면 해당 이슈가 자동으로 닫힌다.

### 5. PR 머지

```bash
# PR 머지 (merge commit 방식)
gh pr merge <PR번호> --merge
```

- 로컬 `git merge` 사용 금지.
- `gh pr merge`를 사용해야 GitHub에서 이슈가 자동 종료된다.

### 6. 로컬 동기화

```bash
git checkout develop
git pull origin develop
```

---

## PR 리뷰 규칙

PR 머지 전 아래 항목을 체크한다:

| 항목 | 확인 내용 |
|------|----------|
| 동작 가능성 | 빌드 성공, 기본 동작 확인 |
| 가독성 | 코드가 읽기 쉽고 의도가 명확한가 |
| 예외 처리 | 에러 케이스가 적절히 처리되었는가 |
| 효율성 | 불필요한 연산이나 중복이 없는가 |
| 문서화 | 필요한 주석/문서가 작성되었는가 |
| 로깅 | 디버깅에 필요한 로그가 있는가 |
| 테스트 | 관련 테스트가 통과하는가 |

---

## main 머지 규칙

- 사용자가 명시적으로 main 머지를 지시한 경우에만 진행한다.
- develop에서 전체 테스트 통과를 확인한 후 PR을 생성한다.
- main으로의 PR도 `gh pr create --base main`으로 생성한다.

---

## 커밋 메시지 컨벤션 (Udacity)

```
type: 제목 (50자 이내)

본문 (선택, 무엇을/왜 설명)
```

### type 목록

| type | 용도 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `style` | 포맷팅, 세미콜론 등 (코드 변경 없음) |
| `refactor` | 리팩토링 (기능 변경 없음) |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드, 설정 등 기타 |

---

## 언어 규칙

- 커밋 메시지: 한국어
- 이슈/PR 제목: 한국어 (type 접두어는 영어)
- 문서: 한국어 (타입, 대명사 등 이해에 필요한 영어 제외)
