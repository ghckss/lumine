"use client";

import Link from "next/link";
import type { JournalEntry } from "@/shared/lib/api";
import { useJournalEntry } from "@/shared/hooks/useJournalEntry";
import { useJournalHistory } from "@/shared/hooks/useJournalHistory";
import { useScreeningHistory } from "@/shared/hooks/useScreeningHistory";
import { getTodayDate } from "@/shared/lib/date";
import { useEffect, useRef, useState } from "react";

const restorativeEmotions = new Set(["차분함", "안도감", "기쁨", "즐거움", "행복", "고마움", "편안함", "설렘", "평온함"]);
const heavyEmotions = new Set(["지침", "답답함", "무거움", "불안함", "서운함", "외로움", "분노", "괴로움"]);
const tenseEmotions = new Set(["답답함", "불안함", "분노", "괴로움"]);
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const emotionToneByLabel: Record<string, { background: string; border: string; text: string }> = {
  // --- 긍정적인 감정 (Warm Lights) ---
  기쁨: { background: "#FFF9E5", border: "#F3D673", text: "#7A5B10" },
  즐거움: { background: "#FFF1E0", border: "#EBB37D", text: "#8A541E" },
  행복: { background: "#FFE8E8", border: "#F2A7A7", text: "#943D3D" },
  설렘: { background: "#FFF0F6", border: "#F7B5D1", text: "#8A3B5D" },
  고마움: { background: "#F3F0FF", border: "#C5BAF2", text: "#51437D" },

  // --- 평온한 감정 (Calm Waters) ---
  차분함: { background: "#E6F4F1", border: "#A8D1C9", text: "#2D5A52" },
  평온함: { background: "#EBF7F2", border: "#B5D9C8", text: "#335F53" },
  편안함: { background: "#F0F9F4", border: "#C2DED1", text: "#315F4C" },
  안도감: { background: "#EDF5FD", border: "#B9D1E8", text: "#345A7B" },

  // --- 무겁고 침잠된 감정 (Deep Shadows) ---
  지침: { background: "#F0EFED", border: "#C9C5C1", text: "#5F5148" },
  답답함: { background: "#E8E8F3", border: "#BCBCD6", text: "#4D4E68" },
  무거움: { background: "#EFEDF5", border: "#C4BDD6", text: "#504760" },
  괴로움: { background: "#ECEAF0", border: "#BFB9C9", text: "#504B60" },
  외로움: { background: "#F0F4F8", border: "#BDC9D6", text: "#3E5D73" },

  // --- 강렬하거나 불안한 감정 (Inner Waves) ---
  불안함: { background: "#F7ECE6", border: "#D9B8A9", text: "#704331" },
  서운함: { background: "#F3EBF5", border: "#D1B9D6", text: "#654C70" },
  분노: { background: "#FDECEC", border: "#E9B7B0", text: "#8F3A30" },
};

function SurfaceCard({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`rounded-[28px] bg-surfaceContainerLowest px-5 py-5 shadow-ambient ${className}`}>{children}</section>;
}

type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
};

type DashboardDay = {
  date: string;
  dayLabel: string;
  dateLabel: string;
  entry?: JournalEntry;
  didScreening: boolean;
  isToday: boolean;
};

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

function mergeJournalEntries(todayEntry: JournalEntry | null | undefined, history: JournalEntry[] | undefined) {
  const entriesByDate = new Map<string, JournalEntry>();

  history?.forEach((entry) => {
    entriesByDate.set(entry.date, entry);
  });

  if (todayEntry) {
    entriesByDate.set(todayEntry.date, todayEntry);
  }

  return Array.from(entriesByDate.values()).sort((a, b) => b.date.localeCompare(a.date));
}

