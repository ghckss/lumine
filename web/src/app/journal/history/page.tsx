"use client";

import Link from "next/link";
import { useJournalHistory } from "@/shared/hooks/use-journal-history";
import { formatKoreanDate } from "@/shared/lib/date";

const positiveEmotions = new Set(["차분함", "안도감", "기쁨", "즐거움", "행복", "고마움", "편안함", "설렘", "평온함"]);

function getEmotionTone(label: string) {
  return positiveEmotions.has(label)
    ? { textClass: "text-primary", bgClass: "bg-primaryFixed" }
    : { textClass: "text-secondary", bgClass: "bg-secondaryContainer" };
}

export default function JournalHistoryPage() {
  const { data: entries = [] } = useJournalHistory(10);
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
    <div className="min-h-screen bg-background text-onSurface">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-background/80 px-6 pb-1 backdrop-blur-xl">
        <div className="flex items-center">
          <span className="material-symbols-outlined cursor-pointer text-primary transition-opacity duration-300 hover:opacity-70">menu</span>
        </div>
        <h1 className="text-lg font-medium tracking-widest text-primary">기록의 숨결</h1>
        <div className="h-8 w-8 overflow-hidden rounded-full bg-surfaceContainerHigh" />
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-12 px-6 pb-32 pt-24">
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl tracking-wide text-primary">최근 마음의 기록</h2>
          <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-[2rem] bg-surfaceContainerLow">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-primary-fixed)_0%,var(--color-secondary-container)_45%,var(--color-surface-container)_100%)] opacity-80 mix-blend-multiply" />
            <div className="relative z-10 flex flex-col items-center gap-3 rounded-2xl border border-background/50 bg-background/40 p-6 shadow-moon backdrop-blur-md">
              <span className="text-lg tracking-wider text-primaryContainer">주로 머문 감정</span>
              <div className="flex gap-4">
                {recentTopEmotions.map((emotion) => (
                  <span key={emotion} className="rounded-full bg-background/80 px-4 py-1.5 text-sm tracking-widest text-primary shadow-sm">
                    {emotion}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="border-l-2 border-primary/20 pl-2 text-sm leading-loose text-onSurfaceVariant">{trendMessage}</p>
        </section>

        <section className="flex flex-col gap-8">
          {entries.map((entry) => {
            const leadEmotion = entry.emotions[0]?.label ?? "기록";
            const { textClass, bgClass } = getEmotionTone(leadEmotion);
            return (
              <article key={`${entry.date}-${entry.createdAt}`} className="group flex cursor-pointer flex-col gap-5 rounded-[1.5rem] bg-surfaceContainerLowest p-8 transition-all duration-500 hover:shadow-moon">
                <header className="flex items-center justify-between">
                  <time className="text-sm tracking-widest text-onSurfaceVariant/70">{formatKoreanDate(entry.date)}</time>
                  <div className={`rounded-full px-3 py-1 text-xs tracking-wider transition-colors duration-300 ${textClass} ${bgClass}`}>
                    {leadEmotion}
                  </div>
                </header>
                <div className="h-px w-12 bg-primary/10" />
                <p className="line-clamp-2 text-base leading-[1.8] tracking-wide text-onSurface">{entry.body}</p>
              </article>
            );
          })}
        </section>

        <div className="flex justify-end">
          <Link href="/journal" className="rounded-full bg-primary px-6 py-3 text-sm text-white">
            새 기록 남기기
          </Link>
        </div>
      </main>
    </div>
  );
}
