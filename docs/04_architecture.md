# Daily Assistant — 아키텍처

## 전체 시스템 구조

```
┌─────────────────────────────────────────────────┐
│                   Component 1                    │
│         GitHub Actions 자동화 (서버리스)          │
│                                                  │
│  [매일 아침 07:00 KST]                           │
│  Notion 관심사 → 뉴스 수집                       │
│  Google Calendar → 오늘 일정                     │
│  Notion → 스몰스탭 목록                          │
│  Gemini API → 인사이트 생성                      │
│  LeetCode(JS) → 오늘의 문제                      │
│  → Gmail 발송                                   │
│                                                  │
│  [매일 저녁 21:00 KST]                           │
│  Notion → 미완료 스몰스탭                        │
│  Notion → 목표 목록                              │
│  → Gmail 발송                                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                   Component 2                    │
│           MCP 서버 (로컬, Claude Code)           │
│                                                  │
│  Claude Code ←→ MCP 서버                        │
│                   ├── Notion API                 │
│                   └── Google Calendar API        │
│                                                  │
│  사용 예시:                                      │
│  "오늘 뭐해야돼?" → 캘린더+노션 조회 → 답변     │
│  "지금 뭐할까?" → 시간대별 판단 → 추천          │
└─────────────────────────────────────────────────┘
```

## GitHub Actions 아침 브리핑 플로우

```
[Schedule: 매일 22:00 UTC = KST 07:00]
  → Notion DB 조회 (관심사/키워드)
  → 뉴스 수집 (RSS or 검색 API)
  → Google Calendar 조회 (오늘 일정)
  → Notion 조회 (스몰스탭 목록)
  → Gemini API 호출 (인사이트 생성)
  → LeetCode 문제 가져오기
  → 이메일 템플릿 조합
  → Gmail 발송
```

## GitHub Actions 저녁 브리핑 플로우

```
[Schedule: 매일 12:00 UTC = KST 21:00]
  → Notion 조회 (오늘 날짜 기준 미완료 스몰스탭)
  → Notion 조회 (목표 목록)
  → 이메일 템플릿 조합
  → Gmail 발송
```

## MCP 서버 플로우

```
Claude Code에서 자연어 입력
  → 스킬 트리거 ("오늘 뭐해야돼?" 등)
  → MCP 도구 호출
      ├── get_calendar_events() → 오늘 일정
      ├── get_notion_tasks() → 스몰스탭/할일
      └── get_notion_goals() → 목표 목록
  → Claude가 종합해서 답변
```
