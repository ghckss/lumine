import { describe, expect, it } from "vitest";
import type { JournalRecord } from "../types/content";
import { buildMonthGrid, monthRange, shiftMonth } from "./calendar-date";
import { groupJournalRecordsByDate, replaceJournalRange } from "./journal-explorer";

function journal(date: string, emotions: string[], body = "", suffix = ""): JournalRecord {
  return { id: `journal:${date}${suffix}`, date, emotions, body, comfortMessage: "", createdAt: `${date}T0${suffix || "0"}:00:00Z`, version: 0, syncStatus: "synced" };
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

  it("groups only records in the selected month and preserves same-day entries", () => {
    const duplicate = journal("2026-09-03", ["불안"], "두 번째 기록", "1");
    const grouped = groupJournalRecordsByDate([...records, duplicate], { start: "2026-09-01", end: "2026-09-30" });
    expect([...grouped.keys()]).toEqual(["2026-09-03", "2026-09-02"]);
    expect(grouped.get("2026-09-03")?.map((record) => record.id)).toEqual([duplicate.id, "journal:2026-09-03"]);
  });

  it("replaces only the fetched range and preserves records outside it", () => {
    const next = replaceJournalRange(records, [journal("2026-09-04", ["기쁨"])], { start: "2026-09-01", end: "2026-09-30" });
    expect(next.map((record) => record.date)).toEqual(["2026-09-04", "2026-08-31"]);
  });
});
