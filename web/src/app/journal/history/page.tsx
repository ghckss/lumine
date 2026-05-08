import { serverApi } from "@/shared/lib/server-api";
import { JournalHistoryActions } from "./_component/JournalHistoryActions";
import { JournalHistoryListSection } from "./_component/JournalHistoryListSection";
import { JournalHistorySummarySection } from "./_component/JournalHistorySummarySection";

const positiveEmotions = new Set(["차분함", "안도감", "기쁨", "즐거움", "행복", "고마움", "편안함", "설렘", "평온함"]);

export const dynamic = "force-dynamic";

export default async function JournalHistoryPage() {
  const entries = await serverApi.getJournalHistory(10).catch(() => []);
  const allEmotionLabels = entries.flatMap((entry) => entry.emotions.map((emotion) => emotion.label));
  const recentTopEmotions = Array.from(
    allEmotionLabels.reduce((acc, label) => acc.set(label, (acc.get(label) ?? 0) + 1), new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([label]) => label);

  const scoreWindow = entries.slice(0, 10).map((entry) =>
    entry.emotions.reduce((score, emotion) => score + (positiveEmotions.has(emotion.label) ? 1 : -1), 0)
  );
  const recentAverage = scoreWindow.slice(0, 5).reduce((sum, score) => sum + score, 0) / Math.max(scoreWindow.slice(0, 5).length, 1);
  const previousAverage = scoreWindow.slice(5, 10).reduce((sum, score) => sum + score, 0) / Math.max(scoreWindow.slice(5, 10).length, 1);
  const trendMessage =
    recentAverage > previousAverage + 0.25
      ? "최근에는 조금 가벼워지고 있어요."
      : recentAverage < previousAverage - 0.25
        ? "무거운 마음이 조금 길어지고 있어요."
        : "큰 변화 없이 비슷한 흐름이 이어지고 있어요.";

  return (
    <div className="min-h-screen text-onSurface">
      <main className="mx-auto flex w-full max-w-xl flex-col gap-12 px-6 pb-32 pt-8">
        <JournalHistorySummarySection
          isFetching={false}
          recentTopEmotions={recentTopEmotions}
          trendMessage={trendMessage}
        />
        <JournalHistoryListSection entries={entries} />
        <JournalHistoryActions />
      </main>
    </div>
  );
}
