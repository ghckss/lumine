import type { JournalRecord } from "../types/content";
import { isValidIsoDate, monthRange, type DateRange } from "./calendar-date";

export type JournalExplorerFilters = {
  query: string;
  emotions: string[];
  startDate: string;
  endDate: string;
};

export function validateDateRange(startDate: string, endDate: string) {
  if (!startDate && !endDate) return null;
  if (!startDate || !endDate) return "시작일과 종료일을 모두 입력해 주세요.";
  if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) return "날짜를 YYYY-MM-DD 형식으로 입력해 주세요.";
  if (startDate > endDate) return "시작일은 종료일보다 늦을 수 없어요.";
  return null;
}

export function effectiveDateRange(monthDate: string, startDate: string, endDate: string): DateRange {
  return validateDateRange(startDate, endDate) === null && startDate && endDate
    ? { start: startDate, end: endDate }
    : monthRange(monthDate);
}

export function filterJournalRecords(records: JournalRecord[], range: DateRange, filters: Pick<JournalExplorerFilters, "query" | "emotions">) {
  const query = filters.query.trim().toLocaleLowerCase("ko-KR");
  const selected = new Set(filters.emotions);
  const unique = new Map<string, JournalRecord>();
  records.forEach((record) => {
    if (!unique.has(record.date)) unique.set(record.date, record);
  });
  return [...unique.values()]
    .filter((record) => record.date >= range.start && record.date <= range.end)
    .filter((record) => selected.size === 0 || record.emotions.some((emotion) => selected.has(emotion)))
    .filter((record) => !query || record.body.toLocaleLowerCase("ko-KR").includes(query))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function collectEmotionOptions(records: JournalRecord[], preferred: readonly string[]) {
  const present = new Set(records.flatMap((record) => record.emotions));
  const known = preferred.filter((emotion) => present.has(emotion));
  const custom = [...present].filter((emotion) => !preferred.includes(emotion)).sort((a, b) => a.localeCompare(b, "ko"));
  return [...known, ...custom];
}

export function replaceJournalRange(records: JournalRecord[], replacements: JournalRecord[], range: DateRange) {
  return [
    ...replacements,
    ...records.filter((record) => record.date < range.start || record.date > range.end)
  ];
}
