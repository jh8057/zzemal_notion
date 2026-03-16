# Daily Assistant — 기술 스택

## 확정된 스택

| 구분 | 기술 | 비고 |
|------|------|------|
| 자동화 | GitHub Actions | cron 스케줄, 서버 불필요 |
| 스크립트 | Node.js (ES Modules) | 브리핑 로직 |
| AI (브리핑) | Gemini API (`gemini-2.5-flash`) | 인사이트 생성 |
| AI (MCP) | Claude Code (로컬) | 질문 응답 |
| 캘린더 | Google Calendar API | OAuth2, 전체 캘린더 병렬 조회 |
| 노트 | Notion API | REST API + MCP |
| 알림 | Gmail API | OAuth2 (Calendar와 동일 credentials) |
| MCP 런타임 | Node.js | 로컬 stdio |
| LeetCode | GraphQL API (공개) | leetcode.com/graphql |
| 뉴스 | Google News RSS | 키워드별 RSS 피드 수집 |

## 인프라 구조

```
[GitHub Actions] (서버리스, 무료)
  └── Node.js 스크립트
        ├── Notion API → 관심사/스몰스탭/목표 조회
        ├── Google Calendar API → 이번 주 전체 캘린더 일정 조회
        ├── Gemini API (gemini-2.5-flash) → 인사이트 생성
        ├── Google News RSS → 뉴스 수집
        ├── LeetCode GraphQL API → 오늘의 문제
        └── Gmail API → 브리핑 이메일 발송

[로컬 맥]
  └── Claude Code
        └── MCP 서버 (stdio, 자동 실행)
              ├── Notion API
              └── Google Calendar API
```

## GitHub Secrets (필요한 키)

| Secret | 설명 |
|--------|------|
| `NOTION_API_KEY` | Notion Integration 토큰 |
| `NOTION_INTERESTS_DB_ID` | 관심사/키워드 DB ID |
| `NOTION_SMALLSTEPS_DB_ID` | 스몰스탭 DB ID |
| `NOTION_GOALS_DB_ID` | 목표 DB ID |
| `GEMINI_API_KEY` | Google AI Studio API 키 |
| `GOOGLE_CREDENTIALS_JSON` | OAuth2 credentials (Calendar + Gmail 통합) |
| `GOOGLE_REFRESH_TOKEN` | OAuth2 갱신 토큰 |
| `RECIPIENT_EMAIL` | 브리핑 수신 이메일 |

## 환경 변수
```env
# GitHub Actions Secrets (Repository secrets에 등록)
NOTION_API_KEY=
NOTION_INTERESTS_DB_ID=
NOTION_SMALLSTEPS_DB_ID=
NOTION_GOALS_DB_ID=
GEMINI_API_KEY=
GOOGLE_CREDENTIALS_JSON=
GOOGLE_REFRESH_TOKEN=
RECIPIENT_EMAIL=

# MCP 서버 (로컬 ~/.claude/mcp.json)
NOTION_API_KEY=
NOTION_SMALLSTEPS_DB_ID=
NOTION_GOALS_DB_ID=
GOOGLE_CREDENTIALS_JSON=
GOOGLE_REFRESH_TOKEN=
```
