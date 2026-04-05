#!/bin/bash
set -e

APP_NAME="MDeditor"
APPIMAGE_NAME="MDeditor_0.1.0_amd64.AppImage"
INSTALL_DIR="$HOME/.local/bin"
ICON_DIR="$HOME/.local/share/icons"
DESKTOP_DIR="$HOME/.local/share/applications"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APPIMAGE_PATH="$SCRIPT_DIR/$APPIMAGE_NAME"

# AppImage 파일 확인
if [ ! -f "$APPIMAGE_PATH" ]; then
    # 같은 디렉토리에 없으면 현재 디렉토리에서 찾기
    APPIMAGE_PATH="$(pwd)/$APPIMAGE_NAME"
    if [ ! -f "$APPIMAGE_PATH" ]; then
        echo "오류: $APPIMAGE_NAME 파일을 찾을 수 없습니다."
        echo "이 스크립트를 AppImage 파일과 같은 폴더에서 실행하세요."
        exit 1
    fi
fi

echo "MDeditor 설치 중..."

# 디렉토리 생성
mkdir -p "$INSTALL_DIR" "$ICON_DIR" "$DESKTOP_DIR"

# AppImage 복사 및 실행 권한
cp "$APPIMAGE_PATH" "$INSTALL_DIR/$APP_NAME"
chmod +x "$INSTALL_DIR/$APP_NAME"

# 아이콘 추출 (AppImage 내부에서)
# 임시 디렉토리에 AppImage 마운트하여 아이콘 추출
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
"$INSTALL_DIR/$APP_NAME" --appimage-extract usr/share/icons/hicolor/128x128/apps/*.png > /dev/null 2>&1 || true

EXTRACTED_ICON=$(find "$TEMP_DIR/squashfs-root" -name "*.png" -path "*/128x128/*" 2>/dev/null | head -1)
if [ -n "$EXTRACTED_ICON" ]; then
    cp "$EXTRACTED_ICON" "$ICON_DIR/mdeditor.png"
else
    # 추출 실패 시 기본 아이콘 생성 (1x1 투명 PNG)
    echo "경고: 아이콘을 추출하지 못했습니다. 기본 아이콘을 사용합니다."
    python3 -c "
from PIL import Image
img = Image.new('RGBA', (128, 128), (100, 149, 237, 255))
img.save('$ICON_DIR/mdeditor.png')
" 2>/dev/null || true
fi
rm -rf "$TEMP_DIR"

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
echo "✓ MDeditor 설치 완료!"
echo "  - 실행: 앱 런처에서 'MDeditor' 검색"
echo "  - .md 파일 더블클릭으로 열기 가능"
echo ""
echo "제거하려면: bash $(dirname "$0")/uninstall.sh"
