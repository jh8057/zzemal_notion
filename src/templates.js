import { getWeekRange } from "./utils.js";

const BASE_STYLE = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
         background: #f5f5f5; margin: 0; padding: 0; }
  .wrapper { max-width: 620px; margin: 0 auto; background: #fff; }
  .header { background: #1a1a2e; color: #fff; padding: 24px 32px; }
  .header h1 { margin: 0; font-size: 22px; }
  .header .sub { margin: 4px 0 0; opacity: .65; font-size: 13px; }
  .section { padding: 20px 32px; border-bottom: 1px solid #f0f0f0; }
  .section h2 { margin: 0 0 14px; font-size: 13px; font-weight: 600; color: #888;
                text-transform: uppercase; letter-spacing: .6px; }
  .day-group { margin-bottom: 14px; }
  .day-label { font-size: 12px; font-weight: 700; color: #1a1a2e;
               background: #eef; display: inline-block; padding: 2px 8px;
               border-radius: 4px; margin-bottom: 6px; }
  .event { padding: 4px 0; font-size: 14px; }
  .event .time { display: inline-block; width: 100px; color: #888; font-size: 13px; }
  .step { padding: 3px 0; font-size: 14px; }
  .step.done { color: #aaa; text-decoration: line-through; }
  .pill { display: inline-block; padding: 2px 8px; border-radius: 12px;
          font-size: 11px; background: #eee; margin: 2px; }
  .Easy { background: #d4edda; color: #155724; }
  .Medium { background: #fff3cd; color: #856404; }
  .Hard { background: #f8d7da; color: #721c24; }
  .insight-box { background: #f8f9ff; border-left: 3px solid #667eea;
                 padding: 12px 16px; border-radius: 4px; font-size: 14px; line-height: 1.7; }
  .news-kw { font-size: 12px; font-weight: 700; color: #555; margin: 10px 0 4px; }
  .news-item a { color: #1a73e8; text-decoration: none; font-size: 14px; line-height: 1.8; }
  .leet-meta { font-size: 13px; color: #666; margin-bottom: 10px; }
  .leet-content { font-size: 14px; line-height: 1.8; white-space: pre-wrap;
                  background: #fafafa; padding: 12px; border-radius: 4px; }
  .hint { background: #fff8e1; border-radius: 4px; padding: 8px 12px;
          font-size: 13px; margin-top: 6px; }
  .goal-item { padding: 5px 0; }
  .goal-name { font-size: 14px; font-weight: 500; }
  .goal-bar-wrap { background: #eee; border-radius: 4px; height: 5px; margin-top: 4px; }
  .goal-bar { background: #667eea; height: 5px; border-radius: 4px; }
  .footer { padding: 16px 32px; text-align: center; font-size: 12px; color: #bbb; }
`;

// 날짜 그룹핑 헬퍼
function groupByDate(items, dateKey = "date") {
  const map = new Map();
  for (const item of items) {
    const d = item[dateKey] ?? "";
    if (!map.has(d)) map.set(d, []);
    map.get(d).push(item);
  }
  return map;
}

function fmtDateLabel(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00+09:00");
  return d.toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function morningEmail({ events, smallSteps, news, insights, leetcode }) {
  const { start, end } = getWeekRange();
  const weekLabel = `${fmtDateLabel(start)} ~ ${fmtDateLabel(end)}`;

  // 일정 — 날짜별 그룹
  const eventsByDate = groupByDate(events);
  let eventsHtml = "";
  for (const [date, items] of eventsByDate) {
    eventsHtml += `<div class="day-group">
      <div class="day-label">${fmtDateLabel(date)}</div>`;
    for (const e of items) {
      const timeStr = e.start === "종일" ? "종일" : `${e.start}–${e.end}`;
      const loc = e.location ? `<br><span style="font-size:12px;color:#aaa;margin-left:100px">📍 ${e.location}</span>` : "";
      eventsHtml += `<div class="event"><span class="time">${timeStr}</span>${e.title}${loc}</div>`;
    }
    eventsHtml += "</div>";
  }
  if (!eventsHtml) eventsHtml = '<p style="color:#aaa;font-size:14px">이번 주 일정 없음</p>';

  // 스몰스탭 — 날짜별 그룹
  const stepsByDate = groupByDate(smallSteps);
  let stepsHtml = "";
  for (const [date, items] of stepsByDate) {
    stepsHtml += `<div class="day-group">
      <div class="day-label">${fmtDateLabel(date)}</div>`;
    for (const s of items) {
      const cls = s.done ? "step done" : "step";
      const mark = s.done ? "✅" : "⬜";
      stepsHtml += `<div class="${cls}">${mark} ${s.title}</div>`;
    }
    stepsHtml += "</div>";
  }
  if (!stepsHtml) stepsHtml = '<p style="color:#aaa;font-size:14px">이번 주 스몰스탭 없음</p>';

  // 뉴스
  const grouped = new Map();
  for (const n of news) {
    if (!grouped.has(n.keyword)) grouped.set(n.keyword, []);
    grouped.get(n.keyword).push(n);
  }
  let newsHtml = "";
  for (const [kw, articles] of grouped) {
    newsHtml += `<div class="news-kw">🔍 ${kw}</div>`;
    for (const a of articles) {
      newsHtml += `<div><a href="${a.link}" target="_blank">${a.title}</a></div>`;
    }
  }
  if (!newsHtml) newsHtml = '<p style="color:#aaa;font-size:14px">수집된 뉴스 없음</p>';

  // LeetCode
  const diffCls = leetcode.difficulty;
  const tagsHtml = (leetcode.tags ?? []).map((t) => `<span class="pill">${t}</span>`).join(" ");
  const hintsHtml = (leetcode.hints ?? [])
    .slice(0, 2)
    .map((h, i) => `<div class="hint">💡 힌트 ${i + 1}: ${h}</div>`)
    .join("");
  const leetHtml = `
    <div class="leet-meta">
      <span class="pill ${diffCls}">${leetcode.difficulty}</span> ${tagsHtml}
      &nbsp;<a href="${leetcode.link}" style="font-size:13px;color:#1a73e8">문제 풀기 →</a>
    </div>
    <div class="leet-content">${leetcode.content.slice(0, 800)}${leetcode.content.length > 800 ? "..." : ""}</div>
    ${hintsHtml}`;

  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${BASE_STYLE}</style></head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>☀️ 아침 브리핑</h1>
    <div class="sub">이번 주 · ${weekLabel}</div>
  </div>

  <div class="section">
    <h2>📅 이번 주 일정</h2>
    ${eventsHtml}
  </div>

  <div class="section">
    <h2>✅ 이번 주 할 일 (스몰스탭)</h2>
    ${stepsHtml}
  </div>

  <div class="section">
    <h2>✨ Gemini 인사이트</h2>
    <div class="insight-box">${insights.replace(/\n/g, "<br>")}</div>
  </div>

  <div class="section">
    <h2>📰 관심 뉴스</h2>
    ${newsHtml}
  </div>

  <div class="section">
    <h2>🧩 LeetCode — ${leetcode.title}</h2>
    ${leetHtml}
  </div>

  <div class="footer">Daily Assistant · GitHub Actions</div>
</div>
</body></html>`;
}

export function eveningEmail({ incompleteSteps, goals, suggestions }) {
  const { start, end } = getWeekRange();
  const weekLabel = `${fmtDateLabel(start)} ~ ${fmtDateLabel(end)}`;

  // 미완료 스몰스탭 — 날짜별 그룹
  const stepsByDate = groupByDate(incompleteSteps);
  let stepsHtml = "";
  for (const [date, items] of stepsByDate) {
    stepsHtml += `<div class="day-group">
      <div class="day-label">${fmtDateLabel(date)}</div>`;
    for (const s of items) {
      stepsHtml += `<div class="step">⬜ ${s.title}</div>`;
    }
    stepsHtml += "</div>";
  }
  if (!stepsHtml) stepsHtml = '<p style="color:#4caf50;font-size:14px">🎉 이번 주 스몰스탭 모두 완료!</p>';

  // 목표
  let goalsHtml = "";
  for (const g of goals) {
    const pct = Math.round(g.progress ?? 0);
    const period = g.period ? `<span style="color:#aaa;font-size:12px"> · ${g.period}</span>` : "";
    goalsHtml += `
    <div class="goal-item">
      <div class="goal-name">${g.title}${period}</div>
      <div class="goal-bar-wrap"><div class="goal-bar" style="width:${pct}%"></div></div>
      <span style="font-size:11px;color:#888">${pct}%</span>
    </div>`;
  }
  if (!goalsHtml) goalsHtml = '<p style="color:#aaa;font-size:14px">등록된 목표 없음</p>';

  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${BASE_STYLE}</style></head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>🌙 저녁 브리핑</h1>
    <div class="sub">이번 주 · ${weekLabel}</div>
  </div>

  <div class="section">
    <h2>⬜ 미완료 스몰스탭</h2>
    ${stepsHtml}
  </div>

  <div class="section">
    <h2>🎯 목표 현황</h2>
    ${goalsHtml}
  </div>

  <div class="section">
    <h2>💡 오늘 하면 좋을 행동</h2>
    <div class="insight-box">${suggestions.replace(/\n/g, "<br>")}</div>
  </div>

  <div class="footer">Daily Assistant · GitHub Actions</div>
</div>
</body></html>`;
}
