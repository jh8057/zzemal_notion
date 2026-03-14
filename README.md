# Daily Assistant

Google Calendar + Notion 데이터 기반 **이번 주** 아침/저녁 브리핑 자동 발송 + Claude Code MCP 연동.

## 구조

```
.
├── src/
│   ├── clients/
│   │   ├── notionClient.js     # Notion API (관심사/스몰스탭/목표)
│   │   ├── calendarClient.js   # Google Calendar API — 이번 주 일정
│   │   ├── gmailClient.js      # Gmail API
│   │   ├── geminiClient.js     # Gemini API (인사이트 생성)
│   │   ├── newsClient.js       # Google News RSS 수집
│   │   └── leetcodeClient.js   # LeetCode Daily Challenge
│   ├── templates.js            # HTML 이메일 템플릿
│   ├── utils.js                # 날짜 유틸 (주간 범위 계산)
│   ├── morningBriefing.js      # 아침 브리핑 메인
│   └── eveningBriefing.js      # 저녁 브리핑 메인
├── mcp-server/
│   └── server.js               # MCP 서버 (Claude Code 연동)
├── .github/workflows/
│   ├── morning.yml             # 매일 07:00 KST 자동 실행
│   └── evening.yml             # 매일 21:00 KST 자동 실행
└── package.json
```

## 일정 범위

- 캘린더/스몰스탭 모두 **오늘 ~ 오늘+6일 (KST 기준 1주일)** 조회
- 이메일에서 날짜별로 그룹핑하여 표시

## 설정

### 1. GitHub Secrets 등록

| Secret | 설명 |
|--------|------|
| `NOTION_API_KEY` | Notion Integration 토큰 |
| `NOTION_INTERESTS_DB_ID` | 관심사/키워드 DB ID |
| `NOTION_SMALLSTEPS_DB_ID` | 스몰스탭 DB ID |
| `NOTION_GOALS_DB_ID` | 목표 DB ID |
| `GEMINI_API_KEY` | Google AI Studio API 키 |
| `GOOGLE_CREDENTIALS_JSON` | OAuth2 credentials JSON (문자열) |
| `GOOGLE_REFRESH_TOKEN` | OAuth2 refresh token |
| `RECIPIENT_EMAIL` | 브리핑 수신 이메일 |

### 2. Notion DB ID 찾는 법

Notion 페이지 URL: `https://notion.so/workspace/[DB_ID]?v=...`
→ `?v=` 앞의 32자리 문자열이 DB ID

### 3. Notion DB 프로퍼티 이름 규칙

| DB | 필수 프로퍼티 |
|----|--------------|
| 관심사 | `Name` 또는 `키워드` (Title 타입) |
| 스몰스탭 | `Name`/`제목` (Title), `완료`/`Done` (Checkbox), `날짜` (Date) |
| 목표 | `Name`/`목표` (Title), `기간` (Date), `진행률` (Number %) |

### 4. Google OAuth2 Refresh Token 발급

```bash
npm install -g google-auth-library
node -e "
const { OAuth2Client } = require('google-auth-library');
const creds = require('./credentials.json').installed;
const client = new OAuth2Client(creds.client_id, creds.client_secret, 'urn:ietf:wg:oauth:2.0:oob');
const url = client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/gmail.send',
  ],
});
console.log('아래 URL 접속 후 코드 복사:\n', url);
"
# 코드 입력 후 refresh_token 확인
```

### 5. MCP 서버 등록 (Claude Code)

`~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "daily-assistant": {
      "command": "node",
      "args": ["/절대경로/zzemal_notion/mcp-server/server.js"],
      "env": {
        "NOTION_API_KEY": "secret_xxxx",
        "NOTION_SMALLSTEPS_DB_ID": "xxxx",
        "NOTION_GOALS_DB_ID": "xxxx",
        "GOOGLE_CREDENTIALS_JSON": "{...}",
        "GOOGLE_REFRESH_TOKEN": "1//xxxx"
      }
    }
  }
}
```

## 로컬 테스트

```bash
cp .env.example .env
# .env 파일에 실제 값 입력

npm install
npm run morning   # 아침 브리핑 테스트
npm run evening   # 저녁 브리핑 테스트
npm run mcp       # MCP 서버 단독 실행
```

## MCP 사용 예시

Claude Code에서:
- "오늘 뭐해야돼?" → 이번 주 일정 + 스몰스탭 기반 답변
- "지금 뭐할까?" → 현재 시간 고려한 추천
- "이번 주 목표가 뭐야?" → 목표 목록 답변
