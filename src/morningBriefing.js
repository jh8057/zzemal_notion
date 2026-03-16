import "dotenv/config";
import { getWeekRange } from "./utils.js";
import { getInterests, getSmallSteps } from "./clients/notionClient.js";
import { getWeekEvents } from "./clients/calendarClient.js";
import { generateInsights, generateInterestContent } from "./clients/geminiClient.js";
import { getDailyProblem } from "./clients/leetcodeClient.js";
import { sendEmail } from "./clients/gmailClient.js";
import { morningEmail } from "./templates.js";

async function main() {
  const { start, end } = getWeekRange();
  const recipient = process.env.RECIPIENT_EMAIL;

  console.log("📅 캘린더 조회 (이번 주)...");
  const events = await getWeekEvents();

  console.log("✅ 스몰스탭 조회 (이번 주)...");
  const smallSteps = await getSmallSteps(false);

  console.log("🔍 관심사 조회...");
  const interests = await getInterests();

  console.log(`✨ 관심사 콘텐츠 생성 (${interests.length}개)...`);
  const interestContent = interests.length ? await generateInterestContent(interests) : [];

  console.log("✨ Gemini 인사이트 생성...");
  const insights = await generateInsights(events, smallSteps);

  console.log("🧩 LeetCode 문제 수집...");
  let leetcode;
  try {
    leetcode = await getDailyProblem();
  } catch (err) {
    console.error("  LeetCode 수집 실패:", err.message);
    leetcode = {
      title: "오늘의 문제를 불러올 수 없습니다",
      difficulty: "Unknown",
      link: "https://leetcode.com",
      content: "",
      tags: [],
      hints: [],
    };
  }

  console.log("📧 이메일 발송...");
  const subject = `☀️ 아침 브리핑 — ${start} ~ ${end}`;
  const html = morningEmail({ events, smallSteps, interestContent, insights, leetcode });
  await sendEmail(recipient, subject, html);

  console.log(`✅ 발송 완료 → ${recipient}`);
}

main().catch((err) => {
  console.error("❌ 오류:", err);
  process.exit(1);
});
