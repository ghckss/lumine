import type { Emotion } from "./index";
import type { DateRange } from "./date";

export type JournalLike = {
  date: string;
  emotions: readonly string[];
};

export function emotionStats<T extends JournalLike>(journals: readonly T[]) {
  const counts = new Map<Emotion, number>();
  journals.forEach((record) =>
    record.emotions.forEach((emotion) => {
      const typedEmotion = emotion as Emotion;
      counts.set(typedEmotion, (counts.get(typedEmotion) ?? 0) + 1);
    }),
  );
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export function calculateStreak<T extends Pick<JournalLike, "date">>(
  journals: readonly T[],
) {
  const dates = new Set(journals.map((record) => record.date));
  let streak = 0;
  const cursor = new Date();
  if (!dates.has(localDate(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (dates.has(localDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function groupJournalRecordsByDate<
  T extends { date: string; createdAt: string },
>(records: readonly T[], range: DateRange) {
  const grouped = new Map<string, T[]>();
  records
    .filter((record) => record.date >= range.start && record.date <= range.end)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .forEach((record) =>
      grouped.set(record.date, [...(grouped.get(record.date) ?? []), record]),
    );
  return grouped;
}

export function replaceJournalRange<T extends { date: string }>(
  records: readonly T[],
  replacements: readonly T[],
  range: DateRange,
) {
  return [
    ...replacements,
    ...records.filter(
      (record) => record.date < range.start || record.date > range.end,
    ),
  ];
}

function localDate(date: Date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, "0"))
    .join("-");
}
