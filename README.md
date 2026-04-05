# MDeditor

로컬 마크다운 파일 에디터 데스크톱 앱.

## 기능

- 소스 편집 + 실시간 프리뷰 (GFM, KaTeX 수식, Mermaid 다이어그램)
- 파일 탐색기 (사이드바)
- 영어/중국어 → 한국어 번역 (Ollama + gemma3:4b)
- 한국어/영어 UI

## 설치

### Windows

[Releases](https://github.com/soyuncho16/MDeditor/releases)에서 `MDeditor_x.x.x_x64-setup.exe`를 다운로드하고 실행하세요.

설치 후 시작 메뉴에서 "MDeditor"를 검색하거나, `.md` 파일을 더블클릭하여 열 수 있습니다.

### Linux

[Releases](https://github.com/soyuncho16/MDeditor/releases)에서 `MDeditor_x.x.x_amd64.AppImage`와 `install.sh`를 같은 폴더에 다운로드한 후:

```bash
bash install.sh
```

설치 후 앱 런처에서 "MDeditor"를 검색하거나, `.md` 파일을 더블클릭하여 열 수 있습니다.

제거:
```bash
bash uninstall.sh
```

## 개발 모드

```bash
# 의존성 설치
npm install

# 개발 모드 (핫 리로드, 코드 수정 시 자동 반영)
npm run tauri dev
```

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
