import { describe, expect, it } from "vitest";
import type { JournalRecord } from "../types/content";
import { buildMonthGrid, monthRange, shiftMonth } from "./calendar-date";
import { collectEmotionOptions, effectiveDateRange, filterJournalRecords, validateDateRange } from "./journal-explorer";

function journal(date: string, emotions: string[], body = ""): JournalRecord {
  return { id: `journal:${date}`, date, emotions, body, comfortMessage: "", createdAt: `${date}T00:00:00Z`, version: 0, syncStatus: "synced" };
}

describe("calendar dates", () => {
  it("builds a Monday-first six-week grid around a leap February", () => {
    const grid = buildMonthGrid("2024-02-15");
    expect(grid).toHaveLength(42);
    expect(grid[0]).toEqual({ date: "2024-01-29", day: 29, inMonth: false });
    expect(grid[31]).toEqual({ date: "2024-02-29", day: 29, inMonth: true });
    expect(grid[41].date).toBe("2024-03-10");
  });

  it("moves across years and returns exact month boundaries", () => {
    expect(shiftMonth("2026-01-15", -1)).toBe("2025-12-01");
    expect(monthRange("2026-12-01")).toEqual({ start: "2026-12-01", end: "2026-12-31" });
  });
});

describe("journal explorer", () => {
  const records = [
    journal("2026-09-03", ["평온", "홀가분"], "오늘은 산책을 했다"),
    journal("2026-09-02", ["불안"], "회의가 걱정됐다"),
    journal("2026-08-31", ["평온"], "산책은 좋았다")
  ];

  it("validates incomplete, invalid and reversed periods", () => {
    expect(validateDateRange("", "")).toBeNull();
    expect(validateDateRange("2026-09-01", "")).toContain("모두");
    expect(validateDateRange("2026-02-30", "2026-03-01")).toContain("형식");
    expect(validateDateRange("2026-09-03", "2026-09-01")).toContain("늦을");
  });

  it("uses a valid custom range instead of the selected month", () => {
    expect(effectiveDateRange("2026-09-01", "2026-08-20", "2026-09-02")).toEqual({ start: "2026-08-20", end: "2026-09-02" });
    expect(effectiveDateRange("2026-09-01", "", "")).toEqual({ start: "2026-09-01", end: "2026-09-30" });
  });

  it("combines range, emotion OR and case-insensitive trimmed body search", () => {
    const result = filterJournalRecords(records, { start: "2026-09-01", end: "2026-09-30" }, {
      emotions: ["평온", "불안"],
      query: "  산책 "
    });
    expect(result.map((record) => record.date)).toEqual(["2026-09-03"]);
  });

  it("matches any selected emotion and removes duplicate dates", () => {
    const result = filterJournalRecords([...records, journal("2026-09-03", ["불안"], "중복")], { start: "2026-09-01", end: "2026-09-30" }, {
      emotions: ["불안", "홀가분"], query: ""
    });
    expect(result.map((record) => record.date)).toEqual(["2026-09-03", "2026-09-02"]);
  });

  it("includes custom emotions after preferred present emotions", () => {
    expect(collectEmotionOptions(records, ["기쁨", "평온", "불안"])).toEqual(["평온", "불안", "홀가분"]);
  });
});
