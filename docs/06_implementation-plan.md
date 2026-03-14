# Daily Assistant — 구현 계획

## Phase 1: API 키 준비

- [ ] Notion Integration 생성 → `NOTION_API_KEY` 발급
- [ ] Google AI Studio → `GEMINI_API_KEY` 발급
- [ ] Google Cloud Console → OAuth2 credentials 생성 (Calendar + Gmail 스코프)
- [ ] OAuth2 인증 흐름 실행 → `GOOGLE_REFRESH_TOKEN` 발급
- [ ] GitHub 레포 생성 → Secrets에 4개 키 등록

## Phase 2: Python 스크립트 작성

- [ ] `notion_client.py` — Notion API 연동 (관심사/스몰스탭/목표 조회)
- [ ] `calendar_client.py` — Google Calendar API 연동 (오늘 일정 조회)
- [ ] `gmail_client.py` — Gmail API 연동 (이메일 발송)
- [ ] `gemini_client.py` — Gemini API 연동 (인사이트 생성)
- [ ] `morning_briefing.py` — 아침 브리핑 메인 스크립트
- [ ] `evening_briefing.py` — 저녁 브리핑 메인 스크립트

## Phase 3: GitHub Actions 워크플로우

- [ ] `.github/workflows/morning.yml` — cron `0 22 * * *` (KST 07:00)
- [ ] `.github/workflows/evening.yml` — cron `0 12 * * *` (KST 21:00)
- [ ] Secrets 연결 확인
- [ ] 수동 실행(`workflow_dispatch`)으로 테스트
- [ ] 실제 스케줄 실행 확인

## Phase 4: 아침 브리핑 완성

- [ ] Notion 관심사 DB 조회 → 뉴스 수집 (RSS)
- [ ] Google Calendar 오늘 일정 조회
- [ ] Notion 스몰스탭 조회
- [ ] Gemini API 인사이트 생성
- [ ] LeetCode 문제 가져오기
- [ ] HTML 이메일 템플릿 조합
- [ ] Gmail 발송 테스트

## Phase 5: 저녁 브리핑 완성

- [ ] Notion 미완료 스몰스탭 조회
- [ ] Notion 목표 목록 조회
- [ ] HTML 이메일 템플릿 조합
- [ ] Gmail 발송 테스트

## Phase 6: MCP 서버 (로컬)

- [ ] MCP 서버 Python으로 구현
- [ ] Notion API 연동 함수
  - `get_today_tasks()` — 오늘 스몰스탭
  - `get_goals()` — 목표 목록
- [ ] Google Calendar API 연동 함수
  - `get_today_events()` — 오늘 일정
- [ ] Claude Code 설정에 MCP 서버 등록
- [ ] 스킬 생성 (트리거 패턴 등록)
- [ ] 테스트: "오늘 뭐해야돼?", "지금 뭐할까?"
