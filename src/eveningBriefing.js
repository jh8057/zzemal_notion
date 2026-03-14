import "dotenv/config";
import { getWeekRange } from "./utils.js";
import { getSmallSteps, getGoals } from "./clients/notionClient.js";
import { generateEveningSuggestions } from "./clients/geminiClient.js";
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

  console.log("📧 이메일 발송...");
  const subject = `🌙 저녁 브리핑 — ${start} ~ ${end}`;
  const html = eveningEmail({ incompleteSteps, goals, suggestions });
  await sendEmail(recipient, subject, html);

  console.log(`✅ 발송 완료 → ${recipient}`);
}

main().catch((err) => {
  console.error("❌ 오류:", err);
  process.exit(1);
});
