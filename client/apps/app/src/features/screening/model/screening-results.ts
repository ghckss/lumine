import type { ScreeningHistoryItem } from "@lumine/api-contracts";
import type { ScreeningQuestion, ScreeningResult } from "./screening";

const HISTORY_COMFORT_MESSAGE = "오늘 내 마음을 돌아본 것만으로도 충분히 의미 있어요.";

export function mapScreeningHistory(history: ScreeningHistoryItem[]): ScreeningResult[] {
  return history.map((result, index) => ({
    id: `screening:${result.completedDate}:${index}`,
    completedDate: result.completedDate,
    publicSummary: result.publicSummary,
    publicComfortMessage: HISTORY_COMFORT_MESSAGE,
    recommendedActions: [],
    recommendedRescreenAt: result.recommendedRescreenAt,
    requiresSafetyPrompt: result.requiresSafetyPrompt,
    comparisonScore: result.comparisonScore
  }));
}

export function buildLocalScreeningResult(
  questions: ScreeningQuestion[],
  answers: Record<string, string>,
  now = new Date()
): ScreeningResult {
  const score = questions.reduce(
    (sum, question) => sum + (question.options.find((option) => option.value === answers[question.id])?.score ?? 0),
    0
  );
  const crisisQuestion = questions.find((question) => question.id === "q9" || question.title.includes("해치려는"));
  const crisis = crisisQuestion ? Number(answers[crisisQuestion.id] ?? 0) > 0 : false;
  const next = new Date(now);
  next.setDate(next.getDate() + 28);

  return {
    id: `screening:${now.getTime()}`,
    completedDate: now.toISOString().slice(0, 10),
    publicSummary: score <= 9
      ? "마음이 전반적으로 안정적인 편이에요. 지금처럼 자신을 잘 돌봐주세요."
      : score <= 19
        ? "최근 감정적으로 조금 지쳐있는 것 같아요. 나를 위한 시간이 필요해 보여요."
        : "마음이 많이 힘든 상태인 것 같아요. 당신을 위한 도움이 필요한 시기예요.",
    publicComfortMessage: crisis
      ? "당신의 마음이 많이 지쳐있는 것 같아요. 혼자 버티려 하지 않아도 돼요. 도움을 요청하는 것은 용기 있는 일이에요."
      : "오늘 자신의 마음을 들여다보는 시간을 가진 것이 정말 소중해요. 작은 불편함도 솔직하게 마주한 나를 다독여주세요.",
    recommendedActions: [
      "규칙적인 수면 시간을 지켜보세요",
      "가벼운 산책이나 스트레칭을 시도해보세요",
      "신뢰하는 사람과 솔직하게 이야기 나눠보세요"
    ],
    recommendedRescreenAt: next.toISOString().slice(0, 10),
    requiresSafetyPrompt: crisis,
    comparisonScore: score
  };
}
