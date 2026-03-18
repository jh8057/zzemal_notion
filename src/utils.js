/** KST 기준 오늘 날짜 (YYYY-MM-DD) */
export function todayISO() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());
}

/** HH:MM 포맷 변환 (KST) */
export function fmtTime(dtStr) {
  if (!dtStr || !dtStr.includes("T")) return dtStr ?? "";
  return new Date(dtStr).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * 이번 주 범위 반환 (오늘 ~ 오늘+6일, KST 기준)
 * @returns {{ start: string, end: string }} YYYY-MM-DD strings
 */
export function getWeekRange() {
  const fmt = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" });
  const start = fmt.format(new Date());

  // KST 기준 오늘 자정을 UTC ms로 계산 후 6일 더함
  const startMs = new Date(`${start}T00:00:00+09:00`).getTime();
  const end = fmt.format(new Date(startMs + 6 * 24 * 60 * 60 * 1000));

  return { start, end };
}

/**
 * 이번 주 범위를 RFC3339 datetime으로 반환 (Google Calendar API용)
 * KST 00:00 ~ KST+6일 23:59:59
 */
export function getWeekRangeDatetime() {
  const { start, end } = getWeekRange();
  return {
    timeMin: `${start}T00:00:00+09:00`,
    timeMax: `${end}T23:59:59+09:00`,
  };
}
