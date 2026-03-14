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

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
  });

  return (res.data.items ?? []).map((item) => {
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
