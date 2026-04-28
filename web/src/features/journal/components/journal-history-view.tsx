"use client";

import { SurfaceCard } from "@/shared/components/surface-card";
import { useJournalEntries } from "@/shared/hooks/use-journal-entries";
import { formatKoreanDate } from "@/shared/lib/date";
import type { JournalEntry } from "@/shared/types/domain";

const positiveEmotionSet = new Set(["차분함", "안도감", "기쁨", "즐거움", "행복", "고마움", "편안함", "설렘"]);
const heavyEmotionSet = new Set(["지침", "답답함", "무거움", "불안함", "서운함", "외로움", "분노", "괴로움"]);

export function JournalHistoryView() {
  const { data: entries = [] } = useJournalEntries(10);
  const summary = summarizeTrend(entries);

  return (
    <div className="grid gap-4">
      <SurfaceCard className="overflow-hidden bg-[linear-gradient(135deg,#f4efff_0%,#ffffff_50%,#f9f6ff_100%)]">
        <p className="text-sm font-medium text-accent">최근 10번의 기록</p>
        <h2 className="mt-2 text-2xl font-semibold text-text">{summary.title}</h2>
        <p className="mt-3 text-sm leading-7 text-muted">{summary.description}</p>
        {summary.highlightEmotions.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {summary.highlightEmotions.map((emotion) => (
              <span
                key={emotion}
                className="rounded-full border border-[#ddd2ff] bg-white/84 px-3 py-2 text-xs font-medium text-[#5d4fa0]"
              >
                {emotion}
              </span>
            ))}
          </div>
        ) : null}
      </SurfaceCard>

      {entries.map((entry) => (
        <SurfaceCard key={entry.date}>
          <p className="text-sm text-muted">{formatKoreanDate(entry.date)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {entry.emotions.map((emotion) => (
              <span
                key={`${entry.date}-${emotion.id}`}
                className="rounded-full border border-line bg-white/85 px-3 py-2 text-xs font-medium text-text"
              >
                {emotion.label}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-7 text-text">{entry.body}</p>
        </SurfaceCard>
      ))}
    </div>
  );
}

function summarizeTrend(entries: JournalEntry[]) {
  if (entries.length === 0) {
    return {
      title: "아직 모인 기록이 없어요",
      description: "감정을 몇 번 더 남기면 흐름이 조금씩 보이기 시작해요.",
      highlightEmotions: [] as string[]
    };
  }

  const recentFive = entries.slice(0, 5);
  const previousFive = entries.slice(5, 10);
  const recentScore = scoreEntries(recentFive);
  const previousScore = scoreEntries(previousFive);
  const recentEmotions = getTopEmotions(entries, 3);

  if (previousFive.length < 3) {
    return {
      title: "조금씩 마음의 결이 모이고 있어요",
      description: "기록이 더 쌓이면 어떤 감정이 오래 머무는지 더 또렷하게 볼 수 있어요.",
      highlightEmotions: recentEmotions
    };
  }

  if (recentScore - previousScore >= 2) {
    return {
      title: "최근에는 조금 가벼워지고 있어요",
      description: "무거운 감정보다 숨이 트이는 감정이 조금 더 자주 보였어요.",
      highlightEmotions: recentEmotions
    };
  }

  if (previousScore - recentScore >= 2) {
    return {
      title: "최근에는 무거움이 조금 길어지고 있어요",
      description: "비슷한 감정이 자주 겹치고 있어요. 너무 오래 혼자 두지 않아도 괜찮아요.",
      highlightEmotions: recentEmotions
    };
  }

  return {
    title: "최근 흐름은 큰 변화 없이 이어지고 있어요",
    description: "가벼운 날과 무거운 날이 함께 있었어요. 지금 결을 계속 지켜봐도 괜찮아요.",
    highlightEmotions: recentEmotions
  };
}

function scoreEntries(entries: JournalEntry[]) {
  return entries.reduce((total, entry) => total + scoreEmotions(entry), 0);
}

function scoreEmotions(entry: JournalEntry) {
  return entry.emotions.reduce((score, emotion) => {
    if (positiveEmotionSet.has(emotion.label)) {
      return score + 1;
    }

    if (heavyEmotionSet.has(emotion.label)) {
      return score - 1;
    }

    return score;
  }, 0);
}

function getTopEmotions(entries: JournalEntry[], count: number) {
  const frequency = new Map<string, number>();

  entries.forEach((entry) => {
    entry.emotions.forEach((emotion) => {
      frequency.set(emotion.label, (frequency.get(emotion.label) ?? 0) + 1);
    });
  });

  return Array.from(frequency.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, count)
    .map(([emotion]) => emotion);
}
