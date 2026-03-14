const GRAPHQL_URL = "https://leetcode.com/graphql";

const DAILY_QUERY = `
  query questionOfToday {
    activeDailyCodingChallengeQuestion {
      date
      link
      question {
        questionId
        title
        titleSlug
        difficulty
        content
        topicTags { name }
        hints
      }
    }
  }
`;

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * 오늘의 LeetCode Daily Challenge 반환
 * @returns {Promise<{title, difficulty, link, content, tags, hints}>}
 */
export async function getDailyProblem() {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify({ query: DAILY_QUERY }),
  });

  if (!res.ok) throw new Error(`LeetCode API 오류: ${res.status}`);

  const { data } = await res.json();
  const challenge = data.activeDailyCodingChallengeQuestion;
  const q = challenge.question;

  return {
    title: `#${q.questionId} ${q.title}`,
    difficulty: q.difficulty,
    link: `https://leetcode.com${challenge.link}`,
    content: stripHtml(q.content ?? ""),
    tags: q.topicTags.map((t) => t.name),
    hints: q.hints ?? [],
  };
}
