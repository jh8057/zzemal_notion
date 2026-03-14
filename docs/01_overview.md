# Daily Assistant — 프로젝트 개요

## 한 줄 설명
> Google Calendar와 Notion 데이터를 기반으로 아침/저녁 브리핑을 자동 발송하고, 수시로 Claude에게 오늘 할 일을 물어볼 수 있는 개인 생산성 시스템

## 구성 요소

### 1. GitHub Actions 자동화 (아침/저녁 브리핑)
- 서버 없이 GitHub Actions cron으로 스케줄 실행
- Python 스크립트로 Notion/Calendar 데이터 수집 → Gmail 발송

### 2. MCP 서버 (Claude Code 연동)
- 로컬에서 실행 (Claude Code가 자동 시작/종료)
- "오늘 뭐해야돼?", "지금 뭐할까?" 등 수시 질문 응답

## 핵심 목표
- [ ] 아침에 자동으로 맞춤 뉴스 + 일정 + 학습 브리핑 받기
- [ ] 저녁에 오늘 못한 스몰스탭과 목표 리마인더 받기
- [ ] Claude Code에서 수시로 할 일 물어보기

## 대상 사용자
나 혼자 (개인 생산성 도구)

## 범위
**In Scope**
- GitHub Actions 아침 브리핑 (뉴스 + 캘린더 + 스몰스탭 + Gemini 인사이트 + LeetCode 문제)
- GitHub Actions 저녁 브리핑 (미완료 스몰스탭 + 목표 리마인더)
- MCP 서버 (Notion + Google Calendar 연동, Claude Code 질문 응답)

**Out of Scope**
- 모바일 앱 개발
- 팀/다중 사용자 지원
- 워크플로우 GUI 대시보드
