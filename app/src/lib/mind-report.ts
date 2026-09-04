import type { JournalRecord, ScreeningResult } from "../types/content";

export type MindReportPeriod = "week" | "month";

export type ReportDateRange = {
  start: string;
  end: string;
};

export type EmotionFrequency = {
  emotion: string;
  count: number;
};

export type EmotionChange = EmotionFrequency & {
  previousCount: number;
  difference: number;
};

export type ReportDay = {
  date: string;
  emotions: string[];
  balance: number;
};

export type ScreeningTrend =
  | { kind: "unavailable"; message: string }
  | { kind: "safety"; message: string }
  | { kind: "lighter" | "similar" | "heavier"; difference: number; message: string };

export type MindReport = {
  period: MindReportPeriod;
  currentRange: ReportDateRange;
  comparisonRange: ReportDateRange;
  fullPeriodEnd: string;
  totalPeriodDays: number;
  elapsedDays: number;
  recordedDays: number;
  previousRecordedDays: number;
  recordedDayDifference: number;
  topEmotions: EmotionFrequency[];
  emotionChanges: EmotionChange[];
  comfortableDays: ReportDay[];
  heavyDays: ReportDay[];
  screeningTrend: ScreeningTrend;
  smallAction: string;
  hasRecords: boolean;
};

const comfortableEmotions = new Set(["기쁨", "설렘", "감사", "사랑", "평온", "희망", "뿌듯함", "즐거움"]);
const heavyEmotions = new Set(["슬픔", "불안", "화남", "외로움", "무기력", "두려움", "혼란스러움", "지침"]);

export function buildMindReport(input: {
  period: MindReportPeriod;
  referenceDate: string;
  journals: JournalRecord[];
  screenings: ScreeningResult[];
}): MindReport {
  const boundaries = getPeriodBoundaries(input.period, input.referenceDate);
  const currentJournals = uniqueJournalsByDate(inRange(input.journals, boundaries.current));
  const previousJournals = uniqueJournalsByDate(inRange(input.journals, boundaries.comparison));
  const currentEmotionCounts = countEmotions(currentJournals);
  const previousEmotionCounts = countEmotions(previousJournals);
  const topEmotions = [...currentEmotionCounts.entries()]
    .sort(([emotionA, countA], [emotionB, countB]) => countB - countA || emotionA.localeCompare(emotionB, "ko"))
    .slice(0, 3)
    .map(([emotion, count]) => ({ emotion, count }));

  const rankedDays = currentJournals.map((journal) => ({
    date: journal.date,
    emotions: journal.emotions,
    balance: journal.emotions.reduce((sum, emotion) => (
      sum + (comfortableEmotions.has(emotion) ? 1 : heavyEmotions.has(emotion) ? -1 : 0)
    ), 0)
  }));

  const screeningTrend = buildScreeningTrend(
    inRange(input.screenings, boundaries.current, (item) => item.completedDate),
    inRange(input.screenings, boundaries.comparison, (item) => item.completedDate)
  );

  return {
    period: input.period,
    currentRange: boundaries.current,
    comparisonRange: boundaries.comparison,
    fullPeriodEnd: boundaries.fullPeriodEnd,
    totalPeriodDays: boundaries.totalPeriodDays,
    elapsedDays: daysInclusive(boundaries.current.start, boundaries.current.end),
    recordedDays: currentJournals.length,
    previousRecordedDays: previousJournals.length,
    recordedDayDifference: currentJournals.length - previousJournals.length,
    topEmotions,
    emotionChanges: topEmotions.map(({ emotion, count }) => ({
      emotion,
      count,
      previousCount: previousEmotionCounts.get(emotion) ?? 0,
      difference: count - (previousEmotionCounts.get(emotion) ?? 0)
    })),
    comfortableDays: rankedDays.filter((day) => day.balance > 0).sort(compareComfortableDays).slice(0, 3),
    heavyDays: rankedDays.filter((day) => day.balance < 0).sort(compareHeavyDays).slice(0, 3),
    screeningTrend,
    smallAction: chooseSmallAction(currentJournals, screeningTrend),
    hasRecords: currentJournals.length > 0
  };
}

