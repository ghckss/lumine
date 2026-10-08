import type { JournalRecord } from "../types/content";
import type { DateRange } from "./calendar-date";

export function groupJournalRecordsByDate(records: JournalRecord[], range: DateRange) {
  const grouped = new Map<string, JournalRecord[]>();
  records
    .filter((record) => record.date >= range.start && record.date <= range.end)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .forEach((record) => grouped.set(record.date, [...(grouped.get(record.date) ?? []), record]));
  return grouped;
}

export function replaceJournalRange(records: JournalRecord[], replacements: JournalRecord[], range: DateRange) {
  return [
    ...replacements,
    ...records.filter((record) => record.date < range.start || record.date > range.end)
  ];
}
