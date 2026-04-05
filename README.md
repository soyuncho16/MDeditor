# MDeditor

로컬 마크다운 파일 에디터 데스크톱 앱.

## 기능

- 소스 편집 + 실시간 프리뷰 (GFM, KaTeX 수식, Mermaid 다이어그램)
- 파일 탐색기 (사이드바)
- 영어/중국어 → 한국어 번역 (Ollama + gemma3:4b)
- 한국어/영어 UI

## 실행

```bash
# 의존성 설치
npm install

# 개발 모드 (핫 리로드, 코드 수정 시 자동 반영)
npm run tauri dev
```

개발 모드로 실행하면 MDeditor 데스크톱 창이 열립니다.

## 개발

```bash
# 테스트
npm test

# 프로덕션 빌드
npm run tauri build
```

빌드 결과물은 `src-tauri/target/release/bundle/`에 생성됩니다.

## 번역 기능

번역 기능을 사용하려면 [Ollama](https://ollama.com/download)를 설치하세요:

```bash
# Ollama 설치 후
ollama pull gemma3:4b
```

## 기술 스택

Tauri v2 | React | TypeScript | CodeMirror 6 | unified/remark/rehype | KaTeX | Mermaid | zustand | react-i18next
