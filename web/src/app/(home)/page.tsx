import type { JournalEntry } from "@/shared/lib/api";
import { getTodayDate } from "@/shared/lib/date";
import { serverApi } from "@/shared/lib/server-api";
import { HomeHeroSection } from "./_component/HomeHeroSection";
import { ReflectionPromptSection } from "./_component/ReflectionPromptSection";
import {
  SevenDayDashboardSection,
  type DashboardDay,
  type TopEmotionItem
} from "./_component/SevenDayDashboardSection";

const restorativeEmotions = new Set(["차분함", "안도감", "기쁨", "즐거움", "행복", "고마움", "편안함", "설렘", "평온함"]);
const heavyEmotions = new Set(["지침", "답답함", "무거움", "불안함", "서운함", "외로움", "분노", "괴로움"]);
const tenseEmotions = new Set(["답답함", "불안함", "분노", "괴로움"]);
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const dynamic = "force-dynamic";

function dateToUtcMs(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function addDays(date: string, days: number) {
  const target = new Date(dateToUtcMs(date) + days * DAY_IN_MS);
  const year = target.getUTCFullYear();
  const month = String(target.getUTCMonth() + 1).padStart(2, "0");
  const day = String(target.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDaysBetween(from: string, to: string) {
  return Math.floor((dateToUtcMs(to) - dateToUtcMs(from)) / DAY_IN_MS);
}

function getDateWindow(today: string, days = 7) {
  return Array.from({ length: days }, (_, index) => addDays(today, index - (days - 1)));
}

function formatShortWeekday(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    weekday: "short",
    timeZone: "Asia/Seoul"
  }).format(new Date(`${date}T12:00:00+09:00`));
}

function formatShortDate(date: string) {
  const [, month, day] = date.split("-");
  return `${Number(month)}.${Number(day)}`;
}

function getTopEmotionItems(emotions: string[], limit = 4): TopEmotionItem[] {
  const firstSeenIndex = new Map<string, number>();
  const counts = emotions.reduce((acc, emotion, index) => {
    if (!firstSeenIndex.has(emotion)) {
      firstSeenIndex.set(emotion, index);
    }
    acc.set(emotion, (acc.get(emotion) ?? 0) + 1);
    return acc;
  }, new Map<string, number>());

  return Array.from(counts.entries())
    .sort((a, b) => {
      const countDiff = b[1] - a[1];
      if (countDiff !== 0) {
        return countDiff;
      }
      return (firstSeenIndex.get(a[0]) ?? 0) - (firstSeenIndex.get(b[0]) ?? 0);
    })
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function getMoodInsight(emotions: string[], activeDays: number) {
  const topEmotions = getTopEmotionItems(emotions, 2);
  const [leadEmotion, secondEmotion] = topEmotions.map((emotion) => emotion.label);
  const heavyCount = emotions.filter((emotion) => heavyEmotions.has(emotion)).length;
  const restorativeCount = emotions.filter((emotion) => restorativeEmotions.has(emotion)).length;
  const hasTenseEmotion = emotions.some((emotion) => tenseEmotions.has(emotion));

  if (!leadEmotion) {
    return "아직 7일 흐름이 비어 있어요. 하루의 마음이 쌓이면 이곳에 변화가 조금씩 드러나요.";
  }

  if (activeDays <= 2) {
    return `${leadEmotion}이 먼저 보이고 있어요. 아직 표본은 적지만, 최근 마음이 어디에 오래 머무는지 조용히 드러나기 시작했어요.`;
  }

  if (hasTenseEmotion) {
    return `${leadEmotion}이 자주 남아 있어요. 긴장이 오래 이어진 흐름이라, 마음이 쉬어갈 작은 틈을 찾고 있는 모습이에요.`;
  }

  if (heavyCount > restorativeCount) {
    return `${leadEmotion}${secondEmotion ? `과 ${secondEmotion}` : ""}이 함께 보여요. 7일 안에 버거운 결이 더 많이 남아 있어서 회복의 속도를 조금 낮춰도 좋아 보여요.`;
  }

  if (restorativeCount > heavyCount) {
    return `${leadEmotion}이 자주 보여요. 요즘의 흐름은 안정감을 붙잡으며 하루를 정리하는 쪽으로 조금씩 기울고 있어요.`;
  }

  return `${leadEmotion}${secondEmotion ? `과 ${secondEmotion}` : ""}이 반복해서 남았어요. 최근 7일은 한쪽으로만 기울기보다 여러 감정이 번갈아 올라온 흐름이에요.`;
}

function buildDashboardDays(
  today: string,
  dateWindow: string[],
  entries: JournalEntry[],
  screeningDates: string[]
): DashboardDay[] {
  const entryByDate = new Map(entries.map((entry) => [entry.date, entry]));
  const screeningDateSet = new Set(screeningDates);

  return dateWindow.map((date) => {
    const entry = entryByDate.get(date);

    return {
      date,
      dayLabel: formatShortWeekday(date),
      dateLabel: formatShortDate(date),
      leadEmotion: entry?.emotions[0]?.label ?? null,
      didScreening: screeningDateSet.has(date),
      isToday: date === today
    };
  });
}

export default async function HomePage() {
  const today = getTodayDate();
  const dateWindow = getDateWindow(today);
  const [journalEntries, screeningHistory] = await Promise.all([
    serverApi.getJournalHistory(30).catch(() => []),
    serverApi.getScreeningHistory().catch(() => [])
  ]);

  const latestScreeningDate = screeningHistory?.[0]?.completedDate ?? null;
  const daysSinceLatestScreening = latestScreeningDate ? getDaysBetween(latestScreeningDate, today) : null;
  const shouldShowReflectionPrompt = daysSinceLatestScreening === null || daysSinceLatestScreening >= 30;
  const screeningDates = screeningHistory?.map((item) => item.completedDate) ?? [];
  const dashboardDays = buildDashboardDays(today, dateWindow, journalEntries, screeningDates);
  const dashboardDateSet = new Set(dateWindow);
  const recentJournalEntries = journalEntries.filter((entry) => dashboardDateSet.has(entry.date));
  const recentEmotionLabels = recentJournalEntries.flatMap((entry) => entry.emotions.map((emotion) => emotion.label));
  const topEmotionItems = getTopEmotionItems(recentEmotionLabels);
  const activeDays = dashboardDays.filter((day) => day.leadEmotion || day.didScreening).length;
  const moodInsight = getMoodInsight(recentEmotionLabels, activeDays);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl flex-col gap-3 px-5 py-4 sm:px-6 sm:py-5">
      <HomeHeroSection />
      {shouldShowReflectionPrompt ? (
        <ReflectionPromptSection daysSinceLatestScreening={daysSinceLatestScreening} />
      ) : null}
      <SevenDayDashboardSection
        activeDays={activeDays}
        dashboardDays={dashboardDays}
        journalEntryCount={recentJournalEntries.length}
        moodInsight={moodInsight}
        topEmotionItems={topEmotionItems}
      />
    </main>
  );
}