export function getPeriodBoundaries(period: MindReportPeriod, referenceDate: string) {
  const reference = parseIsoDate(referenceDate);
  if (period === "week") {
    const weekday = reference.getUTCDay() || 7;
    const currentStart = addDays(reference, 1 - weekday);
    const comparisonStart = addDays(currentStart, -7);
    return {
      current: { start: formatIsoDate(currentStart), end: referenceDate },
      comparison: {
        start: formatIsoDate(comparisonStart),
        end: formatIsoDate(addDays(comparisonStart, weekday - 1))
      },
      fullPeriodEnd: formatIsoDate(addDays(currentStart, 6)),
      totalPeriodDays: 7
    };
  }

  const year = reference.getUTCFullYear();
  const month = reference.getUTCMonth();
  const elapsedDayIndex = reference.getUTCDate() - 1;
  const currentStart = new Date(Date.UTC(year, month, 1));
  const comparisonStart = new Date(Date.UTC(year, month - 1, 1));
  const comparisonPeriodEnd = new Date(Date.UTC(year, month, 0));
  const comparisonElapsedEnd = addDays(comparisonStart, elapsedDayIndex);
  return {
    current: { start: formatIsoDate(currentStart), end: referenceDate },
    comparison: {
      start: formatIsoDate(comparisonStart),
      end: formatIsoDate(comparisonElapsedEnd < comparisonPeriodEnd ? comparisonElapsedEnd : comparisonPeriodEnd)
    },
    fullPeriodEnd: formatIsoDate(new Date(Date.UTC(year, month + 1, 0))),
    totalPeriodDays: new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  };
}

function countEmotions(journals: JournalRecord[]) {
  const counts = new Map<string, number>();
  journals.forEach((journal) => journal.emotions.forEach((emotion) => {
    counts.set(emotion, (counts.get(emotion) ?? 0) + 1);
  }));
  return counts;
}

function buildScreeningTrend(current: ScreeningResult[], previous: ScreeningResult[]): ScreeningTrend {
  if (current.some((result) => result.requiresSafetyPrompt)) {
    return { kind: "safety", message: "이번 기간에는 혼자 견디지 않고 도움을 연결하는 것이 가장 중요해요." };
  }
  const currentLatest = latestScreening(current);
  const previousLatest = latestScreening(previous);
  if (currentLatest?.comparisonScore === undefined || previousLatest?.comparisonScore === undefined) {
    return { kind: "unavailable", message: "두 기간의 마음 확인 결과가 모두 있으면 변화를 함께 살펴볼 수 있어요." };
  }
  const difference = currentLatest.comparisonScore - previousLatest.comparisonScore;
  if (difference <= -2) return { kind: "lighter", difference, message: "이전 기간보다 마음이 한결 가벼워진 흐름이에요." };
  if (difference >= 2) return { kind: "heavier", difference, message: "이전 기간보다 마음이 조금 더 무거워진 흐름이에요." };
  return { kind: "similar", difference, message: "이전 기간과 전반적으로 비슷한 흐름이에요." };
}

function latestScreening(screenings: ScreeningResult[]) {
  return [...screenings].sort((a, b) => b.completedDate.localeCompare(a.completedDate))[0];
}

function uniqueJournalsByDate(journals: JournalRecord[]) {
  return [...new Map(journals.map((journal) => [journal.date, journal])).values()];
}

function chooseSmallAction(journals: JournalRecord[], trend: ScreeningTrend) {
  if (trend.kind === "safety") return "오늘 믿을 수 있는 사람 한 명에게 지금 마음을 알려보세요.";
  if (journals.length === 0) return "하루 한 번, 지금 감정을 한 단어로 남겨보세요.";
  const counts = countEmotions(journals);
  const dominant = [...counts.entries()].sort(([emotionA, countA], [emotionB, countB]) => (
    countB - countA || emotionA.localeCompare(emotionB, "ko")
  ))[0]?.[0];
  if (dominant === "지침" || dominant === "무기력") return "오늘 5분만 몸을 쉬게 하고 천천히 스트레칭해보세요.";
  if (dominant === "불안" || dominant === "두려움" || dominant === "혼란스러움") return "마음이 복잡해질 때 숨을 세 번 천천히 내쉬어보세요.";
  if (dominant === "슬픔" || dominant === "외로움") return "이번 기간에는 편하게 연락할 수 있는 사람 한 명에게 안부를 건네보세요.";
  if (dominant === "화남") return "감정이 올라올 때 바로 반응하기 전 한 문장으로 마음을 적어보세요.";
  if (dominant && comfortableEmotions.has(dominant)) return "편안함을 느꼈던 순간 한 가지를 다음 기간에도 다시 만들어보세요.";
  return "다음 기간에도 하루 한 번 마음을 한 단어로 기록해보세요.";
}

function inRange<T>(items: T[], range: ReportDateRange, getDate: (item: T) => string = (item) => (item as JournalRecord).date) {
  return items.filter((item) => {
    const date = getDate(item);
    return date >= range.start && date <= range.end;
  });
}

function compareComfortableDays(a: ReportDay, b: ReportDay) {
  return b.balance - a.balance || b.date.localeCompare(a.date);
}

function compareHeavyDays(a: ReportDay, b: ReportDay) {
  return a.balance - b.balance || b.date.localeCompare(a.date);
}

function daysInclusive(start: string, end: string) {
  return Math.round((parseIsoDate(end).getTime() - parseIsoDate(start).getTime()) / 86400000) + 1;
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(date: Date, days: number) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatIsoDate(date: Date) {
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, "0"))
    .join("-");
}
