#!/bin/bash
if grep -q "function multiply(a, b) { return a \* b; }" calculator.js; then
  exit 0  # 테스트 성공(정상 구현)
else
  exit 1  # 테스트 실패(버그 존재)
fi
