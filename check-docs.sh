#!/bin/bash
# check-docs.sh - 문서 규칙 체크

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

errors=0
warnings=0

# 1. CLAUDE.md 존재 여부 및 줄 수 체크
if [ ! -f "CLAUDE.md" ]; then
  echo -e "${RED}[ERROR] CLAUDE.md 파일이 없습니다.${NC}"
  ((errors++))
else
  lines=$(wc -l < CLAUDE.md)
  if [ "$lines" -gt 500 ]; then
    echo -e "${RED}[ERROR] CLAUDE.md가 500줄을 초과했습니다 (${lines}줄). docs/로 분리하세요.${NC}"
    ((errors++))
  elif [ "$lines" -gt 400 ]; then
    echo -e "${YELLOW}[WARN] CLAUDE.md가 400줄을 넘었습니다 (${lines}줄). 곧 분리가 필요합니다.${NC}"
    ((warnings++))
  else
    echo -e "${GREEN}[OK] CLAUDE.md: ${lines}줄${NC}"
  fi
fi

# 2. CHANGELOG.md 존재 여부
if [ ! -f "CHANGELOG.md" ]; then
  echo -e "${RED}[ERROR] CHANGELOG.md 파일이 없습니다.${NC}"
  ((errors++))
else
  echo -e "${GREEN}[OK] CHANGELOG.md 존재${NC}"
fi

# 3. docs/ 디렉토리 존재 여부
if [ ! -d "docs" ]; then
  echo -e "${YELLOW}[WARN] docs/ 디렉토리가 없습니다.${NC}"
  ((warnings++))
else
  doc_count=$(find docs -name '*.md' | wc -l)
  echo -e "${GREEN}[OK] docs/ 디렉토리: ${doc_count}개 문서${NC}"
fi

# 4. CLAUDE.md 필수 섹션 체크
if [ -f "CLAUDE.md" ]; then
  required_sections=("프로젝트 개요" "기술 스택" "현재 상태")
  for section in "${required_sections[@]}"; do
    if ! grep -q "$section" CLAUDE.md; then
      echo -e "${YELLOW}[WARN] CLAUDE.md에 '${section}' 섹션이 없습니다.${NC}"
      ((warnings++))
    fi
  done
fi

# 결과 요약
echo ""
echo "---"
if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
  echo -e "${GREEN}모든 문서 규칙을 준수하고 있습니다.${NC}"
else
  echo -e "결과: ${RED}오류 ${errors}건${NC}, ${YELLOW}경고 ${warnings}건${NC}"
fi

exit $errors
