import { google } from "googleapis";
import { fmtTime, getWeekRangeDatetime } from "../utils.js";

function buildAuth() {
  const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  const { client_id, client_secret } = creds.installed;

  const oauth2 = new google.auth.OAuth2(client_id, client_secret);
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return oauth2;
}

/**
 * 이번 주 Google Calendar 일정 반환 (오늘~오늘+6일, KST 기준)
 * @returns {Promise<Array<{title, start, end, location, date}>>}
 */
export async function getWeekEvents() {
  const auth = buildAuth();
  const calendar = google.calendar({ version: "v3", auth });

  const { timeMin, timeMax } = getWeekRangeDatetime();

  // 전체 캘린더 목록 조회
  const calListRes = await calendar.calendarList.list();
  const calendarIds = (calListRes.data.items ?? []).map((c) => c.id);

  // 모든 캘린더에서 병렬로 이벤트 조회
  const results = await Promise.all(
    calendarIds.map((calendarId) =>
      calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
      }).catch(() => ({ data: { items: [] } }))
    )
  );

  const allItems = results.flatMap((res) => res.data.items ?? []);

  // 시작 시간 기준 정렬
  allItems.sort((a, b) => {
    const aStart = a.start.dateTime ?? a.start.date ?? "";
    const bStart = b.start.dateTime ?? b.start.date ?? "";
    return aStart.localeCompare(bStart);
  });

  return allItems.map((item) => {
    const startRaw = item.start.dateTime ?? item.start.date ?? "";
    const endRaw = item.end.dateTime ?? item.end.date ?? "";
    const isAllDay = !item.start.dateTime;

    return {
      title: item.summary ?? "(제목 없음)",
      start: isAllDay ? "종일" : fmtTime(startRaw),
      end: isAllDay ? "" : fmtTime(endRaw),
      location: item.location ?? "",
      date: startRaw.slice(0, 10),
    };
  });
}
