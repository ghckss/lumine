import { describe, expect, it } from "vitest";
import { buildMindReport, getPeriodBoundaries } from "./mind-report";
import type { JournalRecord, ScreeningResult } from "../types/content";

function journal(date: string, emotions: string[]): JournalRecord {
  return {
    id: `journal:${date}`,
    date,
    emotions,
    body: "",
    comfortMessage: "",
    createdAt: `${date}T00:00:00Z`,
    version: 0,
    syncStatus: "synced"
  };
}

function screening(date: string, comparisonScore?: number, requiresSafetyPrompt = false): ScreeningResult {
  return {
    id: `screening:${date}`,
    completedDate: date,
    publicSummary: "",
    publicComfortMessage: "",
    recommendedActions: [],
    recommendedRescreenAt: date,
    requiresSafetyPrompt,
    comparisonScore
  };
}

describe("mind report period boundaries", () => {
  it("uses Monday and the same elapsed weekdays for weekly comparison", () => {
    expect(getPeriodBoundaries("week", "2026-09-04")).toEqual({
      current: { start: "2026-08-31", end: "2026-09-04" },
      comparison: { start: "2026-08-24", end: "2026-08-28" },
      fullPeriodEnd: "2026-09-06",
      totalPeriodDays: 7
    });
  });

  it("handles a leap-year monthly boundary", () => {
    expect(getPeriodBoundaries("month", "2024-02-29")).toEqual({
      current: { start: "2024-02-01", end: "2024-02-29" },
      comparison: { start: "2024-01-01", end: "2024-01-29" },
      fullPeriodEnd: "2024-02-29",
      totalPeriodDays: 29
    });
  });

  it("does not let comparison overflow a shorter previous month", () => {
    expect(getPeriodBoundaries("month", "2026-03-31").comparison).toEqual({
      start: "2026-02-01",
      end: "2026-02-28"
    });
  });
});

describe("buildMindReport", () => {
  it("summarizes records, emotions, changes, and meaningful days", () => {
    const report = buildMindReport({
      period: "week",
      referenceDate: "2026-09-04",
      journals: [
        journal("2026-09-04", ["평온", "감사"]),
        journal("2026-09-03", ["불안", "지침"]),
        journal("2026-09-02", ["평온", "직접입력"]),
        journal("2026-08-28", ["불안"]),
        journal("2026-08-27", ["평온"])
      ],
      screenings: []
    });

    expect(report.recordedDays).toBe(3);
    expect(report.previousRecordedDays).toBe(2);
    expect(report.recordedDayDifference).toBe(1);
    expect(report.topEmotions[0]).toEqual({ emotion: "평온", count: 2 });
    expect(report.emotionChanges[0]).toEqual({ emotion: "평온", count: 2, previousCount: 1, difference: 1 });
    expect(report.comfortableDays.map((day) => day.date)).toEqual(["2026-09-04", "2026-09-02"]);
    expect(report.heavyDays.map((day) => day.date)).toEqual(["2026-09-03"]);
  });

  it("compares screening results without exposing a score message", () => {
    const lighter = buildMindReport({
      period: "month",
      referenceDate: "2026-09-20",
      journals: [],
      screenings: [screening("2026-09-10", 8), screening("2026-08-10", 14)]
    });
    expect(lighter.screeningTrend.kind).toBe("lighter");
    expect(lighter.screeningTrend.message).not.toContain("8");

    const insufficient = buildMindReport({
      period: "month",
      referenceDate: "2026-09-20",
      journals: [],
      screenings: [screening("2026-09-10")]
    });
    expect(insufficient.screeningTrend.kind).toBe("unavailable");
  });

  it("prioritizes safety support and a connection action", () => {
    const report = buildMindReport({
      period: "month",
      referenceDate: "2026-09-20",
      journals: [journal("2026-09-02", ["평온"])],
      screenings: [screening("2026-09-10", 3, true), screening("2026-08-10", 2)]
    });
    expect(report.screeningTrend.kind).toBe("safety");
    expect(report.smallAction).toContain("사람 한 명");
  });

  it("keeps an earlier safety signal visible within the current period", () => {
    const report = buildMindReport({
      period: "month",
      referenceDate: "2026-09-20",
      journals: [],
      screenings: [
        screening("2026-09-15", 3, false),
        screening("2026-09-05", 20, true),
        screening("2026-08-10", 2)
      ]
    });
    expect(report.screeningTrend.kind).toBe("safety");
  });

  it("counts duplicate cached entries as one recorded date", () => {
    const report = buildMindReport({
      period: "week",
      referenceDate: "2026-09-04",
      journals: [journal("2026-09-04", ["평온"]), journal("2026-09-04", ["불안"])],
      screenings: []
    });
    expect(report.recordedDays).toBe(1);
  });

  it("provides a useful empty report without inventing changes", () => {
    const report = buildMindReport({ period: "week", referenceDate: "2026-09-04", journals: [], screenings: [] });
    expect(report.hasRecords).toBe(false);
    expect(report.topEmotions).toEqual([]);
    expect(report.comfortableDays).toEqual([]);
    expect(report.heavyDays).toEqual([]);
    expect(report.screeningTrend.kind).toBe("unavailable");
    expect(report.smallAction).toContain("한 단어");
  });
});
