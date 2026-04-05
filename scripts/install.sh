#!/bin/bash
set -e

APP_NAME="MDeditor"
APP_VERSION="2.0.0"
APPIMAGE_NAME="MDeditor_${APP_VERSION}_amd64.AppImage"
INSTALL_DIR="$HOME/.local/bin"
ICON_DIR="$HOME/.local/share/icons"
DESKTOP_DIR="$HOME/.local/share/applications"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APPIMAGE_PATH="$SCRIPT_DIR/$APPIMAGE_NAME"

# AppImage 파일 확인 (버전 무관하게 찾기)
if [ ! -f "$APPIMAGE_PATH" ]; then
    APPIMAGE_PATH=$(find "$SCRIPT_DIR" -maxdepth 1 -name "MDeditor_*.AppImage" | head -1)
    if [ -z "$APPIMAGE_PATH" ] || [ ! -f "$APPIMAGE_PATH" ]; then
        APPIMAGE_PATH=$(find "$(pwd)" -maxdepth 1 -name "MDeditor_*.AppImage" | head -1)
        if [ -z "$APPIMAGE_PATH" ] || [ ! -f "$APPIMAGE_PATH" ]; then
            echo "오류: MDeditor AppImage 파일을 찾을 수 없습니다."
            echo "이 스크립트를 AppImage 파일과 같은 폴더에서 실행하세요."
            exit 1
        fi
    fi
fi

echo "MDeditor 설치 중..."
echo ""

# 시스템 의존성 확인 및 설치
DEPS="libwebkit2gtk-4.1-0 libgtk-3-0 libayatana-appindicator3-1"
MISSING=""

for dep in $DEPS; do
    if ! dpkg -s "$dep" > /dev/null 2>&1; then
        MISSING="$MISSING $dep"
    fi
done

if [ -n "$MISSING" ]; then
    echo "필요한 시스템 라이브러리가 없습니다:$MISSING"
    echo ""
    echo "설치하려면 sudo 비밀번호가 필요합니다."
    read -p "지금 설치하시겠습니까? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo apt-get update
        sudo apt-get install -y $MISSING
    else
        echo "오류: 의존성이 설치되지 않으면 앱이 실행되지 않습니다."
        echo "직접 설치하세요: sudo apt install$MISSING"
        exit 1
    fi
fi

# 디렉토리 생성
mkdir -p "$INSTALL_DIR" "$ICON_DIR" "$DESKTOP_DIR"

# AppImage 복사 및 실행 권한
cp "$APPIMAGE_PATH" "$INSTALL_DIR/$APP_NAME"
chmod +x "$INSTALL_DIR/$APP_NAME"

# 아이콘 추출
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
"$INSTALL_DIR/$APP_NAME" --appimage-extract usr/share/icons/hicolor/128x128/apps/*.png > /dev/null 2>&1 || true

EXTRACTED_ICON=$(find "$TEMP_DIR/squashfs-root" -name "*.png" -path "*/128x128/*" 2>/dev/null | head -1)
if [ -n "$EXTRACTED_ICON" ]; then
    cp "$EXTRACTED_ICON" "$ICON_DIR/mdeditor.png"
fi
rm -rf "$TEMP_DIR"
cd "$SCRIPT_DIR"

# .desktop 파일 생성
cat > "$DESKTOP_DIR/mdeditor.desktop" << DESKTOP
[Desktop Entry]
Name=MDeditor
Comment=로컬 마크다운 에디터
Exec=$INSTALL_DIR/$APP_NAME --appimage-extract-and-run %f
Icon=$ICON_DIR/mdeditor.png
Terminal=false
Type=Application
Categories=TextEditor;Development;
MimeType=text/markdown;text/plain;text/x-markdown;
DESKTOP

chmod +x "$DESKTOP_DIR/mdeditor.desktop"

# 데스크톱 데이터베이스 갱신
update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true

# MIME 타입 기본 앱 설정
xdg-mime default mdeditor.desktop text/markdown 2>/dev/null || true

echo ""
echo "✓ MDeditor v${APP_VERSION} 설치 완료!"
echo "  - 실행: 앱 런처에서 'MDeditor' 검색"
echo "  - .md 파일 더블클릭으로 열기 가능"
echo ""
echo "제거하려면: bash $(dirname "$0")/uninstall.sh"
