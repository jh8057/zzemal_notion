import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-2.5-flash";

function getModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: MODEL });
}

/**
 * 이번 주 일정 + 스몰스탭 기반 인사이트 생성
 * @param {Array} events
 * @param {Array} smallSteps
 * @returns {Promise<string>}
 */
export async function generateInsights(events, smallSteps) {
  const eventsText =
    events.map((e) => `- ${e.date} ${e.start} ${e.title}`).join("\n") || "일정 없음";
  const stepsText =
    smallSteps
      .map((s) => `- ${s.date} ${s.done ? "[완료]" : "[ ]"} ${s.title}`)
      .join("\n") || "스몰스탭 없음";

  const prompt = `이번 주 일정과 할 일 목록을 보고, 각 항목에 도움이 될 실용적인 팁이나 관련 정보를 한국어로 알려주세요.
너무 길지 않게 핵심만 (전체 250자 이내).

## 이번 주 일정
${eventsText}

## 이번 주 할 일 (스몰스탭)
${stepsText}`;

  const result = await getModel().generateContent(prompt);
  return result.response.text().trim();
}

/**
 * 저녁: 미완료 스몰스탭 + 목표 기반 행동 제안 생성
 * @param {Array} incompleteSteps
 * @param {Array} goals
 * @returns {Promise<string>}
 */
export async function generateEveningSuggestions(incompleteSteps, goals) {
  const stepsText =
    incompleteSteps.map((s) => `- ${s.date} ${s.title}`).join("\n") || "없음";
  const goalsText =
    goals.map((g) => `- ${g.title} (${g.period}, ${g.progress}%)`).join("\n") || "없음";

  const prompt = `이번 주 미완료된 할 일과 목표를 보고, 내일 또는 지금 당장 할 수 있는 구체적인 행동 1~3가지를 한국어로 제안해주세요.
간결하게 (전체 200자 이내).

## 미완료 할 일
${stepsText}

## 목표
${goalsText}`;

  const result = await getModel().generateContent(prompt);
  return result.response.text().trim();
}
