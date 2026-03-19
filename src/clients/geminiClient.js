import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-2.5-flash";

function getModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: MODEL });
}

/**
 * 429 Too Many Requests 시 retryDelay 만큼 대기 후 재시도
 */
async function withRetry(fn, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (err.status === 429 && attempt < maxRetries) {
        const retryInfo = err.errorDetails?.find(
          (d) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
        );
        const delayStr = retryInfo?.retryDelay ?? "10s";
        const delaySec = parseInt(delayStr) + 2;
        console.log(`  ⏳ Gemini 429 한도 초과 — ${delaySec}초 후 재시도 (${attempt + 1}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, delaySec * 1000));
      } else {
        throw err;
      }
    }
  }
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

  const result = await withRetry(() => getModel().generateContent(prompt));
  return result.response.text().trim();
}

/**
 * 관심사별 원하는 바 기반 콘텐츠 생성
 * @param {Array<{name, description}>} interests
 * @returns {Promise<Array<{name, content}>>}
 */
export async function generateInterestContent(interests) {
  const results = [];
  for (const { name, description } of interests) {
    const prompt = description
      ? `다음 주제에 대해 요청된 내용을 한국어로 알려주세요. 간결하게 3~5개 항목으로.\n\n주제: ${name}\n요청: ${description}`
      : `${name}에 관한 유용한 정보를 한국어로 3~5가지 알려주세요.`;
    const result = await withRetry(() => getModel().generateContent(prompt));
    results.push({ name, content: result.response.text().trim() });
  }
  return results;
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

  const result = await withRetry(() => getModel().generateContent(prompt));
  return result.response.text().trim();
}

/**
 * 목표 기반 내일 스몰스탭 제안 (구조화된 배열 반환)
 * @param {Array} goals
 * @param {Array} incompleteSteps
 * @returns {Promise<string[]>} 스몰스탭 제목 목록
 */
export async function suggestSmallSteps(goals, incompleteSteps) {
  const goalsText =
    goals.map((g) => `- ${g.title} (진행률 ${g.progress ?? 0}%)`).join("\n") || "없음";
  const stepsText =
    incompleteSteps.map((s) => `- ${s.title}`).join("\n") || "없음";

  const prompt = `아래 목표와 미완료 스몰스탭을 보고, 내일 할 수 있는 구체적인 스몰스탭 2~3개를 제안해주세요.
반드시 JSON 배열 형식으로만 응답하세요. 예: ["스몰스탭1", "스몰스탭2", "스몰스탭3"]

## 목표
${goalsText}

## 미완료 스몰스탭 (참고용, 중복 제안 금지)
${stepsText}`;

  const result = await withRetry(() => getModel().generateContent(prompt));
  const text = result.response.text().trim();
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  return JSON.parse(match[0]);
}

/**
 * 기존 목표 기반 새 목표 추천
 * @param {Array} goals
 * @returns {Promise<string>}
 */
export async function recommendGoals(goals) {
  const goalsText =
    goals.map((g) => `- ${g.title} (진행률 ${g.progress ?? 0}%)`).join("\n") || "없음";

  const prompt = `아래는 현재 설정된 목표 목록입니다. 이를 바탕으로 다음에 도전해볼 만한 새로운 목표 2~3가지를 한국어로 추천해주세요.
각 목표마다 한 줄 이유도 함께 적어주세요. 간결하게.

## 현재 목표
${goalsText}`;

  const result = await withRetry(() => getModel().generateContent(prompt));
  return result.response.text().trim();
}
