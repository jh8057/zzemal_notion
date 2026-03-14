# Daily Assistant — 기술 스택

## 확정된 스택

| 구분 | 기술 | 비고 |
|------|------|------|
| 자동화 | GitHub Actions | cron 스케줄, 서버 불필요 |
| 스크립트 | Python | 브리핑 로직 |
| AI (브리핑) | Gemini API | 인사이트 생성 |
| AI (MCP) | Claude Code (로컬) | 질문 응답 |
| 캘린더 | Google Calendar API | OAuth2 |
| 노트 | Notion API | REST API + MCP |
| 알림 | Gmail API | OAuth2 (Calendar와 동일 credentials) |
| MCP 런타임 | Python | 로컬 stdio |

## 미결정 항목

| 구분 | 후보 | 결정 기준 |
|------|------|---------|
| LeetCode 문제 수집 | 직접 크롤링 vs 공개 API | 안정성 |
| 뉴스 수집 | RSS vs 검색 API | 품질/비용 |

## 인프라 구조

```
[GitHub Actions] (서버리스, 무료)
  └── Python 스크립트
        ├── Notion API → 관심사/스몰스탭/목표 조회
        ├── Google Calendar API → 오늘 일정 조회
        ├── Gemini API → 인사이트 생성
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
| `GEMINI_API_KEY` | Google AI Studio API 키 |
| `GOOGLE_CREDENTIALS_JSON` | OAuth2 credentials (Calendar + Gmail 통합) |
| `GOOGLE_REFRESH_TOKEN` | OAuth2 갱신 토큰 |

## 환경 변수
```env
# GitHub Actions Secrets
NOTION_API_KEY=
GEMINI_API_KEY=
GOOGLE_CREDENTIALS_JSON=
GOOGLE_REFRESH_TOKEN=

# MCP 서버 (로컬 ~/.claude/mcp.json)
NOTION_API_KEY=
GOOGLE_CREDENTIALS_JSON=
GOOGLE_REFRESH_TOKEN=
```