function getTopEmotionItems(emotions: string[], limit = 4) {
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

function getLeadEmotion(entry: JournalEntry | undefined) {
  return entry?.emotions[0]?.label ?? null;
}

function getEmotionTone(emotion: string | null) {
  if (!emotion) {
    return { background: "var(--color-surface-container)", border: "var(--color-outline-variant)", text: "var(--color-on-surface-variant)" };
  }

  return emotionToneByLabel[emotion] ?? { background: "var(--color-tertiary-container)", border: "var(--color-tertiary)", text: "var(--color-on-tertiary-container)" };
}

function getEmotionMarkLabel(emotion: string | null) {
  if (!emotion) {
    return "";
  }

  return emotion.length > 3 ? emotion.slice(0, 2) : emotion;
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
  entries: JournalEntry[],
  screeningDates: string[]
): DashboardDay[] {
  const entryByDate = new Map(entries.map((entry) => [entry.date, entry]));
  const screeningDateSet = new Set(screeningDates);

  return getDateWindow(today).map((date) => ({
    date,
    dayLabel: formatShortWeekday(date),
    dateLabel: formatShortDate(date),
    entry: entryByDate.get(date),
    didScreening: screeningDateSet.has(date),
    isToday: date === today
  }));
}

export default function HomePage() {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const dashboardScrollRef = useRef<HTMLDivElement | null>(null);
  const dashboardDragRef = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const rippleIdRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  const [ripples, setRipples] = useState<Ripple[]>([]);

  const today = getTodayDate();
  const { data: todayJournalEntry } = useJournalEntry(today);
  const { data: journalHistory } = useJournalHistory(30);
  const { data: screeningHistory } = useScreeningHistory();

  const journalEntries = mergeJournalEntries(todayJournalEntry, journalHistory);
  const latestScreeningDate = screeningHistory?.[0]?.completedDate ?? null;
  const daysSinceLatestScreening = latestScreeningDate ? getDaysBetween(latestScreeningDate, today) : null;
  const shouldShowReflectionPrompt = daysSinceLatestScreening === null || daysSinceLatestScreening >= 30;
  const screeningDates = screeningHistory?.map((item) => item.completedDate) ?? [];
  const dashboardDays = buildDashboardDays(today, journalEntries, screeningDates);
  const recentEntries = dashboardDays.flatMap((day) => (day.entry ? [day.entry] : []));
  const recentEmotionLabels = recentEntries.flatMap((entry) => entry.emotions.map((emotion) => emotion.label));
  const topEmotionItems = getTopEmotionItems(recentEmotionLabels);
  const activeDays = dashboardDays.filter((day) => day.entry || day.didScreening).length;
  const moodInsight = getMoodInsight(recentEmotionLabels, activeDays);

  function handleDashboardScrollPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const area = dashboardScrollRef.current;
    if (!area || area.scrollWidth <= area.clientWidth) {
      return;
    }

    dashboardDragRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: area.scrollLeft
    };
    area.setPointerCapture(event.pointerId);
  }

  function handleDashboardScrollPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const area = dashboardScrollRef.current;
    const drag = dashboardDragRef.current;
    if (!area || !drag.active) {
      return;
    }

    area.scrollLeft = drag.scrollLeft - (event.clientX - drag.startX);
  }

  function handleDashboardScrollPointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    const area = dashboardScrollRef.current;
    dashboardDragRef.current.active = false;

    if (area?.hasPointerCapture(event.pointerId)) {
      area.releasePointerCapture(event.pointerId);
    }
  }

  useEffect(() => {
    const createRippleGroup = () => {
      const area = areaRef.current;
      if (!area) return;

      const { width, height } = area.getBoundingClientRect();

      const x = Math.random() * width;
      const y = Math.random() * height;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(width - x, y),
        Math.hypot(x, height - y),
        Math.hypot(width - x, height - y),
      );

      const size = maxDistance * 2;
      const count = Math.random() > 0.5 ? 2 : 1;

      const nextRipples: Ripple[] = Array.from({ length: count }, (_, index) => ({
        id: rippleIdRef.current++,
        x,
        y,
        size,
        delay: index * 0.2,
      }));

      setRipples((prev) => [...prev, ...nextRipples]);

      // 애니메이션이 끝난 ripple 제거
      window.setTimeout(() => {
        setRipples((prev) =>
          prev.filter((ripple) => !nextRipples.some((next) => next.id === ripple.id)),
        );
      }, 5400);

      // 다음 랜덤 좌표 실행 간격
      const nextDelay = 5000 + Math.random() * 1800;
      timeoutRef.current = window.setTimeout(createRippleGroup, nextDelay);
    };

    createRippleGroup();

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl flex-col gap-3 px-5 py-4 sm:px-6 sm:py-5">
      <header ref={areaRef} className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary)_88%,black),color-mix(in_srgb,var(--color-primary)_62%,var(--color-on-primary-container))_100%)] px-5 py-5 text-white shadow-moon sm:px-6 sm:py-6">
        <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0))]" />
        <div className="absolute right-[-30px] top-[-34px] h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22),rgba(255,255,255,0.02)_68%)]" />
        <div className="absolute bottom-[-46px] left-[-22px] h-20 w-48 rounded-t-[999px] bg-white/5 blur-2xl" />

        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full border-[5px] order-primaryFixed/70 bg-primaryFixed/20 bg-transparent"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              animation: `ripple 5s linear ${ripple.delay}s both`,
              transform: "translate(-50%, -50%) scale(0)",

            }}
          />
        ))}

        <div className="relative z-10 mt-3 max-w-[31rem]">
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/60">Lumis Eterne</p>
          <h1 className="mt-2 text-[1.48rem] leading-[1.35] text-white sm:text-[1.6rem]">
            오늘 당신의 마음의 수면에
            <br />
            어떤 아름다운 빛이 머무르고 있나요?
          </h1>
          <p className="mt-3 text-[0.82rem] leading-6 text-white/78">
            오늘 당신의 하루를 닮은,<br />
            가장 솔직한 조각들을 가만히 들여보세요.
          </p>
        </div>
      </header>

      {shouldShowReflectionPrompt ? (
        <Link href="/screening/start" className="block">
          <SurfaceCard className="relative overflow-hidden rounded-[24px] border border-primary/15 bg-[linear-gradient(135deg,var(--color-primary)_0%,color-mix(in_srgb,var(--color-primary)_72%,var(--color-on-primary-container))_100%)] px-5 py-4 text-white shadow-moon transition-transform hover:-translate-y-0.5">
            <div className="absolute right-[-34px] top-[-48px] h-28 w-28 rounded-full bg-white/15 blur-xl" />
            <div className="relative z-10">
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-white/60">reflection</p>
              <h2 className="mt-2 text-[1.25rem] leading-[1.28] text-white">
                {daysSinceLatestScreening === null
                  ? "지금의 나를 처음 둘러볼 시간이에요"
                  : "최근 나를 둘러본 지 30일이 지났어요"}
              </h2>
              <p className="mt-2 text-[0.82rem] leading-6 text-white/80">
                {daysSinceLatestScreening === null
                  ? "지금의 기준점을 남겨두면, 다음 변화가 어디서 시작됐는지 더 선명하게 볼 수 있어요."
                  : "그 사이 나에게 어떤 변화가 있었을지 다시 한번 확인해봐요."}
              </p>
              <div className="mt-4 flex justify-end">
                <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-primary">나를 돌아보기</span>
              </div>
            </div>
          </SurfaceCard>
        </Link>
      ) : null}

      <section className="grid gap-4 pb-8">
        <SurfaceCard className="overflow-hidden border border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.94)_0%,color-mix(in_srgb,var(--color-secondary-container)_48%,white)_100%)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.22em] text-secondary/70">last 7 days</p>
              <h2 className="mt-2 text-[1.65rem] leading-[1.25] text-onSurface">최근 7일 마음 대시보드</h2>
            </div>
            <div className="shrink-0 whitespace-nowrap rounded-full bg-primaryFixed px-4 py-2 text-xs font-semibold text-primary">
              {activeDays}/7일 기록
            </div>
          </div>

          <div className="-mx-1 mt-5 overflow-x-auto px-1 pb-1">
            <div className="grid min-w-[17rem] grid-cols-2 gap-2">
              <div className="rounded-3xl bg-surfaceContainerLowest/90 px-4 py-4 shadow-sm">
                <p className="text-[0.68rem] uppercase tracking-[0.16em] text-onSurfaceVariant/70">journal</p>
                <strong className="mt-2 block text-2xl text-onSurface">{recentEntries.length}</strong>
                <span className="whitespace-nowrap text-xs text-onSurfaceVariant">감정 기록</span>
              </div>
              <div className="rounded-3xl bg-surfaceContainerLowest/90 px-4 py-4 shadow-sm">
                <p className="text-[0.68rem] uppercase tracking-[0.16em] text-onSurfaceVariant/70">flow</p>
                <strong className="mt-2 block truncate text-2xl text-onSurface">{topEmotionItems[0]?.label ?? "-"}</strong>
                <span className="whitespace-nowrap text-xs text-onSurfaceVariant">자주 머문 감정</span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-outlineVariant/60 bg-surfaceContainerLowest/75 p-4">
            <div
              ref={dashboardScrollRef}
              className="horizontal-scroll -mx-1 cursor-grab select-none px-1 pb-1 active:cursor-grabbing"
              onPointerDown={handleDashboardScrollPointerDown}
              onPointerMove={handleDashboardScrollPointerMove}
              onPointerUp={handleDashboardScrollPointerEnd}
              onPointerCancel={handleDashboardScrollPointerEnd}
              onPointerLeave={handleDashboardScrollPointerEnd}
            >
              <div className="grid min-w-[28rem] grid-cols-7 gap-2">
                {dashboardDays.map((day) => {
                  const leadEmotion = getLeadEmotion(day.entry);
                  const emotionTone = getEmotionTone(leadEmotion);
                  const hasJournal = Boolean(leadEmotion);
                  const hasActivity = Boolean(day.entry || day.didScreening);

                  return (
                    <div key={day.date} className="flex min-w-[3.25rem] flex-col items-center gap-2">
                      <span className={`whitespace-nowrap text-[0.68rem] ${day.isToday ? "font-bold text-primary" : "text-onSurfaceVariant/70"}`}>
                        {day.dayLabel}
                      </span>
                      <div
                        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors ${hasJournal
                          ? "shadow-sm"
                          : "border-outlineVariant/60 bg-surfaceContainer"
                          }`}
                        style={hasJournal ? {
                          backgroundColor: emotionTone.background,
                          borderColor: emotionTone.border,
                          color: emotionTone.text
                        } : undefined}
                        aria-label={`${day.dateLabel} ${leadEmotion ? `대표 감정 ${leadEmotion}` : hasActivity ? "기록 있음" : "기록 없음"}`}
                        title={leadEmotion ? `${day.dateLabel} 대표 감정: ${leadEmotion}` : `${day.dateLabel} 기록 없음`}
                      >
                        {hasJournal ? <span className="text-[0.62rem] font-bold leading-none tracking-[-0.08em]">{getEmotionMarkLabel(leadEmotion)}</span> : null}
                        {day.didScreening ? <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                      </div>
                      <span className="whitespace-nowrap text-[0.64rem] text-onSurfaceVariant/60">{day.dateLabel}</span>
                      <span className="min-h-3 max-w-[3.25rem] truncate whitespace-nowrap text-[0.6rem] leading-none text-onSurfaceVariant/70">
                        {leadEmotion ?? ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] bg-[linear-gradient(135deg,var(--color-surface-container-lowest)_0%,rgba(255,255,255,0.62)_100%)] p-4">
            <h3 className="text-lg leading-snug text-onSurface">7일 동안 이런 흐름이 보여요</h3>
            <p className="mt-2 text-sm leading-7 text-onSurfaceVariant">{moodInsight}</p>
            {topEmotionItems.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {topEmotionItems.map((emotion, index) => (
                  <span
                    key={emotion.label}
                    className={`rounded-full px-3 py-2 text-xs font-semibold ${index === 0
                      ? "bg-primary text-white"
                      : index === 1
                        ? "bg-primaryFixed text-primary"
                        : "bg-surfaceContainer text-onSurfaceVariant"
                      }`}
                  >
                    {emotion.label} {emotion.count}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

        </SurfaceCard>
      </section>
    </main>
  );
}
