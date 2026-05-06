"use client";

import { useRef } from "react";

const emotionToneByLabel: Record<string, { background: string; border: string; text: string }> = {
  기쁨: { background: "#FFF9E5", border: "#F3D673", text: "#7A5B10" },
  즐거움: { background: "#FFF1E0", border: "#EBB37D", text: "#8A541E" },
  행복: { background: "#FFE8E8", border: "#F2A7A7", text: "#943D3D" },
  설렘: { background: "#FFF0F6", border: "#F7B5D1", text: "#8A3B5D" },
  고마움: { background: "#F3F0FF", border: "#C5BAF2", text: "#51437D" },
  차분함: { background: "#E6F4F1", border: "#A8D1C9", text: "#2D5A52" },
  평온함: { background: "#EBF7F2", border: "#B5D9C8", text: "#335F53" },
  편안함: { background: "#F0F9F4", border: "#C2DED1", text: "#315F4C" },
  안도감: { background: "#EDF5FD", border: "#B9D1E8", text: "#345A7B" },
  지침: { background: "#F0EFED", border: "#C9C5C1", text: "#5F5148" },
  답답함: { background: "#E8E8F3", border: "#BCBCD6", text: "#4D4E68" },
  무거움: { background: "#EFEDF5", border: "#C4BDD6", text: "#504760" },
  괴로움: { background: "#ECEAF0", border: "#BFB9C9", text: "#504B60" },
  외로움: { background: "#F0F4F8", border: "#BDC9D6", text: "#3E5D73" },
  불안함: { background: "#F7ECE6", border: "#D9B8A9", text: "#704331" },
  서운함: { background: "#F3EBF5", border: "#D1B9D6", text: "#654C70" },
  분노: { background: "#FDECEC", border: "#E9B7B0", text: "#8F3A30" }
};

export type DashboardDay = {
  date: string;
  dayLabel: string;
  dateLabel: string;
  leadEmotion: string | null;
  didScreening: boolean;
  isToday: boolean;
};

export type TopEmotionItem = {
  label: string;
  count: number;
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

export function SevenDayDashboardSection({
  activeDays,
  dashboardDays,
  journalEntryCount,
  moodInsight,
  topEmotionItems
}: {
  activeDays: number;
  dashboardDays: DashboardDay[];
  journalEntryCount: number;
  moodInsight: string;
  topEmotionItems: TopEmotionItem[];
}) {
  const dashboardScrollRef = useRef<HTMLDivElement | null>(null);
  const dashboardDragRef = useRef({ active: false, startX: 0, scrollLeft: 0 });

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

  return (
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
              <strong className="mt-2 block text-2xl text-onSurface">{journalEntryCount}</strong>
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
                const emotionTone = getEmotionTone(day.leadEmotion);
                const hasJournal = Boolean(day.leadEmotion);
                const hasActivity = Boolean(day.leadEmotion || day.didScreening);

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
                      aria-label={`${day.dateLabel} ${day.leadEmotion ? `대표 감정 ${day.leadEmotion}` : hasActivity ? "기록 있음" : "기록 없음"}`}
                      title={day.leadEmotion ? `${day.dateLabel} 대표 감정: ${day.leadEmotion}` : `${day.dateLabel} 기록 없음`}
                    >
                      {hasJournal ? <span className="text-[0.62rem] font-bold leading-none tracking-[-0.08em]">{getEmotionMarkLabel(day.leadEmotion)}</span> : null}
                      {day.didScreening ? <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                    </div>
                    <span className="whitespace-nowrap text-[0.64rem] text-onSurfaceVariant/60">{day.dateLabel}</span>
                    <span className="min-h-3 max-w-[3.25rem] truncate whitespace-nowrap text-[0.6rem] leading-none text-onSurfaceVariant/70">
                      {day.leadEmotion ?? ""}
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
  );
}
