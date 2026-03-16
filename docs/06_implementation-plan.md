# Daily Assistant — 구현 계획

## Phase 1: API 키 준비

- [x] Notion Integration 생성 → `NOTION_API_KEY` 발급
- [x] Google AI Studio → `GEMINI_API_KEY` 발급
- [x] Google Cloud Console → OAuth2 credentials 생성 (Calendar + Gmail 스코프)
- [x] OAuth2 인증 흐름 실행 → `GOOGLE_REFRESH_TOKEN` 발급
- [x] GitHub 레포 생성 → Secrets에 키 등록 (Repository secrets)

## Phase 2: Node.js 스크립트 작성

- [x] `src/clients/notionClient.js` — Notion API 연동 (관심사/스몰스탭/목표 조회)
- [x] `src/clients/calendarClient.js` — Google Calendar API 연동 (전체 캘린더 병렬 조회)
- [x] `src/clients/gmailClient.js` — Gmail API 연동 (이메일 발송)
- [x] `src/clients/geminiClient.js` — Gemini API 연동 (`gemini-2.5-flash`)
- [x] `src/clients/newsClient.js` — Google News RSS 수집
- [x] `src/clients/leetcodeClient.js` — LeetCode GraphQL API
- [x] `src/morningBriefing.js` — 아침 브리핑 메인 스크립트
- [x] `src/eveningBriefing.js` — 저녁 브리핑 메인 스크립트

## Phase 3: GitHub Actions 워크플로우

- [x] `.github/workflows/morning.yml` — cron `0 22 * * *` (KST 07:00)
- [x] `.github/workflows/evening.yml` — cron `0 12 * * *` (KST 21:00)
- [x] Secrets 연결 확인
- [x] 수동 실행(`workflow_dispatch`)으로 테스트 완료
- [ ] 실제 스케줄 실행 확인 (내일 07:00 KST 예정)

## Phase 4: 아침 브리핑 완성

- [x] Notion 관심사 DB 조회 → 페이지 본문(원하는 바) 블록 파싱 → Gemini 맞춤 콘텐츠 생성
- [x] Google Calendar 이번 주 일정 조회
- [x] Notion 스몰스탭 조회
- [x] Gemini API 인사이트 생성
- [x] LeetCode 제목 + 링크만 표시
- [x] HTML 이메일 템플릿 조합
- [x] Gmail 발송 테스트 (로컬 확인 완료)

## Phase 5: 저녁 브리핑 완성

- [x] Notion 미완료 스몰스탭 조회
- [x] Notion 목표 목록 조회
- [x] 목표 기반 내일 스몰스탭 자동 생성 → Notion 작성 (F-11)
- [x] 새 목표 추천 생성 → 저녁 이메일 포함 (F-12)
- [x] HTML 이메일 템플릿 조합
- [x] Gmail 발송 테스트 (로컬 확인 완료)

## Phase 6: MCP 서버 (로컬)

- [x] MCP 서버 Node.js로 구현 (`mcp-server/server.js`)
- [x] Notion API 연동 함수
  - `get_today_tasks()` — 오늘 스몰스탭
  - `get_goals()` — 목표 목록
- [x] Google Calendar API 연동 함수
  - `get_today_events()` — 오늘 일정
- [ ] Claude Code 설정에 MCP 서버 등록
- [ ] 테스트: "오늘 뭐해야돼?", "지금 뭐할까?"
