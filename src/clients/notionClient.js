import { Client } from "@notionhq/client";
import { getWeekRange } from "../utils.js";

let _client = null;

function getClient() {
  if (!_client) _client = new Client({ auth: process.env.NOTION_API_KEY });
  return _client;
}

function getTitleText(props, ...keys) {
  for (const key of keys) {
    const items = props[key]?.title ?? [];
    if (items.length) return items[0].plain_text;
  }
  return "";
}

/** 관심사 목록 반환 (이름 + 페이지 본문의 원하는 바) */
export async function getInterests() {
  const { results } = await getClient().databases.query({
    database_id: process.env.NOTION_INTERESTS_DB_ID,
  });

  const interests = await Promise.all(
    results.map(async (p) => {
      const name = getTitleText(p.properties, "Name", "키워드", "Keyword");
      if (!name) return null;

      const { results: blocks } = await getClient().blocks.children.list({ block_id: p.id });
      const description = blocks
        .filter((b) => b.type === "bulleted_list_item" || b.type === "paragraph")
        .map((b) => (b[b.type]?.rich_text ?? []).map((t) => t.plain_text).join(""))
        .filter(Boolean)
        .join(", ");

      return { name, description };
    })
  );

  return interests.filter(Boolean);
}

/**
 * 이번 주 스몰스탭 목록 반환
 * @param {boolean} onlyIncomplete 미완료만 필터
 */
export async function getSmallSteps(onlyIncomplete = false) {
  const { start, end } = getWeekRange();

  const filters = [
    {
      property: "날짜",
      date: { on_or_after: start, on_or_before: end },
    },
  ];
  if (onlyIncomplete) {
    filters.push({ property: "완료", checkbox: { equals: false } });
  }

  const { results } = await getClient().databases.query({
    database_id: process.env.NOTION_SMALLSTEPS_DB_ID,
    filter: filters.length > 1 ? { and: filters } : filters[0],
    sorts: [{ property: "날짜", direction: "ascending" }],
  });

  return results.map((p) => {
    const props = p.properties;
    const title = getTitleText(props, "Name", "제목", "Task");
    const done = props["완료"]?.checkbox ?? props["Done"]?.checkbox ?? false;
    const date = props["날짜"]?.date?.start ?? "";
    return { title, done, date };
  });
}

/**
 * 스몰스탭 생성 (Notion DB에 새 항목 추가)
 * @param {string} title
 * @param {string} date YYYY-MM-DD
 */
export async function createSmallStep(title, date) {
  await getClient().pages.create({
    parent: { database_id: process.env.NOTION_SMALLSTEPS_DB_ID },
    properties: {
      Name: { title: [{ text: { content: title } }] },
      날짜: { date: { start: date } },
      완료: { checkbox: false },
    },
  });
}

/** 목표 목록 반환 */
export async function getGoals() {
  const { results } = await getClient().databases.query({
    database_id: process.env.NOTION_GOALS_DB_ID,
  });

  return results.map((p) => {
    const props = p.properties;
    const title = getTitleText(props, "Name", "목표", "Title");
    const d = props["기간"]?.date ?? props["Period"]?.date ?? null;
    const period = d ? (d.end ? `${d.start} ~ ${d.end}` : d.start) : "";
    const progress = props["진행률"]?.number ?? props["Progress"]?.number ?? 0;
    return { title, period, progress };
  });
}
