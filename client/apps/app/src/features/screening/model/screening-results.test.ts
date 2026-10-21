import { describe, expect, it } from "vitest";
import { fallbackQuestionnaire } from "./screening";
import { buildLocalScreeningResult, mapScreeningHistory } from "./screening-results";

describe("screening result mapping", () => {
  it("maps server history into the persisted app result shape", () => {
    expect(mapScreeningHistory([{
      completedDate: "2026-10-01",
      publicSummary: "summary",
      recommendedRescreenAt: "2026-10-29",
      requiresSafetyPrompt: false,
      comparisonScore: 3
    }])).toEqual([{
      id: "screening:2026-10-01:0",
      completedDate: "2026-10-01",
      publicSummary: "summary",
      publicComfortMessage: "오늘 내 마음을 돌아본 것만으로도 충분히 의미 있어요.",
      recommendedActions: [],
      recommendedRescreenAt: "2026-10-29",
      requiresSafetyPrompt: false,
      comparisonScore: 3
    }]);
  });

  it("preserves local safety routing and persisted fields", () => {
    const questions = fallbackQuestionnaire.sections.flatMap((section) => section.items);
    const result = buildLocalScreeningResult(questions, { q9: "1" }, new Date("2026-10-01T12:00:00.000Z"));

    expect(result).toMatchObject({
      id: "screening:1790856000000",
      completedDate: "2026-10-01",
      recommendedRescreenAt: "2026-10-29",
      requiresSafetyPrompt: true
    });
    expect(result.recommendedActions).toHaveLength(3);
  });
});
