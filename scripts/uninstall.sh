#!/bin/bash
set -e

echo "MDeditor 제거 중..."

rm -f "$HOME/.local/bin/MDeditor"
rm -f "$HOME/.local/share/icons/mdeditor.png"
rm -f "$HOME/.local/share/applications/mdeditor.desktop"
update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true

echo "✓ MDeditor 제거 완료."
