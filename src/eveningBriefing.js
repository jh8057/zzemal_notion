import "dotenv/config";
import { getWeekRange, todayISO } from "./utils.js";
import { getSmallSteps, getGoals, createSmallStep } from "./clients/notionClient.js";
import { generateEveningSuggestions, suggestSmallSteps, recommendGoals } from "./clients/geminiClient.js";
import { sendEmail } from "./clients/gmailClient.js";
import { eveningEmail } from "./templates.js";

async function main() {
  const { start, end } = getWeekRange();
  const recipient = process.env.RECIPIENT_EMAIL;

  console.log("⬜ 미완료 스몰스탭 조회 (이번 주)...");
  const incompleteSteps = await getSmallSteps(true);

  console.log("🎯 목표 목록 조회...");
  const goals = await getGoals();

  console.log("💡 Gemini 행동 제안 생성...");
  const suggestions = await generateEveningSuggestions(incompleteSteps, goals);

  console.log("📝 내일 스몰스탭 자동 생성...");
  const tomorrow = (() => {
    const d = new Date(todayISO() + "T00:00:00+09:00");
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString("en-CA");
  })();
  const suggestedSteps = await suggestSmallSteps(goals, incompleteSteps);
  await Promise.all(suggestedSteps.map((title) => createSmallStep(title, tomorrow)));
  console.log(`  → ${suggestedSteps.length}개 스몰스탭 Notion에 추가 (${tomorrow})`);

  console.log("🌟 새 목표 추천 생성...");
  const goalRecommendations = await recommendGoals(goals);

  console.log("📧 이메일 발송...");
  const subject = `🌙 저녁 브리핑 — ${start} ~ ${end}`;
  const html = eveningEmail({ incompleteSteps, goals, suggestions, suggestedSteps, goalRecommendations });
  await sendEmail(recipient, subject, html);

  console.log(`✅ 발송 완료 → ${recipient}`);
}

main().catch((err) => {
  console.error("❌ 오류:", err);
  process.exit(1);
});
