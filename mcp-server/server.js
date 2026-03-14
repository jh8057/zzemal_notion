import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// src/clients 경로 설정
const __dirname = dirname(fileURLToPath(import.meta.url));
process.env.NODE_PATH = join(__dirname, "..");

import { getSmallSteps, getGoals } from "../src/clients/notionClient.js";
import { getWeekEvents } from "../src/clients/calendarClient.js";
import { getWeekRange } from "../src/utils.js";

const server = new McpServer({
  name: "daily-assistant",
  version: "1.0.0",
});

server.tool(
  "get_week_tasks",
  "이번 주 스몰스탭(할 일) 목록을 가져옵니다. 완료 여부와 날짜 포함.",
  {},
  async () => {
    const steps = await getSmallSteps(false);
    if (!steps.length) return { content: [{ type: "text", text: "이번 주 등록된 스몰스탭이 없습니다." }] };

    const lines = steps.map((s) => {
      const mark = s.done ? "✅" : "⬜";
      return `${mark} [${s.date}] ${s.title}`;
    });
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

server.tool(
  "get_goals",
  "Notion에 등록된 목표 목록과 진행률을 가져옵니다.",
  {},
  async () => {
    const goals = await getGoals();
    if (!goals.length) return { content: [{ type: "text", text: "등록된 목표가 없습니다." }] };

    const lines = goals.map((g) => {
      const pct = g.progress ?? 0;
      const period = g.period ? ` (${g.period})` : "";
      return `🎯 ${g.title}${period} — ${pct}%`;
    });
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

server.tool(
  "get_week_events",
  "이번 주 Google Calendar 일정을 가져옵니다 (오늘~오늘+6일).",
  {},
  async () => {
    const events = await getWeekEvents();
    if (!events.length) return { content: [{ type: "text", text: "이번 주 캘린더 일정이 없습니다." }] };

    const lines = events.map((e) => {
      const time = e.start === "종일" ? "종일" : `${e.start}–${e.end}`;
      const loc = e.location ? ` 📍${e.location}` : "";
      return `🗓 [${e.date}] ${time} ${e.title}${loc}`;
    });
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

server.tool(
  "get_current_context",
  "현재 시간 기준 이번 주 일정 + 할 일 + 목표를 종합해서 반환합니다. '오늘 뭐해야돼?', '지금 뭐할까?', '이번 주 목표가 뭐야?' 질문에 사용하세요.",
  {},
  async () => {
    const now = new Date().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const { start, end } = getWeekRange();
    const [events, steps, goals] = await Promise.all([
      getWeekEvents(),
      getSmallSteps(false),
      getGoals(),
    ]);

    const eventsText = events.length
      ? events.map((e) => {
          const time = e.start === "종일" ? "종일" : `${e.start}–${e.end}`;
          return `  • [${e.date}] ${time} ${e.title}`;
        }).join("\n")
      : "  일정 없음";

    const stepsText = steps.length
      ? steps.map((s) => `  ${s.done ? "✅" : "⬜"} [${s.date}] ${s.title}`).join("\n")
      : "  스몰스탭 없음";

    const goalsText = goals.length
      ? goals.map((g) => `  🎯 ${g.title} (${g.progress ?? 0}%)`).join("\n")
      : "  목표 없음";

    const text = [
      `## 현재 시각: ${now} KST`,
      `## 이번 주 범위: ${start} ~ ${end}`,
      "",
      "## 이번 주 일정",
      eventsText,
      "",
      "## 이번 주 할 일 (스몰스탭)",
      stepsText,
      "",
      "## 목표",
      goalsText,
    ].join("\n");

    return { content: [{ type: "text", text }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
